/**
 * RootNavigator - Parent App
 * Stack navigation connecting all parent app screens
 * Location: apps/parent-app/src/navigation/RootNavigator.tsx
 */

import React from "react";
import {
  NavigationContainer,
  NavigationProp,
  RouteProp,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

// Import screens
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ChildListScreen from "../screens/ChildListScreen";
import FreezeScreen from "../screens/FreezeScreen";

// ===== Navigation Setup =====

const Stack = createNativeStackNavigator<RootStackParamList>();

// ===== Component Types =====

export type RootNavigationProp = NavigationProp<RootStackParamList>;
export type LoginScreenRouteProp = RouteProp<RootStackParamList, "Login">;
export type DashboardScreenRouteProp = RouteProp<
  RootStackParamList,
  "Dashboard"
>;
export type ChildListScreenRouteProp = RouteProp<RootStackParamList, "ChildList">;
export type FreezeScreenRouteProp = RouteProp<RootStackParamList, "FreezeScreen">;

// ===== Root Navigator Component =====

/**
 * RootNavigator
 * Main navigation stack for the parent app
 * Handles screen transitions and parameter passing
 */
export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "#f5f5f5" },
          animationEnabled: true,
        }}
      >
        {/* Login Screen */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            gestureEnabled: false,
            animationTypeForReplace: true,
          }}
        />

        {/* Dashboard Screen */}
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            gestureEnabled: true,
          }}
        />

        {/* Child List Screen */}
        <Stack.Screen
          name="ChildList"
          component={ChildListScreen}
          options={{
            gestureEnabled: true,
          }}
        />

        {/* Freeze Screen */}
        <Stack.Screen
          name="FreezeScreen"
          component={FreezeScreen}
          options={{
            gestureEnabled: true,
            presentation: "modal",
          }}
        />

        {/* Alert Detail Screen (stub) */}
        <Stack.Screen
          name="AlertDetail"
          component={DashboardScreen}
          options={{
            gestureEnabled: true,
            presentation: "modal",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
