import { useState } from "react";
import { patients, tocSteps, Patient } from "@/data/sampleData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle, ChevronRight, Phone } from "lucide-react";

const tocPatients = patients.filter((p) => p.tocStatus);

export default function TransitionOfCare() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(tocPatients[0]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    reached: "",
    understanding: "",
    concerns: "",
    notes: "",
  });

  const toggleStep = (stepId: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((s) => s !== stepId) : [...prev, stepId]
    );
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Patient list */}
      <aside className="w-64 border-r bg-card overflow-y-auto shrink-0 hidden lg:block">
        <div className="p-4 border-b">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">TOC Patients</h2>
        </div>
        {tocPatients.map((p) => (
          <div
            key={p.id}
            className={`px-4 py-3 cursor-pointer border-b hover:bg-muted/50 transition-colors ${
              selectedPatient?.id === p.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
            }`}
            onClick={() => { setSelectedPatient(p); setActiveStep(null); }}
          >
            <p className="font-medium text-sm">{p.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">{p.tocStatus}</Badge>
              <span className="text-xs text-muted-foreground">{p.facility}</span>
            </div>
          </div>
        ))}
      </aside>

      {/* Checklist + form */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-3xl">
        {selectedPatient ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold">{selectedPatient.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Discharged {selectedPatient.dischargeDate} from {selectedPatient.facility}
              </p>
            </div>

            <div className="space-y-1">
              {tocSteps.map((step, idx) => {
                const done = completedSteps.includes(step.id);
                const isActive = activeStep === step.id;

                return (
                  <div key={step.id}>
                    <div
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isActive ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setActiveStep(isActive ? null : step.id)}
                    >
                      <button
                        className="mt-0.5 shrink-0"
                        onClick={(e) => { e.stopPropagation(); toggleStep(step.id); }}
                      >
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                      </div>
                      {step.isForm && (
                        <ChevronRight className={`h-4 w-4 text-muted-foreground mt-0.5 transition-transform ${isActive ? "rotate-90" : ""}`} />
                      )}
                    </div>

                    {/* Interactive Contact Form */}
                    {step.isForm && isActive && (
                      <Card className="ml-8 mt-2 mb-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary" />
                            Interactive Contact Form
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Patient Reached?</Label>
                            <Select
                              value={contactForm.reached}
                              onValueChange={(v) => setContactForm((f) => ({ ...f, reached: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes — Spoke with patient</SelectItem>
                                <SelectItem value="caregiver">Yes — Spoke with caregiver</SelectItem>
                                <SelectItem value="voicemail">No — Left voicemail</SelectItem>
                                <SelectItem value="no-answer">No — No answer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Understands Discharge Instructions?</Label>
                            <Select
                              value={contactForm.understanding}
                              onValueChange={(v) => setContactForm((f) => ({ ...f, understanding: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full">Full understanding</SelectItem>
                                <SelectItem value="partial">Partial — needs reinforcement</SelectItem>
                                <SelectItem value="none">Does not understand</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Patient Concerns</Label>
                            <Textarea
                              placeholder="Document any symptoms, medication questions, or barriers…"
                              value={contactForm.concerns}
                              onChange={(e) => setContactForm((f) => ({ ...f, concerns: e.target.value }))}
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Clinical Notes</Label>
                            <Textarea
                              placeholder="Additional notes for the care team…"
                              value={contactForm.notes}
                              onChange={(e) => setContactForm((f) => ({ ...f, notes: e.target.value }))}
                              rows={2}
                            />
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button size="sm" onClick={() => { toggleStep(step.id); setActiveStep(null); }}>
                              Save & Complete
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setActiveStep(null)}>
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {idx < tocSteps.length - 1 && (
                      <div className="ml-[1.375rem] h-4 border-l-2 border-dashed border-muted" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Select a patient to begin TOC workflow.</p>
        )}
      </div>
    </div>
  );
}
