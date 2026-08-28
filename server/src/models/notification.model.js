const { pool } = require("../config/database");

// ========================================
// GET ALL NOTIFICATIONS FOR CURRENT USER
// ========================================

const getUserNotifications = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      n.id,
      n.user_id,
      n.alert_id,

      n.title,
      n.message,
      n.language,
      n.channel,

      n.is_read,
      n.sent_at,
      n.created_at,

      a.alert_type,
      a.severity

    FROM notifications n

    LEFT JOIN alerts a
      ON a.id = n.alert_id

    WHERE n.user_id = $1

    ORDER BY n.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

// ========================================
// GET NOTIFICATION BY ID
// ========================================

const getNotificationById = async (id, userId) => {
  const result = await pool.query(
    `
    SELECT
      n.id,
      n.user_id,
      n.alert_id,

      n.title,
      n.message,
      n.language,
      n.channel,

      n.is_read,
      n.sent_at,
      n.created_at,

      a.alert_type,
      a.severity

    FROM notifications n

    LEFT JOIN alerts a
      ON a.id = n.alert_id

    WHERE n.id = $1
      AND n.user_id = $2
    `,
    [id, userId]
  );

  return result.rows[0] || null;
};

// ========================================
// CREATE NOTIFICATION
// ========================================

const createNotification = async ({
  userId,
  alertId,
  title,
  message,
  language,
  channel,
}) => {
  const result = await pool.query(
    `
    INSERT INTO notifications (
      user_id,
      alert_id,
      title,
      message,
      language,
      channel
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6
    )
    RETURNING
      id,
      user_id,
      alert_id,
      title,
      message,
      language,
      channel,
      is_read,
      sent_at,
      created_at
    `,
    [
      userId,
      alertId ?? null,
      title,
      message,
      language || "en",
      channel || "IN_APP",
    ]
  );

  return result.rows[0];
};

// ========================================
// MARK NOTIFICATION AS READ
// ========================================

const markNotificationAsRead = async (id, userId) => {
  const result = await pool.query(
    `
    UPDATE notifications
    SET
      is_read = true,
      sent_at = COALESCE(sent_at, NOW())
    WHERE id = $1
      AND user_id = $2

    RETURNING
      id,
      user_id,
      alert_id,
      title,
      message,
      language,
      channel,
      is_read,
      sent_at,
      created_at
    `,
    [id, userId]
  );

  return result.rows[0] || null;
};

// ========================================
// MARK ALL NOTIFICATIONS AS READ
// ========================================

const markAllNotificationsAsRead = async (userId) => {
  const result = await pool.query(
    `
    UPDATE notifications
    SET
      is_read = true,
      sent_at = COALESCE(sent_at, NOW())
    WHERE user_id = $1
      AND is_read = false

    RETURNING id
    `,
    [userId]
  );

  return result.rows;
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  getUserNotifications,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};