import { useRouter } from "expo-router";
import {
  Bell,
  FileText,
  Heart,
  MapPin,
  TrendingUp,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { ThemeColors, useTheme } from "../hooks/useTheme";

const quickActions = [
  { label: "Report Issue", icon: FileText, path: "Reports", color: null as string | null },
  { label: "View Updates", icon: Bell, path: "Updates", color: "#22c55e" },
  { label: "Ayuda Status", icon: Heart, path: "Ayuda", color: "#f97316" },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const firstName = user?.fullName?.split(" ")[0] || "Resident";

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Live stats
  const [activeReports, setActiveReports] = useState(0);
  const [ayudaApproved, setAyudaApproved] = useState(0);
  const [totalUpdates, setTotalUpdates] = useState(0);

  // Recent activity from updates table
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const userId = session.user.id;

      // Fetch all stats in parallel
      const [reportsRes, ayudaRes, updatesCountRes, recentUpdatesRes] = await Promise.all([
        // Active reports for this user (not completed)
        supabase
          .from("reports")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .neq("status", "completed"),

        // Approved ayuda applications for this user
        supabase
          .from("ayuda_applications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "approved"),

        // Total updates count
        supabase
          .from("updates")
          .select("id", { count: "exact", head: true }),

        // Recent updates (latest 5)
        supabase
          .from("updates")
          .select("id, title, description, category, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setActiveReports(reportsRes.count ?? 0);
      setAyudaApproved(ayudaRes.count ?? 0);
      setTotalUpdates(updatesCountRes.count ?? 0);

      if (recentUpdatesRes.data) {
        const formatted = recentUpdatesRes.data.map((u: any) => ({
          id: u.id,
          title: u.title,
          description: u.description,
          time: getRelativeTime(u.created_at),
          status: u.category?.toLowerCase() === "event" ? "event"
            : u.category?.toLowerCase() === "notice" ? "notice"
              : "announcement",
        }));
        setRecentActivities(formatted);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const getRelativeTime = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, []);

  const stats = [
    { label: "Active Reports", value: String(activeReports), icon: FileText, color: null as string | null },
    { label: "Updates", value: String(totalUpdates), icon: Bell, color: "#22c55e" },
    { label: "Ayuda Approved", value: String(ayudaApproved), icon: Heart, color: "#fb923c" },
  ];

  const s = createStyles(colors);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
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

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
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
                <Text style={s.sectionTitle}>Recent Updates</Text>
                <TrendingUp size={16} color={colors.primary} />
              </View>

              <View style={s.activityList}>
                {recentActivities.length === 0 ? (
                  <Text style={{ textAlign: "center", color: colors.mutedForeground, marginTop: 8 }}>No recent updates.</Text>
                ) : (
                  recentActivities.map((activity) => (
                    <View key={activity.id} style={[s.activityCard, {
                      borderLeftColor: activity.status === "event" ? '#22c55e' :
                        activity.status === "notice" ? '#f97316' : '#3b82f6'
                    }]}>
                      <View style={s.activityHeader}>
                        <Text style={s.activityTitle}>{activity.title}</Text>
                        <View style={[
                          s.statusBadge,
                          activity.status === "event" ? s.bgGreen :
                            activity.status === "notice" ? s.bgOrange : s.bgBlue
                        ]}>
                          <Text style={[
                            s.statusText,
                            activity.status === "event" ? s.textGreen :
                              activity.status === "notice" ? s.textOrange : s.textBlue
                          ]}>
                            {activity.status}
                          </Text>
                        </View>
                      </View>
                      <Text style={s.activityDesc} numberOfLines={2}>{activity.description}</Text>
                      <Text style={s.activityTime}>{activity.time}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scrollContent: { padding: 20, paddingBottom: 32, gap: 28 },
  header: { paddingTop: 12, paddingBottom: 4 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, backgroundColor: c.primaryLight, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  locationText: { fontSize: 13, color: c.primary, fontWeight: '500' },
  welcomeText: { fontSize: 26, fontWeight: '800', color: c.foreground, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: c.mutedForeground, marginTop: 2 },
  gridThree: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: c.cardElevated, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: c.border, justifyContent: 'space-between', ...(c.shadowSm as any) },
  statValue: { fontSize: 22, fontWeight: '800', color: c.foreground, marginVertical: 6, letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: c.mutedForeground, lineHeight: 13, fontWeight: '500' },
  section: { gap: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: c.foreground, letterSpacing: -0.2 },
  actionCard: { flex: 1, alignItems: 'center', backgroundColor: c.cardElevated, borderRadius: 16, paddingVertical: 20, paddingHorizontal: 8, borderWidth: 1, borderColor: c.border, ...(c.shadowSm as any) },
  iconCircle: { padding: 14, borderRadius: 99, marginBottom: 10 },
  actionLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center', color: c.foreground },
  activityList: { gap: 12 },
  activityCard: { backgroundColor: c.card, padding: 16, paddingLeft: 20, borderRadius: 16, borderWidth: 1, borderColor: c.border, borderLeftWidth: 4, ...(c.shadowSm as any) },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: c.foreground, flex: 1, marginRight: 8 },
  activityDesc: { fontSize: 13, color: c.mutedForeground, marginBottom: 8, lineHeight: 19 },
  activityTime: { fontSize: 11, color: c.mutedForeground, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize', letterSpacing: 0.3 },
  bgGreen: { backgroundColor: '#dcfce7' },
  textGreen: { color: '#15803d' },
  bgOrange: { backgroundColor: '#ffedd5' },
  textOrange: { color: '#c2410c' },
  bgBlue: { backgroundColor: '#dbeafe' },
  textBlue: { color: '#1d4ed8' },
});