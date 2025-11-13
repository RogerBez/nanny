/**
 * MessageSenderScreen - Child App
 * Compose and send encrypted messages to parent
 * Location: apps/child-app/src/screens/MessageSenderScreen.tsx
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MessageComposerState } from "../types";
import apiClient from "../api/client";

// ===== Component Props =====

interface MessageSenderScreenProps {
  onMessageSent?: (messageId: string) => void;
  childName?: string;
}

// ===== Component Implementation =====

export const MessageSenderScreen: React.FC<MessageSenderScreenProps> = ({
  onMessageSent,
  childName,
}) => {
  // ===== State Management =====

  const [composerState, setComposerState] = useState<MessageComposerState>({
    content: "",
    isSending: false,
    error: null,
  });

  // ===== Event Handlers =====

  /**
   * Handle message content change
   */
  const handleContentChange = (text: string): void => {
    setComposerState((prev) => ({
      ...prev,
      content: text,
      error: null,
    }));
  };

  /**
   * Handle message submission
   */
  const handleSend = async (): Promise<void> => {
    // Validation
    if (!composerState.content.trim()) {
      setComposerState((prev) => ({
        ...prev,
        error: "Message cannot be empty",
      }));
      return;
    }

    if (composerState.content.trim().length < 1) {
      setComposerState((prev) => ({
        ...prev,
        error: "Message is too short",
      }));
      return;
    }

    if (composerState.content.trim().length > 2000) {
      setComposerState((prev) => ({
        ...prev,
        error: "Message is too long (max 2000 characters)",
      }));
      return;
    }

    // Set sending state
    setComposerState((prev) => ({
      ...prev,
      isSending: true,
      error: null,
    }));

    try {
      console.log("[MessageSenderScreen] Sending message...");

      // Send encrypted message
      const response = await apiClient.sendMessage({
        content: composerState.content.trim(),
      });

      if (response.success) {
        console.log("[MessageSenderScreen] Message sent:", response.messageId);

        // Show success alert
        Alert.alert(
          "Message Sent",
          "Your message has been safely encrypted and sent.",
          [
            {
              text: "OK",
              onPress: () => {
                // Clear form
                setComposerState({
                  content: "",
                  isSending: false,
                  error: null,
                });

                // Call callback
                onMessageSent?.(response.messageId);
              },
            },
          ]
        );
      } else if (response.frozen) {
        // Account is frozen
        Alert.alert(
          "Account Frozen",
          response.frozenReason || "Your account has been frozen.",
          [{ text: "OK" }]
        );

        setComposerState((prev) => ({
          ...prev,
          isSending: false,
          error: "Account frozen - cannot send messages",
        }));
      } else {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again.";

      console.error("[MessageSenderScreen] Send error:", err);

      setComposerState((prev) => ({
        ...prev,
        isSending: false,
        error: errorMessage,
      }));

      Alert.alert("Error", errorMessage);
    }
  };

  /**
   * Handle clear message
   */
  const handleClear = (): void => {
    if (composerState.content.trim()) {
      Alert.alert("Clear message?", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: () => {
            setComposerState({
              content: "",
              isSending: false,
              error: null,
            });
          },
          style: "destructive",
        },
      ]);
    }
  };

  // ===== Render =====

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Send Message</Text>
          <Text style={styles.headerSubtitle}>
            {childName ? `Sending as ${childName}` : "Compose a new message"}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>🔒 Encrypted Message</Text>
            <Text style={styles.infoCardText}>
              Your message will be encrypted end-to-end before sending to your
              parent.
            </Text>
          </View>

          {/* Message Composer */}
          <View style={styles.composerSection}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={[styles.input, styles.messageInput]}
                placeholder="Type your message here..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                editable={!composerState.isSending}
                value={composerState.content}
                onChangeText={handleContentChange}
                testID="message-input"
              />
              <View style={styles.characterCountContainer}>
                <Text style={styles.characterCount}>
                  {composerState.content.length}/2000
                </Text>
                {composerState.content.length > 1700 && (
                  <Text style={styles.warningText}>Approaching limit</Text>
                )}
              </View>
            </View>
          </View>

          {/* Error Message */}
          {composerState.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{composerState.error}</Text>
            </View>
          )}

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Tips</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipsItem}>
                • Be respectful and honest in your communication
              </Text>
              <Text style={styles.tipsItem}>
                • Your parent can see your messages to keep you safe
              </Text>
              <Text style={styles.tipsItem}>
                • Messages are encrypted for privacy
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.clearButton,
              (composerState.isSending || !composerState.content.trim()) &&
                styles.clearButtonDisabled,
            ]}
            onPress={handleClear}
            disabled={composerState.isSending || !composerState.content.trim()}
            testID="clear-button"
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sendButton,
              (composerState.isSending || !composerState.content.trim()) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={composerState.isSending || !composerState.content.trim()}
            testID="send-button"
          >
            {composerState.isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Send Message</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Spacing */}
        <View style={styles.footerSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ===== Styles =====

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    backgroundColor: "#2c3e50",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#ecf0f1",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoCard: {
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#27ae60",
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2e7d32",
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 13,
    color: "#2e7d32",
    lineHeight: 18,
  },
  composerSection: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#2c3e50",
  },
  messageInput: {
    height: 150,
    paddingTop: 12,
    paddingBottom: 12,
  },
  characterCountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  characterCount: {
    fontSize: 11,
    color: "#95a5a6",
  },
  warningText: {
    fontSize: 11,
    color: "#f39c12",
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#c62828",
  },
  errorText: {
    color: "#c62828",
    fontSize: 13,
    fontWeight: "500",
  },
  tipsCard: {
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f39c12",
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#856404",
    marginBottom: 8,
  },
  tipsList: {
    marginTop: 8,
  },
  tipsItem: {
    fontSize: 12,
    color: "#856404",
    marginBottom: 6,
    lineHeight: 16,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    gap: 12,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#ecf0f1",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  clearButtonDisabled: {
    opacity: 0.5,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2c3e50",
  },
  sendButton: {
    flex: 1,
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  footerSpacing: {
    height: 20,
  },
});

export default MessageSenderScreen;
