import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Calendar, Clock, Tag } from "lucide-react-native";
import { useTheme, ThemeColors } from "../hooks/useTheme";
import { supabase } from "../../lib/supabase";

const categories = ["All", "Event", "Announcement", "Notice"];

export default function Updates() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from("updates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching updates:", error);
      } else if (data) {
        const formatted = data.map((u: any) => ({
          id: u.id,
          title: u.title,
          category: u.category,
          description: u.description,
          date: u.event_date
            ? new Date(u.event_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : "TBA",
          time: u.event_time
            ? u.event_time.slice(0, 5) // "HH:MM" from "HH:MM:SS"
            : "—",
          author: u.author,
          priority: u.priority,
        }));
        setAnnouncements(formatted);
      }
    } catch (e) {
      console.error("Fetch updates exception:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUpdates();
    setRefreshing(false);
  }, []);

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
      <ScrollView
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : filteredAnnouncements.length === 0 ? (
          <Text style={{ textAlign: "center", color: colors.mutedForeground, marginTop: 20 }}>No updates available.</Text>
        ) : (
          filteredAnnouncements.map((announcement) => (
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
          ))
        )}
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