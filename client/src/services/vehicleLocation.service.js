const API_URL = "http://localhost:5000/api";

// ========================================
// GET ALL VEHICLE LOCATIONS
// ========================================

export const getVehicleLocations = async (token) => {
  const response = await fetch(
    `${API_URL}/vehicle-locations`,
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
      data.message || "Failed to fetch vehicle locations"
    );
  }

  return data;
};

// ========================================
// GET LOCATIONS BY VEHICLE
// ========================================

export const getVehicleLocationsByVehicle = async (
  vehicleId,
  token
) => {
  const response = await fetch(
    `${API_URL}/vehicle-locations/vehicle/${vehicleId}`,
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
      data.message ||
        "Failed to fetch vehicle locations"
    );
  }

  return data;
};