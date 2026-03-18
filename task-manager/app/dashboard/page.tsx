"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TaskForm from "@/app/components/TaskForm";
import TaskList from "@/app/components/TaskList";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [messageError, setMessageError] = useState("");

  // Verify authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify");
        if (!response.ok) {
          // Not authenticated, redirect to login
          router.push("/login");
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [router]);

  const handleCreateTask = async (data: {
    title: string;
    description: string;
    status: string;
  }) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create task");
      }

      setShowNewTaskForm(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      setMessageError(error.message);
      setTimeout(() => setMessageError(""), 5000);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear cookies by calling a logout endpoint (if needed)
      // For now, just redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Message */}
        {messageError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {messageError}
          </div>
        )}

        {/* Success Message */}
        {showNewTaskForm === false && refreshKey > 0 && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Task created successfully!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            {showNewTaskForm ? (
              <>
                <h2 className="text-xl font-bold mb-4">Create New Task</h2>
                <TaskForm
                  onSubmit={handleCreateTask}
                  buttonText="Create Task"
                />
                <button
                  onClick={() => setShowNewTaskForm(false)}
                  className="w-full mt-4 px-4 py-2 border rounded hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowNewTaskForm(true)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                + New Task
              </button>
            )}
          </div>

          {/* Right Column - Task List and Filters */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Your Tasks</h2>

            {/* Filters */}
            <div className="mb-6 space-y-3">
              <div>
                <label htmlFor="search" className="block text-sm font-medium mb-1">
                  Search
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by title..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-1">
                  Filter by Status
                </label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Task List */}
            <TaskList
              key={refreshKey}
              filters={filters}
              onTaskDeleted={() => setRefreshKey((prev) => prev + 1)}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
