const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ========================================
// GET MY NOTIFICATIONS
// ========================================

export const getNotifications = async (token) => {
  const response = await fetch(
    `${API_URL}/notifications`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch notifications"
    );
  }

  return data;
};

// ========================================
// GET NOTIFICATION BY ID
// ========================================

export const getNotificationById = async (
  id,
  token
) => {
  const response = await fetch(
    `${API_URL}/notifications/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch notification"
    );
  }

  return data;
};

// ========================================
// CREATE NOTIFICATION
// ========================================

export const createNotification = async (
  notificationData,
  token
) => {
  const response = await fetch(
    `${API_URL}/notifications`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(notificationData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to create notification"
    );
  }

  return data;
};

// ========================================
// MARK ONE AS READ
// ========================================

export const markNotificationAsRead = async (
  id,
  token
) => {
  const response = await fetch(
    `${API_URL}/notifications/${id}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to mark notification as read"
    );
  }

  return data;
};

// ========================================
// MARK ALL AS READ
// ========================================

export const markAllNotificationsAsRead = async (
  token
) => {
  const response = await fetch(
    `${API_URL}/notifications/read-all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to mark notifications as read"
    );
  }

  return data;
};