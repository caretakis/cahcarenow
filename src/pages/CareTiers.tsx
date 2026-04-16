import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { buildPopulationRecords, tierLabels, tierColors, tierOwnerRole, tierCadence, type CareTier } from "@/data/populationData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Check, Users, Activity, Clock } from "lucide-react";

const tierOrder: CareTier[] = [4, 3, 2, 1];
const noContactThreshold: Record<CareTier, number> = { 4: 30, 3: 90, 2: 180, 1: 365 };

export default function CareTiers() {
  const navigate = useNavigate();
  const allRecords = useMemo(() => buildPopulationRecords(), []);

  const [reviewPatientId, setReviewPatientId] = useState<string | null>(null);
  const reviewRecord = allRecords.find(r => r.patient.id === reviewPatientId);

  // Tier summary cards
  const tierStats = useMemo(() => {
    return tierOrder.map(tier => {
      const recs = allRecords.filter(r => r.careTier === tier);
      const flagged = recs.filter(r => r.tierFit !== "appropriate");
      const noContact = recs.filter(r => {
        if (!r.lastTouched) return true;
        const days = Math.floor((Date.now() - new Date(r.lastTouched).getTime()) / 86400000);
        return days > noContactThreshold[tier];
      });
      const avgAcuity = recs.length > 0 ? Math.round(recs.reduce((s, r) => s + r.acuityScore, 0) / recs.length * 10) / 10 : 0;
      return { tier, total: recs.length, flagged: flagged.length, noContact: noContact.length, avgAcuity };
    });
  }, [allRecords]);

  // Flagged patients
  const flaggedRecords = useMemo(() =>
    allRecords.filter(r => r.tierFit !== "appropriate").sort((a, b) => b.acuityScore - a.acuityScore),
  [allRecords]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Care Tiers</h1>
        <p className="text-muted-foreground text-sm">Tier health across the attributed population — review flagged patients</p>
      </div>

      {/* Tier health cards - softer colors */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tierStats.map(ts => (
          <Card key={ts.tier}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`${tierColors[ts.tier]} text-xs font-bold`}>Tier {ts.tier}</Badge>
                <span className="text-xs text-muted-foreground">{tierLabels[ts.tier]}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-lg font-bold">{ts.total}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Patients</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    <span className="text-lg font-bold text-warning">{ts.flagged}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Flagged</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-lg font-bold">{ts.avgAcuity}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Avg acuity</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-lg font-bold">{ts.noContact}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">No contact</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">{tierOwnerRole[ts.tier]} · {tierCadence[ts.tier]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Flagged patients table */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Flagged for Tier Review ({flaggedRecords.length})
        </h2>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Patient</TableHead>
                <TableHead className="w-[100px]">Current Tier</TableHead>
                <TableHead className="w-[110px]">Suggested</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="w-[90px]">Acuity</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flaggedRecords.map(r => {
                const suggestedTier = r.tierFit === "review_upgrade" ? Math.min(4, r.careTier + 1) as CareTier
                  : r.tierFit === "review_downgrade" ? Math.max(1, r.careTier - 1) as CareTier
                  : (r.careTier >= 3 ? r.careTier : 3) as CareTier;
                return (
                  <TableRow key={r.patient.id}>
                    <TableCell className="font-medium">{r.patient.name}</TableCell>
                    <TableCell><Badge variant="outline" className={`${tierColors[r.careTier]} text-[10px]`}>Tier {r.careTier}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground border-border">Tier {suggestedTier}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[250px]">{r.tierFitReason}</TableCell>
                    <TableCell className="text-sm">{r.assignedOwner}</TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{r.acuityScore}</span>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => setReviewPatientId(r.patient.id)}>
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {flaggedRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    <Check className="h-5 w-5 mx-auto mb-2 text-success" />
                    All patients appropriately tiered
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Tier review side panel */}
      <Sheet open={!!reviewPatientId} onOpenChange={(open) => !open && setReviewPatientId(null)}>
        <SheetContent className="sm:max-w-lg">
          {reviewRecord && (
            <>
              <SheetHeader>
                <SheetTitle>Tier Review: {reviewRecord.patient.name}</SheetTitle>
                <SheetDescription>Review and adjust care tier assignment</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Tier</p>
                    <Badge variant="outline" className={`${tierColors[reviewRecord.careTier]} text-sm`}>Tier {reviewRecord.careTier} — {tierLabels[reviewRecord.careTier]}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Acuity Score</p>
                    <p className="text-2xl font-bold">{reviewRecord.acuityScore} <span className="text-sm text-muted-foreground font-normal">/ 10</span></p>
                  </div>
                </div>
                <div className="border rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">Acuity Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>RAF Score: <span className="font-medium">{reviewRecord.rafScore}</span></div>
                    <div>HCC Count: <span className="font-medium">{reviewRecord.patient.hccCount}</span></div>
                    <div>Admits (12mo): <span className="font-medium">{reviewRecord.admitsLast12mo}</span></div>
                    <div>ED Visits (12mo): <span className="font-medium">{reviewRecord.edVisitsLast12mo}</span></div>
                    <div>Open Gaps: <span className="font-medium">{reviewRecord.patient.openQualityGaps}</span></div>
                    <div>Open Needs: <span className="font-medium">{reviewRecord.openNeedsCount}</span></div>
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-warning/5 border-warning/20">
                  <p className="text-sm font-medium flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-warning" /> Reason Flagged</p>
                  <p className="text-sm text-muted-foreground mt-1">{reviewRecord.tierFitReason}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current Owner</p>
                  <p className="text-sm font-medium">{reviewRecord.assignedOwner}</p>
                </div>
                <div className="border-t pt-4 space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setReviewPatientId(null)}>
                    <Check className="h-4 w-4 mr-2" /> Confirm current tier (dismiss flag)
                  </Button>
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Move to tier…" /></SelectTrigger>
                      <SelectContent>
                        {tierOrder.filter(t => t !== reviewRecord.careTier).map(t => (
                          <SelectItem key={t} value={String(t)}>Tier {t} — {tierLabels[t]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => setReviewPatientId(null)}>Apply</Button>
                  </div>
                </div>
                <Button variant="link" className="text-xs px-0" onClick={() => { setReviewPatientId(null); navigate(`/patients/${reviewRecord.patient.id}`); }}>
                  View full patient record →
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
