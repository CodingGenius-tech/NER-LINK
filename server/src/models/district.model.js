const { pool } = require("../config/database");

// ========================================
// GET ALL DISTRICTS
// ========================================

const getAllDistricts = async () => {
  const result = await pool.query(`
    SELECT
      id,
      name,
      state,
      connectivity_status,
      ST_AsGeoJSON(geometry)::json AS geometry,
      created_at,
      updated_at
    FROM districts
    ORDER BY id ASC
  `);

  return result.rows;
};

// ========================================
// GET DISTRICT BY ID
// ========================================

const getDistrictById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      state,
      connectivity_status,
      ST_AsGeoJSON(geometry)::json AS geometry,
      created_at,
      updated_at
    FROM districts
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};

module.exports = {
  getAllDistricts,
  getDistrictById,
};