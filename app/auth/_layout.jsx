import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index2" />
      <Stack.Screen name="loginScreen1" />
      <Stack.Screen name="loginScreen2" />
      <Stack.Screen name="loginScreen3" />
      <Stack.Screen name="accountCreated" />
    </Stack>
  );
}