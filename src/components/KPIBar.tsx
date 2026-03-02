import { Card, CardContent } from "@/components/ui/card";
import { Users, AlertCircle, CalendarCheck, ArrowRightLeft, TrendingDown, Activity } from "lucide-react";
import { kpiData } from "@/data/sampleData";

const kpis = [
  { label: "Total Patients", value: kpiData.totalPatients.toLocaleString(), icon: Users, color: "text-primary" },
  { label: "Open Care Gaps", value: kpiData.openGaps, icon: AlertCircle, color: "text-accent" },
  { label: "AWV Compliance", value: `${kpiData.awvCompliance}%`, icon: CalendarCheck, color: "text-success" },
  { label: "TOC Pending", value: kpiData.tocPending, icon: ArrowRightLeft, color: "text-warning" },
  { label: "Readmit Rate", value: `${kpiData.readmissionRate}%`, icon: TrendingDown, color: "text-destructive" },
  { label: "Avg Risk Score", value: kpiData.avgRiskScore, icon: Activity, color: "text-info" },
];

export function KPIBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <kpi.icon className={`h-5 w-5 ${kpi.color} shrink-0`} />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                <p className="text-xl font-semibold tracking-tight">{kpi.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
