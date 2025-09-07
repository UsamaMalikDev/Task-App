"use client";
import React, { useState } from "react";
import { Task, TaskStatus, TaskPriority } from "../../types";

interface TaskItemProps {
  task: Task;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  getPriorityColor: (priority: TaskPriority) => string;
  getStatusColor: (status: TaskStatus) => string;
  formatDate: (dateString: string) => string;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  selected,
  onSelect,
  onEdit,
  onDelete,
  getPriorityColor,
  getStatusColor,
  formatDate,
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
        task.isOverdue ? 'bg-red-50 border-l-4 border-red-400' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        
        <div className="ml-4 flex-1 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-5">
            <div className="flex items-start space-x-3">
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-medium ${
                  task.status === TaskStatus.COMPLETED ? 'line-through text-gray-500' : 'text-gray-900'
                }`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {task.description}
                  </p>
                )}
                {task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="col-span-2">
            <select
              value={task.status}
              className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(task.status)}`}
            >
              <option value={TaskStatus.PENDING}>Pending</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.COMPLETED}>Completed</option>
              <option value={TaskStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>

          {/* Priority */}
          <div className="col-span-2">
            <select
              value={task.priority}
              className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getPriorityColor(task.priority)}`}
            >
              <option value={TaskPriority.LOW}>Low</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.HIGH}>High</option>
              <option value={TaskPriority.URGENT}>Urgent</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="col-span-2">
            <div className="text-sm">
              <div className={`font-medium ${
                task.isOverdue ? 'text-red-600' : 
                new Date(task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) ? 'text-orange-600' :
                'text-gray-900'
              }`}>
                {formatDate(task.dueDate)}
              </div>
              <div className="text-gray-500 text-xs">
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="col-span-1">
            <div className={`flex items-center justify-end space-x-1 ${showActions ? 'opacity-100' : 'opacity-0'} transition-all duration-200`}>
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                title="Edit task"
              >
                <svg className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                title="Delete task"
              >
                <svg className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
