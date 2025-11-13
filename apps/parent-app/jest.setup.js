/**
 * Jest Setup File for Parent App
 * Initializes test environment and mock setup
 * Location: apps/parent-app/jest.setup.js
 */

// ===== Mock React Native =====
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter");

// ===== Mock React Navigation =====
jest.mock("@react-navigation/native", () => ({
  NavigationContainer: ({ children }) => children,
  useFocusEffect: jest.fn(),
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  })),
  useRoute: jest.fn(),
}));

jest.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// ===== Global Test Setup =====

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// ===== Polyfills =====

// Polyfill TextEncoder/TextDecoder for crypto operations
if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// ===== Environment Variables =====

process.env.NODE_ENV = "test";
process.env.EXPO_PUBLIC_API_URL = "http://localhost:3000";
