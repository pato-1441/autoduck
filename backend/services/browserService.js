const { chromium } = require("playwright");

class BrowserManager {
  constructor() {
    this.activeBrowsers = new Map();
  }

  async createBrowser(socketId) {
    const browser = await chromium.launch();
    const context = await browser.newContext({
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

    this.activeBrowsers.set(socketId, { browser, context, page });
    return { browser, context, page };
  }

  async closeBrowser(socketId) {
    const browserContext = this.activeBrowsers.get(socketId);
    if (browserContext) {
      await browserContext.browser.close();
      this.activeBrowsers.delete(socketId);
      return true;
    }
    return false;
  }

  getBrowser(socketId) {
    return this.activeBrowsers.get(socketId);
  }

  getActiveBrowsers() {
    return Array.from(this.activeBrowsers.keys());
  }
}

module.exports = new BrowserManager();
