import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopKPIBar } from "@/components/TopKPIBar";
import { Progress } from "@/components/ui/progress";
import { weeklyTrend, needs } from "@/data/sampleData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";

export default function SiteDashboard() {
  const awvGoal = 200;
  const awvCompleted = 134;
  const awvPct = Math.round((awvCompleted / awvGoal) * 100);

  const openGapsByType = [
    { type: "AWV", count: needs.filter(n => n.type === "AWV" && n.status === "OPEN").length * 12 },
    { type: "Quality Gap", count: needs.filter(n => n.type === "QUALITY_GAP" && n.status === "OPEN").length * 8 },
    { type: "HCC Recapture", count: needs.filter(n => n.type === "HCC_RECAPTURE" && n.status === "OPEN").length * 15 },
    { type: "Med Adherence", count: needs.filter(n => n.type === "MED_ADHERENCE" && n.status === "OPEN").length * 10 },
  ];

  const kpis = [
    { label: "AWV Progress", value: `${awvPct}%`, sublabel: `${awvCompleted}/${awvGoal}` },
    { label: "Gaps Closed (Feb)", value: 83 },
    { label: "RAF Captured", value: "+12.4" },
    { label: "Open Needs", value: needs.filter(n => n.status === "OPEN").length * 8 },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Site Dashboard</h1>
        <p className="text-muted-foreground mt-1">Progress toward AWV & quality goals</p>
      </div>

      <TopKPIBar items={kpis} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* AWV Progress */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">AWV Progress vs Annual Goal</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>{awvCompleted} completed</span>
                <span className="font-semibold">{awvPct}%</span>
              </div>
              <Progress value={awvPct} className="h-4" />
              <p className="text-xs text-muted-foreground">Goal: {awvGoal} AWVs by end of year</p>
            </div>
          </CardContent>
        </Card>

        {/* Gap Closure Trend */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Gap Closure Trend (Weekly)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="gapsClosed" stroke="hsl(173,58%,39%)" strokeWidth={2} dot={{ r: 3 }} name="Gaps Closed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Remaining by Type */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Remaining Opportunity by Gap Type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={openGapsByType}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="type" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(173,58%,39%)" radius={[4, 4, 0, 0]} name="Open" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Opportunities */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Top Opportunities</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gap Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Avg Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openGapsByType.sort((a, b) => b.count - a.count).map(g => (
                  <TableRow key={g.type}>
                    <TableCell className="font-medium">{g.type}</TableCell>
                    <TableCell>{g.count}</TableCell>
                    <TableCell>{Math.round(60 + Math.random() * 30)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
