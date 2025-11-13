/**
 * Decryption utility for message payloads
 * MVP: Simple base64 decoding
 * Production: RSA key unwrap + AES-256-GCM decryption
 */
/**
 * Decrypt an encrypted payload
 * @param encryptedPayload - Base64 encoded encrypted message
 * @param privateKey - RSA private key (optional for MVP)
 * @returns Decrypted plaintext message
 * @throws Error if decryption fails
 */
export declare function decryptPayload(encryptedPayload: string, privateKey?: string): string;
/**
 * Validate decrypted payload structure
 * @param payload - Decrypted payload
 * @returns true if valid, false otherwise
 */
export declare function validateDecryptedPayload(payload: string): boolean;
/**
 * Generate a unique message ID for tracking
 * @returns Unique message ID
 */
export declare function generateMessageId(): string;
//# sourceMappingURL=decrypt.d.ts.map