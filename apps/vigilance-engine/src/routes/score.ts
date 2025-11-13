/**
 * POST /score
 * Analyze and score messages for threat level
 * Returns risk score, level, detected flags, flagged status, and explanation
 */

import { Router, Request, Response } from 'express';
import { decryptPayload, validateDecryptedPayload } from '../utils/decrypt';
import { scoreMessage, getRiskExplanation, shouldAutoFreeze } from '../utils/slangScorer';
import { logScoringEvent, logAuditEvent } from '../utils/auditLogger';
import type { ScoreRequest, ScoreResponse } from '../types/index';

const router = Router();

/**
 * POST / (mounted at /score)
 * Score an encrypted message for threat level
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { childId, encryptedPayload, messageId } = req.body as ScoreRequest;

    // Validate request
    if (!childId || !encryptedPayload) {
      return res.status(400).json({
        status: 'error',
        error: 'Missing required fields: childId, encryptedPayload',
      } as ScoreResponse);
    }

    // Decrypt payload
    let decryptedContent: string;
    try {
      decryptedContent = decryptPayload(encryptedPayload);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        error: `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      } as ScoreResponse);
    }

    // Validate decrypted payload
    if (!validateDecryptedPayload(decryptedContent)) {
      return res.status(400).json({
        status: 'error',
        error: 'Invalid decrypted payload format',
      } as ScoreResponse);
    }

    // Score the message
    const scoringResult = scoreMessage(decryptedContent);
    const actualMessageId = messageId || `msg_score_${Date.now()}`;

    // Log scoring event
    logScoringEvent(childId, actualMessageId, scoringResult.score, scoringResult.riskLevel, scoringResult.flags);

    // Log audit event
    logAuditEvent({
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
    const triggerAutoFreeze = shouldAutoFreeze(scoringResult.score);
    const isFlagged = scoringResult.score >= 50; // Flag messages with score >= 50
    const explanation = getRiskExplanation(scoringResult.score);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SCORE] Message scored: ${scoringResult.score} (${scoringResult.riskLevel}), flagged: ${isFlagged}`);
      if (triggerAutoFreeze) {
        console.log(`[AUTO-FREEZE] Critical threat detected for child ${childId}`);
      }
    }

    // Return success response with flagged status and explanation
    return res.status(200).json({
      status: 'success',
      score: scoringResult.score,
      riskLevel: scoringResult.riskLevel,
      flagged: isFlagged,
      flags: scoringResult.flags,
      explanation,
      messageId: actualMessageId,
    } as ScoreResponse);
  } catch (error) {
    console.error('Error in /score:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Internal server error',
    } as ScoreResponse);
  }
});

export { router };
