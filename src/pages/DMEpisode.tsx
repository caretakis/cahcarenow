import { useParams, useNavigate } from "react-router-dom";
import { programs, programEnrollments, getPatientById, getPatientOutreach, getPatientMedAdherence } from "@/data/sampleData";
import { buildPopulationRecords, tierLabels, tierColors } from "@/data/populationData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  CheckCircle2, Circle, ArrowLeft, Calendar, Plus,
  AlertTriangle, Pill, FileText, Activity, Phone, Clock
} from "lucide-react";

const TODAY = "2026-03-19";

export default function DMEpisode() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();

  const enrollment = programEnrollments.find(e => e.id === enrollmentId);
  const program = enrollment ? programs.find(p => p.id === enrollment.programId) : undefined;
  const patient = enrollment ? getPatientById(enrollment.patientId) : undefined;
  const outreach = enrollment ? getPatientOutreach(enrollment.patientId) : [];
  const medAdherence = enrollment ? getPatientMedAdherence(enrollment.patientId) : [];

  const popRecord = useMemo(() => {
    if (!patient) return null;
    return buildPopulationRecords().find(r => r.patient.id === patient.id) ?? null;
  }, [patient]);

  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentNotes, setAssessmentNotes] = useState("");
  const [symptomStatus, setSymptomStatus] = useState("");
  const [barriers, setBarriers] = useState<string[]>([]);

  if (!enrollment || !program || !patient) return <div className="p-8 text-muted-foreground">Enrollment not found</div>;

  const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();

  // Build checkpoint stages for the pipeline
  const checkpoints = program.checkpoints.map(cp => {
    const status = enrollment.checkpointStatuses.find(s => s.key === cp.key);
    return { ...cp, ...status };
  });

  const completedCount = checkpoints.filter(c => c.status === "DONE").length;
  const totalCount = checkpoints.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Determine overall enrollment health
  const overdueCheckpoints = checkpoints.filter(c => c.status === "OPEN" && c.nextDue && c.nextDue < TODAY);
  const dueSoonCheckpoints = checkpoints.filter(c => c.status === "OPEN" && c.nextDue && c.nextDue >= TODAY && c.nextDue <= "2026-03-26");
  const enrollmentHealth = overdueCheckpoints.length > 0 ? "overdue" : dueSoonCheckpoints.length > 0 ? "due_soon" : "on_track";

  const healthBadge = {
    overdue: "bg-destructive/10 text-destructive border-destructive/20",
    due_soon: "bg-warning/10 text-warning border-warning/20",
    on_track: "bg-success/10 text-success border-success/20",
  };
  const healthLabel = { overdue: "Overdue", due_soon: "Due Soon", on_track: "On Track" };

  // Days enrolled
  const daysEnrolled = Math.floor((new Date(TODAY).getTime() - new Date(enrollment.enrollDate).getTime()) / 86400000);

  const toggleBarrier = (b: string) => setBarriers(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);

  const riskBadgeColors: Record<string, string> = {
    on_track: "bg-success/10 text-success border-success/20",
    at_risk: "bg-warning/10 text-warning border-warning/20",
    overdue: "bg-destructive/10 text-destructive border-destructive/20",
    no_data: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground"
            onClick={() => navigate("/programs")}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back to Programs
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
            {popRecord && (
              <Badge variant="outline" className={`${tierColors[popRecord.careTier]} text-xs font-bold`}>
                Tier {popRecord.careTier}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{age}y · {patient.payer} · {patient.provider}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
              {program.name}
            </Badge>
            <Badge variant="outline" className={`text-xs ${healthBadge[enrollmentHealth]}`}>
              {healthLabel[enrollmentHealth]}
            </Badge>
            <span className="text-xs text-muted-foreground">Enrolled {enrollment.enrollDate} · {daysEnrolled} days</span>
          </div>
          {popRecord && (
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span>Owner: {popRecord.assignedOwner}</span>
              <span>·</span>
              <span>Acuity: {popRecord.acuityScore}</span>
              <span>·</span>
              <span>Last touched: {popRecord.lastTouched || "Never"}</span>
            </div>
          )}
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs text-muted-foreground">{progressPct}% complete</span>
            <Progress value={progressPct} className="w-24 h-2" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => navigate(`/patients/${patient.id}`)}>
              <FileText className="h-3.5 w-3.5 mr-1" />Full Record
            </Button>
            <Button size="sm" onClick={() => toast.success("Call initiated")}>
              <Phone className="h-3.5 w-3.5 mr-1" />Call
            </Button>
          </div>
        </div>
      </div>

      {/* ── Checkpoint Pipeline ── */}
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border z-0" />
            <div className="absolute top-5 left-0 h-0.5 bg-primary z-0"
              style={{ width: `${totalCount > 1 ? (completedCount / (totalCount - 1)) * 100 : 0}%` }} />

            {checkpoints.map((cp, i) => {
              const isDone = cp.status === "DONE";
              const isOverdue = cp.status === "OPEN" && cp.nextDue && cp.nextDue < TODAY;
              const isDueSoon = cp.status === "OPEN" && cp.nextDue && cp.nextDue >= TODAY && cp.nextDue <= "2026-03-26";

              return (
                <div key={cp.key} className="flex flex-col items-center z-10 relative" style={{ width: `${100 / totalCount}%` }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isDone ? "bg-primary border-primary text-primary-foreground" :
                    isOverdue ? "bg-destructive/10 border-destructive text-destructive ring-4 ring-destructive/20" :
                    isDueSoon ? "bg-warning/10 border-warning text-warning ring-4 ring-warning/20" :
                    "bg-muted border-border text-muted-foreground"
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isOverdue ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-semibold">{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-2 text-center font-medium leading-tight ${
                    isDone ? "text-foreground" : isOverdue ? "text-destructive" : isDueSoon ? "text-warning" : "text-muted-foreground"
                  }`}>
                    {cp.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {isDone && cp.lastCompleted ? cp.lastCompleted : cp.nextDue ? `Due ${cp.nextDue}` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column: Checkpoints + Med Adherence */}
        <div className="lg:col-span-2 space-y-4">
          {/* Checkpoint Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Checkpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {checkpoints.map(cp => {
                const isDone = cp.status === "DONE";
                const isOverdue = cp.status === "OPEN" && cp.nextDue && cp.nextDue < TODAY;
                return (
                  <div key={cp.key} className={`flex items-center gap-3 py-2.5 px-2 rounded-md ${
                    isOverdue ? "bg-destructive/5 border border-destructive/20" : "hover:bg-muted/50"
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    ) : (
                      <Circle className={`h-5 w-5 shrink-0 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDone ? "text-muted-foreground line-through" : ""}`}>
                        {cp.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Every {cp.frequencyDays} days
                        {cp.lastCompleted && ` · Last: ${cp.lastCompleted}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {cp.nextDue && !isDone && (
                        <span className={`text-xs ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          {isOverdue ? "Overdue" : `Due ${cp.nextDue}`}
                        </span>
                      )}
                      {!isDone && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs"
                          onClick={() => { toast.success(`${cp.label} marked complete`); }}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Med Adherence for this patient */}
          {medAdherence.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Pill className="h-4 w-4" />Medication Adherence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {medAdherence.map(med => (
                  <div key={med.id} className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{med.metric}</span>
                        <Badge variant="outline" className={`text-[10px] ${riskBadgeColors[med.riskLevel]}`}>
                          {med.riskLevel.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Last fill: {med.lastFill || "N/A"} · Refill due: {med.refillDue || "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Program Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Program Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Program</span>
                <span className="font-medium">{program.name}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enrollment criteria</span>
                <span className="font-medium text-right max-w-[200px]">{program.enrollmentRule}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enrolled</span>
                <span className="font-medium">{enrollment.enrollDate}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{daysEnrolled} days</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="text-xs capitalize">{enrollment.status}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Assessment + Actions + Outreach */}
        <div className="lg:col-span-3 space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Actions</CardTitle>
                <Badge variant="outline">{overdueCheckpoints.length} overdue</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {overdueCheckpoints.length > 0 && (
                <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 space-y-2">
                  <p className="text-sm font-medium text-destructive flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />Overdue Checkpoints
                  </p>
                  {overdueCheckpoints.map(cp => (
                    <div key={cp.key} className="flex items-center justify-between text-sm">
                      <span>{cp.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-destructive">{cp.nextDue}</span>
                        <Button size="sm" variant="outline" className="h-7 text-xs"
                          onClick={() => toast.success(`${cp.label} marked complete`)}>Complete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setShowAssessment(!showAssessment)}>
                  <Activity className="h-3.5 w-3.5 mr-1" />{showAssessment ? "Hide" : "Start"} Assessment
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.success("Appointment scheduled")}>
                  <Calendar className="h-3.5 w-3.5 mr-1" />Schedule Visit
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast("Note added")}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Add Note
                </Button>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => toast.success("Escalated to clinical lead")}>
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />Escalate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Form */}
          {showAssessment && (
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{program.name} — Clinical Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Symptom Status</Label>
                  <Select value={symptomStatus} onValueChange={setSymptomStatus}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stable">Stable — no change</SelectItem>
                      <SelectItem value="improving">Improving</SelectItem>
                      <SelectItem value="worsening">Worsening</SelectItem>
                      <SelectItem value="new_symptoms">New symptoms</SelectItem>
                      <SelectItem value="exacerbation">Acute exacerbation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Barriers to Care</Label>
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    {["Medication cost", "Transportation", "Health literacy", "Social isolation", "Food insecurity", "Mental health"].map(b => (
                      <label key={b} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                        <Checkbox checked={barriers.includes(b)} onCheckedChange={() => toggleBarrier(b)} />
                        <span>{b}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Assessment Notes</Label>
                  <Textarea value={assessmentNotes} onChange={e => setAssessmentNotes(e.target.value)}
                    placeholder="Clinical observations, patient-reported outcomes, care plan adjustments…" className="mt-1.5 h-24" />
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Button onClick={() => { toast.success("Assessment saved"); setShowAssessment(false); }}>
                    Save Assessment
                  </Button>
                  <Button variant="outline" className="text-destructive" onClick={() => toast.success("Escalated")}>
                    <AlertTriangle className="h-4 w-4 mr-1" />Escalate
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Outreach Timeline */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Outreach Timeline</CardTitle></CardHeader>
            <CardContent>
              {outreach.length === 0 ? (
                <p className="text-sm text-muted-foreground">No outreach logged yet</p>
              ) : (
                <div className="space-y-3">
                  {outreach.map(o => (
                    <div key={o.id} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{o.channel}</Badge>
                          <span className="font-medium capitalize">{o.outcome.replace(/_/g, " ")}</span>
                          <span className="text-xs text-muted-foreground">· {o.agent}</span>
                        </div>
                        <p className="text-muted-foreground mt-0.5">{o.notes}</p>
                        <p className="text-xs text-muted-foreground">{new Date(o.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
