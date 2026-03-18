import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      minlength: [1, "Title must not be empty"],
      maxlength: [100, "Title must be less than 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description must be less than 500 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
TaskSchema.index({ userId: 1, createdAt: -1 });
TaskSchema.index({ userId: 1, status: 1 });

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default Task;
