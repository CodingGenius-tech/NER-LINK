const express = require("express");

const {
  getRoads,
  getRoad,
  getRoadsForDistrict,
  getRoadsIntersecting,
} = require("../controllers/road.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const router = express.Router();

// GET /api/roads
router.get("/", authenticateToken, getRoads);

// GET /api/roads/district/:districtId
router.get(
  "/district/:districtId",
  authenticateToken,
  getRoadsForDistrict
);

// GET /api/roads/spatial/district/:districtId
router.get(
  "/spatial/district/:districtId",
  authenticateToken,
  getRoadsIntersecting
);

// GET /api/roads/:id
router.get("/:id", authenticateToken, getRoad);

module.exports = router;