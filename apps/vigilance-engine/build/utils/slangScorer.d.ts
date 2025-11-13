/**
 * Slang and threat scoring utility
 * Analyzes decrypted messages for risky content
 * MVP: Keyword-based detection
 * Production: ML model or advanced NLP
 */
import type { ScoringResult } from '../types/index';
/**
 * Calculate threat score for a message
 * @param content - Decrypted message content
 * @returns ScoringResult with score, risk level, and detected flags
 */
export declare function scoreMessage(content: string): ScoringResult;
/**
 * Get a human-readable explanation for a risk score
 * @param score - Risk score (0-100)
 * @returns Explanation string
 */
export declare function getRiskExplanation(score: number): string;
/**
 * Check if a message triggers auto-freeze
 * @param score - Risk score (0-100)
 * @returns true if auto-freeze should be triggered
 */
export declare function shouldAutoFreeze(score: number): boolean;
//# sourceMappingURL=slangScorer.d.ts.map