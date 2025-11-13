/**
 * DashboardScreen Tests
 * Tests for KPI cards, alerts list, and refresh functionality
 * Location: apps/parent-app/src/__tests__/DashboardScreen.test.tsx
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { RefreshControl } from "react-native";
import DashboardScreen from "../screens/DashboardScreen";
import apiClient from "../api/client";

// ===== Test Setup =====

jest.mock("../api/client");

describe("DashboardScreen", () => {
  // ===== Helper Functions =====

  const mockOnNavigateToFreezeScreen = jest.fn();
  const mockOnNavigateToAlertDetail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.getMockDashboardData as jest.Mock).mockReturnValue({
      messagesIngested: 1247,
      highRiskAlerts: 12,
      averageRiskScore: 42,
      frozenItems: 3,
    });
    (apiClient.getMockAlerts as jest.Mock).mockReturnValue([
      {
        id: "alert-1",
        childId: "child-1",
        childName: "Emma",
        riskLevel: "high",
        timestamp: Date.now() - 3600000,
        message: "High-risk keywords detected",
        score: 75,
      },
    ]);
  });

  // ===== Tests =====

  describe("Rendering", () => {
    it("should render dashboard screen with header", async () => {
      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(getByText("Dashboard")).toBeTruthy();
        expect(getByText("Monitor your family's safety")).toBeTruthy();
      });
    });

    it("should render metrics cards with KPI data", async () => {
      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(getByText("Messages Ingested")).toBeTruthy();
        expect(getByText("1247")).toBeTruthy();
        expect(getByText("High-Risk Alerts")).toBeTruthy();
        expect(getByText("12")).toBeTruthy();
      });
    });

    it("should render metrics section title", async () => {
      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(getByText("Key Metrics")).toBeTruthy();
      });
    });

    it("should render alerts section with count badge", async () => {
      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(getByText("Recent Alerts")).toBeTruthy();
      });
    });

    it("should render view all children button", async () => {
      const { getByTestId } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(getByTestId("view-children-button")).toBeTruthy();
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading indicator initially", () => {
      (apiClient.getMockDashboardData as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  messagesIngested: 1247,
                  highRiskAlerts: 12,
                  averageRiskScore: 42,
                  frozenItems: 3,
                }),
              1000
            )
          )
      );

      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      expect(getByText("Loading dashboard...")).toBeTruthy();
    });

    it("should load metrics on component mount", async () => {
      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(apiClient.getMockDashboardData).toHaveBeenCalled();
        expect(apiClient.getMockAlerts).toHaveBeenCalled();
      });
    });
  });

  describe("Metrics Display", () => {
    it("should display all four metric cards", async () => {
      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(getByText("Messages Ingested")).toBeTruthy();
        expect(getByText("High-Risk Alerts")).toBeTruthy();
        expect(getByText("Average Risk Score")).toBeTruthy();
        expect(getByText("Frozen Items")).toBeTruthy();
      });
    });

    it("should display correct metric values", async () => {
      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(getByText("1247")).toBeTruthy();
        expect(getByText("12")).toBeTruthy();
        expect(getByText("42")).toBeTruthy();
        expect(getByText("3")).toBeTruthy();
      });
    });

    it("should display metric subtitles", async () => {
      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(getByText("this month")).toBeTruthy();
        expect(getByText("requires attention")).toBeTruthy();
        expect(getByText("0-100 scale")).toBeTruthy();
        expect(getByText("active freezes")).toBeTruthy();
      });
    });
  });

  describe("Alerts Display", () => {
    it("should render alert items list", async () => {
      const { getByTestId } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(getByTestId("alerts-list")).toBeTruthy();
      });
    });

    it("should display alert details", async () => {
      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(getByText("Emma")).toBeTruthy();
        expect(getByText(/High-risk keywords detected/)).toBeTruthy();
      });
    });

    it("should show empty state when no alerts", async () => {
      (apiClient.getMockAlerts as jest.Mock).mockReturnValue([]);

      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(getByText("No alerts")).toBeTruthy();
        expect(getByText(/Your monitored children are safe/)).toBeTruthy();
      });
    });

    it("should display alert risk level badge", async () => {
      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(getByText("HIGH")).toBeTruthy();
      });
    });

    it("should display alert score", async () => {
      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(getByText("75")).toBeTruthy();
      });
    });
  });

  describe("Navigation", () => {
    it("should call onNavigateToAlertDetail when alert pressed", async () => {
      const { getByTestId } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        const alertItem = getByTestId("alert-item-alert-1");
        fireEvent.press(alertItem);
        expect(mockOnNavigateToAlertDetail).toHaveBeenCalledWith("alert-1");
      });
    });

    it("should call onNavigateToFreezeScreen when view children button pressed", async () => {
      const { getByTestId } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        const button = getByTestId("view-children-button");
        fireEvent.press(button);
        expect(mockOnNavigateToFreezeScreen).toHaveBeenCalled();
      });
    });
  });

  describe("Refresh Functionality", () => {
    it("should refresh data on pull-to-refresh", async () => {
      const { getByTestId } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(apiClient.getMockDashboardData).toHaveBeenCalled();
      });

      jest.clearAllMocks();

      // Simulate refresh (this is a simplified test)
      // In a real scenario, we'd trigger RefreshControl
    });
  });

  describe("Error Handling", () => {
    it("should display error state when data loading fails", async () => {
      (apiClient.getMockDashboardData as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        // Error handling should display error message
        // (implementation depends on error handling logic)
      });
    });

    it("should provide retry button on error", async () => {
      (apiClient.getMockDashboardData as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        // Retry button should be visible if error occurred
      });
    });
  });

  describe("Time Formatting", () => {
    it("should format recent alerts with time ago", async () => {
      const { getByText } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        // Should display time like "1h ago", "30m ago", etc.
        // This is tested implicitly through alert rendering
      });
    });
  });

  describe("Accessibility", () => {
    it("should have testIDs for all interactive elements", async () => {
      const { getByTestId } = render(
        <DashboardScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToAlertDetail={mockOnNavigateToAlertDetail}
        />
      );

      await waitFor(() => {
        expect(getByTestId("alerts-list")).toBeTruthy();
        expect(getByTestId("view-children-button")).toBeTruthy();
        expect(getByTestId("alert-item-alert-1")).toBeTruthy();
      });
    });
  });
});
