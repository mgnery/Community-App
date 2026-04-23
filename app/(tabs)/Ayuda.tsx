import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Heart,
  Calendar,
  CreditCard,
  MapPin,
  CheckCircle,
  Clock,
  Info,
} from "lucide-react-native";

// --- Theme Constants ---
const THEME = {
  primary: "#3b82f6",
  background: "#f9fafb",
  card: "#ffffff",
  border: "#e5e7eb",
  foreground: "#111827",
  mutedForeground: "#6b7280",
  muted: "#f3f4f6",
  success: "#22c55e",
  warning: "#f97316",
};

const ayudaPrograms = [
  {
    id: 1,
    title: "Financial Assistance",
    description: "Cash aid for eligible families affected by recent typhoon",
    amount: "₱3,000",
    status: "active",
    startDate: "April 15, 2026",
    endDate: "April 30, 2026",
    distribution: "Available in both digital and physical",
    eligibility: "Families with damaged homes",
  },
  {
    id: 2,
    title: "Educational Support",
    description: "School supplies and allowance for students",
    amount: "₱1,500",
    status: "upcoming",
    startDate: "May 1, 2026",
    endDate: "May 15, 2026",
    distribution: "Digital only",
    eligibility: "Students enrolled in public schools",
  },
  {
    id: 3,
    title: "Medical Assistance",
    description: "Healthcare support for senior citizens",
    amount: "₱2,000",
    status: "completed",
    startDate: "March 1, 2026",
    endDate: "March 31, 2026",
    distribution: "Physical distribution",
    eligibility: "Senior citizens 60+",
  },
];

const myApplications = [
  {
    id: 1,
    program: "Financial Assistance",
    status: "approved",
    appliedDate: "April 5, 2026",
    method: "digital",
    amount: "₱3,000",
  },
  {
    id: 2,
    program: "Educational Support",
    status: "pending",
    appliedDate: "April 6, 2026",
    method: "physical",
    amount: "₱1,500",
  },
];

