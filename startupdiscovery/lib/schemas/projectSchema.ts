import { z } from "zod";

/**
 * Project Schema for POST requests (creating new projects)
 */
export const projectCreateSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled'], {
    message: "Status must be one of: planning, active, on-hold, completed, cancelled",
  }).optional().default('planning'),
  category: z.string().min(2, "Category must be at least 2 characters long"),
  budget: z.number().positive("Budget must be a positive number"),
  startDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "Invalid start date format",
  }),
  endDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "Invalid end date format",
  }).optional(),
  teamSize: z.number().int().positive("Team size must be a positive integer").optional().default(1),
  owner: z.string().min(2, "Owner name must be at least 2 characters long"),
}).refine(
  (data) => {
    if (data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: "End date cannot be before start date",
    path: ["endDate"],
  }
);

/**
 * Project Schema for PUT requests (updating existing projects)
 */
export const projectUpdateSchema = z.object({
  id: z.number().int().positive("Project ID must be a positive integer"),
  name: z.string().min(3, "Project name must be at least 3 characters long").optional(),
  description: z.string().min(10, "Description must be at least 10 characters long").optional(),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled'], {
    message: "Status must be one of: planning, active, on-hold, completed, cancelled",
  }).optional(),
  category: z.string().min(2, "Category must be at least 2 characters long").optional(),
  budget: z.number().positive("Budget must be a positive number").optional(),
  startDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "Invalid start date format",
  }).optional(),
  endDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "Invalid end date format",
  }).optional(),
  teamSize: z.number().int().positive("Team size must be a positive integer").optional(),
  owner: z.string().min(2, "Owner name must be at least 2 characters long").optional(),
});

/**
 * Project Schema for DELETE requests
 */
export const projectDeleteSchema = z.object({
  id: z.number().int().positive("Project ID must be a positive integer"),
});
