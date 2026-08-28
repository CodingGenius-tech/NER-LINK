const {
  createUserSchema,
} = require("../utils/user.validation");

const {
  hashPassword,
} = require("../utils/password");

const {
  createUser,
} = require("../models/user.model");

const {
  getAllUsers,
  getUserById,
} = require("../models/user.model");

// ========================================
// GET ALL USERS
// ========================================

const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get users failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// ========================================
// GET USER BY ID
// ========================================

const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// ========================================
// CREATE USER
// ========================================

const createUserAccount = async (req, res) => {
  try {
    // Validate incoming request
    const validationResult = createUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const {
      name,
      email,
      password,
      role,
      phone,
    } = validationResult.data;

    // Hash password before storing it
    const passwordHash = await hashPassword(password);

    // Create user in database
    const user = await createUser({
      name,
      email,
      passwordHash,
      role,
      phone,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Create user failed:", error.message);

    // PostgreSQL unique violation
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUserAccount,
};