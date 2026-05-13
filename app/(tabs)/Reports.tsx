import React, { useState, useEffect, useCallback } from "react";
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
  Image,
  ActivityIndicator,
  RefreshControl,
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
  X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme, ThemeColors } from "../hooks/useTheme";
import { useTabReset } from "../hooks/useTabReset";
import { supabase } from "../../lib/supabase";

const issueTypes = ["Streetlight", "Drainage", "Road", "Garbage", "Water", "Noise", "Security", "Other"];

export default function Reports() {
  const [view, setView] = useState<"list" | "create">("list");
  const [selectedType, setSelectedType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<{ type?: string; description?: string; location?: string }>({});
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const { subscribe } = useTabReset();

  // Reset to list view when tab icon is pressed
  useEffect(() => {
    return subscribe("Reports", () => setView("list"));
  }, [subscribe]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reports:", error);
      } else if (data) {
        const formatted = data.map((r: any) => ({
          id: r.id,
          type: r.issue_type,
          description: r.description,
          location: r.location,
          status: r.status,
          date: new Date(r.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          response: r.response,
          photoUrl: r.photo_url,
        }));
        setReports(formatted);
      }
    } catch (e) {
      console.error("Fetch reports exception:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }, []);

  const handlePhotoUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please allow access to your photo library to upload evidence.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to open image picker. Please try again.");
    }
  };

  const removePhoto = () => {
    setPhotoUri(null);
  };

  const uploadPhoto = async (userId: string): Promise<string | null> => {
    if (!photoUri) return null;

    try {
      const fileName = `${userId}/${Date.now()}.jpg`;
      const response = await fetch(photoUri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from("report-photos")
        .upload(fileName, blob, { contentType: "image/jpeg" });

      if (error) {
        console.warn("Photo upload failed (bucket may not exist):", error.message);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from("report-photos")
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (e) {
      console.warn("Photo upload exception:", e);
      return null;
    }
  };

  const handleSubmit = async () => {
    const errors: { type?: string; description?: string; location?: string } = {};
    if (!selectedType) errors.type = "Please select an issue type.";
    if (!description.trim()) errors.description = "Please describe the issue.";
    if (!location.trim()) errors.location = "Please provide the location.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in to submit a report.");

      // Upload photo if selected
      const photoUrl = await uploadPhoto(session.user.id);

      const insertData = {
        user_id: session.user.id,
        issue_type: selectedType,
        description: description.trim(),
        location: location.trim(),
        status: "pending",
        photo_url: photoUrl,
      };

      const { error } = await supabase.from("reports").insert(insertData);
      if (error) throw error;

      Alert.alert("Success", "Report submitted successfully!");
      setView("list");
      setSelectedType("");
      setDescription("");
      setLocation("");
      setPhotoUri(null);
      setFormErrors({});

      // Refresh reports list
      await fetchReports();
    } catch (e: any) {
      console.error("Submit report error:", e);
      Alert.alert("Error", e.message || "Failed to submit report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setView("list");
    setSelectedType("");
    setDescription("");
    setLocation("");
    setPhotoUri(null);
    setFormErrors({});
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const isCompleted = status === "completed";
    const isInProgress = status === "in-progress";
    return (
      <View style={[s.badge, isCompleted ? s.bgGreen : isInProgress ? s.bgOrange : s.bgGray]}>
        {isCompleted ? <CheckCircle size={10} color="#15803d" /> : 
         isInProgress ? <Clock size={10} color="#c2410c" /> : 
         <AlertCircle size={10} color="#374151" />}
        <Text style={[s.badgeText, isCompleted ? s.textGreen : isInProgress ? s.textOrange : s.textGray]}>{status}</Text>
      </View>
    );
  };

  const s = createStyles(colors);

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View style={s.headerTitleRow}>
            <FileText size={24} color={colors.headerText} />
            <Text style={s.headerTitle}>Reports</Text>
          </View>
          {view === "list" && (
            <TouchableOpacity style={s.newReportBtn} onPress={() => setView("create")}>
              <Text style={s.newReportBtnText}>New Report</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={s.headerSubtitle}>
          {view === "list" ? "Track your community reports" : "Report a community issue"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={
          view === "list" ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          ) : undefined
        }
      >
        {view === "list" ? (
          isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={s.listContainer}>
              {reports.length === 0 ? (
                <Text style={{ textAlign: "center", color: colors.mutedForeground, marginTop: 20 }}>No reports yet. Tap "New Report" to create one.</Text>
              ) : (
                reports.map((report) => (
                  <View key={report.id} style={[s.reportCard, {
                    borderLeftColor: report.status === 'completed' ? '#22c55e' :
                      report.status === 'in-progress' ? '#f97316' : '#9ca3af'
                  }]}>
                    <View style={s.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={s.cardTitleRow}>
                          <Text style={s.cardTitle}>{report.type} Issue</Text>
                          <StatusBadge status={report.status} />
                        </View>
                        <Text style={s.cardDesc}>{report.description}</Text>
                        <View style={s.locationRow}>
                          <MapPin size={12} color={colors.mutedForeground} />
                          <Text style={s.locationText}>{report.location}</Text>
                        </View>
                      </View>
                    </View>
                    {report.photoUrl && (
                      <Image source={{ uri: report.photoUrl }} style={s.reportPhoto} resizeMode="cover" />
                    )}
                    {report.response && (
                      <View style={s.responseContainer}>
                        <Text style={s.responseTextLabel}>Official Response:</Text>
                        <Text style={s.responseText}>{report.response}</Text>
                      </View>
                    )}
                    <Text style={s.dateText}>Reported on {report.date}</Text>
                  </View>
                ))
              )}
            </View>
          )
        ) : (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.form}>
            <View style={s.inputGroup}>
              <Text style={s.label}>Issue Type</Text>
              <View style={s.typeGrid}>
                {issueTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => { setSelectedType(type); setFormErrors({ ...formErrors, type: undefined }); }}
                    style={[s.typeButton, selectedType === type ? s.typeButtonSelected : s.typeButtonUnselected]}
                  >
                    <Text style={[s.typeButtonText, selectedType === type ? s.textWhite : { color: colors.foreground }]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {formErrors.type && <Text style={s.errorText}>{formErrors.type}</Text>}
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>Description</Text>
              <TextInput
                style={s.textArea}
                multiline
                numberOfLines={4}
                placeholder="Describe the issue in detail..."
                placeholderTextColor={colors.mutedForeground}
                value={description}
                onChangeText={(t) => { setDescription(t); setFormErrors({ ...formErrors, description: undefined }); }}
              />
              {formErrors.description && <Text style={s.errorText}>{formErrors.description}</Text>}
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>Location</Text>
              <View style={s.inputWithIcon}>
                <MapPin size={18} color={colors.mutedForeground} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="e.g., Purok 3, Basketball Court"
                  placeholderTextColor={colors.mutedForeground}
                  value={location}
                  onChangeText={(t) => { setLocation(t); setFormErrors({ ...formErrors, location: undefined }); }}
                />
              </View>
              {formErrors.location && <Text style={s.errorText}>{formErrors.location}</Text>}
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>Photo Evidence (Optional)</Text>
              {photoUri ? (
                <View style={s.photoPreviewContainer}>
                  <Image source={{ uri: photoUri }} style={s.photoPreview} resizeMode="cover" />
                  <TouchableOpacity style={s.removePhotoBtn} onPress={removePhoto}>
                    <X size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={s.photoUpload} onPress={handlePhotoUpload}>
                  <Camera size={32} color={colors.mutedForeground} />
                  <Text style={s.photoUploadText}>Tap to upload photo</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={s.formActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={handleCancel} disabled={isSubmitting}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Send size={18} color="white" />
                    <Text style={s.submitBtnText}>Submit Report</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { backgroundColor: c.headerBg, padding: 20, paddingBottom: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { color: c.headerText, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  headerSubtitle: { color: c.headerSubtext, fontSize: 14 },
  newReportBtn: { backgroundColor: 'white', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, ...(c.shadowSm as any) },
  newReportBtnText: { color: c.primary, fontSize: 13, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 24 },
  listContainer: { gap: 14 },
  reportCard: { backgroundColor: c.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: c.border, borderLeftWidth: 4, ...(c.shadow as any) },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: c.foreground, letterSpacing: -0.1 },
  cardDesc: { fontSize: 14, color: c.mutedForeground, marginBottom: 10, lineHeight: 20 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationText: { fontSize: 12, color: c.mutedForeground, fontWeight: '500' },
  responseContainer: { backgroundColor: c.muted, marginHorizontal: -18, padding: 16, marginTop: 14, borderTopWidth: 1, borderTopColor: c.divider },
  responseTextLabel: { fontSize: 12, fontWeight: '700', color: c.foreground, marginBottom: 4 },
  responseText: { fontSize: 13, color: c.mutedForeground, lineHeight: 19 },
  reportPhoto: { width: '100%', height: 180, borderRadius: 12, marginTop: 14 },
  dateText: { fontSize: 11, color: c.mutedForeground, marginTop: 14, fontWeight: '500' },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: c.foreground },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeButton: { width: '47%', padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  typeButtonSelected: { backgroundColor: c.primary, borderColor: c.primary, ...(c.shadowSm as any) },
  typeButtonUnselected: { backgroundColor: c.card, borderColor: c.border },
  typeButtonText: { fontSize: 14, fontWeight: '600' },
  textWhite: { color: 'white' },
  textArea: { backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 14, fontSize: 14, height: 110, textAlignVertical: 'top', color: c.foreground },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border, borderRadius: 12 },
  inputIcon: { marginLeft: 14 },
  input: { flex: 1, padding: 14, fontSize: 14, color: c.foreground },
  photoUpload: { width: '100%', padding: 28, borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: c.border, backgroundColor: c.inputBg, alignItems: 'center', justifyContent: 'center' },
  photoUploadText: { fontSize: 14, color: c.mutedForeground, marginTop: 10, fontWeight: '500' },
  photoPreviewContainer: { position: 'relative', borderRadius: 12, overflow: 'hidden' },
  photoPreview: { width: '100%', height: 200, borderRadius: 12 },
  removePhotoBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 8 },
  formActions: { flexDirection: 'row', gap: 12, paddingTop: 12 },
  cancelBtn: { flex: 1, backgroundColor: c.muted, padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelBtnText: { color: c.foreground, fontWeight: '600', fontSize: 15 },
  submitBtn: { flex: 1, backgroundColor: c.primary, padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...(c.shadow as any) },
  submitBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  errorText: { color: c.danger, fontSize: 12, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize', letterSpacing: 0.3 },
  bgGreen: { backgroundColor: '#dcfce7' },
  textGreen: { color: '#15803d' },
  bgOrange: { backgroundColor: '#ffedd5' },
  textOrange: { color: '#c2410c' },
  bgGray: { backgroundColor: '#f3f4f6' },
  textGray: { color: '#374151' },
});