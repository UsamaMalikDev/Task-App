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
  const [showActions, setShowActions] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<TaskStatus | ''>('');
  const [bulkPriority, setBulkPriority] = useState<TaskPriority | ''>('');

  const handleBulkUpdate = () => {
    const payload: BulkUpdateTaskPayload = {
      taskIds: [], // This will be filled by the parent component
    };

    if (bulkStatus) payload.status = bulkStatus as TaskStatus;
    
    if (bulkPriority) payload.priority = bulkPriority as TaskPriority;
    
    if (bulkStatus || bulkPriority) {
      onBulkUpdate(payload);
      setBulkStatus('');
      setBulkPriority('');
      setShowActions(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
          </span>
          
          {!showActions && (
            <button
              onClick={() => setShowActions(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Bulk Actions
            </button>
          )}
        </div>

        <button
          onClick={onClearSelection}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear Selection
        </button>
      </div>

      {showActions && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-blue-900">Status:</label>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as TaskStatus | '')}
                className="px-3 py-1 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No change</option>
                <option value={TaskStatus.PENDING}>Pending</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.COMPLETED}>Completed</option>
                <option value={TaskStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-blue-900">Priority:</label>
              <select
                value={bulkPriority}
                onChange={(e) => setBulkPriority(e.target.value as TaskPriority | '')}
                className="px-3 py-1 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No change</option>
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.URGENT}>Urgent</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkUpdate}
                disabled={!bulkStatus && !bulkPriority}
                className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Apply Changes
              </button>
              <button
                onClick={() => setShowActions(false)}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;
