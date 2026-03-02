import { useParams } from "react-router-dom";
import { episodes, getPatientById, getPatientOutreach } from "@/data/sampleData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { CheckCircle, Circle, AlertTriangle, Plus } from "lucide-react";

export default function TOCEpisode() {
  const { episodeId } = useParams();
  const episode = episodes.find(e => e.id === episodeId);
  const patient = episode ? getPatientById(episode.patientId) : undefined;
  const outreach = episode ? getPatientOutreach(episode.patientId) : [];
  const [showAssessment, setShowAssessment] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [medsChanged, setMedsChanged] = useState("");
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [socialNeeds, setSocialNeeds] = useState("");

  if (!episode || !patient) return <div className="p-8 text-muted-foreground">Episode not found</div>;

  const toggleRedFlag = (f: string) => setRedFlags(prev => prev.includes(f) ? prev.filter(r => r !== f) : [...prev, f]);
  const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();

  return (
    <div className="p-6 lg:p-8 max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">TOC Episode</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="font-medium">{patient.name}</span>
          <span className="text-sm text-muted-foreground">{age}y · {patient.payer} · {patient.provider}</span>
          <Badge variant="outline" className={episode.status === "ACTIVE" ? "bg-info/10 text-info border-info/30" : "bg-success/10 text-success border-success/30"}>
            {episode.status}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {episode.facility} · Admitted {episode.startDate} · Discharged {episode.dischargeDate}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Step Checklist */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Step Checklist</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {episode.steps.map(step => (
              <div key={step.key} className="flex items-start gap-3">
                {step.status === "DONE" ? (
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${step.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>
                    {step.label}
                  </p>
                  {step.due && (
                    <p className="text-xs text-muted-foreground">Due: {new Date(step.due).toLocaleString()}</p>
                  )}
                  {step.key === "interactive_contact" && step.status === "OPEN" && (
                    <Button size="sm" className="mt-1.5 h-7 text-xs" onClick={() => setShowAssessment(true)}>
                      Start Assessment
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Assessment Form / Outreach Timeline */}
        <div className="lg:col-span-3 space-y-6">
          {showAssessment && (
            <Card>
              <CardHeader><CardTitle className="text-base">Interactive Contact Assessment</CardTitle></CardHeader>
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
                  <div className="space-y-1.5 mt-1.5">
                    {["Chest pain", "Shortness of breath", "Fever", "Wound issues", "Falls", "Confusion"].map(f => (
                      <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
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
                  <Button variant="outline"><Plus className="h-4 w-4 mr-1" />Create Task</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Outreach Timeline</CardTitle></CardHeader>
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
