const { pool } = require("../config/database");

// ========================================
// GET ALL ROUTE PREDICTIONS
// ========================================

const getAllPredictions = async () => {
  const result = await pool.query(`
    SELECT
      rp.id,
      rp.route_id,
      r.delivery_id,
      d.source,
      d.destination,
      rp.disruption_probability,
      rp.risk_level,
      rp.predicted_disruption_type,
      rp.expected_delay_minutes,
      rp.model_version,
      rp.predicted_at,
      rp.created_at
    FROM route_predictions rp
    LEFT JOIN routes r
      ON r.id = rp.route_id
    LEFT JOIN deliveries d
      ON d.id = r.delivery_id
    ORDER BY rp.id ASC
  `);

  return result.rows;
};

// ========================================
// GET PREDICTION BY ID
// ========================================

const getPredictionById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      rp.id,
      rp.route_id,
      r.delivery_id,
      d.source,
      d.destination,
      rp.disruption_probability,
      rp.risk_level,
      rp.predicted_disruption_type,
      rp.expected_delay_minutes,
      rp.model_version,
      rp.predicted_at,
      rp.created_at
    FROM route_predictions rp
    LEFT JOIN routes r
      ON r.id = rp.route_id
    LEFT JOIN deliveries d
      ON d.id = r.delivery_id
    WHERE rp.id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};

module.exports = {
  getAllPredictions,
  getPredictionById,
};