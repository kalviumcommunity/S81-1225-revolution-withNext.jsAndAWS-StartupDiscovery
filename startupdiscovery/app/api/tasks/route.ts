import { NextResponse } from 'next/server';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';

// Authentication helper
function checkAuth(req: Request): { authorized: boolean; user?: { id: number; role: string } } {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false };
  }
  try {
    const token = authHeader.substring(7);
    const [userId, role] = token.split(':');
    return {
      authorized: true,
      user: { id: parseInt(userId) || 1, role: role || 'user' },
    };
  } catch {
    return { authorized: false };
  }
}

// Mock data store (in production, this would be a database)
let tasks = [
  {
    id: 1,
    title: 'Design API architecture',
    description: 'Create RESTful API design for the project',
    status: 'completed',
    priority: 'high',
    assignedTo: 'Alice Johnson',
    createdAt: '2026-01-01T10:00:00Z',
  },
  {
    id: 2,
    title: 'Implement user authentication',
    description: 'Set up JWT-based authentication system',
    status: 'in-progress',
    priority: 'high',
    assignedTo: 'Bob Smith',
    createdAt: '2026-01-02T14:30:00Z',
  },
  {
    id: 3,
    title: 'Write unit tests',
    description: 'Add test coverage for API endpoints',
    status: 'pending',
    priority: 'medium',
    assignedTo: 'Charlie Brown',
    createdAt: '2026-01-03T09:15:00Z',
  },
  {
    id: 4,
    title: 'Database optimization',
    description: 'Optimize database queries and add indexes',
    status: 'in-progress',
    priority: 'medium',
    assignedTo: 'Diana Prince',
    createdAt: '2026-01-03T16:45:00Z',
  },
  {
    id: 5,
    title: 'Update documentation',
    description: 'Update README and API documentation',
    status: 'pending',
    priority: 'low',
    assignedTo: 'Eve Wilson',
    createdAt: '2026-01-04T11:20:00Z',
  },
];

let nextId = 6;

/**
 * GET /api/tasks
 * Retrieve all tasks with pagination and filtering support
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - status: Filter by status (pending, in-progress, completed)
 * - priority: Filter by priority (low, medium, high)
 * - assignedTo: Filter by assigned person
 * - search: Search in title and description
 */
export async function GET(req: Request) {
  // Require authentication
  const auth = checkAuth(req);
  if (!auth.authorized) {
    return sendError('Authentication required', ERROR_CODES.UNAUTHORIZED, 401);
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const search = searchParams.get('search');

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return sendError('Invalid pagination parameters', ERROR_CODES.INVALID_PAGINATION, 400, 
        { details: 'Page must be >= 1, limit must be between 1 and 100' });
    }

    // Validate status if provided
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return sendError('Invalid status value', ERROR_CODES.INVALID_INPUT, 400,
        { validValues: validStatuses });
    }

    // Validate priority if provided
    const validPriorities = ['low', 'medium', 'high'];
    if (priority && !validPriorities.includes(priority)) {
      return sendError('Invalid priority value', ERROR_CODES.INVALID_INPUT, 400,
        { validValues: validPriorities });
    }

    // Filter tasks based on query parameters
    let filteredTasks = [...tasks];

    if (status) {
      filteredTasks = filteredTasks.filter((task) => task.status === status);
    }

    if (priority) {
      filteredTasks = filteredTasks.filter((task) => task.priority === priority);
    }

    if (assignedTo) {
      filteredTasks = filteredTasks.filter((task) =>
        task.assignedTo.toLowerCase().includes(assignedTo.toLowerCase())
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const totalItems = filteredTasks.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    return sendSuccess({
      tasks: paginatedTasks,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }, 'Tasks retrieved successfully');
  } catch (error) {
    return sendError('Internal server error', ERROR_CODES.INTERNAL_SERVER_ERROR, 500,
      { details: error instanceof Error ? error.message : 'Unknown error' });
  }
}

/**
 * POST /api/tasks
 * Create a new task
 * Body: { title: string, description: string, status?: string, priority?: string, assignedTo?: string }
 */
