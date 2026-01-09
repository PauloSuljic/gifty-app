const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type ApiRequestOptions = Omit<RequestInit, "body" | "headers" | "method" | "signal"> & {
  token?: string;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

type ApiRequestConfig = ApiRequestOptions & {
  method?: string;
  body?: unknown;
};

const isJsonContent = (response: Response) =>
  response.headers.get("content-type")?.includes("application/json");

const parseSuccess = async <T,>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }

  if (isJsonContent(response)) {
    return response.json() as Promise<T>;
  }

  return (response.text() as unknown) as T;
};

const parseError = async (response: Response): Promise<ApiError> => {
  let details: unknown;
  let message = response.statusText || "Request failed";

  try {
    if (isJsonContent(response)) {
      details = await response.json();
      if (details && typeof details === "object") {
        const record = details as Record<string, unknown>;
        if (typeof record.message === "string") {
          message = record.message;
        } else if (typeof record.error === "string") {
          message = record.error;
        }
      }
    } else {
      const text = await response.text();
      if (text) {
        message = text;
        details = text;
      }
    }
  } catch {
    // Swallow parsing errors and keep the fallback message.
  }

  return new ApiError(response.status, message, details);
};

const normalizeBody = (body: unknown, headers: Headers): BodyInit | undefined => {
  if (body === undefined) {
    return undefined;
  }

  if (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    typeof body === "string"
  ) {
    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
};

export const apiClient = {
  async request<T>(path: string, options: ApiRequestConfig = {}): Promise<T> {
    const { token, headers, body, method, signal, ...init } = options;
    const requestHeaders = new Headers(headers);

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      method: method ?? "GET",
      headers: requestHeaders,
      body: normalizeBody(body, requestHeaders),
      signal,
    });

    if (!response.ok) {
      throw await parseError(response);
    }

    return parseSuccess<T>(response);
  },

  get<T>(path: string, options?: ApiRequestOptions) {
    return apiClient.request<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return apiClient.request<T>(path, { ...options, method: "POST", body });
  },

  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return apiClient.request<T>(path, { ...options, method: "PATCH", body });
  },

  del<T>(path: string, options?: ApiRequestOptions) {
    return apiClient.request<T>(path, { ...options, method: "DELETE" });
  },
};
