import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { EcaReport, EcaStatus } from "../../types";
import { ECA_STATUS_LABELS } from "../../types";

// ─── Constants mirrored from ecaReports.ts ───────────────────────────────────

const COMMITTEE_MEMBERS = [
  "Kagawad",
  "SK Chairman",
  "President of Home Owners Association",
  "Private/Public School Principal / Representative",
  "Parent Teachers Assoc. President / Representative",
  "Religious Organization / Representative",
  "Business Community / Representative",
  "Environmental NGO / Representative",
  "Pres. Market Vendors Assoc. / Representative",
  "Junkshop Owners Assoc. / Representative",
];

const MRF_TYPES = [
  "Established MRF operated by the barangay",
  "MRS cum MRF / covered by MOA with junkshops",
  "Clustered with a barangay owning an MRF",
  "Centralized MRF",
  "Others",
];

const WASTE_TYPES = ["Recyclables", "Compost / Biodegradable", "Residual", "Others"];

const COLLECTION_SCHEMES = [
  "Separate day collection of different wastes",
  "Same day collection of different wastes on separate trucks",
  "Others",
];

const NEXT_STEPS_CATEGORIES = [
  "Segregation at Source",
  "Functional MRFs",
  "Waste Generation and Waste Diversion",
  "No Littering Ordinances",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVal(report: EcaReport, id: string): string {
  for (const sec of report.sections) {
    const f = sec.fields.find((x) => x.id === id);
    if (f !== undefined) return String(f.value ?? "");
  }
  return "";
}

function getSelected(raw: string): string[] {
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function isTruthy(val: string): boolean {
  return val === "Yes" || val === "true" || val === "1" || val === "yes";
}

const QUARTER_LABELS: Record<number, string> = {
  1: "1st", 2: "2nd", 3: "3rd", 4: "4th",
};

const STATUS_COLORS: Record<EcaStatus, string> = {
  DRAFT: "#666",
  SUBMITTED: "#1a4a8a",
  ENDORSED: "#6d28d9",
  PENDING: "#92400e",
  FOR_REVISION: "#b91c1c",
  OVERDUE: "#b91c1c",
  ACCEPTED: "#166534",
};

// ─── StyleSheet ───────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingLeft: 54,
    paddingRight: 54,
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: "#000",
  },

  // ── Form header ──
  formRef:    { fontSize: 9, fontFamily: "Times-Italic", marginBottom: 8 },
  mainTitle:  { fontSize: 11, fontFamily: "Times-Bold", textAlign: "center", marginBottom: 4 },
  quarterLine:{ fontSize: 10, textAlign: "center", marginBottom: 6 },
  swmTitle:   { fontSize: 11, fontFamily: "Times-Bold", textAlign: "center", marginBottom: 12 },

  // ── Section headers ──
  secHeader: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    textDecoration: "underline",
    color: "#006666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  secHeaderPlain: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    textDecoration: "underline",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  nextStepsHeader: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    textDecoration: "underline",
    color: "#006600",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 6,
  },

  // ── General Information ──
  genInfoRow:   { flexDirection: "row", marginBottom: 10 },
  genInfoCol:   { flex: 1 },
  genInfoColR:  { flex: 1, marginLeft: 20 },
  genInfoLabel: { fontSize: 9.5 },
  genInfoLine:  {
    borderBottomWidth: 0.5,
    borderBottomColor: "#000",
    paddingBottom: 2,
    marginTop: 4,
    minHeight: 18,
    fontSize: 10,
  },

  // ── Body text ──
  itemText:  { fontSize: 10, marginBottom: 4, lineHeight: 1.4 },
  indented:  { marginLeft: 28, marginTop: 2, marginBottom: 4 },
  noteText:  { fontSize: 8.5, fontFamily: "Times-Italic", color: "#444", marginTop: 3 },
  subField:  { fontSize: 10, marginBottom: 2 },
  subFieldLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#000",
    minHeight: 16,
    marginBottom: 6,
    paddingBottom: 1,
  },

  // ── Yes/No box pair ──
  yesNoRow:  { flexDirection: "row", alignItems: "center", marginTop: 5, marginBottom: 5, marginLeft: 48 },
  checkBox:  {
    width: 14,
    height: 14,
    borderWidth: 0.5,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  checkMark: { fontSize: 10, fontFamily: "Times-Bold", lineHeight: 1 },
  yesLabel:  { fontSize: 10, marginRight: 20 },
  noLabel:   { fontSize: 10 },

  // ── Checkbox list ──
  clItem:    { flexDirection: "row", alignItems: "center", marginBottom: 4, marginLeft: 20 },
  clBox:     {
    width: 12,
    height: 12,
    borderWidth: 0.5,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  clMark:    { fontSize: 9, fontFamily: "Times-Bold", lineHeight: 1 },
  clText:    { fontSize: 10 },

  // ── Bordered table ──
  table:     { borderWidth: 0.5, borderColor: "#000", marginBottom: 8 },
  tr:        { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#000" },
  trLast:    { flexDirection: "row" },
  td:        { paddingTop: 3, paddingBottom: 3, paddingLeft: 5, paddingRight: 5, borderRightWidth: 0.5, borderRightColor: "#000" },
  tdLast:    { paddingTop: 3, paddingBottom: 3, paddingLeft: 5, paddingRight: 5 },
  tdBold:    { fontFamily: "Times-Bold" },
  tdCenter:  { textAlign: "center" },
  tdRight:   { textAlign: "right" },
  tdItalic:  { fontFamily: "Times-Italic", fontSize: 9 },

  // ── Committee composition header ──
  committeeTh: {
    backgroundColor: "#FFB300",
    fontFamily: "Times-Bold",
    fontSize: 10,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 5,
    paddingRight: 5,
    textAlign: "center",
    borderRightWidth: 0.5,
    borderRightColor: "#000",
  },
  committeeThLast: {
    backgroundColor: "#FFB300",
    fontFamily: "Times-Bold",
    fontSize: 10,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 5,
    paddingRight: 5,
    textAlign: "center",
  },

  // ── Formula box ──
  formulaWrap:  { alignItems: "center", marginTop: 6, marginBottom: 6 },
  formulaBox:   {
    borderWidth: 0.5,
    borderColor: "#000",
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 24,
    paddingRight: 24,
    alignItems: "center",
  },
  formulaRow:   { flexDirection: "row", alignItems: "center" },
  formulaFrac:  { alignItems: "center" },
  formulaNum:   { fontSize: 9.5, textAlign: "center", paddingBottom: 3 },
  formulaDen:   { fontSize: 9.5, textAlign: "center", paddingTop: 3 },
  formulaDivide:{ borderBottomWidth: 0.5, borderBottomColor: "#000", width: "100%" },
  formulaTimes: { fontSize: 12, marginLeft: 8, marginRight: 8 },
  formulaNum2:  { fontSize: 10 },

  // ── Signature block ──
  sigWrap:     { marginTop: 20 },
  sigEntry:    { marginBottom: 20 },
  sigTitle:    { fontSize: 10, fontFamily: "Times-Bold", marginBottom: 14 },
  sigLineRow:  { flexDirection: "row", alignItems: "flex-end", marginBottom: 4 },
  sigNameLine: { flex: 3, borderBottomWidth: 0.5, borderBottomColor: "#000", minHeight: 20, justifyContent: "flex-end", paddingBottom: 1 },
  sigDateLine: { flex: 1, borderBottomWidth: 0.5, borderBottomColor: "#000", minHeight: 20, justifyContent: "flex-end", paddingBottom: 1, marginLeft: 20 },
  sigNameText: { fontSize: 10, fontFamily: "Times-Bold" },
  sigDateText: { fontSize: 9.5 },
  sigRoleText: { fontSize: 9.5, textAlign: "center", flex: 3 },
  sigDateLabel:{ fontSize: 9.5, textAlign: "center", flex: 1, marginLeft: 20 },
  sigRoleRow:  { flexDirection: "row" },

  // ── Encoded-by note ──
  encodedNote: { fontSize: 8.5, fontFamily: "Times-Italic", color: "#555", marginTop: 8 },

  // ── Footer ──
  footer:      {
    position: "absolute",
    bottom: 18,
    left: 54,
    right: 54,
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    paddingTop: 3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText:  { fontSize: 7.5, color: "#999" },
});

// ─── Reusable sub-components ──────────────────────────────────────────────────

function YesNoBox({ value }: { value: string }) {
  const yes = isTruthy(value);
  const hasAnswer = value !== "";
  return (
    <View style={S.yesNoRow}>
      <View style={S.checkBox}>
        {yes && <Text style={S.checkMark}>✓</Text>}
      </View>
      <Text style={S.yesLabel}>Yes</Text>
      <View style={S.checkBox}>
        {!yes && hasAnswer && <Text style={S.checkMark}>✓</Text>}
      </View>
      <Text style={S.noLabel}>No</Text>
    </View>
  );
}

function CheckboxList({ options, selected }: { options: readonly string[]; selected: string[] }) {
  return (
    <View style={S.indented}>
      {options.map((opt) => (
        <View key={opt} style={S.clItem}>
          <View style={S.clBox}>
            {selected.some((s) => s.toLowerCase() === opt.toLowerCase()) && (
              <Text style={S.clMark}>✓</Text>
            )}
          </View>
          <Text style={S.clText}>{opt}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Main document ────────────────────────────────────────────────────────────

interface EcaReportPDFProps {
  report: EcaReport;
  barangayName: string;
}

export function EcaReportPDF({ report, barangayName }: EcaReportPDFProps) {
  const g = (id: string) => getVal(report, id);

  const c1 = g("c1");
  const c4Selected = getSelected(g("c4"));
  const hasCommittee = isTruthy(c1);

  const s1 = g("s1"); const s2 = g("s2"); const s3 = g("s3"); const s4 = g("s4");
  const col1Selected = getSelected(g("col1"));
  const col2 = g("col2");

  const m1 = g("m1"); const m2 = g("m2"); const m4 = g("m4");
  const hasMrf = isTruthy(m1);

  const wg1 = g("wg1"); const wg2 = g("wg2"); const wg3 = g("wg3"); const wg4 = g("wg4");
  const wg5 = g("wg5"); const wg6 = g("wg6"); const wg7 = g("wg7");
  const wg8 = g("wg8"); const wg9 = g("wg9");

  const or1 = g("or1"); const or2 = g("or2"); const or3 = g("or3");

  const statusLabel = ECA_STATUS_LABELS[report.status] ?? report.status;
  const statusColor = STATUS_COLORS[report.status] ?? "#555";

  return (
    <Document
      title={`ECA Q${report.quarter} ${report.year} — Brgy. ${barangayName}`}
      author="LINAW Web Portal — Calamba City CENRO"
    >
      <Page size="A4" style={S.page}>

        {/* ── Form Reference ── */}
        <Text style={S.formRef}>(Manila Bayanihan Form 2.2 Barangay DCF)</Text>

        {/* ── Main Header ── */}
        <Text style={S.mainTitle}>
          MANILA BAY CLEAN UP, REHABILITATION AND PRESERVATION PROGRAM
        </Text>
        <Text style={S.quarterLine}>
          Quarter: {QUARTER_LABELS[report.quarter]}{"     "}Year: {report.year}
        </Text>

        <Text style={S.swmTitle}>SOLID WASTE MANAGEMENT</Text>

        {/* ══════════════════════════════════════════════════════════════
            GENERAL INFORMATION
        ══════════════════════════════════════════════════════════════ */}
        <Text style={S.secHeader}>GENERAL INFORMATION</Text>

        <View style={S.genInfoRow}>
          <View style={S.genInfoCol}>
            <Text style={S.genInfoLabel}>Name of Barangay:</Text>
            <Text style={S.genInfoLine}>{barangayName}</Text>
          </View>
          <View style={S.genInfoColR}>
            <Text style={S.genInfoLabel}>City/Municipality Location:</Text>
            <Text style={S.genInfoLine}>{g("g2") || "Calamba City"}</Text>
          </View>
        </View>
        <View style={S.genInfoRow}>
          <View style={S.genInfoCol}>
            <Text style={S.genInfoLabel}>Provincial Location:</Text>
            <Text style={S.genInfoLine}>{g("g3") || "Laguna"}</Text>
          </View>
          <View style={S.genInfoColR}>
            <Text style={S.genInfoLabel}>Regional Location:</Text>
            <Text style={S.genInfoLine}>{g("g4") || "Region IV-A (CALABARZON)"}</Text>
          </View>
        </View>
        <View style={S.genInfoRow}>
          <View style={S.genInfoCol}>
            <Text style={S.genInfoLabel}>Total Population:</Text>
            <Text style={S.genInfoLine}>{g("g5")}</Text>
          </View>
          <View style={S.genInfoColR}>
            <Text style={S.genInfoLabel}>No. of Households:</Text>
            <Text style={S.genInfoLine}>{g("g6")}</Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════════
            BARANGAY SWM COMMITTEE
        ══════════════════════════════════════════════════════════════ */}
        <Text style={S.secHeader}>BARANGAY SOLID WASTE MANAGEMENT COMMITTEE</Text>

        <Text style={S.itemText}>
          1.{"  "}1 Does the barangay have a Barangay Solid Waste Management Committee, and was created through an Executive Order (E.O)?
        </Text>
        <YesNoBox value={c1} />

        <View style={S.indented}>
          <Text style={S.itemText}>
            1.2 If the answer is "Yes" to Item 1.1, indicate E.O No. and Date of Approval. Write "N/A" if the answer to Item 1.1 is "No"
          </Text>
          <Text style={S.subField}>Executive No.:</Text>
          <Text style={S.subFieldLine}>{g("c2")}</Text>
          <Text style={S.subField}>Date of Approval:</Text>
          <Text style={S.subFieldLine}>{g("c3")}</Text>
        </View>

        <Text style={S.itemText}>
          2.{"  "}Determine the functionality of the Committee based on its Composition. (Put a check mark (✓) on the appropriate box)
        </Text>

        {/* Committee composition table */}
        <View style={S.table}>
          {/* Header row */}
          <View style={S.tr}>
            <View style={[S.committeeTh, { width: "7%" }]}><Text>2.1</Text></View>
            <View style={[S.committeeTh, { flex: 1 }]}><Text>On COMPOSITION</Text></View>
            <View style={[S.committeeTh, { width: "11%" }]}><Text>YES</Text></View>
            <View style={[S.committeeTh, { width: "11%" }]}><Text>NO</Text></View>
            <View style={[S.committeeThLast, { width: "11%" }]}><Text>N/A</Text></View>
          </View>
          {/* Member rows */}
          {COMMITTEE_MEMBERS.map((member, idx) => {
            const isLast = idx === COMMITTEE_MEMBERS.length - 1;
            const present = hasCommittee && c4Selected.some((s) => s.toLowerCase().includes(member.toLowerCase().slice(0, 8)));
            const absent  = hasCommittee && !present;
            const na      = !hasCommittee;
            return (
              <View key={member} style={isLast ? S.trLast : S.tr}>
                <View style={[S.td, { width: "7%" }]}><Text></Text></View>
                <View style={[S.td, { flex: 1 }]}><Text style={{ fontSize: 9.5 }}>{member}</Text></View>
                <View style={[S.td, { width: "11%", alignItems: "center" }]}>
                  {present && <Text style={S.checkMark}>✓</Text>}
                </View>
                <View style={[S.td, { width: "11%", alignItems: "center" }]}>
                  {absent && <Text style={S.checkMark}>✓</Text>}
                </View>
                <View style={[S.tdLast, { width: "11%", alignItems: "center" }]}>
                  {na && <Text style={S.checkMark}>✓</Text>}
                </View>
              </View>
            );
          })}
        </View>
        <Text style={S.noteText}>
          *Note: Kindly indicate N/A if the representative is not available in the area{"\n"}
          Tick "No" to all Items if Local SWM Board was not created
        </Text>

        {/* ══════════════════════════════════════════════════════════════
            MANDATORY SEGREGATION
        ══════════════════════════════════════════════════════════════ */}
        <Text style={S.secHeader}>MANDATORY SEGREGATION OF WASTES AT SOURCE</Text>

        <Text style={S.itemText}>
          3.{"  "}Determine the compliance rate of households on segregation of wastes at source
        </Text>

        <View style={S.table}>
          <View style={S.tr}>
            <View style={[S.td, { flex: 1 }]}>
              <Text style={{ fontSize: 9.5 }}>3.1 Total number of households</Text>
            </View>
            <View style={[S.tdLast, { width: "22%", alignItems: "flex-end" }]}>
              <Text style={[S.tdBold, { fontSize: 10 }]}>{s1}</Text>
            </View>
          </View>
          <View style={S.tr}>
            <View style={[S.td, { flex: 1 }]}>
              <Text style={{ fontSize: 9.5 }}>3.2 Total number of compliant households</Text>
              <Text style={S.tdItalic}>*Households are compliant when wastes are segregated into residual, biodegradable, recyclable, and/or special waste and disposed of in separate containers</Text>
            </View>
            <View style={[S.tdLast, { width: "22%", alignItems: "flex-end" }]}>
              <Text style={[S.tdBold, { fontSize: 10 }]}>{s2}</Text>
            </View>
          </View>
          <View style={S.trLast}>
            <View style={[S.td, { flex: 1 }]}>
              <Text style={{ fontSize: 9.5 }}>3.3 Computed percentage* (Use formula below):</Text>
            </View>
            <View style={[S.tdLast, { width: "22%", alignItems: "flex-end" }]}>
              <Text style={[S.tdBold, { fontSize: 10 }]}>{s3}</Text>
            </View>
          </View>
        </View>

        {/* Formula */}
        <View style={S.formulaWrap}>
          <View style={S.formulaBox}>
            <View style={S.formulaRow}>
              <View style={S.formulaFrac}>
                <Text style={S.formulaNum}>No. of compliant Households</Text>
                <View style={S.formulaDivide} />
                <Text style={S.formulaDen}>Total no. of Households</Text>
              </View>
              <Text style={S.formulaTimes}>×</Text>
              <Text style={S.formulaNum2}>100</Text>
            </View>
          </View>
        </View>

        <Text style={S.itemText}>
          4.{"  "}Based on the computed average, are the households covered by the barangay compliant?{"\n"}
          {"      "}If average is 70% or higher, tick "Yes"{"\n"}
          {"      "}If average is 69% or lower, tick "No"
        </Text>
        <YesNoBox value={s4} />
        <Text style={S.noteText}>*The Barangay must reach a minimum rate of 70% to be considered as compliant.</Text>

        {/* ══════════════════════════════════════════════════════════════
            SEGREGATION AND COLLECTION
        ══════════════════════════════════════════════════════════════ */}
        <Text style={S.secHeader}>SEGREGATION AND COLLECTION OF WASTE</Text>

        <Text style={S.itemText}>
          5.{"  "}Types of waste collected by the Barangay at the household level (Put a check mark (✓) on the appropriate box)
        </Text>
        <CheckboxList options={WASTE_TYPES} selected={col1Selected} />

        <Text style={[S.itemText, { marginTop: 8 }]}>
          6.{"  "}Barangay Collection Scheme (Put a check mark (✓) on the appropriate box)
        </Text>
        <CheckboxList options={COLLECTION_SCHEMES} selected={[col2]} />

        {/* ══════════════════════════════════════════════════════════════
            FUNCTIONAL MRF
        ══════════════════════════════════════════════════════════════ */}
        <Text style={S.secHeaderPlain}>FUNCTIONAL MATERIALS RECOVERY FACILITY</Text>

        <Text style={S.itemText}>
          7.{"  "}Determine the compliance rate of the Barangay on the establishment of MRF
        </Text>

        <View style={S.table}>
          {/* Row: Has MRF */}
          <View style={S.tr}>
            <View style={[S.td, { flex: 1 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <View style={[S.checkBox, { marginRight: 6 }]}>
                  {hasMrf && <Text style={S.checkMark}>✓</Text>}
                </View>
                <Text style={{ marginRight: 16, fontSize: 10 }}>Yes</Text>
                <View style={[S.checkBox, { marginRight: 6 }]}>
                  {!hasMrf && m1 !== "" && <Text style={S.checkMark}>✓</Text>}
                </View>
                <Text style={{ fontSize: 10 }}>No</Text>
              </View>
              <Text style={{ fontSize: 10 }}>A.) The Barangay has a Materials Recovery Facility</Text>
              {hasMrf && (
                <View style={{ marginTop: 5 }}>
                  <Text style={{ fontSize: 9.5, fontFamily: "Times-Italic" }}>If yes, what type of facility? (If the barangay has any of following, automatic 50%)</Text>
                  {MRF_TYPES.map((t) => (
                    <View key={t} style={{ flexDirection: "row", alignItems: "center", marginTop: 3, marginLeft: 10 }}>
                      <Text style={{ fontSize: 9.5, marginRight: 4 }}>{m2.toLowerCase() === t.toLowerCase() ? "✓" : "_"}</Text>
                      <Text style={{ fontSize: 9.5 }}>{t}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View style={[S.tdLast, { width: "12%", alignItems: "center", justifyContent: "center" }]}>
              <Text style={[S.tdBold, { fontSize: 11 }]}>50</Text>
            </View>
          </View>
          {/* Row: Operational MRF */}
          <View style={S.tr}>
            <View style={[S.td, { flex: 1 }]}>
              <Text style={{ fontSize: 9.5 }}>
                Does the existing MRF have an operational solid waste transfer station/sorting station, drop-off center, composting facility, and a recycling facility? Or does the MRS effectively address all types of waste? (50%)
              </Text>
            </View>
            <View style={[S.tdLast, { width: "12%", alignItems: "center", justifyContent: "center" }]}>
              <Text style={[S.tdBold, { fontSize: 11 }]}>50</Text>
            </View>
          </View>
          {/* Total row */}
          <View style={S.trLast}>
            <View style={[S.td, { flex: 1, alignItems: "flex-end" }]}>
              <Text style={[S.tdBold, { fontSize: 10 }]}>TOTAL</Text>
            </View>
            <View style={[S.tdLast, { width: "12%", alignItems: "center" }]}>
              <Text style={[S.tdBold, { fontSize: 11 }]}>100</Text>
            </View>
          </View>
        </View>

        <Text style={S.noteText}>* Centralized MRF must show that it has the capacity to process wastes coming from covered barangay</Text>

        <Text style={[S.itemText, { marginTop: 6 }]}>
          8.{"  "}Based on the total score, is the barangay compliant?{"\n"}
          {"      "}If score is 100%, tick "Yes"{"\n"}
          {"      "}Otherwise, tick "No"
        </Text>
        <YesNoBox value={m4 === "100%" ? "Yes" : m4 ? "No" : ""} />

        {/* ══════════════════════════════════════════════════════════════
            WASTE GENERATION AND WASTE DIVERSION
        ══════════════════════════════════════════════════════════════ */}
        <Text style={S.secHeaderPlain}>WASTE GENERATION AND WASTE DIVERSION</Text>

        <Text style={S.itemText}>9.{"  "}Determine Waste Generation of Barangay per quarter</Text>

        <View style={S.table}>
          <View style={S.tr}>
            <View style={[S.td, { flex: 1 }]}>
              <Text style={{ fontSize: 9.5 }}>9.1 Waste Generation of the barangay per capita</Text>
              <Text style={S.tdItalic}>*refer to WACS of 10-Year SWM Plan</Text>
            </View>
            <View style={[S.tdLast, { width: "25%", alignItems: "flex-end" }]}>
              <Text style={[S.tdBold, { fontSize: 10 }]}>{wg1}</Text>
            </View>
          </View>
          <View style={S.trLast}>
            <View style={[S.td, { flex: 1 }]}>
              <Text style={{ fontSize: 9.5 }}>9.2 Estimated Waste Generation per quarter</Text>
              <Text style={S.tdItalic}>Waste Generation of the LGU per capita × Brgy. Population / 4 quarters</Text>
            </View>
            <View style={[S.tdLast, { width: "25%", alignItems: "flex-end" }]}>
              <Text style={[S.tdBold, { fontSize: 10 }]}>{wg2 ? Number(wg2).toLocaleString() : ""}</Text>
            </View>
          </View>
        </View>

        <Text style={S.itemText}>
          10.{"  "}2 Did the barangay conduct clean-up (coastal, rivers and other water bodies) activities in the last quarter?
        </Text>
        <YesNoBox value={wg3} />

        {isTruthy(wg3) && (
          <View style={[S.indented, { marginTop: 4 }]}>
            <Text style={S.itemText}>10.2 If yes, what is the total number of sacks of marine debris/solid waste collected in the area during clean-up activities?</Text>
            <View style={S.table}>
              <View style={S.trLast}>
                <View style={[S.td, { flex: 1 }]}><Text style={{ fontSize: 9.5 }}>Total number of sacks of solid waste collected</Text></View>
                <View style={[S.tdLast, { width: "30%", alignItems: "flex-end" }]}>
                  <Text style={[S.tdBold, { fontSize: 10 }]}>{wg4} SACKS</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <Text style={S.itemText}>11.{"  "}Determine total volume of waste diverted per quarter</Text>

        <View style={S.table}>
          {/* Header */}
          <View style={S.tr}>
            <View style={[S.td, { flex: 1, backgroundColor: "#f0f0f0" }]}>
              <Text style={[S.tdBold, { fontSize: 9.5 }]}>Type of Waste</Text>
            </View>
            <View style={[S.tdLast, { flex: 1, backgroundColor: "#f0f0f0", alignItems: "flex-end" }]}>
              <Text style={[S.tdBold, { fontSize: 9.5 }]}>Volume of Waste Diverted (in kilograms)</Text>
            </View>
          </View>
          <View style={S.tr}>
            <View style={[S.td, { flex: 1 }]}><Text>Biodegradable</Text></View>
            <View style={[S.tdLast, { flex: 1, alignItems: "flex-end" }]}><Text style={S.tdBold}>{wg5 ? Number(wg5).toLocaleString() : ""}</Text></View>
          </View>
          <View style={S.tr}>
            <View style={[S.td, { flex: 1 }]}><Text>Recyclables</Text></View>
            <View style={[S.tdLast, { flex: 1, alignItems: "flex-end" }]}><Text style={S.tdBold}>{wg6 ? Number(wg6).toLocaleString() : ""}</Text></View>
          </View>
          <View style={S.tr}>
            <View style={[S.td, { flex: 1 }]}><Text>Others</Text></View>
            <View style={[S.tdLast, { flex: 1, alignItems: "flex-end" }]}><Text style={S.tdBold}>{wg7 ? Number(wg7).toLocaleString() : ""}</Text></View>
          </View>
          <View style={S.trLast}>
            <View style={[S.td, { flex: 1 }]}><Text style={S.tdBold}>TOTAL VOLUME</Text></View>
            <View style={[S.tdLast, { flex: 1, alignItems: "flex-end" }]}><Text style={S.tdBold}>{wg8 ? Number(wg8).toLocaleString() : ""}</Text></View>
          </View>
        </View>

        <Text style={S.itemText}>Determine compliance of LGU to Waste Diversion Target</Text>

        <View style={S.table}>
          <View style={S.tr}>
            <View style={[S.td, { width: "40%", justifyContent: "center" }]}>
              <Text style={{ fontSize: 9.5 }}>Waste Diverted per quarter (Use formula below)</Text>
            </View>
            <View style={[S.tdLast, { flex: 1, alignItems: "center", justifyContent: "center" }]}>
              <Text style={[S.tdBold, { fontSize: 12 }]}>{wg9}</Text>
            </View>
          </View>
          <View style={S.trLast}>
            <View style={[S.td, { flex: 1, alignItems: "center", paddingTop: 6, paddingBottom: 6 }]}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 9.5, marginRight: 4 }}>WD =</Text>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 9, textAlign: "center", textDecoration: "underline" }}>Volume of Biodegradable + Recyclables + Others</Text>
                  <Text style={{ fontSize: 9, textAlign: "center" }}>EWG per quarter (*refer to Item 9.2)</Text>
                </View>
                <Text style={{ fontSize: 9.5, marginLeft: 4, marginRight: 4 }}>×</Text>
                <Text style={{ fontSize: 9.5 }}>100</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════════
            NO-LITTERING ORDINANCES
        ══════════════════════════════════════════════════════════════ */}
        <Text style={S.secHeader}>NO-LITTERING AND RELATED ORDINANCES</Text>

        <Text style={S.itemText}>12.{"  "}The Barangay has its own No-Littering ordinance?</Text>
        <YesNoBox value={or1} />

        <Text style={[S.itemText, { marginTop: 6 }]}>
          13.{"  "}Does the City/Municipality have a No-Littering Ordinance which the Barangay implements?
        </Text>
        <YesNoBox value={or2} />

        <Text style={[S.itemText, { marginTop: 6 }]}>
          14.{"  "}If "Yes", does the barangay apprehend violators of R.A.? (Check for apprehension tickets, record of violators, etc.)
        </Text>
        <YesNoBox value={or3} />

        {/* ══════════════════════════════════════════════════════════════
            NEXT STEPS
        ══════════════════════════════════════════════════════════════ */}
        <Text style={S.nextStepsHeader}>NEXT STEPS</Text>

        <View style={S.table}>
          {/* Header */}
          <View style={S.tr}>
            <View style={[S.td, { width: "20%", backgroundColor: "#f0f0f0", alignItems: "center" }]}>
              <Text style={[S.tdBold, { fontSize: 9 }]}>KEY LEGAL PROVISION</Text>
            </View>
            <View style={[S.td, { width: "22%", backgroundColor: "#f0f0f0", alignItems: "center" }]}>
              <Text style={[S.tdBold, { fontSize: 9 }]}>LEGAL CONSEQUENCES</Text>
            </View>
            <View style={[S.td, { flex: 1, backgroundColor: "#f0f0f0", alignItems: "center" }]}>
              <Text style={[S.tdBold, { fontSize: 9 }]}>REASONS FOR LOW-COMPLIANCE</Text>
            </View>
            <View style={[S.tdLast, { flex: 1, backgroundColor: "#f0f0f0", alignItems: "center" }]}>
              <Text style={[S.tdBold, { fontSize: 9 }]}>NEXT STEPS</Text>
            </View>
          </View>
          {/* Data rows */}
          {NEXT_STEPS_CATEGORIES.map((cat, idx) => {
            const isLast = idx === NEXT_STEPS_CATEGORIES.length - 1;
            const nsVal = g(`ns${idx + 1}`);
            return (
              <View key={cat} style={isLast ? S.trLast : S.tr}>
                <View style={[S.td, { width: "20%", justifyContent: "center" }]}>
                  <Text style={{ fontSize: 9 }}>{cat}</Text>
                </View>
                <View style={[S.td, { width: "22%", justifyContent: "center" }]}>
                  {idx === 0 && (
                    <Text style={{ fontSize: 8.5 }}>
                      Administrative sanctions, fines and/or penalties under R.A. 9003 (Sections 49 and 50)
                    </Text>
                  )}
                </View>
                <View style={[S.td, { flex: 1, minHeight: 40 }]}>
                  <Text style={{ fontSize: 9 }}>{nsVal}</Text>
                </View>
                <View style={[S.tdLast, { flex: 1, minHeight: 40 }]}>
                  <Text style={{ fontSize: 9 }}></Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ══════════════════════════════════════════════════════════════
            SIGNATURE BLOCK
        ══════════════════════════════════════════════════════════════ */}
        <View style={S.sigWrap}>
          {/* Accomplished by — Councilor */}
          <View style={S.sigEntry}>
            <Text style={S.sigTitle}>Accomplished by:</Text>
            <View style={S.sigLineRow}>
              <View style={S.sigNameLine}>
                {report.endorsedBy ? <Text style={S.sigNameText}>{report.endorsedBy}</Text> : null}
              </View>
              <View style={S.sigDateLine}>
                {report.endorsedAt ? <Text style={S.sigDateText}>{report.endorsedAt}</Text> : null}
              </View>
            </View>
            <View style={S.sigRoleRow}>
              <Text style={S.sigRoleText}>Committee Chair on Environment or authorized representative</Text>
              <Text style={S.sigDateLabel}>Date</Text>
            </View>
          </View>

          {/* Certified Correct — Captain */}
          <View style={S.sigEntry}>
            <Text style={S.sigTitle}>Certified Correct:</Text>
            <View style={S.sigLineRow}>
              <View style={S.sigNameLine}>
                {report.certifiedBy ? <Text style={S.sigNameText}>{report.certifiedBy}</Text> : null}
              </View>
              <View style={S.sigDateLine}>
                {report.certifiedAt ? <Text style={S.sigDateText}>{report.certifiedAt}</Text> : null}
              </View>
            </View>
            <View style={S.sigRoleRow}>
              <Text style={S.sigRoleText}>Punong Barangay or authorized representative</Text>
              <Text style={S.sigDateLabel}>Date</Text>
            </View>
          </View>

          {/* Encoded-by note (not on the official form, but documents the digital workflow) */}
          {report.preparedBy ? (
            <Text style={S.encodedNote}>
              Encoded and submitted for review by: {report.preparedBy}{report.preparedAt ? `  ·  ${report.preparedAt}` : ""}
            </Text>
          ) : null}

          {/* Status note */}
          <Text style={[S.encodedNote, { color: statusColor, marginTop: 4 }]}>
            Report Status: {statusLabel.toUpperCase()}{"  "}·{"  "}Revision Round: {report.revisionRound}
          </Text>
        </View>

        {/* ── Footer ── */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>LINAW Web Portal · Calamba City CENRO · RA 9003 Compliance Monitoring</Text>
          <Text
            style={S.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
