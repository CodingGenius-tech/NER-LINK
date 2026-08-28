const express = require("express");

const {
  checkDatabaseHealth,
} = require("../controllers/health.controller");

const router = express.Router();

// Basic server health
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NER-LINK server is running",
    timestamp: new Date().toISOString(),
  });
});

// Database + PostGIS health
router.get("/db", checkDatabaseHealth);

module.exports = router;