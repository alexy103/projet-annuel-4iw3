export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
}

/**
 * Thin wrapper around $fetch that:
 * - targets the backend API base URL + injects the `x-api-key` header
 * - attaches the Bearer access token when the user is authenticated
 * - unwraps the `{ success, data }` envelope returned by the backend
 * - transparently retries once after refreshing the access token on a 401
 */
export function useApi() {
  const config = useRuntimeConfig();

  async function apiFetch<T>(
    path: string,
    options: ApiFetchOptions = {},
    isRetry = false,
  ): Promise<T> {
    const authStore = useAuthStore();

    try {
      const response = await $fetch<ApiSuccess<T>>(path, {
        baseURL: config.public.apiBase,
        method: options.method ?? "GET",
        body: options.body,
        headers: {
          "x-api-key": config.public.apiKey,
          ...(authStore.accessToken
            ? { Authorization: `Bearer ${authStore.accessToken}` }
            : {}),
          ...options.headers,
        },
      });

      return response.data;
    } catch (err: unknown) {
      const fetchError = err as {
        status?: number;
        statusCode?: number;
        data?: { error?: string };
        message?: string;
      };
      const status = fetchError.status ?? fetchError.statusCode;

      if (
        status === 401 &&
        !isRetry &&
        authStore.accessToken &&
        path !== "/auth/refresh"
      ) {
        const refreshed = await authStore.refreshAccessToken();
        if (refreshed) {
          return apiFetch<T>(path, options, true);
        }
      }

      const message =
        fetchError.data?.error ??
        fetchError.message ??
        "Une erreur est survenue";
      throw new ApiError(message, status);
    }
  }

  return { apiFetch };
}
