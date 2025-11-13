/**
 * LoginScreen - Parent App
 * Email/password authentication for parent users
 * Location: apps/parent-app/src/screens/LoginScreen.tsx
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
import { AuthState, ParentUser } from "../types";

// ===== Component Props =====

interface LoginScreenProps {
  onLoginSuccess: (user: ParentUser) => void;
  onNavigateToSignup?: () => void;
}

// ===== Component Implementation =====

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToSignup,
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
   * Validates email/password and calls mock auth for MVP
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
      // Mock authentication for MVP
      // TODO: Replace with Firebase Auth in production
      const mockUser: ParentUser = {
        id: `user-${Date.now()}`,
        email,
        name: email.split("@")[0],
        children: [
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
            riskScore: 58,
            isFrozen: true,
            lastActive: Date.now() - 7200000,
          },
        ],
        createdAt: Date.now(),
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Log authentication event
      console.log(`[LoginScreen] User authenticated: ${email}`);

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
          <Text style={styles.subtitle}>Parent Portal</Text>
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
              placeholder="parent@example.com"
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
          {onNavigateToSignup && (
            <View style={styles.signupLink}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={onNavigateToSignup}>
                <Text style={styles.signupLinkText}>Create one</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Password Reset",
                "Password reset feature coming soon"
              )
            }
            testID="forgot-password"
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built with care to keep your family safe
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
  forgotPasswordText: {
    fontSize: 13,
    color: "#3498db",
    textAlign: "center",
    marginTop: 15,
    fontWeight: "500",
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
