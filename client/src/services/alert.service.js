const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ========================================
// GET ALL ALERTS
// ========================================

export const getAlerts = async (token) => {
  const response = await fetch(`${API_URL}/alerts`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch alerts"
    );
  }

  return data;
};

// ========================================
// GET ALERT BY ID
// ========================================

export const getAlertById = async (id, token) => {
  const response = await fetch(
    `${API_URL}/alerts/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch alert"
    );
  }

  return data;
};

// ========================================
// CREATE ALERT
// ========================================

export const createAlert = async (alertData, token) => {
  const response = await fetch(`${API_URL}/alerts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(alertData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create alert"
    );
  }

  return data;
};

// ========================================
// RESOLVE ALERT
// ========================================

export const resolveAlert = async (id, token) => {
  const response = await fetch(
    `${API_URL}/alerts/${id}/resolve`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to resolve alert"
    );
  }

  return data;
};