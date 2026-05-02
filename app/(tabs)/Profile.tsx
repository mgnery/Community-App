import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  ActivityIndicator,
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
  ChevronRight,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Save,
} from "lucide-react-native";
import { useAuth } from "../hooks/useAuth";
import { useTheme, ThemeColors } from "../hooks/useTheme";

type ProfileView = "main" | "editProfile" | "accountSettings";

export default function Profile() {
  const { user, signOut, updateProfile, changePassword } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const isDarkMode = theme === "dark";
  const [currentView, setCurrentView] = useState<ProfileView>("main");

  // --- Edit Profile State ---
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    purok: user?.purok || "",
    barangay: user?.barangay || "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // --- Account Settings State ---
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Helper for Avatar Initials
  const displayName = user?.fullName || "Resident";
  const displayEmail = user?.email || "user@email.com";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase();

  // --- Handlers ---

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => { await signOut(); },
        },
      ]
    );
  };

  const openEditProfile = () => {
    // Reset form with latest user data
    setEditForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      purok: user?.purok || "",
      barangay: user?.barangay || "",
    });
    setEditErrors({});
    setCurrentView("editProfile");
  };

  const handleSaveProfile = async () => {
    // Validate
    const errors: Record<string, string> = {};
    if (!editForm.fullName.trim()) errors.fullName = "Full name is required.";
    if (!editForm.email.trim()) errors.email = "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editForm.email.trim() && !emailRegex.test(editForm.email.trim())) {
      errors.email = "Please enter a valid email.";
    }
    if (Object.keys(errors).length > 0) { setEditErrors(errors); return; }

    setEditLoading(true);
    const result = await updateProfile({
      fullName: editForm.fullName.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      purok: editForm.purok.trim(),
      barangay: editForm.barangay.trim(),
    });
    setEditLoading(false);

    if (result.success) {
      Alert.alert("Success", "Profile updated successfully!");
      setCurrentView("main");
    } else {
      Alert.alert("Error", result.error || "Failed to update profile.");
    }
  };

  const openAccountSettings = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordErrors({});
    setCurrentView("accountSettings");
  };

  const handleChangePassword = async () => {
    const errors: Record<string, string> = {};
    if (!passwordForm.currentPassword) errors.currentPassword = "Current password is required.";
    if (!passwordForm.newPassword) errors.newPassword = "New password is required.";
    if (passwordForm.newPassword && passwordForm.newPassword.length < 6) {
      errors.newPassword = "Must be at least 6 characters.";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    if (Object.keys(errors).length > 0) { setPasswordErrors(errors); return; }

    setPasswordLoading(true);
    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    setPasswordLoading(false);

    if (result.success) {
      Alert.alert("Success", "Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
    } else {
      Alert.alert("Error", result.error || "Failed to change password.");
    }
  };

  const handleSettingsPress = (label: string) => {
    Alert.alert(label, `${label} settings will be available in a future update.`, [{ text: "OK" }]);
  };

  const s = createStyles(colors);

  // ==================== EDIT PROFILE VIEW ====================
  if (currentView === "editProfile") {
    return (
      <SafeAreaView style={s.container}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        <ScrollView>
          {/* Header with Back */}
          <View style={s.subHeader}>
            <TouchableOpacity onPress={() => setCurrentView("main")} style={s.backBtn}>
              <ArrowLeft size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={s.subHeaderTitle}>Edit Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={s.formContainer}>
            {/* Avatar */}
            <View style={s.editAvatarRow}>
              <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
            </View>

            {/* Full Name */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>Full Name</Text>
              <TextInput
                style={s.fieldInput}
                value={editForm.fullName}
                onChangeText={(t) => { setEditForm({...editForm, fullName: t}); setEditErrors({...editErrors, fullName: ""}); }}
                placeholder="Enter your full name"
                placeholderTextColor={colors.mutedForeground}
              />
              {editErrors.fullName ? <Text style={s.errorText}>{editErrors.fullName}</Text> : null}
            </View>

            {/* Email */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>Email</Text>
              <TextInput
                style={s.fieldInput}
                value={editForm.email}
                onChangeText={(t) => { setEditForm({...editForm, email: t}); setEditErrors({...editErrors, email: ""}); }}
                placeholder="Enter your email"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {editErrors.email ? <Text style={s.errorText}>{editErrors.email}</Text> : null}
            </View>

            {/* Phone */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>Phone Number</Text>
              <TextInput
                style={s.fieldInput}
                value={editForm.phone}
                onChangeText={(t) => setEditForm({...editForm, phone: t})}
                placeholder="e.g., +63 912 345 6789"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
              />
            </View>

            {/* Purok */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>Purok</Text>
              <TextInput
                style={s.fieldInput}
                value={editForm.purok}
                onChangeText={(t) => setEditForm({...editForm, purok: t})}
                placeholder="e.g., Purok 3"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            {/* Barangay */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>Barangay</Text>
              <TextInput
                style={s.fieldInput}
                value={editForm.barangay}
                onChangeText={(t) => setEditForm({...editForm, barangay: t})}
                placeholder="e.g., San Isidro"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity style={s.saveBtn} onPress={handleSaveProfile} disabled={editLoading}>
              {editLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Save size={18} color="white" />
                  <Text style={s.saveBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==================== ACCOUNT SETTINGS VIEW ====================
  if (currentView === "accountSettings") {
    return (
      <SafeAreaView style={s.container}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        <ScrollView>
          {/* Header with Back */}
          <View style={s.subHeader}>
            <TouchableOpacity onPress={() => setCurrentView("main")} style={s.backBtn}>
              <ArrowLeft size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={s.subHeaderTitle}>Account Settings</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={s.formContainer}>
            {/* Change Password Section */}
            <View style={s.settingsSection}>
              <View style={s.sectionTitleRow}>
                <Lock size={18} color={colors.primary} />
                <Text style={s.settingsSectionTitle}>Change Password</Text>
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>Current Password</Text>
                <View style={s.passwordRow}>
                  <TextInput
                    style={s.passwordInput}
                    value={passwordForm.currentPassword}
                    onChangeText={(t) => { setPasswordForm({...passwordForm, currentPassword: t}); setPasswordErrors({...passwordErrors, currentPassword: ""}); }}
                    placeholder="Enter current password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={!showCurrentPassword}
                  />
                  <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={s.eyeBtn}>
                    {showCurrentPassword ? <EyeOff size={18} color={colors.mutedForeground} /> : <Eye size={18} color={colors.mutedForeground} />}
                  </TouchableOpacity>
                </View>
                {passwordErrors.currentPassword ? <Text style={s.errorText}>{passwordErrors.currentPassword}</Text> : null}
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>New Password</Text>
                <View style={s.passwordRow}>
                  <TextInput
                    style={s.passwordInput}
                    value={passwordForm.newPassword}
                    onChangeText={(t) => { setPasswordForm({...passwordForm, newPassword: t}); setPasswordErrors({...passwordErrors, newPassword: ""}); }}
                    placeholder="Enter new password (min 6 chars)"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={s.eyeBtn}>
                    {showNewPassword ? <EyeOff size={18} color={colors.mutedForeground} /> : <Eye size={18} color={colors.mutedForeground} />}
                  </TouchableOpacity>
                </View>
                {passwordErrors.newPassword ? <Text style={s.errorText}>{passwordErrors.newPassword}</Text> : null}
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>Confirm New Password</Text>
                <TextInput
                  style={s.fieldInput}
                  value={passwordForm.confirmPassword}
                  onChangeText={(t) => { setPasswordForm({...passwordForm, confirmPassword: t}); setPasswordErrors({...passwordErrors, confirmPassword: ""}); }}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={true}
                />
                {passwordErrors.confirmPassword ? <Text style={s.errorText}>{passwordErrors.confirmPassword}</Text> : null}
              </View>

              <TouchableOpacity style={s.saveBtn} onPress={handleChangePassword} disabled={passwordLoading}>
                {passwordLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Lock size={18} color="white" />
                    <Text style={s.saveBtnText}>Update Password</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Danger Zone */}
            <View style={s.settingsSection}>
              <Text style={[s.settingsSectionTitle, { color: colors.danger }]}>Danger Zone</Text>
              <TouchableOpacity
                style={s.dangerBtn}
                onPress={() => {
                  Alert.alert(
                    "Delete Account",
                    "Are you sure you want to delete your account? This action cannot be undone.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        // ============================================================
                        // DELETE ACCOUNT — Replace with actual API call
                        // Example: await fetch('/api/user/delete', { method: 'DELETE' })
                        // ============================================================
                        onPress: async () => {
                          await signOut();
                          Alert.alert("Account Deleted", "Your account has been removed.");
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={s.dangerBtnText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==================== MAIN PROFILE VIEW ====================
  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.headerBg} />
      <ScrollView>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <User size={24} color={colors.headerText} />
            <Text style={s.headerTitle}>Profile</Text>
          </View>
          <Text style={s.headerSubtitle}>Manage your account and settings</Text>
        </View>

        {/* Profile Card */}
        <View style={s.cardContainer}>
          <View style={s.profileCard}>
            <View style={s.avatarRow}>
              <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
              <View style={s.nameMeta}>
                <Text style={s.userName}>{displayName}</Text>
                <Text style={s.userId}>ID: {user?.residentId || "—"}</Text>
              </View>
            </View>

            <View style={s.infoList}>
              <View style={s.infoRow}>
                <MapPin size={16} color={colors.mutedForeground} />
                <Text style={s.infoText}>{user?.purok || "—"}{user?.purok && user?.barangay ? ", " : ""}{user?.barangay || ""}</Text>
              </View>
              <View style={s.infoRow}>
                <Phone size={16} color={colors.mutedForeground} />
                <Text style={s.infoText}>{user?.phone || "—"}</Text>
              </View>
              <View style={s.infoRow}>
                <Mail size={16} color={colors.mutedForeground} />
                <Text style={s.infoText}>{displayEmail}</Text>
              </View>
            </View>

            <TouchableOpacity style={s.editButton} onPress={openEditProfile}>
              <Text style={s.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dark Mode Toggle */}
        <View style={s.sectionContainer}>
          <View style={s.toggleCard}>
            <View style={s.toggleLeft}>
              {isDarkMode ? <Moon size={20} color={colors.primary} /> : <Sun size={20} color={colors.primary} />}
              <View style={s.toggleTextContent}>
                <Text style={s.itemTitle}>Dark Mode</Text>
                <Text style={s.itemSub}>{isDarkMode ? "Switch to light theme" : "Switch to dark theme"}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={[s.switchTrack, isDarkMode ? s.switchOn : s.switchOff]}>
              <View style={[s.switchThumb, isDarkMode ? s.thumbOn : s.thumbOff]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings List */}
        <View style={s.sectionContainer}>
          <Text style={s.sectionLabel}>Settings</Text>
          <View style={s.settingsGroup}>
            {[
              { icon: BellIcon, label: "Notifications", description: "Manage notification preferences" },
              { icon: Shield, label: "Privacy & Security", description: "Control your data and privacy" },
              { icon: HelpCircle, label: "Help & Support", description: "Get help and contact support" },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[s.settingsItem, index === 2 && { borderBottomWidth: 0 }]}
                onPress={() => handleSettingsPress(item.label)}
              >
                <item.icon size={20} color={colors.mutedForeground} />
                <View style={s.settingsTextContent}>
                  <Text style={s.itemTitle}>{item.label}</Text>
                  <Text style={s.itemSub}>{item.description}</Text>
                </View>
                <ChevronRight size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Actions */}
        <View style={s.sectionContainer}>
          <Text style={s.sectionLabel}>Account</Text>
          <View style={s.actionGap}>
            <TouchableOpacity style={s.actionRowBtn} onPress={openAccountSettings}>
              <Settings size={20} color={colors.mutedForeground} />
              <Text style={s.actionBtnText}>Account Settings</Text>
              <ChevronRight size={18} color={colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
              <LogOut size={20} color={colors.danger} />
              <Text style={s.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={s.footer}>
          <Text style={s.footerText}>Barangay App v1.0.0</Text>
          <Text style={s.footerText}>© 2026 Barangay San Isidro</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { backgroundColor: c.headerBg, padding: 16, paddingBottom: 48 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  headerTitle: { color: c.headerText, fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: c.headerSubtext, fontSize: 14 },

  // Sub-page header (edit profile, account settings)
  subHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: c.border },
  subHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: c.foreground },
  backBtn: { padding: 8 },

  cardContainer: { paddingHorizontal: 16, marginTop: -32, marginBottom: 24 },
  profileCard: { backgroundColor: c.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: c.border },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  nameMeta: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: c.foreground },
  userId: { fontSize: 12, color: c.mutedForeground },
  infoList: { gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { fontSize: 14, color: c.foreground },
  editButton: { width: '100%', marginTop: 20, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: c.border, alignItems: 'center' },
  editButtonText: { fontSize: 14, fontWeight: '600', color: c.foreground },

  sectionContainer: { paddingHorizontal: 16, marginBottom: 24 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: c.foreground, marginBottom: 12, paddingLeft: 4 },

  toggleCard: { backgroundColor: c.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleTextContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: c.foreground },
  itemSub: { fontSize: 12, color: c.mutedForeground },

  switchTrack: { width: 48, height: 28, borderRadius: 14, padding: 4, justifyContent: 'center' },
  switchOn: { backgroundColor: c.primary },
  switchOff: { backgroundColor: '#d1d5db' },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'white' },
  thumbOn: { alignSelf: 'flex-end' },
  thumbOff: { alignSelf: 'flex-start' },

  settingsGroup: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border },
  settingsItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: c.border },
  settingsTextContent: { flex: 1 },

  actionGap: { gap: 12 },
  actionRowBtn: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionBtnText: { flex: 1, fontSize: 14, fontWeight: '600', color: c.foreground },
  logoutBtn: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: '#fecaca', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoutText: { flex: 1, fontSize: 14, fontWeight: '600', color: c.danger },

  footer: { paddingHorizontal: 16, paddingBottom: 32, alignItems: 'center' },
  footerText: { fontSize: 12, color: c.mutedForeground, marginTop: 4 },

  // Form Styles (shared by Edit Profile & Account Settings)
  formContainer: { padding: 16, gap: 24 },
  editAvatarRow: { alignItems: 'center', marginBottom: 8 },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: c.foreground },
  fieldInput: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 10, padding: 12, fontSize: 14, color: c.foreground },
  errorText: { color: c.danger, fontSize: 12 },
  saveBtn: { backgroundColor: c.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 8 },
  saveBtnText: { color: 'white', fontWeight: '600', fontSize: 15 },

  // Password fields
  passwordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 10 },
  passwordInput: { flex: 1, padding: 12, fontSize: 14, color: c.foreground },
  eyeBtn: { padding: 12 },

  // Account Settings sections
  settingsSection: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 20, gap: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  settingsSectionTitle: { fontSize: 16, fontWeight: 'bold', color: c.foreground },

  dangerBtn: { borderWidth: 1, borderColor: c.danger, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  dangerBtnText: { color: c.danger, fontWeight: '600', fontSize: 14 },
});