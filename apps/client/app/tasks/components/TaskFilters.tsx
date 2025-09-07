"use client";
import React, { useState, useEffect, useRef } from "react";
import { TaskScope, TaskStatus, TaskPriority, TaskQueryParams } from "../../types";
import { useDebounce } from "../../hooks/useDebounce";
import { useAppSelector } from "../../store/hooks";
import { selectUserRoles } from "../../store/selectors/auth.selector";
import { APP_ROLES } from "../../utils/constants";

interface TaskFiltersProps {
  scope: TaskScope;
  filters: TaskQueryParams;
  onScopeChange: (scope: TaskScope) => void;
  onFilterChange: (filters: Partial<TaskQueryParams>) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  scope,
  filters,
  onScopeChange,
  onFilterChange,
}) => {
  // Get user roles from Redux
  const userRoles = useAppSelector(selectUserRoles);
  
  // Local state for search input
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [isSearching, setIsSearching] = useState(false);
  
  // Use ref to avoid stale closure in useEffect
  const onFilterChangeRef = useRef(onFilterChange);
  onFilterChangeRef.current = onFilterChange;
  
  // Debounce the search input with 500ms delay
  const debouncedSearch = useDebounce(searchInput, 500);

  // Update search filter when debounced value changes
  useEffect(() => {
    if (searchInput !== debouncedSearch) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
    onFilterChangeRef.current({ search: debouncedSearch || undefined });
  }, [debouncedSearch, searchInput]); // Remove onFilterChange from dependencies

  // Update local input when filters change externally
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ 
      status: e.target.value ? e.target.value as TaskStatus : undefined 
    });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ 
      priority: e.target.value ? e.target.value as TaskPriority : undefined 
    });
  };

  const handleOverdueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ 
      isOverdue: e.target.checked ? true : undefined 
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    onFilterChange({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
  };

  const clearFilters = () => {
    // Clear local search input immediately
    setSearchInput('');
    // Clear all filters including search
    onFilterChange({
      search: undefined,
      status: undefined,
      priority: undefined,
      isOverdue: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = searchInput || filters.search || filters.status || filters.priority || filters.isOverdue;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {!userRoles?.includes(APP_ROLES.ADMIN) && !userRoles?.includes(APP_ROLES.MANAGER) && (
              <button
                onClick={() => onScopeChange('my')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  scope === 'my'
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Created Tasks
              </button>
            )}
            <button
              onClick={() => onScopeChange('org')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                scope === 'org'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              All Tasks
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
  type="text"
  placeholder="Search tasks..."
  value={searchInput}
  onChange={handleSearchChange}
  className={`w-full pl-10 pr-4 py-2 border border-2 rounded-lg text-sm 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
    transition-all duration-200 
    ${isSearching ? "bg-blue-50 border-blue-300" : "bg-white border-gray-300"}`}
  style={{ boxSizing: "border-box" }}
/>

          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filters.status || ''}
              onChange={handleStatusChange}
              className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              <option value="">All Status</option>
              <option value={TaskStatus.PENDING}>Pending</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.COMPLETED}>Completed</option>
              <option value={TaskStatus.CANCELLED}>Cancelled</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={filters.priority || ''}
              onChange={handlePriorityChange}
              className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              <option value="">All Priority</option>
              <option value={TaskPriority.LOW}>Low</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.HIGH}>High</option>
              <option value={TaskPriority.URGENT}>Urgent</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={handleSortChange}
              className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="dueDate-asc">Due Date (Earliest)</option>
              <option value="dueDate-desc">Due Date (Latest)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="priority-desc">Priority (High to Low)</option>
              <option value="priority-asc">Priority (Low to High)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Overdue Filter & Clear */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.isOverdue || false}
              onChange={handleOverdueChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded transition-colors"
            />
            <span className="text-sm font-medium text-gray-700 flex items-center">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Overdued
            </span>
          </label>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-red-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
