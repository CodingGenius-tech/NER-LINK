const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

// Hash a plain-text password
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// Compare a plain-text password with a stored hash
const comparePassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

module.exports = {
  hashPassword,
  comparePassword,
};