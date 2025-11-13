"use strict";
/**
 * Decryption utility for message payloads
 * MVP: Simple base64 decoding
 * Production: RSA key unwrap + AES-256-GCM decryption
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptPayload = decryptPayload;
exports.validateDecryptedPayload = validateDecryptedPayload;
exports.generateMessageId = generateMessageId;
/**
 * Decrypt an encrypted payload
 * @param encryptedPayload - Base64 encoded encrypted message
 * @param privateKey - RSA private key (optional for MVP)
 * @returns Decrypted plaintext message
 * @throws Error if decryption fails
 */
function decryptPayload(encryptedPayload, privateKey) {
    try {
        // MVP: Simple base64 decoding
        // Production: Implement full RSA + AES decryption here
        const buffer = Buffer.from(encryptedPayload, 'base64');
        const decrypted = buffer.toString('utf-8');
        return decrypted;
    }
    catch (error) {
        throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Validate decrypted payload structure
 * @param payload - Decrypted payload
 * @returns true if valid, false otherwise
 */
function validateDecryptedPayload(payload) {
    if (!payload || typeof payload !== 'string') {
        return false;
    }
    // MVP: Basic validation
    // Production: Validate against schema
    return payload.length > 0 && payload.length < 10000;
}
/**
 * Generate a unique message ID for tracking
 * @returns Unique message ID
 */
function generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
//# sourceMappingURL=decrypt.js.map