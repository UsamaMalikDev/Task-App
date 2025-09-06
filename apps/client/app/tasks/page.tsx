"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAppSelector } from "../store/hooks";
import { useAppDispatch } from "../store/hooks";
import { TaskApi } from "../lib/task.api";
import { 
  Task, 
  TaskStatus, 
  TaskQueryParams, 
  TaskScope,
  CreateTaskPayload,
  UpdateTaskPayload,
  BulkUpdateTaskPayload,
  AuthShape
} from "../types";
import { checkError, getAuthCookie, removeAuthCookie } from "../utils/helpers";
import { useApiOperation } from "../hooks/useApiOperations";
import { setPersistedAuthData } from "../store/actions";
import { removeAuthUser } from "../store/slice/auth.slice";
import { removeProfile } from "../store/slice/profile.slice";

// Components
import TaskFilters from "./components/TaskFilters";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import BulkActions from "./components/BulkActions";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";
import EmptyState from "./components/EmptyState";
import Pagination from "./components/Pagination";

const TasksPage = () => {
  const user = useAppSelector((state) => state.profile);
  const dispatch = useAppDispatch();
  const { startApiOperation, terminateApiOperation } = useApiOperation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 3,
  });

  const [scope, setScope] = useState<TaskScope>('my');
  const [filters, setFilters] = useState<TaskQueryParams>({
    limit: 25,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const loadTasks = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      let userId = user?._id;
      if (!userId) {
        const authData = getAuthCookie();
        userId = authData?.user?._id;
      }

      if (!userId) {
        setTasks([]);
        setLoading(false);
        return;
      }

      const queryParams: TaskQueryParams = {
        ...filters,
        limit: pagination.itemsPerPage,
        page: page,
        // Only filter by createdBy when scope is 'my', otherwise show all accessible tasks
        ...(scope === 'my' ? { createdBy: userId } : {}),
      };

      const response = await TaskApi.getTasks(queryParams);
      console.log("🚀 ~ loadTasks ~ response:", response);
      
      const error = checkError([response]);

      if (error) {
        setError(typeof error === "string" ? error : "Failed to load tasks");
        return;
      }

      // Handle different response formats and ensure we have valid data
      const tasks = response?.tasks || [];
      const totalPages = response?.totalPages || 1;
      const total = response?.total || tasks.length;
      
      setTasks(tasks);
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
      }));
    } catch {
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters, scope, user?._id, pagination.itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    loadTasks(page);
  }, [loadTasks]);

  const createTask = async (payload: CreateTaskPayload) => {
    try {
      startApiOperation();
      
      let userId = user?._id;
      if (!userId) {
        const authData = getAuthCookie();
        userId = authData?.user?._id;
      }
      
      if (!userId) {
        terminateApiOperation(["User not authenticated. Please refresh the page."]);
        return;
      }
      
      const taskPayload = {
        ...payload,
        createdBy: userId,
      };
      
      const response = await TaskApi.createTask(taskPayload);
      const error = checkError([response]);

      if (error) {
        terminateApiOperation([typeof error === "string" ? error : "Failed to create task"]);
        return;
      }

      setShowCreateForm(false);
      terminateApiOperation();
      loadTasks(pagination.currentPage);
    } catch {
      terminateApiOperation(["Failed to create task. Please try again."]);
    }
  };

  // Update task
  const updateTask = async (taskId: string, payload: UpdateTaskPayload) => {
    try {
      startApiOperation();
      const response = await TaskApi.updateTask(taskId, payload);
      const error = checkError([response]);

      if (error) {
        terminateApiOperation([typeof error === "string" ? error : "Failed to update task"]);
        return;
      }

      setEditingTask(null);
      terminateApiOperation();
      
      loadTasks(pagination.currentPage);
    } catch (error: any) {
      console.error('Update task error:', error);
      
      // Handle RBAC-specific errors
      if (error?.response?.data?.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes('User can only access tasks they created')) {
          terminateApiOperation(["You can only update tasks that you created."]);
        } else if (errorMessage.includes('Manager can only access tasks within their organization')) {
          terminateApiOperation(["You can only update tasks within your organization."]);
        } else if (errorMessage.includes('Access denied')) {
          terminateApiOperation(["You don't have permission to update this task."]);
        } else {
          terminateApiOperation([errorMessage]);
        }
      } else {
        terminateApiOperation(["Failed to update task. Please try again."]);
      }
    }
  };

  const bulkUpdateTasks = async (payload: BulkUpdateTaskPayload) => {
    try {
      startApiOperation();
      const fullPayload = { ...payload, taskIds: selectedTasks };
      const response = await TaskApi.bulkUpdateTasks(fullPayload);
      const error = checkError([response]);

      if (error) {
        terminateApiOperation([typeof error === "string" ? error : "Failed to update tasks"]);
        return;
      }

      setSelectedTasks([]);
      terminateApiOperation();
      
      loadTasks(pagination.currentPage);
    } catch {
      terminateApiOperation(["Failed to update tasks. Please try again."]);
    }
  };

  const deleteTask = async (taskId: string) => {
    console.log('deleteTask function called with taskId:', taskId);
    try {
      startApiOperation();
      
      console.log('Calling TaskApi.deleteTask...');
      // Call the delete API to permanently delete the task
      await TaskApi.deleteTask(taskId);
      
      console.log('Task deleted successfully');
      terminateApiOperation();
      
      // Refresh the current page to ensure consistency
      loadTasks(pagination.currentPage);
    } catch (error: any) {
      console.error('Delete task error:', error);
      
      // Handle RBAC-specific errors
      if (error?.response?.data?.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes('User can only access tasks they created')) {
          terminateApiOperation(["You can only delete tasks that you created."]);
        } else if (errorMessage.includes('Manager can only access tasks within their organization')) {
          terminateApiOperation(["You can only delete tasks within your organization."]);
        } else if (errorMessage.includes('Access denied')) {
          terminateApiOperation(["You don't have permission to delete this task."]);
        } else {
          terminateApiOperation([errorMessage]);
        }
      } else {
        terminateApiOperation(["Failed to delete task. Please try again."]);
      }
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<TaskQueryParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle scope change
  const handleScopeChange = (newScope: TaskScope) => {
    setScope(newScope);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle task selection
  const handleTaskSelect = (taskId: string, selected: boolean) => {
    setSelectedTasks(prev => 
      selected 
        ? [...prev, taskId]
        : prev.filter(id => id !== taskId)
    );
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    setSelectedTasks(selected ? tasks.map(task => task._id) : []);
  };

  // Handle logout
  const handleLogout = () => {
    try {
      // Clear cookies
      removeAuthCookie();
      
      // Clear Redux state
      dispatch(removeAuthUser());
      dispatch(removeProfile());
      
      // Clear localStorage (if any)
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      
      // Close dropdown
      setShowUserDropdown(false);
      
      // Redirect to login page
      window.location.href = '/sign-up';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load user data from cookies if not available in Redux
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // If user data is not available in Redux, try to get it from cookies
        if (!user?._id) {
          const authData = getAuthCookie();
          if (authData?.user?._id) {
            // Dispatch the auth data to Redux
            dispatch(setPersistedAuthData(authData));
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    loadUserData();
  }, [dispatch, user?._id]);

  // Load tasks when filters or scope change
  useEffect(() => {
    loadTasks(pagination.currentPage);
  }, [loadTasks, pagination.currentPage]);

  // Memoized values
  const selectedTasksCount = selectedTasks.length;
  const allTasksSelected = tasks.length > 0 && selectedTasks.length === tasks.length;
  const someTasksSelected = selectedTasks.length > 0 && selectedTasks.length < tasks.length;

  // Show loading only briefly
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (error && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorMessage 
            message={error} 
            onRetry={() => loadTasks(true)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
                <p className="text-gray-600 mt-1">
                  Manage your tasks and stay organized
                </p>
              </div>
              {(() => {
                // Get user data from Redux or cookies
                const displayUser = user?._id ? user : getAuthCookie()?.user;
                return displayUser?._id && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center space-x-3 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {displayUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{displayUser?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{displayUser?.email}</p>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          showUserDropdown ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        <div className="py-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          >
                            <svg
                              className="w-4 h-4 mr-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <TaskFilters
          scope={scope}
          filters={filters}
          onScopeChange={handleScopeChange}
          onFilterChange={handleFilterChange}
        />

        {/* Bulk Actions */}
        {selectedTasksCount > 0 && (
          <BulkActions
            selectedCount={selectedTasksCount}
            onBulkUpdate={bulkUpdateTasks}
            onClearSelection={() => setSelectedTasks([])}
          />
        )}

        {/* Task List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading && tasks.length === 0 ? (
            <LoadingSpinner />
          ) : tasks.length === 0 ? (
            <EmptyState 
              scope={scope}
              onCreateTask={() => setShowCreateForm(true)}
            />
          ) : (
            <>
              <TaskList
                tasks={tasks}
                selectedTasks={selectedTasks}
                allTasksSelected={allTasksSelected}
                someTasksSelected={someTasksSelected}
                onTaskSelect={handleTaskSelect}
                onSelectAll={handleSelectAll}
                onEditTask={setEditingTask}
                onDeleteTask={deleteTask}
                loading={loading}
              />
              
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                hasNextPage={pagination.currentPage < pagination.totalPages}
                hasPrevPage={pagination.currentPage > 1}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
              />
            </>
          )}
        </div>

        {/* Create/Edit Task Form */}
        {(showCreateForm || editingTask) && (
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? 
              (payload) => updateTask(editingTask._id, payload) :
              createTask
            }
            onClose={() => {
              setShowCreateForm(false);
              setEditingTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TasksPage;
