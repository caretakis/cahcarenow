import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { managedChaseLists, getListStatusCounts, getUserStatsForList, activityLog } from "@/data/managerData";
import type { ListPatientStatus } from "@/data/managerData";
import { patients, getPatientNeeds } from "@/data/sampleData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Download, Pencil, UserPlus, ChevronDown, ChevronRight, Users, CalendarCheck, Phone, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ReassignPatientsDialog } from "@/components/ReassignPatientsDialog";
import { EditListDialog } from "@/components/EditListDialog";
import { MarkNotEligibleDialog } from "@/components/MarkNotEligibleDialog";

const statusColors: Record<ListPatientStatus, string> = {
  untouched: "bg-muted text-muted-foreground",
  in_progress: "bg-warning/10 text-warning border-warning/30",
  scheduled: "bg-success/10 text-success border-success/30",
  callback: "bg-info/10 text-info border-info/30",
  declined: "bg-destructive/10 text-destructive border-destructive/30",
  not_eligible: "bg-muted text-muted-foreground",
};

const segmentColors: Record<string, string> = {
  scheduled: "bg-success",
  callback: "bg-info",
  in_progress: "bg-warning",
  declined: "bg-destructive",
  not_eligible: "bg-muted-foreground",
  untouched: "bg-muted",
};

