const { pool } = require("../config/database");

// ========================================
// GET ALL VEHICLE LOCATIONS
// ========================================

const getAllVehicleLocations = async () => {
  const result = await pool.query(`
    SELECT
      vl.id,
      vl.vehicle_id,
      v.vehicle_number,
      ST_AsGeoJSON(vl.location)::json AS location,
      vl.speed,
      vl.heading,
      vl.recorded_at,
      vl.created_at
    FROM vehicle_locations vl
    LEFT JOIN vehicles v
      ON v.id = vl.vehicle_id
    ORDER BY vl.recorded_at DESC
  `);

  return result.rows;
};

// ========================================
// GET LOCATIONS BY VEHICLE
// ========================================

const getVehicleLocations = async (vehicleId) => {
  const result = await pool.query(
    `
    SELECT
      vl.id,
      vl.vehicle_id,
      v.vehicle_number,
      ST_AsGeoJSON(vl.location)::json AS location,
      vl.speed,
      vl.heading,
      vl.recorded_at,
      vl.created_at
    FROM vehicle_locations vl
    LEFT JOIN vehicles v
      ON v.id = vl.vehicle_id
    WHERE vl.vehicle_id = $1
    ORDER BY vl.recorded_at DESC
    `,
    [vehicleId]
  );

  return result.rows;
};

module.exports = {
  getAllVehicleLocations,
  getVehicleLocations,
};