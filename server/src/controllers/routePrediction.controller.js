const {
  getAllPredictions,
  getPredictionById,
} = require("../models/routePrediction.model");

// ========================================
// GET ALL PREDICTIONS
// ========================================

const getPredictions = async (req, res) => {
  try {
    const predictions = await getAllPredictions();

    res.status(200).json({
      success: true,
      count: predictions.length,
      data: predictions,
    });
  } catch (error) {
    console.error("Get predictions failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch route predictions",
      error: error.message,
    });
  }
};

// ========================================
// GET PREDICTION BY ID
// ========================================

const getPrediction = async (req, res) => {
  try {
    const { id } = req.params;

    const prediction = await getPredictionById(id);

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: "Route prediction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    console.error("Get prediction failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch route prediction",
      error: error.message,
    });
  }
};

module.exports = {
  getPredictions,
  getPrediction,
};