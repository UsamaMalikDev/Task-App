import { HTTP_METHODS } from "./constants";

export interface RequestOptions {
  method: HTTP_METHODS;
  path: string;
  data?: any;
  contentType?: string;
}

export const sendRequest = async (
  method: HTTP_METHODS,
  path: string,
  data?: any,
  contentType: string = "application/json"
) => {
  console.log(`🔥 API REQUEST: ${method} ${path}`, data);
  
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const fullUrl = `${BASE_URL}${path}`;
    
    const requestOptions: RequestInit = {
      method: method,
      credentials: 'include', // This is the key for sending cookies
      cache: "no-store",
    };

    // Add headers
    if (contentType === "application/json") {
      requestOptions.headers = {
        'Content-Type': 'application/json',
      };
    }

    // Add body for POST/PATCH/PUT requests
    if (data && (method === HTTP_METHODS.POST || method === HTTP_METHODS.PATCH || method === HTTP_METHODS.PUT)) {
      if (contentType === "application/json") {
        requestOptions.body = JSON.stringify(data);
      } else {
        requestOptions.body = data;
      }
    }

    console.log(`🔥 REQUEST OPTIONS:`, requestOptions);
    console.log(`🔥 FULL URL:`, fullUrl);

    const response = await fetch(fullUrl, requestOptions);
    
    console.log(`🔥 RESPONSE STATUS:`, response.status);
    console.log(`🔥 RESPONSE HEADERS:`, response.headers);
    
    const result = await response.json();
    console.log(`🔥 RESPONSE DATA:`, result);

    // Check if the response has an error
    if (!response.ok) {
      return { error: result.message || 'Request failed' };
    }

    // Return the response directly
    return result;
  } catch (error) {
    console.error(`🔥 REQUEST ERROR:`, error);
    throw error;
  }
};