export default function ListDetail() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const list = managedChaseLists.find(l => l.id === listId);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [patientUserFilter, setPatientUserFilter] = useState<string>("all");
  const [patientStatusFilter, setPatientStatusFilter] = useState<string>("all");
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);

  // Dialog state
  const [showReassign, setShowReassign] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showNotEligible, setShowNotEligible] = useState(false);
  const [reassignPatientIds, setReassignPatientIds] = useState<string[]>([]);

  const counts = list ? getListStatusCounts(list) : { untouched: 0, in_progress: 0, scheduled: 0, callback: 0, declined: 0, not_eligible: 0 };
  const total = list ? list.patients.length : 0;
  const completed = counts.scheduled + counts.declined + counts.not_eligible;
  const remaining = total - completed;

  const metrics = [
    { label: "Total Patients", value: total, icon: Users },
    { label: "Completed", value: completed, icon: Phone },
    { label: "Scheduled", value: counts.scheduled, icon: CalendarCheck },
    { label: "Remaining", value: remaining, icon: Clock },
  ];

  const userBreakdown = list ? list.assignedUsers.map(u => ({
    ...u,
    stats: getUserStatsForList(list, u.userId),
    conversionRate: (() => {
      const s = getUserStatsForList(list, u.userId);
      return s.connected > 0 ? Math.round((s.scheduled / s.connected) * 100) : 0;
    })(),
  })) : [];

  const segments = [
    { key: "scheduled", label: "Scheduled", count: counts.scheduled },
    { key: "callback", label: "Callback", count: counts.callback },
    { key: "in_progress", label: "In Progress", count: counts.in_progress },
    { key: "declined", label: "Declined", count: counts.declined },
    { key: "not_eligible", label: "Not Eligible", count: counts.not_eligible },
    { key: "untouched", label: "Untouched", count: counts.untouched },
  ];

  const filteredPatients = useMemo(() => {
    if (!list) return [];
    return list.patients.filter(p => {
      if (patientUserFilter !== "all" && p.assignedTo !== patientUserFilter) return false;
      if (patientStatusFilter !== "all" && p.status !== patientStatusFilter) return false;
      return true;
    });
  }, [list?.patients, patientUserFilter, patientStatusFilter]);

  const listActivity = list ? activityLog.filter(a => a.listId === list.id).sort((a, b) => b.timestamp.localeCompare(a.timestamp)) : [];

  const getPatient = (id: string) => patients.find(p => p.id === id);

  const handleExport = () => {
    if (!list) return;
    const header = "Patient,Provider,Practice,Risk,RAF Opp,Assigned To,Status,Attempts,Last Attempt,Notes\n";
    const rows = list.patients.map(lp => {
      const pt = getPatient(lp.patientId);
      const assignee = list.assignedUsers.find(u => u.userId === lp.assignedTo);
      return `"${pt?.name || lp.patientId}","${pt?.provider || ""}","${pt?.practice || ""}","${pt?.riskTier || ""}",${pt?.rafOpportunity || 0},"${assignee?.userName || ""}","${lp.status}",${lp.attempts},"${lp.lastAttemptDate || ""}","${lp.notes}"`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${list.name.replace(/\s+/g, "_")}_patients.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Patient list exported as CSV");
  };

  const handleExportActivity = () => {
    const header = "Timestamp,User,Patient,Action,Details\n";
    const rows = listActivity.map(e =>
      `"${e.timestamp}","${e.userName}","${e.patientName || ""}","${e.action}","${e.details}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${list?.name.replace(/\s+/g, "_")}_activity_log.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Activity log exported as CSV");
  };

  const openReassignAll = () => {
    if (!list) return;
    setReassignPatientIds(list.patients.map(p => p.patientId));
    setShowReassign(true);
  };

  const openReassignSelected = () => {
    setReassignPatientIds([...selectedPatientIds]);
    setShowReassign(true);
  };

  if (!list) return (
    <div className="p-8 text-center text-muted-foreground">
      <p>List not found</p>
      <Button variant="link" onClick={() => navigate("/manager/lists")}>Back to List Management</Button>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/manager/lists")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{list.name}</h1>
            <Badge variant="outline" className="capitalize">{list.status}</Badge>
            {list.priority === "high" && <Badge variant="destructive" className="text-xs">High Priority</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Created {list.createdAt} · Due {list.dueDate}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openReassignAll}>
            <UserPlus className="h-4 w-4 mr-1" />Reassign
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Pencil className="h-4 w-4 mr-1" />Edit
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patient Detail</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Overview ── */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-4 gap-4">
            {metrics.map(m => (
              <Card key={m.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <m.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex h-4 rounded-full overflow-hidden">
                {segments.filter(s => s.count > 0).map(s => (
                  <div key={s.key} className={cn("h-full transition-all", segmentColors[s.key])} style={{ width: `${(s.count / total) * 100}%` }} title={`${s.label}: ${s.count}`} />
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {segments.filter(s => s.count > 0).map(s => (
                  <div key={s.key} className="flex items-center gap-1.5 text-xs">
                    <div className={cn("h-2.5 w-2.5 rounded-full", segmentColors[s.key])} />
                    <span className="text-muted-foreground">{s.label}: <strong>{s.count}</strong></span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Per-User Breakdown</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Assigned</TableHead>
                    <TableHead className="text-right">Called</TableHead>
                    <TableHead className="text-right">Connected</TableHead>
                    <TableHead className="text-right">Scheduled</TableHead>
                    <TableHead className="text-right">Declined</TableHead>
                    <TableHead className="text-right">Not Eligible</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead className="text-right">Conversion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userBreakdown.map(u => (
                    <>
                      <TableRow key={u.userId} className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedUser(expandedUser === u.userId ? null : u.userId)}>
                        <TableCell>{expandedUser === u.userId ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</TableCell>
                        <TableCell className="font-medium">{u.userName}</TableCell>
                        <TableCell className="text-right">{u.stats.assigned}</TableCell>
                        <TableCell className="text-right">{u.stats.called}</TableCell>
                        <TableCell className="text-right">{u.stats.connected}</TableCell>
                        <TableCell className="text-right font-medium text-success">{u.stats.scheduled}</TableCell>
                        <TableCell className="text-right">{u.stats.declined}</TableCell>
                        <TableCell className="text-right">{u.stats.notEligible}</TableCell>
                        <TableCell className="text-right">{u.stats.remaining}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={u.conversionRate >= 50 ? "default" : "secondary"} className="font-mono text-xs">{u.conversionRate}%</Badge>
                        </TableCell>
                      </TableRow>
                      {expandedUser === u.userId && (
                        <TableRow>
                          <TableCell colSpan={10} className="bg-muted/30 p-0">
                            <div className="p-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Attempts</TableHead>
                                    <TableHead>Last Attempt</TableHead>
                                    <TableHead>Notes</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {list.patients.filter(p => p.assignedTo === u.userId).map(lp => {
                                    const pt = getPatient(lp.patientId);
                                    return (
                                      <TableRow key={lp.patientId}>
                                        <TableCell>
                                          <button className="font-medium text-primary hover:underline" onClick={() => pt && navigate(`/patients/${pt.id}`)}>{pt?.name || lp.patientId}</button>
                                        </TableCell>
                                        <TableCell><Badge variant="outline" className={cn("capitalize text-xs", statusColors[lp.status])}>{lp.status.replace("_", " ")}</Badge></TableCell>
                                        <TableCell>{lp.attempts}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{lp.lastAttemptDate || "—"}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{lp.notes || "—"}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                  <TableRow className="font-semibold border-t-2">
                    <TableCell></TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{total}</TableCell>
                    <TableCell className="text-right">{userBreakdown.reduce((s, u) => s + u.stats.called, 0)}</TableCell>
                    <TableCell className="text-right">{userBreakdown.reduce((s, u) => s + u.stats.connected, 0)}</TableCell>
                    <TableCell className="text-right text-success">{counts.scheduled}</TableCell>
                    <TableCell className="text-right">{counts.declined}</TableCell>
                    <TableCell className="text-right">{counts.not_eligible}</TableCell>
                    <TableCell className="text-right">{userBreakdown.reduce((s, u) => s + u.stats.remaining, 0)}</TableCell>
                    <TableCell className="text-right">
                      {(() => {
                        const totalConn = userBreakdown.reduce((s, u) => s + u.stats.connected, 0);
                        return totalConn > 0 ? `${Math.round((counts.scheduled / totalConn) * 100)}%` : "—";
                      })()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Patient Detail ── */}
        <TabsContent value="patients" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <Select value={patientUserFilter} onValueChange={setPatientUserFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Filter by user" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {list.assignedUsers.map(u => <SelectItem key={u.userId} value={u.userId}>{u.userName}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={patientStatusFilter} onValueChange={setPatientStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="untouched">Untouched</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="callback">Callback</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="not_eligible">Not Eligible</SelectItem>
              </SelectContent>
            </Select>
            {selectedPatientIds.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">{selectedPatientIds.length} selected</span>
                <Button variant="outline" size="sm" onClick={openReassignSelected}>
                  <UserPlus className="h-3.5 w-3.5 mr-1" />Reassign
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowNotEligible(true)}>
                  Mark Not Eligible
                </Button>
              </div>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedPatientIds.length === filteredPatients.length && filteredPatients.length > 0}
                        onCheckedChange={() => {
                          if (selectedPatientIds.length === filteredPatients.length) setSelectedPatientIds([]);
                          else setSelectedPatientIds(filteredPatients.map(p => p.patientId));
                        }}
                      />
                    </TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>PCP / Practice</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>RAF Opp</TableHead>
                    <TableHead>Open Gaps</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Last Attempt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Callback</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map(lp => {
                    const pt = getPatient(lp.patientId);
                    if (!pt) return null;
                    const gapCount = getPatientNeeds(pt.id).filter(n => n.status !== "COMPLETED").length;
                    const assignedUser = list.assignedUsers.find(u => u.userId === lp.assignedTo);

                    return (
                      <TableRow key={lp.patientId}>
                        <TableCell onClick={e => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedPatientIds.includes(lp.patientId)}
                            onCheckedChange={() => setSelectedPatientIds(prev =>
                              prev.includes(lp.patientId) ? prev.filter(x => x !== lp.patientId) : [...prev, lp.patientId]
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <button className="font-medium text-primary hover:underline" onClick={() => navigate(`/patients/${pt.id}`)}>{pt.name}</button>
                        </TableCell>
                        <TableCell className="text-sm">
                          {pt.provider}<br /><span className="text-xs text-muted-foreground">{pt.practice}</span>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="capitalize text-xs">{pt.riskTier.replace("_", " ")}</Badge></TableCell>
                        <TableCell>+{pt.rafOpportunity}</TableCell>
                        <TableCell><Badge variant="secondary">{gapCount}</Badge></TableCell>
                        <TableCell className="text-sm">{assignedUser?.userName || "—"}</TableCell>
                        <TableCell>{lp.attempts}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lp.lastAttemptDate ? (
                            <span>{lp.lastAttemptDate}<br /><span className="text-xs">{lp.lastOutcome}</span></span>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("capitalize text-xs", statusColors[lp.status])}>{lp.status.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{lp.callbackDate || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate" title={lp.notes}>{lp.notes || "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredPatients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">No patients match the current filters</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Activity Log ── */}
        <TabsContent value="activity" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{listActivity.length} activities recorded</p>
            <Button variant="outline" size="sm" onClick={handleExportActivity}>
              <Download className="h-4 w-4 mr-1" />Export
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listActivity.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{entry.userName}</TableCell>
                      <TableCell className="text-sm">
                        {entry.patientName ? (
                          <button className="text-primary hover:underline" onClick={() => entry.patientId && navigate(`/patients/${entry.patientId}`)}>{entry.patientName}</button>
                        ) : "—"}
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{entry.action}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[300px]">{entry.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ReassignPatientsDialog
        open={showReassign}
        onClose={() => { setShowReassign(false); setReassignPatientIds([]); }}
        patientIds={reassignPatientIds}
        currentAssignees={list.assignedUsers.map(u => ({ userId: u.userId, userName: u.userName }))}
        contextLabel={list.name}
      />
      <EditListDialog open={showEdit} onClose={() => setShowEdit(false)} list={list} />
      <MarkNotEligibleDialog open={showNotEligible} onClose={() => { setShowNotEligible(false); setSelectedPatientIds([]); }} patientIds={selectedPatientIds} />
    </div>
  );
}
