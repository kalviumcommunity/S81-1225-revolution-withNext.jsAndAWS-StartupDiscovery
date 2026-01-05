import { sendSuccess, sendError, sendValidationError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';
import { userCreateSchema, userUpdateSchema, userDeleteSchema } from '@/lib/schemas/userSchema';
import { ZodError } from 'zod';

// Authentication helper
function checkAuth(req: Request): { authorized: boolean; user?: { id: number; role: string } } {
  const authHeader = req.headers.get('authorization');
  
  // In production, verify JWT token or session
  // For now, checking for presence of Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false };
  }
  
  // Mock user from token - in production, decode and verify JWT
  // For demonstration: Bearer token format would be "Bearer user_id:role"
  try {
    const token = authHeader.substring(7);
    const [userIdStr, role] = token.split(':');

    if (!userIdStr || !role) {
      // Token format is incorrect
      return { authorized: false };
    }

    const userId = parseInt(userIdStr, 10);

    if (isNaN(userId)) {
      // userId is not a valid number
      return { authorized: false };
    }

    return {
      authorized: true,
      user: { id: userId, role: role },
    };
  } catch {
    return { authorized: false };
  }
}

// Authorization helper
function checkPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = { admin: 3, moderator: 2, user: 1 };
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  return userLevel >= requiredLevel;
}

// Mock data store (in production, this would be a database)
let users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'moderator' },
  { id: 5, name: 'Eve Wilson', email: 'eve@example.com', role: 'user' },
];

let nextId = 6;

/**
 * GET /api/users
 * Retrieve all users with pagination and filtering support
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - role: Filter by role (optional)
 * - search: Search by name or email (optional)
 */
export async function GET(req: Request) {
  // Require authentication to view user list
  const auth = checkAuth(req);
  if (!auth.authorized) {
    return sendError(
      'Unauthorized. Valid authentication required.',
      ERROR_CODES.UNAUTHORIZED,
      401
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return sendError(
        'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.',
        ERROR_CODES.INVALID_PAGINATION,
        400
      );
    }

    // Filter users based on query parameters
    let filteredUsers = [...users];

    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return sendSuccess(
      {
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      'Users fetched successfully'
    );
  } catch (error) {
    return sendError(
      'Failed to fetch users',
      ERROR_CODES.INTERNAL_ERROR,
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * POST /api/users
 * Create a new user
 * Body: { name: string, email: string, role?: string }
 */
export async function POST(req: Request) {
  // Require admin permission to create users
  const auth = checkAuth(req);
  if (!auth.authorized) {
    return sendError(
      'Unauthorized. Authentication required.',
      ERROR_CODES.UNAUTHORIZED,
      401
    );
  }
  
  if (!auth.user || !checkPermission(auth.user.role, 'admin')) {
    return sendError(
      'Forbidden. Admin permission required.',
      ERROR_CODES.INSUFFICIENT_PERMISSIONS,
      403
    );
  }

  try {
    const body = await req.json();

    // Validate input with Zod schema
    const data = userCreateSchema.parse(body);

    // Check for duplicate email
    if (users.some((user) => user.email === data.email)) {
      return sendError(
        'User with this email already exists',
        ERROR_CODES.EMAIL_ALREADY_EXISTS,
        409
      );
    }

    const newUser = {
      id: nextId++,
      name: data.name,
      email: data.email,
      role: data.role,
      ...(data.age && { age: data.age }),
    };

    users.push(newUser);

    return sendSuccess({ user: newUser }, 'User created successfully', 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(error);
    }
    return sendError(
      'Failed to create user',
      ERROR_CODES.INTERNAL_ERROR,
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * PUT /api/users
 * Update an existing user
 * Body: { id: number, name?: string, email?: string, role?: string }
 */
export async function PUT(req: Request) {
  // Require authentication
  const auth = checkAuth(req);
  if (!auth.authorized) {
    return sendError(
      'Unauthorized. Authentication required.',
      ERROR_CODES.UNAUTHORIZED,
      401
    );
  }

  try {
    const body = await req.json();

    // Validate input with Zod schema
    const data = userUpdateSchema.parse(body);

    // Users can only update their own profile unless they're admin
    if (auth.user && data.id !== auth.user.id && !checkPermission(auth.user.role, 'admin')) {
      return sendError(
        'Forbidden. You can only update your own profile.',
        ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        403
      );
    }

    // Find user index
    const userIndex = users.findIndex((user) => user.id === data.id);

    if (userIndex === -1) {
      return sendError('User not found', ERROR_CODES.USER_NOT_FOUND, 404);
    }

    // Check for duplicate email (excluding current user)
    if (data.email && users.some((user) => user.email === data.email && user.id !== data.id)) {
      return sendError(
        'Email already in use by another user',
        ERROR_CODES.EMAIL_ALREADY_EXISTS,
        409
      );
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.role && { role: data.role }),
      ...(data.age && { age: data.age }),
    };

    return sendSuccess({ user: users[userIndex] }, 'User updated successfully');
  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(error);
    }
    return sendError(
      'Failed to update user',
      ERROR_CODES.INTERNAL_ERROR,
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * DELETE /api/users
 * Delete a user
 * Body: { id: number }
 */
export async function DELETE(req: Request) {
  // Require admin permission to delete users
  const auth = checkAuth(req);
  if (!auth.authorized) {
    return sendError(
      'Unauthorized. Authentication required.',
      ERROR_CODES.UNAUTHORIZED,
      401
    );
  }
  
  if (!auth.user || !checkPermission(auth.user.role, 'admin')) {
    return sendError(
      'Forbidden. Admin permission required.',
      ERROR_CODES.INSUFFICIENT_PERMISSIONS,
      403
    );
  }

  try {
    const body = await req.json();

    // Validate input with Zod schema
    const data = userDeleteSchema.parse(body);

    // Find user index
    const userIndex = users.findIndex((user) => user.id === data.id);

    if (userIndex === -1) {
      return sendError('User not found', ERROR_CODES.USER_NOT_FOUND, 404);
    }

    // Remove user
    const deletedUser = users.splice(userIndex, 1)[0];

    return sendSuccess({ user: deletedUser }, 'User deleted successfully');
  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(error);
    }
    return sendError(
      'Failed to delete user',
      ERROR_CODES.INTERNAL_ERROR,
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
