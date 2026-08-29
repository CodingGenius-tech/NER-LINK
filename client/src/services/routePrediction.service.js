const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ========================================
// GET ALL ROUTE PREDICTIONS
// ========================================

export const getRoutePredictions = async (token) => {
  const response = await fetch(
    `${API_URL}/route-predictions`,
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
      data.message || "Failed to fetch route predictions"
    );
  }

  return data;
};

// ========================================
// GET ROUTE PREDICTION BY ID
// ========================================

export const getRoutePredictionById = async (id, token) => {
  const response = await fetch(
    `${API_URL}/route-predictions/${id}`,
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
      data.message || "Failed to fetch route prediction"
    );
  }

  return data;
};