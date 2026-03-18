import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { verifyAuth } from "@/lib/auth";
import { TaskSchema } from "@/lib/validation";
import { ZodError } from "zod";
import { Types } from "mongoose";

/**
 * GET /api/tasks/[id]
 * Fetch a single task by ID (verify ownership)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate MongoDB ID
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid task ID" },
        { status: 400 }
      );
    }

    // Fetch task and verify ownership
    const task = await Task.findOne({
      _id: id,
      userId: user.id,
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        task,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Get task error:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tasks/[id]
 * Update a task (verify ownership)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate MongoDB ID
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate input (allow partial updates)
    const validatedData = TaskSchema.partial().parse(body);

    // Update task and verify ownership
    const task = await Task.findOneAndUpdate(
      {
        _id: id,
        userId: user.id,
      },
      validatedData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Task updated successfully",
        task,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Update task error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update task" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task (verify ownership)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate MongoDB ID
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid task ID" },
        { status: 400 }
      );
    }

    // Delete task and verify ownership
    const task = await Task.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Task deleted successfully",
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
