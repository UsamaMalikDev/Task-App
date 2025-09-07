"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "../store/hooks";
import { useAppDispatch } from "../store/hooks";
import { TaskApi } from "../lib/task.api";
import { AuthApi } from "../lib/auth.api";
import {
  Task,
  TaskQueryParams,
  TaskScope,
  CreateTaskPayload,
  UpdateTaskPayload,
  BulkUpdateTaskPayload,
} from "../types";
import { checkError } from "../utils/helpers";
import { useApiOperation } from "../hooks/useApiOperations";
import { setAuthUser } from "../store/slice/auth.slice";
import { selectAuthUser, selectUserRoles } from "../store/selectors/auth.selector";
import { APP_ROLES } from "../utils/constants";
import { useNotification } from "../hooks/useNotification";
import TasksPageHeader from "./components/TaskPageHeader";
import TasksContent from "./components/TaskContent";
import TaskForm from "./components/TaskForm";
import ErrorMessage from "./components/ErrorMessage";

const TasksPage = () => {
  const user = useAppSelector(selectAuthUser);
  const userRoles = useAppSelector(selectUserRoles);
  const dispatch = useAppDispatch();
  const { startApiOperation, terminateApiOperation } = useApiOperation();
  const { addNotification } = useNotification();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [scope, setScope] = useState<TaskScope>('org');
  const [filters, setFilters] = useState<TaskQueryParams>({
    limit: 25,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const loadTasks = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      if (!user?._id) {
        setTasks([]);
        setLoading(false);
        return;
      }

      const queryParams: TaskQueryParams = {
        ...filters,
        limit: pagination.itemsPerPage,
        page: page,
        ...(scope === 'my' ? { createdBy: user._id } : {}),
      };

      const response = await TaskApi.getTasks(queryParams);
      const error = checkError([response]);

      if (error) {
        setError(typeof error === "string" ? error : "Failed to load tasks");
        return;
      }
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

      if (!user?._id) {
        terminateApiOperation(["User not authenticated. Please refresh the page."]);
        return;
      }

      const taskPayload = { ...payload,createdBy: user._id};
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
      addNotification({
        type: 'success',
        title: 'Task Updated Successfully',
        message: 'Task has been updated successfully!',
      });
    } catch (error: any) {
      console.error('Update task error:', error);

      let errorMessage = "Failed to update task. Please try again.";

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
      addNotification({
        type: 'success',
        title: 'Tasks Updated Successfully',
        message: `${selectedTasks.length} tasks have been updated successfully!`,
      });
    } catch (error) {
      const errorMessage = "Failed to update tasks. Please try again.";
      terminateApiOperation([errorMessage]);
      addNotification({ type: 'error', title: 'Bulk Update Failed', message: errorMessage });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      startApiOperation();
      const response = await TaskApi.deleteTask(taskId);
      const error = checkError([response]);
      if (error) {
        const errorMessage = typeof error === "string" ? error : "Failed to delete task";
        terminateApiOperation([errorMessage]);
        addNotification({ type: 'error', title: 'Task Deletion Failed', message: errorMessage});
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
      terminateApiOperation()
      addNotification({
        type: 'success',
        title: 'Task Deleted Successfully',
        message: 'Task has been deleted successfully!',
      });

      try {
        await loadTasks(pagination.currentPage);
      } catch (refreshError) {
        console.error('Error refreshing task list after deletion:', refreshError);
      }
    } catch (error) {
      console.error('Delete task error:', error);

      let errorMessage = "Failed to delete task. Please try again.";
      terminateApiOperation([errorMessage]);
      addNotification({
        type: 'error',
        title: 'Task Deletion Failed',
        message: errorMessage,
      });
    }
  };

  const handleFilterChange = useCallback((newFilters: Partial<TaskQueryParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleScopeChange = useCallback((newScope: TaskScope) => {
    setScope(newScope);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleTaskSelect = (taskId: string, selected: boolean) => {
    setSelectedTasks(prev =>
      selected
        ? [...prev, taskId]
        : prev.filter(id => id !== taskId)
    );
  };

  const handleSelectAll = (selected: boolean) => setSelectedTasks(selected ? tasks.map(task => task._id) : []);
  const handleCreateTask = () => setShowCreateForm(true);
  const handleEditTask = (task: Task) => setEditingTask(task);
  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingTask(null);
  };
  const handleClearSelection = () => setSelectedTasks([]);

  useEffect(() => {
    if (!authLoading && !user?._id) window.location.href = '/';
  }, [authLoading, user?._id]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!user?._id) {
          const response = await AuthApi.getMe();
          if (response?.user?._id) dispatch(setAuthUser(response.user));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    loadUserData();
  }, [dispatch]);

  useEffect(() => {
    loadTasks(pagination.currentPage);
  }, [loadTasks, pagination.currentPage]);

  useEffect(() => {
    if (userRoles && userRoles.length > 0) {
      if (userRoles.includes(APP_ROLES.ADMIN) || userRoles.includes(APP_ROLES.MANAGER)) setScope('org');
      else setScope('my');
    }
  }, [userRoles]);

  const allTasksSelected = tasks.length > 0 && selectedTasks.length === tasks.length;
  const someTasksSelected = selectedTasks.length > 0 && selectedTasks.length < tasks.length;
  if (authLoading) return <p className="mt-6 text-lg text-slate-600 font-medium">Loading your workspace...</p>

  if (error && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorMessage
            message={error}
            onRetry={() => loadTasks(1)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        <TasksPageHeader
          user={user}
          onCreateTask={handleCreateTask}
        />
        <TasksContent
          tasks={tasks}
          loading={loading}
          selectedTasks={selectedTasks}
          allTasksSelected={allTasksSelected}
          someTasksSelected={someTasksSelected}
          scope={scope}
          filters={filters}
          pagination={pagination}
          onScopeChange={handleScopeChange}
          onFilterChange={handleFilterChange}
          onTaskSelect={handleTaskSelect}
          onSelectAll={handleSelectAll}
          onEditTask={handleEditTask}
          onDeleteTask={deleteTask}
          onBulkUpdate={bulkUpdateTasks}
          onClearSelection={handleClearSelection}
          onPageChange={handlePageChange}
          onCreateTask={handleCreateTask}
        />

        {(showCreateForm || editingTask) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <TaskForm
                task={editingTask}
                onSubmit={(payload) => {
                  if (editingTask) return updateTask(editingTask._id, payload as UpdateTaskPayload);
                  return createTask(payload as CreateTaskPayload);
                }}
                onClose={handleCloseForm}
              />

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;