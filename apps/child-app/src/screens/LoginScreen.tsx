/**
 * LoginScreen - Child App
 * Simplified email/password authentication for child users
 * Location: apps/child-app/src/screens/LoginScreen.tsx
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
} from "react-native";
import { ChildUser } from "../types";
import apiClient from "../api/client";

// ===== Component Props =====

interface LoginScreenProps {
  onLoginSuccess: (user: ChildUser) => void;
  onNavigateToRegistration?: () => void;
}

// ===== Component Implementation =====

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegistration,
}) => {
  // ===== State Management =====

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // ===== Event Handlers =====

  /**
   * Handle login form submission
   */
  const handleLogin = async (): Promise<void> => {
    // Clear previous errors
    setError(null);

    // Validation
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Start loading
    setLoading(true);

    try {
      // Initialize encryption for future messages
      await apiClient.initializeEncryption();

      // Mock authentication (MVP)
      const mockUser: ChildUser = {
        id: `child-${Date.now()}`,
        email,
        name: email.split("@")[0],
        parentEmail: "parent@example.com",
        deviceId: `device-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
      };

      // Set child identity for API client
      apiClient.setChildIdentity(mockUser.id, mockUser.deviceId);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(`[LoginScreen] Child logged in: ${email}`);

      // Call success callback
      onLoginSuccess(mockUser);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
      Alert.alert("Login Failed", errorMessage);
      console.error("[LoginScreen] Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Email validation helper
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ===== Render =====

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Nanny</Text>
          <Text style={styles.subtitle}>Child App</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="child@example.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
              value={email}
              onChangeText={setEmail}
              testID="email-input"
            />
          </View>

          {/* Password Input */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                testID="toggle-password"
              >
                <Text style={styles.toggleText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
              value={password}
              onChangeText={setPassword}
              testID="password-input"
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            testID="login-button"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Signup Link */}
          {onNavigateToRegistration && (
            <View style={styles.signupLink}>
              <Text style={styles.signupText}>New user? </Text>
              <TouchableOpacity onPress={onNavigateToRegistration}>
                <Text style={styles.signupLinkText}>Register here</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Safely connect with your family
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// ===== Styles =====

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    fontWeight: "500",
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
    fontSize: 14,
    fontWeight: "500",
  },
  form: {
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  toggleText: {
    fontSize: 12,
    color: "#3498db",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#2c3e50",
  },
  loginButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  signupLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  signupLinkText: {
    fontSize: 14,
    color: "#3498db",
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#95a5a6",
    fontStyle: "italic",
    textAlign: "center",
  },
});

export default LoginScreen;
