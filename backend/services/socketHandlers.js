const browserManager = require("./browserService");
const aiService = require("./aiService");

const setupSocketHandlers = (io) => {
  io.on("connection", async (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("run-tests", async (data) => {
      if (!data.steps || data.steps.length === 0) {
        return socket.emit("test-error", { message: "No steps provided" });
      }

      const { apiKey, targetUrl, steps } = data;

      try {
        const { page } = await browserManager.createBrowser(socket.id);

        socket.emit("browser-update", {
          status: "navigating",
          message: `Navigating to ${targetUrl}`,
        });
        await page.goto(targetUrl);

        // initial screenshot
        const initialScreenshot = await page.screenshot({ type: "png" });
        socket.emit("browser-update", {
          status: "ready",
          screenshot: initialScreenshot.toString("base64"),
        });

        const stepResults = [];
        let allPassed = true;
        const startTime = Date.now();

        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          const stepStartTime = Date.now();

          socket.emit("browser-update", {
            status: "running",
            message: `Running step ${i + 1}: ${step}`,
            stepIndex: i,
          });

          try {
            const pageContent = await page.content();
            const htmlSummary =
              pageContent.substring(0, 5000) +
              (pageContent.length > 5000 ? "..." : "");

            const code = await aiService.generatePlaywrightCode(
              apiKey,
              step,
              htmlSummary
            );

            if (!result.success) {
              throw new Error(result.error || "Step execution failed");
            }

            // step screenshot
            const stepScreenshot = await page.screenshot({
              type: "png",
              path: `screenshots/${i}.png`,
            });

            stepResults.push({
              passed: true,
              duration: Date.now() - stepStartTime,
              screenshot: stepScreenshot.toString("base64"),
              code,
            });

            socket.emit("browser-update", {
              status: "step-complete",
              screenshot: stepScreenshot.toString("base64"),
              stepIndex: i,
            });

            socket.emit("step-update", {
              index: i,
              status: "success",
              error: null,
            });
          } catch (error) {
            allPassed = false;
            const errorScreenshot = await page.screenshot({ type: "png" });
            const errorMessage = error.message || error.toString();

            stepResults.push({
              passed: false,
              duration: Date.now() - stepStartTime,
              error: errorMessage,
              screenshot: errorScreenshot.toString("base64"),
              code: error.code || "N/A",
            });

            socket.emit("browser-update", {
              status: "step-failed",
              screenshot: errorScreenshot.toString("base64"),
              stepIndex: i,
              error: errorMessage,
            });

            socket.emit("step-update", {
              index: i,
              status: "error",
              error: errorMessage,
            });
          }
        }

        socket.emit("test-complete", {
          passed: allPassed,
          duration: Date.now() - startTime,
          stepResults,
        });

        await browserManager.closeBrowser(socket.id);
      } catch (error) {
        console.error("Global error:", error);
        socket.emit("test-error", { message: error.message });

        await browserManager.closeBrowser(socket.id);
      }
    });

    socket.on("stop-test", async () => {
      const closed = await browserManager.closeBrowser(socket.id);
      if (closed) {
        socket.emit("test-error", { message: "Test stopped by user" });
      }
    });

    socket.on("disconnect", async () => {
      await browserManager.closeBrowser(socket.id);
    });
  });

  return io;
};

module.exports = setupSocketHandlers;
