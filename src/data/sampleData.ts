import type {
  Patient, Need, Outreach, Episode, Program, ProgramEnrollment,
  MedAdherenceRecord, QueueDefinition, ChaseList
} from "./models";

// ── Patients ──
export const patients: Patient[] = [
  {
    id: "p_1001", name: "Maria Lopez", dob: "1958-03-12", phone: "555-0101",
    preferredContact: "call", address: "Denver, CO", payer: "Humana",
    practice: "Sunrise Family Med", provider: "Dr. Chen", riskTier: "high",
    openHccCount: 3, hccCount: 6, lastAWV: "2024-02-10", nextAppointment: null,
    nextVisitType: null, flags: ["frequent_ed"],
  },
  {
    id: "p_1002", name: "James Carter", dob: "1949-11-02", phone: "555-0199",
    preferredContact: "text", address: "Aurora, CO", payer: "Aetna",
    practice: "Peak Primary Care", provider: "Dr. Patel", riskTier: "very_high",
    openHccCount: 4, hccCount: 9, lastAWV: null, nextAppointment: "2026-03-05",
    nextVisitType: "PCP Follow-up", flags: ["newly_attributed", "complex_care_candidate"],
  },
  {
    id: "p_1003", name: "Dorothy Williams", dob: "1944-07-22", phone: "555-0134",
    preferredContact: "call", address: "Lakewood, CO", payer: "Medicare",
    practice: "Sunrise Family Med", provider: "Dr. Chen", riskTier: "very_high",
    openHccCount: 4, hccCount: 11, lastAWV: "2024-11-15", nextAppointment: "2026-03-10",
    nextVisitType: "AWV", flags: ["complex_care_candidate", "frequent_ed"],
  },
  {
    id: "p_1004", name: "Robert Johnson", dob: "1960-09-08", phone: "555-0167",
    preferredContact: "portal", address: "Boulder, CO", payer: "UnitedHealthcare",
    practice: "Peak Primary Care", provider: "Dr. Patel", riskTier: "low",
    openHccCount: 0, hccCount: 2, lastAWV: "2025-06-20", nextAppointment: "2026-05-20",
    nextVisitType: "Routine", flags: [],
  },
  {
    id: "p_1005", name: "Linda Martinez", dob: "1951-12-30", phone: "555-0178",
    preferredContact: "call", address: "Centennial, CO", payer: "Humana",
    practice: "Sunrise Family Med", provider: "Dr. Tran", riskTier: "medium",
    openHccCount: 2, hccCount: 4, lastAWV: "2025-01-15", nextAppointment: "2026-03-12",
    nextVisitType: "AWV", flags: [],
  },
  {
    id: "p_1006", name: "William Brown", dob: "1947-07-19", phone: "555-0189",
    preferredContact: "call", address: "Thornton, CO", payer: "Medicare",
    practice: "Mountain View Clinic", provider: "Dr. Gupta", riskTier: "high",
    openHccCount: 3, hccCount: 7, lastAWV: "2024-08-05", nextAppointment: "2026-03-08",
    nextVisitType: "Specialist Referral", flags: ["frequent_ed"],
  },
  {
    id: "p_1007", name: "Patricia Davis", dob: "1956-04-11", phone: "555-0190",
    preferredContact: "text", address: "Westminster, CO", payer: "Aetna",
    practice: "Mountain View Clinic", provider: "Dr. Gupta", riskTier: "low",
    openHccCount: 0, hccCount: 1, lastAWV: "2025-09-22", nextAppointment: "2026-04-22",
    nextVisitType: "Routine", flags: [],
  },
  {
    id: "p_1008", name: "Charles Wilson", dob: "1942-01-05", phone: "555-0201",
    preferredContact: "call", address: "Arvada, CO", payer: "Humana",
    practice: "Peak Primary Care", provider: "Dr. Patel", riskTier: "very_high",
    openHccCount: 4, hccCount: 10, lastAWV: "2024-05-10", nextAppointment: "2026-03-06",
    nextVisitType: "PCP Follow-up", flags: ["complex_care_candidate"],
  },
  {
    id: "p_1009", name: "Susan Taylor", dob: "1955-08-18", phone: "555-0212",
    preferredContact: "portal", address: "Broomfield, CO", payer: "UnitedHealthcare",
    practice: "Sunrise Family Med", provider: "Dr. Tran", riskTier: "medium",
    openHccCount: 1, hccCount: 3, lastAWV: "2025-04-10", nextAppointment: null,
    nextVisitType: null, flags: ["newly_attributed"],
  },
  {
    id: "p_1010", name: "Richard Anderson", dob: "1952-02-14", phone: "555-0223",
    preferredContact: "call", address: "Littleton, CO", payer: "Medicare",
    practice: "Mountain View Clinic", provider: "Dr. Gupta", riskTier: "high",
    openHccCount: 2, hccCount: 5, lastAWV: null, nextAppointment: "2026-03-15",
    nextVisitType: "AWV", flags: ["frequent_ed"],
  },
];

