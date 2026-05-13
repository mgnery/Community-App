import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Building2 } from "lucide-react-native";

// Color constants matching the reference design
const COLORS = {
  primary: "#1a56a8",       // Deep blue from the reference
  primaryDark: "#143f7a",   // Darker shade for active states
  white: "#ffffff",
  background: "#f8f9fa",
  textDark: "#1a1a2e",
  textMuted: "#6b7280",
  border: "#d1d5db",
};

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Top spacer for visual balance */}
      <View style={styles.topSpacer} />

      {/* Logo and branding section */}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Building2 size={56} color={COLORS.white} />
        </View>
        <Text style={styles.appTitle}>Barangay Portal</Text>
        <Text style={styles.appSubtitle}>Connect with your community</Text>
      </View>

      {/* Buttons section */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.signInButton}
          activeOpacity={0.8}
          onPress={() => router.push("/(auth)/sign-in")}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createAccountButton}
          activeOpacity={0.8}
          onPress={() => router.push("/(auth)/sign-up")}
        >
          <Text style={styles.createAccountButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom spacer */}
      <View style={styles.bottomSpacer} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 28,
  },
  topSpacer: {
    flex: 2,
  },
  brandSection: {
    alignItems: "center",
    gap: 14,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  appTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.textDark,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  buttonSection: {
    gap: 14,
    marginTop: 64,
    paddingHorizontal: 4,
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  createAccountButton: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  createAccountButtonText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  bottomSpacer: {
    flex: 3,
  },
});
