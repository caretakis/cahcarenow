import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPatientById, getPatientNeeds, getPatientOutreach, getPatientEnrollments, getPatientMedAdherence, getPatientEpisodes, needs as allNeeds, programs } from "@/data/sampleData";
import { buildPopulationRecords, tierLabels, tierColors, getPatientInteractionHistory, type CareTier } from "@/data/populationData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Phone, Calendar, Activity, FileText, History, Heart, Shield, AlertTriangle, User, TrendingUp, TrendingDown, ClipboardList } from "lucide-react";
import { CallWorkspaceModal } from "@/components/CallWorkspaceModal";

const riskColors: Record<string, string> = {
  low: "bg-success/15 text-success border-success/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-accent/15 text-accent border-accent/30",
  very_high: "bg-destructive/15 text-destructive border-destructive/30",
};

const needCategoryIcons: Record<string, string> = {
  TOC_STEP: "🏥",
  PROGRAM_CHECKPOINT: "📋",
  QUALITY_GAP: "📊",
  AWV: "📅",
  HCC_RECAPTURE: "🔬",
  MED_ADHERENCE: "💊",
  SUPP_DOC: "📄",
};

export default function PatientPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [callModalOpen, setCallModalOpen] = useState(false);
  const patient = patientId ? getPatientById(patientId) : undefined;
  const patientNeeds = patient ? getPatientNeeds(patient.id) : [];
  const outreach = patient ? getPatientOutreach(patient.id) : [];
  const enrollments = patient ? getPatientEnrollments(patient.id) : [];
  const medAdherence = patient ? getPatientMedAdherence(patient.id) : [];
  const patientEpisodes = patient ? getPatientEpisodes(patient.id) : [];
  const interactions = patient ? getPatientInteractionHistory(patient.id) : [];

  const popRecord = useMemo(() => {
    if (!patient) return null;
    return buildPopulationRecords().find(r => r.patient.id === patient.id) ?? null;
  }, [patient]);

  if (!patient) return <div className="p-8 text-muted-foreground">Patient not found</div>;

  const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();
  const openNeeds = patientNeeds.filter(n => n.status !== "COMPLETED");

  // Group needs by category
  const clinicalNeeds = openNeeds.filter(n => ["TOC_STEP", "PROGRAM_CHECKPOINT", "HCC_RECAPTURE"].includes(n.type));
  const qualityNeeds = openNeeds.filter(n => n.type === "QUALITY_GAP");
  const adminNeeds = openNeeds.filter(n => ["AWV", "MED_ADHERENCE", "SUPP_DOC"].includes(n.type));

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{patient.name}</h1>
            {popRecord && (
              <Badge className={`${tierColors[popRecord.careTier]} text-sm px-2.5 py-0.5 font-bold`}>
                Tier {popRecord.careTier} — {tierLabels[popRecord.careTier]}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{age}y · DOB {patient.dob} · {patient.payer}</p>
          <p className="text-sm text-muted-foreground">{patient.practice} · {patient.provider}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {popRecord && (
              <>
                <div className="flex items-center gap-1.5 text-sm">
                  <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{popRecord.acuityScore}</span>
                  <span className="text-muted-foreground text-xs">acuity</span>
                </div>
                <span className="text-muted-foreground">·</span>
                <div className="flex items-center gap-1.5 text-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{popRecord.assignedOwner}</span>
                </div>
                <span className="text-muted-foreground">·</span>
              </>
            )}
            {popRecord?.activeProgram && (
              <>
                <Badge variant="secondary" className="text-xs">{popRecord.activeProgram}</Badge>
                <span className="text-muted-foreground">·</span>
              </>
            )}
            <span className="text-xs text-muted-foreground">Last touched: {popRecord?.lastTouched || "Never"}</span>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={riskColors[patient.riskTier]}>
              {patient.riskTier.replace("_", " ")}
            </Badge>
            {patient.flags.map(f => (
              <Badge key={f} variant="secondary" className="text-xs">{f.replace(/_/g, " ")}</Badge>
            ))}
            {popRecord?.tierFit !== "appropriate" && (
              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />Tier review needed
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={() => setCallModalOpen(true)}><Phone className="h-4 w-4 mr-1" />Call</Button>
          <Button size="sm" variant="outline"><Calendar className="h-4 w-4 mr-1" />Schedule</Button>
          <Button size="sm" variant="outline"><ClipboardList className="h-4 w-4 mr-1" />Log</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="snapshot" className="space-y-4">
        <TabsList>
          <TabsTrigger value="snapshot" className="gap-1.5"><Heart className="h-3.5 w-3.5" />Snapshot</TabsTrigger>
          <TabsTrigger value="careplan" className="gap-1.5"><FileText className="h-3.5 w-3.5" />Care Plan</TabsTrigger>
          <TabsTrigger value="quality" className="gap-1.5"><Shield className="h-3.5 w-3.5" />Quality & Gaps</TabsTrigger>
          <TabsTrigger value="utilization" className="gap-1.5"><Activity className="h-3.5 w-3.5" />Utilization</TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5"><History className="h-3.5 w-3.5" />History</TabsTrigger>
        </TabsList>

        {/* Tab 1: Snapshot */}
        <TabsContent value="snapshot" className="space-y-4">
          {/* Acuity summary */}
          {popRecord && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Acuity Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{popRecord.rafScore}</p>
                    <p className="text-xs text-muted-foreground">RAF Score</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{patient.hccCount}</p>
                    <p className="text-xs text-muted-foreground">HCC Count</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{popRecord.admitsLast12mo}</p>
                    <p className="text-xs text-muted-foreground">Admits (12mo)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{popRecord.edVisitsLast12mo}</p>
                    <p className="text-xs text-muted-foreground">ED Visits (12mo)</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-2xl font-bold">{popRecord.acuityScore}</p>
                      <TrendingUp className="h-4 w-4 text-destructive" />
                    </div>
                    <p className="text-xs text-muted-foreground">Acuity Score</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{patient.openQualityGaps}</p>
                    <p className="text-xs text-muted-foreground">Open Gaps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Protocols */}
          {(patientEpisodes.filter(e => e.status === "ACTIVE").length > 0 ||
            enrollments.filter(e => e.status === "active").length > 0 ||
            medAdherence.length > 0) && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Active Protocols</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {/* TOC Episodes */}
                {patientEpisodes.filter(e => e.status === "ACTIVE").map(ep => {
                  const stageLabels: Record<string, string> = {
                    admitted: "Admitted",
                    discharged: "Discharged — Awaiting Contact",
                    interactive_contact: "Interactive Contact",
                    pcp_visit: "PCP Visit Scheduling",
                    follow_ups: "Weekly Follow-Ups",
                    closed: "Closed",
                  };
                  const completedSteps = ep.steps.filter(s => s.status === "DONE").length;
                  const totalSteps = ep.steps.length;
                  return (
                    <div key={ep.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => navigate(`/toc?episode=${ep.id}`)}>
                      <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0 text-sm">🏥</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">Transition of Care</span>
                          <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/20">
                            {stageLabels[ep.currentStage] || ep.currentStage}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ep.facility} · Admitted {ep.startDate.split("T")[0]} · Discharged {ep.dischargeDate.split("T")[0]}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span>{completedSteps}/{totalSteps} steps complete</span>
                          <span>·</span>
                          <span>48h SLA: {new Date(ep.sla48hDue) < new Date() ? <span className="text-destructive font-medium">Overdue</span> : ep.sla48hDue.split("T")[0]}</span>
                          <span>·</span>
                          <span>Nurse: {ep.assignedNurse}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Program Enrollments */}
                {enrollments.filter(e => e.status === "active").map(enr => {
                  const prog = programs.find(p => p.id === enr.programId);
                  const completedCheckpoints = enr.checkpointStatuses.filter(c => c.status === "DONE").length;
                  const totalCheckpoints = enr.checkpointStatuses.length;
                  const nextDue = enr.checkpointStatuses.find(c => c.status === "OPEN" && c.nextDue);
                  const isOverdue = nextDue?.nextDue && nextDue.nextDue < new Date().toISOString().split("T")[0];
                  return (
                    <div key={enr.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => navigate("/programs")}>
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-sm">📋</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{prog?.name || enr.programId}</span>
                          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">Active</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Enrolled {enr.enrollDate}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span>{completedCheckpoints}/{totalCheckpoints} checkpoints</span>
                          {nextDue && (
                            <>
                              <span>·</span>
                              <span>Next due: {isOverdue ? <span className="text-destructive font-medium">{nextDue.nextDue} (overdue)</span> : nextDue.nextDue}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Med Adherence Measures */}
                {medAdherence.map(med => {
                  const riskBadge: Record<string, string> = {
                    on_track: "bg-success/10 text-success border-success/20",
                    at_risk: "bg-warning/10 text-warning border-warning/20",
                    overdue: "bg-destructive/10 text-destructive border-destructive/20",
                    no_data: "bg-muted text-muted-foreground border-border",
                  };
                  return (
                    <div key={med.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => navigate("/med-adherence")}>
                      <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center shrink-0 text-sm">💊</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{med.metric}</span>
                          <Badge variant="outline" className={`text-[10px] ${riskBadge[med.riskLevel]}`}>
                            {med.riskLevel.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span>Last fill: {med.lastFill}</span>
                          <span>·</span>
                          <span>Refill due: {med.refillDue}</span>
                          <span>·</span>
                          <span>Pickup: {med.pickupStatus.replace("_", " ")}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Open needs panel — the most important component */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Open Needs ({openNeeds.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clinicalNeeds.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Clinical</p>
                  {clinicalNeeds.map(n => (
                    <NeedRow key={n.id} need={n} />
                  ))}
                </div>
              )}
              {qualityNeeds.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quality Gaps</p>
                  {qualityNeeds.map(n => (
                    <NeedRow key={n.id} need={n} />
                  ))}
                </div>
              )}
              {adminNeeds.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Administrative</p>
                  {adminNeeds.map(n => (
                    <NeedRow key={n.id} need={n} />
                  ))}
                </div>
              )}
              {openNeeds.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No open needs</p>
              )}
            </CardContent>
          </Card>

          {/* Recent interactions */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Recent Interactions</CardTitle></CardHeader>
            <CardContent>
              {interactions.slice(0, 5).map(i => (
                <div key={i.id} className="flex items-start gap-3 py-2.5 border-b last:border-0">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs shrink-0">
                    {i.type === "call" ? "📞" : i.type === "toc_step" ? "🏥" : "📝"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{i.description}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{i.outcome}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{i.notes}</p>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0 text-right">
                    <div>{i.date.split("T")[0]}</div>
                    <div>{i.owner}</div>
                  </div>
                </div>
              ))}
              {interactions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No interactions recorded</p>
              )}
            </CardContent>
          </Card>

          {/* Care team */}
          {popRecord && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Care Team</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <TeamMember label="Primary Owner" name={popRecord.assignedOwner} />
                  <TeamMember label="PCP" name={patient.provider} />
                  {patientEpisodes.length > 0 && (
                    <>
                      <TeamMember label="TOC Nurse" name={patientEpisodes[0].assignedNurse} />
                      <TeamMember label="Care Coordinator" name={patientEpisodes[0].assignedCareCoordinator} />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 2: Care Plan & Program */}
        <TabsContent value="careplan" className="space-y-4">
          {enrollments.length > 0 ? enrollments.map(e => (
            <Card key={e.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{e.programId} — Enrolled {e.enrollDate}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {e.checkpointStatuses.map(c => (
                    <div key={c.key} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={c.status === "DONE" ? "default" : "outline"} className="text-xs">{c.status}</Badge>
                        <span>{c.key.replace(/_/g, " ")}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {c.status === "DONE" ? `Done ${c.lastCompleted}` : `Due ${c.nextDue || "TBD"}`}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Not enrolled in any programs
              </CardContent>
            </Card>
          )}
          {patientEpisodes.filter(e => e.status === "ACTIVE").map(ep => (
            <Card key={ep.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">TOC: {ep.admitReason} — {ep.facility}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ep.steps.map(s => (
                    <div key={s.key} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={s.status === "DONE" ? "default" : "outline"} className="text-xs">{s.status}</Badge>
                        <span>{s.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {s.completedAt ? s.completedAt.split("T")[0] : s.due ? `Due ${s.due.split("T")[0]}` : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tab 3: Quality & Gaps */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Quality Gaps</CardTitle></CardHeader>
            <CardContent>
              {patientNeeds.filter(n => n.type === "QUALITY_GAP").length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gap</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientNeeds.filter(n => n.type === "QUALITY_GAP").map(n => (
                      <TableRow key={n.id}>
                        <TableCell className="font-medium">{n.subtype}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{n.status}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{n.dueDate}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{n.details.measure} · Last: {n.details.lastDone || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-sm text-muted-foreground text-center py-4">No quality gaps</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">AWV Status</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm">
                <div><span className="text-muted-foreground">Last AWV:</span> <span className="font-medium">{patient.lastAWV || "None on file"}</span></div>
                <div><span className="text-muted-foreground">Next Appt:</span> <span className="font-medium">{patient.nextAppointment || "Not scheduled"}</span></div>
              </div>
            </CardContent>
          </Card>
          {medAdherence.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Medication Adherence</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
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
        </TabsContent>

        {/* Tab 4: Utilization & Risk */}
        <TabsContent value="utilization" className="space-y-4">
          {popRecord && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Risk Profile</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{popRecord.rafScore}</p>
                    <p className="text-xs text-muted-foreground">RAF Score</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{patient.hccCount}</p>
                    <p className="text-xs text-muted-foreground">Total HCCs</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{popRecord.admitsLast12mo}</p>
                    <p className="text-xs text-muted-foreground">Admits (12mo)</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{popRecord.edVisitsLast12mo}</p>
                    <p className="text-xs text-muted-foreground">ED Visits (12mo)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Admission / ED History</CardTitle></CardHeader>
            <CardContent>
              {patientEpisodes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Facility</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Discharge</TableHead>
                      <TableHead>TOC Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientEpisodes.map(ep => (
                      <TableRow key={ep.id}>
                        <TableCell className="text-sm">{ep.startDate}</TableCell>
                        <TableCell className="text-sm">{ep.facility}</TableCell>
                        <TableCell className="text-sm">{ep.admitReason}</TableCell>
                        <TableCell className="text-sm">{ep.dischargeDate || "Still admitted"}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs capitalize">{ep.currentStage.replace(/_/g, " ")}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-sm text-muted-foreground text-center py-4">No admissions recorded</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">HCC Documentation Status</CardTitle></CardHeader>
            <CardContent>
              {patientNeeds.filter(n => n.type === "HCC_RECAPTURE").length > 0 ? (
                <div className="space-y-2">
                  {patientNeeds.filter(n => n.type === "HCC_RECAPTURE").map(n => (
                    <div key={n.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                      <div>
                        <span className="font-medium">{n.details.hcc}</span>
                        <span className="text-muted-foreground ml-2">RAF delta: +{n.details.rafDelta}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{n.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground text-center py-4">No pending HCC recapture</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Interaction History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">All Interactions ({interactions.length})</CardTitle></CardHeader>
            <CardContent>
              {interactions.length > 0 ? (
                <div className="space-y-0">
                  {interactions.map(i => (
                    <div key={i.id} className="flex items-start gap-3 py-3 border-b last:border-0">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm shrink-0">
                        {i.type === "call" ? "📞" : i.type === "toc_step" ? "🏥" : "📝"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{i.description}</span>
                          <Badge variant="outline" className="text-[10px] capitalize">{i.outcome}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{i.type.replace(/_/g, " ")}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{i.notes}</p>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0 text-right">
                        <div>{i.date.split("T")[0]}</div>
                        <div>{i.date.includes("T") ? i.date.split("T")[1]?.substring(0, 5) : ""}</div>
                        <div className="font-medium mt-0.5">{i.owner}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground text-center py-4">No interactions recorded</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CallWorkspaceModal open={callModalOpen} onOpenChange={setCallModalOpen} patient={patient} />
    </div>
  );
}

// Sub-components
function NeedRow({ need }: { need: any }) {
  const isOverdue = need.dueDate && need.dueDate < "2026-04-16";
  const icon = needCategoryIcons[need.type] || "📌";
  return (
    <div className={`flex items-center justify-between text-sm py-2 px-3 rounded-md mb-1 ${isOverdue ? "bg-destructive/5 border border-destructive/20" : "border border-transparent hover:bg-muted/30"}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span>{icon}</span>
        <span className={isOverdue ? "text-destructive font-medium" : ""}>{need.subtype}</span>
        <Badge variant="outline" className="text-[10px]">{need.status}</Badge>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-muted-foreground">{need.ownerRole.replace(/_/g, " ")}</span>
        <span className={`text-xs ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>{need.dueDate || "—"}</span>
      </div>
    </div>
  );
}

function TeamMember({ label, name }: { label: string; name: string }) {
  return (
    <div className="border rounded-lg p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium mt-0.5">{name}</p>
    </div>
  );
}