// ── Needs ──
export const needs: Need[] = [
  { id: "n_2001", patientId: "p_1001", type: "AWV", subtype: "Schedule AWV", status: "OPEN", ownerRole: "office_staff", dueDate: "2026-03-31", impactScore: 82, source: "claims", details: { reason: "AWV overdue > 12 months" } },
  { id: "n_2002", patientId: "p_1001", type: "QUALITY_GAP", subtype: "Schedule mammogram", status: "OPEN", ownerRole: "central_non_clinical", dueDate: "2026-04-15", impactScore: 55, source: "claims", details: { measure: "BCS", lastDone: "2022-09-01" } },
  { id: "n_2003", patientId: "p_1001", type: "HCC_RECAPTURE", subtype: "Schedule diabetes review", status: "IN_PROGRESS", ownerRole: "central_clinical", dueDate: "2026-06-30", impactScore: 68, source: "model", details: { hcc: "E11.9", rafDelta: "0.18" } },
  { id: "n_2004", patientId: "p_1002", type: "AWV", subtype: "Schedule AWV", status: "OPEN", ownerRole: "office_staff", dueDate: "2026-03-15", impactScore: 95, source: "claims", details: { reason: "No AWV on record" } },
  { id: "n_2005", patientId: "p_1002", type: "TOC_STEP", subtype: "Perform interactive contact", status: "OPEN", ownerRole: "central_clinical", dueDate: "2026-02-28", impactScore: 90, source: "adt", details: { step: "Interactive Contact due" } },
  { id: "n_2006", patientId: "p_1003", type: "QUALITY_GAP", subtype: "Schedule A1c test", status: "OPEN", ownerRole: "central_non_clinical", dueDate: "2026-03-20", impactScore: 72, source: "claims", details: { measure: "A1C", lastDone: "2025-06-01" } },
  { id: "n_2007", patientId: "p_1003", type: "HCC_RECAPTURE", subtype: "Schedule nephrology visit", status: "OPEN", ownerRole: "central_clinical", dueDate: "2026-04-30", impactScore: 85, source: "model", details: { hcc: "N18.3", rafDelta: "0.32" } },
  { id: "n_2008", patientId: "p_1005", type: "AWV", subtype: "Schedule AWV", status: "SCHEDULED", ownerRole: "office_staff", dueDate: "2026-03-12", impactScore: 45, source: "claims", details: { reason: "AWV due this month" } },
  { id: "n_2009", patientId: "p_1006", type: "QUALITY_GAP", subtype: "Schedule colonoscopy", status: "OPEN", ownerRole: "office_staff", dueDate: "2026-04-01", impactScore: 60, source: "claims", details: { measure: "COL", lastDone: "2018-03-15" } },
  { id: "n_2010", patientId: "p_1006", type: "AWV", subtype: "Schedule AWV", status: "OPEN", ownerRole: "office_staff", dueDate: "2026-03-31", impactScore: 75, source: "claims", details: { reason: "AWV overdue > 6 months" } },
  { id: "n_2011", patientId: "p_1008", type: "AWV", subtype: "Schedule AWV", status: "OPEN", ownerRole: "office_staff", dueDate: "2026-03-15", impactScore: 88, source: "claims", details: { reason: "AWV overdue > 9 months" } },
  { id: "n_2012", patientId: "p_1008", type: "QUALITY_GAP", subtype: "Schedule diabetic eye exam", status: "OPEN", ownerRole: "central_non_clinical", dueDate: "2026-04-30", impactScore: 50, source: "claims", details: { measure: "EED", lastDone: "2024-01-20" } },
  { id: "n_2013", patientId: "p_1010", type: "AWV", subtype: "Schedule AWV", status: "OPEN", ownerRole: "office_staff", dueDate: "2026-03-31", impactScore: 78, source: "claims", details: { reason: "No AWV on record" } },
  { id: "n_2014", patientId: "p_1010", type: "MED_ADHERENCE", subtype: "Refill statin", status: "OPEN", ownerRole: "central_non_clinical", dueDate: "2026-03-10", impactScore: 65, source: "surescripts", details: { drug: "Atorvastatin", pdc: "0.62" } },
  { id: "n_2015", patientId: "p_1009", type: "QUALITY_GAP", subtype: "Schedule mammogram", status: "OPEN", ownerRole: "central_non_clinical", dueDate: "2026-05-01", impactScore: 48, source: "claims", details: { measure: "BCS", lastDone: "2023-11-01" } },
];

