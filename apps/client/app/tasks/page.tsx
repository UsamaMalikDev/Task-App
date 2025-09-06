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
import { checkError, getAuthCookie } from "../utils/helpers";
import { useApiOperation } from "../hooks/useApiOperations";
import { setPersistedAuthData } from "../store/actions";
import useLogout from "../hooks/useLogout";
import { useNotification } from "../contexts/NotificationContext";

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
  const handleLogout = useLogout();
  const { addNotification } = useNotification();
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
    itemsPerPage: 15,
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
        const errorMessage = typeof error === "string" ? error : "Failed to create task";
        terminateApiOperation([errorMessage]);
        addNotification({
          type: 'error',
          title: 'Task Creation Failed',
          message: errorMessage,
        });
        return;
      }

      setShowCreateForm(false);
      terminateApiOperation();
      loadTasks(pagination.currentPage);
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Task Created Successfully',
        message: 'Task has been created successfully!',
      });
    } catch (error) {
      const errorMessage = "Failed to create task. Please try again.";
      terminateApiOperation([errorMessage]);
      addNotification({
        type: 'error',
        title: 'Task Creation Failed',
        message: errorMessage,
      });
    }
  };

  // Update task
  const updateTask = async (taskId: string, payload: UpdateTaskPayload) => {
    try {
      startApiOperation();
      const response = await TaskApi.updateTask(taskId, payload);
      const error = checkError([response]);

      if (error) {
        const errorMessage = typeof error === "string" ? error : "Failed to update task";
        terminateApiOperation([errorMessage]);
        addNotification({
          type: 'error',
          title: 'Task Update Failed',
          message: errorMessage,
        });
        return;
      }

      setEditingTask(null);
      terminateApiOperation();
      
      loadTasks(pagination.currentPage);
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Task Updated Successfully',
        message: 'Task has been updated successfully!',
      });
    } catch (error: any) {
      console.error('Update task error:', error);
      
      let errorMessage = "Failed to update task. Please try again.";
      
      // Handle RBAC-specific errors
      if (error?.response?.data?.message) {
        const backendMessage = error.response.data.message;
        if (backendMessage.includes('User can only access tasks they created')) {
          errorMessage = "You can only update tasks that you created.";
        } else if (backendMessage.includes('Manager can only access tasks within their organization')) {
          errorMessage = "You can only update tasks within your organization.";
        } else if (backendMessage.includes('Access denied')) {
          errorMessage = "You don't have permission to update this task.";
        } else {
          errorMessage = backendMessage;
        }
      }
      
      terminateApiOperation([errorMessage]);
      addNotification({
        type: 'error',
        title: 'Task Update Failed',
        message: errorMessage,
      });
    }
  };

  const bulkUpdateTasks = async (payload: BulkUpdateTaskPayload) => {
    try {
      startApiOperation();
      const fullPayload = { ...payload, taskIds: selectedTasks };
      const response = await TaskApi.bulkUpdateTasks(fullPayload);
      const error = checkError([response]);

      if (error) {
        const errorMessage = typeof error === "string" ? error : "Failed to update tasks";
        terminateApiOperation([errorMessage]);
        addNotification({
          type: 'error',
          title: 'Bulk Update Failed',
          message: errorMessage,
        });
        return;
      }

      setSelectedTasks([]);
      terminateApiOperation();
      
      loadTasks(pagination.currentPage);
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Tasks Updated Successfully',
        message: `${selectedTasks.length} tasks have been updated successfully!`,
      });
    } catch (error: any) {
      const errorMessage = "Failed to update tasks. Please try again.";
      terminateApiOperation([errorMessage]);
      addNotification({
        type: 'error',
        title: 'Bulk Update Failed',
        message: errorMessage,
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    console.log('deleteTask function called with taskId:', taskId);
    try {
      startApiOperation();
      
      console.log('Calling TaskApi.deleteTask...');
      // Call the delete API to permanently delete the task
      const response = await TaskApi.deleteTask(taskId);
      console.log('Delete API response:', response);
      
      // Validate the response - check for error property
      const error = checkError([response]);
      if (error) {
        const errorMessage = typeof error === "string" ? error : "Failed to delete task";
        console.error('Delete task validation error:', errorMessage);
        terminateApiOperation([errorMessage]);
        addNotification({
          type: 'error',
          title: 'Task Deletion Failed',
          message: errorMessage,
        });
        return;
      }
      
      // Additional validation: ensure we got a proper response with message
      if (!response || !response.message) {
        console.error('Invalid delete response:', response);
        terminateApiOperation(['Invalid response from server']);
        addNotification({
          type: 'error',
          title: 'Task Deletion Failed',
          message: 'Invalid response from server. Please try again.',
        });
        return;
      }
      
      console.log('Delete operation completed successfully:', response.message);
      
      console.log('Task deleted successfully, refreshing task list...');
      terminateApiOperation();
      
      // Show success notification immediately since backend confirmed deletion
      addNotification({
        type: 'success',
        title: 'Task Deleted Successfully',
        message: 'Task has been deleted successfully!',
      });
      
      // Refresh the current page to ensure consistency
      try {
        await loadTasks(pagination.currentPage);
        console.log('Task list refreshed after deletion');
      } catch (refreshError) {
        console.error('Error refreshing task list after deletion:', refreshError);
        // Don't show error notification for refresh failure, as deletion was successful
      }
    } catch (error: any) {
      console.error('Delete task error:', error);
      
      let errorMessage = "Failed to delete task. Please try again.";
      
      // Handle RBAC-specific errors
      if (error?.response?.data?.message) {
        const backendMessage = error.response.data.message;
        if (backendMessage.includes('User can only access tasks they created')) {
          errorMessage = "You can only delete tasks that you created.";
        } else if (backendMessage.includes('Manager can only access tasks within their organization')) {
          errorMessage = "You can only delete tasks within your organization.";
        } else if (backendMessage.includes('Access denied')) {
          errorMessage = "You don't have permission to delete this task.";
        } else {
          errorMessage = backendMessage;
        }
      }
      
      terminateApiOperation([errorMessage]);
      addNotification({
        type: 'error',
        title: 'Task Deletion Failed',
        message: errorMessage,
      });
    }
  };

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<TaskQueryParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Handle scope change
  const handleScopeChange = useCallback((newScope: TaskScope) => {
    setScope(newScope);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-lg text-slate-600 font-medium">Loading your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (error && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header with Glassmorphism */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Logo/Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                
              <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    Task Manager
                  </h1>
                  <p className="text-slate-600 mt-2 text-lg">
                    Stay organized and boost your productivity
                  </p>
                </div>
              </div>
              
              {/* Right side: Create Button and User Profile */}
              <div className="flex items-center space-x-4">
                {/* Enhanced Create Button */}
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Task</span>
                  </div>
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                {/* User Profile - Rightmost */}
              {(() => {
                const displayUser = user?._id ? user : getAuthCookie()?.user;
                return displayUser?._id && (
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                        className="group flex items-center space-x-4 bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-2 shadow-lg border border-white/30 hover:bg-white/80 transition-all duration-300 hover:scale-105"
                      >
                        <div className="relative">
                          <div className="w-12 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg font-bold">
                        {displayUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-gray-900">{displayUser?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{displayUser?.email}</p>
                    </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-all duration-300 group-hover:text-gray-600 ${
                            showUserDropdown ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Enhanced Dropdown Menu */}
                      {showUserDropdown && (
                        <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 z-50 overflow-hidden">
                          <div className="p-1">
                            
                            <button
                              onClick={() => {
                                setShowUserDropdown(false);
                                handleLogout();
                              }}
                              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-xl m-1"
                            >
                              <svg
                                className="w-5 h-5 mr-3"
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
                              Sign Out
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                );
              })()}
            </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="mb-6">
        <TaskFilters
          scope={scope}
          filters={filters}
          onScopeChange={handleScopeChange}
          onFilterChange={handleFilterChange}
        />
        </div>

        {/* Enhanced Bulk Actions */}
        {selectedTasksCount > 0 && (
          <div className="mb-6 transform animate-in slide-in-from-top duration-300">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200/50">
          <BulkActions
            selectedCount={selectedTasksCount}
            onBulkUpdate={bulkUpdateTasks}
            onClearSelection={() => setSelectedTasks([])}
          />
            </div>
          </div>
        )}

        {/* Enhanced Task List Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {loading && tasks.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="text-slate-600 font-medium">Loading your tasks...</p>
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-12">
            <EmptyState 
              scope={scope}
                filters={filters}
              onCreateTask={() => setShowCreateForm(true)}
            />
            </div>
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
              
              <div className="border-t border-gray-100 bg-gray-50/50 p-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                hasNextPage={pagination.currentPage < pagination.totalPages}
                hasPrevPage={pagination.currentPage > 1}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
              />
              </div>
            </>
          )}
        </div>

        {/* Create/Edit Task Form Modal */}
        {(showCreateForm || editingTask) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setShowCreateForm(true)}
        className="fixed bottom-8 right-8 lg:hidden w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-40"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
};

export default TasksPage;