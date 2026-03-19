// ── Core domain types per CareOps spec ──

export type RiskTier = "low" | "medium" | "high" | "very_high";
export type PreferredContact = "call" | "text" | "portal";
export type PatientFlag = "newly_attributed" | "frequent_ed" | "complex_care_candidate";

export interface Patient {
  id: string;
  name: string;
  dob: string;
  phone: string;
  preferredContact: PreferredContact;
  address: string;
  payer: string;
  practice: string;
  provider: string;
  riskTier: RiskTier;
  rafOpportunity: number;
  hccCount: number;
  lastAWV: string | null;
  nextAppointment: string | null;
  nextVisitType: string | null;
  flags: PatientFlag[];
}

export type NeedType = "AWV" | "QUALITY_GAP" | "HCC_RECAPTURE" | "TOC_STEP" | "MED_ADHERENCE" | "PROGRAM_CHECKPOINT" | "SUPP_DOC";
export type NeedStatus = "OPEN" | "IN_PROGRESS" | "SCHEDULED" | "COMPLETED" | "PENDING_DOC" | "ESCALATED" | "SNOOZED" | "NOT_APPLICABLE";
export type OwnerRole = "office_staff" | "central_non_clinical" | "central_clinical";

export interface Need {
  id: string;
  patientId: string;
  type: NeedType;
  subtype: string;
  status: NeedStatus;
  ownerRole: OwnerRole;
  dueDate: string | null;
  impactScore: number;
  source: "claims" | "ehr" | "adt" | "surescripts" | "model" | "manual";
  details: Record<string, string>;
}

export type OutreachChannel = "call" | "text" | "voicemail" | "pharmacy_call" | "provider_call";
export type OutreachOutcome = "connected" | "left_vm" | "no_answer" | "refused" | "wrong_number" | "scheduled" | "needs_followup";

export interface Outreach {
  id: string;
  patientId: string;
  channel: OutreachChannel;
  timestamp: string;
  agent: string;
  outcome: OutreachOutcome;
  notes: string;
  relatedNeedIds: string[];
}

export type EpisodeStatus = "ACTIVE" | "CLOSED" | "NOT_ELIGIBLE";
export type NotificationSource = "hie_feed" | "wellsky" | "hospital_portal" | "manual";
export type StepStatus = "OPEN" | "DONE" | "SKIPPED";
export type TOCStage = "admitted" | "discharged" | "interactive_contact" | "pcp_visit" | "follow_ups" | "closed";

export interface EpisodeStep {
  key: string;
  label: string;
  status: StepStatus;
  due: string | null;
  completedAt: string | null;
  notes: string | null;
}

export interface FollowUpTask {
  id: string;
  label: string;
  status: StepStatus;
  due: string | null;
  completedAt: string | null;
  category: "scheduling" | "clinical" | "social" | "medication" | "documentation";
}

export interface WeeklyFollowUp {
  week: number;
  status: StepStatus;
  due: string | null;
  completedAt: string | null;
  notes: string | null;
}

export interface Episode {
  id: string;
  patientId: string;
  type: "TOC";
  startDate: string;
  dischargeDate: string;
  facility: string;
  admitReason: string;
  sla48hDue: string;
  status: EpisodeStatus;
  currentStage: TOCStage;
  assignedNurse: string;
  assignedCareCoordinator: string;
  notificationSource: NotificationSource;
  steps: EpisodeStep[];
  weeklyFollowUps: WeeklyFollowUp[];
  followUpTasks: FollowUpTask[];
}

export interface Program {
  id: string;
  name: string;
  enrollmentRule: string;
  checkpoints: ProgramCheckpoint[];
}

export interface ProgramCheckpoint {
  key: string;
  label: string;
  frequencyDays: number;
}

export interface ProgramEnrollment {
  id: string;
  patientId: string;
  programId: string;
  enrollDate: string;
  status: "active" | "completed" | "withdrawn";
  checkpointStatuses: { key: string; status: StepStatus; lastCompleted: string | null; nextDue: string | null }[];
}

export interface MedAdherenceRecord {
  id: string;
  patientId: string;
  metric: string;
  lastFill: string;
  daysSupply: number;
  refillDue: string;
  pickupStatus: "picked_up" | "not_picked_up" | "unknown";
  dataConfidence: "high" | "medium" | "low" | "no_data";
  riskLevel: "on_track" | "at_risk" | "overdue" | "no_data";
}

export interface QueueDefinition {
  id: string;
  title: string;
  description: string;
  roles: string[];
  icon: string;
  count: number;
  urgentCount: number;
}

export interface ChaseList {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  criteria: Record<string, any>;
  patientIds: string[];
  stats: { total: number; remaining: number; attempted: number; connected: number; scheduled: number };
}
