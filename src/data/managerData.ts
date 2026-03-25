// Manager-specific mock data for List Management + Team Productivity

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  activeListCount: number;
  patientsAssigned: number;
}

export interface ManagedChaseList {
  id: string;
  name: string;
  campaignType: "AWV" | "Quality Gap" | "Newly Attributed" | "Disease-Specific" | "Custom";
  status: "draft" | "active" | "completed" | "archived";
  priority: "low" | "medium" | "high";
  createdBy: string;
  createdAt: string;
  dueDate: string;
  description: string;
  assignedUsers: ListAssignment[];
  patients: ListPatient[];
}

export interface ListAssignment {
  userId: string;
  userName: string;
  patientIds: string[];
  dailyCallGoal: number;
}

export type ListPatientStatus = "untouched" | "in_progress" | "scheduled" | "callback" | "declined" | "not_eligible";

export interface ListPatient {
  patientId: string;
  assignedTo: string;
  status: ListPatientStatus;
  attempts: number;
  lastAttemptDate: string | null;
  lastOutcome: string | null;
  callbackDate: string | null;
  notes: string;
}

export interface ActivityLogEntry {
  id: string;
  listId: string;
  timestamp: string;
  userId: string;
  userName: string;
  patientId: string | null;
  patientName: string | null;
  action: string;
  details: string;
}

export interface UserProductivity {
  userId: string;
  userName: string;
  listsActive: number;
  patientsAssigned: number;
  callsMade: number;
  callsConnected: number;
  voicemails: number;
  scheduled: number;
  conversionRate: number;
  avgAttemptsPerPatient: number;
  goalPct: number;
  dailyCalls: { date: string; calls: number; connected: number; scheduled: number }[];
}

// ── Team Members ──
export const managerTeam: TeamMember[] = [
  { id: "tm_1", name: "Laura Torres", role: "Care Coordinator", activeListCount: 2, patientsAssigned: 47 },
  { id: "tm_2", name: "Jessica Rivera", role: "Care Coordinator", activeListCount: 2, patientsAssigned: 44 },
  { id: "tm_3", name: "Maya Singh", role: "Outreach Specialist", activeListCount: 1, patientsAssigned: 18 },
  { id: "tm_4", name: "Sarah Mitchell", role: "Care Coordinator", activeListCount: 2, patientsAssigned: 38 },
  { id: "tm_5", name: "Mike Rodriguez", role: "Outreach Specialist", activeListCount: 1, patientsAssigned: 22 },
];

