const {
  getAllFieldReports,
  getFieldReportById,
  createFieldReport,
} = require("../models/fieldReport.model");

// ========================================
// GET ALL FIELD REPORTS
// ========================================

const getFieldReports = async (req, res) => {
  try {
    const reports = await getAllFieldReports();

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error(
      "Get field reports failed:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch field reports",
      error: error.message,
    });
  }
};

// ========================================
// GET FIELD REPORT BY ID
// ========================================

const getFieldReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await getFieldReportById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Field report not found",
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error(
      "Get field report failed:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch field report",
      error: error.message,
    });
  }
};

// ========================================
// CREATE FIELD REPORT
// ========================================

const createFieldReportReport = async (req, res) => {
  try {
    const {
      reportType,
      description,
      latitude,
      longitude,
    } = req.body;

    if (
      !reportType ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "reportType, latitude and longitude are required",
      });
    }

    const latitudeNumber = Number(latitude);
    const longitudeNumber = Number(longitude);

    if (
      Number.isNaN(latitudeNumber) ||
      Number.isNaN(longitudeNumber)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude must be valid numbers",
      });
    }

    if (
      latitudeNumber < -90 ||
      latitudeNumber > 90
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude must be between -90 and 90",
      });
    }

    if (
      longitudeNumber < -180 ||
      longitudeNumber > 180
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Longitude must be between -180 and 180",
      });
    }

    // ----------------------------------------
    // PHOTO URL
    // ----------------------------------------

    let photoUrl = null;

    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    const report = await createFieldReport({
      reportedBy: req.user.id,
      reportType: String(reportType).toUpperCase(),
      description:
        description?.trim() || null,
      latitude: latitudeNumber,
      longitude: longitudeNumber,
      photoUrl,
    });

    res.status(201).json({
      success: true,
      message: "Field report submitted successfully",
      data: report,
    });
  } catch (error) {
    console.error(
      "Create field report failed:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to create field report",
      error: error.message,
    });
  }
};

module.exports = {
  getFieldReports,
  getFieldReport,
  createFieldReportReport,
};