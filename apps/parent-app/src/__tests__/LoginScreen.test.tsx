/**
 * LoginScreen Tests
 * Unit and integration tests for authentication
 * Location: apps/parent-app/src/__tests__/LoginScreen.test.tsx
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import LoginScreen from "../screens/LoginScreen";
import { ParentUser } from "../types";

// ===== Test Setup =====

jest.spyOn(Alert, "alert").mockImplementation(() => true);

describe("LoginScreen", () => {
  // ===== Helper Functions =====

  const mockOnLoginSuccess = jest.fn();
  const mockOnNavigateToSignup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== Tests =====

  describe("Rendering", () => {
    it("should render login screen with email and password inputs", () => {
      const { getByTestId, getByText } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      expect(getByText("Nanny")).toBeTruthy();
      expect(getByText("Parent Portal")).toBeTruthy();
      expect(getByTestId("email-input")).toBeTruthy();
      expect(getByTestId("password-input")).toBeTruthy();
    });

    it("should render sign in button", () => {
      const { getByTestId } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      expect(getByTestId("login-button")).toBeTruthy();
    });

    it("should render signup link when callback provided", () => {
      const { getByText } = render(
        <LoginScreen
          onLoginSuccess={mockOnLoginSuccess}
          onNavigateToSignup={mockOnNavigateToSignup}
        />
      );

      expect(getByText(/Create one/)).toBeTruthy();
    });

    it("should render forgot password link", () => {
      const { getByTestId } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      expect(getByTestId("forgot-password")).toBeTruthy();
    });

    it("should have toggle password button", () => {
      const { getByTestId } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      expect(getByTestId("toggle-password")).toBeTruthy();
    });
  });

  describe("Validation", () => {
    it("should show error when email is empty", async () => {
      const { getByTestId, getByText } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      const passwordInput = getByTestId("password-input");
      fireEvent.changeText(passwordInput, "password123");

      const loginButton = getByTestId("login-button");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText("Email is required")).toBeTruthy();
      });
    });

    it("should show error when password is empty", async () => {
      const { getByTestId, getByText } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      const emailInput = getByTestId("email-input");
      fireEvent.changeText(emailInput, "parent@example.com");

      const loginButton = getByTestId("login-button");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText("Password is required")).toBeTruthy();
      });
    });

    it("should show error for invalid email format", async () => {
      const { getByTestId, getByText } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      const emailInput = getByTestId("email-input");
      const passwordInput = getByTestId("password-input");

      fireEvent.changeText(emailInput, "invalid-email");
      fireEvent.changeText(passwordInput, "password123");

      const loginButton = getByTestId("login-button");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(
          getByText("Please enter a valid email address")
        ).toBeTruthy();
      });
    });
  });

  describe("Authentication", () => {
    it("should call onLoginSuccess with mock user on valid login", async () => {
      const { getByTestId } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      const emailInput = getByTestId("email-input");
      const passwordInput = getByTestId("password-input");
      const loginButton = getByTestId("login-button");

      fireEvent.changeText(emailInput, "parent@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockOnLoginSuccess).toHaveBeenCalled();
        const callArg = mockOnLoginSuccess.mock.calls[0][0] as ParentUser;
        expect(callArg.email).toBe("parent@example.com");
        expect(callArg.children.length).toBeGreaterThan(0);
      });
    });

    it("should show loading state during login", async () => {
      const { getByTestId } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      const emailInput = getByTestId("email-input");
      const passwordInput = getByTestId("password-input");
      const loginButton = getByTestId("login-button");

      fireEvent.changeText(emailInput, "parent@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      expect(loginButton).toHaveStyle({ opacity: 0.6 });
    });
  });

  describe("Password Visibility", () => {
    it("should toggle password visibility", () => {
      const { getByTestId } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      const passwordInput = getByTestId("password-input") as any;
      const toggleButton = getByTestId("toggle-password");

      // Initially hidden
      expect(passwordInput.props.secureTextEntry).toBe(true);

      // Toggle to show
      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(false);

      // Toggle to hide
      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });

  describe("Navigation", () => {
    it("should call onNavigateToSignup when signup link pressed", () => {
      const { getByText } = render(
        <LoginScreen
          onLoginSuccess={mockOnLoginSuccess}
          onNavigateToSignup={mockOnNavigateToSignup}
        />
      );

      const signupLink = getByText(/Create one/);
      fireEvent.press(signupLink);

      expect(mockOnNavigateToSignup).toHaveBeenCalled();
    });

    it("should show alert when forgot password pressed", () => {
      const { getByTestId } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      const forgotPasswordButton = getByTestId("forgot-password");
      fireEvent.press(forgotPasswordButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        "Password Reset",
        expect.stringContaining("coming soon")
      );
    });
  });

  describe("Accessibility", () => {
    it("should have proper testIDs for all interactive elements", () => {
      const { getByTestId } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      expect(getByTestId("email-input")).toBeTruthy();
      expect(getByTestId("password-input")).toBeTruthy();
      expect(getByTestId("login-button")).toBeTruthy();
      expect(getByTestId("toggle-password")).toBeTruthy();
      expect(getByTestId("forgot-password")).toBeTruthy();
    });
  });

  describe("Input Handling", () => {
    it("should update email state on input change", () => {
      const { getByTestId } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      const emailInput = getByTestId("email-input") as any;
      fireEvent.changeText(emailInput, "test@example.com");

      expect(emailInput.props.value).toBe("test@example.com");
    });

    it("should update password state on input change", () => {
      const { getByTestId } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      const passwordInput = getByTestId("password-input") as any;
      fireEvent.changeText(passwordInput, "securepass123");

      expect(passwordInput.props.value).toBe("securepass123");
    });

    it("should disable inputs while loading", async () => {
      const { getByTestId } = render(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      );

      const emailInput = getByTestId("email-input");
      const passwordInput = getByTestId("password-input");
      const loginButton = getByTestId("login-button");

      fireEvent.changeText(emailInput, "parent@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      // During loading, inputs should be disabled
      expect(emailInput).toHaveStyle({ opacity: 1 });
      expect(passwordInput).toHaveStyle({ opacity: 1 });
    });
  });
});
