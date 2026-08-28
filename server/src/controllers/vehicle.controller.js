const {
  getAllVehicles,
  getVehicleById,
} = require("../models/vehicle.model");

// ========================================
// GET ALL VEHICLES
// ========================================

const getVehicles = async (req, res) => {
  try {
    const vehicles = await getAllVehicles();

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    console.error("Get vehicles failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles",
      error: error.message,
    });
  }
};

// ========================================
// GET VEHICLE BY ID
// ========================================

const getVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await getVehicleById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Get vehicle failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle",
      error: error.message,
    });
  }
};

module.exports = {
  getVehicles,
  getVehicle,
};