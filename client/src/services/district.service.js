const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ========================================
// GET ALL DISTRICTS
// ========================================

export const getDistricts = async (token) => {
  const response = await fetch(`${API_URL}/districts`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch districts"
    );
  }

  return data;
};

// ========================================
// GET DISTRICT BY ID
// ========================================

export const getDistrictById = async (id, token) => {
  const response = await fetch(
    `${API_URL}/districts/${id}`,
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
      data.message || "Failed to fetch district"
    );
  }

  return data;
};