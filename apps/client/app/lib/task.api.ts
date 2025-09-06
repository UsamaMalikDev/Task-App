import { 
  Task, 
  CreateTaskPayload, 
  UpdateTaskPayload, 
  BulkUpdateTaskPayload, 
  TaskQueryParams, 
  TaskResponse 
} from "../types";
import { HTTP_METHODS } from "../utils/constants";
import { sendRequest } from "../utils/request-service";

const TaskApi = {
  getTasks: async (params: TaskQueryParams = {}): Promise<TaskResponse> => {
    const queryString = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, String(value));
      }
    });

    const url = queryString.toString() 
      ? `/api/tasks?${queryString.toString()}`
      : '/api/tasks';

    return sendRequest(HTTP_METHODS.GET, url);
  },

  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    return sendRequest(HTTP_METHODS.POST, "/api/tasks", payload);
  },

  updateTask: async (taskId: string, payload: UpdateTaskPayload): Promise<Task> => {
    return sendRequest(HTTP_METHODS.PATCH, `/api/tasks/${taskId}`, payload);
  },

  bulkUpdateTasks: async (payload: BulkUpdateTaskPayload): Promise<Task[]> => {
    return sendRequest(HTTP_METHODS.PATCH, "/api/tasks/bulk", payload);
  },

  deleteTask: async (taskId: string): Promise<{ message: string }> => {
    return sendRequest(HTTP_METHODS.DELETE, `/api/tasks/${taskId}`);
  },
};

export { TaskApi };
