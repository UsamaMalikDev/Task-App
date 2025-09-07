import { HTTP_METHODS } from "./constants";
import { AuthApi } from "../lib/auth.api";

export interface RequestOptions {
  method: HTTP_METHODS;
  path: string;
  data?: any;
  contentType?: string;
}

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

const performTokenRefresh = async (): Promise<any> => {
  try {
    const response = await AuthApi.refreshToken();
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendRequest = async (
  method: HTTP_METHODS,
  path: string,
  data?: any,
  contentType: string = "application/json"
) => {
  
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const fullUrl = `${BASE_URL}${path}`;
    
    const requestOptions: RequestInit = {
      method: method,
      credentials: 'include',
      cache: "no-store",
    };
    if (contentType === "application/json") {
      requestOptions.headers = {
        'Content-Type': 'application/json',
      };
    }

    if (data && (method === HTTP_METHODS.POST || method === HTTP_METHODS.PATCH || method === HTTP_METHODS.PUT)) {
      if (contentType === "application/json") {
        requestOptions.body = JSON.stringify(data);
      } else {
        requestOptions.body = data;
      }
    }
    const response = await fetch(fullUrl, requestOptions);
    const result = await response.json();
    if (!response.ok && response.status === 401 && !path.includes('/auth/')) {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('No userId found, redirecting to login');
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        return { error: 'Authentication required' };
      }
      if (isRefreshing && refreshPromise) {
        console.log('⏳ Waiting for existing refresh to complete...');
        try {
          await refreshPromise;
          // Retry the original request after refresh completes
          const retryResponse = await fetch(fullUrl, requestOptions);
          const retryResult = await retryResponse.json();
          if (retryResponse.ok) return retryResult;
        } catch (error) {
          console.log(' Failed to wait for refresh:', error);
        }
      } else if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = performTokenRefresh();
        
        try {
          const refreshResponse = await refreshPromise;
          if (refreshResponse && !('error' in refreshResponse)) {
            if (refreshResponse.user?._id) localStorage.setItem('userId', refreshResponse.user._id);

            const retryResponse = await fetch(fullUrl, requestOptions);
            const retryResult = await retryResponse.json();
            if (retryResponse.ok) return retryResult;
          } 
        } catch (error) {
          console.log(' Token refresh failed:', error);
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      }
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userId');
        window.location.href = '/';
      }
      return { error: 'Authentication failed' };
    }
    
    if (!response.ok) return { error: result.message || 'Request failed' };
    return result;
  } catch (error) {
    throw error;
  }
};
