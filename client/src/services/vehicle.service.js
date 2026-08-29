const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ========================================
// GET ALL VEHICLES
// ========================================

export const getVehicles = async (token) => {
  const response = await fetch(`${API_URL}/vehicles`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch vehicles"
    );
  }

  return data;
};

// ========================================
// GET VEHICLE BY ID
// ========================================

export const getVehicleById = async (id, token) => {
  const response = await fetch(
    `${API_URL}/vehicles/${id}`,
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
      data.message || "Failed to fetch vehicle"
    );
  }

  return data;
};