// ── Outreach ──
export const outreachLog: Outreach[] = [
  { id: "o_4001", patientId: "p_1001", channel: "call", timestamp: "2026-02-25T10:30:00", agent: "Sarah M.", outcome: "left_vm", notes: "Left voicemail regarding AWV scheduling", relatedNeedIds: ["n_2001"] },
  { id: "o_4002", patientId: "p_1001", channel: "call", timestamp: "2026-02-27T14:15:00", agent: "Sarah M.", outcome: "connected", notes: "Patient interested in scheduling AWV. Will call back with date.", relatedNeedIds: ["n_2001"] },
  { id: "o_4003", patientId: "p_1002", channel: "text", timestamp: "2026-02-26T09:00:00", agent: "Mike R.", outcome: "no_answer", notes: "Sent text regarding post-discharge follow-up", relatedNeedIds: ["n_2005"] },
  { id: "o_4004", patientId: "p_1006", channel: "call", timestamp: "2026-02-28T11:00:00", agent: "Sarah M.", outcome: "connected", notes: "Scheduled AWV for 3/15. Discussed colorectal screening.", relatedNeedIds: ["n_2009", "n_2010"] },
  { id: "o_4005", patientId: "p_1008", channel: "call", timestamp: "2026-03-01T09:30:00", agent: "Lisa T.", outcome: "left_vm", notes: "Left VM about upcoming appointment and AWV", relatedNeedIds: ["n_2011"] },
  { id: "o_4006", patientId: "p_1010", channel: "call", timestamp: "2026-02-28T15:00:00", agent: "Mike R.", outcome: "no_answer", notes: "No answer, will retry tomorrow", relatedNeedIds: ["n_2013"] },
];

