import { SanctionUnit, SanctionCategory, WarningSeverity, TicketPriority } from '../../types/common';

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
  totalCount?: number;
  escalatedCount?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// API Error Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Request Configuration
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
}

// Profile API Types
export interface UpdateProfilePayload {
  name?: string;
  level?: number;
  exp?: number;
  gold?: number;
  streakCount?: number;
  lastLogin?: Date;
  profileImage?: string;
  keys?: number;
  id?: string;
}

export interface AdminUpdatePayload extends UpdateProfilePayload {
  adminNotes?: string;
}

// Sanction API Types
export interface CreateSanctionPayload {
  title: string;
  description: string;
  task: string;
  severity: number;
  amount: number;
  unit: SanctionUnit;
  category: SanctionCategory;
  deadline?: Date;
  reason?: string;
}

export interface SanctionFilters {
  status?: "offen" | "erledigt" | "abgelaufen" | "eskaliert";
  category?: string;
  severity?: number;
  limit?: number;
  page?: number;
}

// Event API Types
export interface CreateEventPayload {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: string;
  isActive?: boolean;
}

// Task API Types
export interface CreateTaskPayload {
  title: string;
  description: string;
  difficulty: number;
  goldReward: number;
  expReward: number;
  type: string;
}

// News API Types
export interface CreateNewsPayload {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isImportant?: boolean;
}

// Survey API Types
export interface SurveyResponse {
  questionId: string;
  answer: string | number | boolean;
}

export interface SubmitSurveyPayload {
  responses: SurveyResponse[];
}

// Warning API Types
export interface CreateWarningPayload {
  title: string;
  message: string;
  severity: WarningSeverity;
  expiresAt?: Date;
}

// Ticket API Types
export interface CreateTicketPayload {
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
}

export interface TicketMessage {
  content: string;
  isInternal?: boolean;
}

// Misc API Types - Shop, Items, etc.
export interface ShopBuyPayload {
  itemId: string;
  quantity?: number;
}

export interface CreateCoinBookPayload {
  user: string;
  entries?: Array<{
    coinItem: string;
    quantity: number;
  }>;
}

export interface CreateCoinItemPayload {
  title: string;
  description?: string;
  neededAmount: number;
  img?: string;
}

export interface CreateItemPayload {
  title: string;
  description: string;
  img: string;
  price: number;
  category: string;
}

export interface LevelThresholdsPayload {
  thresholds: Array<{
    level: number;
    exp: number;
  }>;
}

export interface AddLootboxPayload {
  lootboxId: string;
  items: Array<{
    itemId: string;
    quantity: number;
    dropRate: number;
  }>;
}

export interface CreateWikiPagePayload {
  title: string;
  content: string;
  category?: string;
  isPublic?: boolean;
}

export interface UpdateWikiPagePayload {
  title?: string;
  content?: string;
  category?: string;
  isPublic?: boolean;
}

export interface TelegramMessagePayload {
  message: string;
  chatId?: string;
}

export interface GoldWeightsPayload {
  weights: Record<string, number>;
}

// Profile API Types - Extended
export interface CreateProfilePayload {
  name: string;
  email?: string;
  level?: number;
  exp?: number;
  gold?: number;
  streakCount?: number;
  keys?: number;
  profileImage?: string;
}

export interface AddLootboxToProfilePayload {
  lootboxId: string;
  quantity?: number;
}

export interface UpdateProfileItemPayload {
  [key: string]: unknown;
}

// QuickTask API Types
export interface CreateQuickTaskPayload {
  title: string;
  description: string;
  url?: string;
  status?: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  seen?: boolean;
  deadline?: Date;
}

export interface UpdateQuickTaskPayload {
  title?: string;
  description?: string;
  url?: string;
  status?: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  seen?: boolean;
  deadline?: Date;
}

// Survey API Types - Extended
export interface CreateSurveyPayload {
  title: string;
  description?: string;
  questions: Array<{
    id: string;
    text: string;
    type: 'text' | 'number' | 'boolean' | 'choice';
    options?: string[];
    required?: boolean;
  }>;
  isActive?: boolean;
}