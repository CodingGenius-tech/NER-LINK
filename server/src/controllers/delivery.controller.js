const {
  getAllDeliveries,
  getDeliveryById,
  createDelivery,
} = require("../models/delivery.model");

// ========================================
// GET ALL DELIVERIES
// ========================================

const getDeliveries = async (req, res) => {
  try {
    const deliveries = await getAllDeliveries();

    res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries,
    });
  } catch (error) {
    console.error("Get deliveries failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch deliveries",
      error: error.message,
    });
  }
};

// ========================================
// GET DELIVERY BY ID
// ========================================

const getDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await getDeliveryById(id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    res.status(200).json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    console.error("Get delivery failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery",
      error: error.message,
    });
  }
};
// ========================================
// CREATE DELIVERY
// ========================================

const createDeliveryReport = async (req, res) => {
  try {
    const {
      vehicleId,
      source,
      destination,
      commodityType,
      priority,
      quantity,
      expectedDeliveryAt,
    } = req.body;

    // Basic validation
    if (
      !source ||
      !destination ||
      !commodityType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "source, destination and commodityType are required",
      });
    }

    // Quantity validation
    if (quantity !== undefined && quantity !== null) {
      if (Number.isNaN(Number(quantity)) || Number(quantity) < 0) {
        return res.status(400).json({
          success: false,
          message: "quantity must be a non-negative number",
        });
      }
    }

    const delivery = await createDelivery({
      vehicleId,
      source,
      destination,
      commodityType,
      priority,
      quantity,
      expectedDeliveryAt,
    });

    res.status(201).json({
      success: true,
      message: "Delivery created successfully",
      data: delivery,
    });
  } catch (error) {
    console.error("Create delivery failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create delivery",
      error: error.message,
    });
  }
};

module.exports = {
  getDeliveries,
  getDelivery,
  createDeliveryReport,
};