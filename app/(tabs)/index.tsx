import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  FileText,
  Heart,
  TrendingUp,
  Users,
  MapPin,
} from "lucide-react-native";
import { useAuth } from "../hooks/useAuth";
import { useTheme, ThemeColors } from "../hooks/useTheme";

const stats = [
  { label: "Active Reports", value: "12", icon: FileText, color: null as string | null },
  { label: "Residents", value: "2,431", icon: Users, color: "#22c55e" },
  { label: "Ayuda Given", value: "156", icon: Heart, color: "#fb923c" },
];

const quickActions = [
  { label: "Report Issue", icon: FileText, path: "Reports", color: null as string | null },
  { label: "View Updates", icon: Bell, path: "Updates", color: "#22c55e" },
  { label: "Ayuda Status", icon: Heart, path: "Ayuda", color: "#f97316" },
];

const recentActivities = [
  {
    title: "New Streetlight Installed",
    description: "Purok 3, reported last week",
    time: "2 hours ago",
    status: "completed",
  },
  {
    title: "Road Repair Scheduled",
    description: "Main Street, Purok 1",
    time: "5 hours ago",
    status: "in-progress",
  },
  {
    title: "Ayuda Distribution",
    description: "Financial assistance available",
    time: "1 day ago",
    status: "announcement",
  },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const firstName = user?.fullName?.split(" ")[0] || "Resident";

  // ADDED: Pull-to-refresh functionality
  // ============================================================
  // When connected to a database, replace the mock refresh with
  // actual API calls to reload dashboard data:
  // Example: const data = await fetch('/api/dashboard').then(r => r.json())
  // ============================================================
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate fetching fresh data from the server
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const s = createStyles(colors);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        // ADDED: RefreshControl for pull-to-refresh
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        
        {/* Header */}
        <View style={s.header}>
          <View style={s.locationBadge}>
            <MapPin size={16} color={colors.primary} />
            <Text style={s.locationText}>Barangay San Isidro</Text>
          </View>
          <Text style={s.welcomeText}>Good day, {firstName}!</Text>
          <Text style={s.subtitle}>Stay connected with your community</Text>
        </View>

        {/* Stats Cards */}
        <View style={s.gridThree}>
          {stats.map((stat) => (
            <View key={stat.label} style={s.statCard}>
              <stat.icon size={18} color={stat.color ?? colors.primary} />
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel} numberOfLines={2}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
          <View style={s.gridThree}>
            {quickActions.map((action) => {
              const actionColor = action.color ?? colors.primary;
              return (
                <TouchableOpacity
                  key={action.label}
                  style={s.actionCard}
                  onPress={() => router.push(`/${action.path}` as any)}
                >
                  <View style={[s.iconCircle, { backgroundColor: actionColor }]}>
                    <action.icon size={20} color="white" />
                  </View>
                  <Text style={s.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Recent Activity</Text>
            <TrendingUp size={16} color={colors.primary} />
          </View>
          
          <View style={s.activityList}>
            {recentActivities.map((activity, index) => (
              <View key={index} style={s.activityCard}>
                <View style={s.activityHeader}>
                  <Text style={s.activityTitle}>{activity.title}</Text>
                  <View style={[
                    s.statusBadge,
                    activity.status === "completed" ? s.bgGreen : 
                    activity.status === "in-progress" ? s.bgOrange : s.bgBlue
                  ]}>
                    <Text style={[
                      s.statusText,
                      activity.status === "completed" ? s.textGreen : 
                      activity.status === "in-progress" ? s.textOrange : s.textBlue
                    ]}>
                      {activity.status}
                    </Text>
                  </View>
                </View>
                <Text style={s.activityDesc}>{activity.description}</Text>
                <Text style={s.activityTime}>{activity.time}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scrollContent: { padding: 16, gap: 24 },
  header: { paddingTop: 8 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  locationText: { fontSize: 14, color: c.mutedForeground },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: c.foreground },
  subtitle: { fontSize: 14, color: c.mutedForeground },
  gridThree: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: c.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: c.border, justifyContent: 'space-between' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: c.foreground, marginVertical: 4 },
  statLabel: { fontSize: 10, color: c.mutedForeground, lineHeight: 12 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: c.foreground },
  actionCard: { flex: 1, alignItems: 'center', backgroundColor: c.card, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 8, borderWidth: 1, borderColor: c.border },
  iconCircle: { padding: 12, borderRadius: 99, marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '500', textAlign: 'center', color: c.foreground },
  activityList: { gap: 12 },
  activityCard: { backgroundColor: c.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: c.border },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: c.foreground, flex: 1, marginRight: 8 },
  activityDesc: { fontSize: 12, color: c.mutedForeground, marginBottom: 8 },
  activityTime: { fontSize: 10, color: c.mutedForeground },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  bgGreen: { backgroundColor: '#dcfce7' },
  textGreen: { color: '#15803d' },
  bgOrange: { backgroundColor: '#ffedd5' },
  textOrange: { color: '#c2410c' },
  bgBlue: { backgroundColor: '#dbeafe' },
  textBlue: { color: '#1d4ed8' },
});