// ── Episodes (TOC) ──
export const episodes: Episode[] = [
  {
    id: "e_3001", patientId: "p_1002", type: "TOC", startDate: "2026-02-24",
    dischargeDate: "2026-02-26", facility: "University Hospital", admitReason: "CHF exacerbation",
    sla48hDue: "2026-02-28T17:00:00", status: "ACTIVE", currentStage: "interactive_contact",
    assignedNurse: "Lisa Thompson", assignedCareCoordinator: "Sarah Mitchell",
    notificationSource: "hie_feed",
    steps: [
      { key: "admitted", label: "Admitted", status: "DONE", due: null, completedAt: "2026-02-24T08:00:00", notes: "ADT feed received" },
      { key: "discharged", label: "Discharged", status: "DONE", due: null, completedAt: "2026-02-26T14:00:00", notes: "Discharged to home" },
      { key: "interactive_contact", label: "Interactive Contact", status: "OPEN", due: "2026-02-28T17:00:00", completedAt: null, notes: null },
      { key: "pcp_visit", label: "PCP Visit (48h)", status: "OPEN", due: "2026-02-28T17:00:00", completedAt: null, notes: null },
      { key: "follow_ups", label: "Weekly Follow-ups", status: "OPEN", due: null, completedAt: null, notes: null },
    ],
    weeklyFollowUps: [
      { week: 1, status: "OPEN", due: "2026-03-05", completedAt: null, notes: null },
      { week: 2, status: "OPEN", due: "2026-03-12", completedAt: null, notes: null },
      { week: 3, status: "OPEN", due: "2026-03-19", completedAt: null, notes: null },
      { week: 4, status: "OPEN", due: "2026-03-26", completedAt: null, notes: null },
    ],
    followUpTasks: [
      { id: "ft_1", label: "Schedule PCP follow-up appointment", status: "OPEN", due: "2026-02-28", completedAt: null, category: "scheduling" },
      { id: "ft_2", label: "Verify discharge medications reconciled", status: "OPEN", due: "2026-02-28", completedAt: null, category: "medication" },
      { id: "ft_3", label: "Assess transportation needs for PCP visit", status: "OPEN", due: "2026-02-28", completedAt: null, category: "social" },
    ],
  },
  {
    id: "e_3002", patientId: "p_1003", type: "TOC", startDate: "2026-02-20",
    dischargeDate: "2026-02-22", facility: "St. Mary's Medical Center", admitReason: "Pneumonia",
    sla48hDue: "2026-02-24T17:00:00", status: "ACTIVE", currentStage: "pcp_visit",
    assignedNurse: "Lisa Thompson", assignedCareCoordinator: "Mike Rodriguez",
    notificationSource: "wellsky",
    steps: [
      { key: "admitted", label: "Admitted", status: "DONE", due: null, completedAt: "2026-02-20T10:00:00", notes: null },
      { key: "discharged", label: "Discharged", status: "DONE", due: null, completedAt: "2026-02-22T11:00:00", notes: "Discharged to home with O2" },
      { key: "interactive_contact", label: "Interactive Contact", status: "DONE", due: "2026-02-24T17:00:00", completedAt: "2026-02-23T14:30:00", notes: "Spoke with patient. Feeling better, some SOB with exertion." },
      { key: "pcp_visit", label: "PCP Visit (48h)", status: "OPEN", due: "2026-02-24T17:00:00", completedAt: null, notes: "Appointment scheduled 2/25 with Dr. Chen" },
      { key: "follow_ups", label: "Weekly Follow-ups", status: "OPEN", due: null, completedAt: null, notes: null },
    ],
    weeklyFollowUps: [
      { week: 1, status: "DONE", due: "2026-03-01", completedAt: "2026-02-28T10:00:00", notes: "Patient reports improvement. Using O2 at night only." },
      { week: 2, status: "OPEN", due: "2026-03-08", completedAt: null, notes: null },
      { week: 3, status: "OPEN", due: "2026-03-15", completedAt: null, notes: null },
      { week: 4, status: "OPEN", due: "2026-03-22", completedAt: null, notes: null },
    ],
    followUpTasks: [
      { id: "ft_4", label: "Confirm PCP visit attended", status: "OPEN", due: "2026-02-25", completedAt: null, category: "scheduling" },
      { id: "ft_5", label: "Follow up on O2 equipment delivery", status: "DONE", due: "2026-02-24", completedAt: "2026-02-24T09:00:00", category: "clinical" },
      { id: "ft_6", label: "Send discharge summary to PCP", status: "DONE", due: "2026-02-23", completedAt: "2026-02-23T16:00:00", category: "documentation" },
      { id: "ft_7", label: "Verify antibiotic prescription filled", status: "DONE", due: "2026-02-23", completedAt: "2026-02-23T15:00:00", category: "medication" },
    ],
  },
  {
    id: "e_3003", patientId: "p_1006", type: "TOC", startDate: "2026-02-26",
    dischargeDate: "2026-02-28", facility: "General Hospital", admitReason: "COPD exacerbation",
    sla48hDue: "2026-03-02T17:00:00", status: "ACTIVE", currentStage: "discharged",
    assignedNurse: "Karen Wells", assignedCareCoordinator: "Sarah Mitchell",
    notificationSource: "hospital_portal",
    steps: [
      { key: "admitted", label: "Admitted", status: "DONE", due: null, completedAt: "2026-02-26T06:00:00", notes: null },
      { key: "discharged", label: "Discharged", status: "DONE", due: null, completedAt: "2026-02-28T15:00:00", notes: "Discharged to home" },
      { key: "interactive_contact", label: "Interactive Contact", status: "OPEN", due: "2026-03-02T17:00:00", completedAt: null, notes: null },
      { key: "pcp_visit", label: "PCP Visit (48h)", status: "OPEN", due: "2026-03-02T17:00:00", completedAt: null, notes: null },
      { key: "follow_ups", label: "Weekly Follow-ups", status: "OPEN", due: null, completedAt: null, notes: null },
    ],
    weeklyFollowUps: [
      { week: 1, status: "OPEN", due: "2026-03-07", completedAt: null, notes: null },
      { week: 2, status: "OPEN", due: "2026-03-14", completedAt: null, notes: null },
      { week: 3, status: "OPEN", due: "2026-03-21", completedAt: null, notes: null },
      { week: 4, status: "OPEN", due: "2026-03-28", completedAt: null, notes: null },
    ],
    followUpTasks: [
      { id: "ft_8", label: "Attempt interactive contact call", status: "OPEN", due: "2026-03-01", completedAt: null, category: "clinical" },
      { id: "ft_9", label: "Schedule PCP follow-up", status: "OPEN", due: "2026-03-01", completedAt: null, category: "scheduling" },
    ],
  },
  {
    id: "e_3004", patientId: "p_1008", type: "TOC", startDate: "2026-02-22",
    dischargeDate: "2026-02-25", facility: "University Hospital", admitReason: "Diabetic ketoacidosis",
    sla48hDue: "2026-02-27T17:00:00", status: "ACTIVE", currentStage: "follow_ups",
    assignedNurse: "Karen Wells", assignedCareCoordinator: "Mike Rodriguez",
    notificationSource: "hie_feed",
    steps: [
      { key: "admitted", label: "Admitted", status: "DONE", due: null, completedAt: "2026-02-22T03:00:00", notes: null },
      { key: "discharged", label: "Discharged", status: "DONE", due: null, completedAt: "2026-02-25T12:00:00", notes: "Discharged to home, insulin adjusted" },
      { key: "interactive_contact", label: "Interactive Contact", status: "DONE", due: "2026-02-27T17:00:00", completedAt: "2026-02-26T10:00:00", notes: "Patient stable. Understands new insulin regimen." },
      { key: "pcp_visit", label: "PCP Visit (48h)", status: "DONE", due: "2026-02-27T17:00:00", completedAt: "2026-02-27T09:30:00", notes: "Seen by Dr. Patel. A1C ordered." },
      { key: "follow_ups", label: "Weekly Follow-ups", status: "OPEN", due: null, completedAt: null, notes: null },
    ],
    weeklyFollowUps: [
      { week: 1, status: "DONE", due: "2026-03-04", completedAt: "2026-03-03T11:00:00", notes: "Blood sugars improving. Range 120-180." },
      { week: 2, status: "OPEN", due: "2026-03-11", completedAt: null, notes: null },
      { week: 3, status: "OPEN", due: "2026-03-18", completedAt: null, notes: null },
      { week: 4, status: "OPEN", due: "2026-03-25", completedAt: null, notes: null },
    ],
    followUpTasks: [
      { id: "ft_10", label: "Review A1C lab results", status: "OPEN", due: "2026-03-10", completedAt: null, category: "clinical" },
      { id: "ft_11", label: "Confirm endocrinology referral scheduled", status: "DONE", due: "2026-02-28", completedAt: "2026-02-28T14:00:00", category: "scheduling" },
      { id: "ft_12", label: "Verify insulin supply adequate", status: "DONE", due: "2026-02-27", completedAt: "2026-02-27T11:00:00", category: "medication" },
      { id: "ft_13", label: "Arrange diabetes education class", status: "OPEN", due: "2026-03-15", completedAt: null, category: "clinical" },
    ],
  },
  {
    id: "e_3005", patientId: "p_1001", type: "TOC", startDate: "2026-03-17",
    dischargeDate: null, facility: "Denver Health", admitReason: "Acute kidney injury",
    sla48hDue: "2026-03-21T17:00:00", status: "ACTIVE", currentStage: "admitted",
    assignedNurse: "Lisa Thompson", assignedCareCoordinator: "Sarah Mitchell",
    notificationSource: "hie_feed",
    steps: [
      { key: "admitted", label: "Admitted", status: "DONE", due: null, completedAt: "2026-03-17T14:00:00", notes: "ADT notification received via HIE" },
      { key: "discharged", label: "Discharged", status: "OPEN", due: null, completedAt: null, notes: null },
      { key: "interactive_contact", label: "Interactive Contact", status: "OPEN", due: null, completedAt: null, notes: null },
      { key: "pcp_visit", label: "PCP Visit (48h)", status: "OPEN", due: null, completedAt: null, notes: null },
      { key: "follow_ups", label: "Weekly Follow-ups", status: "OPEN", due: null, completedAt: null, notes: null },
    ],
    weeklyFollowUps: [],
    followUpTasks: [],
  },
  {
    id: "e_3006", patientId: "p_1009", type: "TOC", startDate: "2026-03-18",
    dischargeDate: null, facility: "St. Mary's Medical Center", admitReason: "Fall with hip fracture",
    sla48hDue: "2026-03-22T17:00:00", status: "ACTIVE", currentStage: "admitted",
    assignedNurse: "Karen Wells", assignedCareCoordinator: "Mike Rodriguez",
    notificationSource: "wellsky",
    steps: [
      { key: "admitted", label: "Admitted", status: "DONE", due: null, completedAt: "2026-03-18T08:30:00", notes: "WellSky notification — surgical repair scheduled" },
      { key: "discharged", label: "Discharged", status: "OPEN", due: null, completedAt: null, notes: null },
      { key: "interactive_contact", label: "Interactive Contact", status: "OPEN", due: null, completedAt: null, notes: null },
      { key: "pcp_visit", label: "PCP Visit (48h)", status: "OPEN", due: null, completedAt: null, notes: null },
      { key: "follow_ups", label: "Weekly Follow-ups", status: "OPEN", due: null, completedAt: null, notes: null },
    ],
    weeklyFollowUps: [],
    followUpTasks: [],
  },
  {
    id: "e_3007", patientId: "p_1004", type: "TOC", startDate: "2026-03-19",
    dischargeDate: null, facility: "General Hospital", admitReason: "Chest pain — rule out MI",
    sla48hDue: "2026-03-23T17:00:00", status: "ACTIVE", currentStage: "admitted",
    assignedNurse: "Lisa Thompson", assignedCareCoordinator: "Mike Rodriguez",
    notificationSource: "hospital_portal",
    steps: [
      { key: "admitted", label: "Admitted", status: "DONE", due: null, completedAt: "2026-03-19T02:15:00", notes: "Hospital portal alert — ED admit overnight" },
      { key: "discharged", label: "Discharged", status: "OPEN", due: null, completedAt: null, notes: null },
      { key: "interactive_contact", label: "Interactive Contact", status: "OPEN", due: null, completedAt: null, notes: null },
      { key: "pcp_visit", label: "PCP Visit (48h)", status: "OPEN", due: null, completedAt: null, notes: null },
      { key: "follow_ups", label: "Weekly Follow-ups", status: "OPEN", due: null, completedAt: null, notes: null },
    ],
    weeklyFollowUps: [],
    followUpTasks: [],
  },
];

