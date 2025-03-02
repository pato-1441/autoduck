const express = require("express");
const router = express.Router();
const browserManager = require("../services/browserService");

router.get("/debug/connections", (req, res) => {
  res.json({
    connections: req.io.engine.clientsCount,
    activeBrowsers: browserManager.getActiveBrowsers(),
  });
});

module.exports = router;
