import type { Patient, Need, Outreach, Episode, ProgramEnrollment } from "./models";
import { patients, needs, outreachLog, episodes, programEnrollments, programs } from "./sampleData";

// ── Care Tier Model ──
export type CareTier = 1 | 2 | 3 | 4;

export const tierLabels: Record<CareTier, string> = {
  4: "Complex Care",
  3: "Disease Management",
  2: "Care Navigation",
  1: "Preventive",
};

// Gentler, muted tier colors matching workflow aesthetic
export const tierColors: Record<CareTier, string> = {
  4: "bg-destructive/20 text-destructive border-destructive/30",
  3: "bg-warning/20 text-warning border-warning/30",
  2: "bg-info/20 text-info border-info/30",
  1: "bg-muted text-muted-foreground border-border",
};

export const tierBorderColors: Record<CareTier, string> = {
  4: "border-destructive/30",
  3: "border-warning/30",
  2: "border-info/30",
  1: "border-border",
};

export const tierOwnerRole: Record<CareTier, string> = {
  4: "Complex Care Nurse / Care Manager",
  3: "Disease Management RN or Care Coordinator",
  2: "Care Coordinator",
  1: "Office Staff / Scheduling",
};

export const tierCadence: Record<CareTier, string> = {
  4: "Monthly min; often weekly",
  3: "Quarterly minimum",
  2: "Outreach as needed; annual min",
  1: "Annual AWV + gap closure only",
};

export type TierFitStatus = "appropriate" | "review_upgrade" | "review_downgrade" | "review_toc";

export interface PatientPopulationRecord {
  patient: Patient;
  careTier: CareTier;
  acuityScore: number;       // 0–10
  activeProgram: string | null;
  assignedOwner: string;
  openNeedsCount: number;
  lastTouched: string | null;
  tierFit: TierFitStatus;
  tierFitReason: string | null;
  nextAction: string | null;
  nextActionDue: string | null;
  urgencyScore: number;
  admitsLast12mo: number;
  edVisitsLast12mo: number;
  rafScore: number;
}

// ── Simulated enriched data per patient ──
const patientEnrichment: Record<string, {
  rafScore: number; admitsLast12mo: number; edVisitsLast12mo: number;
  assignedOwner: string; careTierOverride?: CareTier;
}> = {
  p_1001: { rafScore: 2.8, admitsLast12mo: 1, edVisitsLast12mo: 3, assignedOwner: "Lisa Thompson" },
  p_1002: { rafScore: 3.5, admitsLast12mo: 2, edVisitsLast12mo: 1, assignedOwner: "Lisa Thompson" },
  p_1003: { rafScore: 3.2, admitsLast12mo: 1, edVisitsLast12mo: 2, assignedOwner: "Karen Wells" },
  p_1004: { rafScore: 0.6, admitsLast12mo: 1, edVisitsLast12mo: 0, assignedOwner: "Sarah Mitchell" },
  p_1005: { rafScore: 1.4, admitsLast12mo: 0, edVisitsLast12mo: 0, assignedOwner: "Sarah Mitchell" },
  p_1006: { rafScore: 2.4, admitsLast12mo: 1, edVisitsLast12mo: 2, assignedOwner: "Karen Wells" },
  p_1007: { rafScore: 0.4, admitsLast12mo: 0, edVisitsLast12mo: 0, assignedOwner: "Office Staff" },
  p_1008: { rafScore: 3.8, admitsLast12mo: 2, edVisitsLast12mo: 1, assignedOwner: "Karen Wells" },
  p_1009: { rafScore: 1.1, admitsLast12mo: 1, edVisitsLast12mo: 0, assignedOwner: "Mike Rodriguez" },
  p_1010: { rafScore: 2.0, admitsLast12mo: 0, edVisitsLast12mo: 2, assignedOwner: "Mike Rodriguez" },
};

function computeAcuityScore(p: Patient, enrichment: typeof patientEnrichment["p_1001"]): number {
  const raw =
    (enrichment.rafScore * 0.4) +
    (p.hccCount * 0.1) +
    (enrichment.admitsLast12mo * 0.3) +
    (enrichment.edVisitsLast12mo * 0.1) +
    (p.openQualityGaps * 0.05) +
    0.05; // days-since-contact penalty placeholder
  return Math.min(10, Math.round(raw * 10) / 10);
}

function assignTier(acuity: number, p: Patient, enrichment: typeof patientEnrichment["p_1001"]): CareTier {
  if (acuity >= 3.0 || (enrichment.admitsLast12mo >= 2 && p.hccCount >= 6)) return 4;
  if (acuity >= 2.0 || p.hccCount >= 4 || enrichment.admitsLast12mo >= 1) return 3;
  if (acuity >= 1.0 || p.openQualityGaps >= 1 || p.openHccCount >= 1) return 2;
  return 1;
}

function determineTierFit(
  tier: CareTier, acuity: number, p: Patient,
  enrichment: typeof patientEnrichment["p_1001"],
  hasActiveTOC: boolean
): { status: TierFitStatus; reason: string | null } {
  if (hasActiveTOC && tier < 3) {
    return { status: "review_toc", reason: "Active TOC but not in Tier 3/4 — post-discharge complexity may be unaddressed" };
  }
  const suggested = assignTier(acuity, p, enrichment);
  if (suggested > tier) {
    return { status: "review_upgrade", reason: `Acuity (${acuity}) suggests Tier ${suggested} — may need upgrade` };
  }
  if (tier >= 3 && enrichment.admitsLast12mo === 0 && acuity < 1.8) {
    return { status: "review_downgrade", reason: `No acute events, declining acuity — may be ready to step down` };
  }
  return { status: "appropriate", reason: null };
}

