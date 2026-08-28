const express = require("express");

const {
  getRoutes,
  getRoute,
} = require("../controllers/route.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const router = express.Router();

// GET /api/routes
router.get("/", authenticateToken, getRoutes);

// GET /api/routes/:id
router.get("/:id", authenticateToken, getRoute);

module.exports = router;