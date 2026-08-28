const express = require("express");

const {
  getPredictions,
  getPrediction,
} = require("../controllers/routePrediction.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const router = express.Router();

// GET /api/route-predictions
router.get("/", authenticateToken, getPredictions);

// GET /api/route-predictions/:id
router.get("/:id", authenticateToken, getPrediction);

module.exports = router;