/**
 * POST / (mounted at /freeze)
 * Freeze a child account due to high-risk activity
 * GET /:childId to check freeze status
 * POST /unfreeze to unfreeze
 */

import { Router, Request, Response } from 'express';
import { logAuditEvent } from '../utils/auditLogger';
import type { FreezeRequest, FreezeResponse, FreezeStore } from '../types/index';

const router = Router();

// In-memory freeze store (MVP)
const freezeStore: FreezeStore = {};

/**
 * POST /
 * Freeze a child account
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { childId, parentId, reason, duration } = req.body as FreezeRequest;

    // Validate request
    if (!childId) {
      return res.status(400).json({
        status: 'error',
        error: 'Missing required fields: childId',
      } as FreezeResponse);
    }

    // Freeze the account
    const timestamp = Date.now();
    freezeStore[childId] = {
      frozen: true,
      reason: reason || 'Frozen by parent',
      timestamp,
      parentId: parentId || 'system',
    };

    // Log audit event
    logAuditEvent({
      id: `freeze_${childId}_${timestamp}`,
      action: 'freeze',
      childId,
      parentId: parentId || 'system',
      reason: reason || 'Frozen by parent',
      timestamp,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[FREEZE] Child ${childId} frozen. Reason: ${reason || 'No reason provided'}`);
    }

    // Return success response
    const resp = {
      status: 'success',
      frozen: true,
      childId,
      reason: reason || 'Frozen by parent',
      timestamp,
    } as unknown as FreezeResponse;
    return res.status(200).json(resp);
  } catch (error) {
    console.error('Error in POST /freeze:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Internal server error',
    } as FreezeResponse);
  }
});

/**
 * GET /:childId
 * Check if a child account is frozen
 */
router.get('/:childId', (req: Request, res: Response) => {
  try {
    const { childId } = req.params;

    const freezeData = freezeStore[childId];
    if (freezeData && freezeData.frozen) {
      return res.status(200).json({
        status: 'success',
        frozen: true,
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
    console.error('Error in GET /:childId:', error);
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
    const { childId, parentId } = req.body as { childId: string; parentId?: string };

    // Validate request
    if (!childId) {
      return res.status(400).json({
        status: 'error',
        error: 'Missing required fields: childId',
      });
    }

    // Unfreeze the account
    const timestamp = Date.now();
    freezeStore[childId] = {
      frozen: false,
      reason: 'Unfrozen',
      timestamp,
      parentId: parentId || 'system',
    };

    // Log audit event
    logAuditEvent({
      id: `unfreeze_${childId}_${timestamp}`,
      action: 'unfreeze',
      childId,
      parentId: parentId || 'system',
      timestamp,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[UNFREEZE] Child ${childId} unfrozen`);
    }

    return res.status(200).json({
      status: 'unfrozen',
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

// Export router and store for testing
export { router, freezeStore };
