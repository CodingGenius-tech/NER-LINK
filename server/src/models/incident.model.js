const { pool } = require("../config/database");

// ========================================
// GET ALL ROAD INCIDENTS
// ========================================

const getAllIncidents = async () => {
  const result = await pool.query(`
    SELECT
      ri.id,
      ri.road_id,
      r.name AS road_name,
      ri.incident_type,
      ri.severity,
      ri.description,
      ST_AsGeoJSON(ri.location)::json AS location,
      ri.reported_by,
      u.name AS reported_by_name,
      ri.status,
      ri.started_at,
      ri.resolved_at,
      ri.created_at,
      ri.updated_at
    FROM road_incidents ri
    LEFT JOIN roads r
      ON r.id = ri.road_id
    LEFT JOIN users u
      ON u.id = ri.reported_by
    ORDER BY ri.id ASC
  `);

  return result.rows;
};

// ========================================
// GET INCIDENT BY ID
// ========================================

const getIncidentById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      ri.id,
      ri.road_id,
      r.name AS road_name,
      ri.incident_type,
      ri.severity,
      ri.description,
      ST_AsGeoJSON(ri.location)::json AS location,
      ri.reported_by,
      u.name AS reported_by_name,
      ri.status,
      ri.started_at,
      ri.resolved_at,
      ri.created_at,
      ri.updated_at
    FROM road_incidents ri
    LEFT JOIN roads r
      ON r.id = ri.road_id
    LEFT JOIN users u
      ON u.id = ri.reported_by
    WHERE ri.id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};
// ========================================
// CREATE ROAD INCIDENT
// ========================================

const createIncident = async ({
  roadId,
  incidentType,
  severity,
  description,
  latitude,
  longitude,
  reportedBy,
}) => {
  const result = await pool.query(
    `
    INSERT INTO road_incidents (
      road_id,
      incident_type,
      severity,
      description,
      location,
      reported_by
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      ST_SetSRID(
        ST_MakePoint($6, $5),
        4326
      ),
      $7
    )
    RETURNING
      id,
      road_id,
      incident_type,
      severity,
      description,
      ST_AsGeoJSON(location)::json AS location,
      reported_by,
      status,
      started_at,
      resolved_at,
      created_at,
      updated_at
    `,
    [
      roadId,
      incidentType,
      severity,
      description ?? null,
      latitude,
      longitude,
      reportedBy,
    ]
  );

  return result.rows[0];
};

module.exports = {
  getAllIncidents,
  getIncidentById,
  createIncident,
};