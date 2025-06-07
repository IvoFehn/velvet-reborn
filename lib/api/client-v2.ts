// New Zalando-compliant API Client
import { UpdateProfilePayload } from './types';
import type { IProfile } from '../../models/Profile';
import type { IInventoryItem } from '../../models/InventoryItem';
import type { ISanction } from '../../types/index';
import type { IEvent, EventData } from '../../models/Event';
import type { IMood, MoodFeeling, HealthStatus } from '../../models/Mood';

// Additional type definitions for API responses
interface ShopItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

interface SpinReward {
  type: 'gold' | 'exp' | 'keys';
  amount: number;
}

interface LootboxReward {
  type: 'gold' | 'exp' | 'keys';
  amount: number;
}


interface IProfileStats {
  level: number;
  exp: number;
  gold: number;
  keys: number;
  streakCount: number;
  lastLogin?: Date;
}

interface TaskData {
  _id?: string;
  title: string;
  description: string;
  difficulty: number;
  completed?: boolean;
  type?: string;
  goldReward?: number;
  expReward?: number;
  completedAt?: Date;
}



interface BulkCompleteResult {
  completed: number;
  matched: number;
}

interface EscalationResult {
  escalatedCount: number;
}

interface InventoryActionResult {
  message: string;
  itemId: string;
  remainingQuantity: number;
  inventory: IInventoryItem[];
}

interface PurchaseResult {
  purchased: {
    item: string;
    quantity: number;
    totalCost: number;
  };
  profile: {
    gold: number;
    inventory: IInventoryItem[];
  };
}

interface DailyLoginResult {
  message: string;
  rewards?: {
    gold?: number;
    exp?: number;
    keys?: number;
  };
  profile: IProfileStats;
}

interface SpinResult {
  reward: SpinReward;
  cost: number;
  profile: {
    gold: number;
    exp: number;
    keys: number;
  };
}

interface LootboxResult {
  reward: LootboxReward;
  lootbox: string;
  profile: {
    gold: number;
    exp: number;
    keys: number;
  };
}

interface MoodSubmitData {
  level: number;
  note?: string;
}

interface MoodResult {
  feeling: MoodFeeling;
  healthStatus?: HealthStatus;
  createdAt: Date;
}

