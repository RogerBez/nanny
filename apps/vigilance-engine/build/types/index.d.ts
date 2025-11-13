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
    encryptedMessage: string;
    timestamp: number;
    signature?: string;
}
/**
 * Decrypted message payload
 */
export interface DecryptedMessage {
    childId: string;
    deviceId?: string;
    content: string;
    timestamp: number;
    messageId: string;
}
/**
 * Scoring result from slangScorer
 */
export interface ScoringResult {
    score: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    flags: string[];
    confidence: number;
}
/**
 * API request for /ingest route
 */
export interface IngestRequest {
    childId: string;
    encryptedPayload: string;
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
    duration?: number;
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
//# sourceMappingURL=index.d.ts.map