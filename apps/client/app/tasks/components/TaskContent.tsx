"use client";
import React from "react";
import { Task, TaskQueryParams, TaskScope, BulkUpdateTaskPayload } from "@/app/types";
import TaskFilters from "./TaskFilters";
import TaskList from "./TaskList";
import BulkActions from "./BulkActions";
import EmptyState from "./EmptyState";
import Pagination from "./Pagination";

interface TasksContentProps {
  tasks: Task[];
  loading: boolean;
  selectedTasks: string[];
  allTasksSelected: boolean;
  someTasksSelected: boolean;
  scope: TaskScope;
  filters: TaskQueryParams;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  onScopeChange: (scope: TaskScope) => void;
  onFilterChange: (filters: Partial<TaskQueryParams>) => void;
  onTaskSelect: (taskId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onBulkUpdate: (payload: BulkUpdateTaskPayload) => void;
  onClearSelection: () => void;
  onPageChange: (page: number) => void;
  onCreateTask: () => void;
}

const TasksContent: React.FC<TasksContentProps> = ({
  tasks,
  loading,
  selectedTasks,
  allTasksSelected,
  someTasksSelected,
  scope,
  filters,
  pagination,
  onScopeChange,
  onFilterChange,
  onTaskSelect,
  onSelectAll,
  onEditTask,
  onDeleteTask,
  onBulkUpdate,
  onClearSelection,
  onPageChange,
  onCreateTask,
}) => {
  const selectedTasksCount = selectedTasks.length;

  return (
    <>
      <div className="mb-6">
        <TaskFilters
          scope={scope}
          filters={filters}
          onScopeChange={onScopeChange}
          onFilterChange={onFilterChange}
        />
      </div>

      {selectedTasksCount > 0 && (
        <div className="mb-6 transform animate-in slide-in-from-top duration-300">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200/50">
            <BulkActions
              selectedCount={selectedTasksCount}
              onBulkUpdate={onBulkUpdate}
              onClearSelection={onClearSelection}
            />
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {loading && tasks.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              {/* <p className="text-slate-600 font-medium">Loading your tasks...</p> */}
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12">
            <EmptyState 
              scope={scope}
              filters={filters}
              onCreateTask={onCreateTask}
            />
          </div>
        ) : (
          <>
            <TaskList
              tasks={tasks}
              selectedTasks={selectedTasks}
              allTasksSelected={allTasksSelected}
              someTasksSelected={someTasksSelected}
              onTaskSelect={onTaskSelect}
              onSelectAll={onSelectAll}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              loading={loading}
            />
            
            <div className="border-t border-gray-100 bg-gray-50/50 p-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
                hasNextPage={pagination.currentPage < pagination.totalPages}
                hasPrevPage={pagination.currentPage > 1}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
              />
            </div>
          </>
        )}
      </div>

      <button
        onClick={onCreateTask}
        className="fixed bottom-8 right-8 lg:hidden w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-40"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </>
  );
};

export default TasksContent;