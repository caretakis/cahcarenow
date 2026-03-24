import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopKPIBar } from "@/components/TopKPIBar";
import { Progress } from "@/components/ui/progress";
import {
  needs, episodes, patients, medAdherenceRecords, weeklyTrend,
  outreachLog, programEnrollments, slaComplianceData, protocolAdherence
} from "@/data/sampleData";
import { TEAM_MEMBERS } from "@/components/ViewingAsSelector";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar
} from "recharts";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Clock, Users, TrendingUp, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Derive manager-level metrics from sample data
const totalPatients = patients.length;
const openNeeds = needs.filter(n => n.status === "OPEN").length;
const completedNeeds = needs.filter(n => n.status === "COMPLETED" || n.status === "SCHEDULED").length;
const inProgressNeeds = needs.filter(n => n.status === "IN_PROGRESS").length;

const activeTOCs = episodes.filter(e => e.status === "ACTIVE").length;
const admittedTOCs = episodes.filter(e => e.currentStage === "admitted").length;
const dischargedTOCs = episodes.filter(e => e.currentStage === "discharged" || e.currentStage === "interactive_contact").length;

const medAtRisk = medAdherenceRecords.filter(m => m.riskLevel === "at_risk" || m.riskLevel === "overdue").length;
const medOnTrack = medAdherenceRecords.filter(m => m.riskLevel === "on_track").length;

const totalCalls4w = weeklyTrend.reduce((s, w) => s + w.calls, 0);
const totalContacts4w = weeklyTrend.reduce((s, w) => s + w.contacts, 0);
const totalScheduled4w = weeklyTrend.reduce((s, w) => s + w.scheduled, 0);
const totalGapsClosed4w = weeklyTrend.reduce((s, w) => s + w.gapsClosed, 0);

// Team member productivity (simulated per-person breakdown)
const teamMembers = TEAM_MEMBERS.filter(m => m.id !== "me");
const teamProductivity = [
  { name: "Lisa T.", calls: 128, contacts: 48, scheduled: 24, gapsClosed: 22 },
  { name: "Karen W.", calls: 115, contacts: 42, scheduled: 20, gapsClosed: 18 },
  { name: "Sarah M.", calls: 142, contacts: 55, scheduled: 30, gapsClosed: 26 },
  { name: "Mike R.", calls: 98, contacts: 38, scheduled: 18, gapsClosed: 14 },
  { name: "James P.", calls: 27, contacts: 12, scheduled: 12, gapsClosed: 3 },
];

// Gap closure by type
const gapsByType = [
  { type: "AWV", open: needs.filter(n => n.type === "AWV" && n.status === "OPEN").length, closed: 14 },
  { type: "Quality", open: needs.filter(n => n.type === "QUALITY_GAP" && n.status === "OPEN").length, closed: 8 },
  { type: "HCC", open: needs.filter(n => n.type === "HCC_RECAPTURE" && n.status === "OPEN").length, closed: 6 },
  { type: "Med Adh.", open: needs.filter(n => n.type === "MED_ADHERENCE" && n.status === "OPEN").length, closed: 5 },
];

// TOC SLA compliance pie
const tocOnTime = 4;
const tocAtRisk = 2;
const tocOverdue = 1;
const slaPieData = [
  { name: "On-time", value: tocOnTime, fill: "hsl(152, 60%, 40%)" },
  { name: "At-risk", value: tocAtRisk, fill: "hsl(37, 90%, 55%)" },
  { name: "Overdue", value: tocOverdue, fill: "hsl(0, 72%, 51%)" },
];

// Risk tier distribution
const riskDistribution = [
  { tier: "Very High", count: patients.filter(p => p.riskTier === "very_high").length, fill: "hsl(0, 72%, 51%)" },
  { tier: "High", count: patients.filter(p => p.riskTier === "high").length, fill: "hsl(37, 90%, 55%)" },
  { tier: "Medium", count: patients.filter(p => p.riskTier === "medium").length, fill: "hsl(210, 80%, 55%)" },
  { tier: "Low", count: patients.filter(p => p.riskTier === "low").length, fill: "hsl(152, 60%, 40%)" },
];

