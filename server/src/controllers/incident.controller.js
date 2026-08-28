const {
  getAllIncidents,
  getIncidentById,
  createIncident,
} = require("../models/incident.model");

// ========================================
// GET ALL INCIDENTS
// ========================================

const getIncidents = async (req, res) => {
  try {
    const incidents = await getAllIncidents();

    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents,
    });
  } catch (error) {
    console.error("Get incidents failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch incidents",
      error: error.message,
    });
  }
};

// ========================================
// GET INCIDENT BY ID
// ========================================

const getIncident = async (req, res) => {
  try {
    const { id } = req.params;

    const incident = await getIncidentById(id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    res.status(200).json({
      success: true,
      data: incident,
    });
  } catch (error) {
    console.error("Get incident failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch incident",
      error: error.message,
    });
  }
};
// ========================================
// CREATE ROAD INCIDENT
// ========================================

const createIncidentReport = async (req, res) => {
  try {
    const {
      roadId,
      incidentType,
      severity,
      description,
      latitude,
      longitude,
    } = req.body;

    // Basic validation
    if (
      !roadId ||
      !incidentType ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "roadId, incidentType, latitude and longitude are required",
      });
    }

    const incident = await createIncident({
      roadId,
      incidentType,
      severity,
      description,
      latitude,
      longitude,
      reportedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Incident reported successfully",
      data: incident,
    });
  } catch (error) {
    console.error("Create incident failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to report incident",
      error: error.message,
    });
  }
};

module.exports = {
  getIncidents,
  getIncident,
  createIncidentReport,
};