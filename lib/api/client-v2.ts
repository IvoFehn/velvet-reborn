// New Zalando-compliant API Client
import { ApiResponse, ApiError } from './types';

// Zalando-compliant response format
interface ZalandoApiResponse<T = any> {
  data?: T;
  meta?: {
    timestamp: string;
    version: string;
    pagination?: {
      total: number;
      page: number;
      size: number;
      hasMore: boolean;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      issue: string;
    }>;
    instance: string;
    timestamp: string;
  };
}

class ZalandoApiClient {
  private baseURL = '/api';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ZalandoApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error?.message || `HTTP ${response.status}`,
          response.status,
          data.error?.code
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  // Profile API
  profile = {
    // Get current user profile
    getMe: (signal?: AbortSignal) => 
      this.request<any>('/profiles/me', { signal }),

    // Update current user profile
    updateMe: (data: any, signal?: AbortSignal) => 
      this.request<any>('/profiles/me', {
        method: 'PUT',
        body: JSON.stringify(data),
        signal
      }),

    // Get profile inventory
    getInventory: (signal?: AbortSignal) => 
      this.request<any[]>('/profiles/me/inventory', { signal }),

    // Use inventory item
    useInventoryItem: (itemId: string, signal?: AbortSignal) => 
      this.request<any>(`/profiles/me/inventory/${itemId}`, {
        method: 'PUT',
        signal
      }),

    // Get profile stats
    getStats: (signal?: AbortSignal) => 
      this.request<any>('/profiles/me/stats', { signal }),
  };

  // Sanctions API
  sanctions = {
    // List sanctions with filters
    list: (params?: {
      status?: string;
      category?: string;
      severity?: number;
      page?: number;
      size?: number;
    }, signal?: AbortSignal) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return this.request<any[]>(`/sanctions${query ? `?${query}` : ''}`, { signal });
    },

    // Create sanction (random or custom)
    create: (data: {
      type: 'random' | 'custom';
      severity?: number;
      template?: any;
      reason?: string;
      deadlineDays?: number;
    }, signal?: AbortSignal) => 
      this.request<any>('/sanctions', {
        method: 'POST',
        body: JSON.stringify(data),
        signal
      }),

    // Get specific sanction
    get: (id: string, signal?: AbortSignal) => 
      this.request<any>(`/sanctions/${id}`, { signal }),

    // Update sanction
    update: (id: string, data: any, signal?: AbortSignal) => 
      this.request<any>(`/sanctions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        signal
      }),

    // Delete sanction
    delete: (id: string, signal?: AbortSignal) => 
      this.request<void>(`/sanctions/${id}`, {
        method: 'DELETE',
        signal
      }),

    // Complete sanction
    complete: (id: string, signal?: AbortSignal) => 
      this.request<any>(`/sanctions/${id}/complete`, {
        method: 'POST',
        signal
      }),

    // Bulk complete sanctions
    bulkComplete: (sanctionIds?: string[], signal?: AbortSignal) => 
      this.request<{ completed: number; matched: number }>('/sanctions/bulk-complete', {
        method: 'POST',
        body: JSON.stringify({ sanctionIds }),
        signal
      }),

    // Escalate sanction
    escalate: (id: string, signal?: AbortSignal) => 
      this.request<any>(`/sanctions/${id}/escalate`, {
        method: 'POST',
        signal
      }),

    // Check sanctions for escalation
    check: (signal?: AbortSignal) => 
      this.request<{ escalatedCount: number }>('/sanctions/check', {
        method: 'POST',
        signal
      }),
  };

  // Events API
  events = {
    // List events
    list: (params?: {
      active?: boolean;
      type?: string;
      from?: string;
      to?: string;
      page?: number;
      size?: number;
    }, signal?: AbortSignal) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return this.request<any[]>(`/events${query ? `?${query}` : ''}`, { signal });
    },

    // Create event
    create: (data: {
      title: string;
      description: string;
      startDate: string;
      endDate: string;
      type: string;
      isActive?: boolean;
    }, signal?: AbortSignal) => 
      this.request<any>('/events', {
        method: 'POST',
        body: JSON.stringify(data),
        signal
      }),

    // Get specific event
    get: (id: string, signal?: AbortSignal) => 
      this.request<any>(`/events/${id}`, { signal }),

    // Update event
    update: (id: string, data: any, signal?: AbortSignal) => 
      this.request<any>(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        signal
      }),

    // Delete event
    delete: (id: string, signal?: AbortSignal) => 
      this.request<void>(`/events/${id}`, {
        method: 'DELETE',
        signal
      }),
  };

  // Tasks API
  tasks = {
    // List tasks
    list: (params?: {
      completed?: boolean;
      type?: string;
      difficulty?: number;
      date?: string;
      page?: number;
      size?: number;
    }, signal?: AbortSignal) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return this.request<any[]>(`/tasks${query ? `?${query}` : ''}`, { signal });
    },

    // Create task
    create: (data: {
      title: string;
      description: string;
      difficulty: number;
      type?: string;
      goldReward?: number;
      expReward?: number;
    }, signal?: AbortSignal) => 
      this.request<any>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
        signal
      }),

    // Get specific task
    get: (id: string, signal?: AbortSignal) => 
      this.request<any>(`/tasks/${id}`, { signal }),

    // Update task
    update: (id: string, data: any, signal?: AbortSignal) => 
      this.request<any>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        signal
      }),

    // Delete task
    delete: (id: string, signal?: AbortSignal) => 
      this.request<void>(`/tasks/${id}`, {
        method: 'DELETE',
        signal
      }),

    // Complete/toggle task
    complete: (id: string, signal?: AbortSignal) => 
      this.request<any>(`/tasks/${id}/complete`, {
        method: 'POST',
        signal
      }),
  };

  // Profile Actions
  profileActions = {
    // Daily login
    dailyLogin: (signal?: AbortSignal) => 
      this.request<any>('/profiles/me/daily-login', {
        method: 'POST',
        signal
      }),

    // Open lootbox
    openLootbox: (lootboxId: string, signal?: AbortSignal) => 
      this.request<any>('/profiles/me/lootbox', {
        method: 'POST',
        body: JSON.stringify({ lootboxId }),
        signal
      }),

    // Spin wheel
    spin: (signal?: AbortSignal) => 
      this.request<any>('/profiles/me/spin', {
        method: 'POST',
        signal
      }),
  };

  // Shopping
  shop = {
    // Get shop items
    getItems: (signal?: AbortSignal) => 
      this.request<any[]>('/shop/items', { signal }),

    // Purchase item
    purchase: (data: {
      itemId: string;
      quantity?: number;
    }, signal?: AbortSignal) => 
      this.request<any>('/shop/purchase', {
        method: 'POST',
        body: JSON.stringify(data),
        signal
      }),
  };

  // System Actions
  mood = {
    // Get current mood
    getCurrent: (signal?: AbortSignal) => 
      this.request<any>('/mood/current', { signal }),

    // Submit mood
    submit: (data: {
      level: number;
      note?: string;
    }, signal?: AbortSignal) => 
      this.request<any>('/mood/submit', {
        method: 'POST',
        body: JSON.stringify(data),
        signal
      }),

    // Reset mood (admin)
    reset: (signal?: AbortSignal) => 
      this.request<any>('/mood/reset', {
        method: 'POST',
        signal
      }),
  };
}

// Export singleton instance
export const zalandoApiClient = new ZalandoApiClient();
export { ZalandoApiClient, ApiError };
export type { ZalandoApiResponse };