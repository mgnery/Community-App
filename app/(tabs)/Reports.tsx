import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FileText,
  Camera,
  MapPin,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react-native";

// --- Theme & Constants ---
const THEME = {
  primary: "#3b82f6",
  background: "#ffffff",
  card: "#ffffff",
  border: "#e5e7eb",
  foreground: "#111827",
  mutedForeground: "#6b7280",
  muted: "#f3f4f6",
};

const myReports = [
  {
    id: 1,
    type: "Streetlight",
    description: "Broken streetlight in Purok 3 near the basketball court",
    location: "Purok 3, Basketball Court",
    status: "completed",
    date: "March 30, 2026",
    response: "Streetlight has been repaired. Thank you for reporting!",
  },
  {
    id: 2,
    type: "Drainage",
    description: "Clogged drainage causing flooding during rain",
    location: "Purok 1, Main Street",
    status: "in-progress",
    date: "April 5, 2026",
    response: "Our team is working on clearing the drainage.",
  },
  {
    id: 3,
    type: "Road",
    description: "Large pothole on the road, dangerous for vehicles",
    location: "Purok 2, Corner Street",
    status: "pending",
    date: "April 6, 2026",
    response: null,
  },
];

const issueTypes = ["Streetlight", "Drainage", "Road", "Garbage", "Water", "Noise", "Security", "Other"];

export default function Reports() {
  const [view, setView] = useState<"list" | "create">("list");
  const [selectedType, setSelectedType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = () => {
    Alert.alert("Success", "Report submitted successfully!");
    setView("list");
    setSelectedType("");
    setDescription("");
    setLocation("");
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const isCompleted = status === "completed";
    const isInProgress = status === "in-progress";

    return (
      <View style={[
        styles.badge,
        isCompleted ? styles.bgGreen : isInProgress ? styles.bgOrange : styles.bgGray
      ]}>
        {isCompleted ? <CheckCircle size={10} color="#15803d" /> : 
         isInProgress ? <Clock size={10} color="#c2410c" /> : 
         <AlertCircle size={10} color="#374151" />}
        <Text style={[
          styles.badgeText,
          isCompleted ? styles.textGreen : isInProgress ? styles.textOrange : styles.textGray
        ]}>{status}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
            <FileText size={24} color="white" />
            <Text style={styles.headerTitle}>Reports</Text>
          </View>
          {view === "list" && (
            <TouchableOpacity style={styles.newReportBtn} onPress={() => setView("create")}>
              <Text style={styles.newReportBtnText}>New Report</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.headerSubtitle}>
          {view === "list" ? "Track your community reports" : "Report a community issue"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {view === "list" ? (
          /* Reports List */
          <View style={styles.listContainer}>
            {myReports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardTitle}>{report.type} Issue</Text>
                      <StatusBadge status={report.status} />
                    </View>
                    <Text style={styles.cardDesc}>{report.description}</Text>
                    <View style={styles.locationRow}>
                      <MapPin size={12} color={THEME.mutedForeground} />
                      <Text style={styles.locationText}>{report.location}</Text>
                    </View>
                  </View>
                </View>

                {report.response && (
                  <View style={styles.responseContainer}>
                    <Text style={styles.responseTextLabel}>Official Response:</Text>
                    <Text style={styles.responseText}>{report.response}</Text>
                  </View>
                )}
                <Text style={styles.dateText}>Reported on {report.date}</Text>
              </View>
            ))}
          </View>
        ) : (
          /* Create Report Form */
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Issue Type</Text>
              <View style={styles.typeGrid}>
                {issueTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setSelectedType(type)}
                    style={[
                      styles.typeButton,
                      selectedType === type ? styles.typeButtonSelected : styles.typeButtonUnselected
                    ]}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      selectedType === type ? styles.textWhite : styles.textForeground
                    ]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="Describe the issue in detail..."
                placeholderTextColor={THEME.mutedForeground}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={18} color={THEME.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Purok 3, Basketball Court"
                  placeholderTextColor={THEME.mutedForeground}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Photo Evidence (Optional)</Text>
              <TouchableOpacity style={styles.photoUpload}>
                <Camera size={32} color={THEME.mutedForeground} />
                <Text style={styles.photoUploadText}>Tap to upload photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setView("list")}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitBtn, (!selectedType || !description || !location) && { opacity: 0.5 }]} 
                onPress={handleSubmit}
                disabled={!selectedType || !description || !location}
              >
                <Send size={18} color="white" />
                <Text style={styles.submitBtnText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: { backgroundColor: THEME.primary, padding: 16, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  newReportBtn: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  newReportBtnText: { color: THEME.primary, fontSize: 14, fontWeight: '600' },
  
  scrollContent: { padding: 16 },
  listContainer: { gap: 16 },
  reportCard: { backgroundColor: THEME.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: THEME.border },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.foreground },
  cardDesc: { fontSize: 14, color: THEME.mutedForeground, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: THEME.mutedForeground },
  
  responseContainer: { backgroundColor: '#f9fafb', marginHorizontal: -16, padding: 16, marginTop: 12, borderTopWidth: 1, borderTopColor: THEME.border },
  responseTextLabel: { fontSize: 12, fontWeight: 'bold', color: THEME.foreground, marginBottom: 4 },
  responseText: { fontSize: 12, color: THEME.mutedForeground },
  dateText: { fontSize: 10, color: THEME.mutedForeground, marginTop: 12 },

  // Form Styles
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: THEME.foreground },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeButton: { width: '48%', padding: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  typeButtonSelected: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  typeButtonUnselected: { backgroundColor: THEME.card, borderColor: THEME.border },
  typeButtonText: { fontSize: 14, fontWeight: '500' },
  textWhite: { color: 'white' },
  textForeground: { color: THEME.foreground },

  textArea: { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 8, padding: 12, fontSize: 14, height: 100, textAlignVertical: 'top' },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 8 },
  inputIcon: { marginLeft: 12 },
  input: { flex: 1, padding: 12, fontSize: 14 },
  
  photoUpload: { width: '100%', padding: 24, borderRadius: 8, borderStyle: 'dashed', borderWidth: 2, borderColor: THEME.border, backgroundColor: THEME.card, alignItems: 'center', justifyContent: 'center' },
  photoUploadText: { fontSize: 14, color: THEME.mutedForeground, marginTop: 8 },

  formActions: { flexDirection: 'row', gap: 12, paddingTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: THEME.muted, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { color: THEME.foreground, fontWeight: '600' },
  submitBtn: { flex: 1, backgroundColor: THEME.primary, padding: 14, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnText: { color: 'white', fontWeight: '600' },

  // Badges
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  bgGreen: { backgroundColor: '#dcfce7' },
  textGreen: { color: '#15803d' },
  bgOrange: { backgroundColor: '#ffedd5' },
  textOrange: { color: '#c2410c' },
  bgGray: { backgroundColor: '#f3f4f6' },
  textGray: { color: '#374151' },
});