import { env } from "@/src/config/env.config";

const API_BASE_URL = env.apiUrl;

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  maxRetries?: number;
}

function prepareBodyAndHeaders(body: any, customHeaders?: HeadersInit): { body: any; headers: HeadersInit } {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (isFormData) {
    const headers = { ...customHeaders };
    // Let browser set the boundary header automatically for multipart/form-data
    if ("Content-Type" in (headers as Record<string, any>)) {
      delete (headers as Record<string, any>)["Content-Type"];
    }
    return { body, headers };
  }

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  return {
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    headers: {
      ...defaultHeaders,
      ...customHeaders,
    },
  };
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, maxRetries = 2, ...restOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const reqHeaders: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  // If running on Next.js server (Server Component / SSR), automatically forward cookies from incoming request
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");
      if (cookieHeader && !reqHeaders["Cookie"]) {
        reqHeaders["Cookie"] = cookieHeader;
      }
      const token = cookieStore.get("accessToken")?.value;
      if (token && !reqHeaders["Authorization"]) {
        reqHeaders["Authorization"] = `Bearer ${token}`;
      }
    } catch {
      // Outside Next.js request context (e.g. build time static generation)
    }
  } else {
    // In browser, attach Bearer token from document.cookie if available
    const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
    if (match && match[1] && !reqHeaders["Authorization"]) {
      reqHeaders["Authorization"] = `Bearer ${decodeURIComponent(match[1])}`;
    }
  }

  const config: RequestInit = {
    headers: reqHeaders,
    credentials: "include",
    ...restOptions,
  };

  let attempts = 0;
  const isGetOrHead = !config.method || config.method === "GET" || config.method === "HEAD";

  while (true) {
    attempts++;
    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized globally: redirect to login if running in browser
      if (response.status === 401 && !endpoint.includes("/auth/")) {
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?returnUrl=${returnUrl}`;
        }
      }

      // Retry on temporary 502/503/504 gateway errors for idempotent requests
      if (isGetOrHead && [502, 503, 504].includes(response.status) && attempts <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, attempts * 500));
        continue;
      }

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
        const err = new Error(errorMessage) as any;
        err.status = response.status;
        throw err;
      }

      return data as T;
    } catch (error: any) {
      // Retry transient network connection failures
      if (isGetOrHead && attempts <= maxRetries && error.name === "TypeError") {
        await new Promise((resolve) => setTimeout(resolve, attempts * 500));
        continue;
      }

      if (!endpoint.includes("/auth/me") && error?.status !== 401) {
        console.error(`API Request to ${endpoint} failed:`, error);
      }
      throw error;
    }
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) => {
    const { body: formattedBody, headers } = prepareBodyAndHeaders(body, options?.headers);
    return request<T>(endpoint, { ...options, method: "POST", body: formattedBody, headers });
  },

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) => {
    const { body: formattedBody, headers } = prepareBodyAndHeaders(body, options?.headers);
    return request<T>(endpoint, { ...options, method: "PUT", body: formattedBody, headers });
  },

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) => {
    const { body: formattedBody, headers } = prepareBodyAndHeaders(body, options?.headers);
    return request<T>(endpoint, { ...options, method: "PATCH", body: formattedBody, headers });
  },

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    }),
};

/**
 * Server-side API client that forwards the session cookie from the incoming
 * Next.js request to the backend. Use this ONLY inside Server Components,
 * Route Handlers, or Server Actions (anywhere `next/headers` is available).
 */
export async function createServerApiClient() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const token = cookieStore.get("accessToken")?.value;
  const serverHeaders: Record<string, string> = { Cookie: cookieHeader };
  if (token) {
    serverHeaders["Authorization"] = `Bearer ${token}`;
  }

  return {
    get: <T>(endpoint: string, options?: RequestOptions) =>
      request<T>(endpoint, {
        cache: options?.cache ?? (options?.next ? undefined : "no-store"),
        ...options,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...serverHeaders,
          ...(options?.headers ?? {}),
        },
      }),

    post: <T>(endpoint: string, body?: any, options?: RequestOptions) => {
      const { body: formattedBody, headers } = prepareBodyAndHeaders(body, {
        ...serverHeaders,
        ...(options?.headers ?? {}),
      });
      return request<T>(endpoint, {
        ...options,
        method: "POST",
        body: formattedBody,
        headers,
      });
    },

    put: <T>(endpoint: string, body?: any, options?: RequestOptions) => {
      const { body: formattedBody, headers } = prepareBodyAndHeaders(body, {
        ...serverHeaders,
        ...(options?.headers ?? {}),
      });
      return request<T>(endpoint, {
        ...options,
        method: "PUT",
        body: formattedBody,
        headers,
      });
    },

    delete: <T>(endpoint: string, options?: RequestOptions) =>
      request<T>(endpoint, {
        ...options,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...serverHeaders,
          ...(options?.headers ?? {}),
        },
      }),
  };
}
