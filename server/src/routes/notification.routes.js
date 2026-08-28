const express = require("express");

const {
  getNotifications,
  getNotification,
  createNotificationReport,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notification.controller");

const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

// ========================================
// GET MY NOTIFICATIONS
// ========================================

router.get(
  "/",
  authenticateToken,
  getNotifications
);

// ========================================
// GET NOTIFICATION BY ID
// ========================================

router.get(
  "/:id",
  authenticateToken,
  getNotification
);

// ========================================
// CREATE NOTIFICATION
// ========================================

router.post(
  "/",
  authenticateToken,
  createNotificationReport
);

// ========================================
// MARK ALL AS READ
// ========================================

router.patch(
  "/read-all",
  authenticateToken,
  markAllAsRead
);

// ========================================
// MARK ONE AS READ
// ========================================

router.patch(
  "/:id/read",
  authenticateToken,
  markAsRead
);

module.exports = router;