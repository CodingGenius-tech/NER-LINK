const {
  getAllRoutes,
  getRouteById,
} = require("../models/route.model");

// ========================================
// GET ALL ROUTES
// ========================================

const getRoutes = async (req, res) => {
  try {
    const routes = await getAllRoutes();

    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    console.error("Get routes failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch routes",
      error: error.message,
    });
  }
};

// ========================================
// GET ROUTE BY ID
// ========================================

const getRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await getRouteById(id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    res.status(200).json({
      success: true,
      data: route,
    });
  } catch (error) {
    console.error("Get route failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch route",
      error: error.message,
    });
  }
};

module.exports = {
  getRoutes,
  getRoute,
};