import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { buildPopulationRecords, tierLabels, tierColors, type CareTier } from "@/data/populationData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Users, ArrowUpDown, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

const tierOrder: CareTier[] = [4, 3, 2, 1];

export default function PopulationView() {
  const navigate = useNavigate();
  const allRecords = useMemo(() => buildPopulationRecords(), []);

  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"acuity" | "needs" | "lastTouched">("acuity");
  const [sortAsc, setSortAsc] = useState(false);

  const owners = useMemo(() => [...new Set(allRecords.map(r => r.assignedOwner))].sort(), [allRecords]);

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
  }, [allRecords, search, tierFilter, ownerFilter, sortField, sortAsc]);

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

  const handleMoveTier = (patientName: string, newTier: CareTier) => {
    toast.success(`${patientName} moved to Tier ${newTier} — ${tierLabels[newTier]}`);
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
                  <TableHead className="w-[120px]"></TableHead>
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
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="text-xs" onClick={e => { e.stopPropagation(); navigate(`/patients/${r.patient.id}`); }}>
                          View
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-xs px-2" onClick={e => e.stopPropagation()} title="Move to different tier">
                              <ArrowRightLeft className="h-3.5 w-3.5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2" align="end" onClick={e => e.stopPropagation()}>
                            <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Move to tier</p>
                            {tierOrder.filter(t => t !== r.careTier).map(t => (
                              <button
                                key={t}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors text-left"
                                onClick={() => handleMoveTier(r.patient.name, t)}
                              >
                                <Badge variant="outline" className={`${tierColors[t]} text-[10px] px-1.5`}>T{t}</Badge>
                                <span>{tierLabels[t]}</span>
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
