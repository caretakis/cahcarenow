import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { chaseLists, campaigns, patients, getPatientNeeds, getPatientOutreach } from "@/data/sampleData";
import type { Patient, ChaseList, Campaign, CampaignPatient } from "@/data/models";
import { PatientDrawer } from "@/components/PatientDrawer";
import { TopKPIBar } from "@/components/TopKPIBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Calendar, Download, CheckCircle, ArrowUpDown, Trophy, Plus, List, CalendarIcon, Zap, Clock, AlertTriangle } from "lucide-react";
import { CallWorkspaceModal } from "@/components/CallWorkspaceModal";
import { useNavigate } from "react-router-dom";
import { ViewingAsSelector } from "@/components/ViewingAsSelector";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { differenceInDays, parseISO } from "date-fns";
import { useMvpMode } from "@/contexts/MvpModeContext";

type SortKey = "risk" | "openHcc" | "gaps";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | "remaining" | "attempted" | "connected" | "scheduled";

const riskOrder: Record<string, number> = { very_high: 4, high: 3, medium: 2, low: 1 };

// Simulated per-patient statuses for filtering
function getPatientStatus(patientId: string, list: ChaseList): StatusFilter {
  const outreach = getPatientOutreach(patientId);
  if (outreach.some(o => o.outcome === "scheduled")) return "scheduled";
  if (outreach.some(o => o.outcome === "connected")) return "connected";
  if (outreach.length > 0) return "attempted";
  return "remaining";
}

type SelectedItem = { type: "list"; id: string } | { type: "campaign"; id: string };

