import { Tabs } from "expo-router";
import { Home, Bell, FileText, Gift, User } from "lucide-react-native";
import { Platform } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { useTabReset } from "../hooks/useTabReset";

export default function TabLayout() {
  // Read colors from theme context so tab bar updates with dark mode
  const { colors } = useTheme();
  const { emit } = useTabReset();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 100 : 76,
          paddingBottom: Platform.OS === 'ios' ? 36 : 18,
          paddingTop: 8,
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          ...colors.shadow as any,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.1,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
        headerShown: false,
        animation: 'shift',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Updates"
        options={{
          title: "Updates",
          tabBarIcon: ({ color }) => <Bell size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
        }}
        listeners={{
          tabPress: () => emit("Reports"),
        }}
      />
      <Tabs.Screen
        name="Ayuda"
        options={{
          title: "Ayuda",
          tabBarIcon: ({ color }) => <Gift size={22} color={color} />,
        }}
        listeners={{
          tabPress: () => emit("Ayuda"),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
        listeners={{
          tabPress: () => emit("Profile"),
        }}
      />
    </Tabs>
  );
}