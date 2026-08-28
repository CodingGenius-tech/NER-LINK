const { z } = require("zod");

const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must not exceed 120 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),

  role: z
    .enum(["ADMIN", "OFFICIAL", "FIELD_OFFICER", "OPERATOR"])
    .optional(),

  phone: z
    .string()
    .trim()
    .max(20, "Phone number must not exceed 20 characters")
    .optional(),
});

module.exports = {
  createUserSchema,
};