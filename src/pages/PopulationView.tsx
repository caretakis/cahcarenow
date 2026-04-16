import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { buildPopulationRecords, tierLabels, tierColors, type CareTier } from "@/data/populationData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TierChangeDialog } from "@/components/TierChangeDialog";
import { Search, Users, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

const tierOrder: CareTier[] = [4, 3, 2, 1];

export default function PopulationView() {
  const navigate = useNavigate();
  const allRecords = useMemo(() => buildPopulationRecords(), []);

  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [practiceFilter, setPracticeFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"acuity" | "needs" | "lastTouched">("acuity");
  const [sortAsc, setSortAsc] = useState(false);

  // Tier change dialog state
  const [tierChangeTarget, setTierChangeTarget] = useState<{ patientId: string; patientName: string; currentTier: CareTier; newTier: CareTier } | null>(null);

  const owners = useMemo(() => [...new Set(allRecords.map(r => r.assignedOwner))].sort(), [allRecords]);
  const practices = useMemo(() => [...new Set(allRecords.map(r => r.patient.practice))].sort(), [allRecords]);
  const providers = useMemo(() => {
    let records = allRecords;
    if (practiceFilter !== "all") records = records.filter(r => r.patient.practice === practiceFilter);
    return [...new Set(records.map(r => r.patient.provider))].sort();
  }, [allRecords, practiceFilter]);

  const filtered = useMemo(() => {
    let result = allRecords;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(r => r.patient.name.toLowerCase().includes(s) || r.patient.id.includes(s));
    }
    if (tierFilter !== "all") {
      result = result.filter(r => r.careTier === Number(tierFilter));
    }
    if (ownerFilter !== "all") {
      result = result.filter(r => r.assignedOwner === ownerFilter);
    }
    if (practiceFilter !== "all") {
      result = result.filter(r => r.patient.practice === practiceFilter);
    }
    if (providerFilter !== "all") {
      result = result.filter(r => r.patient.provider === providerFilter);
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "acuity") cmp = b.acuityScore - a.acuityScore;
      else if (sortField === "needs") cmp = b.openNeedsCount - a.openNeedsCount;
      else if (sortField === "lastTouched") {
        const aDate = a.lastTouched || "1970-01-01";
        const bDate = b.lastTouched || "1970-01-01";
        cmp = aDate.localeCompare(bDate);
      }
      return sortAsc ? -cmp : cmp;
    });
    return result;
  }, [allRecords, search, tierFilter, ownerFilter, practiceFilter, providerFilter, sortField, sortAsc]);

  const grouped = useMemo(() => {
    if (tierFilter !== "all") return [{ tier: Number(tierFilter) as CareTier, records: filtered }];
    return tierOrder.map(tier => ({
      tier,
      records: filtered.filter(r => r.careTier === tier),
    })).filter(g => g.records.length > 0);
  }, [filtered, tierFilter]);

  const tierCounts = useMemo(() => {
    const counts: Record<CareTier, number> = { 4: 0, 3: 0, 2: 0, 1: 0 };
    allRecords.forEach(r => { counts[r.careTier]++; });
    return counts;
  }, [allRecords]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Population</h1>
        <p className="text-muted-foreground text-sm">Attributed population stratified by care tier</p>
      </div>

      {/* Tier summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tierOrder.map(tier => (
          <Card
            key={tier}
            className={`cursor-pointer transition-shadow hover:shadow-md ${tierFilter === String(tier) ? "ring-2 ring-primary/50" : ""}`}
            onClick={() => setTierFilter(tierFilter === String(tier) ? "all" : String(tier))}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className={`${tierColors[tier]} text-xs font-bold`}>Tier {tier}</Badge>
              </div>
              <p className="text-2xl font-bold">{tierCounts[tier]}</p>
              <p className="text-xs text-muted-foreground">{tierLabels[tier]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={practiceFilter} onValueChange={(v) => { setPracticeFilter(v); setProviderFilter("all"); }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Practice" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All practices</SelectItem>
            {practices.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={providerFilter} onValueChange={setProviderFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Provider" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem>
            {providers.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Assigned owner" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All owners</SelectItem>
            {owners.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {filtered.length} patients
        </div>
      </div>

      {/* Tiered table */}
      {grouped.map(({ tier, records }) => (
        <div key={tier}>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={`${tierColors[tier]} text-xs font-bold`}>Tier {tier}</Badge>
            <span className="text-sm font-medium text-muted-foreground">{tierLabels[tier]}</span>
            <span className="text-xs text-muted-foreground">({records.length})</span>
          </div>
          <div className="rounded-lg border overflow-hidden mb-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[180px]">Patient</TableHead>
                  <TableHead className="w-[70px]">Tier</TableHead>
                  <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort("acuity")}>
                    <span className="flex items-center gap-1">Acuity <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead>Active Program</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="w-[80px] cursor-pointer" onClick={() => handleSort("needs")}>
                    <span className="flex items-center gap-1">Needs <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("lastTouched")}>
                    <span className="flex items-center gap-1">Last Touched <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map(r => (
                  <TableRow key={r.patient.id} className="cursor-pointer hover:bg-muted/20" onClick={() => navigate(`/patients/${r.patient.id}`)}>
                    <TableCell className="font-medium">{r.patient.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${tierColors[r.careTier]} text-[10px] px-1.5`}>T{r.careTier}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{r.acuityScore}</span>
                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${r.acuityScore * 10}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{r.activeProgram || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-sm">{r.assignedOwner}</TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${r.openNeedsCount > 2 ? "text-destructive" : ""}`}>
                        {r.openNeedsCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.lastTouched || "Never"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                        {r.careTier < 4 && (
                          <Button size="sm" variant="ghost" className="px-1.5 h-7" title={`Move up to Tier ${r.careTier + 1}`}
                            onClick={() => setTierChangeTarget({ patientId: r.patient.id, patientName: r.patient.name, currentTier: r.careTier, newTier: (r.careTier + 1) as CareTier })}>
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {r.careTier > 1 && (
                          <Button size="sm" variant="ghost" className="px-1.5 h-7" title={`Move down to Tier ${r.careTier - 1}`}
                            onClick={() => setTierChangeTarget({ patientId: r.patient.id, patientName: r.patient.name, currentTier: r.careTier, newTier: (r.careTier - 1) as CareTier })}>
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}

      {/* Tier change justification dialog */}
      {tierChangeTarget && (
        <TierChangeDialog
          open={!!tierChangeTarget}
          onOpenChange={(open) => !open && setTierChangeTarget(null)}
          patientId={tierChangeTarget.patientId}
          patientName={tierChangeTarget.patientName}
          currentTier={tierChangeTarget.currentTier}
          newTier={tierChangeTarget.newTier}
        />
      )}
    </div>
  );
}
