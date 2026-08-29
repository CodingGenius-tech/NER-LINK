const API_URL = "http://localhost:5000/api";

// ========================================
// GET ALL DELIVERIES
// ========================================

export const getDeliveries = async (token) => {
  const response = await fetch(`${API_URL}/deliveries`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch deliveries"
    );
  }

  return data;
};

// ========================================
// GET DELIVERY BY ID
// ========================================

export const getDeliveryById = async (id, token) => {
  const response = await fetch(
    `${API_URL}/deliveries/${id}`,
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
      data.message || "Failed to fetch delivery"
    );
  }

  return data;
};

// ========================================
// CREATE DELIVERY
// ========================================

export const createDelivery = async (deliveryData, token) => {
  const response = await fetch(`${API_URL}/deliveries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(deliveryData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create delivery"
    );
  }

  return data;
};