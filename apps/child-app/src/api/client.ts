/**
 * API Client for Child App
 * Handles communication with Vigilance Engine backend
 * Integrates with encryption service for message transmission
 * Location: apps/child-app/src/api/client.ts
 */

import {
  MessageSendRequest,
  MessageSendResponse,
  EncryptedMessage,
  ApiError,
  PlainMessage,
} from "../types";
import encryptionService from "../utils/encryptionService";

// ===== Configuration =====

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";
const API_TIMEOUT = 10000; // 10 seconds

// ===== API Client Class =====

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private childId: string | null = null;
  private deviceId: string | null = null;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  /**
   * Set child identity for API requests
   */
  setChildIdentity(childId: string, deviceId: string): void {
    this.childId = childId;
    this.deviceId = deviceId;
    console.log("[ChildApiClient] Identity set:", { childId, deviceId });
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw {
          code: "HTTP_ERROR",
          message: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          timestamp: Date.now(),
        } as ApiError;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw {
        code: "NETWORK_ERROR",
        message: "Failed to communicate with backend",
        statusCode: 0,
        timestamp: Date.now(),
      } as ApiError;
    }
  }

  /**
   * Send message to backend with encryption
   * Encrypts message content before transmission
   * POST /ingest endpoint
   */
  async sendMessage(
    message: MessageSendRequest
  ): Promise<MessageSendResponse> {
    if (!this.childId || !this.deviceId) {
      throw new Error("Child identity not set");
    }

    if (!encryptionService.isReady()) {
      throw new Error("Encryption service not initialized");
    }

    console.log("[ChildApiClient] Sending message");

    try {
      // 1. Create plain message object
      const plainMessage: PlainMessage = {
        content: message.content,
        timestamp: Date.now(),
        deviceId: this.deviceId,
      };

      // 2. Encrypt the message
      const encryptedPayload = await encryptionService.encryptMessage(
        plainMessage
      );

      // 3. Validate encryption
      if (!encryptionService.validatePayload(encryptedPayload)) {
        throw new Error("Invalid encrypted payload");
      }

      // 4. Send to backend - POST /ingest
      // Expected request body: { childId, encryptedPayload, deviceId }
      const response = await this.request<MessageSendResponse>("/ingest", {
        method: "POST",
        body: JSON.stringify({
          childId: this.childId,
          encryptedPayload,
          deviceId: this.deviceId,
        }),
      });

      console.log("[ChildApiClient] Message sent successfully");
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message";
      console.error("[ChildApiClient] Send error:", err);
      throw new Error(errorMessage);
    }
  }

  /**
   * Check account status (frozen state)
   */
  async checkStatus(): Promise<{ frozen: boolean; reason?: string }> {
    if (!this.childId) {
      throw new Error("Child identity not set");
    }

    console.log("[ChildApiClient] Checking account status");

    try {
      // In MVP, this is a mock check
      // In production, would query /freeze/:childId endpoint
      const response = await this.request<{
        frozen: boolean;
        reason?: string;
      }>(`/freeze/${this.childId}`, {
        method: "GET",
      });

      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to check status";
      console.error("[ChildApiClient] Status check error:", err);
      throw new Error(errorMessage);
    }
  }

  /**
   * Initialize encryption with server's public key
   * Fetches the public key from backend (or can be bundled in app)
   */
  async initializeEncryption(): Promise<void> {
    console.log("[ChildApiClient] Initializing encryption");

    try {
      // For MVP, use a demo RSA public key
      // In production, this would be fetched from backend or bundled
      const demoPublicKey = this.getDemoPublicKey();

      await encryptionService.initialize(demoPublicKey);

      console.log("[ChildApiClient] Encryption initialized");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to initialize encryption";
      console.error("[ChildApiClient] Encryption init error:", err);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get health status from backend
   */
  async healthCheck(): Promise<{ status: string }> {
    console.log("[ChildApiClient] Health check...");

    return this.request<{ status: string }>("/health", {
      method: "GET",
    });
  }

  /**
   * Get demo RSA public key for MVP testing
   * In production, this should come from backend or be securely bundled
   */
  private getDemoPublicKey(): string {
    // This is a sample 2048-bit RSA public key in PEM format
    // For production, use a real key pair
    return `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1LfVLPHCozMxH2Mo
4lgOstBG51fCJxrVzNmVE5p6CQW1n2j+0XgJeWH6jy8IqHmC5VblXQK8xYWj4bRh
1z3pKvQs3e3EWgSI7BkDxCB52L5VIKCPz2lM0vEeCDZnDi5v2M6Zj5+Qcb3hQBXD
Fmh6dU+p3LrDyYAd1pJJq12qz7+DGUCVnLqDUDAcEkr7Wlr0k5Vz/q5pRPf3xZHK
XbvOMb0c8HjGsC4iR8Y6Kz32+cdLjuR/Z8BhKLw5p8G9qoHBxg9LAYlQhfEJLtKl
3PHNvJXW/yAaJ7vP2dEp1GQAjnqH7FhCJ5fXcOxdD+OYbhO9Zm42HVrCJH+fMUlA
FQIDAQAB
-----END PUBLIC KEY-----`;
  }
}

// ===== Singleton Instance =====

export const apiClient = new ApiClient();

export default apiClient;
