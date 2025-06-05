// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
  totalCount?: number;
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
  body?: any;
  params?: Record<string, any>;
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
  [key: string]: any;
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
  unit: "Minuten" | "Stunden" | "Tage" | "Mal";
  category: "Hausarbeit" | "Lernen" | "Sport" | "Soziales" | "Sonstiges";
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
  severity: 'low' | 'medium' | 'high' | 'critical';
  expiresAt?: Date;
}

// Ticket API Types
export interface CreateTicketPayload {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TicketMessage {
  content: string;
  isInternal?: boolean;
}