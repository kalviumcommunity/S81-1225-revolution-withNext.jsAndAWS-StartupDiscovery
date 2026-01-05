import { z } from "zod";

/**
 * Task Schema for POST requests (creating new tasks)
 */
export const taskCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  status: z.enum(['pending', 'in-progress', 'completed'], {
    message: "Status must be one of: pending, in-progress, completed",
  }).optional().default('pending'),
  priority: z.enum(['low', 'medium', 'high'], {
    message: "Priority must be one of: low, medium, high",
  }).optional().default('medium'),
  assignedTo: z.string().optional(),
});

/**
 * Task Schema for PUT requests (updating existing tasks)
 */
export const taskUpdateSchema = z.object({
  id: z.number().int().positive("Task ID must be a positive integer"),
  title: z.string().min(3, "Title must be at least 3 characters long").optional(),
  description: z.string().min(10, "Description must be at least 10 characters long").optional(),
  status: z.enum(['pending', 'in-progress', 'completed'], {
    message: "Status must be one of: pending, in-progress, completed",
  }).optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    message: "Priority must be one of: low, medium, high",
  }).optional(),
  assignedTo: z.string().optional(),
});

/**
 * Task Schema for DELETE requests
 */
export const taskDeleteSchema = z.object({
  id: z.number().int().positive("Task ID must be a positive integer"),
});
