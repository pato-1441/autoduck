const fs = require("fs");
const path = require("path");

const ensureDirectories = () => {
  ["videos", "screenshots"].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

const executeStep = async (page, code) => {
  const executeFunc = new Function(
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

  return await executeFunc(page)();
};

const takeScreenshot = async (page, filename = null) => {
  const options = { type: "png" };
  if (filename) {
    options.path = path.join("screenshots", filename);
  }

  const buffer = await page.screenshot(options);
  return buffer.toString("base64");
};

module.exports = {
  ensureDirectories,
  executeStep,
  takeScreenshot,
};
