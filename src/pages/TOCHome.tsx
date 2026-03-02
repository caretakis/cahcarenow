import { useState, useMemo } from "react";
import { episodes, getPatientById } from "@/data/sampleData";
import type { Patient, TOCStage } from "@/data/models";
import { PatientDrawer } from "@/components/PatientDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Play, Phone, AlertTriangle, CheckCircle2 } from "lucide-react";

const STAGE_LABELS: Record<TOCStage, string> = {
  admitted: "Admitted",
  discharged: "Discharged",
  interactive_contact: "IC Pending",
  pcp_visit: "PCP Pending",
  follow_ups: "Follow-ups",
  closed: "Closed",
};

const STAGE_COLORS: Record<TOCStage, string> = {
  admitted: "bg-muted text-muted-foreground",
  discharged: "bg-warning/10 text-warning border-warning/30",
  interactive_contact: "bg-destructive/10 text-destructive border-destructive/30",
  pcp_visit: "bg-info/10 text-info border-info/30",
  follow_ups: "bg-primary/10 text-primary border-primary/30",
  closed: "bg-success/10 text-success border-success/30",
};

function slaRemaining(sla48hDue: string): { text: string; urgent: boolean } {
  const now = new Date("2026-03-02T12:00:00");
  const due = new Date(sla48hDue);
  const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursLeft < 0) return { text: "OVERDUE", urgent: true };
  if (hoursLeft < 6) return { text: `${Math.round(hoursLeft)}h left`, urgent: true };
  return { text: `${Math.round(hoursLeft)}h left`, urgent: false };
}

export default function TOCHome() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [tab, setTab] = useState("all_active");

  const enrichedEpisodes = useMemo(() =>
    episodes.map(ep => {
      const totalSteps = ep.steps.length + ep.weeklyFollowUps.length;
      const doneSteps = ep.steps.filter(s => s.status === "DONE").length +
        ep.weeklyFollowUps.filter(w => w.status === "DONE").length;
      const openTasks = ep.followUpTasks.filter(t => t.status === "OPEN").length;
      return {
        ...ep,
        patient: getPatientById(ep.patientId),
        slaInfo: slaRemaining(ep.sla48hDue),
        progressPct: Math.round((doneSteps / totalSteps) * 100),
        openTasks,
      };
    }),
  []);

  const tabEpisodes = useMemo(() => {
    switch (tab) {
      case "needs_contact": return enrichedEpisodes.filter(e => e.status === "ACTIVE" && (e.currentStage === "discharged" || e.currentStage === "interactive_contact"));
      case "in_followup": return enrichedEpisodes.filter(e => e.status === "ACTIVE" && (e.currentStage === "pcp_visit" || e.currentStage === "follow_ups"));
      case "all_active": return enrichedEpisodes.filter(e => e.status === "ACTIVE");
      case "all": return enrichedEpisodes;
      default: return enrichedEpisodes;
    }
  }, [tab, enrichedEpisodes]);

  const onTime = enrichedEpisodes.filter(e => e.status === "ACTIVE" && !e.slaInfo.urgent).length;
  const atRisk = enrichedEpisodes.filter(e => e.status === "ACTIVE" && e.slaInfo.urgent && e.slaInfo.text !== "OVERDUE").length;
  const overdue = enrichedEpisodes.filter(e => e.status === "ACTIVE" && e.slaInfo.text === "OVERDUE").length;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-5 pb-3 space-y-4 border-b">
          <h1 className="text-xl font-bold">Transitions of Care</h1>

          {/* SLA Heatstrip */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-success/10">
              <span className="w-2.5 h-2.5 rounded-full bg-success" />
              <span className="text-sm font-medium">{onTime} On-time</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-warning/10">
              <span className="w-2.5 h-2.5 rounded-full bg-warning" />
              <span className="text-sm font-medium">{atRisk} At-risk</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
              <span className="text-sm font-medium">{overdue} Overdue</span>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="needs_contact">Needs Contact</TabsTrigger>
              <TabsTrigger value="in_followup">In Follow-up</TabsTrigger>
              <TabsTrigger value="all_active">All Active</TabsTrigger>
              <TabsTrigger value="all">All TOC</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Admit Reason</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabEpisodes.map(ep => (
                <TableRow key={ep.id}
                  className={`cursor-pointer ${selectedPatient?.id === ep.patientId ? "bg-primary/5" : ""}`}
                  onClick={() => ep.patient && setSelectedPatient(ep.patient)}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{ep.patient?.name || "Unknown"}</span>
                      <p className="text-xs text-muted-foreground">Discharged {ep.dischargeDate}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{ep.admitReason}</TableCell>
                  <TableCell className="text-sm">{ep.facility}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STAGE_COLORS[ep.currentStage]}>
                      {STAGE_LABELS[ep.currentStage]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={ep.progressPct} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-8">{ep.progressPct}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ep.slaInfo.urgent
                      ? "bg-destructive/10 text-destructive border-destructive/30"
                      : "bg-success/10 text-success border-success/30"}>
                      {ep.slaInfo.text}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ep.openTasks > 0 ? (
                      <span className="text-sm font-medium">{ep.openTasks} open</span>
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="default" size="sm" className="h-7 text-xs"
                        onClick={() => navigate(`/toc/episode/${ep.id}`)}>
                        <Play className="h-3 w-3 mr-1" />Open
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Phone className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><AlertTriangle className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {selectedPatient && (
        <PatientDrawer patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      )}
    </div>
  );
}
