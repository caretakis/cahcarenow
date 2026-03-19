import { useState, useMemo } from "react";
import { medAdherenceRecords, getPatientById } from "@/data/sampleData";
import type { Patient } from "@/data/models";
import { PatientDrawer } from "@/components/PatientDrawer";
import { TopKPIBar } from "@/components/TopKPIBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Phone, Pill, AlertTriangle, RefreshCw } from "lucide-react";
import { ViewingAsSelector } from "@/components/ViewingAsSelector";

const riskColors: Record<string, string> = {
  on_track: "bg-success/10 text-success border-success/30",
  at_risk: "bg-warning/10 text-warning border-warning/30",
  overdue: "bg-destructive/10 text-destructive border-destructive/30",
  no_data: "bg-muted text-muted-foreground",
};

const confidenceColors: Record<string, string> = {
  high: "text-success",
  medium: "text-warning",
  low: "text-accent",
  no_data: "text-muted-foreground",
};

export default function MedAdherenceHome() {
  const [tab, setTab] = useState("at_risk");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewingAs, setViewingAs] = useState("me");

  const records = useMemo(() => {
    const enriched = medAdherenceRecords.map(r => ({ ...r, patient: getPatientById(r.patientId) }));
    switch (tab) {
      case "at_risk": return enriched.filter(r => r.riskLevel === "at_risk" || r.riskLevel === "overdue");
      case "no_data": return enriched.filter(r => r.dataConfidence === "no_data");
      case "all": return enriched;
      default: return enriched;
    }
  }, [tab]);

  const kpis = [
    { label: "At Risk", value: medAdherenceRecords.filter(r => r.riskLevel === "at_risk").length, urgent: true },
    { label: "Overdue", value: medAdherenceRecords.filter(r => r.riskLevel === "overdue").length, urgent: true },
    { label: "On Track", value: medAdherenceRecords.filter(r => r.riskLevel === "on_track").length },
    { label: "No Data", value: medAdherenceRecords.filter(r => r.riskLevel === "no_data").length },
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-5 pb-3 space-y-4 border-b">
          <h1 className="text-xl font-bold">Med Adherence</h1>
          <TopKPIBar items={kpis} />
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="at_risk">At Risk</TabsTrigger>
              <TabsTrigger value="no_data">No Data</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Metric</TableHead>
                <TableHead>Last Fill</TableHead>
                <TableHead>Days Supply</TableHead>
                <TableHead>Refill Due</TableHead>
                <TableHead>Pickup</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map(r => (
                <TableRow key={r.id} className={`cursor-pointer ${selectedPatient?.id === r.patientId ? "bg-primary/5" : ""}`}
                  onClick={() => r.patient && setSelectedPatient(r.patient)}>
                  <TableCell className="font-medium">{r.patient?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={riskColors[r.riskLevel]}>{r.metric}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{r.lastFill || "—"}</TableCell>
                  <TableCell className="text-sm">{r.daysSupply || "—"}</TableCell>
                  <TableCell className="text-sm">{r.refillDue || "—"}</TableCell>
                  <TableCell className="text-sm capitalize">{r.pickupStatus.replace(/_/g, " ")}</TableCell>
                  <TableCell>
                    <span className={`text-sm font-medium ${confidenceColors[r.dataConfidence]}`}>
                      {r.dataConfidence.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Phone className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Pill className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><RefreshCw className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><AlertTriangle className="h-3.5 w-3.5" /></Button>
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
