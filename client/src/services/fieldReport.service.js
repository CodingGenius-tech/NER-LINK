const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ========================================
// GET ALL FIELD REPORTS
// ========================================

export const getFieldReports = async (token) => {
  const response = await fetch(
    `${API_URL}/field-reports`,
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
        "Failed to fetch field reports"
    );
  }

  return data;
};

// ========================================
// GET FIELD REPORT BY ID
// ========================================

export const getFieldReportById = async (
  id,
  token
) => {
  const response = await fetch(
    `${API_URL}/field-reports/${id}`,
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
        "Failed to fetch field report"
    );
  }

  return data;
};

// ========================================
// CREATE FIELD REPORT
// ========================================

export const createFieldReport = async (
  reportData,
  token
) => {
  const formData = new FormData();

  formData.append(
    "reportType",
    reportData.reportType
  );

  formData.append(
    "description",
    reportData.description || ""
  );

  formData.append(
    "latitude",
    reportData.latitude
  );

  formData.append(
    "longitude",
    reportData.longitude
  );

  if (reportData.photo) {
    formData.append(
      "photo",
      reportData.photo
    );
  }

  const response = await fetch(
    `${API_URL}/field-reports`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to create field report"
    );
  }

  return data;
};