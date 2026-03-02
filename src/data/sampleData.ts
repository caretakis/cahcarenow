export interface Patient {
  id: string;
  name: string;
  age: number;
  dob: string;
  gender: "M" | "F";
  insurance: string;
  pcp: string;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  lastVisit: string;
  nextVisit: string;
  phone: string;
  conditions: string[];
  gaps: string[];
  status: "Active" | "Discharged" | "Pending" | "Scheduled";
  tocStatus?: "Not Started" | "In Progress" | "Complete";
  awvStatus?: "Due" | "Scheduled" | "Completed" | "Overdue";
  admitDate?: string;
  dischargeDate?: string;
  facility?: string;
}

export const patients: Patient[] = [
  {
    id: "P001", name: "Maria Gonzalez", age: 72, dob: "1953-06-14", gender: "F",
    insurance: "Medicare", pcp: "Dr. Sarah Chen", riskScore: 3.2, riskLevel: "High",
    lastVisit: "2026-02-10", nextVisit: "2026-03-10", phone: "(555) 234-5678",
    conditions: ["CHF", "Diabetes Type 2", "Hypertension"],
    gaps: ["A1C Test", "Diabetic Eye Exam"], status: "Active",
    tocStatus: "In Progress", awvStatus: "Overdue",
    admitDate: "2026-02-01", dischargeDate: "2026-02-08", facility: "St. Mary's Hospital"
  },
  {
    id: "P002", name: "James Williams", age: 68, dob: "1957-11-02", gender: "M",
    insurance: "Medicare Advantage", pcp: "Dr. Sarah Chen", riskScore: 2.1, riskLevel: "Medium",
    lastVisit: "2026-01-25", nextVisit: "2026-03-15", phone: "(555) 345-6789",
    conditions: ["COPD", "Hypertension"],
    gaps: ["Lung Function Test"], status: "Active",
    tocStatus: "Not Started", awvStatus: "Due",
    admitDate: "2026-02-15", dischargeDate: "2026-02-20", facility: "General Hospital"
  },
  {
    id: "P003", name: "Dorothy Chen", age: 81, dob: "1944-03-22", gender: "F",
    insurance: "Medicare", pcp: "Dr. Michael Park", riskScore: 4.1, riskLevel: "Critical",
    lastVisit: "2026-02-20", nextVisit: "2026-03-05", phone: "(555) 456-7890",
    conditions: ["CKD Stage 4", "CHF", "Atrial Fibrillation"],
    gaps: ["Kidney Function Panel", "INR Check"], status: "Active",
    tocStatus: "In Progress", awvStatus: "Completed",
    admitDate: "2026-02-18", dischargeDate: "2026-02-25", facility: "University Medical Center"
  },
  {
    id: "P004", name: "Robert Johnson", age: 65, dob: "1960-09-08", gender: "M",
    insurance: "Medicare Advantage", pcp: "Dr. Michael Park", riskScore: 1.5, riskLevel: "Low",
    lastVisit: "2026-02-28", nextVisit: "2026-05-28", phone: "(555) 567-8901",
    conditions: ["Hypertension"], gaps: ["Colorectal Screening"],
    status: "Active", awvStatus: "Scheduled"
  },
  {
    id: "P005", name: "Linda Martinez", age: 74, dob: "1951-12-30", gender: "F",
    insurance: "Medicare", pcp: "Dr. Sarah Chen", riskScore: 2.8, riskLevel: "Medium",
    lastVisit: "2026-01-15", nextVisit: "2026-03-12", phone: "(555) 678-9012",
    conditions: ["Diabetes Type 2", "Depression", "Obesity"],
    gaps: ["PHQ-9 Screening", "A1C Test", "BMI Follow-up"], status: "Active",
    tocStatus: "Complete", awvStatus: "Due"
  },
  {
    id: "P006", name: "William Brown", age: 78, dob: "1947-07-19", gender: "M",
    insurance: "Medicare", pcp: "Dr. Lisa Tran", riskScore: 3.6, riskLevel: "High",
    lastVisit: "2026-02-05", nextVisit: "2026-03-08", phone: "(555) 789-0123",
    conditions: ["CHF", "COPD", "Diabetes Type 2"],
    gaps: ["Spirometry", "A1C Test", "BNP Level"], status: "Active",
    tocStatus: "In Progress", awvStatus: "Overdue",
    admitDate: "2026-01-28", dischargeDate: "2026-02-04", facility: "St. Mary's Hospital"
  },
  {
    id: "P007", name: "Patricia Davis", age: 69, dob: "1956-04-11", gender: "F",
    insurance: "Medicare Advantage", pcp: "Dr. Lisa Tran", riskScore: 1.8, riskLevel: "Low",
    lastVisit: "2026-02-22", nextVisit: "2026-04-22", phone: "(555) 890-1234",
    conditions: ["Osteoarthritis", "Hypertension"],
    gaps: ["Bone Density Scan"], status: "Active", awvStatus: "Completed"
  },
  {
    id: "P008", name: "Charles Wilson", age: 83, dob: "1942-01-05", gender: "M",
    insurance: "Medicare", pcp: "Dr. Michael Park", riskScore: 3.9, riskLevel: "Critical",
    lastVisit: "2026-02-27", nextVisit: "2026-03-06", phone: "(555) 901-2345",
    conditions: ["CKD Stage 3", "CHF", "Diabetes Type 2", "COPD"],
    gaps: ["Kidney Panel", "A1C Test", "Echo"], status: "Active",
    tocStatus: "Not Started", awvStatus: "Overdue",
    admitDate: "2026-02-22", dischargeDate: "2026-02-27", facility: "General Hospital"
  },
];

export const kpiData = {
  totalPatients: 1247,
  openGaps: 342,
  awvCompliance: 67,
  tocPending: 18,
  readmissionRate: 8.2,
  avgRiskScore: 2.4,
};

export const monthlyTrend = [
  { month: "Sep", gaps: 410, awv: 52, readmit: 12.1 },
  { month: "Oct", gaps: 385, awv: 56, readmit: 11.3 },
  { month: "Nov", gaps: 370, awv: 59, readmit: 10.5 },
  { month: "Dec", gaps: 365, awv: 61, readmit: 9.8 },
  { month: "Jan", gaps: 355, awv: 64, readmit: 9.1 },
  { month: "Feb", gaps: 342, awv: 67, readmit: 8.2 },
];

export const heatmapData = [
  { pcp: "Dr. Chen", mon: 4, tue: 6, wed: 3, thu: 7, fri: 2 },
  { pcp: "Dr. Park", mon: 5, tue: 3, wed: 8, thu: 2, fri: 6 },
  { pcp: "Dr. Tran", mon: 2, tue: 7, wed: 4, thu: 5, fri: 3 },
];

export const tocSteps = [
  { id: 1, label: "Discharge Notification Received", description: "Confirm receipt of ADT alert" },
  { id: 2, label: "Chart Review Completed", description: "Review discharge summary, meds, follow-ups" },
  { id: 3, label: "Interactive Contact", description: "Call patient within 48h of discharge", isForm: true },
  { id: 4, label: "Medication Reconciliation", description: "Compare pre-admit vs discharge meds" },
  { id: 5, label: "Follow-up Visit Scheduled", description: "Schedule PCP visit within 7 days" },
  { id: 6, label: "PCP Follow-up Completed", description: "Confirm visit occurred and document" },
  { id: 7, label: "30-Day Check-in", description: "Post-discharge wellness call at 30 days" },
];
