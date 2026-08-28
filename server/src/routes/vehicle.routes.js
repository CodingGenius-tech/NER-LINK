const express = require("express");

const {
  getVehicles,
  getVehicle,
} = require("../controllers/vehicle.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const router = express.Router();

// GET /api/vehicles
router.get("/", authenticateToken, getVehicles);

// GET /api/vehicles/:id
router.get("/:id", authenticateToken, getVehicle);

module.exports = router;