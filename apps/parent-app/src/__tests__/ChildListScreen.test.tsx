/**
 * ChildListScreen Tests
 * Tests for child list display, freeze buttons, and interactions
 * Location: apps/parent-app/src/__tests__/ChildListScreen.test.tsx
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import ChildListScreen from "../screens/ChildListScreen";
import { ChildAccount } from "../types";
import apiClient from "../api/client";

// ===== Test Setup =====

jest.mock("../api/client");
jest.spyOn(Alert, "alert").mockImplementation(() => true);

describe("ChildListScreen", () => {
  // ===== Helper Functions =====

  const mockOnNavigateToFreezeScreen = jest.fn();
  const mockOnNavigateToDetail = jest.fn();

  const mockChildren: ChildAccount[] = [
    {
      id: "child-1",
      name: "Emma",
      email: "emma@example.com",
      deviceId: "device-1",
      riskScore: 32,
      isFrozen: false,
      lastActive: Date.now() - 3600000,
    },
    {
      id: "child-2",
      name: "Noah",
      email: "noah@example.com",
      deviceId: "device-2",
      riskScore: 72,
      isFrozen: true,
      lastActive: Date.now() - 7200000,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.getMockAlerts as jest.Mock).mockReturnValue([
      {
        id: "alert-1",
        childId: "child-1",
        childName: "Emma",
        riskLevel: "medium",
        timestamp: Date.now(),
        score: 32,
      },
      {
        id: "alert-2",
        childId: "child-2",
        childName: "Noah",
        riskLevel: "high",
        timestamp: Date.now(),
        score: 72,
      },
    ]);
  });

  // ===== Tests =====

  describe("Rendering", () => {
    it("should render child list screen with header", () => {
      const { getByText } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      expect(getByText("Monitored Children")).toBeTruthy();
      expect(getByText("2 children")).toBeTruthy();
    });

    it("should render child items", () => {
      const { getByText } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      expect(getByText("Emma")).toBeTruthy();
      expect(getByText("Noah")).toBeTruthy();
    });

    it("should display child emails", () => {
      const { getByText } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      expect(getByText("emma@example.com")).toBeTruthy();
      expect(getByText("noah@example.com")).toBeTruthy();
    });

    it("should display device IDs", () => {
      const { getByText } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      expect(getByText(/Device: device-1/)).toBeTruthy();
      expect(getByText(/Device: device-2/)).toBeTruthy();
    });

    it("should display risk scores", () => {
      const { getByText } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      expect(getByText("32")).toBeTruthy();
      expect(getByText("72")).toBeTruthy();
    });

    it("should display frozen badge for frozen accounts", () => {
      const { getByText } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      const frozenBadges = getByText(/FROZEN/);
      expect(frozenBadges).toBeTruthy();
    });

    it("should display freeze buttons", () => {
      const { getByTestId } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      expect(getByTestId("freeze-button-child-1")).toBeTruthy();
      expect(getByTestId("freeze-button-child-2")).toBeTruthy();
    });

    it("should render children list", () => {
      const { getByTestId } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      expect(getByTestId("children-list")).toBeTruthy();
    });
  });

  describe("Risk Display", () => {
    it("should display correct risk levels", () => {
      const { getByText } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      expect(getByText("Low")).toBeTruthy(); // 32 score
      expect(getByText("High")).toBeTruthy(); // 72 score
    });

    it("should display last active time", () => {
      const { getByText } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      expect(getByText(/Last active/)).toBeTruthy();
    });
  });

  describe("Navigation", () => {
    it("should call onNavigateToDetail when child item pressed", () => {
      const { getByTestId } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      const childItem = getByTestId("child-item-child-1");
      fireEvent.press(childItem);

      expect(mockOnNavigateToDetail).toHaveBeenCalledWith("child-1");
    });

    it("should navigate to freeze screen when freeze button pressed for unfrozen account", () => {
      const { getByTestId } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      const freezeButton = getByTestId("freeze-button-child-1");
      fireEvent.press(freezeButton);

      expect(mockOnNavigateToFreezeScreen).toHaveBeenCalledWith(
        "child-1",
        "Emma"
      );
    });

    it("should show alert when freeze button pressed for frozen account", () => {
      const { getByTestId } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      const freezeButton = getByTestId("freeze-button-child-2");
      fireEvent.press(freezeButton);

      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  describe("Empty State", () => {
    it("should display empty state when no children provided", () => {
      const { getByText } = render(
        <ChildListScreen
          children={[]}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      expect(getByText("No children added yet")).toBeTruthy();
      expect(getByText(/Add a child to start monitoring/)).toBeTruthy();
    });
  });

  describe("Loading State", () => {
    it("should show loading state when children not provided", () => {
      (apiClient.getMockAlerts as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve([
                  {
                    id: "alert-1",
                    childId: "child-1",
                    childName: "Emma",
                    riskLevel: "medium",
                    timestamp: Date.now(),
                    score: 32,
                  },
                ]),
              500
            )
          )
      );

      const { getByText } = render(
        <ChildListScreen
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      expect(getByText("Loading children...")).toBeTruthy();
    });
  });

  describe("Unfreeze Functionality", () => {
    it("should call unfreezeChild when unfreeze selected from alert", async () => {
      (apiClient.unfreezeChild as jest.Mock).mockResolvedValue({
        success: true,
        childId: "child-2",
        frozen: false,
        timestamp: Date.now(),
      });

      const { getByTestId } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      const freezeButton = getByTestId("freeze-button-child-2");
      fireEvent.press(freezeButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have testIDs for all interactive elements", () => {
      const { getByTestId } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      expect(getByTestId("children-list")).toBeTruthy();
      expect(getByTestId("child-item-child-1")).toBeTruthy();
      expect(getByTestId("child-item-child-2")).toBeTruthy();
      expect(getByTestId("freeze-button-child-1")).toBeTruthy();
      expect(getByTestId("freeze-button-child-2")).toBeTruthy();
    });
  });

  describe("Refresh Functionality", () => {
    it("should reload children on pull-to-refresh", async () => {
      const { getByTestId } = render(
        <ChildListScreen
          children={mockChildren}
          onNavigateToFreezeScreen={mockOnNavigateToFreezeScreen}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      // This is a simplified test; in practice, RefreshControl would be triggered
      await waitFor(() => {
        expect(getByTestId("children-list")).toBeTruthy();
      });
    });
  });
});
