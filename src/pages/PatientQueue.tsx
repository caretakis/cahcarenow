import { useState, useMemo } from "react";
import { patients, Patient } from "@/data/sampleData";
import { PatientDrawer } from "@/components/PatientDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Search, Phone, Calendar } from "lucide-react";

const riskColor: Record<string, string> = {
  Low: "bg-success/15 text-success border-success/30",
  Medium: "bg-warning/15 text-warning border-warning/30",
  High: "bg-accent/15 text-accent border-accent/30",
  Critical: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function PatientQueue() {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [riskFilters, setRiskFilters] = useState<string[]>([]);
  const [pcpFilters, setPcpFilters] = useState<string[]>([]);

  const pcps = useMemo(() => [...new Set(patients.map((p) => p.pcp))], []);

  const toggleRisk = (level: string) => {
    setRiskFilters((prev) =>
      prev.includes(level) ? prev.filter((r) => r !== level) : [...prev, level]
    );
  };
  const togglePcp = (pcp: string) => {
    setPcpFilters((prev) =>
      prev.includes(pcp) ? prev.filter((r) => r !== pcp) : [...prev, pcp]
    );
  };

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (riskFilters.length > 0 && !riskFilters.includes(p.riskLevel)) return false;
      if (pcpFilters.length > 0 && !pcpFilters.includes(p.pcp)) return false;
      return true;
    });
  }, [search, riskFilters, pcpFilters]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Filters pane */}
      <aside className="w-56 border-r bg-card p-5 space-y-6 shrink-0 overflow-y-auto hidden lg:block">
        <div>
          <h3 className="text-sm font-semibold mb-3">Risk Level</h3>
          <div className="space-y-2">
            {["Critical", "High", "Medium", "Low"].map((level) => (
              <label key={level} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={riskFilters.includes(level)}
                  onCheckedChange={() => toggleRisk(level)}
                />
                <span>{level}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-3">Provider</h3>
          <div className="space-y-2">
            {pcps.map((pcp) => (
              <label key={pcp} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={pcpFilters.includes(pcp)}
                  onCheckedChange={() => togglePcp(pcp)}
                />
                <span>{pcp.replace("Dr. ", "")}</span>
              </label>
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => { setRiskFilters([]); setPcpFilters([]); }}
        >
          Clear filters
        </Button>
      </aside>

      {/* Table pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-5 pb-3 border-b flex items-center gap-4">
          <h1 className="text-xl font-bold whitespace-nowrap">Patient Queue</h1>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-sm text-muted-foreground">{filtered.length} patients</span>
        </div>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead className="hidden md:table-cell">PCP</TableHead>
                <TableHead className="hidden md:table-cell">Gaps</TableHead>
                <TableHead className="hidden sm:table-cell">Next Visit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow
                  key={p.id}
                  className={`cursor-pointer ${selectedPatient?.id === p.id ? "bg-primary/5" : ""}`}
                  onClick={() => setSelectedPatient(p)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.age}{p.gender} · {p.insurance}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={riskColor[p.riskLevel]}>{p.riskLevel}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{p.pcp}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary">{p.gaps.length}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{p.nextVisit}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Calendar className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Drawer pane */}
      {selectedPatient && (
        <PatientDrawer patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      )}
    </div>
  );
}
