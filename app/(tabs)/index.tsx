import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  FileText,
  Heart,
  TrendingUp,
  Users,
  MapPin,
} from "lucide-react-native";

// --- Constants & Theme ---
const THEME = {
  primary: "#3b82f6", // Mapping rgb(var(--color-primary))
  background: "#ffffff",
  card: "#ffffff",
  border: "#e5e7eb",
  foreground: "#111827",
  mutedForeground: "#6b7280",
};

const stats = [
  { label: "Active Reports", value: "12", icon: FileText, color: THEME.primary },
  { label: "Residents", value: "2,431", icon: Users, color: "#22c55e" },
  { label: "Ayuda Given", value: "156", icon: Heart, color: "#fb923c" },
];

const quickActions = [
  { label: "Report Issue", icon: FileText, path: "Reports", color: THEME.primary },
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

export default function Home({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationBadge}>
            <MapPin size={16} color={THEME.primary} />
            <Text style={styles.locationText}>Barangay San Isidro</Text>
          </View>
          <Text style={styles.welcomeText}>Good day, Juan!</Text>
          <Text style={styles.subtitle}>Stay connected with your community</Text>
        </View>

        {/* Stats Cards (Grid Implementation) */}
        <View style={styles.gridThree}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <stat.icon size={18} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel} numberOfLines={2}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.gridThree}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionCard}
                onPress={() => navigation?.navigate(action.path)}
              >
                <View style={[styles.iconCircle, { backgroundColor: action.color }]}>
                  <action.icon size={20} color="white" />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TrendingUp size={16} color={THEME.primary} />
          </View>
          
          <View style={styles.activityList}>
            {recentActivities.map((activity, index) => (
              <View key={index} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <View style={[
                    styles.statusBadge,
                    activity.status === "completed" ? styles.bgGreen : 
                    activity.status === "in-progress" ? styles.bgOrange : styles.bgBlue
                  ]}>
                    <Text style={[
                      styles.statusText,
                      activity.status === "completed" ? styles.textGreen : 
                      activity.status === "in-progress" ? styles.textOrange : styles.textBlue
                    ]}>
                      {activity.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.activityDesc}>{activity.description}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  scrollContent: { padding: 16, gap: 24 },
  header: { paddingTop: 8 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  locationText: { fontSize: 14, color: THEME.mutedForeground },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: THEME.foreground },
  subtitle: { fontSize: 14, color: THEME.mutedForeground },
  
  // Grid System (Simulating grid-cols-3)
  gridThree: { flexDirection: 'row', gap: 12 },
  
  statCard: {
    flex: 1,
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    justifyContent: 'space-between'
  },
  statValue: { fontSize: 20, fontWeight: 'bold', color: THEME.foreground, marginVertical: 4 },
  statLabel: { fontSize: 10, color: THEME.mutedForeground, lineHeight: 12 },

  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.foreground },

  actionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  iconCircle: { padding: 12, borderRadius: 99, marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '500', textAlign: 'center', color: THEME.foreground },

  activityList: { gap: 12 },
  activityCard: {
    backgroundColor: THEME.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: THEME.foreground, flex: 1, marginRight: 8 },
  activityDesc: { fontSize: 12, color: THEME.mutedForeground, marginBottom: 8 },
  activityTime: { fontSize: 10, color: THEME.mutedForeground },

  // Status Badges
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  bgGreen: { backgroundColor: '#dcfce7' },
  textGreen: { color: '#15803d' },
  bgOrange: { backgroundColor: '#ffedd5' },
  textOrange: { color: '#c2410c' },
  bgBlue: { backgroundColor: '#dbeafe' },
  textBlue: { color: '#1d4ed8' },
});