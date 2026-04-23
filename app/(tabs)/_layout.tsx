import { Tabs } from "expo-router";
import { Home, Bell, FileText, Gift, User } from "lucide-react-native";
import { Platform } from "react-native";

export default function TabLayout() {
  // Use your primary color from your theme logic
  const primaryColor = "#3b82f6"; 
  const inactiveColor = "#6b7280";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 104 : 80,
          paddingBottom: Platform.OS === 'ios' ? 40 : 20,
          paddingTop: 5,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false, // We usually handle headers inside the pages for the blue background look
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