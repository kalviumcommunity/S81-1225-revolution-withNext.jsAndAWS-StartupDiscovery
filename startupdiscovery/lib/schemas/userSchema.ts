import { z } from "zod";

/**
 * User Schema for POST requests (creating new users)
 */
export const userCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  role: z.enum(['admin', 'moderator', 'user'], {
    message: "Role must be one of: admin, moderator, user",
  }),
  age: z.number().min(18, "User must be 18 or older").optional(),
});

/**
 * User Schema for PUT requests (updating existing users)
 */
export const userUpdateSchema = z.object({
  id: z.number().int().positive("User ID must be a positive integer"),
  name: z.string().min(2, "Name must be at least 2 characters long").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(['admin', 'moderator', 'user'], {
    message: "Role must be one of: admin, moderator, user",
  }).optional(),
  age: z.number().min(18, "User must be 18 or older").optional(),
});

/**
 * User Schema for DELETE requests
 */
export const userDeleteSchema = z.object({
  id: z.number().int().positive("User ID must be a positive integer"),
});
