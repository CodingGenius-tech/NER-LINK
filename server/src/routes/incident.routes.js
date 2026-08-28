const express = require("express");

const {
  getIncidents,
  getIncident,
  createIncidentReport,
} = require("../controllers/incident.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const router = express.Router();

// POST /api/incidents
router.post("/", authenticateToken, createIncidentReport);

// GET /api/incidents
router.get("/", authenticateToken, getIncidents);

// GET /api/incidents/:id
router.get("/:id", authenticateToken, getIncident);

module.exports = router;