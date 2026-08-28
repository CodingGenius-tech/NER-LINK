const express = require("express");

const {
  getUsers,
  getUser,
} = require("../controllers/user.controller");

const router = express.Router();

// GET /api/users
router.get("/", getUsers);

// GET /api/users/:id
router.get("/:id", getUser);

module.exports = router;