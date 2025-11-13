/**
 * API Client for Parent App
 * Handles all communication with Vigilance Engine backend
 * Location: apps/parent-app/src/api/client.ts
 */

import {
  IngestRequest,
  IngestResponse,
  ScoreRequest,
  ScoreResponse,
  FreezeRequest,
  FreezeResponse,
  GetFreezeStatusResponse,
  UnfreezeRequest,
  UnfreezeResponse,
  ApiError,
} from "../types";

// ===== Configuration =====

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";
const API_TIMEOUT = 10000; // 10 seconds

// ===== Mock Data for Development =====

const mockDashboardData = {
  messagesIngested: 1247,
  highRiskAlerts: 12,
  averageRiskScore: 42,
  frozenItems: 3,
};

const mockAlerts = [
  {
    id: "alert-1",
    childId: "child-1",
    childName: "Emma Johnson",
    riskLevel: "high" as const,
    timestamp: Date.now() - 3600000,
    message: "High-risk keywords detected in message",
    score: 75,
  },
  {
    id: "alert-2",
    childId: "child-2",
    childName: "Noah Smith",
    riskLevel: "critical" as const,
    timestamp: Date.now() - 7200000,
    message: "Critical threat detected - account frozen",
    score: 92,
  },
  {
    id: "alert-3",
    childId: "child-3",
    childName: "Olivia Brown",
    riskLevel: "medium" as const,
    timestamp: Date.now() - 10800000,
    message: "Medium risk activity",
    score: 45,
  },
];

// ===== API Client Class =====

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
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
   * POST /ingest - Ingest encrypted message from child app
   */
  async ingestMessage(payload: IngestRequest): Promise<IngestResponse> {
    console.log("[ApiClient] Ingesting message for child:", payload.childId);

    // Mock response for MVP testing
    if (process.env.NODE_ENV === "test" || !this.baseURL.includes("localhost")) {
      return {
        messageId: `msg-${Date.now()}`,
        success: true,
        timestamp: Date.now(),
      };
    }

    return this.request<IngestResponse>("/ingest", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * POST /score - Score a message for threat level
   */
  async scoreMessage(payload: ScoreRequest): Promise<ScoreResponse> {
    console.log("[ApiClient] Scoring message:", payload.messageId);

    // Mock response for MVP testing
    if (process.env.NODE_ENV === "test") {
      return {
        messageId: payload.messageId,
        score: Math.floor(Math.random() * 100),
        riskLevel: ["low", "medium", "high", "critical"][
          Math.floor(Math.random() * 4)
        ] as "low" | "medium" | "high" | "critical",
        flags: ["keyword_detected", "unusual_pattern"],
        reasoning: "Mock scoring for development",
        autoFrozen: false,
        timestamp: Date.now(),
      };
    }

    return this.request<ScoreResponse>("/score", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * POST /freeze - Freeze child account
   */
  async freezeChild(payload: FreezeRequest): Promise<FreezeResponse> {
    console.log("[ApiClient] Freezing child account:", payload.childId);

    if (process.env.NODE_ENV === "test") {
      return {
        success: true,
        childId: payload.childId,
        frozen: true,
        timestamp: Date.now(),
      };
    }

    return this.request<FreezeResponse>("/freeze", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * GET /freeze/:childId - Get freeze status for a child
   */
  async getFreezeStatus(childId: string): Promise<GetFreezeStatusResponse> {
    console.log("[ApiClient] Getting freeze status for child:", childId);

    if (process.env.NODE_ENV === "test") {
      return {
        childId,
        frozen: Math.random() > 0.7,
        timestamp: Date.now(),
      };
    }

    return this.request<GetFreezeStatusResponse>(`/freeze/${childId}`, {
      method: "GET",
    });
  }

  /**
   * POST /unfreeze - Unfreeze child account
   */
  async unfreezeChild(payload: UnfreezeRequest): Promise<UnfreezeResponse> {
    console.log("[ApiClient] Unfreezing child account:", payload.childId);

    if (process.env.NODE_ENV === "test") {
      return {
        success: true,
        childId: payload.childId,
        frozen: false,
        timestamp: Date.now(),
      };
    }

    return this.request<UnfreezeResponse>("/unfreeze", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * GET /health - Health check endpoint
   */
  async healthCheck(): Promise<{ status: string }> {
    console.log("[ApiClient] Health check...");

    return this.request<{ status: string }>("/health", {
      method: "GET",
    });
  }

  /**
   * Mock methods for development/testing
   */
  getMockDashboardData() {
    return mockDashboardData;
  }

  getMockAlerts() {
    return mockAlerts;
  }
}

// ===== Singleton Instance =====

export const apiClient = new ApiClient();

export default apiClient;
