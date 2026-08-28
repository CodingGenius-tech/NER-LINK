const { pool } = require("../config/database");
const { comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

// ========================================
// LOGIN USER
// ========================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
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
        is_active
      FROM users
      WHERE email = $1
      `,
      [email.trim().toLowerCase()]
    );

    const user = result.rows[0];

    // Do not reveal whether email exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check account status
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    // Verify password
    const passwordValid = await comparePassword(
      password,
      user.password_hash
    );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = generateToken(user);

    // Never return password_hash
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          preferred_language: user.preferred_language,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

module.exports = {
  loginUser,
};