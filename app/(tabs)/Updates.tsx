import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Calendar, Clock, Tag } from "lucide-react-native";

// --- Theme & Constants ---
const THEME = {
  primary: "#3b82f6", // Mapping rgb(var(--color-primary))
  background: "#f9fafb",
  card: "#ffffff",
  border: "#e5e7eb",
  foreground: "#111827",
  mutedForeground: "#6b7280",
  muted: "#f3f4f6",
};

const announcements = [
  {
    id: 1,
    title: "Community Clean-up Drive",
    category: "Event",
    description: "Join us this Saturday for our monthly community clean-up drive. Let's keep our barangay clean and beautiful!",
    date: "April 12, 2026",
    time: "7:00 AM",
    author: "Barangay Captain",
    priority: "high",
  },
  {
    id: 2,
    title: "Ayuda Distribution Schedule",
    category: "Announcement",
    description: "Financial assistance will be distributed to qualified residents. Please check the Ayuda tab for eligibility and schedule.",
    date: "April 10, 2026",
    time: "2:30 PM",
    author: "Social Services Officer",
    priority: "high",
  },
  {
    id: 3,
    title: "Road Repair Notice",
    category: "Notice",
    description: "Main Street will undergo repair work from April 8-15. Expect traffic delays and find alternative routes.",
    date: "April 7, 2026",
    time: "9:00 AM",
    author: "Infrastructure Committee",
    priority: "medium",
  },
  {
    id: 4,
    title: "Health & Wellness Program",
    category: "Event",
    description: "Free health check-up and consultation this Friday at the barangay hall. Bring your health cards.",
    date: "April 6, 2026",
    time: "1:15 PM",
    author: "Health Officer",
    priority: "medium",
  },
  {
    id: 5,
    title: "Barangay Assembly Meeting",
    category: "Meeting",
    description: "Monthly barangay assembly meeting. All residents are encouraged to attend and participate in community discussions.",
    date: "April 5, 2026",
    time: "6:00 PM",
    author: "Barangay Secretary",
    priority: "low",
  },
];

const categories = ["All", "Event", "Announcement", "Notice", "Meeting"];

export default function Updates() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredAnnouncements =
    selectedCategory === "All"
      ? announcements
      : announcements.filter((a) => a.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Bell size={24} color="white" />
          <Text style={styles.headerTitle}>Updates</Text>
        </View>
        <Text style={styles.headerSubtitle}>Stay informed with official announcements</Text>
      </View>

      {/* Category Filter (Horizontal Scroll) */}
      <View style={styles.filterWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.filterBtn,
                selectedCategory === category ? styles.filterBtnActive : styles.filterBtnInactive
              ]}
            >
              <Text style={[
                styles.filterText,
                selectedCategory === category ? styles.textWhite : styles.textForeground
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Announcements List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredAnnouncements.map((announcement) => (
          <View key={announcement.id} style={styles.card}>
            {/* Priority Indicator */}
            <View style={[
              styles.priorityIndicator,
              announcement.priority === "high" ? styles.bgRed :
              announcement.priority === "medium" ? styles.bgOrange : styles.bgGreen
            ]} />
            
            <View style={styles.cardPadding}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{announcement.title}</Text>
                <View style={styles.tagBadge}>
                  <Tag size={10} color={THEME.primary} />
                  <Text style={styles.tagText}>{announcement.category}</Text>
                </View>
              </View>

              <Text style={styles.description}>{announcement.description}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Calendar size={12} color={THEME.mutedForeground} />
                  <Text style={styles.metaText}>{announcement.date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={12} color={THEME.mutedForeground} />
                  <Text style={styles.metaText}>{announcement.time}</Text>
                </View>
              </View>

              <View style={styles.authorSection}>
                <Text style={styles.authorText}>
                  Posted by: {announcement.author}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: { backgroundColor: THEME.primary, padding: 16, paddingBottom: 24 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold" },
  headerSubtitle: { color: "rgba(255,255,255,0.9)", fontSize: 14 },

  // Filter Styles
  filterWrapper: { paddingHorizontal: 16, marginTop: -12, marginBottom: 16 },
  filterContainer: { 
    backgroundColor: THEME.card, 
    borderRadius: 12, 
    padding: 8, 
    borderWidth: 1, 
    borderColor: THEME.border,
    flexDirection: "row",
    gap: 8 
  },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  filterBtnActive: { backgroundColor: THEME.primary },
  filterBtnInactive: { backgroundColor: "transparent" },
  filterText: { fontSize: 12, fontWeight: "500" },
  textWhite: { color: "white" },
  textForeground: { color: THEME.foreground },

  // List & Card Styles
  listContent: { paddingHorizontal: 16, paddingBottom: 16, gap: 16 },
  card: { backgroundColor: THEME.card, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, overflow: "hidden" },
  priorityIndicator: { height: 4 },
  cardPadding: { padding: 16 },
  cardHeader: { marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: THEME.foreground, marginBottom: 6 },
  
  tagBadge: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 4, 
    backgroundColor: "rgba(59, 130, 246, 0.1)", 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 99,
    alignSelf: "flex-start"
  },
  tagText: { color: THEME.primary, fontSize: 10, fontWeight: "600" },

  description: { fontSize: 14, color: THEME.mutedForeground, lineHeight: 20, marginBottom: 12 },
  
  metaRow: { flexDirection: "row", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: THEME.mutedForeground },

  authorSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: THEME.border },
  authorText: { fontSize: 12, fontWeight: "500", color: THEME.foreground },

  // Priority Colors
  bgRed: { backgroundColor: "#ef4444" },
  bgOrange: { backgroundColor: "#f97316" },
  bgGreen: { backgroundColor: "#22c55e" },
});