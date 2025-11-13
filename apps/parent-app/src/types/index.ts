/**
 * Parent App Types
 * Extends types from backend for type-safe API communication
 * Location: apps/parent-app/src/types/index.ts
 */

// ===== Extended API Types from Backend =====
// Import from backend when monorepo is fully integrated

export interface EncryptedPayload {
  iv: string;
  ciphertext: string;
  tag: string;
}

export interface DecryptedMessage {
  messageId: string;
  childId: string;
  deviceId: string;
  content: string;
  timestamp: number;
}

export interface ScoringResult {
  score: number; // 0-100
  riskLevel: "low" | "medium" | "high" | "critical";
  flags: string[];
  reasoning: string;
}

// ===== API Request/Response Types =====

export interface IngestRequest {
  childId: string;
  encryptedPayload: EncryptedPayload;
  deviceId: string;
}

export interface IngestResponse {
  messageId: string;
  success: boolean;
  timestamp: number;
}

export interface ScoreRequest {
  messageId: string;
  childId: string;
}

export interface ScoreResponse {
  messageId: string;
  score: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  flags: string[];
  reasoning: string;
  autoFrozen: boolean;
  timestamp: number;
}

export interface FreezeRequest {
  childId: string;
  reason?: string;
}

export interface FreezeResponse {
  success: boolean;
  childId: string;
  frozen: boolean;
  timestamp: number;
}

export interface GetFreezeStatusResponse {
  childId: string;
  frozen: boolean;
  reason?: string;
  timestamp: number;
}

export interface UnfreezeRequest {
  childId: string;
}

export interface UnfreezeResponse {
  success: boolean;
  childId: string;
  frozen: boolean;
  timestamp: number;
}

// ===== Authentication Types =====

export interface AuthState {
  isLoggedIn: boolean;
  user: ParentUser | null;
  loading: boolean;
  error: string | null;
}

export interface ParentUser {
  id: string;
  email: string;
  name: string;
  children: ChildAccount[];
  createdAt: number;
}

export interface ChildAccount {
  id: string;
  name: string;
  email: string;
  deviceId: string;
  riskScore: number;
  isFrozen: boolean;
  lastActive: number;
}

// ===== UI State Types =====

export interface DashboardMetrics {
  messagesIngested: number;
  highRiskAlerts: number;
  averageRiskScore: number;
  frozenItems: number;
}

export interface AlertItem {
  id: string;
  childId: string;
  childName: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  timestamp: number;
  message?: string;
  score: number;
}

export interface FreezeUIState {
  selectedChildId: string | null;
  reason: string;
  isSubmitting: boolean;
  error: string | null;
}

// ===== API Client Types =====

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  timestamp: number;
}

// ===== Navigation Types =====

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  ChildList: undefined;
  FreezeScreen: { childId: string; childName: string };
  AlertDetail: { alertId: string };
};
