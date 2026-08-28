const express = require("express");

const {
  getDistricts,
  getDistrict,
} = require("../controllers/district.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const router = express.Router();

// GET /api/districts
router.get("/", authenticateToken, getDistricts);

// GET /api/districts/:id
router.get("/:id", authenticateToken, getDistrict);

module.exports = router;