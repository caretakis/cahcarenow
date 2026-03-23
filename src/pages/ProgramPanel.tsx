import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { programs, programEnrollments, getPatientById } from "@/data/sampleData";
import type { Patient } from "@/data/models";
import { PatientDrawer } from "@/components/PatientDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { CheckCircle, Calendar, Plus, AlertTriangle } from "lucide-react";
import { ScheduleDialog } from "@/components/ScheduleDialog";
import { EscalateDialog } from "@/components/EscalateDialog";
import { toast } from "sonner";

export default function ProgramPanel() {
  const { programId } = useParams();
  const program = programs.find(p => p.id === programId);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [schedulePatient, setSchedulePatient] = useState<Patient | null>(null);
  const [escalatePatient, setEscalatePatient] = useState<Patient | null>(null);

  const enrolled = useMemo(() =>
    programEnrollments
      .filter(e => e.programId === programId && e.status === "active")
      .map(e => ({ ...e, patient: getPatientById(e.patientId) })),
  [programId]);

  const today = "2026-03-02";
  const overdue = enrolled.filter(e => e.checkpointStatuses.some(c => c.status === "OPEN" && c.nextDue && c.nextDue < today));
  const dueThisWeek = enrolled.filter(e => !overdue.includes(e) && e.checkpointStatuses.some(c => c.status === "OPEN" && c.nextDue && c.nextDue <= "2026-03-08"));
  const upcoming = enrolled.filter(e => !overdue.includes(e) && !dueThisWeek.includes(e));

  if (!program) return <div className="p-8 text-muted-foreground">Program not found</div>;

  const renderBucket = (title: string, items: typeof enrolled, urgent?: boolean) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {title}
          <Badge variant={urgent ? "destructive" : "secondary"}>{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">None</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Next Checkpoint</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(e => {
                const nextCP = e.checkpointStatuses.find(c => c.status === "OPEN" && c.nextDue);
                const cpLabel = program.checkpoints.find(c => c.key === nextCP?.key)?.label || "—";
                return (
                  <TableRow key={e.id} className="cursor-pointer" onClick={() => e.patient && setSelectedPatient(e.patient)}>
                    <TableCell className="font-medium">{e.patient?.name}</TableCell>
                    <TableCell className="text-sm">{cpLabel}</TableCell>
                    <TableCell className="text-sm">{nextCP?.nextDue || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={ev => ev.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                          toast.success(`Checkpoint marked complete for ${e.patient?.name}`);
                        }}><CheckCircle className="h-3 w-3 mr-1" />Complete</Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => e.patient && setSchedulePatient(e.patient)}><Calendar className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                          toast.success(`Note added for ${e.patient?.name}`, { description: "Open patient drawer to add details" });
                        }}><Plus className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => e.patient && setEscalatePatient(e.patient)}><AlertTriangle className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex-1 flex flex-col min-w-0 overflow-auto p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold">{program.name}</h1>
          <p className="text-sm text-muted-foreground">{program.enrollmentRule}</p>
        </div>
        {renderBucket("Overdue", overdue, true)}
        {renderBucket("Due This Week", dueThisWeek)}
        {renderBucket("Upcoming", upcoming)}
      </div>
      {selectedPatient && (
        <PatientDrawer patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      )}
      <ScheduleDialog patient={schedulePatient} onClose={() => setSchedulePatient(null)} />
      <EscalateDialog patient={escalatePatient} onClose={() => setEscalatePatient(null)} />
    </div>
  );
}
