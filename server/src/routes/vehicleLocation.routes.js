const express = require("express");

const {
  getLocations,
  getLocationsByVehicle,
} = require("../controllers/vehicleLocation.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const router = express.Router();

// GET /api/vehicle-locations
router.get("/", authenticateToken, getLocations);

// GET /api/vehicle-locations/vehicle/:vehicleId
router.get(
  "/vehicle/:vehicleId",
  authenticateToken,
  getLocationsByVehicle
);

module.exports = router;