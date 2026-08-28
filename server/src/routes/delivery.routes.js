const express = require("express");

const {
  getDeliveries,
  getDelivery,
  createDeliveryReport,
} = require("../controllers/delivery.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const router = express.Router();

// GET /api/deliveries
router.get("/", authenticateToken, getDeliveries);

// GET /api/deliveries/:id
router.get("/:id", authenticateToken, getDelivery);

// POST /api/deliveries
router.post("/", authenticateToken, createDeliveryReport);

module.exports = router;