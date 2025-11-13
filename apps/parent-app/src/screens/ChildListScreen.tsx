/**
 * ChildListScreen - Parent App
 * Shows list of monitored children with risk badges and freeze buttons
 * Location: apps/parent-app/src/screens/ChildListScreen.tsx
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { ChildAccount } from "../types";
import apiClient from "../api/client";

// ===== Component Props =====

interface ChildListScreenProps {
  children?: ChildAccount[];
  onNavigateToFreezeScreen?: (childId: string, childName: string) => void;
  onNavigateToDetail?: (childId: string) => void;
}

// ===== Component Implementation =====

export const ChildListScreen: React.FC<ChildListScreenProps> = ({
  children: initialChildren,
  onNavigateToFreezeScreen,
  onNavigateToDetail,
}) => {
  // ===== State Management =====

  const [children, setChildren] = useState<ChildAccount[]>(initialChildren || []);
  const [loading, setLoading] = useState(!initialChildren);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== Effects =====

  /**
   * Load children on mount if not provided
   */
  useEffect(() => {
    if (!initialChildren) {
      loadChildren();
    }
  }, [initialChildren]);

  // ===== Data Loading =====

  /**
   * Fetch list of children
   */
  const loadChildren = async (): Promise<void> => {
    try {
      setError(null);

      // Get mock children from API client dashboard data
      const mockAlerts = apiClient.getMockAlerts();

      // Create unique children list from alerts
      const childrenMap = new Map<string, ChildAccount>();
      mockAlerts.forEach((alert) => {
        if (!childrenMap.has(alert.childId)) {
          childrenMap.set(alert.childId, {
            id: alert.childId,
            name: alert.childName,
            email: `${alert.childName.toLowerCase()}@example.com`,
            deviceId: `device-${Math.random().toString(36).substr(2, 9)}`,
            riskScore: alert.score,
            isFrozen: Math.random() > 0.7,
            lastActive: alert.timestamp,
          });
        }
      });

      const childrenList = Array.from(childrenMap.values());
      setChildren(childrenList);

      console.log("[ChildListScreen] Loaded", childrenList.length, "children");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load children";
      setError(errorMessage);
      console.error("[ChildListScreen] Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Pull-to-refresh handler
   */
  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadChildren();
    setRefreshing(false);
  };

  // ===== Event Handlers =====

  /**
   * Handle freeze button tap
   */
  const handleFreezePress = (child: ChildAccount): void => {
    if (child.isFrozen) {
      Alert.alert(
        "Account Frozen",
        `${child.name}'s account is already frozen.`,
        [
          {
            text: "Unfreeze",
            onPress: () => handleUnfreeze(child),
            style: "destructive",
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } else {
      onNavigateToFreezeScreen?.(child.id, child.name);
    }
  };

  /**
   * Handle unfreeze request
   */
  const handleUnfreeze = async (child: ChildAccount): Promise<void> => {
    try {
      setError(null);

      // Call unfreeze endpoint
      const response = await apiClient.unfreezeChild({ childId: child.id });

      if (response.success) {
        // Update local state
        const updatedChildren = children.map((c) =>
          c.id === child.id ? { ...c, isFrozen: false } : c
        );
        setChildren(updatedChildren);

        Alert.alert(
          "Success",
          `${child.name}'s account has been unfrozen.`,
          [{ text: "OK" }]
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to unfreeze account";
      Alert.alert("Error", errorMessage);
      console.error("[ChildListScreen] Unfreeze error:", err);
    }
  };

  // ===== UI Helpers =====

  /**
   * Get risk level color and label
   */
  const getRiskLevel = (score: number): { level: string; color: string } => {
    if (score < 30) return { level: "Low", color: "#27ae60" };
    if (score < 60) return { level: "Medium", color: "#f39c12" };
    if (score < 80) return { level: "High", color: "#e74c3c" };
    return { level: "Critical", color: "#8b0000" };
  };

  /**
   * Format timestamp to relative time
   */
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // ===== Render Child Item =====

  /**
   * Render child account card
   */
  const renderChildItem = ({ item }: { item: ChildAccount }) => {
    const riskInfo = getRiskLevel(item.riskScore);

    return (
      <TouchableOpacity
        style={styles.childCard}
        onPress={() => onNavigateToDetail?.(item.id)}
        testID={`child-item-${item.id}`}
      >
        {/* Frozen Badge */}
        {item.isFrozen && (
          <View style={styles.frozenBadge}>
            <Text style={styles.frozenBadgeText}>🔒 FROZEN</Text>
          </View>
        )}

        {/* Child Info */}
        <View style={styles.childInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.childName}>{item.name}</Text>
            <Text style={styles.lastActive}>
              Last active: {formatTimeAgo(item.lastActive)}
            </Text>
          </View>
          <Text style={styles.childEmail}>{item.email}</Text>
          <Text style={styles.deviceId}>Device: {item.deviceId}</Text>
        </View>

        {/* Risk Badge */}
        <View
          style={[styles.riskBadge, { borderLeftColor: riskInfo.color }]}
        >
          <Text style={styles.riskScore}>{item.riskScore}</Text>
          <Text style={[styles.riskLevel, { color: riskInfo.color }]}>
            {riskInfo.level}
          </Text>
        </View>

        {/* Freeze Button */}
        <TouchableOpacity
          style={[
            styles.freezeButton,
            item.isFrozen && styles.freezeButtonActive,
          ]}
          onPress={() => handleFreezePress(item)}
          testID={`freeze-button-${item.id}`}
        >
          <Text
            style={[
              styles.freezeButtonText,
              item.isFrozen && styles.freezeButtonTextActive,
            ]}
          >
            {item.isFrozen ? "Unfreeze" : "Freeze"}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // ===== Render Main =====

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading children...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monitored Children</Text>
        <Text style={styles.headerSubtitle}>
          {children.length} {children.length === 1 ? "child" : "children"}
        </Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadChildren}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Children List */}
      {children.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No children added yet</Text>
          <Text style={styles.emptyStateText}>
            Add a child to start monitoring
          </Text>
        </View>
      ) : (
        <FlatList
          data={children}
          renderItem={renderChildItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#3498db"
            />
          }
          contentContainerStyle={styles.listContent}
          testID="children-list"
        />
      )}
    </View>
  );
};

// ===== Styles =====

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#7f8c8d",
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
  errorContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#ffebee",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#c62828",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: "#c62828",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
  },
  childCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  frozenBadge: {
    backgroundColor: "#8b0000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  frozenBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  childInfo: {
    flex: 1,
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  childName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
  },
  lastActive: {
    fontSize: 12,
    color: "#95a5a6",
  },
  childEmail: {
    fontSize: 13,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 11,
    color: "#95a5a6",
    fontStyle: "italic",
  },
  riskBadge: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  riskScore: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
  },
  riskLevel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  freezeButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  freezeButtonActive: {
    backgroundColor: "#27ae60",
  },
  freezeButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  freezeButtonTextActive: {
    color: "#fff",
  },
});

export default ChildListScreen;
