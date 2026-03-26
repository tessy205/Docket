import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function DashboardLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashB" />
        <Stack.Screen name="cases" />
        <Stack.Screen name="hearings" />
        <Stack.Screen name="clients" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="adminportal" />
      </Stack>
    </SafeAreaProvider>
  );
}