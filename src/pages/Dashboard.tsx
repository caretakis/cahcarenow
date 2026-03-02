import { KPIBar } from "@/components/KPIBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { monthlyTrend, heatmapData, patients } from "@/data/sampleData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const riskColor: Record<string, string> = {
  Low: "bg-success/15 text-success border-success/30",
  Medium: "bg-warning/15 text-warning border-warning/30",
  High: "bg-accent/15 text-accent border-accent/30",
  Critical: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function Dashboard() {
  const highRisk = patients.filter((p) => p.riskLevel === "High" || p.riskLevel === "Critical").slice(0, 5);

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Care coordination overview</p>
      </div>

      <KPIBar />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Care Gap Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="gaps" stroke="hsl(173,58%,39%)" strokeWidth={2} dot={{ r: 3 }} name="Open Gaps" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AWV Compliance Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">AWV Compliance %</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="awv" fill="hsl(152,60%,40%)" radius={[4, 4, 0, 0]} name="AWV %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Heatmap table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">PCP Appointment Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
                    <TableHead key={d} className="text-center">{d}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {heatmapData.map((row) => (
                  <TableRow key={row.pcp}>
                    <TableCell className="font-medium">{row.pcp}</TableCell>
                    {[row.mon, row.tue, row.wed, row.thu, row.fri].map((val, i) => (
                      <TableCell key={i} className="text-center">
                        <span
                          className="inline-block w-8 h-8 rounded-md leading-8 text-xs font-medium"
                          style={{
                            backgroundColor: `hsl(173, 58%, ${80 - val * 7}%)`,
                            color: val > 5 ? "white" : "hsl(215,25%,15%)",
                          }}
                        >
                          {val}
                        </span>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* High Risk Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">High-Risk Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Gaps</TableHead>
                  <TableHead>Gap Closure</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highRisk.map((p) => {
                  const total = p.conditions.length + p.gaps.length;
                  const pct = Math.round((p.conditions.length / total) * 100);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={riskColor[p.riskLevel]}>{p.riskLevel}</Badge>
                      </TableCell>
                      <TableCell>{p.gaps.length}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-2 w-16" />
                          <span className="text-xs text-muted-foreground">{pct}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
