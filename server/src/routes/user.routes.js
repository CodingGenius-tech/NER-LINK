const express = require("express");

const {
  getUsers,
  getUser,
  createUserAccount,
} = require("../controllers/user.controller");

const router = express.Router();

// POST /api/users
router.post("/", createUserAccount);

// GET /api/users
router.get("/", getUsers);

// GET /api/users/:id
router.get("/:id", getUser);

module.exports = router;