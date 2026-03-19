import { X, Phone, Calendar, UserPlus, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { Patient } from "@/data/models";
import { getPatientNeeds, getPatientOutreach } from "@/data/sampleData";
import { CallWorkspaceModal } from "./CallWorkspaceModal";

const riskColors: Record<string, string> = {
  low: "bg-success/15 text-success border-success/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-accent/15 text-accent border-accent/30",
  very_high: "bg-destructive/15 text-destructive border-destructive/30",
};

const statusColors: Record<string, string> = {
  OPEN: "bg-destructive/10 text-destructive",
  IN_PROGRESS: "bg-info/10 text-info",
  SCHEDULED: "bg-primary/10 text-primary",
  COMPLETED: "bg-success/10 text-success",
  SNOOZED: "bg-muted text-muted-foreground",
  ESCALATED: "bg-accent/10 text-accent",
};

const flagLabels: Record<string, string> = {
  newly_attributed: "Newly Attributed",
  frequent_ed: "Frequent ED",
  complex_care_candidate: "Complex Care",
};

interface PatientDrawerProps {
  patient: Patient;
  onClose: () => void;
}

export function PatientDrawer({ patient, onClose }: PatientDrawerProps) {
  const [note, setNote] = useState("");
  const [callModalOpen, setCallModalOpen] = useState(false);
  const patientNeeds = getPatientNeeds(patient.id);
  const patientOutreach = getPatientOutreach(patient.id);
  const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();

  const openNeeds = patientNeeds.filter(n => n.status !== "COMPLETED" && n.status !== "NOT_APPLICABLE");
  const topDrivers = openNeeds.sort((a, b) => b.impactScore - a.impactScore).slice(0, 3);

  return (
    <>
      <aside className="w-96 border-l bg-card flex flex-col shrink-0 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">{patient.name}</h2>
              <p className="text-sm text-muted-foreground">
                {age}y · {patient.payer} · {patient.practice}
              </p>
              <p className="text-sm text-muted-foreground">{patient.provider}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className={riskColors[patient.riskTier]}>
              {patient.riskTier.replace("_", " ")}
            </Badge>
            {patient.flags.map(f => (
              <Badge key={f} variant="secondary" className="text-xs">{flagLabels[f] || f}</Badge>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
            <p>📞 {patient.phone} · Prefers {patient.preferredContact}</p>
            <p>RAF Opp: +{patient.rafOpportunity} · HCCs: {patient.hccCount}</p>
            {patient.nextAppointment ? (
              <p>📅 Next visit: {patient.nextAppointment}{patient.nextVisitType ? ` · ${patient.nextVisitType}` : ""}</p>
            ) : (
              <p className="text-destructive">📅 No upcoming visit scheduled</p>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Why in queue */}
          {topDrivers.length > 0 && (
            <div className="p-4 border-b">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Why This Patient</h3>
              <div className="space-y-1.5">
                {topDrivers.map(n => (
                  <div key={n.id} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <span className="flex-1">{n.subtype.replace(/_/g, " ")}</span>
                    <span className="text-xs text-muted-foreground">Score {n.impactScore}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open Needs */}
          <div className="p-4 border-b">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Open Needs ({openNeeds.length})
            </h3>
            <div className="space-y-2">
              {openNeeds.map(n => (
                <div key={n.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusColors[n.status] || ""}>{n.status.replace(/_/g, " ")}</Badge>
                    <span>{n.type.replace(/_/g, " ")}: {n.subtype.replace(/_/g, " ")}</span>
                  </div>
                  {n.dueDate && <span className="text-xs text-muted-foreground">{n.dueDate}</span>}
                </div>
              ))}
              {openNeeds.length === 0 && <p className="text-sm text-muted-foreground">No open needs</p>}
            </div>
          </div>

          {/* Recent Outreach */}
          <div className="p-4 border-b">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Outreach</h3>
            <div className="space-y-2">
              {patientOutreach.slice(0, 5).map(o => (
                <div key={o.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{o.channel}</Badge>
                    <span className="font-medium">{o.outcome.replace(/_/g, " ")}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{o.agent}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{o.notes}</p>
                </div>
              ))}
              {patientOutreach.length === 0 && <p className="text-sm text-muted-foreground">No outreach logged</p>}
            </div>
          </div>

          {/* Quick Note */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Note</h3>
            <Textarea placeholder="Add a note..." value={note} onChange={e => setNote(e.target.value)} className="h-20 text-sm" />
            <Button size="sm" className="mt-2" disabled={!note.trim()}>Save Note</Button>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="p-3 border-t bg-card grid grid-cols-5 gap-1.5">
          <Button variant="default" size="sm" className="flex flex-col items-center gap-0.5 h-auto py-2" onClick={() => setCallModalOpen(true)}>
            <Phone className="h-4 w-4" /><span className="text-[10px]">Call</span>
          </Button>
          <Button variant="outline" size="sm" className="flex flex-col items-center gap-0.5 h-auto py-2">
            <Calendar className="h-4 w-4" /><span className="text-[10px]">Schedule</span>
          </Button>
          <Button variant="outline" size="sm" className="flex flex-col items-center gap-0.5 h-auto py-2">
            <UserPlus className="h-4 w-4" /><span className="text-[10px]">Assign</span>
          </Button>
          <Button variant="outline" size="sm" className="flex flex-col items-center gap-0.5 h-auto py-2">
            <Clock className="h-4 w-4" /><span className="text-[10px]">Snooze</span>
          </Button>
          <Button variant="outline" size="sm" className="flex flex-col items-center gap-0.5 h-auto py-2">
            <AlertTriangle className="h-4 w-4" /><span className="text-[10px]">Escalate</span>
          </Button>
        </div>
      </aside>
      <CallWorkspaceModal open={callModalOpen} onOpenChange={setCallModalOpen} patient={patient} />
    </>
  );
}
