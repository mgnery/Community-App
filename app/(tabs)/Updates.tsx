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
import { useTheme, ThemeColors } from "../hooks/useTheme";

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
    category: "Notice",
    description: "Monthly barangay assembly meeting. All residents are encouraged to attend and participate in community discussions.",
    date: "April 5, 2026",
    time: "6:00 PM",
    author: "Barangay Secretary",
    priority: "low",
  },
];

const categories = ["All", "Event", "Announcement", "Notice"];

export default function Updates() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { colors } = useTheme();

  const filteredAnnouncements =
    selectedCategory === "All"
      ? announcements
      : announcements.filter((a) => a.category === selectedCategory);

  const s = createStyles(colors);

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTitleRow}>
          <Bell size={24} color={colors.headerText} />
          <Text style={s.headerTitle}>Updates</Text>
        </View>
        <Text style={s.headerSubtitle}>Stay informed with official announcements</Text>
      </View>

      {/* Category Filter */}
      <View style={s.filterWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={s.filterContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                s.filterBtn,
                selectedCategory === category ? s.filterBtnActive : s.filterBtnInactive
              ]}
            >
              <Text style={[
                s.filterText,
                selectedCategory === category ? s.textWhite : { color: colors.foreground }
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Announcements List */}
      <ScrollView contentContainerStyle={s.listContent}>
        {filteredAnnouncements.map((announcement) => (
          <View key={announcement.id} style={s.card}>
            {/* Priority Indicator */}
            <View style={[
              s.priorityIndicator,
              announcement.priority === "high" ? s.bgRed :
              announcement.priority === "medium" ? s.bgOrange : s.bgGreen
            ]} />
            
            <View style={s.cardPadding}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitle}>{announcement.title}</Text>
                <View style={s.tagBadge}>
                  <Tag size={10} color={colors.primary} />
                  <Text style={s.tagText}>{announcement.category}</Text>
                </View>
              </View>

              <Text style={s.description}>{announcement.description}</Text>

              <View style={s.metaRow}>
                <View style={s.metaItem}>
                  <Calendar size={12} color={colors.mutedForeground} />
                  <Text style={s.metaText}>{announcement.date}</Text>
                </View>
                <View style={s.metaItem}>
                  <Clock size={12} color={colors.mutedForeground} />
                  <Text style={s.metaText}>{announcement.time}</Text>
                </View>
              </View>

              <View style={s.authorSection}>
                <Text style={s.authorText}>
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

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { backgroundColor: c.headerBg, padding: 16, paddingBottom: 24 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  headerTitle: { color: c.headerText, fontSize: 20, fontWeight: "bold" },
  headerSubtitle: { color: c.headerSubtext, fontSize: 14 },
  filterWrapper: { paddingHorizontal: 16, marginTop: -12, marginBottom: 16 },
  filterContainer: { backgroundColor: c.card, borderRadius: 12, padding: 8, borderWidth: 1, borderColor: c.border, flexDirection: "row", gap: 8 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  filterBtnActive: { backgroundColor: c.primary },
  filterBtnInactive: { backgroundColor: "transparent" },
  filterText: { fontSize: 12, fontWeight: "500" },
  textWhite: { color: "white" },
  listContent: { paddingHorizontal: 16, paddingBottom: 16, gap: 16 },
  card: { backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.border, overflow: "hidden" },
  priorityIndicator: { height: 4 },
  cardPadding: { padding: 16 },
  cardHeader: { marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: c.foreground, marginBottom: 6 },
  tagBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: c.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, alignSelf: "flex-start" },
  tagText: { color: c.primary, fontSize: 10, fontWeight: "600" },
  description: { fontSize: 14, color: c.mutedForeground, lineHeight: 20, marginBottom: 12 },
  metaRow: { flexDirection: "row", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: c.mutedForeground },
  authorSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border },
  authorText: { fontSize: 12, fontWeight: "500", color: c.foreground },
  bgRed: { backgroundColor: "#ef4444" },
  bgOrange: { backgroundColor: "#f97316" },
  bgGreen: { backgroundColor: "#22c55e" },
});