// ── Managed Chase Lists ──
export const managedChaseLists: ManagedChaseList[] = [
  {
    id: "mcl_1",
    name: "Q1 AWV Outreach — Humana",
    campaignType: "AWV",
    status: "active",
    priority: "high",
    createdBy: "You",
    createdAt: "2026-02-15",
    dueDate: "2026-04-30",
    description: "Annual wellness visit outreach for Humana patients overdue >12 months.",
    assignedUsers: [
      { userId: "tm_1", userName: "Laura Torres", patientIds: ["p_1001", "p_1005"], dailyCallGoal: 15 },
      { userId: "tm_2", userName: "Jessica Rivera", patientIds: ["p_1008"], dailyCallGoal: 15 },
    ],
    patients: [
      { patientId: "p_1001", assignedTo: "tm_1", status: "in_progress", attempts: 2, lastAttemptDate: "2026-02-27", lastOutcome: "connected", callbackDate: "2026-03-05", notes: "Patient interested, will call back." },
      { patientId: "p_1005", assignedTo: "tm_1", status: "scheduled", attempts: 1, lastAttemptDate: "2026-03-01", lastOutcome: "scheduled", callbackDate: null, notes: "AWV scheduled for 3/12." },
      { patientId: "p_1008", assignedTo: "tm_2", status: "untouched", attempts: 0, lastAttemptDate: null, lastOutcome: null, callbackDate: null, notes: "" },
    ],
  },
  {
    id: "mcl_2",
    name: "High-Risk Quality Gaps",
    campaignType: "Quality Gap",
    status: "active",
    priority: "high",
    createdBy: "You",
    createdAt: "2026-02-20",
    dueDate: "2026-05-15",
    description: "Close quality gaps for high and very-high risk patients.",
    assignedUsers: [
      { userId: "tm_1", userName: "Laura Torres", patientIds: ["p_1001", "p_1003"], dailyCallGoal: 12 },
      { userId: "tm_4", userName: "Sarah Mitchell", patientIds: ["p_1006", "p_1008", "p_1010"], dailyCallGoal: 12 },
    ],
    patients: [
      { patientId: "p_1001", assignedTo: "tm_1", status: "in_progress", attempts: 2, lastAttemptDate: "2026-02-27", lastOutcome: "connected", callbackDate: null, notes: "Discussed mammogram scheduling." },
      { patientId: "p_1003", assignedTo: "tm_1", status: "scheduled", attempts: 1, lastAttemptDate: "2026-02-28", lastOutcome: "scheduled", callbackDate: null, notes: "A1c test scheduled." },
      { patientId: "p_1006", assignedTo: "tm_4", status: "callback", attempts: 1, lastAttemptDate: "2026-02-28", lastOutcome: "connected", callbackDate: "2026-03-03", notes: "Will discuss with spouse." },
      { patientId: "p_1008", assignedTo: "tm_4", status: "declined", attempts: 2, lastAttemptDate: "2026-03-01", lastOutcome: "refused", callbackDate: null, notes: "Patient declined eye exam." },
      { patientId: "p_1010", assignedTo: "tm_4", status: "untouched", attempts: 0, lastAttemptDate: null, lastOutcome: null, callbackDate: null, notes: "" },
    ],
  },
  {
    id: "mcl_3",
    name: "Newly Attributed — No AWV",
    campaignType: "Newly Attributed",
    status: "active",
    priority: "medium",
    createdBy: "You",
    createdAt: "2026-02-25",
    dueDate: "2026-04-15",
    description: "Outreach newly attributed patients who have never had an AWV.",
    assignedUsers: [
      { userId: "tm_3", userName: "Maya Singh", patientIds: ["p_1002", "p_1009"], dailyCallGoal: 10 },
    ],
    patients: [
      { patientId: "p_1002", assignedTo: "tm_3", status: "untouched", attempts: 0, lastAttemptDate: null, lastOutcome: null, callbackDate: null, notes: "" },
      { patientId: "p_1009", assignedTo: "tm_3", status: "untouched", attempts: 0, lastAttemptDate: null, lastOutcome: null, callbackDate: null, notes: "" },
    ],
  },
  {
    id: "mcl_4",
    name: "Diabetes Outreach — Medicare",
    campaignType: "Disease-Specific",
    status: "draft",
    priority: "medium",
    createdBy: "You",
    createdAt: "2026-03-20",
    dueDate: "2026-06-30",
    description: "Targeted outreach for Medicare patients with uncontrolled diabetes.",
    assignedUsers: [],
    patients: [
      { patientId: "p_1003", assignedTo: "", status: "untouched", attempts: 0, lastAttemptDate: null, lastOutcome: null, callbackDate: null, notes: "" },
      { patientId: "p_1008", assignedTo: "", status: "untouched", attempts: 0, lastAttemptDate: null, lastOutcome: null, callbackDate: null, notes: "" },
    ],
  },
  {
    id: "mcl_5",
    name: "Q4 2025 Quality — Completed",
    campaignType: "Quality Gap",
    status: "completed",
    priority: "low",
    createdBy: "You",
    createdAt: "2025-10-01",
    dueDate: "2025-12-31",
    description: "Quality gap closure push for Q4 2025.",
    assignedUsers: [
      { userId: "tm_1", userName: "Laura Torres", patientIds: ["p_1004", "p_1007"], dailyCallGoal: 10 },
      { userId: "tm_5", userName: "Mike Rodriguez", patientIds: ["p_1005"], dailyCallGoal: 10 },
    ],
    patients: [
      { patientId: "p_1004", assignedTo: "tm_1", status: "scheduled", attempts: 1, lastAttemptDate: "2025-11-15", lastOutcome: "scheduled", callbackDate: null, notes: "Completed." },
      { patientId: "p_1007", assignedTo: "tm_1", status: "not_eligible", attempts: 1, lastAttemptDate: "2025-11-20", lastOutcome: "refused", callbackDate: null, notes: "Switched provider." },
      { patientId: "p_1005", assignedTo: "tm_5", status: "scheduled", attempts: 2, lastAttemptDate: "2025-12-02", lastOutcome: "scheduled", callbackDate: null, notes: "Done." },
    ],
  },
];

