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
let projects = [
  {
    id: 1,
    name: 'Startup Discovery Platform',
    description: 'A platform to discover and track innovative startups',
    status: 'active',
    category: 'Web Application',
    budget: 50000,
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    teamSize: 5,
    owner: 'Alice Johnson',
  },
  {
    id: 2,
    name: 'E-commerce API',
    description: 'RESTful API for e-commerce platform',
    status: 'active',
    category: 'API Development',
    budget: 30000,
    startDate: '2026-01-15',
    endDate: '2026-04-15',
    teamSize: 3,
    owner: 'Bob Smith',
  },
  {
    id: 3,
    name: 'Mobile App Redesign',
    description: 'Complete redesign of the mobile application',
    status: 'planning',
    category: 'Mobile Development',
    budget: 75000,
    startDate: '2026-02-01',
    endDate: '2026-08-31',
    teamSize: 7,
    owner: 'Charlie Brown',
  },
  {
    id: 4,
    name: 'Data Analytics Dashboard',
    description: 'Real-time analytics dashboard for business metrics',
    status: 'active',
    category: 'Data Analytics',
    budget: 40000,
    startDate: '2025-12-01',
    endDate: '2026-03-31',
    teamSize: 4,
    owner: 'Diana Prince',
  },
  {
    id: 5,
    name: 'Legacy System Migration',
    description: 'Migrate legacy systems to modern cloud infrastructure',
    status: 'completed',
    category: 'Infrastructure',
    budget: 100000,
    startDate: '2025-09-01',
    endDate: '2025-12-31',
    teamSize: 6,
    owner: 'Eve Wilson',
  },
];

let nextId = 6;

