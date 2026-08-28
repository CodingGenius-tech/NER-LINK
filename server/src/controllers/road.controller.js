const {
  getAllRoads,
  getRoadById,
  getRoadsByDistrict,
  getRoadsIntersectingDistrict,
} = require("../models/road.model");

// ========================================
// GET ALL ROADS
// ========================================

const getRoads = async (req, res) => {
  try {
    const roads = await getAllRoads();

    res.status(200).json({
      success: true,
      count: roads.length,
      data: roads,
    });
  } catch (error) {
    console.error("Get roads failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch roads",
      error: error.message,
    });
  }
};

// ========================================
// GET ROAD BY ID
// ========================================

const getRoad = async (req, res) => {
  try {
    const { id } = req.params;

    const road = await getRoadById(id);

    if (!road) {
      return res.status(404).json({
        success: false,
        message: "Road not found",
      });
    }

    res.status(200).json({
      success: true,
      data: road,
    });
  } catch (error) {
    console.error("Get road failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch road",
      error: error.message,
    });
  }
};
// ========================================
// GET ROADS BY DISTRICT
// ========================================

const getRoadsForDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;

    const roads = await getRoadsByDistrict(districtId);

    res.status(200).json({
      success: true,
      count: roads.length,
      data: roads,
    });
  } catch (error) {
    console.error("Get roads by district failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch roads for district",
      error: error.message,
    });
  }
};
// ========================================
// GET ROADS INTERSECTING A DISTRICT
// ========================================

const getRoadsIntersecting = async (req, res) => {
  try {
    const { districtId } = req.params;

    const roads = await getRoadsIntersectingDistrict(districtId);

    res.status(200).json({
      success: true,
      count: roads.length,
      data: roads,
    });
  } catch (error) {
    console.error(
      "Get intersecting roads failed:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch intersecting roads",
      error: error.message,
    });
  }
};

module.exports = {
  getRoads,
  getRoad,
  getRoadsForDistrict,
  getRoadsIntersecting,
};
