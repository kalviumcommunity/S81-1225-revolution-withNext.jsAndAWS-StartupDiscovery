import { NextResponse } from 'next/server';

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
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.' },
        { status: 400 }
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

    return NextResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user
 * Body: { name: string, email: string, role?: string }
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: 'Missing required fields: name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check for duplicate email
    if (users.some((user) => user.email === data.email)) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const newUser = {
      id: nextId++,
      name: data.name,
      email: data.email,
      role: data.role || 'user',
    };

    users.push(newUser);

    return NextResponse.json(
      { success: true, message: 'User created successfully', data: newUser },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

/**
 * PUT /api/users
 * Update an existing user
 * Body: { id: number, name?: string, email?: string, role?: string }
 */
export async function PUT(req: Request) {
  try {
    const data = await req.json();

    // Validate required ID
    if (!data.id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find user index
    const userIndex = users.findIndex((user) => user.id === data.id);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate email if provided
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }

      // Check for duplicate email (excluding current user)
      if (users.some((user) => user.email === data.email && user.id !== data.id)) {
        return NextResponse.json({ error: 'Email already in use by another user' }, { status: 409 });
      }
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.role && { role: data.role }),
    };

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: users[userIndex],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/users
 * Delete a user
 * Body: { id: number }
 */
export async function DELETE(req: Request) {
  try {
    const data = await req.json();

    // Validate required ID
    if (!data.id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find user index
    const userIndex = users.findIndex((user) => user.id === data.id);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove user
    const deletedUser = users.splice(userIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      data: deletedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}
