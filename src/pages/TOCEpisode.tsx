import { useParams } from "react-router-dom";
import { episodes, getPatientById, getPatientOutreach } from "@/data/sampleData";
import type { EpisodeStep, WeeklyFollowUp, FollowUpTask, NotificationSource } from "@/data/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { useState } from "react";
import {
  CheckCircle2, Circle, AlertTriangle, Plus, Phone, Calendar,
  Pill, FileText, Users, ArrowLeft, Clock, UserCog, Rss
} from "lucide-react";
import { TOCReassignDialog } from "@/components/TOCReassignDialog";
import { useNavigate } from "react-router-dom";

const STAGE_ORDER = ["admitted", "discharged", "interactive_contact", "pcp_visit", "follow_ups", "closed"] as const;
const STAGE_LABELS: Record<string, string> = {
  admitted: "Admitted",
  discharged: "Discharged",
  interactive_contact: "Interactive Contact",
  pcp_visit: "PCP Visit",
  follow_ups: "Follow-ups",
  closed: "Closed",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  scheduling: <Calendar className="h-3.5 w-3.5" />,
  clinical: <FileText className="h-3.5 w-3.5" />,
  social: <Users className="h-3.5 w-3.5" />,
  medication: <Pill className="h-3.5 w-3.5" />,
  documentation: <FileText className="h-3.5 w-3.5" />,
};

function getStageIndex(stage: string) {
  return STAGE_ORDER.indexOf(stage as any);
}

function slaStatus(sla48hDue: string) {
  const now = new Date("2026-03-02T12:00:00");
  const due = new Date(sla48hDue);
  const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursLeft < 0) return { text: "OVERDUE", color: "destructive" as const };
  if (hoursLeft < 6) return { text: `${Math.round(hoursLeft)}h left`, color: "destructive" as const };
  if (hoursLeft < 24) return { text: `${Math.round(hoursLeft)}h left`, color: "warning" as const };
  return { text: `${Math.round(hoursLeft)}h left`, color: "success" as const };
}

