import { queueDefinitions, needs, patients, episodes } from "@/data/sampleData";
import { TopKPIBar } from "@/components/TopKPIBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Pill, ClipboardList, ArrowRight } from "lucide-react";

const iconMap: Record<string, any> = {
  calendar: Calendar,
  clock: Clock,
  pill: Pill,
  clipboard: ClipboardList,
};

export default function WorkQueuesHome() {
  const navigate = useNavigate();
  const dueToday = needs.filter(n => n.dueDate && n.dueDate <= "2026-03-02" && (n.status === "OPEN" || n.status === "IN_PROGRESS")).length;
  const atRiskSLA = episodes.filter(e => e.status === "ACTIVE" && e.steps.find(s => s.key === "interactive_contact" && s.status === "OPEN")).length;
  const totalContacts = 58;
  const totalScheduled = 35;

  const kpis = [
    { label: "Due Today", value: dueToday, urgent: dueToday > 5 },
    { label: "At-Risk SLA", value: atRiskSLA, urgent: true },
    { label: "Conversion Rate", value: `${Math.round((totalScheduled / totalContacts) * 100)}%`, sublabel: `${totalScheduled}/${totalContacts} this week` },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Work Queues</h1>
        <p className="text-muted-foreground mt-1">Your role-based work queues</p>
      </div>

      <TopKPIBar items={kpis} />

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
  );
}
