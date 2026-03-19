import { useMemo, useState } from "react";
import { queueDefinitions, needs, patients, getPatientNeeds } from "@/data/sampleData";
import { TopKPIBar } from "@/components/TopKPIBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Pill, ClipboardList, ArrowRight, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import type { Patient } from "@/data/models";

const iconMap: Record<string, any> = {
  calendar: Calendar,
  clock: Clock,
  pill: Pill,
  clipboard: ClipboardList,
};

export default function WorkQueuesHome() {
  const navigate = useNavigate();

  // Build per-queue stats
  const queueStats = useMemo(() => {
    return queueDefinitions.map(q => {
      // Get all open/in-progress needs
      const openNeeds = needs.filter(n => n.status === "OPEN" || n.status === "IN_PROGRESS");
      const completedNeeds = needs.filter(n => n.status === "COMPLETED");
      const overdueNeeds = openNeeds.filter(n => n.dueDate && n.dueDate < "2026-03-03");
      const dueTodayNeeds = openNeeds.filter(n => n.dueDate && n.dueDate <= "2026-03-03");
      const totalNeeds = openNeeds.length + completedNeeds.length;
      const completionPct = totalNeeds > 0 ? Math.round((completedNeeds.length / totalNeeds) * 100) : 0;

      return {
        ...q,
        openCount: openNeeds.length,
        overdueCount: overdueNeeds.length,
        dueTodayCount: dueTodayNeeds.length,
        completedCount: completedNeeds.length,
        completionPct,
      };
    });
  }, []);

  const totalOpen = needs.filter(n => n.status === "OPEN" || n.status === "IN_PROGRESS").length;
  const totalOverdue = needs.filter(n => n.dueDate && n.dueDate < "2026-03-03" && (n.status === "OPEN" || n.status === "IN_PROGRESS")).length;
  const totalCompleted = needs.filter(n => n.status === "COMPLETED").length;
  const totalAll = totalOpen + totalCompleted;
  const overallPct = totalAll > 0 ? Math.round((totalCompleted / totalAll) * 100) : 0;

  const kpis = [
    { label: "Open Gaps", value: totalOpen, urgent: totalOpen > 20 },
    { label: "Overdue", value: totalOverdue, urgent: totalOverdue > 0 },
    { label: "Completed", value: totalCompleted },
    { label: "Overall Progress", value: `${overallPct}%`, sublabel: `${totalCompleted}/${totalAll} gaps closed` },
  ];

  // Priority actions: open needs sorted by urgency then impact
  const TODAY = "2026-03-19";
  const priorityActions = useMemo(() => {
    const openNeeds = needs.filter(n => n.status === "OPEN" || n.status === "IN_PROGRESS");
    return openNeeds
      .map(n => {
        const patient = patients.find(p => p.id === n.patientId);
        const isOverdue = n.dueDate && n.dueDate < TODAY;
        const isDueSoon = n.dueDate && !isOverdue && n.dueDate <= "2026-03-26"; // within a week
        return { ...n, patient, isOverdue, isDueSoon };
      })
      .sort((a, b) => {
        // Overdue first, then due soon, then by impact
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        if (a.isDueSoon && !b.isDueSoon) return -1;
        if (!a.isDueSoon && b.isDueSoon) return 1;
        return b.impactScore - a.impactScore;
      });
  }, []);

  const [showAll, setShowAll] = useState(false);
  const visibleActions = showAll ? priorityActions : priorityActions.slice(0, 8);

  const typeLabels: Record<string, string> = {
    AWV: "Annual Wellness Visit",
    QUALITY_GAP: "Quality Gap",
    HCC_RECAPTURE: "HCC Recapture",
    TOC_STEP: "TOC Step",
    MED_ADHERENCE: "Med Adherence",
    PROGRAM_CHECKPOINT: "Program Checkpoint",
    SUPP_DOC: "Supplemental Doc",
  };

  const riskColors: Record<string, string> = {
    low: "bg-success/15 text-success border-success/30",
    medium: "bg-warning/15 text-warning border-warning/30",
    high: "bg-accent/15 text-accent border-accent/30",
    very_high: "bg-destructive/15 text-destructive border-destructive/30",
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Work Queues</h1>
        <p className="text-muted-foreground mt-1">Overview of what needs to be done across all queues</p>
      </div>

      <TopKPIBar items={kpis} />

      {/* Priority Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Priority Actions</CardTitle>
            <Badge variant="outline" className="ml-2">{priorityActions.length} items</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Your most urgent tasks across all queues, sorted by due date and impact</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleActions.map((item, idx) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => item.patient && navigate(`/patients/${item.patient.id}`)}
                  >
                    <TableCell className="text-muted-foreground text-xs font-mono">{idx + 1}</TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{item.patient?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{item.patient?.practice}</p>
                    </TableCell>
                    <TableCell className="text-sm capitalize">{item.subtype.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs font-normal">
                        {typeLabels[item.type] || item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.patient && (
                        <Badge variant="outline" className={riskColors[item.patient.riskTier]}>
                          {item.patient.riskTier.replace("_", " ")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{item.impactScore}</span>
                    </TableCell>
                    <TableCell>
                      {item.dueDate ? (
                        <span className={`text-sm font-medium ${item.isOverdue ? "text-destructive" : item.isDueSoon ? "text-warning" : "text-muted-foreground"}`}>
                          {item.dueDate}
                          {item.isOverdue && <AlertTriangle className="inline h-3.5 w-3.5 ml-1" />}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "IN_PROGRESS" ? "default" : "outline"} className="text-xs">
                        {item.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {priorityActions.length > 8 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-3 text-sm text-primary hover:underline font-medium"
            >
              {showAll ? "Show less" : `Show all ${priorityActions.length} actions`}
            </button>
          )}
        </CardContent>
      </Card>

      {/* Queue Overview Cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {queueStats.map(q => {
          const Icon = iconMap[q.icon] || ClipboardList;
          return (
            <Card
              key={q.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => navigate(`/queues/${q.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">{q.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{q.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{q.completionPct}%</span>
                  </div>
                  <Progress value={q.completionPct} className="h-2" />
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">{q.count}</span>
                    <span className="text-muted-foreground">patients</span>
                  </div>
                  {q.overdueCount > 0 && (
                    <div className="flex items-center gap-1 text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span className="font-medium">{q.overdueCount} overdue</span>
                    </div>
                  )}
                  {q.urgentCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
                        {q.urgentCount} urgent
                      </Badge>
                    </div>
                  )}
                  {q.dueTodayCount > 0 && (
                    <div className="flex items-center gap-1 text-warning">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{q.dueTodayCount} due today</span>
                    </div>
                  )}
                </div>

                {/* Roles */}
                <div className="flex gap-1">
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
  );
}
