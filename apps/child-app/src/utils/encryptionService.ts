/**
 * Encryption Service - Child App
 * Handles RSA key unwrap and AES-256-GCM encryption for messages
 * Location: apps/child-app/src/utils/encryptionService.ts
 */

import { PlainMessage, EncryptedPayload } from "../types";

// ===== Constants =====

const ALGORITHM_NAME = "RSA-OAEP";
const ENCRYPTION_ALGORITHM = "AES-GCM";
const KEY_SIZE = 256; // AES-256
const IV_SIZE = 96; // 96-bit IV for GCM
const TAG_SIZE = 128; // 128-bit auth tag

// ===== Encryption Service Class =====

class EncryptionService {
  private publicKey: CryptoKey | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize encryption service with public key
   * This extracts the RSA public key from PEM format
   */
  async initialize(publicKeyPem: string): Promise<void> {
    try {
      console.log("[EncryptionService] Initializing with RSA public key");

      // Extract base64 from PEM format
      // PEM format: -----BEGIN PUBLIC KEY-----\nbase64\n-----END PUBLIC KEY-----
      const publicKeyBase64 = publicKeyPem
        .replace("-----BEGIN PUBLIC KEY-----", "")
        .replace("-----END PUBLIC KEY-----", "")
        .replace(/\s/g, "");

      // Convert base64 to ArrayBuffer
      const publicKeyDer = this.base64ToArrayBuffer(publicKeyBase64);

      // Import the key using Web Crypto API
      this.publicKey = await crypto.subtle.importKey(
        "spki",
        publicKeyDer,
        {
          name: ALGORITHM_NAME,
          hash: "SHA-256",
        },
        false, // Not extractable
        ["wrapKey"] // Usage
      );

      this.isInitialized = true;
      console.log("[EncryptionService] Successfully initialized");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to initialize encryption service";
      console.error("[EncryptionService] Initialization error:", err);
      throw new Error(`Failed to initialize encryption: ${errorMessage}`);
    }
  }

  /**
   * Encrypt a plain message with AES-256-GCM
   * Returns encrypted payload with IV, ciphertext, and auth tag
   */
  async encryptMessage(
    message: PlainMessage
  ): Promise<EncryptedPayload> {
    if (!this.isInitialized || !this.publicKey) {
      throw new Error("Encryption service not initialized");
    }

    try {
      console.log("[EncryptionService] Encrypting message");

      // 1. Generate random AES-256 key
      const aesKey = await crypto.subtle.generateKey(
        {
          name: ENCRYPTION_ALGORITHM,
          length: KEY_SIZE,
        },
        true, // Extractable so we can wrap it
        ["encrypt"]
      );

      // 2. Generate random IV for GCM
      const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE / 8));

      // 3. Serialize and encrypt the message content
      const messageJson = JSON.stringify(message);
      const messageData = new TextEncoder().encode(messageJson);

      const ciphertext = await crypto.subtle.encrypt(
        {
          name: ENCRYPTION_ALGORITHM,
          iv,
          tagLength: TAG_SIZE,
        },
        aesKey,
        messageData
      );

      // 4. Wrap the AES key with RSA public key
      const wrappedKey = await crypto.subtle.wrapKey(
        "raw",
        aesKey,
        this.publicKey,
        ALGORITHM_NAME
      );

      // 5. Return encrypted payload
      const payload: EncryptedPayload = {
        iv: this.arrayBufferToBase64(iv.buffer),
        ciphertext: this.arrayBufferToBase64(ciphertext),
        tag: this.arrayBufferToBase64(wrappedKey),
      };

      console.log("[EncryptionService] Message encrypted successfully");
      return payload;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Encryption failed";
      console.error("[EncryptionService] Encryption error:", err);
      throw new Error(`Failed to encrypt message: ${errorMessage}`);
    }
  }

  /**
   * Verify encrypted payload structure
   */
  validatePayload(payload: EncryptedPayload): boolean {
    return !!(
      payload &&
      payload.iv &&
      payload.ciphertext &&
      payload.tag &&
      typeof payload.iv === "string" &&
      typeof payload.ciphertext === "string" &&
      typeof payload.tag === "string"
    );
  }

  /**
   * Generate a unique message ID
   */
  generateMessageId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `msg-${timestamp}-${random}`;
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const byteArray = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < byteArray.byteLength; i++) {
      binary += String.fromCharCode(byteArray[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Check if service is initialized and ready
   */
  isReady(): boolean {
    return this.isInitialized && this.publicKey !== null;
  }

  /**
   * Reset encryption service
   */
  reset(): void {
    this.publicKey = null;
    this.isInitialized = false;
    console.log("[EncryptionService] Service reset");
  }
}

// ===== Singleton Instance =====

export const encryptionService = new EncryptionService();

export default encryptionService;
