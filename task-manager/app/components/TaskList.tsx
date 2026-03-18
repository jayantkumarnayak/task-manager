"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
  updatedAt: string;
}

interface TaskListProps {
  filters?: {
    status?: string;
    search?: string;
  };
  onTaskDeleted?: () => void;
}

export default function TaskList({ filters, onTaskDeleted }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  });

  const fetchTasks = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "10");

      if (filters?.status) {
        params.set("status", filters.status);
      }
      if (filters?.search) {
        params.set("search", filters.search);
      }

      const response = await fetch(`/api/tasks?${params}`);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please login to view tasks");
        }
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [filters?.status, filters?.search]);

  useEffect(() => {
    fetchTasks();
  }, [page, filters?.status, filters?.search]);

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks(tasks.filter((t) => t._id !== taskId));
      onTaskDeleted?.();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && tasks.length === 0) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks found. Create one to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="p-4 bg-white border rounded-lg hover:shadow-md transition"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
              {task.description && (
                <p className="text-gray-600 text-sm mt-1">{task.description}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace("-", " ")}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/dashboard/tasks/${task._id}/edit`}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(task._id)}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
