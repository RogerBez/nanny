/**
 * DashboardScreen - Parent App
 * Main dashboard showing KPI cards and recent alerts
 * Location: apps/parent-app/src/screens/DashboardScreen.tsx
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from "react-native";
import { AlertItem, DashboardMetrics } from "../types";
import apiClient from "../api/client";

// ===== Component Props =====

interface DashboardScreenProps {
  onNavigateToFreezeScreen?: (childId: string) => void;
  onNavigateToAlertDetail?: (alertId: string) => void;
}

// ===== Component Implementation =====

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToFreezeScreen,
  onNavigateToAlertDetail,
}) => {
  // ===== State Management =====

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== Effects =====

  /**
   * Load dashboard data on mount
   */
  useEffect(() => {
    loadDashboardData();
  }, []);

  // ===== Data Loading =====

  /**
   * Fetch dashboard metrics and recent alerts
   */
  const loadDashboardData = async (): Promise<void> => {
    try {
      setError(null);

      // Fetch metrics (mock for MVP)
      const mockMetrics = apiClient.getMockDashboardData();
      setMetrics(mockMetrics);

      // Fetch recent alerts
      const recentAlerts = apiClient.getMockAlerts();
      setAlerts(recentAlerts);

      console.log("[DashboardScreen] Dashboard data loaded");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load dashboard";
      setError(errorMessage);
      console.error("[DashboardScreen] Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Pull-to-refresh handler
   */
  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // ===== UI Helpers =====

  /**
   * Get color for risk level badge
   */
  const getRiskLevelColor = (
    riskLevel: "low" | "medium" | "high" | "critical"
  ): string => {
    const colors = {
      low: "#27ae60", // Green
      medium: "#f39c12", // Orange
      high: "#e74c3c", // Red
      critical: "#8b0000", // Dark red
    };
    return colors[riskLevel];
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

  // ===== Render Sections =====

  /**
   * Render KPI card
   */
  const renderMetricCard = (
    title: string,
    value: number | string,
    subtitle?: string,
    color?: string
  ) => (
    <View style={[styles.metricCard, color && { borderLeftColor: color }]}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  /**
   * Render alert item
   */
  const renderAlertItem = ({ item }: { item: AlertItem }) => (
    <TouchableOpacity
      style={styles.alertItem}
      onPress={() => onNavigateToAlertDetail?.(item.id)}
      testID={`alert-item-${item.id}`}
    >
      <View
        style={[
          styles.alertIndicator,
          { backgroundColor: getRiskLevelColor(item.riskLevel) },
        ]}
      />
      <View style={styles.alertContent}>
        <View style={styles.alertHeader}>
          <Text style={styles.alertChildName}>{item.childName}</Text>
          <Text style={styles.alertTime}>{formatTimeAgo(item.timestamp)}</Text>
        </View>
        <Text style={styles.alertMessage} numberOfLines={2}>
          {item.message || "Alert generated"}
        </Text>
        <View style={styles.alertFooter}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Score:</Text>
            <Text
              style={[
                styles.scoreValue,
                { color: getRiskLevelColor(item.riskLevel) },
              ]}
            >
              {item.score}
            </Text>
          </View>
          <View style={styles.riskBadge}>
            <Text style={styles.riskBadgeText}>
              {item.riskLevel.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ===== Render Main =====

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#3498db"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Monitor your family's safety</Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadDashboardData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Metrics Section */}
      {metrics && (
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              "Messages Ingested",
              metrics.messagesIngested,
              "this month",
              "#3498db"
            )}
            {renderMetricCard(
              "High-Risk Alerts",
              metrics.highRiskAlerts,
              "requires attention",
              "#e74c3c"
            )}
            {renderMetricCard(
              "Average Risk Score",
              metrics.averageRiskScore,
              "0-100 scale",
              "#f39c12"
            )}
            {renderMetricCard(
              "Frozen Items",
              metrics.frozenItems,
              "active freezes",
              "#8b0000"
            )}
          </View>
        </View>
      )}

      {/* Recent Alerts Section */}
      <View style={styles.alertsSection}>
        <View style={styles.alertsHeader}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          {alerts.length > 0 && (
            <Text style={styles.alertCount}>{alerts.length}</Text>
          )}
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No alerts</Text>
            <Text style={styles.emptyStateText}>
              Your monitored children are safe
            </Text>
          </View>
        ) : (
          <FlatList
            data={alerts}
            renderItem={renderAlertItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            testID="alerts-list"
          />
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onNavigateToFreezeScreen?.("")}
          testID="view-children-button"
        >
          <Text style={styles.actionButtonText}>View All Children</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Spacing */}
      <View style={styles.footerSpacing} />
    </ScrollView>
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
  metricsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 12,
  },
  metricsGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7f8c8d",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 11,
    color: "#95a5a6",
    fontStyle: "italic",
  },
  alertsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  alertsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  alertCount: {
    backgroundColor: "#3498db",
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  alertItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  alertIndicator: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  alertChildName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
  },
  alertTime: {
    fontSize: 12,
    color: "#95a5a6",
  },
  alertMessage: {
    fontSize: 13,
    color: "#7f8c8d",
    marginBottom: 8,
    lineHeight: 18,
  },
  alertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 11,
    color: "#95a5a6",
    marginRight: 4,
    fontWeight: "500",
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#e74c3c",
  },
  riskBadge: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2c3e50",
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  footerSpacing: {
    height: 20,
  },
});

export default DashboardScreen;
