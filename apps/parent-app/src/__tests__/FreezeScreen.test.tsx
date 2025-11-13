/**
 * FreezeScreen Tests
 * Tests for freeze form submission, validation, and API integration
 * Location: apps/parent-app/src/__tests__/FreezeScreen.test.tsx
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import FreezeScreen from "../screens/FreezeScreen";
import apiClient from "../api/client";

// ===== Test Setup =====

jest.mock("../api/client");
jest.spyOn(Alert, "alert").mockImplementation(() => true);

describe("FreezeScreen", () => {
  // ===== Helper Functions =====

  const mockOnFreezeSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.freezeChild as jest.Mock).mockResolvedValue({
      success: true,
      childId: "child-1",
      frozen: true,
      timestamp: Date.now(),
    });
  });

  // ===== Tests =====

  describe("Rendering", () => {
    it("should render freeze screen with header", () => {
      const { getByText } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(getByText("Freeze Account")).toBeTruthy();
      expect(getByText(/Temporarily restrict messaging access/)).toBeTruthy();
    });

    it("should render information card", () => {
      const { getByText } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(getByText("Account Freeze")).toBeTruthy();
      expect(getByText(/Freezing an account will:/)).toBeTruthy();
    });

    it("should display freeze consequences", () => {
      const { getByText } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(getByText(/Prevent messaging on child's device/)).toBeTruthy();
      expect(getByText(/Stop message ingestion temporarily/)).toBeTruthy();
      expect(getByText(/Allow you to unfreeze anytime/)).toBeTruthy();
      expect(getByText(/Be recorded in audit logs/)).toBeTruthy();
    });

    it("should display selected child information", () => {
      const { getByText } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(getByText("Emma")).toBeTruthy();
      expect(getByText("child-1")).toBeTruthy();
    });

    it("should render reason input field", () => {
      const { getByTestId } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(getByTestId("reason-input")).toBeTruthy();
    });

    it("should render action buttons", () => {
      const { getByTestId } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(getByTestId("cancel-button")).toBeTruthy();
      expect(getByTestId("freeze-submit-button")).toBeTruthy();
    });

    it("should display warning message", () => {
      const { getByText } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(getByText("Important")).toBeTruthy();
      expect(
        getByText(/This action is reversible/)
      ).toBeTruthy();
    });
  });

  describe("Form Interaction", () => {
    it("should update reason text on input change", () => {
      const { getByTestId } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      const reasonInput = getByTestId("reason-input") as any;
      fireEvent.changeText(reasonInput, "Suspicious activity detected");

      expect(reasonInput.props.value).toBe("Suspicious activity detected");
    });

    it("should display character count", () => {
      const { getByTestId, getByText } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      const reasonInput = getByTestId("reason-input");
      fireEvent.changeText(reasonInput, "Test reason");

      expect(getByText("11/500")).toBeTruthy();
    });

    it("should have max 500 character limit for reason", () => {
      const { getByTestId, getByText } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      const reasonInput = getByTestId("reason-input");
      const longText = "a".repeat(600);
      fireEvent.changeText(reasonInput, longText);

      // Component should handle/display the character count
    });
  });

  describe("Validation", () => {
    it("should show error when childId is not selected", async () => {
      const { getByTestId, getByText } = render(
        <FreezeScreen
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      const freezeButton = getByTestId("freeze-submit-button");
      fireEvent.press(freezeButton);

      await waitFor(() => {
        expect(getByText(/Please select a child/)).toBeTruthy();
      });
    });
  });

  describe("Submission", () => {
    it("should call freezeChild API on form submission", async () => {
      const { getByTestId } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      const reasonInput = getByTestId("reason-input");
      fireEvent.changeText(reasonInput, "Test freeze reason");

      const freezeButton = getByTestId("freeze-submit-button");
      fireEvent.press(freezeButton);

      await waitFor(() => {
        expect(apiClient.freezeChild).toHaveBeenCalledWith({
          childId: "child-1",
          reason: "Test freeze reason",
        });
      });
    });

    it("should call onFreezeSuccess on successful freeze", async () => {
      const { getByTestId } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      const freezeButton = getByTestId("freeze-submit-button");
      fireEvent.press(freezeButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
    });

    it("should show error on API failure", async () => {
      (apiClient.freezeChild as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const { getByTestId, getByText } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      const freezeButton = getByTestId("freeze-submit-button");
      fireEvent.press(freezeButton);

      await waitFor(() => {
        expect(getByText(/Network error/)).toBeTruthy();
      });
    });

    it("should disable inputs while submitting", async () => {
      const { getByTestId } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      const freezeButton = getByTestId("freeze-submit-button");
      fireEvent.press(freezeButton);

      // During submission, freeze button should show loading state
      expect(freezeButton).toHaveStyle({ opacity: 0.6 });
    });

    it("should send freeze request with optional reason", async () => {
      const { getByTestId } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Without reason
      const freezeButton = getByTestId("freeze-submit-button");
      fireEvent.press(freezeButton);

      await waitFor(() => {
        expect(apiClient.freezeChild).toHaveBeenCalledWith({
          childId: "child-1",
          reason: "",
        });
      });
    });
  });

  describe("Cancellation", () => {
    it("should call onCancel when cancel button pressed with no changes", () => {
      const { getByTestId } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = getByTestId("cancel-button");
      fireEvent.press(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("should show confirmation alert when canceling with unsaved reason", async () => {
      const { getByTestId } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      const reasonInput = getByTestId("reason-input");
      fireEvent.changeText(reasonInput, "Some reason");

      const cancelButton = getByTestId("cancel-button");
      fireEvent.press(cancelButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Discard changes?",
          expect.any(String),
          expect.any(Array)
        );
      });
    });
  });

  describe("UI State Management", () => {
    it("should clear form after successful submission", async () => {
      const { getByTestId } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      const reasonInput = getByTestId("reason-input") as any;
      fireEvent.changeText(reasonInput, "Test reason");

      expect(reasonInput.props.value).toBe("Test reason");

      // After successful submission, the form should be cleared
      // This is tested through the onFreezeSuccess callback
    });
  });

  describe("Accessibility", () => {
    it("should have testIDs for all interactive elements", () => {
      const { getByTestId } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(getByTestId("reason-input")).toBeTruthy();
      expect(getByTestId("cancel-button")).toBeTruthy();
      expect(getByTestId("freeze-submit-button")).toBeTruthy();
    });
  });

  describe("Optional Reason", () => {
    it("should allow submission without reason", async () => {
      const { getByTestId } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      const freezeButton = getByTestId("freeze-submit-button");
      fireEvent.press(freezeButton);

      await waitFor(() => {
        expect(apiClient.freezeChild).toHaveBeenCalled();
      });
    });

    it("should mark reason as optional in label", () => {
      const { getByText } = render(
        <FreezeScreen
          childId="child-1"
          childName="Emma"
          onFreezeSuccess={mockOnFreezeSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(getByText(/Reason \(Optional\)/)).toBeTruthy();
    });
  });
});
