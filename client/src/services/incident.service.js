const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ========================================
// GET ALL INCIDENTS
// ========================================

export const getIncidents = async (token) => {
  const response = await fetch(`${API_URL}/incidents`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch incidents"
    );
  }

  return data;
};

// ========================================
// GET INCIDENT BY ID
// ========================================

export const getIncidentById = async (id, token) => {
  const response = await fetch(
    `${API_URL}/incidents/${id}`,
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
      data.message || "Failed to fetch incident"
    );
  }

  return data;
};

// ========================================
// CREATE INCIDENT
// ========================================

export const createIncident = async (
  incidentData,
  token
) => {
  const response = await fetch(
    `${API_URL}/incidents`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(incidentData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to report incident"
    );
  }

  return data;
};