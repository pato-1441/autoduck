const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { chromium } = require("playwright");
const { OpenAI } = require("openai");
const { PLAYWRIGHT_PROMPT } = require("./prompts");
const fs = require("fs");

// videos & screenshots directories
["videos", "screenshots"].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

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
    if (!data.steps || data.steps.length === 0) {
      return socket.emit("test-error", { message: "No steps provided" });
    }

    const { apiKey, targetUrl, steps } = data;

    try {
      const openai = new OpenAI({ apiKey });
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

          let response;
          try {
            response = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                { role: "system", content: PLAYWRIGHT_PROMPT },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `Current step: "${step}"\nHTML Summary:\n${htmlSummary}`,
                    },
                  ],
                },
              ],
              max_tokens: 500,
              temperature: 0.2,
            });
          } catch (error) {
            throw new Error(`OpenAI API Error: ${error.message}`);
          }

          const code = response.choices[0].message.content.trim();

          const executeStep = new Function(
            "page",
            `
            return async () => {
              try {
                ${code}
                return { success: true };
              } catch (error) {
                return { 
                  success: false, 
                  error: error.message 
                };
              }
            };
          `
          );

          const result = await executeStep(page)();

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

      await browser.close();
      activeBrowsers.delete(socket.id);
    } catch (error) {
      console.error("Global error:", error);
      socket.emit("test-error", { message: error.message });

      const browserContext = activeBrowsers.get(socket.id);
      if (browserContext) {
        await browserContext.browser.close();
        activeBrowsers.delete(socket.id);
      }
    }
  });

  socket.on("stop-test", async () => {
    const browserContext = activeBrowsers.get(socket.id);
    if (browserContext) {
      await browserContext.browser.close();
      activeBrowsers.delete(socket.id);
      socket.emit("test-error", { message: "Test stopped by user" });
    }
  });

  socket.on("disconnect", async () => {
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
