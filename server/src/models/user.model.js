const { pool } = require("../config/database");

// Get all users
const getAllUsers = async () => {
  const result = await pool.query(`
    SELECT
      id,
      name,
      email,
      role,
      phone,
      created_at,
      updated_at
    FROM users
    ORDER BY id ASC
  `);

  return result.rows;
};

// Get user by ID
const getUserById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      role,
      phone,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};

module.exports = {
  getAllUsers,
  getUserById,
};