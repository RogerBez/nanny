"use strict";
/**
 * Audit logging utility
 * Logs all sensitive actions for compliance and debugging
 * MVP: JSON file logging
 * Production: Database + external logging service
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditEvent = logAuditEvent;
exports.logScoringEvent = logScoringEvent;
exports.getRecentAuditLogs = getRecentAuditLogs;
exports.getRecentScoreLogs = getRecentScoreLogs;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const LOG_DIR = path.join(process.cwd(), 'logs');
const AUDIT_LOG_FILE = path.join(LOG_DIR, 'audit.log');
const SCORE_LOG_FILE = path.join(LOG_DIR, 'scores.log');
/**
 * Ensure log directory exists
 */
function ensureLogDir() {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
}
/**
 * Log an audit event (ingest, freeze, unfreeze)
 * @param entry - Audit log entry to record
 */
function logAuditEvent(entry) {
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
    }
    catch (error) {
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
function logScoringEvent(childId, messageId, score, riskLevel, flags) {
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
    }
    catch (error) {
        console.error('Failed to write score log:', error);
    }
}
/**
 * Retrieve recent audit logs (MVP: last N lines)
 * @param limit - Number of logs to retrieve (default 100)
 * @returns Array of audit log entries
 */
function getRecentAuditLogs(limit = 100) {
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
                return JSON.parse(line);
            }
            catch {
                return null;
            }
        }).filter((entry) => entry !== null);
    }
    catch (error) {
        console.error('Failed to read audit logs:', error);
        return [];
    }
}
/**
 * Retrieve recent score logs (MVP: last N lines)
 * @param limit - Number of logs to retrieve (default 100)
 * @returns Array of score log entries
 */
function getRecentScoreLogs(limit = 100) {
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
            }
            catch {
                return null;
            }
        }).filter(entry => entry !== null);
    }
    catch (error) {
        console.error('Failed to read score logs:', error);
        return [];
    }
}
//# sourceMappingURL=auditLogger.js.map