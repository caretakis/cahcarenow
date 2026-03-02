import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { chaseLists, patients, getPatientNeeds } from "@/data/sampleData";
import type { Patient } from "@/data/models";
import { PatientDrawer } from "@/components/PatientDrawer";
import { TopKPIBar } from "@/components/TopKPIBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Phone, Calendar, Download, CheckCircle } from "lucide-react";

export default function ChaseListRun() {
  const { listId } = useParams();
  const list = chaseLists.find(l => l.id === listId);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const listPatients = useMemo(() => {
    if (!list) return [];
    return list.patientIds.map(id => patients.find(p => p.id === id)).filter(Boolean) as Patient[];
  }, [list]);

  if (!list) return <div className="p-8 text-muted-foreground">List not found</div>;

  const kpis = [
    { label: "Total", value: list.stats.total },
    { label: "Remaining", value: list.stats.remaining },
    { label: "Attempted", value: list.stats.attempted },
    { label: "Connected", value: list.stats.connected },
    { label: "Scheduled", value: list.stats.scheduled },
  ];

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
          <TopKPIBar items={kpis} />
        </div>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>RAF Opp</TableHead>
                <TableHead>Open Needs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listPatients.map(p => {
                const needCount = getPatientNeeds(p.id).filter(n => n.status !== "COMPLETED").length;
                return (
                  <TableRow key={p.id} className={`cursor-pointer ${selectedPatient?.id === p.id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedPatient(p)}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm">{p.provider}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{p.riskTier.replace("_", " ")}</Badge></TableCell>
                    <TableCell>+{p.rafOpportunity}</TableCell>
                    <TableCell><Badge variant="secondary">{needCount}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Calendar className="h-3.5 w-3.5" /></Button>
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
