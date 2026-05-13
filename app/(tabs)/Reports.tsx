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
                  <View key={report.id} style={s.reportCard}>
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
  header: { backgroundColor: c.headerBg, padding: 16, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: c.headerText, fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: c.headerSubtext, fontSize: 14 },
  newReportBtn: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  newReportBtnText: { color: c.primary, fontSize: 14, fontWeight: '600' },
  scrollContent: { padding: 16 },
  listContainer: { gap: 16 },
  reportCard: { backgroundColor: c.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: c.border },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: c.foreground },
  cardDesc: { fontSize: 14, color: c.mutedForeground, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: c.mutedForeground },
  responseContainer: { backgroundColor: c.muted, marginHorizontal: -16, padding: 16, marginTop: 12, borderTopWidth: 1, borderTopColor: c.border },
  responseTextLabel: { fontSize: 12, fontWeight: 'bold', color: c.foreground, marginBottom: 4 },
  responseText: { fontSize: 12, color: c.mutedForeground },
  reportPhoto: { width: '100%', height: 180, borderRadius: 8, marginTop: 12 },
  dateText: { fontSize: 10, color: c.mutedForeground, marginTop: 12 },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: c.foreground },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeButton: { width: '48%', padding: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  typeButtonSelected: { backgroundColor: c.primary, borderColor: c.primary },
  typeButtonUnselected: { backgroundColor: c.card, borderColor: c.border },
  typeButtonText: { fontSize: 14, fontWeight: '500' },
  textWhite: { color: 'white' },
  textArea: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 8, padding: 12, fontSize: 14, height: 100, textAlignVertical: 'top', color: c.foreground },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 8 },
  inputIcon: { marginLeft: 12 },
  input: { flex: 1, padding: 12, fontSize: 14, color: c.foreground },
  photoUpload: { width: '100%', padding: 24, borderRadius: 8, borderStyle: 'dashed', borderWidth: 2, borderColor: c.border, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' },
  photoUploadText: { fontSize: 14, color: c.mutedForeground, marginTop: 8 },
  photoPreviewContainer: { position: 'relative', borderRadius: 8, overflow: 'hidden' },
  photoPreview: { width: '100%', height: 200, borderRadius: 8 },
  removePhotoBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 16, padding: 6 },
  formActions: { flexDirection: 'row', gap: 12, paddingTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: c.muted, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { color: c.foreground, fontWeight: '600' },
  submitBtn: { flex: 1, backgroundColor: c.primary, padding: 14, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnText: { color: 'white', fontWeight: '600' },
  errorText: { color: c.danger, fontSize: 12, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  bgGreen: { backgroundColor: '#dcfce7' },
  textGreen: { color: '#15803d' },
  bgOrange: { backgroundColor: '#ffedd5' },
  textOrange: { color: '#c2410c' },
  bgGray: { backgroundColor: '#f3f4f6' },
  textGray: { color: '#374151' },
});