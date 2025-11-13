/**
 * Audit logging utility
 * Logs all sensitive actions for compliance and debugging
 * MVP: JSON file logging
 * Production: Database + external logging service
 */
import type { AuditLogEntry } from '../types/index';
/**
 * Log an audit event (ingest, freeze, unfreeze)
 * @param entry - Audit log entry to record
 */
export declare function logAuditEvent(entry: AuditLogEntry): void;
/**
 * Log a message scoring event
 * @param childId - Child ID
 * @param messageId - Message ID
 * @param score - Risk score (0-100)
 * @param riskLevel - Risk level
 * @param flags - Detected threat flags
 */
export declare function logScoringEvent(childId: string, messageId: string, score: number, riskLevel: string, flags: string[]): void;
/**
 * Retrieve recent audit logs (MVP: last N lines)
 * @param limit - Number of logs to retrieve (default 100)
 * @returns Array of audit log entries
 */
export declare function getRecentAuditLogs(limit?: number): AuditLogEntry[];
/**
 * Retrieve recent score logs (MVP: last N lines)
 * @param limit - Number of logs to retrieve (default 100)
 * @returns Array of score log entries
 */
export declare function getRecentScoreLogs(limit?: number): Array<{
    messageId: string;
    childId: string;
    score: number;
    riskLevel: string;
    flags: string[];
    timestamp: number;
}>;
//# sourceMappingURL=auditLogger.d.ts.map