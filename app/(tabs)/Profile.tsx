import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Settings,
  LogOut,
  Moon,
  Sun,
  Shield,
  Bell as BellIcon,
  HelpCircle,
} from "lucide-react-native";

// --- Theme Mapping ---
const THEME = {
  primary: "#3b82f6",
  background: "#f9fafb",
  card: "#ffffff",
  border: "#e5e7eb",
  foreground: "#111827",
  mutedForeground: "#6b7280",
  muted: "#f3f4f6",
  danger: "#dc2626",
};

const userInfo = {
  name: "Juan Dela Cruz",
  purok: "Purok 3",
  barangay: "San Isidro",
  phone: "+63 912 345 6789",
  email: "juan.delacruz@email.com",
  residentId: "BI-2024-00123",
};

const settingsItems = [
  { icon: BellIcon, label: "Notifications", description: "Manage notification preferences" },
  { icon: Shield, label: "Privacy & Security", description: "Control your data and privacy" },
  { icon: HelpCircle, label: "Help & Support", description: "Get help and contact support" },
];

export default function Profile() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Helper for Avatar Initials
  const initials = userInfo.name.split(" ").map(n => n[0]).join("");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
      <ScrollView>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <User size={24} color="white" />
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <Text style={styles.headerSubtitle}>Manage your account and settings</Text>
        </View>

        {/* Profile Card (Negative Margin Overlay) */}
        <View style={styles.cardContainer}>
          <View style={styles.profileCard}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.nameMeta}>
                <Text style={styles.userName}>{userInfo.name}</Text>
                <Text style={styles.userId}>ID: {userInfo.residentId}</Text>
              </View>
            </View>

            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <MapPin size={16} color={THEME.mutedForeground} />
                <Text style={styles.infoText}>{userInfo.purok}, {userInfo.barangay}</Text>
              </View>
              <View style={styles.infoRow}>
                <Phone size={16} color={THEME.mutedForeground} />
                <Text style={styles.infoText}>{userInfo.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Mail size={16} color={THEME.mutedForeground} />
                <Text style={styles.infoText}>{userInfo.email}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dark Mode Toggle */}
        <View style={styles.sectionContainer}>
          <View style={styles.toggleCard}>
            <View style={styles.toggleLeft}>
              {isDarkMode ? (
                <Moon size={20} color={THEME.primary} />
              ) : (
                <Sun size={20} color={THEME.primary} />
              )}
              <View style={styles.toggleTextContent}>
                <Text style={styles.itemTitle}>Dark Mode</Text>
                <Text style={styles.itemSub}>{isDarkMode ? "Switch to light theme" : "Switch to dark theme"}</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={toggleTheme}
              style={[styles.switchTrack, isDarkMode ? styles.switchOn : styles.switchOff]}
            >
              <View style={[styles.switchThumb, isDarkMode ? styles.thumbOn : styles.thumbOff]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Settings</Text>
          <View style={styles.settingsGroup}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity key={index} style={[styles.settingsItem, index === settingsItems.length - 1 && { borderBottomWidth: 0 }]}>
                <item.icon size={20} color={THEME.mutedForeground} />
                <View style={styles.settingsTextContent}>
                  <Text style={styles.itemTitle}>{item.label}</Text>
                  <Text style={styles.itemSub}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.actionGap}>
            <TouchableOpacity style={styles.actionRowBtn}>
              <Settings size={20} color={THEME.mutedForeground} />
              <Text style={styles.actionBtnText}>Account Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn}>
              <LogOut size={20} color={THEME.danger} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Barangay App v1.0.0</Text>
          <Text style={styles.footerText}>© 2026 Barangay San Isidro</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: { backgroundColor: THEME.primary, padding: 16, paddingBottom: 48 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  
  cardContainer: { paddingHorizontal: 16, marginTop: -32, marginBottom: 24 },
  profileCard: { backgroundColor: THEME.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: THEME.border },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: THEME.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  nameMeta: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: THEME.foreground },
  userId: { fontSize: 12, color: THEME.mutedForeground },
  
  infoList: { gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { fontSize: 14, color: THEME.foreground },
  
  editButton: { width: '100%', marginTop: 20, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: THEME.border, alignItems: 'center' },
  editButtonText: { fontSize: 14, fontWeight: '600', color: THEME.foreground },
  
  sectionContainer: { paddingHorizontal: 16, marginBottom: 24 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: THEME.foreground, marginBottom: 12, paddingLeft: 4 },
  
  toggleCard: { backgroundColor: THEME.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: THEME.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleTextContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: THEME.foreground },
  itemSub: { fontSize: 12, color: THEME.mutedForeground },
  
  // Custom Switch Toggle
  switchTrack: { width: 48, height: 28, borderRadius: 14, padding: 4, justifyContent: 'center' },
  switchOn: { backgroundColor: THEME.primary },
  switchOff: { backgroundColor: '#d1d5db' },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'white' },
  thumbOn: { alignSelf: 'flex-end' },
  thumbOff: { alignSelf: 'flex-start' },

  settingsGroup: { backgroundColor: THEME.card, borderRadius: 16, borderWidth: 1, borderColor: THEME.border },
  settingsItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: THEME.border },
  settingsTextContent: { flex: 1 },

  actionGap: { gap: 12 },
  actionRowBtn: { backgroundColor: THEME.card, borderRadius: 16, borderWidth: 1, borderColor: THEME.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionBtnText: { flex: 1, fontSize: 14, fontWeight: '600', color: THEME.foreground },
  
  logoutBtn: { backgroundColor: THEME.card, borderRadius: 16, borderWidth: 1, borderColor: '#fecaca', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoutText: { flex: 1, fontSize: 14, fontWeight: '600', color: THEME.danger },

  footer: { paddingHorizontal: 16, paddingBottom: 32, alignItems: 'center' },
  footerText: { fontSize: 12, color: THEME.mutedForeground, marginTop: 4 }
});