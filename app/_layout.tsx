import { Stack } from "expo-router";
import { ThemeProvider } from "./hooks/useTheme";

export default function RootLayout() {
  return (
    <ThemeProvider>
      {/* ScreenOptions: hide the header because the Tabs will have their own */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}