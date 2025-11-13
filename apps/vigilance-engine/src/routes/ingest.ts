/**
 * POST /ingest
 * Receive encrypted message payloads from child app
 * Decrypt and store in memory for processing
 */

import { Router, Request, Response } from 'express';
import { decryptPayload, validateDecryptedPayload, generateMessageId } from '../utils/decrypt';
import { logAuditEvent } from '../utils/auditLogger';
import type { IngestRequest, IngestResponse, DecryptedMessage, MessageStore } from '../types/index';

const router = Router();

// In-memory message store (MVP)
const messageStore: MessageStore = {};

/**
 * POST /ingest
 * Accept encrypted message from child app
 */
router.post('/ingest', (req: Request, res: Response) => {
  try {
    const { childId, encryptedPayload, deviceId } = req.body as IngestRequest;

    // Validate request
    if (!childId || !encryptedPayload) {
      return res.status(400).json({
        status: 'error',
        error: 'Missing required fields: childId, encryptedPayload',
      } as IngestResponse);
    }

    // Decrypt payload
    let decryptedContent: string;
    try {
      decryptedContent = decryptPayload(encryptedPayload);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        error: `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      } as IngestResponse);
    }

    // Validate decrypted payload
    if (!validateDecryptedPayload(decryptedContent)) {
      return res.status(400).json({
        status: 'error',
        error: 'Invalid decrypted payload format',
      } as IngestResponse);
    }

    // Generate message ID and store
    const messageId = generateMessageId();
    const decryptedMessage: DecryptedMessage = {
      childId,
      deviceId,
      content: decryptedContent,
      timestamp: Date.now(),
      messageId,
    };

    messageStore[messageId] = decryptedMessage;

    // Log audit event
    logAuditEvent({
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
    } as IngestResponse);
  } catch (error) {
    console.error('Error in /ingest:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Internal server error',
    } as IngestResponse);
  }
});

// Export router and store for testing
export { router, messageStore };
