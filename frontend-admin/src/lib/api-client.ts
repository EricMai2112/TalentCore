import { env } from "@/src/config/env.config";

const API_BASE_URL = env.apiUrl;

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;

  // Build URL with query parameters if present
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    credentials: "include",
    ...restOptions,
  };

  try {
    const response = await fetch(url, config);
    
    // For DELETE or 204 No Content, check if there is content to parse
    const isNoContent = response.status === 204;
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    let data: any = null;
    if (!isNoContent && isJson) {
      data = await response.json();
    } else if (!isNoContent) {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = data?.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error: any) {
    if (!endpoint.includes("/auth/me")) {
      console.error(`API Request to ${endpoint} failed:`, error);
    }
    throw error;
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: "GET" }),
    
  post: <T>(endpoint: string, body: any, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
    
  put: <T>(endpoint: string, body: any, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body: any, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),
    
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