/**
 * GET /api/projects
 * Retrieve all projects with pagination and filtering support
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - status: Filter by status (planning, active, on-hold, completed, cancelled)
 * - category: Filter by category
 * - owner: Filter by owner name
 * - minBudget: Filter by minimum budget
 * - maxBudget: Filter by maximum budget
 * - search: Search in name and description
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
    const category = searchParams.get('category');
    const owner = searchParams.get('owner');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const search = searchParams.get('search');

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return sendError('Invalid pagination parameters', ERROR_CODES.INVALID_PAGINATION, 400,
        { details: 'Page must be >= 1, limit must be between 1 and 100' });
    }

    // Validate status if provided
    const validStatuses = ['planning', 'active', 'on-hold', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return sendError('Invalid status value', ERROR_CODES.INVALID_INPUT, 400,
        { validValues: validStatuses });
    }

    // Validate budget parameters
    if (minBudget && isNaN(Number(minBudget))) {
      return sendError('Invalid minBudget parameter', ERROR_CODES.INVALID_INPUT, 400);
    }
    if (maxBudget && isNaN(Number(maxBudget))) {
      return sendError('Invalid maxBudget parameter', ERROR_CODES.INVALID_INPUT, 400);
    }

    // Filter projects based on query parameters
    let filteredProjects = [...projects];

    if (status) {
      filteredProjects = filteredProjects.filter((project) => project.status === status);
    }

    if (category) {
      filteredProjects = filteredProjects.filter((project) =>
        project.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (owner) {
      filteredProjects = filteredProjects.filter((project) =>
        project.owner.toLowerCase().includes(owner.toLowerCase())
      );
    }

    if (minBudget) {
      filteredProjects = filteredProjects.filter((project) => project.budget >= Number(minBudget));
    }

    if (maxBudget) {
      filteredProjects = filteredProjects.filter((project) => project.budget <= Number(maxBudget));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProjects = filteredProjects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const totalItems = filteredProjects.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    return sendSuccess({
      projects: paginatedProjects,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }, 'Projects retrieved successfully');
  } catch (error) {
    return sendError('Internal server error', ERROR_CODES.INTERNAL_SERVER_ERROR, 500,
      { details: error instanceof Error ? error.message : 'Unknown error' });
  }
}

/**
 * POST /api/projects
 * Create a new project
 * Body: { name: string, description: string, status?: string, category: string, budget: number, startDate: string, endDate?: string, teamSize?: number, owner: string }
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
    if (!data.name || !data.description || !data.category || data.budget === undefined || !data.startDate || !data.owner) {
      return sendError('Missing required fields', ERROR_CODES.MISSING_REQUIRED_FIELD, 400,
        { requiredFields: ['name', 'description', 'category', 'budget', 'startDate', 'owner'] });
    }

    // Validate budget
    if (typeof data.budget !== 'number' || data.budget < 0) {
      return sendError('Budget must be a positive number', ERROR_CODES.INVALID_INPUT, 400);
    }

    // Validate status if provided
    const validStatuses = ['planning', 'active', 'on-hold', 'completed', 'cancelled'];
    if (data.status && !validStatuses.includes(data.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      return sendError('Invalid startDate format', ERROR_CODES.INVALID_INPUT, 400);
    }

    if (data.endDate) {
      const endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        return sendError('Invalid endDate format', ERROR_CODES.INVALID_INPUT, 400);
      }
      if (endDate < startDate) {
        return sendError('endDate cannot be before startDate', ERROR_CODES.INVALID_INPUT, 400);
      }
    }

    // Validate team size
    if (data.teamSize !== undefined && (typeof data.teamSize !== 'number' || data.teamSize < 1)) {
      return sendError('Team size must be a positive number', ERROR_CODES.INVALID_INPUT, 400);
    }

    const newProject = {
      id: nextId++,
      name: data.name,
      description: data.description,
      status: data.status || 'planning',
      category: data.category,
      budget: data.budget,
      startDate: data.startDate,
      endDate: data.endDate || null,
      teamSize: data.teamSize || 1,
      owner: data.owner,
    };

    projects.push(newProject);

    return sendSuccess({ project: newProject }, 'Project created successfully', 201);
  } catch (error) {
    return sendError('Invalid request body', ERROR_CODES.INVALID_REQUEST_BODY, 400,
      { details: error instanceof Error ? error.message : 'Unknown error' });
  }
}

/**
 * PUT /api/projects
 * Update an existing project
 * Body: { id: number, name?: string, description?: string, status?: string, category?: string, budget?: number, startDate?: string, endDate?: string, teamSize?: number, owner?: string }
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
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Find project index
    const projectIndex = projects.findIndex((project) => project.id === data.id);

    if (projectIndex === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Validate budget if provided
    if (data.budget !== undefined && (typeof data.budget !== 'number' || data.budget < 0)) {
      return sendError('Budget must be a positive number', ERROR_CODES.INVALID_INPUT, 400);
    }

    // Validate status if provided
    const validStatuses = ['planning', 'active', 'on-hold', 'completed', 'cancelled'];
    if (data.status && !validStatuses.includes(data.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate dates if provided
    if (data.startDate) {
      const startDate = new Date(data.startDate);
      if (isNaN(startDate.getTime())) {
        return sendError('Invalid startDate format', ERROR_CODES.INVALID_INPUT, 400);
      }
    }

    if (data.endDate) {
      const endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        return sendError('Invalid endDate format', ERROR_CODES.INVALID_INPUT, 400);
      }
    }

    // Validate team size if provided
    if (data.teamSize !== undefined && (typeof data.teamSize !== 'number' || data.teamSize < 1)) {
      return sendError('Team size must be a positive number', ERROR_CODES.INVALID_INPUT, 400);
    }

    // Update project
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.category && { category: data.category }),
      ...(data.budget !== undefined && { budget: data.budget }),
      ...(data.startDate && { startDate: data.startDate }),
      ...(data.endDate !== undefined && { endDate: data.endDate }),
      ...(data.teamSize !== undefined && { teamSize: data.teamSize }),
      ...(data.owner && { owner: data.owner }),
    };

    return sendSuccess({ project: projects[projectIndex] }, 'Project updated successfully');
  } catch (error) {
    return sendError('Invalid request body', ERROR_CODES.INVALID_REQUEST_BODY, 400,
      { details: error instanceof Error ? error.message : 'Unknown error' });
  }
}

/**
 * DELETE /api/projects
 * Delete a project
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
      return sendError('Project ID is required', ERROR_CODES.MISSING_REQUIRED_FIELD, 400,
        { requiredFields: ['id'] });
    }

    // Find project index
    const projectIndex = projects.findIndex((project) => project.id === data.id);

    if (projectIndex === -1) {
      return sendError('Project not found', ERROR_CODES.RESOURCE_NOT_FOUND, 404);
    }

    // Remove project
    const deletedProject = projects.splice(projectIndex, 1)[0];

    return sendSuccess({ project: deletedProject }, 'Project deleted successfully');
  } catch (error) {
    return sendError('Invalid request body', ERROR_CODES.INVALID_REQUEST_BODY, 400,
      { details: error instanceof Error ? error.message : 'Unknown error' });
  }
}
