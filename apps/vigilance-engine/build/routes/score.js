"use strict";
/**
 * POST /score
 * Analyze and score messages for threat level
 * Returns risk score, level, and detected flags
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const decrypt_1 = require("../utils/decrypt");
const slangScorer_1 = require("../utils/slangScorer");
const auditLogger_1 = require("../utils/auditLogger");
const router = (0, express_1.Router)();
exports.router = router;
/**
 * POST /score
 * Score an encrypted message for threat level
 */
router.post('/score', (req, res) => {
    try {
        const { childId, encryptedPayload, messageId } = req.body;
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
        // Score the message
        const scoringResult = (0, slangScorer_1.scoreMessage)(decryptedContent);
        const actualMessageId = messageId || `msg_score_${Date.now()}`;
        // Log scoring event
        (0, auditLogger_1.logScoringEvent)(childId, actualMessageId, scoringResult.score, scoringResult.riskLevel, scoringResult.flags);
        // Log audit event
        (0, auditLogger_1.logAuditEvent)({
            id: actualMessageId,
            action: 'score',
            childId,
            messageId: actualMessageId,
            riskScore: scoringResult.score,
            timestamp: Date.now(),
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        // Check if auto-freeze should be triggered
        const triggerAutoFreeze = (0, slangScorer_1.shouldAutoFreeze)(scoringResult.score);
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[SCORE] Message scored: ${scoringResult.score} (${scoringResult.riskLevel})`);
            if (triggerAutoFreeze) {
                console.log(`[AUTO-FREEZE] Critical threat detected for child ${childId}`);
            }
        }
        // Return success response
        return res.status(200).json({
            status: 'success',
            score: scoringResult.score,
            riskLevel: scoringResult.riskLevel,
            flags: scoringResult.flags,
            messageId: actualMessageId,
        });
    }
    catch (error) {
        console.error('Error in /score:', error);
        return res.status(500).json({
            status: 'error',
            error: 'Internal server error',
        });
    }
});
//# sourceMappingURL=score.js.map