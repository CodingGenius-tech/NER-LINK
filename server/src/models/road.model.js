const { pool } = require("../config/database");

// ========================================
// GET ALL ROADS
// ========================================

const getAllRoads = async () => {
  const result = await pool.query(`
    SELECT
      id,
      name,
      road_type,
      district_id,
      current_status,
      risk_level,
      speed_limit,
      condition_score,
      ST_AsGeoJSON(geometry)::json AS geometry,
      last_updated,
      created_at,
      updated_at
    FROM roads
    ORDER BY id ASC
  `);

  return result.rows;
};

// ========================================
// GET ROAD BY ID
// ========================================

const getRoadById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      road_type,
      district_id,
      current_status,
      risk_level,
      speed_limit,
      condition_score,
      ST_AsGeoJSON(geometry)::json AS geometry,
      last_updated,
      created_at,
      updated_at
    FROM roads
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};
// ========================================
// GET ROADS BY DISTRICT
// ========================================

const getRoadsByDistrict = async (districtId) => {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      road_type,
      district_id,
      current_status,
      risk_level,
      speed_limit,
      condition_score,
      ST_AsGeoJSON(geometry)::json AS geometry,
      last_updated,
      created_at,
      updated_at
    FROM roads
    WHERE district_id = $1
    ORDER BY id ASC
    `,
    [districtId]
  );

  return result.rows;
};
// ========================================
// GET ROADS INTERSECTING A DISTRICT
// ========================================

const getRoadsIntersectingDistrict = async (districtId) => {
  const result = await pool.query(
    `
    SELECT
      r.id,
      r.name,
      r.road_type,
      r.district_id,
      r.current_status,
      r.risk_level,
      r.speed_limit,
      r.condition_score,
      ST_AsGeoJSON(r.geometry)::json AS geometry,
      r.last_updated,
      r.created_at,
      r.updated_at
    FROM roads r
    INNER JOIN districts d
      ON d.id = $1
    WHERE ST_Intersects(r.geometry, d.geometry)
    ORDER BY r.id ASC
    `,
    [districtId]
  );

  return result.rows;
};

module.exports = {
  getAllRoads,
  getRoadById,
  getRoadsByDistrict,
  getRoadsIntersectingDistrict,
};
