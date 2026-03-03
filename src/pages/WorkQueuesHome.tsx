import { useMemo } from "react";
import { queueDefinitions, needs, patients, episodes, outreachLog, getPatientNeeds } from "@/data/sampleData";
import { TopKPIBar } from "@/components/TopKPIBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Pill, ClipboardList, ArrowRight, AlertTriangle, Phone, Zap, ChevronRight } from "lucide-react";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";

const iconMap: Record<string, any> = {
  calendar: Calendar,
  clock: Clock,
  pill: Pill,
  clipboard: ClipboardList,
};

const riskColors: Record<string, string> = {
  low: "bg-success/15 text-success border-success/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-accent/15 text-accent border-accent/30",
  very_high: "bg-destructive/15 text-destructive border-destructive/30",
};

const needTypeLabels: Record<string, string> = {
  AWV: "Annual Wellness Visit",
  QUALITY_GAP: "Quality Gap",
  HCC_RECAPTURE: "HCC Recapture",
  TOC_STEP: "TOC Follow-up",
  MED_ADHERENCE: "Med Adherence",
  PROGRAM_CHECKPOINT: "Program Checkpoint",
  SUPP_DOC: "Supplemental Doc",
};

export default function WorkQueuesHome() {
  const navigate = useNavigate();

  // Build priority action list: open/in-progress needs sorted by impact, enriched with patient info
  const priorityActions = useMemo(() => {
    const openNeeds = needs
      .filter(n => n.status === "OPEN" || n.status === "IN_PROGRESS")
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, 8);

    return openNeeds.map(n => {
      const patient = patients.find(p => p.id === n.patientId);
      const lastOutreach = outreachLog
        .filter(o => o.patientId === n.patientId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
      return { need: n, patient, lastOutreach };
    });
  }, []);

  const dueToday = needs.filter(n => n.dueDate && n.dueDate <= "2026-03-03" && (n.status === "OPEN" || n.status === "IN_PROGRESS")).length;
  const overdueCount = needs.filter(n => n.dueDate && n.dueDate < "2026-03-03" && (n.status === "OPEN" || n.status === "IN_PROGRESS")).length;
  const atRiskSLA = episodes.filter(e => e.status === "ACTIVE" && e.steps.find(s => s.key === "interactive_contact" && s.status === "OPEN")).length;
  const totalContacts = 58;
  const totalScheduled = 35;

  const kpis = [
    { label: "Due Today", value: dueToday, urgent: dueToday > 5 },
    { label: "Overdue", value: overdueCount, urgent: overdueCount > 0 },
    { label: "At-Risk SLA", value: atRiskSLA, urgent: true },
    { label: "Conversion Rate", value: `${Math.round((totalScheduled / totalContacts) * 100)}%`, sublabel: `${totalScheduled}/${totalContacts} this week` },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Work Queues</h1>
        <p className="text-muted-foreground mt-1">Your role-based work queues</p>
      </div>

      <TopKPIBar items={kpis} />

      {/* Priority Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" />
              <CardTitle className="text-lg">Priority Actions</CardTitle>
              <Badge variant="secondary" className="ml-1">{priorityActions.length} items</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Highest-impact tasks across all queues — start here</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priorityActions.map(({ need, patient, lastOutreach }) => {
                const isOverdue = need.dueDate && need.dueDate < "2026-03-03";
                return (
                  <TableRow
                    key={need.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => patient && navigate(`/patients/${patient.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{patient?.name || "Unknown"}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${riskColors[patient?.riskTier || "low"]}`}>
                            {patient?.riskTier?.replace("_", " ")}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{patient?.practice}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{needTypeLabels[need.type] || need.type}</p>
                      <p className="text-xs text-muted-foreground capitalize">{need.subtype.replace(/_/g, " ")}</p>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold text-sm ${need.impactScore >= 80 ? "text-destructive" : need.impactScore >= 60 ? "text-warning" : "text-foreground"}`}>
                        {need.impactScore}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                        <span className={`text-sm ${isOverdue ? "text-destructive font-medium" : ""}`}>
                          {need.dueDate || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lastOutreach ? (
                        <div>
                          <p className="text-sm">{lastOutreach.timestamp.split("T")[0]}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{lastOutreach.outcome.replace("_", " ")}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No contact</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={need.status === "IN_PROGRESS" ? "default" : "outline"} className="text-[10px]">
                        {need.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Phone className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Queue Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">All Queues</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {queueDefinitions.map(q => {
            const Icon = iconMap[q.icon] || ClipboardList;
            return (
              <Card key={q.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate(`/queues/${q.id}`)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{q.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{q.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-sm">{q.count} patients</Badge>
                    {q.urgentCount > 0 && (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-sm">
                        {q.urgentCount} urgent
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {q.roles.map(r => (
                      <span key={r} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {r.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
