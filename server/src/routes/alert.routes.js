const express = require("express");

const {
  getAlerts,
  getAlert,
  createAlertReport,
  resolveAlertReport,
} = require("../controllers/alert.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const router = express.Router();

// ========================================
// GET ALL ALERTS
// GET /api/alerts
// ========================================

router.get("/", authenticateToken, getAlerts);

// ========================================
// GET ALERT BY ID
// GET /api/alerts/:id
// ========================================

router.get("/:id", authenticateToken, getAlert);

// ========================================
// CREATE ALERT
// POST /api/alerts
// ========================================

router.post("/", authenticateToken, createAlertReport);

// ========================================
// RESOLVE ALERT
// PATCH /api/alerts/:id/resolve
// ========================================

router.patch(
  "/:id/resolve",
  authenticateToken,
  resolveAlertReport
);

module.exports = router;