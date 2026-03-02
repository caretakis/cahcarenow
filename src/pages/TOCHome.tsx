import { useState, useMemo } from "react";
import { episodes, patients, getPatientById } from "@/data/sampleData";
import type { Patient } from "@/data/models";
import { PatientDrawer } from "@/components/PatientDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Phone, Play, AlertTriangle, UserPlus } from "lucide-react";

function slaRemaining(sla48hDue: string): { text: string; urgent: boolean } {
  const now = new Date("2026-03-02T12:00:00");
  const due = new Date(sla48hDue);
  const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursLeft < 0) return { text: "OVERDUE", urgent: true };
  if (hoursLeft < 6) return { text: `${Math.round(hoursLeft)}h left`, urgent: true };
  return { text: `${Math.round(hoursLeft)}h left`, urgent: false };
}

export default function TOCHome() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [tab, setTab] = useState("uncontacted");

  const enrichedEpisodes = useMemo(() =>
    episodes.map(ep => ({
      ...ep,
      patient: getPatientById(ep.patientId),
      slaInfo: slaRemaining(ep.sla48hDue),
      currentStep: ep.steps.find(s => s.status === "OPEN")?.label || "All Complete",
      contactDone: ep.steps.find(s => s.key === "interactive_contact")?.status === "DONE",
    })),
  []);

  const tabEpisodes = useMemo(() => {
    switch (tab) {
      case "uncontacted": return enrichedEpisodes.filter(e => e.status === "ACTIVE" && !e.contactDone);
      case "enrolled": return enrichedEpisodes.filter(e => e.status === "ACTIVE" && e.contactDone);
      case "all": return enrichedEpisodes;
      default: return enrichedEpisodes;
    }
  }, [tab, enrichedEpisodes]);

  // SLA heatstrip
  const onTime = enrichedEpisodes.filter(e => e.status === "ACTIVE" && !e.slaInfo.urgent).length;
  const atRisk = enrichedEpisodes.filter(e => e.status === "ACTIVE" && e.slaInfo.urgent && e.slaInfo.text !== "OVERDUE").length;
  const overdue = enrichedEpisodes.filter(e => e.status === "ACTIVE" && e.slaInfo.text === "OVERDUE").length;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-5 pb-3 space-y-4 border-b">
          <h1 className="text-xl font-bold">Transition of Care</h1>

          {/* SLA Heatstrip */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-success/10">
              <span className="w-2.5 h-2.5 rounded-full bg-success" />
              <span className="text-sm font-medium">{onTime} On-time</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-warning/10">
              <span className="w-2.5 h-2.5 rounded-full bg-warning" />
              <span className="text-sm font-medium">{atRisk} At-risk</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
              <span className="text-sm font-medium">{overdue} Overdue</span>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="uncontacted">Discharged (Uncontacted)</TabsTrigger>
              <TabsTrigger value="enrolled">Active Enrolled</TabsTrigger>
              <TabsTrigger value="all">All TOC</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Discharge</TableHead>
                <TableHead>SLA 48h</TableHead>
                <TableHead>Current Step</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabEpisodes.map(ep => (
                <TableRow key={ep.id}
                  className={`cursor-pointer ${selectedPatient?.id === ep.patientId ? "bg-primary/5" : ""}`}
                  onClick={() => ep.patient && setSelectedPatient(ep.patient)}>
                  <TableCell className="font-medium">{ep.patient?.name || "Unknown"}</TableCell>
                  <TableCell className="text-sm">{ep.facility}</TableCell>
                  <TableCell className="text-sm">{ep.dischargeDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ep.slaInfo.urgent ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-success/10 text-success border-success/30"}>
                      {ep.slaInfo.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{ep.currentStep}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="default" size="sm" className="h-7 text-xs"
                        onClick={() => navigate(`/toc/episode/${ep.id}`)}>
                        <Play className="h-3 w-3 mr-1" />Start
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Phone className="h-3.5 w-3.5" /></Button>
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
