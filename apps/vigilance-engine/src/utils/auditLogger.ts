/**
 * Audit logging utility
 * Logs all sensitive actions for compliance and debugging
 * MVP: JSON file logging
 * Production: Database + external logging service
 */

import * as fs from 'fs';
import * as path from 'path';
import type { AuditLogEntry } from '../types/index';

const LOG_DIR = path.join(process.cwd(), 'logs');
const AUDIT_LOG_FILE = path.join(LOG_DIR, 'audit.log');
const SCORE_LOG_FILE = path.join(LOG_DIR, 'scores.log');

/**
 * Ensure log directory exists
 */
function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Log an audit event (ingest, freeze, unfreeze)
 * @param entry - Audit log entry to record
 */
export function logAuditEvent(entry: AuditLogEntry): void {
  try {
    ensureLogDir();

    const logEntry = {
      ...entry,
      timestamp: entry.timestamp || Date.now(),
    };

    const logLine = JSON.stringify(logEntry);
    fs.appendFileSync(AUDIT_LOG_FILE, logLine + '\n', 'utf-8');

    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUDIT] ${entry.action.toUpperCase()} - childId: ${entry.childId}`);
    }
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

/**
 * Log a message scoring event
 * @param childId - Child ID
 * @param messageId - Message ID
 * @param score - Risk score (0-100)
 * @param riskLevel - Risk level
 * @param flags - Detected threat flags
 */
export function logScoringEvent(
  childId: string,
  messageId: string,
  score: number,
  riskLevel: string,
  flags: string[]
): void {
  try {
    ensureLogDir();

    const entry = {
      messageId,
      childId,
      score,
      riskLevel,
      flags,
      timestamp: Date.now(),
    };

    const logLine = JSON.stringify(entry);
    fs.appendFileSync(SCORE_LOG_FILE, logLine + '\n', 'utf-8');

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SCORE] childId: ${childId}, score: ${score}, level: ${riskLevel}`);
    }
  } catch (error) {
    console.error('Failed to write score log:', error);
  }
}

/**
 * Retrieve recent audit logs (MVP: last N lines)
 * @param limit - Number of logs to retrieve (default 100)
 * @returns Array of audit log entries
 */
export function getRecentAuditLogs(limit: number = 100): AuditLogEntry[] {
  try {
    if (!fs.existsSync(AUDIT_LOG_FILE)) {
      return [];
    }

    const content = fs.readFileSync(AUDIT_LOG_FILE, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    // Get last N lines
    const recentLines = lines.slice(Math.max(0, lines.length - limit));

    return recentLines.map(line => {
      try {
        return JSON.parse(line) as AuditLogEntry;
      } catch {
        return null;
      }
    }).filter((entry): entry is AuditLogEntry => entry !== null);
  } catch (error) {
    console.error('Failed to read audit logs:', error);
    return [];
  }
}

/**
 * Retrieve recent score logs (MVP: last N lines)
 * @param limit - Number of logs to retrieve (default 100)
 * @returns Array of score log entries
 */
export function getRecentScoreLogs(
  limit: number = 100
): Array<{
  messageId: string;
  childId: string;
  score: number;
  riskLevel: string;
  flags: string[];
  timestamp: number;
}> {
  try {
    if (!fs.existsSync(SCORE_LOG_FILE)) {
      return [];
    }

    const content = fs.readFileSync(SCORE_LOG_FILE, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    // Get last N lines
    const recentLines = lines.slice(Math.max(0, lines.length - limit));

    return recentLines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(entry => entry !== null);
  } catch (error) {
    console.error('Failed to read score logs:', error);
    return [];
  }
}
