"use client";
import React from "react";
import { TaskScope, TaskQueryParams } from "../../types";

interface EmptyStateProps {
  scope: TaskScope;
  filters: TaskQueryParams;
  onCreateTask: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ scope, filters, onCreateTask }) => {
  const hasActiveFilters = filters.search || filters.status || filters.priority || filters.isOverdue;

  const getEmptyStateContent = () => {
    if (hasActiveFilters) {
      return {
        title: "No tasks match your filters",
        description: "Try adjusting your search criteria or clear the filters to see all tasks.",
        icon: (
          <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ),
        showCreateButton: false,
      };
    }

    // No filters active - show normal empty state
    if (scope === 'my') {
      return {
        title: "No tasks created by you",
        description: "You haven't created any tasks yet. Create your first task to get started with task management.",
        icon: (
          <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
        showCreateButton: true,
      };
    } else {
      return {
        title: "No tasks in your organizationId",
        description: "Your organizationId doesn't have any tasks yet. Create the first task to get started with task management.",
        icon: (
          <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
        showCreateButton: true,
      };
    }
  };

  const { title, description, icon, showCreateButton } = getEmptyStateContent();

  return (
    <div className="text-center py-16">
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
        {description}
      </p>
      {showCreateButton && (
        <button
          onClick={onCreateTask}
          className="inline-flex items-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Your First Task
        </button>
      )}
    </div>
  );
};

export default EmptyState;
