import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Heart,
  Info,
  MapPin,
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeColors, useTheme } from "../hooks/useTheme";
import { useTabReset } from "../hooks/useTabReset";
import { supabase } from "../../lib/supabase";

export default function Ayuda() {
  const [view, setView] = useState<"programs" | "applications" | "apply">("programs");
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [distributionMethod, setDistributionMethod] = useState<"digital" | "physical">("digital");
  const [bankDetails, setBankDetails] = useState({ accountName: "", accountNumber: "", bankName: "" });
  
  const [programs, setPrograms] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formErrors, setFormErrors] = useState<{ accountName?: string; accountNumber?: string; bankName?: string }>({});
  const { colors } = useTheme();
  const { subscribe } = useTabReset();

  // Reset to programs view when tab icon is pressed
  useEffect(() => {
    return subscribe("Ayuda", () => setView("programs"));
  }, [subscribe]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchPrograms(), fetchApplications()]);
    setIsLoading(false);
  };

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("ayuda_programs")
        .select("*")
        .order("id", { ascending: true });
        
      if (error) {
        console.error("Error fetching programs:", error);
      } else if (data) {
        // Map snake_case from DB to camelCase for UI compatibility
        const formattedPrograms = data.map(p => ({
          ...p,
          startDate: p.start_date ? new Date(p.start_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "TBA",
          endDate: p.end_date ? new Date(p.end_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "TBA",
        }));
        setPrograms(formattedPrograms);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("ayuda_applications")
        .select(`
          id,
          status,
          method,
          created_at,
          ayuda_programs ( title, amount )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
      } else if (data) {
        const formattedApps = data.map((app: any) => ({
          id: app.id,
          program: app.ayuda_programs?.title || "Unknown Program",
          amount: app.ayuda_programs?.amount || "—",
          status: app.status,
          appliedDate: new Date(app.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          method: app.method,
        }));
        setApplications(formattedApps);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setSelectedProgram(null);
    setDistributionMethod("digital");
    setBankDetails({ accountName: "", accountNumber: "", bankName: "" });
    setFormErrors({});
  };

  const handleApply = async () => {
    if (distributionMethod === "digital") {
      const errors: { accountName?: string; accountNumber?: string; bankName?: string } = {};
      if (!bankDetails.accountName.trim()) errors.accountName = "Account name is required.";
      if (!bankDetails.accountNumber.trim()) errors.accountNumber = "Account number is required.";
      if (!bankDetails.bankName.trim()) errors.bankName = "Bank name is required.";
      if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    }

    try {
      setIsSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in to apply.");

      const insertData = {
        program_id: selectedProgram.id,
        user_id: session.user.id,
        status: "pending",
        method: distributionMethod,
        account_name: distributionMethod === "digital" ? bankDetails.accountName : null,
        account_number: distributionMethod === "digital" ? bankDetails.accountNumber : null,
        bank_name: distributionMethod === "digital" ? bankDetails.bankName : null,
      };

      const { error } = await supabase.from("ayuda_applications").insert(insertData);
      
      if (error) throw error;

      Alert.alert("Success", "Application submitted successfully!");
      resetForm();
      setView("applications");
      
      // Refresh applications list
      await fetchApplications();
      
    } catch (e: any) {
      console.error("Application error:", e);
      Alert.alert("Error", e.message || "Failed to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => { resetForm(); setView("programs"); };

  const s = createStyles(colors);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View style={s.headerTitleRow}>
          <Heart size={24} color={colors.headerText} />
          <Text style={s.headerTitle}>Ayuda</Text>
        </View>
        <Text style={s.headerSubtitle}>Assistance programs for the community</Text>
      </View>

      <View style={s.tabWrapper}>
        <View style={s.tabContainer}>
          <TouchableOpacity onPress={() => setView("programs")} style={[s.tabBtn, view === "programs" && s.tabBtnActive]}>
            <Text style={[s.tabText, view === "programs" ? s.textWhite : { color: colors.foreground }]}>Programs</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setView("applications")} style={[s.tabBtn, view === "applications" && s.tabBtnActive]}>
            <Text style={[s.tabText, view === "applications" ? s.textWhite : { color: colors.foreground }]}>My Applications</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {view === "programs" && (
              <View style={s.listGap}>
                {programs.length === 0 ? (
                  <Text style={{ textAlign: "center", color: colors.mutedForeground, marginTop: 20 }}>No active programs at this time.</Text>
                ) : (
                  programs.map((program) => (
                    <View key={program.id} style={s.card}>
                      <View style={[s.statusBar, program.status === "active" ? s.bgGreen : program.status === "upcoming" ? s.bgOrange : s.bgGray]} />
                      <View style={s.cardPadding}>
                        <View style={s.cardHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={s.cardTitle}>{program.title}</Text>
                            <View style={[s.statusBadge, program.status === "active" ? s.badgeGreen : program.status === "upcoming" ? s.badgeOrange : s.badgeGray]}>
                              <Text style={[s.statusText, program.status === "active" ? s.textGreen : program.status === "upcoming" ? s.textOrange : s.textGray]}>{program.status}</Text>
                            </View>
                          </View>
                          <View style={s.amountBox}><Text style={s.amountLabel}>Amount</Text><Text style={s.amountValue}>{program.amount}</Text></View>
                        </View>
                        <Text style={s.description}>{program.description}</Text>
                        <View style={s.detailsList}>
                          <View style={s.detailItem}><Calendar size={14} color={colors.mutedForeground} /><Text style={s.detailText}>{program.startDate} - {program.endDate}</Text></View>
                          <View style={s.detailItem}><MapPin size={14} color={colors.mutedForeground} /><Text style={s.detailText}>{program.distribution}</Text></View>
                          <View style={s.detailItem}><Info size={14} color={colors.mutedForeground} /><Text style={s.detailText}>{program.eligibility}</Text></View>
                        </View>
                        {program.status === "active" && (
                          <TouchableOpacity style={s.primaryBtn} onPress={() => { setSelectedProgram(program); setView("apply"); }}>
                            <Text style={s.primaryBtnText}>Apply Now</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {view === "applications" && (
              <View style={s.listGap}>
                {applications.length === 0 ? (
                  <Text style={{ textAlign: "center", color: colors.mutedForeground, marginTop: 20 }}>You have not applied for any programs yet.</Text>
                ) : (
                  applications.map((app) => (
                    <View key={app.id} style={[s.card, s.cardPadding]}>
                      <View style={s.cardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={s.cardTitle}>{app.program}</Text>
                          <View style={[s.statusBadge, app.status === "approved" ? s.badgeGreen : app.status === "rejected" ? s.badgeRed : s.badgeOrange]}>
                            {app.status === "approved" ? <CheckCircle size={10} color={colors.success} /> : <Clock size={10} color={colors.warning} />}
                            <Text style={[s.statusText, app.status === "approved" ? s.textGreen : app.status === "rejected" ? s.textRed : s.textOrange]}> {app.status}</Text>
                          </View>
                        </View>
                        <View style={{ alignItems: "flex-end" }}><Text style={s.amountLabel}>Amount</Text><Text style={s.amountValue}>{app.amount}</Text></View>
                      </View>
                      <View style={s.appMetaRow}><Text style={s.detailText}>Applied on:</Text><Text style={s.metaValue}>{app.appliedDate}</Text></View>
                      <View style={s.appMetaRow}><Text style={s.detailText}>Distribution method:</Text><Text style={[s.metaValue, { textTransform: 'capitalize' }]}>{app.method}</Text></View>
                      {app.status === "approved" && (
                        <View style={s.approvedNotice}><Text style={s.approvedNoticeText}>✓ Your application has been approved! Please check the program schedule for distribution details.</Text></View>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}

            {view === "apply" && selectedProgram && (
              <View style={s.listGap}>
                <View style={[s.card, s.cardPadding]}>
                  <Text style={s.cardTitle}>{selectedProgram.title}</Text>
                  <Text style={s.description}>{selectedProgram.description}</Text>
                  <Text style={s.amountValue}>{selectedProgram.amount}</Text>
                </View>

                <Text style={s.formLabel}>Distribution Method</Text>
                <View style={s.methodGrid}>
                  <TouchableOpacity style={[s.methodCard, distributionMethod === "digital" && s.methodCardActive]} onPress={() => { setDistributionMethod("digital"); setFormErrors({}); }}>
                    <CreditCard size={24} color={distributionMethod === "digital" ? "white" : colors.foreground} />
                    <Text style={[s.methodTitle, distributionMethod === "digital" && s.textWhite]}>Digital</Text>
                    <Text style={[s.methodSub, distributionMethod === "digital" && { color: 'rgba(255,255,255,0.8)' }]}>Bank transfer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.methodCard, distributionMethod === "physical" && s.methodCardActive]} onPress={() => { setDistributionMethod("physical"); setFormErrors({}); }}>
                    <MapPin size={24} color={distributionMethod === "physical" ? "white" : colors.foreground} />
                    <Text style={[s.methodTitle, distributionMethod === "physical" && s.textWhite]}>Physical</Text>
                    <Text style={[s.methodSub, distributionMethod === "physical" && { color: 'rgba(255,255,255,0.8)' }]}>Claim at barangay</Text>
                  </TouchableOpacity>
                </View>

                {distributionMethod === "digital" ? (
                  <View style={s.listGap}>
                    <Text style={s.formLabel}>Bank Details</Text>
                    <View>
                      <TextInput style={s.input} placeholder="Account Name" placeholderTextColor={colors.mutedForeground} value={bankDetails.accountName} onChangeText={(t) => { setBankDetails({ ...bankDetails, accountName: t }); setFormErrors({ ...formErrors, accountName: undefined }); }} />
                      {formErrors.accountName && <Text style={s.errorText}>{formErrors.accountName}</Text>}
                    </View>
                    <View>
                      <TextInput style={s.input} placeholder="Account Number" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" value={bankDetails.accountNumber} onChangeText={(t) => { setBankDetails({ ...bankDetails, accountNumber: t }); setFormErrors({ ...formErrors, accountNumber: undefined }); }} />
                      {formErrors.accountNumber && <Text style={s.errorText}>{formErrors.accountNumber}</Text>}
                    </View>
                    <View>
                      <TextInput style={s.input} placeholder="Bank Name" placeholderTextColor={colors.mutedForeground} value={bankDetails.bankName} onChangeText={(t) => { setBankDetails({ ...bankDetails, bankName: t }); setFormErrors({ ...formErrors, bankName: undefined }); }} />
                      {formErrors.bankName && <Text style={s.errorText}>{formErrors.bankName}</Text>}
                    </View>
                  </View>
                ) : (
                  <View style={s.infoBox}>
                    <Info size={18} color="#2563eb" />
                    <View style={{ flex: 1 }}>
                      <Text style={s.infoBoxTitle}>Physical Distribution Schedule:</Text>
                      <Text style={s.infoBoxText}>Check the program details for distribution dates. Please bring a valid ID when claiming at the Barangay Hall.</Text>
                    </View>
                  </View>
                )}

                <View style={s.actionRow}>
                  <TouchableOpacity style={[s.secondaryBtn, { flex: 1 }]} onPress={handleCancel} disabled={isSubmitting}><Text style={s.secondaryBtnText}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity style={[s.primaryBtn, { flex: 1, flexDirection: 'row', gap: 8 }]} onPress={handleApply} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator color="white" /> : <><CheckCircle size={18} color="white" /><Text style={s.primaryBtnText}>Submit</Text></>}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
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
  tabWrapper: { paddingHorizontal: 16, marginTop: -16, marginBottom: 16 },
  tabContainer: { backgroundColor: c.card, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: c.border, flexDirection: "row" },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  tabBtnActive: { backgroundColor: c.primary },
  tabText: { fontSize: 12, fontWeight: "600" },
  scrollContent: { padding: 16, paddingBottom: 32 },
  listGap: { gap: 16 },
  card: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: "hidden" },
  statusBar: { height: 4 },
  cardPadding: { padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: c.foreground, marginBottom: 4 },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, flexDirection: "row", alignItems: "center" },
  statusText: { fontSize: 10, fontWeight: "bold", textTransform: "capitalize" },
  amountBox: { backgroundColor: c.primaryLight, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignItems: "center" },
  amountLabel: { fontSize: 10, color: c.mutedForeground },
  amountValue: { fontSize: 18, fontWeight: "bold", color: c.primary },
  description: { fontSize: 14, color: c.mutedForeground, marginBottom: 12 },
  detailsList: { gap: 8, marginBottom: 16 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontSize: 12, color: c.mutedForeground },
  primaryBtn: { backgroundColor: c.primary, paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: "white", fontWeight: "600", fontSize: 14 },
  secondaryBtn: { backgroundColor: c.muted, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  secondaryBtnText: { color: c.foreground, fontWeight: "600" },
  appMetaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  metaValue: { fontSize: 12, fontWeight: "600", color: c.foreground },
  approvedNotice: { marginTop: 12, padding: 12, backgroundColor: "#f0fdf4", borderRadius: 8, borderLeftWidth: 4, borderLeftColor: c.success },
  approvedNoticeText: { fontSize: 12, color: "#166534", fontWeight: "500" },
  formLabel: { fontSize: 14, fontWeight: "600", color: c.foreground, marginBottom: 8 },
  methodGrid: { flexDirection: "row", gap: 12 },
  methodCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.card },
  methodCardActive: { backgroundColor: c.primary, borderColor: c.primary },
  methodTitle: { fontSize: 14, fontWeight: "bold", marginTop: 8, color: c.foreground },
  methodSub: { fontSize: 11, color: c.mutedForeground },
  input: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 14, fontSize: 14, color: c.foreground },
  infoBox: { flexDirection: "row", gap: 12, backgroundColor: "#eff6ff", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#bfdbfe" },
  infoBoxTitle: { fontSize: 12, fontWeight: "bold", color: "#1e40af", marginBottom: 4 },
  infoBoxText: { fontSize: 12, color: "#1e40af", lineHeight: 18 },
  actionRow: { flexDirection: "row", gap: 12 },
  errorText: { color: c.danger, fontSize: 12, marginTop: 4 },
  bgGreen: { backgroundColor: c.success }, bgOrange: { backgroundColor: c.warning }, bgGray: { backgroundColor: "#9ca3af" }, badgeRed: { backgroundColor: "#fef2f2" },
  badgeGreen: { backgroundColor: "#f0fdf4" }, badgeOrange: { backgroundColor: "#fff7ed" }, badgeGray: { backgroundColor: "#f3f4f6" },
  textGreen: { color: c.success }, textOrange: { color: c.warning }, textGray: { color: "#4b5563" }, textRed: { color: c.danger },
  textWhite: { color: "white" },
});