"use client";
import React, { useState } from "react";
import { TaskStatus, TaskPriority, BulkUpdateTaskPayload } from "../../types";

interface BulkActionsProps {
  selectedCount: number;
  onBulkUpdate: (payload: BulkUpdateTaskPayload) => void;
  onClearSelection: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onBulkUpdate,
  onClearSelection,
}) => {
  const [bulkStatus, setBulkStatus] = useState<TaskStatus | "">("");
  const [bulkPriority, setBulkPriority] = useState<TaskPriority | "">("");

  const handleBulkUpdate = () => {
    const payload: BulkUpdateTaskPayload = {
      taskIds: [], 
    };

    if (bulkStatus) payload.status = bulkStatus as TaskStatus;
    if (bulkPriority) payload.priority = bulkPriority as TaskPriority;

    if (bulkStatus || bulkPriority) {
      onBulkUpdate(payload);
      setBulkStatus("");
      setBulkPriority("");
    }
  };

  if (selectedCount === 0) return null; 

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-5 mb-6 transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-800">
          {selectedCount} task{selectedCount !== 1 ? "s" : ""} selected
        </span>
        <button
          onClick={onClearSelection}
          className="text-sm text-red-600 hover:underline font-medium"
        >
          Clear Selection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Status
          </label>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as TaskStatus | "")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No change</option>
            <option value={TaskStatus.PENDING}>Pending</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
            <option value={TaskStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Priority
          </label>
          <select
            value={bulkPriority}
            onChange={(e) =>
              setBulkPriority(e.target.value as TaskPriority | "")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No change</option>
            <option value={TaskPriority.LOW}>Low</option>
            <option value={TaskPriority.MEDIUM}>Medium</option>
            <option value={TaskPriority.HIGH}>High</option>
            <option value={TaskPriority.URGENT}>Urgent</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={handleBulkUpdate}
            disabled={!bulkStatus && !bulkPriority}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Apply
          </button>
          <button
            onClick={onClearSelection}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;
