/**
 * Child App Types
 * Types specific to child app (message encryption, child auth, etc.)
 * Location: apps/child-app/src/types/index.ts
 */

// ===== Authentication Types =====

export interface AuthState {
  isLoggedIn: boolean;
  user: ChildUser | null;
  loading: boolean;
  error: string | null;
}

export interface ChildUser {
  id: string;
  email: string;
  name: string;
  parentEmail: string;
  deviceId: string;
  createdAt: number;
}

// ===== Message Types =====

export interface PlainMessage {
  content: string;
  timestamp: number;
  deviceId: string;
}

export interface EncryptedPayload {
  iv: string;
  ciphertext: string;
  tag: string;
}

export interface EncryptedMessage {
  messageId: string;
  childId: string;
  encryptedPayload: EncryptedPayload;
  deviceId: string;
  timestamp: number;
}

export interface MessageSendRequest {
  content: string;
  recipient?: string;
}

export interface MessageSendResponse {
  success: boolean;
  messageId: string;
  timestamp: number;
  frozen?: boolean;
  frozenReason?: string;
}

// ===== Encryption Types =====

export interface EncryptionConfig {
  publicKeyPem: string;
  algorithm: "RSA" | "AES";
}

export interface DecryptionResult {
  success: boolean;
  payload?: PlainMessage;
  error?: string;
}

// ===== API Client Types =====

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  timestamp: number;
}

// ===== UI State Types =====

export interface MessageComposerState {
  content: string;
  isSending: boolean;
  error: string | null;
}

export interface StatusUIState {
  isFrozen: boolean;
  freezeReason?: string;
  lastMessage?: {
    id: string;
    timestamp: number;
    status: "sent" | "received" | "error";
  };
}

// ===== Navigation Types =====

export type ChildStackParamList = {
  Login: undefined;
  Registration: undefined;
  Status: undefined;
  MessageSender: undefined;
  FrozenScreen: { reason?: string };
};