export default function ChaseListsPage() {
  const navigate = useNavigate();
  const { mvpMode } = useMvpMode();
  const [viewingAs, setViewingAs] = useState("me");
  const [callPatient, setCallPatient] = useState<Patient | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialList = searchParams.get("list") || chaseLists[0]?.id || null;
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(
    initialList ? { type: "list", id: initialList } : null
  );

  useEffect(() => {
    const paramList = searchParams.get("list");
    if (paramList && (selectedItem?.type !== "list" || selectedItem?.id !== paramList)) {
      setSelectedItem({ type: "list", id: paramList });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [schedulePatient, setSchedulePatient] = useState<Patient | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleVisitType, setScheduleVisitType] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");

  const selectedList = selectedItem?.type === "list" ? chaseLists.find(l => l.id === selectedItem.id) ?? null : null;
  const selectedCampaign = selectedItem?.type === "campaign" ? campaigns.find(c => c.id === selectedItem.id) ?? null : null;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  // Helper to get campaign patient record
  const getCampaignPatient = (patientId: string): CampaignPatient | undefined => {
    return selectedCampaign?.patients.find(cp => cp.patientId === patientId);
  };

  const listPatients = useMemo(() => {
    let pts: Patient[] = [];
    if (selectedList) {
      pts = selectedList.patientIds
        .map(id => patients.find(p => p.id === id))
        .filter(Boolean) as Patient[];
    } else if (selectedCampaign) {
      pts = selectedCampaign.patients
        .map(cp => patients.find(p => p.id === cp.patientId))
        .filter(Boolean) as Patient[];
    }

    // Status filter
    if (statusFilter !== "all" && selectedList) {
      pts = pts.filter(p => getPatientStatus(p.id, selectedList) === statusFilter);
    }

    if (!sortKey) return pts;
    return [...pts].sort((a, b) => {
      let diff = 0;
      if (sortKey === "risk") diff = riskOrder[a.riskTier] - riskOrder[b.riskTier];
      else if (sortKey === "openHcc") diff = a.openHccCount - b.openHccCount;
      else if (sortKey === "gaps") {
        const aGaps = getPatientNeeds(a.id).filter(n => n.status !== "COMPLETED").length;
        const bGaps = getPatientNeeds(b.id).filter(n => n.status !== "COMPLETED").length;
        diff = aGaps - bGaps;
      }
      return sortDir === "desc" ? -diff : diff;
    });
  }, [selectedList, selectedCampaign, sortKey, sortDir, statusFilter]);

  const SortButton = ({ k, label }: { k: SortKey; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
      onClick={(e) => { e.stopPropagation(); toggleSort(k); }}
    >
      {label}
      <ArrowUpDown className={`ml-1 h-3 w-3 ${sortKey === k ? "text-primary" : "opacity-40"}`} />
    </Button>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel — Chase List Selector */}
      <div className="w-72 shrink-0 border-r bg-card flex flex-col">
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Chase Lists</h2>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate("/lists/builder")}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ViewingAsSelector value={viewingAs} onChange={setViewingAs} />
        </div>
        <div className="flex-1 overflow-auto">
          {/* Campaigns Section */}
          <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3" /> Campaigns
            </p>
          </div>
          {campaigns.map(camp => {
            const isActive = selectedItem?.type === "campaign" && selectedItem.id === camp.id;
            const worked = camp.stats.total - camp.stats.remaining;
            const pct = camp.stats.total > 0 ? Math.round((worked / camp.stats.total) * 100) : 0;
            return (
              <button
                key={camp.id}
                onClick={() => {
                  setSelectedItem({ type: "campaign", id: camp.id });
                  setSelectedPatient(null);
                  setStatusFilter("all");
                }}
                className={cn(
                  "w-full text-left px-4 py-3 border-b transition-colors",
                  isActive
                    ? "bg-primary/5 border-l-2 border-l-primary"
                    : "hover:bg-muted/50 border-l-2 border-l-transparent"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-chart-4 shrink-0" />
                  <p className={cn("text-sm font-medium truncate", isActive && "text-primary")}>{camp.name}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Event-driven · {camp.stats.total} patients</p>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <span className="text-[10px] text-muted-foreground font-medium">{worked}/{camp.stats.total}</span>
                </div>
                {(camp.stats.atRisk > 0 || camp.stats.overdue > 0) && (
                  <div className="flex items-center gap-2 mt-1.5">
                    {camp.stats.atRisk > 0 && (
                      <span className="text-[10px] text-warning flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" /> {camp.stats.atRisk} at risk
                      </span>
                    )}
                    {camp.stats.overdue > 0 && (
                      <span className="text-[10px] text-destructive flex items-center gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" /> {camp.stats.overdue} overdue
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}

          {/* Chase Lists Section */}
          <div className="px-4 pt-4 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Chase Lists</p>
          </div>
          {chaseLists.map(list => {
            const isActive = selectedItem?.type === "list" && selectedItem.id === list.id;
            const worked = list.stats.total - list.stats.remaining;
            const pct = list.stats.total > 0 ? Math.round((worked / list.stats.total) * 100) : 0;
            return (
              <button
                key={list.id}
                onClick={() => {
                  setSelectedItem({ type: "list", id: list.id });
                  setSelectedPatient(null);
                  setStatusFilter("all");
                }}
                className={cn(
                  "w-full text-left px-4 py-3 border-b transition-colors",
                  isActive
                    ? "bg-primary/5 border-l-2 border-l-primary"
                    : "hover:bg-muted/50 border-l-2 border-l-transparent"
                )}
              >
                <p className={cn("text-sm font-medium truncate", isActive && "text-primary")}>{list.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{list.createdBy} · {list.stats.total} patients</p>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <span className="text-[10px] text-muted-foreground font-medium">{worked}/{list.stats.total}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      {(selectedList || selectedCampaign) ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="p-5 pb-3 space-y-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {selectedCampaign && <Zap className="h-4 w-4 text-chart-4" />}
                  <h1 className="text-xl font-bold">{selectedList?.name || selectedCampaign?.name}</h1>
                  {selectedCampaign && (
                    <Badge variant="outline" className="text-xs bg-chart-4/10 text-chart-4 border-chart-4/30">Campaign</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedList
                    ? `Created by ${selectedList.createdBy} · ${selectedList.createdAt}`
                    : `Event-driven · ${selectedCampaign!.slaDays}-day SLA · ${selectedCampaign!.description}`
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  const name = selectedList?.name || selectedCampaign?.name || "export";
                  const header = selectedCampaign
                    ? "Name,Provider,Risk,Attribution Date,SLA Due,SLA Status\n"
                    : "Name,Provider,Risk,Open HCCs,Open Gaps,Status\n";
                  const rows = listPatients.map(p => {
                    if (selectedCampaign) {
                      const cp = getCampaignPatient(p.id);
                      return `"${p.name}","${p.provider}","${p.riskTier}","${cp?.triggeredAt || ""}","${cp?.slaDueDate || ""}","${cp?.slaStatus || ""}"`;
                    }
                    const gapCount = getPatientNeeds(p.id).filter(n => n.status !== "COMPLETED").length;
                    const status = getPatientStatus(p.id, selectedList!);
                    return `"${p.name}","${p.provider}","${p.riskTier}",${p.openHccCount},${gapCount},"${status}"`;
                  }).join("\n");
                  const blob = new Blob([header + rows], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${name.replace(/\s+/g, "_")}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Exported as CSV");
                }}><Download className="h-4 w-4 mr-1" />Export</Button>
              </div>
            </div>

            {/* Progress */}
            {(() => {
              const stats = selectedList?.stats || selectedCampaign?.stats;
              if (!stats) return null;
              const worked = stats.total - stats.remaining;
              return (
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      {selectedCampaign ? <Zap className="h-4 w-4 text-primary" /> : <Trophy className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Your Progress</p>
                      <p className="text-xs text-muted-foreground">
                        {worked} of {stats.total} patients worked · {stats.scheduled} scheduled
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">{worked}</span>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">of {stats.total} worked</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-16">Worked</span>
                      <Progress value={stats.total > 0 ? Math.round((worked / stats.total) * 100) : 0} className="h-2 flex-1" />
                      <span className="text-xs font-medium w-20 text-right">{worked} / {stats.total}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-16">Scheduled</span>
                      <Progress value={stats.total > 0 ? Math.round((stats.scheduled / stats.total) * 100) : 0} className="h-2 flex-1 [&>div]:bg-chart-2" />
                      <span className="text-xs font-medium w-20 text-right">{stats.scheduled} / {stats.total}</span>
                    </div>
                  </div>

                  {/* Campaign SLA breakdown */}
                  {selectedCampaign && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full bg-chart-2" />
                        <span className="text-muted-foreground">On Track</span>
                        <span className="font-semibold">{selectedCampaign.stats.onTrack}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full bg-warning" />
                        <span className="text-muted-foreground">At Risk</span>
                        <span className="font-semibold">{selectedCampaign.stats.atRisk}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full bg-destructive" />
                        <span className="text-muted-foreground">Overdue</span>
                        <span className="font-semibold">{selectedCampaign.stats.overdue}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* KPIs and Filter (lists only) */}
            {selectedList && (
              <>
                <div className="flex items-center gap-3">
                  <TopKPIBar items={[
                    { label: "Total", value: selectedList.stats.total },
                    { label: "Remaining", value: selectedList.stats.remaining },
                    { label: "Attempted", value: selectedList.stats.attempted },
                    { label: "Connected", value: selectedList.stats.connected },
                    { label: "Scheduled", value: selectedList.stats.scheduled },
                  ]} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Filter:</span>
                  {(["all", "remaining", "attempted", "connected", "scheduled"] as StatusFilter[]).map(s => (
                    <Button
                      key={s}
                      variant={statusFilter === s ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs capitalize"
                      onClick={() => setStatusFilter(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </>
            )}

            {/* Campaign KPIs */}
            {selectedCampaign && (
              <TopKPIBar items={[
                { label: "Total", value: selectedCampaign.stats.total },
                { label: "Remaining", value: selectedCampaign.stats.remaining },
                { label: "On Track", value: selectedCampaign.stats.onTrack },
                { label: "At Risk", value: selectedCampaign.stats.atRisk },
                { label: "Overdue", value: selectedCampaign.stats.overdue },
              ]} />
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead><SortButton k="risk" label="Risk" /></TableHead>
                  {selectedCampaign && <TableHead>Attribution Date</TableHead>}
                  {selectedCampaign && <TableHead>SLA Due</TableHead>}
                  {selectedCampaign && <TableHead>SLA Status</TableHead>}
                  {selectedList && <TableHead><SortButton k="openHcc" label="Open HCCs" /></TableHead>}
                  {selectedList && <TableHead><SortButton k="gaps" label="Open Gaps" /></TableHead>}
                  {selectedList && <TableHead>Status</TableHead>}
                  <TableHead>Last Outreach</TableHead>
                  <TableHead>Last AWV</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listPatients.map(p => {
                  const gapCount = getPatientNeeds(p.id).filter(n => n.status !== "COMPLETED").length;
                  const lastOutreach = getPatientOutreach(p.id)[0];
                  const cp = selectedCampaign ? getCampaignPatient(p.id) : null;

                  // SLA styling
                  const slaColors: Record<string, string> = {
                    on_track: "bg-chart-2/10 text-chart-2 border-chart-2/30",
                    at_risk: "bg-warning/10 text-warning border-warning/30",
                    overdue: "bg-destructive/10 text-destructive border-destructive/30",
                    completed: "bg-success/10 text-success border-success/30",
                  };

                  // Days remaining for SLA
                  const daysLeft = cp ? differenceInDays(parseISO(cp.slaDueDate), new Date()) : null;

                  const status = selectedList ? getPatientStatus(p.id, selectedList) : null;
                  const statusColors: Record<string, string> = {
                    remaining: "bg-muted text-muted-foreground",
                    attempted: "bg-warning/10 text-warning border-warning/30",
                    connected: "bg-info/10 text-info border-info/30",
                    scheduled: "bg-success/10 text-success border-success/30",
                  };
                  return (
                    <TableRow
                      key={p.id}
                      className={cn("cursor-pointer", selectedPatient?.id === p.id && "bg-primary/5")}
                      onClick={() => setSelectedPatient(p)}
                    >
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-sm">{p.provider}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{p.riskTier.replace("_", " ")}</Badge></TableCell>

                      {/* Campaign-specific columns */}
                      {selectedCampaign && cp && (
                        <>
                          <TableCell className="text-sm">{cp.triggeredAt}</TableCell>
                          <TableCell className="text-sm">
                            <span className={cn(
                              daysLeft !== null && daysLeft < 0 && "text-destructive font-medium",
                              daysLeft !== null && daysLeft >= 0 && daysLeft <= 5 && "text-warning font-medium"
                            )}>
                              {cp.slaDueDate}
                              {daysLeft !== null && (
                                <span className="ml-1 text-xs">
                                  ({daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`})
                                </span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("capitalize text-xs", slaColors[cp.slaStatus])}>
                              {cp.slaStatus.replace("_", " ")}
                            </Badge>
                          </TableCell>
                        </>
                      )}

                      {/* List-specific columns */}
                      {selectedList && (
                        <>
                          <TableCell>{p.openHccCount}</TableCell>
                          <TableCell><Badge variant="secondary">{gapCount}</Badge></TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("capitalize text-xs", statusColors[status || ""])}>
                              {status}
                            </Badge>
                          </TableCell>
                        </>
                      )}

                      <TableCell className="text-sm text-muted-foreground">
                        {lastOutreach ? (
                          <span title={lastOutreach.outcome}>{lastOutreach.timestamp.slice(0, 10)}</span>
                        ) : (
                          <span className="text-destructive text-xs">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.lastAWV || <span className="text-destructive text-xs">None</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCallPatient(p)}><Phone className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSchedulePatient(p); setScheduleDate(""); setScheduleVisitType(""); setScheduleNotes(""); }}><Calendar className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {listPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={selectedCampaign ? 9 : 9} className="text-center py-8 text-muted-foreground">
                      No patients match the selected filter
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center space-y-2">
            <List className="h-10 w-10 mx-auto opacity-40" />
            <p>Select a chase list or campaign to get started</p>
          </div>
        </div>
      )}

      {/* Patient Drawer */}
      {selectedPatient && (
        <PatientDrawer
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onStartCall={(patient) => setCallPatient(patient)}
        />
      )}
      {callPatient && (
        <CallWorkspaceModal
          open={!!callPatient}
          onOpenChange={o => !o && setCallPatient(null)}
          patient={callPatient}
          onLogAndNext={() => {
            const idx = listPatients.findIndex(p => p.id === callPatient.id);
            const next = listPatients[idx + 1];
            if (next) {
              setCallPatient(next);
            } else {
              setCallPatient(null);
            }
          }}
        />
      )}

      {/* Schedule Dialog */}
      <Dialog open={!!schedulePatient} onOpenChange={o => !o && setSchedulePatient(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule — {schedulePatient?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
              <p>{schedulePatient?.phone} · {schedulePatient?.practice} · {schedulePatient?.provider}</p>
            </div>
            <div className="space-y-2">
              <Label>Visit Type</Label>
              <Select value={scheduleVisitType} onValueChange={setScheduleVisitType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visit type…" />
                </SelectTrigger>
                <SelectContent>
                  {["AWV", "Follow-up", "New Patient", "Telehealth", "Lab/Screening", "Specialist Referral"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date & Time</Label>
              <Input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={scheduleNotes} onChange={e => setScheduleNotes(e.target.value)} placeholder="Scheduling notes…" className="h-20" />
            </div>
          </div>
          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setSchedulePatient(null)}>Cancel</Button>
            <Button
              disabled={!scheduleVisitType || !scheduleDate}
              onClick={() => {
                toast.success(`${scheduleVisitType} scheduled for ${schedulePatient?.name}`, {
                  description: new Date(scheduleDate).toLocaleString(),
                });
                setSchedulePatient(null);
              }}
            >
              Confirm Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
