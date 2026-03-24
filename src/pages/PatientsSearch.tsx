import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { patients, getPatientNeeds } from "@/data/sampleData";
import type { Patient } from "@/data/models";
import { PatientDrawer } from "@/components/PatientDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Search, Phone, Calendar } from "lucide-react";
import { CallWorkspaceModal } from "@/components/CallWorkspaceModal";
import { ScheduleDialog } from "@/components/ScheduleDialog";
import { useNavigate } from "react-router-dom";

const riskColors: Record<string, string> = {
  low: "bg-success/15 text-success border-success/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-accent/15 text-accent border-accent/30",
  very_high: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function PatientsSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const riskFilter = searchParams.get("risk");
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [callPatient, setCallPatient] = useState<Patient | null>(null);
  const [schedulePatient, setSchedulePatient] = useState<Patient | null>(null);

  const filtered = useMemo(() => {
    let result = patients;
    if (riskFilter) {
      result = result.filter(p => p.riskTier === riskFilter);
    }
    if (!search) return result;
    return result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search));
  }, [search, riskFilter]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-5 pb-3 border-b flex items-center gap-4">
          <h1 className="text-xl font-bold whitespace-nowrap">Patients</h1>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or ID…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="text-sm text-muted-foreground">{filtered.length} patients</span>
        </div>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Practice</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>RAF Opp</TableHead>
                <TableHead>HCCs</TableHead>
                <TableHead>Open Needs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => {
                const needCount = getPatientNeeds(p.id).filter(n => n.status !== "COMPLETED").length;
                return (
                  <TableRow key={p.id} className={`cursor-pointer ${selectedPatient?.id === p.id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedPatient(p)}>
                    <TableCell>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.payer} · {p.address}</p>
                    </TableCell>
                    <TableCell className="text-sm">{p.practice}</TableCell>
                    <TableCell className="text-sm">{p.provider}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={riskColors[p.riskTier]}>
                        {p.riskTier.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">+{p.rafOpportunity}</TableCell>
                    <TableCell>{p.hccCount}</TableCell>
                    <TableCell><Badge variant="secondary">{needCount}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCallPatient(p)}><Phone className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSchedulePatient(p)}><Calendar className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 text-xs"
                          onClick={() => navigate(`/patients/${p.id}`)}>View</Button>
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
