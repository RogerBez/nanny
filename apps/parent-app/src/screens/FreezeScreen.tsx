/**
 * FreezeScreen - Parent App
 * Form to freeze a child account with optional reason
 * Location: apps/parent-app/src/screens/FreezeScreen.tsx
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { FreezeUIState } from "../types";
import apiClient from "../api/client";

// ===== Component Props =====

interface FreezeScreenProps {
  childId?: string;
  childName?: string;
  onFreezeSuccess?: (childId: string) => void;
  onCancel?: () => void;
}

// ===== Component Implementation =====

export const FreezeScreen: React.FC<FreezeScreenProps> = ({
  childId: initialChildId,
  childName: initialChildName,
  onFreezeSuccess,
  onCancel,
}) => {
  // ===== State Management =====

  const [uiState, setUiState] = useState<FreezeUIState>({
    selectedChildId: initialChildId || null,
    reason: "",
    isSubmitting: false,
    error: null,
  });

  // ===== Event Handlers =====

  /**
   * Handle reason text change
   */
  const handleReasonChange = (text: string): void => {
    setUiState((prev) => ({
      ...prev,
      reason: text,
      error: null,
    }));
  };

  /**
   * Handle freeze button submission
   */
  const handleFreeze = async (): Promise<void> => {
    // Validation
    if (!uiState.selectedChildId) {
      setUiState((prev) => ({
        ...prev,
        error: "Please select a child",
      }));
      return;
    }

    // Set submitting state
    setUiState((prev) => ({
      ...prev,
      isSubmitting: true,
      error: null,
    }));

    try {
      console.log(
        "[FreezeScreen] Freezing child:",
        uiState.selectedChildId,
        "Reason:",
        uiState.reason
      );

      // Call freeze endpoint
      const response = await apiClient.freezeChild({
        childId: uiState.selectedChildId,
        reason: uiState.reason || undefined,
      });

      if (response.success && response.frozen) {
        // Show success alert
        Alert.alert(
          "Account Frozen",
          `${initialChildName || "Child"}'s account has been frozen.`,
          [
            {
              text: "OK",
              onPress: () => {
                // Clear form and call success callback
                setUiState({
                  selectedChildId: null,
                  reason: "",
                  isSubmitting: false,
                  error: null,
                });
                onFreezeSuccess?.(uiState.selectedChildId);
              },
            },
          ]
        );
      } else {
        throw new Error("Failed to freeze account");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to freeze account";

      console.error("[FreezeScreen] Freeze error:", err);

      setUiState((prev) => ({
        ...prev,
        error: errorMessage,
        isSubmitting: false,
      }));

      Alert.alert("Error", errorMessage);
    }
  };

  /**
   * Handle cancel button
   */
  const handleCancel = (): void => {
    if (uiState.reason) {
      Alert.alert("Discard changes?", "Your freeze request will not be sent.", [
        {
          text: "Discard",
          onPress: () => {
            setUiState({
              selectedChildId: initialChildId || null,
              reason: "",
              isSubmitting: false,
              error: null,
            });
            onCancel?.();
          },
          style: "destructive",
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } else {
      onCancel?.();
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
          <Text style={styles.headerTitle}>Freeze Account</Text>
          <Text style={styles.headerSubtitle}>
            Temporarily restrict messaging access
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>⚠️ Account Freeze</Text>
            <Text style={styles.infoCardText}>
              Freezing an account will:
            </Text>
            <View style={styles.infoList}>
              <Text style={styles.infoListItem}>
                • Prevent messaging on child's device
              </Text>
              <Text style={styles.infoListItem}>
                • Stop message ingestion temporarily
              </Text>
              <Text style={styles.infoListItem}>
                • Allow you to unfreeze anytime
              </Text>
              <Text style={styles.infoListItem}>
                • Be recorded in audit logs
              </Text>
            </View>
          </View>

          {/* Child Selection (if not pre-selected) */}
          {!initialChildId && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Child *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter child ID or name"
                placeholderTextColor="#999"
                testID="child-select-input"
              />
            </View>
          )}

          {/* Selected Child Display */}
          {(initialChildId || uiState.selectedChildId) && (
            <View style={styles.selectedChildContainer}>
              <Text style={styles.selectedChildLabel}>Selected Child</Text>
              <View style={styles.selectedChildCard}>
                <Text style={styles.selectedChildName}>
                  {initialChildName || uiState.selectedChildId}
                </Text>
                <Text style={styles.selectedChildId}>
                  {initialChildId || uiState.selectedChildId}
                </Text>
              </View>
            </View>
          )}

          {/* Reason Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Reason (Optional)</Text>
            <TextInput
              style={[styles.input, styles.reasonInput]}
              placeholder="Why are you freezing this account?"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={uiState.reason}
              onChangeText={handleReasonChange}
              editable={!uiState.isSubmitting}
              testID="reason-input"
            />
            <Text style={styles.characterCount}>
              {uiState.reason.length}/500
            </Text>
          </View>

          {/* Error Message */}
          {uiState.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{uiState.error}</Text>
            </View>
          )}

          {/* Warning Alert */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningTitle}>Important</Text>
            <Text style={styles.warningText}>
              This action is reversible. You can unfreeze the account at any
              time from the dashboard. All actions are logged for compliance.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={uiState.isSubmitting}
            testID="cancel-button"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.freezeButton,
              uiState.isSubmitting && styles.freezeButtonDisabled,
            ]}
            onPress={handleFreeze}
            disabled={uiState.isSubmitting}
            testID="freeze-submit-button"
          >
            {uiState.isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.freezeButtonText}>Freeze Account</Text>
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
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#f39c12",
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#856404",
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 13,
    color: "#856404",
    marginBottom: 8,
    fontWeight: "500",
  },
  infoList: {
    marginTop: 8,
  },
  infoListItem: {
    fontSize: 12,
    color: "#856404",
    marginBottom: 4,
    lineHeight: 16,
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
  reasonInput: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  characterCount: {
    fontSize: 11,
    color: "#95a5a6",
    marginTop: 4,
    textAlign: "right",
  },
  selectedChildContainer: {
    marginBottom: 20,
  },
  selectedChildLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#95a5a6",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  selectedChildCard: {
    backgroundColor: "#e8f4f8",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#3498db",
  },
  selectedChildName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 4,
  },
  selectedChildId: {
    fontSize: 12,
    color: "#7f8c8d",
    fontFamily: "monospace",
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
  warningContainer: {
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#27ae60",
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2e7d32",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  warningText: {
    fontSize: 12,
    color: "#2e7d32",
    lineHeight: 16,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ecf0f1",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2c3e50",
  },
  freezeButton: {
    flex: 1,
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  freezeButtonDisabled: {
    opacity: 0.6,
  },
  freezeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  footerSpacing: {
    height: 20,
  },
});

export default FreezeScreen;