// ── Programs ──
export const programs: Program[] = [
  {
    id: "prog_1", name: "CHF Management", enrollmentRule: "Diagnosis of CHF + high risk tier",
    checkpoints: [
      { key: "weight_check", label: "Daily Weight Check-in", frequencyDays: 7 },
      { key: "med_review", label: "Medication Review", frequencyDays: 30 },
      { key: "cardio_followup", label: "Cardiology Follow-up", frequencyDays: 90 },
    ],
  },
  {
    id: "prog_2", name: "Diabetes Care", enrollmentRule: "A1C > 9 or uncontrolled diabetes",
    checkpoints: [
      { key: "a1c_check", label: "A1C Lab Check", frequencyDays: 90 },
      { key: "nutrition", label: "Nutrition Counseling", frequencyDays: 30 },
      { key: "foot_exam", label: "Foot Exam", frequencyDays: 180 },
    ],
  },
  {
    id: "prog_3", name: "COPD Management", enrollmentRule: "COPD diagnosis + recent exacerbation",
    checkpoints: [
      { key: "spirometry", label: "Spirometry Test", frequencyDays: 180 },
      { key: "action_plan", label: "Action Plan Review", frequencyDays: 90 },
      { key: "pulm_rehab", label: "Pulmonary Rehab Check", frequencyDays: 30 },
    ],
  },
];