// ApiError class definition
class ApiError extends Error {
  constructor(public message: string, public status: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Zalando-compliant response format
interface ZalandoApiResponse<T = unknown> {
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

      // Adapter for existing API format with 'success' field
      if ('success' in data) {
        if (!data.success) {
          throw new ApiError(
            data.error?.message || 'API request failed',
            response.status,
            data.error?.code
          );
        }
        // Convert to Zalando format
        return {
          data: data.data,
          meta: data.meta || {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        };
      }

      // Already in Zalando format
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

  // IProfile API - adapted for existing user.ts API
  profile = {
    // Get current user profile
    getMe: (signal?: AbortSignal) => 
      this.request<IProfile>('/user?action=profile', { signal }),

    // Update current user profile
    updateMe: (data: UpdateProfilePayload, signal?: AbortSignal) => 
      this.request<IProfile>('/user?action=profile', {
        method: 'PUT',
        body: JSON.stringify(data),
        signal
      }),

    // Get profile inventory
    getInventory: (signal?: AbortSignal) => 
      this.request<IInventoryItem[]>('/user?action=inventory', { signal }),

    // Use inventory item
    useInventoryItem: (itemId: string, signal?: AbortSignal) => 
      this.request<InventoryActionResult>(`/user?action=inventory&itemId=${itemId}`, {
        method: 'PUT',
        signal
      }),

    // Get profile stats
    getStats: (signal?: AbortSignal) => 
      this.request<IProfileStats>('/user?action=stats', { signal }),
  };

  // ISanctions API
  sanctions = {
    // List sanctions with filters - adapted for content.ts API
    list: (params?: {
      status?: string;
      category?: string;
      severity?: number;
      page?: number;
      size?: number;
    }, signal?: AbortSignal) => {
      const searchParams = new URLSearchParams({ type: 'sanctions' });
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return this.request<ISanction[]>(`/content?${query}`, { signal });
    },

    // Create sanction (random or custom) - adapted for content.ts API
    create: (data: {
      type: 'random' | 'custom';
      severity?: number;
      template?: Partial<ISanction>;
      reason?: string;
      deadlineDays?: number;
    }, signal?: AbortSignal) => 
      this.request<ISanction>('/content?type=sanctions', {
        method: 'POST',
        body: JSON.stringify(data),
        signal
      }),

    // Get specific sanction - adapted for content.ts API
    get: (id: string, signal?: AbortSignal) => 
      this.request<ISanction>(`/content?type=sanctions&id=${id}`, { signal }),

    // Update sanction - adapted for content.ts API
    update: (id: string, data: Partial<ISanction>, signal?: AbortSignal) => 
      this.request<ISanction>(`/content?type=sanctions&id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        signal
      }),

    // Delete sanction - adapted for content.ts API
    delete: (id: string, signal?: AbortSignal) => 
      this.request<void>(`/content?type=sanctions&id=${id}`, {
        method: 'DELETE',
        signal
      }),

    // Complete sanction - adapted for content.ts API
    complete: (id: string, signal?: AbortSignal) => 
      this.request<ISanction>(`/content?type=sanctions&action=complete&id=${id}`, {
        method: 'PUT',
        signal
      }),

    // Bulk complete sanctions - adapted for content.ts API
    bulkComplete: (sanctionIds?: string[], signal?: AbortSignal) => 
      this.request<BulkCompleteResult>('/content?type=sanctions&action=complete-all', {
        method: 'POST',
        body: JSON.stringify({ sanctionIds }),
        signal
      }),

    // Escalate sanction - adapted for content.ts API
    escalate: (id: string, signal?: AbortSignal) => 
      this.request<ISanction>(`/content?type=sanctions&action=escalate&id=${id}`, {
        method: 'PUT',
        signal
      }),

    // Check sanctions for escalation - adapted for content.ts API
    check: (signal?: AbortSignal) => 
      this.request<EscalationResult>('/content?type=sanctions&action=check', {
        method: 'POST',
        signal
      }),
  };

  // Events API - adapted for content.ts API
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
      const searchParams = new URLSearchParams({ type: 'events' });
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return this.request<IEvent[]>(`/content?${query}`, { signal });
    },

    // Create event - adapted for content.ts API
    create: (data: {
      title: string;
      description: string;
      startDate: string;
      endDate: string;
      type: string;
      isActive?: boolean;
    }, signal?: AbortSignal) => 
      this.request<IEvent>('/content?type=events', {
        method: 'POST',
        body: JSON.stringify(data),
        signal
      }),

    // Get specific event - adapted for content.ts API
    get: (id: string, signal?: AbortSignal) => 
      this.request<IEvent>(`/content?type=events&id=${id}`, { signal }),

    // Update event - adapted for content.ts API
    update: (id: string, data: Partial<EventData>, signal?: AbortSignal) => 
      this.request<IEvent>(`/content?type=events&id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        signal
      }),

    // Delete event - adapted for content.ts API
    delete: (id: string, signal?: AbortSignal) => 
      this.request<void>(`/content?type=events&id=${id}`, {
        method: 'DELETE',
        signal
      }),
  };

  // Tasks API - adapted for content.ts API
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
      const searchParams = new URLSearchParams({ type: 'tasks' });
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return this.request<TaskData[]>(`/content?${query}`, { signal });
    },

    // Create task - adapted for content.ts API
    create: (data: {
      title: string;
      description: string;
      difficulty: number;
      type?: string;
      goldReward?: number;
      expReward?: number;
    }, signal?: AbortSignal) => 
      this.request<TaskData>('/content?type=tasks', {
        method: 'POST',
        body: JSON.stringify(data),
        signal
      }),

    // Get specific task - adapted for content.ts API
    get: (id: string, signal?: AbortSignal) => 
      this.request<TaskData>(`/content?type=tasks&id=${id}`, { signal }),

    // Update task - adapted for content.ts API
    update: (id: string, data: Partial<TaskData>, signal?: AbortSignal) => 
      this.request<TaskData>(`/content?type=tasks&id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        signal
      }),

    // Delete task - adapted for content.ts API
    delete: (id: string, signal?: AbortSignal) => 
      this.request<void>(`/content?type=tasks&id=${id}`, {
        method: 'DELETE',
        signal
      }),

    // Complete/toggle task - adapted for content.ts API
    complete: (id: string, signal?: AbortSignal) => 
      this.request<TaskData>(`/content?type=tasks&action=toggle&id=${id}`, {
        method: 'PUT',
        signal
      }),
  };

  // IProfile Actions
  profileActions = {
    // Daily login
    dailyLogin: (signal?: AbortSignal) => 
      this.request<DailyLoginResult>('/user?action=daily-login', {
        method: 'POST',
        signal
      }),

    // Open lootbox
    openLootbox: (lootboxId: string, signal?: AbortSignal) => 
      this.request<LootboxResult>('/gaming?action=lootbox', {
        method: 'POST',
        body: JSON.stringify({ lootboxId }),
        signal
      }),

    // Spin wheel
    spin: (signal?: AbortSignal) => 
      this.request<SpinResult>('/gaming?action=spin', {
        method: 'POST',
        signal
      }),
  };

  // Shopping
  shop = {
    // Get shop items
    getItems: (signal?: AbortSignal) => 
      this.request<ShopItem[]>('/gaming?action=shop', { signal }),

    // Purchase item
    purchase: (data: {
      itemId: string;
      quantity?: number;
    }, signal?: AbortSignal) => 
      this.request<PurchaseResult>('/gaming?action=purchase', {
        method: 'POST',
        body: JSON.stringify(data),
        signal
      }),
  };

  // System Actions
  mood = {
    // Get current mood
    getCurrent: (signal?: AbortSignal) => 
      this.request<IMood>('/system?module=mood&action=current', { signal }),

    // Submit mood
    submit: (data: MoodSubmitData, signal?: AbortSignal) => 
      this.request<MoodResult>('/system?module=mood&action=submit', {
        method: 'POST',
        body: JSON.stringify(data),
        signal
      }),

    // Reset mood (admin)
    reset: (signal?: AbortSignal) => 
      this.request<{ message: string }>('/system?module=mood&action=reset', {
        method: 'POST',
        signal
      }),
  };
}

// Export singleton instance
export const zalandoApiClient = new ZalandoApiClient();
export { ZalandoApiClient, ApiError };
export type { ZalandoApiResponse };