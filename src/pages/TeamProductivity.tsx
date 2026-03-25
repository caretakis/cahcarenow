import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userProductivity, managedChaseLists, getListStatusCounts } from "@/data/managerData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell
} from "recharts";
import { TrendingUp, Phone, CalendarCheck, Users, Target, ChevronDown, ChevronRight, UserPlus, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DateRange = "today" | "week" | "month" | "custom";

const segmentColors: Record<string, string> = {
  scheduled: "hsl(152, 60%, 40%)",
  callback: "hsl(210, 80%, 55%)",
  in_progress: "hsl(37, 90%, 55%)",
  declined: "hsl(0, 72%, 51%)",
  not_eligible: "hsl(0, 0%, 55%)",
  untouched: "hsl(0, 0%, 80%)",
};

export default function TeamProductivity() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Summary metrics
  const totalCalls = userProductivity.reduce((s, u) => s + u.callsMade, 0);
  const totalConnected = userProductivity.reduce((s, u) => s + u.callsConnected, 0);
  const totalScheduled = userProductivity.reduce((s, u) => s + u.scheduled, 0);
  const conversionRate = totalConnected > 0 ? Math.round((totalScheduled / totalConnected) * 100) : 0;

  const goalMetrics = [
    { label: "AWV Completion Rate", value: "68%", goal: "80%", icon: Target, trend: "+3%" },
    { label: "Patients Scheduled", value: totalScheduled.toString(), goal: "80", icon: CalendarCheck, trend: "+12" },
    { label: "Calls Made", value: totalCalls.toString(), goal: "400", icon: Phone, trend: "+24" },
    { label: "Conversion Rate", value: `${conversionRate}%`, goal: "60%", icon: TrendingUp, trend: "+2%" },
  ];

  // List progress data for stacked bar chart
  const activeLists = managedChaseLists.filter(l => l.status === "active");
  const listProgressData = activeLists.map(l => {
    const counts = getListStatusCounts(l);
    return {
      name: l.name.length > 25 ? l.name.slice(0, 25) + "…" : l.name,
      scheduled: counts.scheduled,
      callback: counts.callback,
      in_progress: counts.in_progress,
      declined: counts.declined,
      not_eligible: counts.not_eligible,
      untouched: counts.untouched,
    };
  });

  // Scheduling trend (aggregate daily calls from all users)
  const allDates = [...new Set(userProductivity.flatMap(u => u.dailyCalls.map(d => d.date)))].sort();
  const schedulingTrend = allDates.map(date => {
    const entry: Record<string, any> = { date: date.slice(5) };
    let teamTotal = 0;
    userProductivity.forEach(u => {
      const day = u.dailyCalls.find(d => d.date === date);
      entry[u.userName] = day?.scheduled || 0;
      teamTotal += day?.scheduled || 0;
    });
    entry["Team Total"] = teamTotal;
    return entry;
  });

  const lineColors = [
    "hsl(210, 80%, 55%)",
    "hsl(152, 60%, 40%)",
    "hsl(37, 90%, 55%)",
    "hsl(330, 70%, 55%)",
    "hsl(173, 58%, 39%)",
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Productivity</h1>
          <p className="text-muted-foreground mt-1">Performance and goal tracking across your team</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={v => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => toast.success("Report exported")}>
            <Download className="h-4 w-4 mr-1" />Export
          </Button>
        </div>
      </div>

      {/* Goal Progress Cards */}
      <div className="grid grid-cols-4 gap-4">
        {goalMetrics.map(m => (
          <Card key={m.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-2xl font-bold mt-1">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Goal: {m.goal}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <m.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-success font-medium">↑ {m.trend}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* List Progress Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">List Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={listProgressData} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="name" width={160} className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="scheduled" stackId="a" fill={segmentColors.scheduled} name="Scheduled" />
                <Bar dataKey="callback" stackId="a" fill={segmentColors.callback} name="Callback" />
                <Bar dataKey="in_progress" stackId="a" fill={segmentColors.in_progress} name="In Progress" />
                <Bar dataKey="declined" stackId="a" fill={segmentColors.declined} name="Declined" />
                <Bar dataKey="not_eligible" stackId="a" fill={segmentColors.not_eligible} name="Not Eligible" />
                <Bar dataKey="untouched" stackId="a" fill={segmentColors.untouched} name="Untouched" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scheduling Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Scheduling Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={schedulingTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Team Total" stroke="hsl(var(--primary))" strokeWidth={3} name="Team Total" />
                {userProductivity.map((u, i) => (
                  <Line key={u.userId} type="monotone" dataKey={u.userName} stroke={lineColors[i % lineColors.length]} strokeWidth={1} strokeDasharray="4 4" dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Individual Productivity Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Individual Productivity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Lists Active</TableHead>
                <TableHead className="text-right">Patients</TableHead>
                <TableHead className="text-right">Calls Made</TableHead>
                <TableHead className="text-right">Connected</TableHead>
                <TableHead className="text-right">Voicemails</TableHead>
                <TableHead className="text-right">Scheduled</TableHead>
                <TableHead className="text-right">Conversion</TableHead>
                <TableHead className="text-right">Avg Attempts</TableHead>
                <TableHead className="text-right">Goal %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userProductivity.map(u => {
                const goalColor = u.goalPct >= 80 ? "text-success" : u.goalPct >= 50 ? "text-warning" : "text-destructive";
                const isExpanded = expandedUser === u.userId;

                return (
                  <>
                    <TableRow key={u.userId} className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedUser(isExpanded ? null : u.userId)}>
                      <TableCell>{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</TableCell>
                      <TableCell className="font-medium">{u.userName}</TableCell>
                      <TableCell className="text-right">{u.listsActive}</TableCell>
                      <TableCell className="text-right">{u.patientsAssigned}</TableCell>
                      <TableCell className="text-right">{u.callsMade}</TableCell>
                      <TableCell className="text-right">{u.callsConnected}</TableCell>
                      <TableCell className="text-right">{u.voicemails}</TableCell>
                      <TableCell className="text-right font-medium">{u.scheduled}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={u.conversionRate >= 55 ? "default" : "secondary"} className="font-mono text-xs">{u.conversionRate}%</Badge>
                      </TableCell>
                      <TableCell className="text-right">{u.avgAttemptsPerPatient}</TableCell>
                      <TableCell className="text-right">
                        <span className={cn("font-bold", goalColor)}>{u.goalPct}%</span>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={11} className="bg-muted/30 p-0">
                          <div className="p-4 space-y-4">
                            {/* Active lists for this user */}
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Active List Progress</h4>
                              <div className="grid grid-cols-2 gap-3">
                                {managedChaseLists.filter(l => l.status === "active" && l.assignedUsers.some(a => a.userId === u.userId)).map(l => {
                                  const userPts = l.patients.filter(p => p.assignedTo === u.userId);
                                  const done = userPts.filter(p => p.status === "scheduled" || p.status === "declined" || p.status === "not_eligible").length;
                                  const pct = userPts.length > 0 ? Math.round((done / userPts.length) * 100) : 0;
                                  return (
                                    <Card key={l.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/manager/lists/${l.id}`)}>
                                      <CardContent className="p-3">
                                        <p className="text-sm font-medium truncate">{l.name}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                          <Progress value={pct} className="h-1.5 flex-1" />
                                          <span className="text-xs text-muted-foreground">{done}/{userPts.length}</span>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Daily call volume chart */}
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Daily Call Volume (Last 14 Days)</h4>
                              <ResponsiveContainer width="100%" height={160}>
                                <BarChart data={u.dailyCalls}>
                                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                  <XAxis dataKey="date" tickFormatter={d => d.slice(5)} className="text-xs" />
                                  <YAxis className="text-xs" />
                                  <Tooltip />
                                  <Bar dataKey="calls" fill="hsl(210, 80%, 55%)" radius={[2, 2, 0, 0]} name="Calls" />
                                  <Bar dataKey="connected" fill="hsl(152, 60%, 40%)" radius={[2, 2, 0, 0]} name="Connected" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); toast.success("Reassignment dialog would open"); }}>
                                <UserPlus className="h-3.5 w-3.5 mr-1" />Reassign Patients
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