export const programEnrollments: ProgramEnrollment[] = [
  {
    id: "pe_1", patientId: "p_1001", programId: "prog_2", enrollDate: "2025-10-01", status: "active",
    checkpointStatuses: [
      { key: "a1c_check", status: "DONE", lastCompleted: "2025-12-15", nextDue: "2026-03-15" },
      { key: "nutrition", status: "OPEN", lastCompleted: "2026-01-20", nextDue: "2026-02-20" },
      { key: "foot_exam", status: "OPEN", lastCompleted: null, nextDue: "2026-04-01" },
    ],
  },
  {
    id: "pe_2", patientId: "p_1003", programId: "prog_1", enrollDate: "2025-08-15", status: "active",
    checkpointStatuses: [
      { key: "weight_check", status: "OPEN", lastCompleted: "2026-02-20", nextDue: "2026-02-27" },
      { key: "med_review", status: "OPEN", lastCompleted: "2026-01-15", nextDue: "2026-02-15" },
      { key: "cardio_followup", status: "OPEN", lastCompleted: "2025-12-01", nextDue: "2026-03-01" },
    ],
  },
  {
    id: "pe_3", patientId: "p_1006", programId: "prog_1", enrollDate: "2025-11-01", status: "active",
    checkpointStatuses: [
      { key: "weight_check", status: "DONE", lastCompleted: "2026-02-25", nextDue: "2026-03-04" },
      { key: "med_review", status: "OPEN", lastCompleted: "2026-01-28", nextDue: "2026-02-28" },
      { key: "cardio_followup", status: "OPEN", lastCompleted: null, nextDue: "2026-03-15" },
    ],
  },
  {
    id: "pe_4", patientId: "p_1008", programId: "prog_2", enrollDate: "2025-09-10", status: "active",
    checkpointStatuses: [
      { key: "a1c_check", status: "OPEN", lastCompleted: "2025-11-20", nextDue: "2026-02-20" },
      { key: "nutrition", status: "OPEN", lastCompleted: "2026-01-10", nextDue: "2026-02-10" },
      { key: "foot_exam", status: "OPEN", lastCompleted: "2025-09-10", nextDue: "2026-03-10" },
    ],
  },
];

