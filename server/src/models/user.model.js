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

// Create a new user
const createUser = async ({
  name,
  email,
  passwordHash,
  role,
  phone,
}) => {
  const result = await pool.query(
    `
    INSERT INTO users (
      name,
      email,
      password_hash,
      role,
      phone
    )
    VALUES ($1, $2, $3, COALESCE($4, 'OPERATOR'::user_role), $5)
    RETURNING
      id,
      name,
      email,
      role,
      phone,
      preferred_language,
      is_active,
      created_at,
      updated_at
    `,
    [name, email, passwordHash, role ?? null, phone ?? null]
  );

  return result.rows[0];
};
// Get user by email for authentication
const getUserByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      password_hash,
      role,
      phone,
      preferred_language,
      is_active,
      created_at,
      updated_at
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
};