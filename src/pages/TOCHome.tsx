import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { episodes, getPatientById, patients } from "@/data/sampleData";
import type { Patient, TOCStage, EpisodeStatus, NotificationSource } from "@/data/models";
import { PatientDrawer } from "@/components/PatientDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Phone, AlertTriangle, CheckCircle2, Ban, UserCog, Rss, Plus, ShieldCheck, LogOut } from "lucide-react";
import { TOCReassignDialog } from "@/components/TOCReassignDialog";
import { ViewingAsSelector, getTeamMemberName } from "@/components/ViewingAsSelector";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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

const SOURCE_LABELS: Record<NotificationSource, string> = {
  hie_feed: "HIE Feed",
  wellsky: "WellSky",
  hospital_portal: "Hospital Portal",
  manual: "Manual",
};

const SOURCE_COLORS: Record<NotificationSource, string> = {
  hie_feed: "bg-info/10 text-info border-info/30",
  wellsky: "bg-accent text-accent-foreground",
  hospital_portal: "bg-warning/10 text-warning border-warning/30",
  manual: "bg-muted text-muted-foreground",
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "CLOSED", label: "Closed" },
  { value: "NOT_ELIGIBLE", label: "Not Eligible" },
];

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const initialTab = searchParams.get("tab") || "all_active";
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    const paramTab = searchParams.get("tab");
    if (paramTab) {
      setTab(paramTab);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [reassignEpisodeId, setReassignEpisodeId] = useState<string | null>(null);
  const [viewingAs, setViewingAs] = useState("me");
  const [notEligibleEpisodeId, setNotEligibleEpisodeId] = useState<string | null>(null);
  const [dischargeEpisodeId, setDischargeEpisodeId] = useState<string | null>(null);
  const [showAddTOC, setShowAddTOC] = useState(false);
  const [newTocPatient, setNewTocPatient] = useState("");
  const [newTocFacility, setNewTocFacility] = useState("");
  const [newTocReason, setNewTocReason] = useState("");

  const enrichedEpisodes = useMemo(() =>
    episodes.map(ep => {
      const totalSteps = ep.steps.length + ep.weeklyFollowUps.length;
      const doneSteps = ep.steps.filter(s => s.status === "DONE").length +
        ep.weeklyFollowUps.filter(w => w.status === "DONE").length;
      const openTasks = ep.followUpTasks.filter(t => t.status === "OPEN").length;
      return {
        ...ep,
        patient: getPatientById(ep.patientId),
        slaInfo: ep.currentStage === "admitted" ? { text: "N/A", urgent: false } : slaRemaining(ep.sla48hDue),
        progressPct: Math.round((doneSteps / totalSteps) * 100),
        openTasks,
      };
    }),
  []);

  const tabEpisodes = useMemo(() => {
    let filtered = enrichedEpisodes;

    // ViewingAs filter — match by nurse or care coordinator name
    const memberName = getTeamMemberName(viewingAs);
    if (memberName) {
      filtered = filtered.filter(e => e.assignedNurse === memberName || e.assignedCareCoordinator === memberName);
    }

    // Tab filter
    switch (tab) {
      case "admitted":
        filtered = filtered.filter(e => e.currentStage === "admitted");
        break;
      case "needs_contact":
        filtered = filtered.filter(e => e.status === "ACTIVE" && (e.currentStage === "discharged" || e.currentStage === "interactive_contact"));
        break;
      case "in_followup":
        filtered = filtered.filter(e => e.status === "ACTIVE" && (e.currentStage === "pcp_visit" || e.currentStage === "follow_ups"));
        break;
      case "all_active":
        filtered = filtered.filter(e => e.status === "ACTIVE");
        break;
      case "all":
        break;
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    return filtered;
  }, [tab, statusFilter, viewingAs, enrichedEpisodes]);

  const viewingEpisodes = useMemo(() => {
    const memberName = getTeamMemberName(viewingAs);
    if (!memberName) return enrichedEpisodes;
    return enrichedEpisodes.filter(e => e.assignedNurse === memberName || e.assignedCareCoordinator === memberName);
  }, [viewingAs, enrichedEpisodes]);

  const onTime = viewingEpisodes.filter(e => e.status === "ACTIVE" && !e.slaInfo.urgent).length;
  const atRisk = viewingEpisodes.filter(e => e.status === "ACTIVE" && e.slaInfo.urgent && e.slaInfo.text !== "OVERDUE").length;
  const overdue = viewingEpisodes.filter(e => e.status === "ACTIVE" && e.slaInfo.text === "OVERDUE").length;

  const canMarkNotEligible = (stage: TOCStage) => stage === "admitted" || stage === "discharged";

  const handleMarkNotEligible = () => {
    toast.success("Episode marked as Not Eligible");
    setNotEligibleEpisodeId(null);
  };

  const handleVerifyStatus = (epId: string, patientName: string) => {
    toast.success(`Verified ${patientName} is still admitted`, { description: `Last verified: ${new Date().toLocaleString()}` });
  };

  const handleMarkDischarged = () => {
    toast.success("Patient marked as discharged — SLA clock started");
    setDischargeEpisodeId(null);
  };

  const handleAddTOC = () => {
    toast.success("Manual TOC episode created", { description: `${newTocPatient} at ${newTocFacility}` });
    setShowAddTOC(false);
    setNewTocPatient("");
    setNewTocFacility("");
    setNewTocReason("");
  };

  const reassignEpisode = reassignEpisodeId ? enrichedEpisodes.find(e => e.id === reassignEpisodeId) : null;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-5 pb-3 space-y-4 border-b">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold">Transitions of Care</h1>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowAddTOC(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" />Add TOC
              </Button>
              <ViewingAsSelector value={viewingAs} onChange={setViewingAs} />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
              <TabsTrigger value="admitted">Admitted</TabsTrigger>
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
                <TableHead>Source</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Nurse / CC</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabEpisodes.map(ep => (
                <TableRow key={ep.id}
                  className={`cursor-pointer ${selectedPatient?.id === ep.patientId ? "bg-primary/5" : ""} ${ep.status === "NOT_ELIGIBLE" ? "opacity-60" : ""}`}
                  onClick={() => ep.patient && setSelectedPatient(ep.patient)}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{ep.patient?.name || "Unknown"}</span>
                      <p className="text-xs text-muted-foreground">
                        {ep.currentStage === "admitted" ? `Admitted ${ep.startDate}` : `Discharged ${ep.dischargeDate}`}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{ep.admitReason}</TableCell>
                  <TableCell className="text-sm">{ep.facility}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${SOURCE_COLORS[ep.notificationSource]}`}>
                      <Rss className="h-2.5 w-2.5 mr-1" />
                      {SOURCE_LABELS[ep.notificationSource]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ep.status === "NOT_ELIGIBLE" ? (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">Not Eligible</Badge>
                    ) : (
                      <Badge variant="outline" className={STAGE_COLORS[ep.currentStage]}>
                        {STAGE_LABELS[ep.currentStage]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-0.5">
                      <p><span className="text-muted-foreground">RN:</span> {ep.assignedNurse.split(" ").map(n => n[0]).join("")}</p>
                      <p><span className="text-muted-foreground">CC:</span> {ep.assignedCareCoordinator.split(" ").map(n => n[0]).join("")}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={ep.progressPct} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-8">{ep.progressPct}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {ep.currentStage === "admitted" ? (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">N/A</Badge>
                    ) : (
                      <Badge variant="outline" className={ep.slaInfo.urgent
                        ? "bg-destructive/10 text-destructive border-destructive/30"
                        : "bg-success/10 text-success border-success/30"}>
                        {ep.slaInfo.text}
                      </Badge>
                    )}
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
                      {ep.currentStage === "admitted" && ep.status !== "NOT_ELIGIBLE" && (
                        <>
                          <Button variant="outline" size="icon" className="h-7 w-7 text-success border-success/30 hover:bg-success/10"
                            title="Verify still admitted"
                            onClick={() => handleVerifyStatus(ep.id, ep.patient?.name || "Patient")}>
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-7 w-7 text-warning border-warning/30 hover:bg-warning/10"
                            title="Mark as discharged"
                            onClick={() => setDischargeEpisodeId(ep.id)}>
                            <LogOut className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        title="Reassign"
                        onClick={() => setReassignEpisodeId(ep.id)}>
                        <UserCog className="h-3.5 w-3.5" />
                      </Button>
                      {canMarkNotEligible(ep.currentStage) && ep.status !== "NOT_ELIGIBLE" && (
                        <Button variant="outline" size="icon" className="h-7 w-7 text-destructive border-destructive/30 hover:bg-destructive/10"
                          title="Mark Not Eligible"
                          onClick={() => setNotEligibleEpisodeId(ep.id)}>
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Phone className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><AlertTriangle className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {tabEpisodes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    No episodes match the current filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedPatient && (
        <PatientDrawer patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      )}

      {/* Reassign Dialog */}
      {reassignEpisode && (
        <TOCReassignDialog
          open={!!reassignEpisodeId}
          onOpenChange={(open) => !open && setReassignEpisodeId(null)}
          episode={reassignEpisode}
          patientName={reassignEpisode.patient?.name || "Unknown"}
        />
      )}

      {/* Not Eligible Confirmation */}
      <AlertDialog open={!!notEligibleEpisodeId} onOpenChange={(open) => !open && setNotEligibleEpisodeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Not Eligible</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the TOC episode as not eligible for care transitions follow-up. The episode will be closed and no further tasks will be generated. This action can be reversed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkNotEligible} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Mark Not Eligible
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discharge Confirmation */}
      <AlertDialog open={!!dischargeEpisodeId} onOpenChange={(open) => !open && setDischargeEpisodeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Discharged</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the patient from "Admitted" to "Discharged" and start the 48-hour SLA clock for interactive contact. Make sure you've confirmed the discharge with the facility.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkDischarged}>Mark Discharged</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Manual TOC Dialog */}
      <Dialog open={showAddTOC} onOpenChange={setShowAddTOC}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Manual TOC Episode</DialogTitle>
            <DialogDescription>Create a TOC for a patient not picked up by ADT feeds.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">Patient</Label>
              <Select value={newTocPatient} onValueChange={setNewTocPatient}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select patient…" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} — {p.practice}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Facility</Label>
              <Input className="mt-1" placeholder="e.g. Denver Health" value={newTocFacility} onChange={e => setNewTocFacility(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm">Admit Reason</Label>
              <Input className="mt-1" placeholder="e.g. CHF exacerbation" value={newTocReason} onChange={e => setNewTocReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTOC(false)}>Cancel</Button>
            <Button onClick={handleAddTOC} disabled={!newTocPatient || !newTocFacility}>Create Episode</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
