import { useState } from "react";
import { useParams } from "react-router-dom";
import { getPatientById, getPatientNeeds, getPatientOutreach, getPatientEnrollments, getPatientMedAdherence } from "@/data/sampleData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Phone, Calendar, AlertTriangle } from "lucide-react";
import { CallWorkspaceModal } from "@/components/CallWorkspaceModal";

const riskColors: Record<string, string> = {
  low: "bg-success/15 text-success border-success/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-accent/15 text-accent border-accent/30",
  very_high: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function PatientPage() {
  const { patientId } = useParams();
  const patient = patientId ? getPatientById(patientId) : undefined;
  const needs = patient ? getPatientNeeds(patient.id) : [];
  const outreach = patient ? getPatientOutreach(patient.id) : [];
  const enrollments = patient ? getPatientEnrollments(patient.id) : [];
  const medAdherence = patient ? getPatientMedAdherence(patient.id) : [];

  if (!patient) return <div className="p-8 text-muted-foreground">Patient not found</div>;

  const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();

  return (
    <div className="p-6 lg:p-8 max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{patient.name}</h1>
          <p className="text-muted-foreground">{age}y · DOB {patient.dob} · {patient.payer}</p>
          <p className="text-sm text-muted-foreground">{patient.practice} · {patient.provider}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className={riskColors[patient.riskTier]}>
              {patient.riskTier.replace("_", " ")}
            </Badge>
            {patient.flags.map(f => (
              <Badge key={f} variant="secondary" className="text-xs">{f.replace(/_/g, " ")}</Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm"><Phone className="h-4 w-4 mr-1" />Call</Button>
          <Button size="sm" variant="outline"><Calendar className="h-4 w-4 mr-1" />Schedule</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Open Needs */}
        <Card>
          <CardHeader><CardTitle className="text-base">Open Needs ({needs.filter(n => n.status !== "COMPLETED").length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {needs.filter(n => n.status !== "COMPLETED").map(n => (
                <div key={n.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                  <div>
                    <Badge variant="outline" className="mr-2 text-xs">{n.status}</Badge>
                    <span>{n.type.replace(/_/g, " ")}: {n.subtype.replace(/_/g, " ")}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{n.dueDate}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Outreach History */}
        <Card>
          <CardHeader><CardTitle className="text-base">Outreach History</CardTitle></CardHeader>
          <CardContent>
            {outreach.length === 0 ? <p className="text-sm text-muted-foreground">No outreach</p> : (
              <div className="space-y-3">
                {outreach.map(o => (
                  <div key={o.id} className="text-sm border-b pb-2 last:border-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{o.channel}</Badge>
                      <span className="font-medium capitalize">{o.outcome.replace(/_/g, " ")}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{o.agent}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{o.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Med Adherence */}
        {medAdherence.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Med Adherence</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Last Fill</TableHead>
                    <TableHead>Refill Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medAdherence.map(ma => (
                    <TableRow key={ma.id}>
                      <TableCell className="font-medium">{ma.metric}</TableCell>
                      <TableCell>{ma.lastFill || "—"}</TableCell>
                      <TableCell>{ma.refillDue || "—"}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize text-xs">{ma.riskLevel.replace(/_/g, " ")}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Program Enrollments */}
        {enrollments.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Program Enrollments</CardTitle></CardHeader>
            <CardContent>
              {enrollments.map(e => (
                <div key={e.id} className="text-sm mb-3 last:mb-0">
                  <p className="font-medium">{e.programId} · Enrolled {e.enrollDate}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {e.checkpointStatuses.map(c => (
                      <Badge key={c.key} variant={c.status === "DONE" ? "default" : "outline"} className="text-xs">
                        {c.key.replace(/_/g, " ")} {c.status === "DONE" ? "✓" : c.nextDue ? `due ${c.nextDue}` : ""}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
