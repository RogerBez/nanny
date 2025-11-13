/**
 * Type definitions for NANNY backend API
 * Shared interfaces for all routes and utilities
 */

/**
 * Payload received from child app (encrypted)
 */
export interface EncryptedPayload {
  childId: string;
  deviceId?: string;
  encryptedMessage: string; // Base64 encoded AES-encrypted content
  timestamp: number; // Unix timestamp
  signature?: string; // Optional HMAC signature for integrity
}

/**
 * Decrypted message payload
 */
export interface DecryptedMessage {
  childId: string;
  deviceId?: string;
  content: string; // Plain text message
  timestamp: number;
  messageId: string; // Generated ID for tracking
}

/**
 * Scoring result from slangScorer
 */
export interface ScoringResult {
  score: number; // 0-100 risk score
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[]; // Detected threat keywords/patterns
  confidence: number; // 0-1 confidence in the score
}

/**
 * API request for /ingest route
 */
export interface IngestRequest {
  childId: string;
  encryptedPayload: string; // Base64 encoded
  deviceId?: string;
}

/**
 * API response for /ingest route
 */
export interface IngestResponse {
  status: 'success' | 'error';
  messageId?: string;
  error?: string;
}

/**
 * API request for /score route
 */
export interface ScoreRequest {
  childId: string;
  encryptedPayload: string;
  messageId?: string;
}

/**
 * API response for /score route
 */
export interface ScoreResponse {
  status: 'success' | 'error';
  score?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  flags?: string[];
  messageId?: string;
  error?: string;
}

/**
 * API request for /freeze route
 */
export interface FreezeRequest {
  childId: string;
  parentId: string;
  reason: string;
  duration?: number; // Optional: minutes to freeze (0 = permanent)
}

/**
 * API response for /freeze route
 */
export interface FreezeResponse {
  status: 'success' | 'error';
  frozen: boolean;
  childId?: string;
  reason?: string;
  timestamp?: number;
  error?: string;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  action: 'ingest' | 'score' | 'freeze' | 'unfreeze';
  childId: string;
  parentId?: string;
  messageId?: string;
  riskScore?: number;
  reason?: string;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * In-memory storage for MVP
 */
export interface MessageStore {
  [messageId: string]: DecryptedMessage;
}

export interface FreezeStore {
  [childId: string]: {
    frozen: boolean;
    reason: string;
    timestamp: number;
    parentId: string;
  };
}