// ── Activity Log ──
export const activityLog: ActivityLogEntry[] = [
  { id: "al_1", listId: "mcl_1", timestamp: "2026-03-01T14:30:00", userId: "tm_1", userName: "Laura Torres", patientId: "p_1005", patientName: "Linda Martinez", action: "Scheduled", details: "AWV scheduled for 3/12 with Dr. Tran" },
  { id: "al_2", listId: "mcl_1", timestamp: "2026-02-27T14:15:00", userId: "tm_1", userName: "Laura Torres", patientId: "p_1001", patientName: "Maria Lopez", action: "Call — Connected", details: "Patient interested in scheduling AWV. Will call back." },
  { id: "al_3", listId: "mcl_1", timestamp: "2026-02-25T10:30:00", userId: "tm_1", userName: "Laura Torres", patientId: "p_1001", patientName: "Maria Lopez", action: "Call — Left VM", details: "Left voicemail regarding AWV scheduling" },
  { id: "al_4", listId: "mcl_2", timestamp: "2026-03-01T09:30:00", userId: "tm_4", userName: "Sarah Mitchell", patientId: "p_1008", patientName: "Charles Wilson", action: "Declined", details: "Patient declined diabetic eye exam" },
  { id: "al_5", listId: "mcl_2", timestamp: "2026-02-28T16:00:00", userId: "tm_4", userName: "Sarah Mitchell", patientId: "p_1006", patientName: "William Brown", action: "Call — Connected", details: "Will discuss with spouse, callback 3/3" },
  { id: "al_6", listId: "mcl_2", timestamp: "2026-02-28T11:00:00", userId: "tm_1", userName: "Laura Torres", patientId: "p_1003", patientName: "Dorothy Williams", action: "Scheduled", details: "A1c test scheduled" },
  { id: "al_7", listId: "mcl_2", timestamp: "2026-02-27T14:15:00", userId: "tm_1", userName: "Laura Torres", patientId: "p_1001", patientName: "Maria Lopez", action: "Call — Connected", details: "Discussed mammogram scheduling" },
  { id: "al_8", listId: "mcl_1", timestamp: "2026-02-15T09:00:00", userId: "mgr", userName: "You", patientId: null, patientName: null, action: "List Created", details: "Created and published list with 3 patients" },
  { id: "al_9", listId: "mcl_2", timestamp: "2026-02-20T10:00:00", userId: "mgr", userName: "You", patientId: null, patientName: null, action: "List Created", details: "Created and published list with 5 patients" },
  { id: "al_10", listId: "mcl_3", timestamp: "2026-02-25T08:00:00", userId: "mgr", userName: "You", patientId: null, patientName: null, action: "List Created", details: "Created and published list with 2 patients" },
];

