"use strict";
/**
 * POST /ingest
 * Receive encrypted message payloads from child app
 * Decrypt and store in memory for processing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageStore = exports.router = void 0;
const express_1 = require("express");
const decrypt_1 = require("../utils/decrypt");
const auditLogger_1 = require("../utils/auditLogger");
const router = (0, express_1.Router)();
exports.router = router;
// In-memory message store (MVP)
const messageStore = {};
exports.messageStore = messageStore;
/**
 * POST /ingest
 * Accept encrypted message from child app
 */
router.post('/ingest', (req, res) => {
    try {
        const { childId, encryptedPayload, deviceId } = req.body;
        // Validate request
        if (!childId || !encryptedPayload) {
            return res.status(400).json({
                status: 'error',
                error: 'Missing required fields: childId, encryptedPayload',
            });
        }
        // Decrypt payload
        let decryptedContent;
        try {
            decryptedContent = (0, decrypt_1.decryptPayload)(encryptedPayload);
        }
        catch (error) {
            return res.status(400).json({
                status: 'error',
                error: `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
        }
        // Validate decrypted payload
        if (!(0, decrypt_1.validateDecryptedPayload)(decryptedContent)) {
            return res.status(400).json({
                status: 'error',
                error: 'Invalid decrypted payload format',
            });
        }
        // Generate message ID and store
        const messageId = (0, decrypt_1.generateMessageId)();
        const decryptedMessage = {
            childId,
            deviceId,
            content: decryptedContent,
            timestamp: Date.now(),
            messageId,
        };
        messageStore[messageId] = decryptedMessage;
        // Log audit event
        (0, auditLogger_1.logAuditEvent)({
            id: messageId,
            action: 'ingest',
            childId,
            messageId,
            timestamp: Date.now(),
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        // Return success response
        return res.status(200).json({
            status: 'success',
            messageId,
        });
    }
    catch (error) {
        console.error('Error in /ingest:', error);
        return res.status(500).json({
            status: 'error',
            error: 'Internal server error',
        });
    }
});
//# sourceMappingURL=ingest.js.map