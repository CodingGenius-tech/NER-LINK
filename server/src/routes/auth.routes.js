const express = require("express");

const {
  loginUser,
} = require("../controllers/auth.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const router = express.Router();

// POST /api/auth/login
router.post("/login", loginUser);

// GET /api/auth/me
router.get(
  "/me",
  authenticateToken,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted",
      data: {
        user: req.user,
      },
    });
  }
);

module.exports = router;