// ── User Productivity ──
export const userProductivity: UserProductivity[] = [
  {
    userId: "tm_1", userName: "Laura Torres", listsActive: 2, patientsAssigned: 47,
    callsMade: 89, callsConnected: 34, voicemails: 22, scheduled: 19, conversionRate: 56, avgAttemptsPerPatient: 1.9, goalPct: 83,
    dailyCalls: [
      { date: "2026-03-11", calls: 8, connected: 3, scheduled: 2 },
      { date: "2026-03-12", calls: 12, connected: 5, scheduled: 3 },
      { date: "2026-03-13", calls: 6, connected: 2, scheduled: 1 },
      { date: "2026-03-14", calls: 10, connected: 4, scheduled: 2 },
      { date: "2026-03-15", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-16", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-17", calls: 9, connected: 3, scheduled: 2 },
      { date: "2026-03-18", calls: 11, connected: 5, scheduled: 2 },
      { date: "2026-03-19", calls: 7, connected: 2, scheduled: 1 },
      { date: "2026-03-20", calls: 10, connected: 4, scheduled: 2 },
      { date: "2026-03-21", calls: 8, connected: 3, scheduled: 2 },
      { date: "2026-03-22", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-23", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-24", calls: 8, connected: 3, scheduled: 2 },
    ],
  },
  {
    userId: "tm_2", userName: "Jessica Rivera", listsActive: 2, patientsAssigned: 44,
    callsMade: 61, callsConnected: 20, voicemails: 18, scheduled: 11, conversionRate: 55, avgAttemptsPerPatient: 1.3, goalPct: 48,
    dailyCalls: [
      { date: "2026-03-11", calls: 5, connected: 2, scheduled: 1 },
      { date: "2026-03-12", calls: 7, connected: 2, scheduled: 1 },
      { date: "2026-03-13", calls: 4, connected: 1, scheduled: 0 },
      { date: "2026-03-14", calls: 6, connected: 2, scheduled: 1 },
      { date: "2026-03-15", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-16", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-17", calls: 5, connected: 2, scheduled: 1 },
      { date: "2026-03-18", calls: 6, connected: 2, scheduled: 1 },
      { date: "2026-03-19", calls: 4, connected: 1, scheduled: 1 },
      { date: "2026-03-20", calls: 7, connected: 2, scheduled: 1 },
      { date: "2026-03-21", calls: 5, connected: 2, scheduled: 1 },
      { date: "2026-03-22", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-23", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-24", calls: 12, connected: 4, scheduled: 3 },
    ],
  },
  {
    userId: "tm_3", userName: "Maya Singh", listsActive: 1, patientsAssigned: 18,
    callsMade: 44, callsConnected: 19, voicemails: 12, scheduled: 10, conversionRate: 53, avgAttemptsPerPatient: 2.4, goalPct: 71,
    dailyCalls: [
      { date: "2026-03-11", calls: 4, connected: 2, scheduled: 1 },
      { date: "2026-03-12", calls: 5, connected: 2, scheduled: 1 },
      { date: "2026-03-13", calls: 3, connected: 1, scheduled: 1 },
      { date: "2026-03-14", calls: 4, connected: 2, scheduled: 1 },
      { date: "2026-03-15", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-16", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-17", calls: 4, connected: 1, scheduled: 1 },
      { date: "2026-03-18", calls: 5, connected: 2, scheduled: 1 },
      { date: "2026-03-19", calls: 3, connected: 2, scheduled: 1 },
      { date: "2026-03-20", calls: 4, connected: 2, scheduled: 1 },
      { date: "2026-03-21", calls: 4, connected: 1, scheduled: 0 },
      { date: "2026-03-22", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-23", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-24", calls: 8, connected: 4, scheduled: 2 },
    ],
  },
  {
    userId: "tm_4", userName: "Sarah Mitchell", listsActive: 2, patientsAssigned: 38,
    callsMade: 76, callsConnected: 28, voicemails: 20, scheduled: 15, conversionRate: 54, avgAttemptsPerPatient: 2.0, goalPct: 65,
    dailyCalls: [
      { date: "2026-03-11", calls: 6, connected: 2, scheduled: 1 },
      { date: "2026-03-12", calls: 8, connected: 3, scheduled: 2 },
      { date: "2026-03-13", calls: 5, connected: 2, scheduled: 1 },
      { date: "2026-03-14", calls: 7, connected: 3, scheduled: 1 },
      { date: "2026-03-15", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-16", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-17", calls: 6, connected: 2, scheduled: 1 },
      { date: "2026-03-18", calls: 9, connected: 4, scheduled: 2 },
      { date: "2026-03-19", calls: 5, connected: 2, scheduled: 1 },
      { date: "2026-03-20", calls: 8, connected: 3, scheduled: 2 },
      { date: "2026-03-21", calls: 7, connected: 2, scheduled: 1 },
      { date: "2026-03-22", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-23", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-24", calls: 15, connected: 5, scheduled: 3 },
    ],
  },
  {
    userId: "tm_5", userName: "Mike Rodriguez", listsActive: 1, patientsAssigned: 22,
    callsMade: 38, callsConnected: 14, voicemails: 10, scheduled: 7, conversionRate: 50, avgAttemptsPerPatient: 1.7, goalPct: 42,
    dailyCalls: [
      { date: "2026-03-11", calls: 3, connected: 1, scheduled: 0 },
      { date: "2026-03-12", calls: 4, connected: 1, scheduled: 1 },
      { date: "2026-03-13", calls: 2, connected: 1, scheduled: 0 },
      { date: "2026-03-14", calls: 3, connected: 1, scheduled: 1 },
      { date: "2026-03-15", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-16", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-17", calls: 3, connected: 1, scheduled: 0 },
      { date: "2026-03-18", calls: 4, connected: 2, scheduled: 1 },
      { date: "2026-03-19", calls: 3, connected: 1, scheduled: 1 },
      { date: "2026-03-20", calls: 4, connected: 2, scheduled: 1 },
      { date: "2026-03-21", calls: 3, connected: 1, scheduled: 0 },
      { date: "2026-03-22", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-23", calls: 0, connected: 0, scheduled: 0 },
      { date: "2026-03-24", calls: 9, connected: 3, scheduled: 2 },
    ],
  },
];

// Helper to get list stats
export function getListStatusCounts(list: ManagedChaseList) {
  const counts = { untouched: 0, in_progress: 0, scheduled: 0, callback: 0, declined: 0, not_eligible: 0 };
  list.patients.forEach(p => { counts[p.status]++; });
  return counts;
}

export function getUserStatsForList(list: ManagedChaseList, userId: string) {
  const pts = list.patients.filter(p => p.assignedTo === userId);
  return {
    assigned: pts.length,
    called: pts.filter(p => p.attempts > 0).length,
    connected: pts.filter(p => p.lastOutcome === "connected" || p.lastOutcome === "scheduled").length,
    scheduled: pts.filter(p => p.status === "scheduled").length,
    declined: pts.filter(p => p.status === "declined").length,
    notEligible: pts.filter(p => p.status === "not_eligible").length,
    remaining: pts.filter(p => p.status === "untouched" || p.status === "in_progress" || p.status === "callback").length,
  };
}
