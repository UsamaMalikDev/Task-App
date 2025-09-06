"use server";
import { cookies } from "next/headers";
import { HTTP_METHODS } from "./constants";
import { HeadersType } from "../types";

const fetchCookieToken = async () => {
  const auth = (await cookies()).get("auth");
  if (!auth) return null;
  const authValue = auth?.value;
  const authObject = JSON.parse(authValue || "{}");
  const backendToken = authObject?.backendTokens?.token;
  return backendToken;
};

const createHeaders = async (contentType: string) => {
  const token = await fetchCookieToken();

  const headers: HeadersType = {
    Authorization: `Bearer ${token}`,
  };

  if (contentType === "application/json") {
    headers["Content-Type"] = contentType;
  }

  return headers;
};

export const sendRequest = async (
  method: HTTP_METHODS,
  path: string,
  data?: any,
  contentType: string = "application/json"
) => {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    console.log("🚀 ~ sendRequest ~ BASE_URL:", BASE_URL)
    const headers = await createHeaders(contentType);

    const requestOptions: RequestInit = {
      method: method,
      headers: headers,
      cache: "no-store",
    };

    if (contentType === "application/json") {
      requestOptions.body = JSON.stringify(data);
    } else {
      requestOptions.body = data;
    }

    const res = await fetch(`${BASE_URL}${path}`, requestOptions);
    const response = await res.json();

    // Check if the response has an error
    if (!res.ok) {
      return { error: response.message || 'Request failed' };
    }

    // Return the response directly since the backend returns the data directly
    return response;
  } catch (error) {
    throw error;
  }
};