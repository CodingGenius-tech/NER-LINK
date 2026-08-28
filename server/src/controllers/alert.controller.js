const {
  getAllAlerts,
  getAlertById,
  createAlert,
  resolveAlert,
} = require("../models/alert.model");

// ========================================
// GET ALL ALERTS
// ========================================

const getAlerts = async (req, res) => {
  try {
    const alerts = await getAllAlerts();

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error("Get alerts failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
      error: error.message,
    });
  }
};

// ========================================
// GET ALERT BY ID
// ========================================

const getAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await getAlertById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error("Get alert failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch alert",
      error: error.message,
    });
  }
};

// ========================================
// CREATE ALERT
// ========================================

const createAlertReport = async (req, res) => {
  try {
    const {
      alertType,
      severity,
      title,
      message,
      roadId,
      districtId,
      vehicleId,
      deliveryId,
      latitude,
      longitude,
    } = req.body;

    // Basic validation
    if (!alertType || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "alertType, title and message are required",
      });
    }

    const alert = await createAlert({
      alertType,
      severity,
      title,
      message,
      roadId,
      districtId,
      vehicleId,
      deliveryId,
      latitude,
      longitude,
    });

    res.status(201).json({
      success: true,
      message: "Alert created successfully",
      data: alert,
    });
  } catch (error) {
    console.error("Create alert failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create alert",
      error: error.message,
    });
  }
};

// ========================================
// RESOLVE ALERT
// ========================================

const resolveAlertReport = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await resolveAlert(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Alert resolved successfully",
      data: alert,
    });
  } catch (error) {
    console.error("Resolve alert failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to resolve alert",
      error: error.message,
    });
  }
};

module.exports = {
  getAlerts,
  getAlert,
  createAlertReport,
  resolveAlertReport,
};