export default function Ayuda() {
  const [view, setView] = useState<"programs" | "applications" | "apply">("programs");
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [distributionMethod, setDistributionMethod] = useState<"digital" | "physical">("digital");
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
  });

  const handleApply = () => {
    Alert.alert("Success", "Application submitted successfully!");
    setView("applications");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Heart size={24} color="white" />
          <Text style={styles.headerTitle}>Ayuda</Text>
        </View>
        <Text style={styles.headerSubtitle}>Assistance programs for the community</Text>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setView("programs")}
            style={[styles.tabBtn, view === "programs" && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, view === "programs" ? styles.textWhite : styles.textForeground]}>
              Programs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setView("applications")}
            style={[styles.tabBtn, view === "applications" && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, view === "applications" ? styles.textWhite : styles.textForeground]}>
              My Applications
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {view === "programs" && (
          <View style={styles.listGap}>
            {ayudaPrograms.map((program) => (
              <View key={program.id} style={styles.card}>
                <View style={[
                  styles.statusBar,
                  program.status === "active" ? styles.bgGreen :
                  program.status === "upcoming" ? styles.bgOrange : styles.bgGray
                ]} />
                <View style={styles.cardPadding}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{program.title}</Text>
                      <View style={[
                        styles.statusBadge,
                        program.status === "active" ? styles.badgeGreen :
                        program.status === "upcoming" ? styles.badgeOrange : styles.badgeGray
                      ]}>
                        <Text style={[
                          styles.statusText,
                          program.status === "active" ? styles.textGreen :
                          program.status === "upcoming" ? styles.textOrange : styles.textGray
                        ]}>{program.status}</Text>
                      </View>
                    </View>
                    <View style={styles.amountBox}>
                      <Text style={styles.amountLabel}>Amount</Text>
                      <Text style={styles.amountValue}>{program.amount}</Text>
                    </View>
                  </View>
                  <Text style={styles.description}>{program.description}</Text>
                  <View style={styles.detailsList}>
                    <View style={styles.detailItem}><Calendar size={14} color={THEME.mutedForeground} /><Text style={styles.detailText}>{program.startDate} - {program.endDate}</Text></View>
                    <View style={styles.detailItem}><MapPin size={14} color={THEME.mutedForeground} /><Text style={styles.detailText}>{program.distribution}</Text></View>
                    <View style={styles.detailItem}><Info size={14} color={THEME.mutedForeground} /><Text style={styles.detailText}>{program.eligibility}</Text></View>
                  </View>
                  {program.status === "active" && (
                    <TouchableOpacity 
                      style={styles.primaryBtn}
                      onPress={() => { setSelectedProgram(program); setView("apply"); }}
                    >
                      <Text style={styles.primaryBtnText}>Apply Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {view === "applications" && (
          <View style={styles.listGap}>
            {myApplications.map((app) => (
              <View key={app.id} style={[styles.card, styles.cardPadding]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{app.program}</Text>
                    <View style={[styles.statusBadge, app.status === "approved" ? styles.badgeGreen : styles.badgeOrange]}>
                      {app.status === "approved" ? <CheckCircle size={10} color={THEME.success} /> : <Clock size={10} color={THEME.warning} />}
                      <Text style={[styles.statusText, app.status === "approved" ? styles.textGreen : styles.textOrange]}> {app.status}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.amountLabel}>Amount</Text>
                    <Text style={styles.amountValue}>{app.amount}</Text>
                  </View>
                </View>
                <View style={styles.appMetaRow}>
                  <Text style={styles.detailText}>Applied on:</Text>
                  <Text style={styles.metaValue}>{app.appliedDate}</Text>
                </View>
                <View style={styles.appMetaRow}>
                  <Text style={styles.detailText}>Distribution method:</Text>
                  <Text style={[styles.metaValue, { textTransform: 'capitalize' }]}>{app.method}</Text>
                </View>
                {app.status === "approved" && (
                  <View style={styles.approvedNotice}>
                    <Text style={styles.approvedNoticeText}>
                      ✓ Your application has been approved! Please check the program schedule for distribution details.
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {view === "apply" && selectedProgram && (
          <View style={styles.listGap}>
            <View style={[styles.card, styles.cardPadding]}>
              <Text style={styles.cardTitle}>{selectedProgram.title}</Text>
              <Text style={styles.description}>{selectedProgram.description}</Text>
              <Text style={styles.amountValue}>{selectedProgram.amount}</Text>
            </View>

            <Text style={styles.formLabel}>Distribution Method</Text>
            <View style={styles.methodGrid}>
              <TouchableOpacity 
                style={[styles.methodCard, distributionMethod === "digital" && styles.methodCardActive]}
                onPress={() => setDistributionMethod("digital")}
              >
                <CreditCard size={24} color={distributionMethod === "digital" ? "white" : THEME.foreground} />
                <Text style={[styles.methodTitle, distributionMethod === "digital" && styles.textWhite]}>Digital</Text>
                <Text style={[styles.methodSub, distributionMethod === "digital" && { color: 'rgba(255,255,255,0.8)' }]}>Bank transfer</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.methodCard, distributionMethod === "physical" && styles.methodCardActive]}
                onPress={() => setDistributionMethod("physical")}
              >
                <MapPin size={24} color={distributionMethod === "physical" ? "white" : THEME.foreground} />
                <Text style={[styles.methodTitle, distributionMethod === "physical" && styles.textWhite]}>Physical</Text>
                <Text style={[styles.methodSub, distributionMethod === "physical" && { color: 'rgba(255,255,255,0.8)' }]}>Claim at barangay</Text>
              </TouchableOpacity>
            </View>

            {distributionMethod === "digital" ? (
              <View style={styles.listGap}>
                <Text style={styles.formLabel}>Bank Details</Text>
                <TextInput style={styles.input} placeholder="Account Name" placeholderTextColor={THEME.mutedForeground} value={bankDetails.accountName} onChangeText={(t) => setBankDetails({...bankDetails, accountName: t})} />
                <TextInput style={styles.input} placeholder="Account Number" placeholderTextColor={THEME.mutedForeground} keyboardType="numeric" value={bankDetails.accountNumber} onChangeText={(t) => setBankDetails({...bankDetails, accountNumber: t})} />
                <TextInput style={styles.input} placeholder="Bank Name" placeholderTextColor={THEME.mutedForeground} value={bankDetails.bankName} onChangeText={(t) => setBankDetails({...bankDetails, bankName: t})} />
              </View>
            ) : (
              <View style={styles.infoBox}>
                <Info size={18} color="#2563eb" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoBoxTitle}>Physical Distribution Schedule:</Text>
                  <Text style={styles.infoBoxText}>Date: April 20-25, 2026{"\n"}Time: 9:00 AM - 4:00 PM{"\n"}Location: Barangay Hall{"\n\n"}Please bring a valid ID.</Text>
                </View>
              </View>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={() => setView("programs")}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1, flexDirection: 'row', gap: 8 }]} onPress={handleApply}>
                <CheckCircle size={18} color="white" />
                <Text style={styles.primaryBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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

  tabWrapper: { paddingHorizontal: 16, marginTop: -16, marginBottom: 16 },
  tabContainer: { backgroundColor: THEME.card, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: THEME.border, flexDirection: "row" },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  tabBtnActive: { backgroundColor: THEME.primary },
  tabText: { fontSize: 12, fontWeight: "600" },

  scrollContent: { padding: 16, paddingBottom: 32 },
  listGap: { gap: 16 },
  card: { backgroundColor: THEME.card, borderRadius: 16, borderWidth: 1, borderColor: THEME.border, overflow: "hidden" },
  statusBar: { height: 4 },
  cardPadding: { padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: THEME.foreground, marginBottom: 4 },

  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, flexDirection: "row", alignItems: "center" },
  statusText: { fontSize: 10, fontWeight: "bold", textTransform: "capitalize" },
  
  amountBox: { backgroundColor: "rgba(59,130,246,0.1)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignItems: "center" },
  amountLabel: { fontSize: 10, color: THEME.mutedForeground },
  amountValue: { fontSize: 18, fontWeight: "bold", color: THEME.primary },

  description: { fontSize: 14, color: THEME.mutedForeground, marginBottom: 12 },
  detailsList: { gap: 8, marginBottom: 16 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontSize: 12, color: THEME.mutedForeground },

  primaryBtn: { backgroundColor: THEME.primary, paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: "white", fontWeight: "600", fontSize: 14 },
  secondaryBtn: { backgroundColor: THEME.muted, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  secondaryBtnText: { color: THEME.foreground, fontWeight: "600" },

  appMetaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  metaValue: { fontSize: 12, fontWeight: "600", color: THEME.foreground },
  approvedNotice: { marginTop: 12, padding: 12, backgroundColor: "#f0fdf4", borderRadius: 8, borderLeftWidth: 4, borderLeftColor: THEME.success },
  approvedNoticeText: { fontSize: 12, color: "#166534", fontWeight: "500" },

  formLabel: { fontSize: 14, fontWeight: "600", color: THEME.foreground, marginBottom: 8 },
  methodGrid: { flexDirection: "row", gap: 12 },
  methodCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: THEME.border, backgroundColor: THEME.card },
  methodCardActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  methodTitle: { fontSize: 14, fontWeight: "bold", marginTop: 8 },
  methodSub: { fontSize: 11, color: THEME.mutedForeground },

  input: { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 12, padding: 14, fontSize: 14, color: THEME.foreground },
  infoBox: { flexDirection: "row", gap: 12, backgroundColor: "#eff6ff", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#bfdbfe" },
  infoBoxTitle: { fontSize: 12, fontWeight: "bold", color: "#1e40af", marginBottom: 4 },
  infoBoxText: { fontSize: 12, color: "#1e40af", lineHeight: 18 },
  actionRow: { flexDirection: "row", gap: 12 },

  bgGreen: { backgroundColor: THEME.success }, bgOrange: { backgroundColor: THEME.warning }, bgGray: { backgroundColor: "#9ca3af" },
  badgeGreen: { backgroundColor: "#f0fdf4" }, badgeOrange: { backgroundColor: "#fff7ed" }, badgeGray: { backgroundColor: "#f3f4f6" },
  textGreen: { color: THEME.success }, textOrange: { color: THEME.warning }, textGray: { color: "#4b5563" },
  textWhite: { color: "white" }, textForeground: { color: THEME.foreground },
});