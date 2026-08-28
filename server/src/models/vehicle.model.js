const { pool } = require("../config/database");

// ========================================
// GET ALL VEHICLES
// ========================================

const getAllVehicles = async () => {
  const result = await pool.query(`
    SELECT
      id,
      vehicle_number,
      vehicle_type,
      driver_name,
      commodity_type,
      capacity,
      status,
      ST_AsGeoJSON(current_location)::json AS current_location,
      last_location_update,
      created_at,
      updated_at
    FROM vehicles
    ORDER BY id ASC
  `);

  return result.rows;
};

// ========================================
// GET VEHICLE BY ID
// ========================================

const getVehicleById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      id,
      vehicle_number,
      vehicle_type,
      driver_name,
      commodity_type,
      capacity,
      status,
      ST_AsGeoJSON(current_location)::json AS current_location,
      last_location_update,
      created_at,
      updated_at
    FROM vehicles
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};

module.exports = {
  getAllVehicles,
  getVehicleById,
};