/**
 * Shared TypeScript types for NANNY system
 * Exported from apps/shared/types for use in backend and frontend apps
 */

// ============ INGEST ============
export interface IngestPayload {
  childId: string;
  encryptedPayload: string;
  deviceId?: string;
}

export interface IngestResponse {
  status: 'success' | 'error';
  messageId?: string;
  error?: string;
  message?: string;
}

// ============ SCORE ============
export interface ScorePayload {
  childId: string;
  encryptedPayload: string;
}

export interface ScoreResponse {
  status: 'success' | 'error';
  score?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  flagged?: boolean;
  explanation?: string;
  messageId?: string;
  error?: string;
  message?: string;
}

// ============ FREEZE ============
export interface FreezePayload {
  childId: string;
  messageId?: string;
  reason?: string;
}

export interface FreezeResponse {
  status: 'frozen' | 'unfrozen' | 'error';
  frozen?: boolean;
  childId?: string;
  timestamp?: number;
  error?: string;
  message?: string;
}

// ============ COMMON TYPES ============
export interface MessageStore {
  [messageId: string]: {
    childId: string;
    content: string;
    timestamp: number;
    messageId: string;
    deviceId?: string;
  };
}

export interface FreezeStore {
  [childId: string]: {
    frozen: boolean;
    timestamp?: number;
    reason?: string;
    parentId?: string;
  };
}

export interface AuditLogEntry {
  id: string;
  action: string;
  childId: string;
  messageId?: string;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

export interface DecryptedMessage {
  childId: string;
  content: string;
  timestamp: number;
  messageId: string;
  deviceId?: string;
}
