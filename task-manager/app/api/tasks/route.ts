import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { verifyAuth } from "@/lib/auth";
import { TaskSchema } from "@/lib/validation";
import { ZodError } from "zod";

/**
 * GET /api/tasks
 * Fetch user's tasks with pagination, filtering, and search
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * - status: pending|in-progress|completed (optional)
 * - search: string (search by title, optional)
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Build filter
    const filter: any = { userId: user.id };

    if (status) {
      if (!["pending", "in-progress", "completed"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }
      filter.status = status;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch tasks and total count
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        tasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task
 * Body: { title: string, description?: string, status?: string }
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = TaskSchema.parse(body);

    // Create task
    const task = await Task.create({
      userId: user.id,
      ...validatedData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Create task error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create task" },
      { status: 500 }
    );
  }
}
