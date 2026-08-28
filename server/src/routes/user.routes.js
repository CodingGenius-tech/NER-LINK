const express = require("express");

const {
  getUsers,
  getUser,
  createUserAccount,
} = require("../controllers/user.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const router = express.Router();

// POST /api/users
router.post("/", authenticateToken, createUserAccount);

// GET /api/users
router.get("/", authenticateToken, getUsers);

// GET /api/users/:id
router.get("/:id", authenticateToken, getUser);

module.exports = router;