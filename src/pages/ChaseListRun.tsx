import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { chaseLists, patients, getPatientNeeds, getPatientOutreach } from "@/data/sampleData";
import type { Patient } from "@/data/models";
import { PatientDrawer } from "@/components/PatientDrawer";
import { TopKPIBar } from "@/components/TopKPIBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Phone, Calendar, Download, CheckCircle, ArrowUpDown, Trophy } from "lucide-react";
import { CallWorkspaceModal } from "@/components/CallWorkspaceModal";
import { ScheduleDialog } from "@/components/ScheduleDialog";

type SortKey = "risk" | "openHcc" | "gaps";
type SortDir = "asc" | "desc";

const riskOrder: Record<string, number> = { very_high: 4, high: 3, medium: 2, low: 1 };

export default function ChaseListRun() {
  const { listId } = useParams();
  const list = chaseLists.find(l => l.id === listId);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [callPatient, setCallPatient] = useState<Patient | null>(null);
  const [schedulePatient, setSchedulePatient] = useState<Patient | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const listPatients = useMemo(() => {
    if (!list) return [];
    const pts = list.patientIds.map(id => patients.find(p => p.id === id)).filter(Boolean) as Patient[];
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
  }, [list, sortKey, sortDir]);

  if (!list) return <div className="p-8 text-muted-foreground">List not found</div>;

  const completedPct = list.stats.total > 0 ? Math.round(((list.stats.total - list.stats.remaining) / list.stats.total) * 100) : 0;
  const scheduledPct = list.stats.total > 0 ? Math.round((list.stats.scheduled / list.stats.total) * 100) : 0;

  const kpis = [
    { label: "Total", value: list.stats.total },
    { label: "Remaining", value: list.stats.remaining },
    { label: "Attempted", value: list.stats.attempted },
    { label: "Connected", value: list.stats.connected },
    { label: "Scheduled", value: list.stats.scheduled },
  ];

  const SortButton = ({ k, label }: { k: SortKey; label: string }) => (
    <Button variant="ghost" size="sm" className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
      onClick={(e) => { e.stopPropagation(); toggleSort(k); }}>
      {label}
      <ArrowUpDown className={`ml-1 h-3 w-3 ${sortKey === k ? "text-primary" : "opacity-40"}`} />
    </Button>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-5 pb-3 space-y-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{list.name}</h1>
              <p className="text-sm text-muted-foreground">Created by {list.createdBy}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
              <Button variant="outline" size="sm"><CheckCircle className="h-4 w-4 mr-1" />Mark Reviewed</Button>
            </div>
          </div>

          {/* Progress to goal */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-4.5 w-4.5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Your Progress</p>
                <p className="text-xs text-muted-foreground">{list.stats.total - list.stats.remaining} of {list.stats.total} patients worked · {list.stats.scheduled} scheduled</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{list.stats.total - list.stats.remaining}</span>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">of {list.stats.total} worked</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16">Worked</span>
                <Progress value={completedPct} className="h-2 flex-1" />
                <span className="text-xs font-medium w-20 text-right">{list.stats.total - list.stats.remaining} / {list.stats.total}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16">Scheduled</span>
                <Progress value={scheduledPct} className="h-2 flex-1 [&>div]:bg-chart-2" />
                <span className="text-xs font-medium w-20 text-right">{list.stats.scheduled} / {list.stats.total}</span>
              </div>
            </div>
          </div>

          <TopKPIBar items={kpis} />
        </div>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead><SortButton k="risk" label="Risk" /></TableHead>
                <TableHead><SortButton k="openHcc" label="Open HCCs" /></TableHead>
                <TableHead><SortButton k="gaps" label="Open Gaps" /></TableHead>
                <TableHead>Last Outreach</TableHead>
                <TableHead>Last AWV</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listPatients.map(p => {
                const gapCount = getPatientNeeds(p.id).filter(n => n.status !== "COMPLETED").length;
                const lastOutreach = getPatientOutreach(p.id)[0];
                return (
                  <TableRow key={p.id} className={`cursor-pointer ${selectedPatient?.id === p.id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedPatient(p)}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm">{p.provider}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{p.riskTier.replace("_", " ")}</Badge></TableCell>
                    <TableCell>{p.openHccCount}</TableCell>
                    <TableCell><Badge variant="secondary">{gapCount}</Badge></TableCell>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSchedulePatient(p)}><Calendar className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      {selectedPatient && (
        <PatientDrawer patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      )}
      {callPatient && (
        <CallWorkspaceModal open={!!callPatient} onOpenChange={o => !o && setCallPatient(null)} patient={callPatient} />
      )}
      <ScheduleDialog patient={schedulePatient} onClose={() => setSchedulePatient(null)} />
    </div>
  );
}