export default function ManagerDashboard() {
  const kpis = [
    { label: "Active Patients", value: totalPatients },
    { label: "Open Needs", value: openNeeds, urgent: openNeeds > 10 },
    { label: "Gaps Closed (4w)", value: totalGapsClosed4w },
    { label: "Active TOCs", value: activeTOCs },
    { label: "Meds At Risk", value: medAtRisk, urgent: true },
    { label: "Contact Rate", value: `${Math.round((totalContacts4w / totalCalls4w) * 100)}%` },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manager Dashboard</h1>
        <p className="text-muted-foreground mt-1">Team performance overview across all initiatives</p>
      </div>

      <TopKPIBar items={kpis} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Team Productivity Comparison */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Team Productivity (4 weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={teamProductivity} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="calls" fill="hsl(210, 80%, 55%)" radius={[2, 2, 0, 0]} name="Calls" />
                <Bar dataKey="contacts" fill="hsl(173, 58%, 39%)" radius={[2, 2, 0, 0]} name="Contacts" />
                <Bar dataKey="scheduled" fill="hsl(152, 60%, 40%)" radius={[2, 2, 0, 0]} name="Scheduled" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gap Closure by Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Gap Closure by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={gapsByType} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="type" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="open" fill="hsl(37, 90%, 55%)" radius={[2, 2, 0, 0]} name="Open" />
                <Bar dataKey="closed" fill="hsl(152, 60%, 40%)" radius={[2, 2, 0, 0]} name="Closed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* TOC SLA Compliance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              TOC 48h SLA Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={slaPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {slaPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Activity Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Weekly Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="gapsClosed" stroke="hsl(152, 60%, 40%)" strokeWidth={2} name="Gaps Closed" />
                <Line type="monotone" dataKey="awvCompleted" stroke="hsl(173, 58%, 39%)" strokeWidth={2} name="AWVs" />
                <Line type="monotone" dataKey="scheduled" stroke="hsl(210, 80%, 55%)" strokeWidth={2} name="Scheduled" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Patient Risk Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Patient Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskDistribution.map(r => {
                const pct = Math.round((r.count / totalPatients) * 100);
                return (
                  <div key={r.tier}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{r.tier}</span>
                      <span className="text-muted-foreground">{r.count} patients ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: r.fill }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Protocol Adherence */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Protocol Step Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {protocolAdherence.map(step => (
              <div key={step.step}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{step.step}</span>
                  <span className={`font-medium ${step.completionRate < 60 ? "text-destructive" : step.completionRate < 80 ? "text-warning" : "text-success"}`}>
                    {step.completionRate}%
                  </span>
                </div>
                <Progress value={step.completionRate} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team Member Detail Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Team Member Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Member</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Contacts</TableHead>
                  <TableHead className="text-right">Scheduled</TableHead>
                  <TableHead className="text-right">Gaps Closed</TableHead>
                  <TableHead className="text-right">Contact Rate</TableHead>
                  <TableHead className="text-right">Conversion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamProductivity.map(m => {
                  const contactRate = Math.round((m.contacts / m.calls) * 100);
                  const conversion = Math.round((m.scheduled / m.contacts) * 100);
                  return (
                    <TableRow key={m.name}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className="text-right">{m.calls}</TableCell>
                      <TableCell className="text-right">{m.contacts}</TableCell>
                      <TableCell className="text-right">{m.scheduled}</TableCell>
                      <TableCell className="text-right">{m.gapsClosed}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={contactRate >= 35 ? "default" : "destructive"} className="font-mono text-xs">
                          {contactRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={conversion >= 45 ? "default" : "secondary"} className="font-mono text-xs">
                          {conversion}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* SLA by Team */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">TOC SLA Compliance by Team</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>On-time</TableHead>
                  <TableHead>At-risk</TableHead>
                  <TableHead>Overdue</TableHead>
                  <TableHead>Overall</TableHead>
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
                    <TableCell>
                      <Progress value={row.onTime} className="h-2 w-24" />
                    </TableCell>
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
