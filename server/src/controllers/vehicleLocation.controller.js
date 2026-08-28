const {
  getAllVehicleLocations,
  getVehicleLocations,
} = require("../models/vehiclelocation.model");

// ========================================
// GET ALL VEHICLE LOCATIONS
// ========================================

const getLocations = async (req, res) => {
  try {
    const locations = await getAllVehicleLocations();

    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error("Get vehicle locations failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle locations",
      error: error.message,
    });
  }
};

// ========================================
// GET LOCATIONS BY VEHICLE
// ========================================

const getLocationsByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const locations = await getVehicleLocations(vehicleId);

    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error(
      "Get vehicle-specific locations failed:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle locations",
      error: error.message,
    });
  }
};

module.exports = {
  getLocations,
  getLocationsByVehicle,
};