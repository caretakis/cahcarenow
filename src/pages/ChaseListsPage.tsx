import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { chaseLists, patients, getPatientNeeds, getPatientOutreach } from "@/data/sampleData";
import type { Patient, ChaseList } from "@/data/models";
import { PatientDrawer } from "@/components/PatientDrawer";
import { TopKPIBar } from "@/components/TopKPIBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Calendar, Download, CheckCircle, ArrowUpDown, Trophy, Plus, List, CalendarIcon } from "lucide-react";
import { CallWorkspaceModal } from "@/components/CallWorkspaceModal";
import { useNavigate } from "react-router-dom";
import { ViewingAsSelector } from "@/components/ViewingAsSelector";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type SortKey = "risk" | "raf" | "gaps";
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

export default function ChaseListsPage() {
  const navigate = useNavigate();
  const [viewingAs, setViewingAs] = useState("me");
  const [callPatient, setCallPatient] = useState<Patient | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialList = searchParams.get("list") || chaseLists[0]?.id || null;
  const [selectedListId, setSelectedListId] = useState<string | null>(initialList);

  useEffect(() => {
    const paramList = searchParams.get("list");
    if (paramList && paramList !== selectedListId) {
      setSelectedListId(paramList);
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

  const selectedList = chaseLists.find(l => l.id === selectedListId) ?? null;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const listPatients = useMemo(() => {
    if (!selectedList) return [];
    let pts = selectedList.patientIds
      .map(id => patients.find(p => p.id === id))
      .filter(Boolean) as Patient[];

    // Status filter
    if (statusFilter !== "all") {
      pts = pts.filter(p => getPatientStatus(p.id, selectedList) === statusFilter);
    }

    if (!sortKey) return pts;
    return [...pts].sort((a, b) => {
      let diff = 0;
      if (sortKey === "risk") diff = riskOrder[a.riskTier] - riskOrder[b.riskTier];
      else if (sortKey === "raf") diff = a.rafOpportunity - b.rafOpportunity;
      else if (sortKey === "gaps") {
        const aGaps = getPatientNeeds(a.id).filter(n => n.status !== "COMPLETED").length;
        const bGaps = getPatientNeeds(b.id).filter(n => n.status !== "COMPLETED").length;
        diff = aGaps - bGaps;
      }
      return sortDir === "desc" ? -diff : diff;
    });
  }, [selectedList, sortKey, sortDir, statusFilter]);

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
          {chaseLists.map(list => {
            const isActive = list.id === selectedListId;
            const worked = list.stats.total - list.stats.remaining;
            const pct = list.stats.total > 0 ? Math.round((worked / list.stats.total) * 100) : 0;
            return (
              <button
                key={list.id}
                onClick={() => {
                  setSelectedListId(list.id);
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
      {selectedList ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="p-5 pb-3 space-y-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">{selectedList.name}</h1>
                <p className="text-sm text-muted-foreground">Created by {selectedList.createdBy} · {selectedList.createdAt}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
              </div>
            </div>

            {/* Progress */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Your Progress</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedList.stats.total - selectedList.stats.remaining} of {selectedList.stats.total} patients worked · {selectedList.stats.scheduled} scheduled
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">{selectedList.stats.total - selectedList.stats.remaining}</span>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">of {selectedList.stats.total} worked</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16">Worked</span>
                  <Progress value={selectedList.stats.total > 0 ? Math.round(((selectedList.stats.total - selectedList.stats.remaining) / selectedList.stats.total) * 100) : 0} className="h-2 flex-1" />
                  <span className="text-xs font-medium w-20 text-right">{selectedList.stats.total - selectedList.stats.remaining} / {selectedList.stats.total}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16">Scheduled</span>
                  <Progress value={selectedList.stats.total > 0 ? Math.round((selectedList.stats.scheduled / selectedList.stats.total) * 100) : 0} className="h-2 flex-1 [&>div]:bg-chart-2" />
                  <span className="text-xs font-medium w-20 text-right">{selectedList.stats.scheduled} / {selectedList.stats.total}</span>
                </div>
              </div>
            </div>

            {/* Status Filter */}
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
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead><SortButton k="risk" label="Risk" /></TableHead>
                  <TableHead><SortButton k="raf" label="RAF Opp" /></TableHead>
                  <TableHead><SortButton k="gaps" label="Open Gaps" /></TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Outreach</TableHead>
                  <TableHead>Last AWV</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listPatients.map(p => {
                  const gapCount = getPatientNeeds(p.id).filter(n => n.status !== "COMPLETED").length;
                  const lastOutreach = getPatientOutreach(p.id)[0];
                  const status = getPatientStatus(p.id, selectedList);
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
                      <TableCell>+{p.rafOpportunity}</TableCell>
                      <TableCell><Badge variant="secondary">{gapCount}</Badge></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("capitalize text-xs", statusColors[status])}>
                          {status}
                        </Badge>
                      </TableCell>
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
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
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
            <p>Select a chase list to get started</p>
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
    </div>
  );
}
