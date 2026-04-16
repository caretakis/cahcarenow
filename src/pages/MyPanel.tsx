import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { buildPopulationRecords, tierColors, type CareTier } from "@/data/populationData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Clock, Phone, CalendarCheck, CheckCircle2 } from "lucide-react";

export default function MyPanel() {
  const navigate = useNavigate();
  const allRecords = useMemo(() => buildPopulationRecords(), []);

  // Simulate "my" patients — for demo, show patients assigned to current role's likely owner
  // In production this would filter by auth user
  const myRecords = useMemo(() =>
    [...allRecords].sort((a, b) => b.urgencyScore - a.urgencyScore),
  [allRecords]);

  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cardFilter, setCardFilter] = useState<string | null>(null);

  const overduePts = myRecords.filter(r => r.nextActionDue && r.nextActionDue < "2026-04-16");
  const noContactPts = myRecords.filter(r => {
    if (!r.lastTouched) return r.careTier >= 3;
    const days = Math.floor((Date.now() - new Date(r.lastTouched).getTime()) / 86400000);
    return (r.careTier === 4 && days > 30) || (r.careTier === 3 && days > 90);
  });
  const tocDuePts = myRecords.filter(r => r.nextAction?.includes("TOC") || r.nextAction?.includes("Interactive Contact") || r.nextAction?.includes("Discharged"));
  const scheduledToday = myRecords.filter(r => r.nextActionDue === "2026-04-16");

  const filtered = useMemo(() => {
    let result = myRecords;
    if (cardFilter === "overdue") result = overduePts;
    else if (cardFilter === "toc") result = tocDuePts;
    else if (cardFilter === "no_contact") result = noContactPts;
    else if (cardFilter === "today") result = scheduledToday;
    
    if (tierFilter !== "all") result = result.filter(r => r.careTier === Number(tierFilter));
    if (statusFilter === "overdue") result = result.filter(r => r.nextActionDue && r.nextActionDue < "2026-04-16");
    if (statusFilter === "on_track") result = result.filter(r => !r.nextActionDue || r.nextActionDue >= "2026-04-16");
    return result;
  }, [myRecords, tierFilter, statusFilter, cardFilter, overduePts, tocDuePts, noContactPts, scheduledToday]);

  // Priority cards
  const overduePts = myRecords.filter(r => r.nextActionDue && r.nextActionDue < "2026-04-16");
  const noContactPts = myRecords.filter(r => {
    if (!r.lastTouched) return r.careTier >= 3;
    const days = Math.floor((Date.now() - new Date(r.lastTouched).getTime()) / 86400000);
    return (r.careTier === 4 && days > 30) || (r.careTier === 3 && days > 90);
  });
  const tocDuePts = myRecords.filter(r => r.nextAction?.includes("TOC") || r.nextAction?.includes("Interactive Contact") || r.nextAction?.includes("Discharged"));
  const scheduledToday = myRecords.filter(r => r.nextActionDue === "2026-04-16");

  const getStatus = (r: typeof myRecords[0]) => {
    if (r.nextActionDue && r.nextActionDue < "2026-04-16") return "overdue";
    if (r.nextActionDue && r.nextActionDue <= "2026-04-20") return "attention";
    return "on_track";
  };

  const statusBadge = (status: string) => {
    if (status === "overdue") return <Badge variant="destructive" className="text-[10px]">Overdue</Badge>;
    if (status === "attention") return <Badge className="bg-amber-500 text-white text-[10px]">Needs attention</Badge>;
    return <Badge variant="secondary" className="text-[10px]">On track</Badge>;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Panel</h1>
        <p className="text-muted-foreground text-sm">Your patients, sorted by urgency — what needs attention today</p>
      </div>

      {/* Priority cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-destructive/30">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{overduePts.length}</p>
              <p className="text-xs text-muted-foreground">Overdue tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tocDuePts.length}</p>
              <p className="text-xs text-muted-foreground">TOC actions due</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{noContactPts.length}</p>
              <p className="text-xs text-muted-foreground">No recent contact</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <CalendarCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{scheduledToday.length}</p>
              <p className="text-xs text-muted-foreground">Callbacks today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tier" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            <SelectItem value="4">Tier 4</SelectItem>
            <SelectItem value="3">Tier 3</SelectItem>
            <SelectItem value="2">Tier 2</SelectItem>
            <SelectItem value="1">Tier 1</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="on_track">On track</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} patients in panel</span>
      </div>

      {/* Panel table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[180px]">Patient</TableHead>
              <TableHead className="w-[70px]">Tier</TableHead>
              <TableHead>Next Action</TableHead>
              <TableHead className="w-[100px]">Due</TableHead>
              <TableHead className="w-[70px]">Needs</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(r => {
              const status = getStatus(r);
              return (
                <TableRow key={r.patient.id} className="cursor-pointer hover:bg-muted/20" onClick={() => navigate(`/patients/${r.patient.id}`)}>
                  <TableCell className="font-medium">{r.patient.name}</TableCell>
                  <TableCell>
                    <Badge className={`${tierColors[r.careTier]} text-[10px] px-1.5`}>T{r.careTier}</Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-[250px]">
                    <span className={status === "overdue" ? "text-destructive font-medium" : ""}>
                      {r.nextAction}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.nextActionDue || "—"}</TableCell>
                  <TableCell className="text-sm font-medium">{r.openNeedsCount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.lastTouched || "Never"}</TableCell>
                  <TableCell>{statusBadge(status)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={e => { e.stopPropagation(); }}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Complete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
