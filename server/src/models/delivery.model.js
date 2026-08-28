const { pool } = require("../config/database");

// ========================================
// GET ALL DELIVERIES
// ========================================

const getAllDeliveries = async () => {
  const result = await pool.query(`
    SELECT
      d.id,
      d.vehicle_id,
      v.vehicle_number,
      d.source,
      d.destination,
      d.commodity_type,
      d.priority,
      d.quantity,
      d.status,
      d.expected_delivery_at,
      d.actual_delivery_at,
      d.created_at,
      d.updated_at
    FROM deliveries d
    LEFT JOIN vehicles v
      ON v.id = d.vehicle_id
    ORDER BY d.id ASC
  `);

  return result.rows;
};

// ========================================
// GET DELIVERY BY ID
// ========================================

const getDeliveryById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      d.id,
      d.vehicle_id,
      v.vehicle_number,
      d.source,
      d.destination,
      d.commodity_type,
      d.priority,
      d.quantity,
      d.status,
      d.expected_delivery_at,
      d.actual_delivery_at,
      d.created_at,
      d.updated_at
    FROM deliveries d
    LEFT JOIN vehicles v
      ON v.id = d.vehicle_id
    WHERE d.id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};
// ========================================
// CREATE DELIVERY
// ========================================

const createDelivery = async ({
  vehicleId,
  source,
  destination,
  commodityType,
  priority,
  quantity,
  expectedDeliveryAt,
}) => {
  const result = await pool.query(
    `
    INSERT INTO deliveries (
      vehicle_id,
      source,
      destination,
      commodity_type,
      priority,
      quantity,
      expected_delivery_at
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7
    )
    RETURNING
      id,
      vehicle_id,
      source,
      destination,
      commodity_type,
      priority,
      quantity,
      status,
      expected_delivery_at,
      actual_delivery_at,
      created_at,
      updated_at
    `,
    [
      vehicleId ?? null,
      source,
      destination,
      commodityType,
      priority ?? "NORMAL",
      quantity ?? null,
      expectedDeliveryAt ?? null,
    ]
  );

  return result.rows[0];
};

module.exports = {
  getAllDeliveries,
  getDeliveryById,
  createDelivery,
};