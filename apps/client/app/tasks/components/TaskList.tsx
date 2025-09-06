"use client";
import React from "react";
import { Task, TaskStatus, TaskPriority } from "../../types";
import LoadingSpinner from "./LoadingSpinner";

interface TaskListProps {
  tasks: Task[];
  selectedTasks: string[];
  allTasksSelected: boolean;
  someTasksSelected: boolean;
  onTaskSelect: (taskId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  loading: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedTasks,
  allTasksSelected,
  someTasksSelected,
  onTaskSelect,
  onSelectAll,
  onEditTask,
  onDeleteTask,
  loading,
}) => {
  const getPriorityConfig = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return {
          bg: "bg-gradient-to-r from-red-500 to-red-600",
          text: "text-white",
          icon: "🔴",
          label: "Urgent"
        };
      case TaskPriority.HIGH:
        return {
          bg: "bg-gradient-to-r from-orange-500 to-red-500",
          text: "text-white",
          icon: "🟠",
          label: "High"
        };
      case TaskPriority.MEDIUM:
        return {
          bg: "bg-gradient-to-r from-yellow-400 to-yellow-500",
          text: "text-white",
          icon: "🟡",
          label: "Medium"
        };
      case TaskPriority.LOW:
        return {
          bg: "bg-gradient-to-r from-green-400 to-green-500",
          text: "text-white",
          icon: "🟢",
          label: "Low"
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-400 to-gray-500",
          text: "text-white",
          icon: "⚪",
          label: "None"
        };
    }
  };

  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return {
          bg: "bg-gradient-to-r from-emerald-500 to-green-600",
          text: "text-white",
          icon: "✅",
          label: "Completed"
        };
      case TaskStatus.IN_PROGRESS:
        return {
          bg: "bg-gradient-to-r from-blue-500 to-indigo-600",
          text: "text-white",
          icon: "🔄",
          label: "In Progress"
        };
      case TaskStatus.PENDING:
        return {
          bg: "bg-gradient-to-r from-amber-400 to-orange-500",
          text: "text-white",
          icon: "⏳",
          label: "Pending"
        };
      case TaskStatus.CANCELLED:
        return {
          bg: "bg-gradient-to-r from-gray-500 to-gray-600",
          text: "text-white",
          icon: "❌",
          label: "Cancelled"
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-400 to-gray-500",
          text: "text-white",
          icon: "⚪",
          label: "Unknown"
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`,
        color: "text-red-600",
        bg: "bg-red-50"
      };
    } else if (diffDays === 0) {
      return {
        text: "Due today",
        color: "text-orange-600",
        bg: "bg-orange-50"
      };
    } else if (diffDays === 1) {
      return {
        text: "Due tomorrow",
        color: "text-yellow-600",
        bg: "bg-yellow-50"
      };
    } else if (diffDays <= 7) {
      return {
        text: `Due in ${diffDays} days`,
        color: "text-blue-600",
        bg: "bg-blue-50"
      };
    } else {
      return {
        text: `Due in ${diffDays} days`,
        color: "text-gray-600",
        bg: "bg-gray-50"
      };
    }
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center">
            <div className="relative">
              <input
                type="checkbox"
                checked={allTasksSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someTasksSelected && !allTasksSelected;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded-md shadow-sm transition-all duration-200"
              />
            </div>
            
            <div className="ml-6 flex-1 grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              <div className="col-span-4 flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Task</span>
              </div>
              <div className="col-span-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Status</span>
              </div>
              <div className="col-span-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Priority</span>
              </div>
              <div className="col-span-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Due Date</span>
              </div>
              <div className="col-span-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                <span>Actions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Task Rows */}
      <div className="divide-y divide-gray-100">
        {tasks.map((task, index) => {
          const statusConfig = getStatusConfig(task.status);
          const priorityConfig = getPriorityConfig(task.priority);
          const dateInfo = formatDate(task.dueDate);
          const isSelected = selectedTasks.includes(task._id);

          return (
            <div
              key={task._id}
              className={`group transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-25 hover:to-indigo-25 ${
                isSelected ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500' : 'hover:shadow-md'
              }`}
            >
              <div className="px-6 py-5">
                <div className="flex items-center">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onTaskSelect(task._id, e.target.checked)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded-md shadow-sm transition-all duration-200"
                    />
                  </div>

                  <div className="ml-6 flex-1 grid grid-cols-12 gap-4 items-center">
                    {/* Task Column */}
                    <div className="col-span-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Column */}
                    <div className="col-span-2">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${statusConfig.bg} ${statusConfig.text}`}>
                          <span className="mr-1.5">{statusConfig.icon}</span>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Priority Column */}
                    <div className="col-span-2">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${priorityConfig.bg} ${priorityConfig.text}`}>
                          <span className="mr-1.5">{priorityConfig.icon}</span>
                          {priorityConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Due Date Column */}
                    <div className="col-span-2">
                      <div className="space-y-1">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${dateInfo.color} ${dateInfo.bg} border`}>
                          {dateInfo.text}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateShort(task.dueDate)}
                        </div>
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="col-span-2 ml-10">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEditTask(task)}
                          className="group/btn inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-white hover:bg-blue-50 hover:text-blue-600 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Edit task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => onDeleteTask(task._id)}
                          className="group/btn inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-white hover:bg-red-50 hover:text-red-600 rounded-lg border border-gray-200 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Delete task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        
                       
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500">Get started by creating your first task.</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;