// ── Med Adherence ──
export const medAdherenceRecords: MedAdherenceRecord[] = [
  { id: "ma_1", patientId: "p_1001", metric: "Statin", lastFill: "2026-01-15", daysSupply: 30, refillDue: "2026-02-14", pickupStatus: "picked_up", dataConfidence: "high", riskLevel: "overdue" },
  { id: "ma_2", patientId: "p_1001", metric: "DM Meds", lastFill: "2026-02-01", daysSupply: 30, refillDue: "2026-03-03", pickupStatus: "picked_up", dataConfidence: "high", riskLevel: "on_track" },
  { id: "ma_3", patientId: "p_1003", metric: "HTN Meds", lastFill: "2026-01-20", daysSupply: 90, refillDue: "2026-04-20", pickupStatus: "picked_up", dataConfidence: "high", riskLevel: "on_track" },
  { id: "ma_4", patientId: "p_1006", metric: "Statin", lastFill: "2025-12-10", daysSupply: 30, refillDue: "2026-01-09", pickupStatus: "not_picked_up", dataConfidence: "medium", riskLevel: "overdue" },
  { id: "ma_5", patientId: "p_1008", metric: "DM Meds", lastFill: "2026-02-10", daysSupply: 30, refillDue: "2026-03-12", pickupStatus: "unknown", dataConfidence: "low", riskLevel: "at_risk" },
  { id: "ma_6", patientId: "p_1008", metric: "HTN Meds", lastFill: "2026-01-05", daysSupply: 30, refillDue: "2026-02-04", pickupStatus: "not_picked_up", dataConfidence: "medium", riskLevel: "overdue" },
  { id: "ma_7", patientId: "p_1010", metric: "Statin", lastFill: "2026-01-28", daysSupply: 30, refillDue: "2026-02-27", pickupStatus: "unknown", dataConfidence: "low", riskLevel: "at_risk" },
  { id: "ma_8", patientId: "p_1002", metric: "HTN Meds", lastFill: null as any, daysSupply: 0, refillDue: "", pickupStatus: "unknown", dataConfidence: "no_data", riskLevel: "no_data" },
  { id: "ma_9", patientId: "p_1005", metric: "DM Meds", lastFill: "2026-02-20", daysSupply: 30, refillDue: "2026-03-22", pickupStatus: "picked_up", dataConfidence: "high", riskLevel: "on_track" },
];

