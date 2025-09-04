"use client";
import { HTTP_METHODS } from "./constants";
import { getAuthCookie } from "./helpers";

const createClientHeaders = (contentType: string = "application/json") => {
  const authData = getAuthCookie();
  const token = authData?.backendTokens?.token;

  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (contentType === "application/json") {
    headers["Content-Type"] = contentType;
  }

  return headers;
};

export const sendClientRequest = async (
  method: HTTP_METHODS,
  path: string,
  data?: unknown,
  contentType: string = "application/json"
) => {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const fullUrl = `${BASE_URL}${path}`;
    
    console.log("🚀 ~ sendClientRequest ~ BASE_URL:", BASE_URL);
    console.log("🚀 ~ sendClientRequest ~ method:", method);
    console.log("🚀 ~ sendClientRequest ~ path:", path);
    console.log("🚀 ~ sendClientRequest ~ fullUrl:", fullUrl);
    
    const headers = createClientHeaders(contentType);
    console.log("🚀 ~ sendClientRequest ~ headers:", headers);

    const requestOptions: RequestInit = {
      method: method,
      headers: headers,
      cache: "no-store",
    };

    if (data && (method === HTTP_METHODS.POST || method === HTTP_METHODS.PATCH || method === HTTP_METHODS.PUT)) {
      requestOptions.body = JSON.stringify(data);
    }

    console.log("🚀 ~ sendClientRequest ~ requestOptions:", requestOptions);

    const res = await fetch(fullUrl, requestOptions);
    console.log("🚀 ~ sendClientRequest ~ response status:", res.status);
    console.log("🚀 ~ sendClientRequest ~ response headers:", res.headers);
    
    if (!res.ok) {
      console.error("🚀 ~ sendClientRequest ~ response not ok:", res.status, res.statusText);
      const errorText = await res.text();
      console.error("🚀 ~ sendClientRequest ~ error response:", errorText);
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const response = await res.json();
    console.log("🚀 ~ sendClientRequest ~ response:", response);

    // Handle different response formats
    if (response?.result) {
      // Old format with result array
      return response.result.at(0);
    } else if (response?.user && response?.backendTokens) {
      // New format - direct response
      return response;
    } else if (response?.message) {
      // Error response
      return { error: response.message };
    } else {
      // Direct response
      return response;
    }
  } catch (error) {
    console.error("🚀 ~ sendClientRequest ~ error:", error);
    throw error;
  }
};
