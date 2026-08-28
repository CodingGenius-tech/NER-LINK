const { pool } = require("../config/database");

// ========================================
// GET ALL ROUTES
// ========================================

const getAllRoutes = async () => {
  const result = await pool.query(`
    SELECT
      r.id,
      r.delivery_id,
      d.source,
      d.destination,
      ST_AsGeoJSON(r.start_location)::json AS start_location,
      ST_AsGeoJSON(r.end_location)::json AS end_location,
      ST_AsGeoJSON(r.route_geometry)::json AS route_geometry,
      r.distance_km,
      r.estimated_time_minutes,
      r.risk_score,
      r.route_status,
      r.created_at,
      r.updated_at
    FROM routes r
    LEFT JOIN deliveries d
      ON d.id = r.delivery_id
    ORDER BY r.id ASC
  `);

  return result.rows;
};

// ========================================
// GET ROUTE BY ID
// ========================================

const getRouteById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      r.id,
      r.delivery_id,
      d.source,
      d.destination,
      ST_AsGeoJSON(r.start_location)::json AS start_location,
      ST_AsGeoJSON(r.end_location)::json AS end_location,
      ST_AsGeoJSON(r.route_geometry)::json AS route_geometry,
      r.distance_km,
      r.estimated_time_minutes,
      r.risk_score,
      r.route_status,
      r.created_at,
      r.updated_at
    FROM routes r
    LEFT JOIN deliveries d
      ON d.id = r.delivery_id
    WHERE r.id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};

module.exports = {
  getAllRoutes,
  getRouteById,
};