// ── Queue Definitions ──
export const queueDefinitions: QueueDefinition[] = [
  { id: "scheduling_awv_quality", title: "Scheduling: AWV + Quality", description: "Patients due for AWV or with open quality gaps, ranked by impact", roles: ["office_staff", "central_non_clinical"], icon: "calendar", count: 42, urgentCount: 8 },
  { id: "toc_discharged_uncontacted", title: "TOC: Discharged (Uncontacted)", description: "Recently discharged patients needing 48h interactive contact", roles: ["central_clinical"], icon: "clock", count: 12, urgentCount: 5 },
  { id: "med_adherence_at_risk", title: "Med Adherence: At Risk", description: "Patients with medication adherence gaps or overdue refills", roles: ["central_non_clinical", "central_clinical"], icon: "pill", count: 23, urgentCount: 7 },
  { id: "program_overdue", title: "Programs: Overdue Checkpoints", description: "Patients with overdue program checkpoints needing attention", roles: ["central_clinical"], icon: "clipboard", count: 15, urgentCount: 4 },
];

// ── Chase Lists ──
export const chaseLists: ChaseList[] = [
  {
    id: "cl_1", name: "Q1 AWV Outreach — Humana", createdBy: "Sarah M.", createdAt: "2026-02-15",
    criteria: { payer: "Humana", needType: "AWV", status: "OPEN" },
    patientIds: ["p_1001", "p_1005", "p_1008"],
    stats: { total: 3, remaining: 1, attempted: 1, connected: 1, scheduled: 0 },
  },
  {
    id: "cl_2", name: "High-Risk Quality Gaps", createdBy: "Mike R.", createdAt: "2026-02-20",
    criteria: { riskTier: ["high", "very_high"], needType: "QUALITY_GAP", status: "OPEN" },
    patientIds: ["p_1001", "p_1003", "p_1006", "p_1008", "p_1010"],
    stats: { total: 5, remaining: 3, attempted: 2, connected: 1, scheduled: 1 },
  },
  {
    id: "cl_3", name: "Newly Attributed — No AWV", createdBy: "Lisa T.", createdAt: "2026-02-25",
    criteria: { flags: "newly_attributed", lastAWV: null },
    patientIds: ["p_1002", "p_1009"],
    stats: { total: 2, remaining: 2, attempted: 0, connected: 0, scheduled: 0 },
  },
];

// ── KPI helper data ──
export const weeklyTrend = [
  { week: "W1", gapsClosed: 18, awvCompleted: 8, calls: 120, contacts: 45, scheduled: 22 },
  { week: "W2", gapsClosed: 22, awvCompleted: 11, calls: 135, contacts: 52, scheduled: 28 },
  { week: "W3", gapsClosed: 15, awvCompleted: 9, calls: 110, contacts: 40, scheduled: 19 },
  { week: "W4", gapsClosed: 28, awvCompleted: 14, calls: 145, contacts: 58, scheduled: 35 },
];

export const slaComplianceData = [
  { team: "Team A", onTime: 82, atRisk: 12, overdue: 6 },
  { team: "Team B", onTime: 75, atRisk: 15, overdue: 10 },
  { team: "Team C", onTime: 91, atRisk: 7, overdue: 2 },
];

export const protocolAdherence = [
  { step: "Enroll", completionRate: 95 },
  { step: "Interactive Contact", completionRate: 78 },
  { step: "Med Reconciliation", completionRate: 65 },
  { step: "PCP Follow-up", completionRate: 58 },
  { step: "Weekly Follow-ups", completionRate: 42 },
];

// ── Helper functions ──
export function getPatientNeeds(patientId: string): Need[] {
  return needs.filter(n => n.patientId === patientId);
}

export function getPatientOutreach(patientId: string): Outreach[] {
  return outreachLog.filter(o => o.patientId === patientId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function getPatientEpisodes(patientId: string): Episode[] {
  return episodes.filter(e => e.patientId === patientId);
}

export function getPatientById(id: string): Patient | undefined {
  return patients.find(p => p.id === id);
}

export function getPatientEnrollments(patientId: string): ProgramEnrollment[] {
  return programEnrollments.filter(pe => pe.patientId === patientId);
}

export function getPatientMedAdherence(patientId: string): MedAdherenceRecord[] {
  return medAdherenceRecords.filter(ma => ma.patientId === patientId);
}