export default function TOCEpisode() {
  const { episodeId } = useParams();
  const navigate = useNavigate();
  const episode = episodes.find(e => e.id === episodeId);
  const patient = episode ? getPatientById(episode.patientId) : undefined;
  const outreach = episode ? getPatientOutreach(episode.patientId) : [];
  const [showAssessment, setShowAssessment] = useState(false);
  const [showReassign, setShowReassign] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [medsChanged, setMedsChanged] = useState("");
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [socialNeeds, setSocialNeeds] = useState("");

  const SOURCE_LABELS: Record<NotificationSource, string> = {
    hie_feed: "HIE Feed", wellsky: "WellSky", hospital_portal: "Hospital Portal", manual: "Manual",
  };

  if (!episode || !patient) return <div className="p-8 text-muted-foreground">Episode not found</div>;

  const toggleRedFlag = (f: string) => setRedFlags(prev => prev.includes(f) ? prev.filter(r => r !== f) : [...prev, f]);
  const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();
  const currentStageIdx = getStageIndex(episode.currentStage);
  const sla = episode.currentStage === "admitted" ? { text: "N/A", color: "muted" as const } : slaStatus(episode.sla48hDue);

  // Progress calculation
  const totalSteps = episode.steps.length + episode.weeklyFollowUps.length;
  const doneSteps = episode.steps.filter(s => s.status === "DONE").length +
    episode.weeklyFollowUps.filter(w => w.status === "DONE").length;
  const progressPct = Math.round((doneSteps / totalSteps) * 100);

  const openTasks = episode.followUpTasks.filter(t => t.status === "OPEN");
  const doneTasks = episode.followUpTasks.filter(t => t.status === "DONE");

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground"
            onClick={() => navigate("/toc")}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back to TOC
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-muted-foreground">{age}y · {patient.payer} · {patient.provider}</span>
            <Badge variant="outline" className={episode.status === "ACTIVE"
              ? "bg-info/10 text-info border-info/30"
              : "bg-success/10 text-success border-success/30"}>
              {episode.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {episode.facility} · {episode.admitReason}{episode.dischargeDate ? ` · Discharged ${episode.dischargeDate}` : " · Currently admitted"}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Rss className="h-3 w-3" />{SOURCE_LABELS[episode.notificationSource]}</span>
            <span>RN: {episode.assignedNurse}</span>
            <span>CC: {episode.assignedCareCoordinator}</span>
            <Button variant="ghost" size="sm" className="h-5 text-xs px-1.5" onClick={() => setShowReassign(true)}>
              <UserCog className="h-3 w-3 mr-1" />Reassign
            </Button>
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-xs text-muted-foreground">48h SLA</div>
          <Badge variant="outline" className={
            sla.color === "destructive" ? "bg-destructive/10 text-destructive border-destructive/30" :
            sla.color === "warning" ? "bg-warning/10 text-warning border-warning/30" :
            "bg-success/10 text-success border-success/30"
          }>
            <Clock className="h-3 w-3 mr-1" />{sla.text}
          </Badge>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">{progressPct}%</span>
            <Progress value={progressPct} className="w-24 h-2" />
          </div>
        </div>
      </div>

      {/* ── Visual Stage Pipeline ── */}
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center justify-between relative">
            {/* Connector line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border z-0" />
            <div className="absolute top-5 left-0 h-0.5 bg-primary z-0"
              style={{ width: `${(currentStageIdx / (STAGE_ORDER.length - 1)) * 100}%` }} />

            {STAGE_ORDER.map((stage, i) => {
              const step = episode.steps.find(s => s.key === stage);
              const isDone = step?.status === "DONE" || (stage === "closed" && episode.status === "CLOSED");
              const isCurrent = stage === episode.currentStage;
              const isFuture = i > currentStageIdx;

              return (
                <div key={stage} className="flex flex-col items-center z-10 relative" style={{ width: `${100 / STAGE_ORDER.length}%` }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isDone ? "bg-primary border-primary text-primary-foreground" :
                    isCurrent ? "bg-background border-primary text-primary ring-4 ring-primary/20" :
                    "bg-muted border-border text-muted-foreground"
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-2 text-center font-medium ${
                    isCurrent ? "text-primary" : isFuture ? "text-muted-foreground" : "text-foreground"
                  }`}>
                    {STAGE_LABELS[stage]}
                  </span>
                  {step?.completedAt && (
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(step.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column: Steps + Weekly Follow-ups */}
        <div className="lg:col-span-2 space-y-4">
          {/* Core Steps */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {episode.steps.map(step => (
                <StepRow key={step.key} step={step}
                  isCurrent={step.key === episode.currentStage}
                  onAction={step.key === "interactive_contact" && step.status === "OPEN"
                    ? () => setShowAssessment(true) : undefined}
                />
              ))}
            </CardContent>
          </Card>

          {/* Weekly Follow-ups */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Weekly Follow-ups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {episode.weeklyFollowUps.map(wu => (
                <div key={wu.week} className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-muted/50">
                  {wu.status === "DONE" ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-success shrink-0" />
                  ) : (
                    <Circle className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${wu.status === "DONE" ? "text-muted-foreground line-through" : ""}`}>
                      Week {wu.week}
                    </p>
                    {wu.notes && <p className="text-xs text-muted-foreground truncate">{wu.notes}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {wu.status === "DONE"
                      ? new Date(wu.completedAt!).toLocaleDateString()
                      : wu.due ? `Due ${new Date(wu.due).toLocaleDateString()}` : ""}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Assessment + Tasks + Outreach */}
        <div className="lg:col-span-3 space-y-4">
          {/* Follow-up Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Follow-up Tasks</CardTitle>
                <Badge variant="outline">{openTasks.length} open</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {openTasks.map(task => <TaskRow key={task.id} task={task} />)}
              {doneTasks.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <p className="text-xs text-muted-foreground font-medium mb-2">Completed ({doneTasks.length})</p>
                  {doneTasks.map(task => <TaskRow key={task.id} task={task} />)}
                </>
              )}
              <Button variant="outline" size="sm" className="mt-3 w-full">
                <Plus className="h-3.5 w-3.5 mr-1" />Add Task
              </Button>
            </CardContent>
          </Card>

          {/* Assessment Form */}
          {showAssessment && (
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Interactive Contact Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Symptoms Since Discharge</Label>
                  <Textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
                    placeholder="Describe any symptoms…" className="mt-1.5 h-20" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Medication Changes</Label>
                  <Select value={medsChanged} onValueChange={setMedsChanged}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_changes">No changes</SelectItem>
                      <SelectItem value="changes_understood">Changes — patient understands</SelectItem>
                      <SelectItem value="changes_confused">Changes — patient confused</SelectItem>
                      <SelectItem value="not_taking">Not taking meds as prescribed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Red Flags</Label>
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    {["Chest pain", "Shortness of breath", "Fever", "Wound issues", "Falls", "Confusion"].map(f => (
                      <label key={f} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                        <Checkbox checked={redFlags.includes(f)} onCheckedChange={() => toggleRedFlag(f)} />
                        <span>{f}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Social Needs</Label>
                  <Textarea value={socialNeeds} onChange={e => setSocialNeeds(e.target.value)}
                    placeholder="Transportation, food, housing…" className="mt-1.5 h-16" />
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Button>Save & Complete Step</Button>
                  <Button variant="outline"><AlertTriangle className="h-4 w-4 mr-1" />Escalate</Button>
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

      {/* Reassign Dialog */}
      <TOCReassignDialog
        open={showReassign}
        onOpenChange={setShowReassign}
        episode={episode}
        patientName={patient.name}
      />
    </div>
  );
}

function StepRow({ step, isCurrent, onAction }: { step: EpisodeStep; isCurrent: boolean; onAction?: () => void }) {
  return (
    <div className={`flex items-center gap-3 py-2.5 px-2 rounded-md ${isCurrent ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"}`}>
      {step.status === "DONE" ? (
        <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
      ) : (
        <Circle className={`h-5 w-5 shrink-0 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${step.status === "DONE" ? "text-muted-foreground line-through" : ""}`}>
          {step.label}
        </p>
        {step.notes && <p className="text-xs text-muted-foreground truncate">{step.notes}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {step.due && step.status === "OPEN" && (
          <span className="text-xs text-muted-foreground">Due {new Date(step.due).toLocaleDateString()}</span>
        )}
        {step.completedAt && (
          <span className="text-xs text-muted-foreground">{new Date(step.completedAt).toLocaleDateString()}</span>
        )}
        {onAction && (
          <Button size="sm" className="h-7 text-xs" onClick={onAction}>Start</Button>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: FollowUpTask }) {
  const isDone = task.status === "DONE";
  const [showReassign, setShowReassign] = useState(false);

  const TEAM_MEMBERS = [
    { name: "Lisa Thompson", role: "RN" },
    { name: "Karen Wells", role: "RN" },
    { name: "Sarah Mitchell", role: "CC" },
    { name: "Mike Rodriguez", role: "CC" },
    { name: "Jessica Park", role: "CC" },
    { name: "Amy Chen", role: "RN" },
  ];

  return (
    <>
      <div className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-muted/50 group">
        {isDone ? (
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
        ) : (
          <Checkbox className="shrink-0" />
        )}
        <div className="flex items-center gap-2 text-muted-foreground shrink-0">
          {CATEGORY_ICONS[task.category]}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${isDone ? "text-muted-foreground line-through" : ""}`}>{task.label}</p>
        </div>
        {!isDone && (
          <Popover open={showReassign} onOpenChange={setShowReassign}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <UserCog className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="end">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">Reassign to</p>
              {TEAM_MEMBERS.map(m => (
                <button key={m.name}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted flex items-center justify-between"
                  onClick={() => {
                    toast.success(`Task reassigned to ${m.name}`);
                    setShowReassign(false);
                  }}>
                  <span>{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.role}</span>
                </button>
              ))}
            </PopoverContent>
          </Popover>
        )}
        {task.due && (
          <span className="text-xs text-muted-foreground shrink-0">
            {isDone ? new Date(task.completedAt!).toLocaleDateString() : `Due ${new Date(task.due).toLocaleDateString()}`}
          </span>
        )}
      </div>
    </>
  );
}
