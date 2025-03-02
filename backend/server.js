const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { chromium } = require("playwright");
const { OpenAI } = require("openai");
const { PLAYWRIGHT_PROMPT } = require("./prompts");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const activeBrowsers = new Map();

app.get("/debug/connections", (req, res) => {
  res.json({
    connections: io.engine.clientsCount,
    activeBrowsers: Array.from(activeBrowsers.keys()),
  });
});

io.on("connection", async (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("run-tests", async (data) => {
    const { apiKey, targetUrl, steps } = data;

    try {
      const openai = new OpenAI({
        apiKey: apiKey,
      });

      const browser = await chromium.launch();
      const context = await browser.newContext({
        recordVideo: { dir: "videos/" },
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();

      await page.addInitScript(() => {
        window._testHelpers = {
          lastActionResult: null,
          lastError: null,
        };
      });

      activeBrowsers.set(socket.id, { browser, context, page });

      socket.emit("browser-update", {
        status: "navigating",
        message: `Navigating to ${targetUrl}`,
      });

      await page.goto(targetUrl);

      const screenshot = await page.screenshot({ type: "png" });
      socket.emit("browser-update", {
        status: "ready",
        screenshot: screenshot.toString("base64"),
      });

      console.log("browser-update", {
        status: "ready",
        screenshot: screenshot.toString("base64"),
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

        console.log(`Emitting browser-update for step ${i + 1}`, {
          status: "running",
          stepIndex: i,
        });

        try {
          const pageContent = await page.content();
          const htmlSummary =
            pageContent.substring(0, 5000) +
            (pageContent.length > 5000 ? "..." : "");

          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: PLAYWRIGHT_PROMPT,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Current step to execute: "${step}"                    
                    Current HTML structure summary (for context):
                    ${htmlSummary}`,
                  },
                ],
              },
            ],
            max_tokens: 500,
            temperature: 0.2,
          });

          const code = response.choices[0].message.content.trim();

          console.log(`Generated code for step ${i + 1}:`, code);

          const executeStep = new Function(
            "page",
            `
            return (async () => {
              try {
                await ${code};
                return { success: true };
              } catch (error) {
                console.error("Step execution error:", error.message);
                return { 
                  success: false, 
                  error: error.message,
                  name: error.name 
                };
              }
            })();
          `
          );

          const result = await executeStep(page);

          if (!result.success) {
            throw new Error(result.error || "Unknown execution error");
          }

          // screenshots in each step
          const stepScreenshot = await page.screenshot({ type: "png" });

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
          console.log(`Emitting step-update for successful step ${i + 1}`, {
            index: i,
            status: "success",
          });
        } catch (error) {
          console.error(`Error executing step ${i + 1}:`, error);

          allPassed = false;
          stepResults.push({
            passed: false,
            duration: Date.now() - stepStartTime,
            error: error.message,
            screenshot: (await page.screenshot({ type: "png" })).toString(
              "base64"
            ),
            code: error.code || "Error executing code",
          });

          socket.emit("browser-update", {
            status: "step-failed",
            screenshot: (await page.screenshot({ type: "png" })).toString(
              "base64"
            ),
            stepIndex: i,
            error: error.message,
          });

          socket.emit("step-update", {
            index: i,
            status: error ? "error" : "running",
            error: error ? error.message : null,
          });
          console.log(`Emitting step-update for failed step ${i + 1}`, {
            index: i,
            status: "error",
            error: error.message,
          });
        }
      }

      console.log("Emitting test-complete with results:", {
        passed: allPassed,
        stepResults: stepResults.map((s) => ({
          passed: s.passed,
          error: s.error || null,
        })),
      });

      socket.emit("test-complete", {
        passed: allPassed,
        duration: Date.now() - startTime,
        stepResults,
      });

      await browser.close();
      activeBrowsers.delete(socket.id);
    } catch (error) {
      console.error("Error running tests:", error);
      socket.emit("test-error", { message: error.message });

      const browserContext = activeBrowsers.get(socket.id);
      if (browserContext) {
        await browserContext.browser.close();
        activeBrowsers.delete(socket.id);
      }
    }
  });

  socket.on("stop-test", async () => {
    console.log("Received stop-test request from client");

    const browserContext = activeBrowsers.get(socket.id);
    if (browserContext) {
      console.log("Closing browser for stopped test");
      await browserContext.browser.close();
      activeBrowsers.delete(socket.id);
      socket.emit("test-error", { message: "Test stopped by user" });
    } else {
      console.log("No active browser found to stop");
    }
  });

  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);

    const browserContext = activeBrowsers.get(socket.id);
    if (browserContext) {
      await browserContext.browser.close();
      activeBrowsers.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
