import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { managedChaseLists, getListStatusCounts } from "@/data/managerData";
import type { ManagedChaseList } from "@/data/managerData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, MoreHorizontal, Download, Archive, ArrowUpDown, Pencil, Copy, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ReassignPatientsDialog } from "@/components/ReassignPatientsDialog";
import { EditListDialog } from "@/components/EditListDialog";

type StatusTab = "all" | "active" | "draft" | "completed" | "archived";
type SortKey = "name" | "dueDate" | "progress" | "scheduled";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary border-primary/30",
  completed: "bg-success/10 text-success border-success/30",
  archived: "bg-muted text-muted-foreground",
};

const campaignColors: Record<string, string> = {
  "AWV": "bg-chart-1/10 text-chart-1 border-chart-1/30",
  "Quality Gap": "bg-chart-2/10 text-chart-2 border-chart-2/30",
  "Newly Attributed": "bg-chart-3/10 text-chart-3 border-chart-3/30",
  "Disease-Specific": "bg-chart-4/10 text-chart-4 border-chart-4/30",
  "Custom": "bg-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

export default function ListManagement() {
  const navigate = useNavigate();
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Dialog state
  const [reassignList, setReassignList] = useState<ManagedChaseList | null>(null);
  const [editList, setEditList] = useState<ManagedChaseList | null>(null);
  const [archiveConfirm, setArchiveConfirm] = useState<{ ids: string[]; names: string[] } | null>(null);
  const [duplicateConfirm, setDuplicateConfirm] = useState<ManagedChaseList | null>(null);

  const tabs: { key: StatusTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: managedChaseLists.length },
    { key: "active", label: "Active", count: managedChaseLists.filter(l => l.status === "active").length },
    { key: "draft", label: "Draft", count: managedChaseLists.filter(l => l.status === "draft").length },
    { key: "completed", label: "Completed", count: managedChaseLists.filter(l => l.status === "completed").length },
    { key: "archived", label: "Archived", count: managedChaseLists.filter(l => l.status === "archived").length },
  ];

  const filtered = useMemo(() => {
    let lists = [...managedChaseLists];
    if (statusTab !== "all") lists = lists.filter(l => l.status === statusTab);
    if (searchQuery) lists = lists.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (campaignFilter !== "all") lists = lists.filter(l => l.campaignType === campaignFilter);

    lists.sort((a, b) => {
      let diff = 0;
      if (sortKey === "name") diff = a.name.localeCompare(b.name);
      else if (sortKey === "dueDate") diff = a.dueDate.localeCompare(b.dueDate);
      else if (sortKey === "progress") {
        const aP = a.patients.length > 0 ? a.patients.filter(p => p.status !== "untouched").length / a.patients.length : 0;
        const bP = b.patients.length > 0 ? b.patients.filter(p => p.status !== "untouched").length / b.patients.length : 0;
        diff = aP - bP;
      } else if (sortKey === "scheduled") {
        diff = a.patients.filter(p => p.status === "scheduled").length - b.patients.filter(p => p.status === "scheduled").length;
      }
      return sortDir === "desc" ? -diff : diff;
    });
    return lists;
  }, [statusTab, searchQuery, campaignFilter, sortKey, sortDir]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(l => l.id));
  };

  const isDuePast = (date: string) => new Date(date) < new Date();

  const handleExportSelected = () => {
    const selectedLists = managedChaseLists.filter(l => selectedIds.includes(l.id));
    const header = "List Name,Campaign,Status,Due Date,Total Patients,Scheduled\n";
    const rows = selectedLists.map(l => {
      const counts = getListStatusCounts(l);
      return `"${l.name}","${l.campaignType}","${l.status}","${l.dueDate}",${l.patients.length},${counts.scheduled}`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chase_lists_export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${selectedLists.length} list(s) exported as CSV`);
  };

  const handleBulkReassign = () => {
    // Collect all patient IDs from selected lists
    const allPatientIds = managedChaseLists
      .filter(l => selectedIds.includes(l.id))
      .flatMap(l => l.patients.map(p => p.patientId));
    const uniqueIds = [...new Set(allPatientIds)];
    // Use the first selected list for context
    const firstList = managedChaseLists.find(l => selectedIds.includes(l.id));
    if (firstList) {
      setReassignList({ ...firstList, patients: firstList.patients.filter(p => uniqueIds.includes(p.patientId)) } as any);
    }
  };

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <Button variant="ghost" size="sm" className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
      onClick={() => { if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDir("asc"); } }}>
      {label}<ArrowUpDown className={cn("ml-1 h-3 w-3", sortKey === k ? "text-primary" : "opacity-40")} />
    </Button>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">List Management</h1>
          <p className="text-muted-foreground mt-1">Create, assign, monitor, and manage chase lists</p>
        </div>
        <Button onClick={() => navigate("/lists/builder")}>
          <Plus className="h-4 w-4 mr-2" />Create List
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 border-b">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              statusTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label} <span className="text-xs ml-1 opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search lists…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={campaignFilter} onValueChange={setCampaignFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Campaign type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="AWV">AWV</SelectItem>
            <SelectItem value="Quality Gap">Quality Gap</SelectItem>
            <SelectItem value="Newly Attributed">Newly Attributed</SelectItem>
            <SelectItem value="Disease-Specific">Disease-Specific</SelectItem>
          </SelectContent>
        </Select>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
            <Button variant="outline" size="sm" onClick={handleBulkReassign}>
              <UserPlus className="h-3.5 w-3.5 mr-1" />Reassign
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const names = managedChaseLists.filter(l => selectedIds.includes(l.id)).map(l => l.name);
              setArchiveConfirm({ ids: selectedIds, names });
            }}>
              <Archive className="h-3.5 w-3.5 mr-1" />Archive
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportSelected}>
              <Download className="h-3.5 w-3.5 mr-1" />Export
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={selectedIds.length === filtered.length && filtered.length > 0} onCheckedChange={toggleSelectAll} />
                </TableHead>
                <TableHead><SortBtn k="name" label="List Name" /></TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Created</TableHead>
                <TableHead><SortBtn k="dueDate" label="Due Date" /></TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead><SortBtn k="progress" label="Progress" /></TableHead>
                <TableHead><SortBtn k="scheduled" label="Scheduled" /></TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(list => {
                const counts = getListStatusCounts(list);
                const worked = list.patients.length - counts.untouched;
                const pct = list.patients.length > 0 ? Math.round((worked / list.patients.length) * 100) : 0;
                const scheduled = counts.scheduled;
                const pastDue = isDuePast(list.dueDate);

                return (
                  <TableRow key={list.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/manager/lists/${list.id}`)}>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Checkbox checked={selectedIds.includes(list.id)} onCheckedChange={() => toggleSelect(list.id)} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{list.name}</span>
                        {list.priority === "high" && <span className={cn("ml-2 text-xs", priorityColors.high)}>● High</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", campaignColors[list.campaignType])}>{list.campaignType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {list.createdAt}<br /><span className="text-xs">by {list.createdBy}</span>
                    </TableCell>
                    <TableCell className={cn("text-sm", pastDue && list.status === "active" && "text-destructive font-medium")}>
                      {list.dueDate}
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {list.assignedUsers.slice(0, 3).map(u => (
                          <Avatar key={u.userId} className="h-7 w-7 border-2 border-background">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{u.userName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                        ))}
                        {list.assignedUsers.length > 3 && (
                          <Avatar className="h-7 w-7 border-2 border-background">
                            <AvatarFallback className="text-[10px] bg-muted">+{list.assignedUsers.length - 3}</AvatarFallback>
                          </Avatar>
                        )}
                        {list.assignedUsers.length === 0 && <span className="text-xs text-muted-foreground">Unassigned</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{worked}/{list.patients.length}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{scheduled}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs capitalize", statusColors[list.status])}>{list.status}</Badge>
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditList(list)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setReassignList(list)}>
                            <UserPlus className="h-3.5 w-3.5 mr-2" />Reassign
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDuplicateConfirm(list)}>
                            <Copy className="h-3.5 w-3.5 mr-2" />Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setArchiveConfirm({ ids: [list.id], names: [list.name] })}>
                            <Archive className="h-3.5 w-3.5 mr-2" />Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    No lists found. Adjust your filters or create a new list.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reassign Dialog */}
      <ReassignPatientsDialog
        open={!!reassignList}
        onClose={() => setReassignList(null)}
        patientIds={reassignList?.patients.map(p => p.patientId) || []}
        currentAssignees={reassignList?.assignedUsers.map(u => ({ userId: u.userId, userName: u.userName })) || []}
        contextLabel={reassignList?.name}
      />

      {/* Edit Dialog */}
      <EditListDialog
        open={!!editList}
        onClose={() => setEditList(null)}
        list={editList}
      />

      {/* Archive Confirm Dialog */}
      <Dialog open={!!archiveConfirm} onOpenChange={o => !o && setArchiveConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-muted-foreground" />
              Archive {archiveConfirm?.ids.length === 1 ? "List" : `${archiveConfirm?.ids.length} Lists`}
            </DialogTitle>
            <DialogDescription>
              {archiveConfirm?.ids.length === 1
                ? `Are you sure you want to archive "${archiveConfirm?.names[0]}"? Archived lists can be restored later.`
                : `Are you sure you want to archive ${archiveConfirm?.ids.length} lists? Archived lists can be restored later.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveConfirm(null)}>Cancel</Button>
            <Button onClick={() => {
              toast.success(`${archiveConfirm?.ids.length} list(s) archived`);
              setSelectedIds(prev => prev.filter(id => !archiveConfirm?.ids.includes(id)));
              setArchiveConfirm(null);
            }}>Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Confirm Dialog */}
      <Dialog open={!!duplicateConfirm} onOpenChange={o => !o && setDuplicateConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5 text-primary" />
              Duplicate List
            </DialogTitle>
            <DialogDescription>
              Create a copy of "{duplicateConfirm?.name}" with the same criteria and settings? The new list will be saved as a draft.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateConfirm(null)}>Cancel</Button>
            <Button onClick={() => {
              toast.success(`"${duplicateConfirm?.name} (Copy)" created as draft`);
              setDuplicateConfirm(null);
            }}>Duplicate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
