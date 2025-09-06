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

const API_REQUESTS = {
  GET_TASKS: {
    path: "/api/tasks",
    method: HTTP_METHODS.GET,
  },
  CREATE_TASK: {
    path: "/api/tasks",
    method: HTTP_METHODS.POST,
  },
  UPDATE_TASK: {
    path: "/api/tasks",
    method: HTTP_METHODS.PATCH,
  },
  BULK_UPDATE_TASKS: {
    path: "/api/tasks/bulk",
    method: HTTP_METHODS.PATCH,
  },
  DELETE_TASK: {
    path: "/api/tasks",
    method: HTTP_METHODS.DELETE,
  },
};

const TaskApi = {
  getTasks: (params: TaskQueryParams = {}): Promise<TaskResponse> => {
    const queryString = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, String(value));
      }
    });

    const url = queryString.toString() 
      ? `${API_REQUESTS.GET_TASKS.path}?${queryString.toString()}`
      : API_REQUESTS.GET_TASKS.path;

    return sendRequest(
      API_REQUESTS.GET_TASKS.method,
      url
    );
  },

  createTask: (payload: CreateTaskPayload): Promise<Task> => {
    return sendRequest(
      API_REQUESTS.CREATE_TASK.method,
      API_REQUESTS.CREATE_TASK.path,
      payload
    );
  },

  updateTask: (taskId: string, payload: UpdateTaskPayload): Promise<Task> => {
    return sendRequest(
      API_REQUESTS.UPDATE_TASK.method,
      `${API_REQUESTS.UPDATE_TASK.path}/${taskId}`,
      payload
    );
  },

  bulkUpdateTasks: (payload: BulkUpdateTaskPayload): Promise<Task[]> => {
    return sendRequest(
      API_REQUESTS.BULK_UPDATE_TASKS.method,
      API_REQUESTS.BULK_UPDATE_TASKS.path,
      payload
    );
  },

  deleteTask: (taskId: string): Promise<{ message: string }> => {
    return sendRequest(
      API_REQUESTS.DELETE_TASK.method,
      `${API_REQUESTS.DELETE_TASK.path}/${taskId}`
    );
  },
};

export { TaskApi };
