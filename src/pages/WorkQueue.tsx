import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { patients, needs, queueDefinitions, getPatientNeeds } from "@/data/sampleData";
import type { Patient } from "@/data/models";
import { PatientDrawer } from "@/components/PatientDrawer";
import { TopKPIBar } from "@/components/TopKPIBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Search, Phone, Calendar, Clock, UserPlus } from "lucide-react";
import { CallWorkspaceModal } from "@/components/CallWorkspaceModal";

const riskColors: Record<string, string> = {
  low: "bg-success/15 text-success border-success/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-accent/15 text-accent border-accent/30",
  very_high: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function WorkQueue() {
  const { queueId } = useParams();
  const queue = queueDefinitions.find(q => q.id === queueId);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [riskFilters, setRiskFilters] = useState<string[]>([]);
  const [practiceFilters, setPracticeFilters] = useState<string[]>([]);

  const practices = useMemo(() => [...new Set(patients.map(p => p.practice))], []);

  // Get patients with open needs, sorted by impact score
  const queuePatients = useMemo(() => {
    const patientsWithNeeds = patients.map(p => {
      const pNeeds = getPatientNeeds(p.id).filter(n => n.status !== "COMPLETED" && n.status !== "NOT_APPLICABLE");
      const topImpact = pNeeds.length > 0 ? Math.max(...pNeeds.map(n => n.impactScore)) : 0;
      const whyInQueue = pNeeds.length > 0 ? pNeeds.sort((a, b) => b.impactScore - a.impactScore)[0].subtype.replace(/_/g, " ") : "";
      return { ...p, openNeeds: pNeeds, impactScore: topImpact, whyInQueue, gapCount: pNeeds.length };
    }).filter(p => p.openNeeds.length > 0);
    return patientsWithNeeds.sort((a, b) => b.impactScore - a.impactScore);
  }, []);

  const filtered = useMemo(() => {
    return queuePatients.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (riskFilters.length > 0 && !riskFilters.includes(p.riskTier)) return false;
      if (practiceFilters.length > 0 && !practiceFilters.includes(p.practice)) return false;
      return true;
    });
  }, [search, riskFilters, practiceFilters, queuePatients]);

  const toggleRisk = (v: string) => setRiskFilters(prev => prev.includes(v) ? prev.filter(r => r !== v) : [...prev, v]);
  const togglePractice = (v: string) => setPracticeFilters(prev => prev.includes(v) ? prev.filter(r => r !== v) : [...prev, v]);

  const kpis = [
    { label: "Total in Queue", value: filtered.length },
    { label: "High/Very High", value: filtered.filter(p => p.riskTier === "high" || p.riskTier === "very_high").length, urgent: true },
    { label: "Avg Impact", value: filtered.length > 0 ? Math.round(filtered.reduce((s, p) => s + p.impactScore, 0) / filtered.length) : 0 },
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Filters */}
      <aside className="w-56 border-r bg-card p-5 space-y-6 shrink-0 overflow-y-auto hidden lg:block">
        <div>
          <h3 className="text-sm font-semibold mb-3">Risk Tier</h3>
          <div className="space-y-2">
            {["very_high", "high", "medium", "low"].map(level => (
              <label key={level} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={riskFilters.includes(level)} onCheckedChange={() => toggleRisk(level)} />
                <span className="capitalize">{level.replace("_", " ")}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-3">Practice</h3>
          <div className="space-y-2">
            {practices.map(p => (
              <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={practiceFilters.includes(p)} onCheckedChange={() => togglePractice(p)} />
                <span className="text-xs">{p}</span>
              </label>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setRiskFilters([]); setPracticeFilters([]); }}>
          Clear filters
        </Button>
      </aside>

      {/* Table */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-5 pb-3 space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold whitespace-nowrap">{queue?.title || "Work Queue"}</h1>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search patients…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span className="text-sm text-muted-foreground">{filtered.length} patients</span>
          </div>
          <TopKPIBar items={kpis} />
        </div>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Practice</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Why in Queue</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => {
                const topNeed = p.openNeeds[0];
                return (
                  <TableRow key={p.id} className={`cursor-pointer ${selectedPatient?.id === p.id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedPatient(p)}>
                    <TableCell>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.provider} · {p.payer}</p>
                    </TableCell>
                    <TableCell className="text-sm">{p.practice}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={riskColors[p.riskTier]}>
                        {p.riskTier.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{p.impactScore}</span>
                    </TableCell>
                    <TableCell className="text-sm capitalize">{p.whyInQueue}</TableCell>
                    <TableCell className="text-sm">{topNeed?.dueDate || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Calendar className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Clock className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><UserPlus className="h-3.5 w-3.5" /></Button>
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
    </div>
  );
}
