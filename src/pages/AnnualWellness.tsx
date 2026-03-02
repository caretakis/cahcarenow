import { useState, useMemo } from "react";
import { patients, Patient } from "@/data/sampleData";
import { PatientDrawer } from "@/components/PatientDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Search, Calendar, Phone } from "lucide-react";

const awvStatusColor: Record<string, string> = {
  Completed: "bg-success/15 text-success border-success/30",
  Scheduled: "bg-info/15 text-info border-info/30",
  Due: "bg-warning/15 text-warning border-warning/30",
  Overdue: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function AnnualWellness() {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  const toggleStatus = (s: string) => {
    setStatusFilters((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      if (!p.awvStatus) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilters.length > 0 && !statusFilters.includes(p.awvStatus)) return false;
      return true;
    });
  }, [search, statusFilters]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Filters */}
      <aside className="w-56 border-r bg-card p-5 space-y-6 shrink-0 overflow-y-auto hidden lg:block">
        <div>
          <h3 className="text-sm font-semibold mb-3">AWV Status</h3>
          <div className="space-y-2">
            {["Overdue", "Due", "Scheduled", "Completed"].map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={statusFilters.includes(s)} onCheckedChange={() => toggleStatus(s)} />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => setStatusFilters([])}
        >
          Clear filters
        </Button>
      </aside>

      {/* Table */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-5 pb-3 border-b flex items-center gap-4">
          <h1 className="text-xl font-bold whitespace-nowrap">Annual Wellness Visits</h1>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="text-sm text-muted-foreground">{filtered.length} patients</span>
        </div>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>AWV Status</TableHead>
                <TableHead className="hidden md:table-cell">PCP</TableHead>
                <TableHead className="hidden md:table-cell">Last Visit</TableHead>
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
                    <Badge variant="outline" className={awvStatusColor[p.awvStatus!]}>{p.awvStatus}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{p.pcp}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{p.lastVisit}</TableCell>
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

      {selectedPatient && (
        <PatientDrawer patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      )}
    </div>
  );
}
