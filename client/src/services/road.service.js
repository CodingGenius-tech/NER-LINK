const API_URL = "http://localhost:5000/api";

export const getRoads = async (token) => {
  const response = await fetch(`${API_URL}/roads`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch roads");
  }

  return data;
};

export const getRoadById = async (id, token) => {
  const response = await fetch(`${API_URL}/roads/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch road");
  }

  return data;
};

export const getRoadsByDistrict = async (districtId, token) => {
  const response = await fetch(
    `${API_URL}/roads/district/${districtId}`,
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
      data.message || "Failed to fetch roads for district"
    );
  }

  return data;
};

export const getRoadsIntersectingDistrict = async (
  districtId,
  token
) => {
  const response = await fetch(
    `${API_URL}/roads/spatial/district/${districtId}`,
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
      data.message || "Failed to fetch intersecting roads"
    );
  }

  return data;
};