function getLastTouched(patientId: string): string | null {
  const outs = outreachLog.filter(o => o.patientId === patientId);
  if (outs.length === 0) return null;
  return outs.sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0].timestamp.split("T")[0];
}

function computeNextAction(patientId: string): { action: string; due: string | null } {
  // Check TOC first
  const ep = episodes.find(e => e.patientId === patientId && e.status === "ACTIVE");
  if (ep) {
    const openStep = ep.steps.find(s => s.status === "OPEN" && s.key !== "admitted");
    if (openStep && openStep.due) {
      return { action: `${openStep.label} due`, due: openStep.due.split("T")[0] };
    }
    const openWk = ep.weeklyFollowUps.find(w => w.status === "OPEN");
    if (openWk) {
      return { action: `Week ${openWk.week} TOC call due`, due: openWk.due };
    }
  }
  // Check program touchpoints
  const enrolls = programEnrollments.filter(pe => pe.patientId === patientId && pe.status === "active");
  for (const enr of enrolls) {
    const overdue = enr.checkpointStatuses.find(c => c.status === "OPEN" && c.nextDue && c.nextDue < "2026-04-16");
    if (overdue) {
      return { action: `${overdue.key.replace(/_/g, " ")} overdue`, due: overdue.nextDue };
    }
  }
  // Check needs
  const pNeeds = needs.filter(n => n.patientId === patientId && n.status === "OPEN")
    .sort((a, b) => b.impactScore - a.impactScore);
  if (pNeeds.length > 0) {
    const n = pNeeds[0];
    return { action: `${n.subtype}`, due: n.dueDate };
  }
  return { action: "No urgent actions", due: null };
}

export function buildPopulationRecords(): PatientPopulationRecord[] {
  return patients.map(p => {
    const enrichment = patientEnrichment[p.id] || { rafScore: 0.5, admitsLast12mo: 0, edVisitsLast12mo: 0, assignedOwner: "Unassigned" };
    const acuity = computeAcuityScore(p, enrichment);
    const tier = enrichment.careTierOverride ?? assignTier(acuity, p, enrichment);
    const hasActiveTOC = episodes.some(e => e.patientId === p.id && e.status === "ACTIVE");
    const { status: tierFit, reason: tierFitReason } = determineTierFit(tier, acuity, p, enrichment, hasActiveTOC);
    const pNeeds = needs.filter(n => n.patientId === p.id && n.status !== "COMPLETED");
    const lastTouched = getLastTouched(p.id);
    const { action: nextAction, due: nextActionDue } = computeNextAction(p.id);
    const enrollment = programEnrollments.find(pe => pe.patientId === p.id && pe.status === "active");
    const prog = enrollment ? programs.find(pr => pr.id === enrollment.programId)?.name ?? null : null;

    // urgency: overdue tasks + tier weight + recency penalty
    const overdueTasks = pNeeds.filter(n => n.dueDate && n.dueDate < "2026-04-16").length;
    const daysSinceContact = lastTouched ? Math.max(0, Math.floor((Date.now() - new Date(lastTouched).getTime()) / 86400000)) : 999;
    const urgencyScore = overdueTasks * 3 + tier * 2 + Math.min(daysSinceContact / 10, 5);

    return {
      patient: p,
      careTier: tier,
      acuityScore: acuity,
      activeProgram: prog,
      assignedOwner: enrichment.assignedOwner,
      openNeedsCount: pNeeds.length,
      lastTouched,
      tierFit,
      tierFitReason,
      nextAction,
      nextActionDue,
      urgencyScore,
      admitsLast12mo: enrichment.admitsLast12mo,
      edVisitsLast12mo: enrichment.edVisitsLast12mo,
      rafScore: enrichment.rafScore,
    };
  });
}

// Interaction history for patient record
export interface InteractionEntry {
  id: string;
  date: string;
  owner: string;
  type: "call" | "assessment" | "toc_step" | "program_touchpoint" | "note";
  description: string;
  outcome: string;
  notes: string;
}

export function getPatientInteractionHistory(patientId: string): InteractionEntry[] {
  const entries: InteractionEntry[] = [];

  // Outreach
  outreachLog.filter(o => o.patientId === patientId).forEach(o => {
    entries.push({
      id: o.id,
      date: o.timestamp,
      owner: o.agent,
      type: "call",
      description: `${o.channel} outreach`,
      outcome: o.outcome.replace(/_/g, " "),
      notes: o.notes,
    });
  });

  // TOC steps
  episodes.filter(e => e.patientId === patientId).forEach(ep => {
    ep.steps.filter(s => s.completedAt).forEach(s => {
      entries.push({
        id: `${ep.id}_${s.key}`,
        date: s.completedAt!,
        owner: ep.assignedNurse,
        type: "toc_step",
        description: `TOC: ${s.label}`,
        outcome: "Completed",
        notes: s.notes || "",
      });
    });
    ep.followUpTasks.filter(t => t.completedAt).forEach(t => {
      entries.push({
        id: t.id,
        date: t.completedAt!,
        owner: ep.assignedCareCoordinator,
        type: "toc_step",
        description: `TOC Task: ${t.label}`,
        outcome: "Completed",
        notes: "",
      });
    });
  });

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}
