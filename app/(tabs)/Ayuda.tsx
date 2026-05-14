import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Heart,
  Info,
  MapPin,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { useTabReset } from "../hooks/useTabReset";
import { ThemeColors, useTheme } from "../hooks/useTheme";

export default function Ayuda() {
  const [view, setView] = useState<"programs" | "applications" | "apply">("programs");
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [distributionMethod, setDistributionMethod] = useState<"digital" | "physical">("digital");
  const [bankDetails, setBankDetails] = useState({ accountName: "", accountNumber: "", bankName: "" });

  const [programs, setPrograms] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPrograms(), fetchApplications()]);
    setRefreshing(false);
  }, []);

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
    setHasVerified(false);
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
      // This will force the app to show the exact Supabase rejection reason
      Alert.alert("Database Error", e.message || JSON.stringify(e));
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

      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]} // Uses your theme's primary color for the Android spinner
            tintColor={colors.primary} // Uses your theme's primary color for the iOS spinner
          />
        }
      >
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
                          <TouchableOpacity style={s.primaryBtn} onPress={() => {
                            setSelectedProgram(program);
                            const dist = program.distribution?.toLowerCase() || "";
                            // ADDED: "face" to catch "face-to-face" or "face to face"
                            if (dist.includes("site") || dist.includes("physical") || dist.includes("barangay") || dist.includes("face")) {
                              setDistributionMethod("physical");
                            } else {
                              setDistributionMethod("digital");
                            }
                            setView("apply");
                          }}>
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

                {/* --- NEW VERIFICATION STEP --- */}
                {!hasVerified ? (
                  <View style={s.listGap}>
                    <Text style={s.formLabel}>Verify Qualifications</Text>
                    <View style={s.eligibilityBox}>
                      <Text style={s.eligibilityLabel}>Eligibility Requirements:</Text>
                      <Text style={s.eligibilityText}>{selectedProgram.eligibility}</Text>
                    </View>
                    <Text style={s.verificationPrompt}>
                      By proceeding, you confirm that you meet all the eligibility requirements listed above.
                    </Text>

                    <View style={s.actionRow}>
                      <TouchableOpacity style={[s.secondaryBtn, { flex: 1 }]} onPress={handleCancel}>
                        <Text style={s.secondaryBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[s.primaryBtn, { flex: 1 }]} onPress={() => setHasVerified(true)}>
                        <Text style={s.primaryBtnText}>I Confirm & Qualify</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  /* --- EXISTING FORM STEP --- */
                  <>
                    <Text style={s.formLabel}>Distribution Method</Text>

                    {(() => {
                      const dist = selectedProgram.distribution?.toLowerCase() || "";
                      // ADDED: "face" to catch "face-to-face"
                      const isPhysical = dist.includes("site") || dist.includes("physical") || dist.includes("barangay") || dist.includes("face");
                      const isOnline = dist.includes("online") || dist.includes("digital");
                      const showBoth = isPhysical && isOnline; // Fallback if admin wrote both

                      return (
                        <View style={s.methodGrid}>
                          {/* DIGITAL OPTION - Hides completely if isPhysical is true and isOnline is false */}
                          {(isOnline || showBoth || (!isPhysical && !isOnline)) && (
                            <TouchableOpacity style={[s.methodCard, distributionMethod === "digital" && s.methodCardActive]} onPress={() => { setDistributionMethod("digital"); setFormErrors({}); }}>
                              <CreditCard size={24} color={distributionMethod === "digital" ? "white" : colors.foreground} />
                              <Text style={[s.methodTitle, distributionMethod === "digital" && s.textWhite]}>Digital</Text>
                              <Text style={[s.methodSub, distributionMethod === "digital" && { color: 'rgba(255,255,255,0.8)' }]}>Bank transfer</Text>
                            </TouchableOpacity>
                          )}

                          {/* PHYSICAL OPTION */}
                          {(isPhysical || showBoth) && (
                            <TouchableOpacity style={[s.methodCard, distributionMethod === "physical" && s.methodCardActive]} onPress={() => { setDistributionMethod("physical"); setFormErrors({}); }}>
                              <MapPin size={24} color={distributionMethod === "physical" ? "white" : colors.foreground} />
                              <Text style={[s.methodTitle, distributionMethod === "physical" && s.textWhite]}>Physical</Text>
                              <Text style={[s.methodSub, distributionMethod === "physical" && { color: 'rgba(255,255,255,0.8)' }]}>Claim at barangay</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })()}

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
                  </>
                )}
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
  header: { backgroundColor: c.headerBg, padding: 20, paddingBottom: 28 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  headerTitle: { color: c.headerText, fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  headerSubtitle: { color: c.headerSubtext, fontSize: 14 },
  tabWrapper: { paddingHorizontal: 16, marginTop: -16, marginBottom: 18 },
  tabContainer: { backgroundColor: c.card, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: c.border, flexDirection: "row", ...(c.shadowSm as any) },
  tabBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: "center" },
  tabBtnActive: { backgroundColor: c.primary },
  tabText: { fontSize: 12, fontWeight: "700" },
  scrollContent: { padding: 16, paddingBottom: 32 },
  listGap: { gap: 14 },
  card: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: "hidden", ...(c.shadow as any) },
  statusBar: { height: 3 },
  cardPadding: { padding: 20 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: c.foreground, marginBottom: 6, letterSpacing: -0.1 },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, flexDirection: "row", alignItems: "center" },
  statusText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize", letterSpacing: 0.3 },
  amountBox: { backgroundColor: c.primaryLight, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, alignItems: "center" },
  amountLabel: { fontSize: 10, color: c.mutedForeground, fontWeight: '500' },
  amountValue: { fontSize: 18, fontWeight: "800", color: c.primary, letterSpacing: -0.3 },
  description: { fontSize: 14, color: c.mutedForeground, marginBottom: 14, lineHeight: 21 },
  detailsList: { gap: 10, marginBottom: 18 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailText: { fontSize: 12, color: c.mutedForeground, fontWeight: '500' },
  primaryBtn: { backgroundColor: c.primary, paddingVertical: 14, borderRadius: 12, alignItems: "center", justifyContent: "center", ...(c.shadowSm as any) },
  primaryBtnText: { color: "white", fontWeight: "700", fontSize: 14 },
  secondaryBtn: { backgroundColor: c.muted, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  secondaryBtnText: { color: c.foreground, fontWeight: "600", fontSize: 14 },
  appMetaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  metaValue: { fontSize: 12, fontWeight: "700", color: c.foreground },
  approvedNotice: { marginTop: 14, padding: 14, backgroundColor: "#f0fdf4", borderRadius: 12, borderLeftWidth: 4, borderLeftColor: c.success },
  approvedNoticeText: { fontSize: 12, color: "#166534", fontWeight: "500", lineHeight: 18 },
  formLabel: { fontSize: 14, fontWeight: "700", color: c.foreground, marginBottom: 8 },
  methodGrid: { flexDirection: "row", gap: 12 },
  methodCard: { flex: 1, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.card },
  methodCardActive: { backgroundColor: c.primary, borderColor: c.primary, ...(c.shadowSm as any) },
  methodTitle: { fontSize: 14, fontWeight: "700", marginTop: 10, color: c.foreground },
  methodSub: { fontSize: 11, color: c.mutedForeground, marginTop: 2 },
  input: { backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 14, fontSize: 14, color: c.foreground },
  infoBox: { flexDirection: "row", gap: 12, backgroundColor: "#eff6ff", padding: 18, borderRadius: 16, borderWidth: 1, borderColor: "#bfdbfe" },
  infoBoxTitle: { fontSize: 12, fontWeight: "700", color: "#1e40af", marginBottom: 4 },
  infoBoxText: { fontSize: 12, color: "#1e40af", lineHeight: 18 },
  actionRow: { flexDirection: "row", gap: 12 },
  errorText: { color: c.danger, fontSize: 12, marginTop: 4 },
  bgGreen: { backgroundColor: c.success }, bgOrange: { backgroundColor: c.warning }, bgGray: { backgroundColor: "#9ca3af" }, badgeRed: { backgroundColor: "#fef2f2" },
  badgeGreen: { backgroundColor: "#f0fdf4" }, badgeOrange: { backgroundColor: "#fff7ed" }, badgeGray: { backgroundColor: "#f3f4f6" },
  textGreen: { color: c.success }, textOrange: { color: c.warning }, textGray: { color: "#4b5563" }, textRed: { color: c.danger },
  textWhite: { color: "white" },
  eligibilityBox: { backgroundColor: c.muted, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: c.border },
  eligibilityLabel: { fontSize: 12, fontWeight: "700", color: c.foreground, marginBottom: 6 },
  eligibilityText: { fontSize: 14, color: c.foreground, lineHeight: 22 },
  verificationPrompt: { fontSize: 13, color: c.mutedForeground, textAlign: "center", fontStyle: "italic", marginVertical: 8 },
});