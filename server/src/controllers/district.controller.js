const {
  getAllDistricts,
  getDistrictById,
} = require("../models/district.model");

// ========================================
// GET ALL DISTRICTS
// ========================================

const getDistricts = async (req, res) => {
  try {
    const districts = await getAllDistricts();

    res.status(200).json({
      success: true,
      count: districts.length,
      data: districts,
    });
  } catch (error) {
    console.error("Get districts failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch districts",
      error: error.message,
    });
  }
};

// ========================================
// GET DISTRICT BY ID
// ========================================

const getDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    const district = await getDistrictById(id);

    if (!district) {
      return res.status(404).json({
        success: false,
        message: "District not found",
      });
    }

    res.status(200).json({
      success: true,
      data: district,
    });
  } catch (error) {
    console.error("Get district failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch district",
      error: error.message,
    });
  }
};

module.exports = {
  getDistricts,
  getDistrict,
};