export async function POST(req: Request) {
  // Require authentication
  const auth = checkAuth(req);
  if (!auth.authorized) {
    return sendError('Authentication required', ERROR_CODES.UNAUTHORIZED, 401);
  }

  try {
    const data = await req.json();

    // Validate required fields
    if (!data.title || !data.description) {
      return sendError('Missing required fields', ERROR_CODES.MISSING_REQUIRED_FIELD, 400,
        { requiredFields: ['title', 'description'] });
    }

    // Validate status if provided
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (data.status && !validStatuses.includes(data.status)) {
      return sendError('Invalid status value', ERROR_CODES.INVALID_INPUT, 400,
        { validValues: validStatuses });
    }

    // Validate priority if provided
    const validPriorities = ['low', 'medium', 'high'];
    if (data.priority && !validPriorities.includes(data.priority)) {
      return sendError('Invalid priority value', ERROR_CODES.INVALID_INPUT, 400,
        { validValues: validPriorities });
    }

    const newTask = {
      id: nextId++,
      title: data.title,
      description: data.description,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      assignedTo: data.assignedTo || 'Unassigned',
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);

    return sendSuccess({ task: newTask }, 'Task created successfully', 201);
  } catch (error) {
    return sendError('Invalid request body', ERROR_CODES.INVALID_REQUEST_BODY, 400,
      { details: error instanceof Error ? error.message : 'Unknown error' });
  }
}

/**
 * PUT /api/tasks
 * Update an existing task
 * Body: { id: number, title?: string, description?: string, status?: string, priority?: string, assignedTo?: string }
 */
export async function PUT(req: Request) {
  // Require authentication
  const auth = checkAuth(req);
  if (!auth.authorized) {
    return sendError('Authentication required', ERROR_CODES.UNAUTHORIZED, 401);
  }

  try {
    const data = await req.json();

    // Validate required ID
    if (!data.id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Find task index
    const taskIndex = tasks.findIndex((task) => task.id === data.id);

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Validate status if provided
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (data.status && !validStatuses.includes(data.status)) {
      return sendError('Invalid status value', ERROR_CODES.INVALID_INPUT, 400,
        { validValues: validStatuses });
    }

    // Validate priority if provided
    const validPriorities = ['low', 'medium', 'high'];
    if (data.priority && !validPriorities.includes(data.priority)) {
      return sendError('Invalid priority value', ERROR_CODES.INVALID_INPUT, 400,
        { validValues: validPriorities });
    }

    // Update task
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      ...(data.assignedTo && { assignedTo: data.assignedTo }),
    };

    return sendSuccess({ task: tasks[taskIndex] }, 'Task updated successfully');
  } catch (error) {
    return sendError('Invalid request body', ERROR_CODES.INVALID_REQUEST_BODY, 400,
      { details: error instanceof Error ? error.message : 'Unknown error' });
  }
}

/**
 * DELETE /api/tasks
 * Delete a task
 * Body: { id: number }
 */
export async function DELETE(req: Request) {
  // Require authentication
  const auth = checkAuth(req);
  if (!auth.authorized) {
    return sendError('Authentication required', ERROR_CODES.UNAUTHORIZED, 401);
  }

  try {
    const data = await req.json();

    // Validate required ID
    if (!data.id) {
      return sendError('Task ID is required', ERROR_CODES.MISSING_REQUIRED_FIELD, 400,
        { requiredFields: ['id'] });
    }

    // Find task index
    const taskIndex = tasks.findIndex((task) => task.id === data.id);

    if (taskIndex === -1) {
      return sendError('Task not found', ERROR_CODES.RESOURCE_NOT_FOUND, 404);
    }

    // Remove task
    const deletedTask = tasks.splice(taskIndex, 1)[0];

    return sendSuccess({ task: deletedTask }, 'Task deleted successfully');
  } catch (error) {
    return sendError('Invalid request body', ERROR_CODES.INVALID_REQUEST_BODY, 400,
      { details: error instanceof Error ? error.message : 'Unknown error' });
  }
}
