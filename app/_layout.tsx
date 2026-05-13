import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { TabResetProvider } from "./hooks/useTabReset";
import { ThemeProvider } from "./hooks/useTheme";

// ============================================================
// Root layout — handles auth-based routing
// If the user is authenticated, they see the (tabs) main app.
// If not, they see the (auth) welcome/sign-in/sign-up screens.
// ============================================================

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // User is not signed in and not on auth screens → redirect to welcome
      router.replace("/(auth)/welcome");
    } else if (isAuthenticated && inAuthGroup) {
      // User is signed in but still on auth screens → redirect to main app
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments, router]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a56a8" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 200 }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TabResetProvider>
          <RootNavigator />
        </TabResetProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6f8",
  },
});