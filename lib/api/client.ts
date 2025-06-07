import { ApiResponse, RequestConfig } from './types';

class ApiClient {
  private baseURL = '/api';

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      signal
    } = config;

    // Build URL with query parameters
    let url = `${this.baseURL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal,
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new ApiError(
          error.message || 'Network error occurred',
          0
        );
      }
      
      throw new ApiError('Unknown error occurred', 0);
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params, signal });
  }

  async post<T>(endpoint: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, signal });
  }

  async put<T>(endpoint: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, signal });
  }

  async patch<T>(endpoint: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, signal });
  }

  async delete<T>(endpoint: string, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', signal });
  }
}

// Custom ApiError class
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export { ApiError };
export type { ApiResponse };