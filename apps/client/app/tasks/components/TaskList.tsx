"use client";
import React from "react";
import { Task, TaskStatus, TaskPriority } from "../../types";
import TaskItem from "./TaskItem";
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
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return "bg-red-100 text-red-800";
      case TaskPriority.HIGH:
        return "bg-orange-100 text-orange-800";
      case TaskPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case TaskPriority.LOW:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case TaskStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case TaskStatus.CANCELLED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={allTasksSelected}
            ref={(input) => {
              if (input) input.indeterminate = someTasksSelected && !allTasksSelected;
            }}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="ml-4 flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
            <div className="col-span-5">Task</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>
      </div>

      {/* Task Items */}
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          selected={selectedTasks.includes(task._id)}
          onSelect={(selected) => onTaskSelect(task._id, selected)}
          onEdit={() => onEditTask(task)}
          onDelete={() => onDeleteTask(task._id)}
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

export default TaskList;
