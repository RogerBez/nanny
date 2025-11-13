/**
 * Jest Configuration for Parent App
 * Configures testing framework for React Native components
 * Location: apps/parent-app/jest.config.js
 */

module.exports = {
  // ===== Test Environment =====
  testEnvironment: "node",

  // ===== Module Transformation =====
  preset: "react-native",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        jsx: "react-native",
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },

  // ===== Module Extensions =====
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // ===== Setup Files =====
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // ===== Coverage Configuration =====
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/index.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // ===== Test Pattern =====
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{ts,tsx}",
    "<rootDir>/src/**/*.{spec,test}.{ts,tsx}",
  ],

  // ===== Module Name Mapper =====
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // ===== Jest Ignore Patterns =====
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-navigation|@react-native-community)/)",
  ],

  // ===== Globals =====
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },

  // ===== Test Timeout =====
  testTimeout: 10000,

  // ===== Verbose Output =====
  verbose: true,
};
