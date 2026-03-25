import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { managerTeam } from "@/data/managerData";
import { patients } from "@/data/sampleData";
import { toast } from "sonner";
import { UserPlus, ArrowRight, ArrowLeft, Filter, Hash, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReassignPatientsDialogProps {
  open: boolean;
  onClose: () => void;
  patientIds: string[];
  currentAssignees?: { userId: string; userName: string }[];
  contextLabel?: string;
}

type SelectionMode = "manual" | "quantity" | "group";
type GroupByKey = "payer" | "practice" | "provider";

export function ReassignPatientsDialog({ open, onClose, patientIds, currentAssignees, contextLabel }: ReassignPatientsDialogProps) {
  const [selectedPatients, setSelectedPatients] = useState<string[]>(patientIds);
  const [targetUser, setTargetUser] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("manual");
  const [quantity, setQuantity] = useState("");
  const [groupByKey, setGroupByKey] = useState<GroupByKey>("payer");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const resolvedPatients = useMemo(
    () => patientIds.map(pid => patients.find(p => p.id === pid)).filter(Boolean) as typeof patients,
    [patientIds]
  );

  // Group patients by the selected key
  const groupedPatients = useMemo(() => {
    const groups: Record<string, typeof patients> = {};
    for (const pt of resolvedPatients) {
      const key = pt[groupByKey] || "Unknown";
      if (!groups[key]) groups[key] = [];
      groups[key].push(pt);
    }
    return groups;
  }, [resolvedPatients, groupByKey]);

  // Derive effective selection based on mode
  const effectiveSelection = useMemo(() => {
    if (selectionMode === "manual") return selectedPatients;
    if (selectionMode === "quantity") {
      const n = Math.min(Math.max(parseInt(quantity) || 0, 0), patientIds.length);
      return patientIds.slice(0, n);
    }
    if (selectionMode === "group") {
      return resolvedPatients.filter(pt => selectedGroups.includes(pt[groupByKey] || "Unknown")).map(pt => pt.id);
    }
    return [];
  }, [selectionMode, selectedPatients, quantity, patientIds, resolvedPatients, selectedGroups, groupByKey]);

  const resetAndClose = () => {
    setStep(1);
    setTargetUser("");
    setSelectedPatients(patientIds);
    setSelectionMode("manual");
    setQuantity("");
    setSelectedGroups([]);
    onClose();
  };

  const togglePatient = (id: string) => {
    setSelectedPatients(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleGroup = (group: string) => {
    setSelectedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
  };

  const targetTeamMember = managerTeam.find(t => t.id === targetUser);

  const groupByLabel: Record<GroupByKey, string> = { payer: "Payer", practice: "Practice", provider: "PCP" };

  return (
    <Dialog open={open} onOpenChange={o => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Reassign Patients
            {step > 1 && <Badge variant="outline" className="text-xs ml-2">Step {step} of 3</Badge>}
          </DialogTitle>
          <DialogDescription>
            {contextLabel && <span className="font-medium">{contextLabel}</span>}
            {step === 1 && ` — Select patients to reassign (${effectiveSelection.length} of ${patientIds.length})`}
            {step === 2 && " — Choose the receiving team member"}
            {step === 3 && " — Review and confirm"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {step === 1 && (
            <Tabs value={selectionMode} onValueChange={v => setSelectionMode(v as SelectionMode)} className="space-y-3">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="manual" className="text-xs gap-1"><Users className="h-3.5 w-3.5" />Manual</TabsTrigger>
                <TabsTrigger value="quantity" className="text-xs gap-1"><Hash className="h-3.5 w-3.5" />By Quantity</TabsTrigger>
                <TabsTrigger value="group" className="text-xs gap-1"><Filter className="h-3.5 w-3.5" />By Group</TabsTrigger>
              </TabsList>

              {/* Manual selection */}
              <TabsContent value="manual" className="space-y-1 max-h-56 overflow-y-auto">
                <label className="flex items-center gap-2 pb-2 border-b cursor-pointer">
                  <Checkbox
                    checked={selectedPatients.length === patientIds.length}
                    onCheckedChange={() => {
                      setSelectedPatients(selectedPatients.length === patientIds.length ? [] : [...patientIds]);
                    }}
                  />
                  <span className="text-sm font-medium">Select all ({patientIds.length})</span>
                </label>
                {resolvedPatients.map(pt => (
                  <label key={pt.id} className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-accent cursor-pointer">
                    <Checkbox checked={selectedPatients.includes(pt.id)} onCheckedChange={() => togglePatient(pt.id)} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{pt.name}</span>
                      <span className="text-xs text-muted-foreground ml-2 truncate">{pt.payer} · {pt.practice} · {pt.provider}</span>
                    </div>
                  </label>
                ))}
              </TabsContent>

              {/* By Quantity */}
              <TabsContent value="quantity" className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground">
                  Select the first <strong>N</strong> patients from the list to reassign.
                </p>
                <div className="flex items-center gap-3">
                  <Label htmlFor="qty" className="whitespace-nowrap">Number of patients:</Label>
                  <Input
                    id="qty"
                    type="number"
                    min={1}
                    max={patientIds.length}
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder={`1–${patientIds.length}`}
                    className="w-28"
                  />
                  <span className="text-sm text-muted-foreground">of {patientIds.length}</span>
                </div>
                {parseInt(quantity) > 0 && (
                  <div className="bg-muted/50 rounded-md p-3 text-sm">
                    <span className="font-medium">{Math.min(parseInt(quantity) || 0, patientIds.length)}</span> patient(s) will be reassigned (first {Math.min(parseInt(quantity) || 0, patientIds.length)} in list order).
                  </div>
                )}
              </TabsContent>

              {/* By Group */}
              <TabsContent value="group" className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label className="whitespace-nowrap text-sm">Group by:</Label>
                  <Select value={groupByKey} onValueChange={v => { setGroupByKey(v as GroupByKey); setSelectedGroups([]); }}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payer">Payer</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="provider">PCP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {Object.entries(groupedPatients).sort((a, b) => b[1].length - a[1].length).map(([group, pts]) => (
                    <label
                      key={group}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md border cursor-pointer transition-colors",
                        selectedGroups.includes(group) ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                      )}
                    >
                      <Checkbox checked={selectedGroups.includes(group)} onCheckedChange={() => toggleGroup(group)} />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{group}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{pts.length} patient{pts.length !== 1 ? "s" : ""}</Badge>
                    </label>
                  ))}
                </div>
                {selectedGroups.length > 0 && (
                  <div className="bg-muted/50 rounded-md p-3 text-sm">
                    <span className="font-medium">{effectiveSelection.length}</span> patient(s) across {selectedGroups.length} {groupByLabel[groupByKey].toLowerCase()}(s) selected.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {step === 2 && (
            <div className="space-y-2 py-2">
              <p className="text-sm text-muted-foreground mb-3">Select a team member to receive {effectiveSelection.length} patient(s):</p>
              {managerTeam.map(tm => (
                <button
                  key={tm.id}
                  onClick={() => setTargetUser(tm.id)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors text-left",
                    targetUser === tm.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <div className="flex-1">
                    <div className="font-medium">{tm.name}</div>
                    <div className="text-xs text-muted-foreground">{tm.role}</div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{tm.activeListCount} lists</div>
                    <div>{tm.patientsAssigned} patients</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Reassigning</span>
                  <Badge>{effectiveSelection.length} patient(s)</Badge>
                </div>
                {selectionMode === "group" && selectedGroups.length > 0 && (
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <span className="text-muted-foreground">{groupByLabel[groupByKey]}:</span>
                    {selectedGroups.map(g => <Badge key={g} variant="outline" className="text-xs">{g}</Badge>)}
                  </div>
                )}
                {currentAssignees && currentAssignees.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">From:</span>
                    <span>{[...new Set(currentAssignees.map(a => a.userName))].join(", ")}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-medium text-primary">{targetTeamMember?.name}</span>
                  <span className="text-xs text-muted-foreground">({targetTeamMember?.role})</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Both the current and new assignee will be notified of this change.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
          {step === 1 && (
            <Button disabled={effectiveSelection.length === 0} onClick={() => setStep(2)}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {step === 2 && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
              <Button disabled={!targetUser} onClick={() => setStep(3)}>
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
          {step === 3 && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
              <Button onClick={() => {
                toast.success(`${effectiveSelection.length} patient(s) reassigned to ${targetTeamMember?.name}`);
                resetAndClose();
              }}>
                Confirm Reassignment
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
