/**
 * POST /freeze
 * Freeze a child account due to high-risk activity
 */

import { Router, Request, Response } from 'express';
import { logAuditEvent } from '../utils/auditLogger';
import type { FreezeRequest, FreezeResponse, FreezeStore } from '../types/index';

const router = Router();

// In-memory freeze store (MVP)
const freezeStore: FreezeStore = {};

/**
 * POST /freeze
 * Freeze a child account
 */
router.post('/freeze', (req: Request, res: Response) => {
  try {
    const { childId, parentId, reason, duration } = req.body as FreezeRequest;

    // Validate request
    if (!childId || !parentId || !reason) {
      return res.status(400).json({
        status: 'error',
        error: 'Missing required fields: childId, parentId, reason',
      } as FreezeResponse);
    }

    // Freeze the account
    const timestamp = Date.now();
    freezeStore[childId] = {
      frozen: true,
      reason,
      timestamp,
      parentId,
    };

    // Log audit event
    logAuditEvent({
      id: `freeze_${childId}_${timestamp}`,
      action: 'freeze',
      childId,
      parentId,
      reason,
      timestamp,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[FREEZE] Child ${childId} frozen by parent ${parentId}. Reason: ${reason}`);
    }

    // Return success response
    return res.status(200).json({
      status: 'success',
      frozen: true,
      childId,
      reason,
      timestamp,
    } as FreezeResponse);
  } catch (error) {
    console.error('Error in /freeze:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Internal server error',
    } as FreezeResponse);
  }
});

/**
 * GET /freeze/:childId
 * Check if a child account is frozen
 */
router.get('/freeze/:childId', (req: Request, res: Response) => {
  try {
    const { childId } = req.params;

    const freezeData = freezeStore[childId];
    if (freezeData) {
      return res.status(200).json({
        status: 'success',
        frozen: freezeData.frozen,
        childId,
        reason: freezeData.reason,
        timestamp: freezeData.timestamp,
      });
    }

    return res.status(200).json({
      status: 'success',
      frozen: false,
      childId,
    });
  } catch (error) {
    console.error('Error in GET /freeze:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Internal server error',
    });
  }
});

/**
 * POST /unfreeze
 * Unfreeze a child account
 */
router.post('/unfreeze', (req: Request, res: Response) => {
  try {
    const { childId, parentId } = req.body as { childId: string; parentId: string };

    // Validate request
    if (!childId || !parentId) {
      return res.status(400).json({
        status: 'error',
        error: 'Missing required fields: childId, parentId',
      });
    }

    // Unfreeze the account
    const timestamp = Date.now();
    freezeStore[childId] = {
      frozen: false,
      reason: 'Unfrozen',
      timestamp,
      parentId,
    };

    // Log audit event
    logAuditEvent({
      id: `unfreeze_${childId}_${timestamp}`,
      action: 'unfreeze',
      childId,
      parentId,
      timestamp,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[UNFREEZE] Child ${childId} unfrozen by parent ${parentId}`);
    }

    return res.status(200).json({
      status: 'success',
      frozen: false,
      childId,
    });
  } catch (error) {
    console.error('Error in /unfreeze:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Internal server error',
    });
  }
});

export { router, freezeStore };
