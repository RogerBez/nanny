"use strict";
/**
 * Slang and threat scoring utility
 * Analyzes decrypted messages for risky content
 * MVP: Keyword-based detection
 * Production: ML model or advanced NLP
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreMessage = scoreMessage;
exports.getRiskExplanation = getRiskExplanation;
exports.shouldAutoFreeze = shouldAutoFreeze;
/**
 * Comprehensive threat keyword database (MVP)
 * Format: { keyword: riskScore (0-100) }
 */
const THREAT_KEYWORDS = {
    // Self-harm indicators
    'hurt myself': 80,
    suicide: 90,
    'kill myself': 95,
    overdose: 85,
    'cutting wrist': 90,
    // Substance abuse
    cocaine: 85,
    heroin: 90,
    meth: 85,
    'crystal meth': 90,
    fentanyl: 95,
    xanax: 50,
    'illegal drugs': 75,
    // Violence
    'beat up': 70,
    'knife': 65,
    'gun': 40, // Neutral in many contexts
    murder: 85,
    kill: 60,
    bomb: 80,
    'school shooter': 95,
    // Sexual exploitation
    'child abuse': 100,
    'child porn': 100,
    exploitation: 75,
    trafficking: 85,
    // Other risks
    runaway: 60,
    'skip school': 30,
    cheating: 20,
};
/**
 * Calculate threat score for a message
 * @param content - Decrypted message content
 * @returns ScoringResult with score, risk level, and detected flags
 */
function scoreMessage(content) {
    const flags = [];
    let maxScore = 0;
    const lowerContent = content.toLowerCase();
    // Check for threat keywords
    for (const [keyword, score] of Object.entries(THREAT_KEYWORDS)) {
        if (lowerContent.includes(keyword)) {
            flags.push(keyword);
            maxScore = Math.max(maxScore, score);
        }
    }
    // Determine risk level
    let riskLevel = 'low';
    if (maxScore >= 80) {
        riskLevel = 'critical';
    }
    else if (maxScore >= 60) {
        riskLevel = 'high';
    }
    else if (maxScore >= 30) {
        riskLevel = 'medium';
    }
    // Calculate confidence (MVP: based on number of flags detected)
    const confidence = Math.min(1, flags.length * 0.3 + 0.4);
    return {
        score: maxScore,
        riskLevel,
        flags: [...new Set(flags)], // Remove duplicates
        confidence,
    };
}
/**
 * Get a human-readable explanation for a risk score
 * @param score - Risk score (0-100)
 * @returns Explanation string
 */
function getRiskExplanation(score) {
    if (score >= 80) {
        return 'Critical threat detected. Immediate parent notification recommended.';
    }
    if (score >= 60) {
        return 'High-risk content detected. Parent review recommended.';
    }
    if (score >= 30) {
        return 'Moderate concern detected. Parental awareness advised.';
    }
    return 'Low risk detected. No action required.';
}
/**
 * Check if a message triggers auto-freeze
 * @param score - Risk score (0-100)
 * @returns true if auto-freeze should be triggered
 */
function shouldAutoFreeze(score) {
    // MVP: Auto-freeze on critical threats
    return score >= 90;
}
//# sourceMappingURL=slangScorer.js.map