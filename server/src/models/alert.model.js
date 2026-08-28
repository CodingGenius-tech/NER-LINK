const { pool } = require("../config/database");

// ========================================
// GET ALL ALERTS
// ========================================

const getAllAlerts = async () => {
  const result = await pool.query(`
    SELECT
      a.id,
      a.alert_type,
      a.severity,
      a.title,
      a.message,

      a.road_id,
      r.name AS road_name,

      a.district_id,

      a.vehicle_id,
      v.vehicle_number,

      a.delivery_id,
      d.source AS delivery_source,
      d.destination AS delivery_destination,

      ST_AsGeoJSON(a.location)::json AS location,

      a.is_resolved,
      a.created_at,
      a.resolved_at

    FROM alerts a

    LEFT JOIN roads r
      ON r.id = a.road_id

    LEFT JOIN vehicles v
      ON v.id = a.vehicle_id

    LEFT JOIN deliveries d
      ON d.id = a.delivery_id

    ORDER BY a.id ASC
  `);

  return result.rows;
};

// ========================================
// GET ALERT BY ID
// ========================================

const getAlertById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      a.id,
      a.alert_type,
      a.severity,
      a.title,
      a.message,

      a.road_id,
      r.name AS road_name,

      a.district_id,

      a.vehicle_id,
      v.vehicle_number,

      a.delivery_id,
      d.source AS delivery_source,
      d.destination AS delivery_destination,

      ST_AsGeoJSON(a.location)::json AS location,

      a.is_resolved,
      a.created_at,
      a.resolved_at

    FROM alerts a

    LEFT JOIN roads r
      ON r.id = a.road_id

    LEFT JOIN vehicles v
      ON v.id = a.vehicle_id

    LEFT JOIN deliveries d
      ON d.id = a.delivery_id

    WHERE a.id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};

// ========================================
// CREATE ALERT
// ========================================

const createAlert = async ({
  alertType,
  severity,
  title,
  message,
  roadId,
  districtId,
  vehicleId,
  deliveryId,
  latitude,
  longitude,
}) => {
  const result = await pool.query(
    `
    INSERT INTO alerts (
      alert_type,
      severity,
      title,
      message,
      road_id,
      district_id,
      vehicle_id,
      delivery_id,
      location
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      CASE
        WHEN $9::numeric IS NOT NULL
         AND $10::numeric IS NOT NULL
        THEN ST_SetSRID(
          ST_MakePoint($10::numeric, $9::numeric),
          4326
        )
        ELSE NULL
      END
    )
    RETURNING
      id,
      alert_type,
      severity,
      title,
      message,
      road_id,
      district_id,
      vehicle_id,
      delivery_id,
      ST_AsGeoJSON(location)::json AS location,
      is_resolved,
      created_at,
      resolved_at
    `,
    [
      alertType,
      severity || "MEDIUM",
      title,
      message,
      roadId ?? null,
      districtId ?? null,
      vehicleId ?? null,
      deliveryId ?? null,
      latitude ?? null,
      longitude ?? null,
    ]
  );

  return result.rows[0];
};

// ========================================
// RESOLVE ALERT
// ========================================

const resolveAlert = async (id) => {
  const result = await pool.query(
    `
    UPDATE alerts
    SET
      is_resolved = true,
      resolved_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      alert_type,
      severity,
      title,
      message,
      road_id,
      district_id,
      vehicle_id,
      delivery_id,
      ST_AsGeoJSON(location)::json AS location,
      is_resolved,
      created_at,
      resolved_at
    `,
    [id]
  );

  return result.rows[0] || null;
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  getAllAlerts,
  getAlertById,
  createAlert,
  resolveAlert,
};