import { Tabs } from "expo-router";
import { Home, Bell, FileText, Gift, User } from "lucide-react-native";
import { Platform } from "react-native";
import { useTheme } from "../hooks/useTheme";

export default function TabLayout() {
  // Read colors from theme context so tab bar updates with dark mode
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 104 : 80,
          paddingBottom: Platform.OS === 'ios' ? 40 : 20,
          paddingTop: 5,
          backgroundColor: colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.tabBorder,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Updates"
        options={{
          title: "Updates",
          tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Ayuda"
        options={{
          title: "Ayuda",
          tabBarIcon: ({ color }) => <Gift size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}