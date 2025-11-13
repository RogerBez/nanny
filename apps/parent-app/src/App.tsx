/**
 * App.tsx - Parent App Entry Point
 * Main application component integrating navigation and global state
 * Location: apps/parent-app/src/App.tsx
 */

import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { AuthState, ParentUser } from "./types";
import RootNavigator from "./navigation/RootNavigator";
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";

// ===== Component Types =====

type AppState = "loading" | "login" | "authenticated";

// ===== App Component =====

/**
 * App
 * Root component managing authentication state and navigation
 */
export const App: React.FC = () => {
  // ===== State Management =====

  const [appState, setAppState] = useState<AppState>("loading");
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    loading: false,
    error: null,
  });

  // ===== Effects =====

  /**
   * Check authentication status on app launch
   * Restore session if available
   */
  useEffect(() => {
    const checkAuthStatus = async (): Promise<void> => {
      try {
        console.log("[App] Checking authentication status...");

        // TODO: Restore session from secure storage (Firebase or AsyncStorage)
        // For MVP, always start at login
        setAppState("login");
      } catch (err) {
        console.error("[App] Auth check error:", err);
        setAppState("login");
      }
    };

    checkAuthStatus();
  }, []);

  // ===== Event Handlers =====

  /**
   * Handle successful login
   */
  const handleLoginSuccess = (user: ParentUser): void => {
    console.log("[App] User logged in:", user.email);

    setAuthState({
      isLoggedIn: true,
      user,
      loading: false,
      error: null,
    });

    setAppState("authenticated");

    // TODO: Save session to secure storage for persistence
  };

  /**
   * Handle logout
   */
  const handleLogout = (): void => {
    console.log("[App] User logged out");

    setAuthState({
      isLoggedIn: false,
      user: null,
      loading: false,
      error: null,
    });

    setAppState("login");

    // TODO: Clear secure storage
  };

  // ===== Render =====

  // Show loading screen
  if (appState === "loading") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  // Show login screen
  if (appState === "login" || !authState.isLoggedIn) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onNavigateToSignup={() => console.log("[App] Navigate to signup")}
      />
    );
  }

  // Show authenticated screens (dashboard)
  if (appState === "authenticated" && authState.isLoggedIn && authState.user) {
    return (
      <View style={{ flex: 1 }}>
        <DashboardScreen
          onNavigateToFreezeScreen={(childId: string) => {
            console.log("[App] Navigate to freeze screen for child:", childId);
          }}
          onNavigateToAlertDetail={(alertId: string) => {
            console.log("[App] Navigate to alert detail:", alertId);
          }}
        />
      </View>
    );
  }

  // Fallback: show login
  return (
    <LoginScreen
      onLoginSuccess={handleLoginSuccess}
      onNavigateToSignup={() => console.log("[App] Navigate to signup")}
    />
  );
};

export default App;
