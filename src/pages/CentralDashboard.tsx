import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopKPIBar } from "@/components/TopKPIBar";
import { weeklyTrend, slaComplianceData, protocolAdherence } from "@/data/sampleData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function CentralDashboard() {
  const totalCalls = weeklyTrend.reduce((s, w) => s + w.calls, 0);
  const totalContacts = weeklyTrend.reduce((s, w) => s + w.contacts, 0);
  const totalScheduled = weeklyTrend.reduce((s, w) => s + w.scheduled, 0);

  const kpis = [
    { label: "Total Calls (4w)", value: totalCalls },
    { label: "Contacts", value: totalContacts },
    { label: "Scheduled", value: totalScheduled },
    { label: "Conversion", value: `${Math.round((totalScheduled / totalContacts) * 100)}%` },
  ];

  const funnelData = [
    { stage: "Calls", value: totalCalls },
    { stage: "Contacts", value: totalContacts },
    { stage: "Scheduled", value: totalScheduled },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Central Dashboard</h1>
        <p className="text-muted-foreground mt-1">Productivity, protocol adherence & outcomes</p>
      </div>

      <TopKPIBar items={kpis} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Calls → Contacts → Scheduled (4 weeks)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="stage" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(173,58%,39%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SLA Compliance */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">TOC 48h SLA Compliance</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>On-time</TableHead>
                  <TableHead>At-risk</TableHead>
                  <TableHead>Overdue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slaComplianceData.map(row => (
                  <TableRow key={row.team}>
                    <TableCell className="font-medium">{row.team}</TableCell>
                    <TableCell>
                      <span className="text-success font-medium">{row.onTime}%</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-warning font-medium">{row.atRisk}%</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-destructive font-medium">{row.overdue}%</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Protocol Step Completion */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Protocol Step Completion Rate</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {protocolAdherence.map(step => (
              <div key={step.step}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{step.step}</span>
                  <span className="font-medium">{step.completionRate}%</span>
                </div>
                <Progress value={step.completionRate} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Weekly Activity Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="calls" stroke="hsl(173,58%,39%)" strokeWidth={2} name="Calls" />
                <Line type="monotone" dataKey="contacts" stroke="hsl(210,80%,55%)" strokeWidth={2} name="Contacts" />
                <Line type="monotone" dataKey="scheduled" stroke="hsl(152,60%,40%)" strokeWidth={2} name="Scheduled" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
