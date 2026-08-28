const {
  getUserNotifications,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../models/notification.model");

// ========================================
// GET MY NOTIFICATIONS
// ========================================

const getNotifications = async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.id);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// ========================================
// GET NOTIFICATION BY ID
// ========================================

const getNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await getNotificationById(
      id,
      req.user.id
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Get notification failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
      error: error.message,
    });
  }
};

// ========================================
// CREATE NOTIFICATION
// ========================================

const createNotificationReport = async (req, res) => {
  try {
    const {
      userId,
      alertId,
      title,
      message,
      language,
      channel,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "title and message are required",
      });
    }

    const notification = await createNotification({
      userId: userId || req.user.id,
      alertId,
      title,
      message,
      language,
      channel,
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Create notification failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: error.message,
    });
  }
};

// ========================================
// MARK ONE AS READ
// ========================================

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await markNotificationAsRead(
      id,
      req.user.id
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification read failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// ========================================
// MARK ALL AS READ
// ========================================

const markAllAsRead = async (req, res) => {
  try {
    const notifications = await markAllNotificationsAsRead(
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      count: notifications.length,
    });
  } catch (error) {
    console.error(
      "Mark all notifications read failed:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  getNotification,
  createNotificationReport,
  markAsRead,
  markAllAsRead,
};