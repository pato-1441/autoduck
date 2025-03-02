const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

function checkPlaywrightBrowsers() {
  console.log("Checking for Playwright browsers...");

  const playwrightPath = path.join(
    process.env.HOME || process.env.USERPROFILE,
    ".cache",
    "ms-playwright"
  );

  const chromiumExists = fs.existsSync(path.join(playwrightPath, "chromium-"));

  if (chromiumExists) {
    console.log("Playwright browsers are already installed.");
    startServer();
  } else {
    console.log("Installing Playwright browsers...");
    exec("npx playwright install chromium", (error, stdout, stderr) => {
      if (error) {
        console.error("Error installing Playwright browsers:", error);
        process.exit(1);
      }
      console.log(stdout);
      console.log("Playwright browsers installed successfully.");
      startServer();
    });
  }
}

function startServer() {
  console.log("Starting server...");
  require("../server.js");
}

checkPlaywrightBrowsers();
