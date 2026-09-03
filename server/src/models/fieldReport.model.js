const { pool } = require("../config/database");

// ========================================
// GET ALL FIELD REPORTS
// ========================================

const getAllFieldReports = async () => {
  const result = await pool.query(`
    SELECT
      fr.id,
      fr.reported_by,
      u.name AS reported_by_name,
      fr.report_type,
      fr.description,
      fr.latitude,
      fr.longitude,
      ST_AsGeoJSON(fr.location)::json AS location,
      fr.photo_url,
      fr.sync_status,
      fr.created_at,
      fr.synced_at
    FROM field_reports fr
    LEFT JOIN users u
      ON u.id = fr.reported_by
    ORDER BY fr.created_at DESC
  `);

  return result.rows;
};

// ========================================
// GET FIELD REPORT BY ID
// ========================================

const getFieldReportById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      fr.id,
      fr.reported_by,
      u.name AS reported_by_name,
      fr.report_type,
      fr.description,
      fr.latitude,
      fr.longitude,
      ST_AsGeoJSON(fr.location)::json AS location,
      fr.photo_url,
      fr.sync_status,
      fr.created_at,
      fr.synced_at
    FROM field_reports fr
    LEFT JOIN users u
      ON u.id = fr.reported_by
    WHERE fr.id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};

// ========================================
// CREATE FIELD REPORT
// ========================================

const createFieldReport = async ({
  reportedBy,
  reportType,
  description,
  latitude,
  longitude,
  photoUrl,
}) => {
  const result = await pool.query(
    `
    INSERT INTO field_reports (
      reported_by,
      report_type,
      description,
      latitude,
      longitude,
      location,
      photo_url,
      sync_status
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      ST_SetSRID(
        ST_MakePoint($6, $7),
        4326
      ),
      $8,
      'SYNCED'
    )
    RETURNING
      id,
      reported_by,
      report_type,
      description,
      latitude,
      longitude,
      ST_AsGeoJSON(location)::json AS location,
      photo_url,
      sync_status,
      created_at,
      synced_at
    `,
    [
      reportedBy,
      reportType,
      description ?? null,
      latitude,
      longitude,
      longitude,
      latitude,
      photoUrl ?? null,
    ]
  );

  return result.rows[0];
};

module.exports = {
  getAllFieldReports,
  getFieldReportById,
  createFieldReport,
};