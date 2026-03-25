import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { managerTeam } from "@/data/managerData";
import { patients } from "@/data/sampleData";
import { toast } from "sonner";
import { UserPlus, ArrowRight } from "lucide-react";

interface ReassignPatientsDialogProps {
  open: boolean;
  onClose: () => void;
  /** Pre-selected patient IDs (from bulk select or all on a list) */
  patientIds: string[];
  /** Current assignee user IDs (to show "from" context) */
  currentAssignees?: { userId: string; userName: string }[];
  /** Context label like the list name */
  contextLabel?: string;
}

export function ReassignPatientsDialog({ open, onClose, patientIds, currentAssignees, contextLabel }: ReassignPatientsDialogProps) {
  const [selectedPatients, setSelectedPatients] = useState<string[]>(patientIds);
  const [targetUser, setTargetUser] = useState<string>("");
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const resetAndClose = () => {
    setStep(1);
    setTargetUser("");
    setSelectedPatients(patientIds);
    onClose();
  };

  // Reset selected patients when dialog opens with new IDs
  const effectivePatients = step === 1 ? patientIds : selectedPatients;

  const togglePatient = (id: string) => {
    setSelectedPatients(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const targetTeamMember = managerTeam.find(t => t.id === targetUser);

  return (
    <Dialog open={open} onOpenChange={o => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Reassign Patients {step > 1 && <Badge variant="outline" className="text-xs ml-2">Step {step} of 3</Badge>}
          </DialogTitle>
          <DialogDescription>
            {contextLabel && <span className="font-medium">{contextLabel}</span>}
            {step === 1 && ` — Select which patients to reassign (${selectedPatients.length} selected)`}
            {step === 2 && " — Choose the receiving team member"}
            {step === 3 && " — Review and confirm the reassignment"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-2 max-h-64 overflow-y-auto py-2">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Checkbox
                checked={selectedPatients.length === patientIds.length}
                onCheckedChange={() => {
                  if (selectedPatients.length === patientIds.length) setSelectedPatients([]);
                  else setSelectedPatients([...patientIds]);
                }}
              />
              <span className="text-sm font-medium">Select all ({patientIds.length})</span>
            </div>
            {patientIds.map(pid => {
              const pt = patients.find(p => p.id === pid);
              return (
                <label key={pid} className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-accent cursor-pointer">
                  <Checkbox checked={selectedPatients.includes(pid)} onCheckedChange={() => togglePatient(pid)} />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{pt?.name || pid}</span>
                    {pt && <span className="text-xs text-muted-foreground ml-2">{pt.provider} · {pt.practice}</span>}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2 py-2">
            <p className="text-sm text-muted-foreground mb-3">Select a team member to receive {selectedPatients.length} patient(s):</p>
            {managerTeam.map(tm => (
              <button
                key={tm.id}
                onClick={() => setTargetUser(tm.id)}
                className={`w-full flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors text-left ${
                  targetUser === tm.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-accent"
                }`}
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
                <Badge>{selectedPatients.length} patient(s)</Badge>
              </div>
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

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
          {step === 1 && (
            <Button disabled={selectedPatients.length === 0} onClick={() => setStep(2)}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {step === 2 && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={!targetUser} onClick={() => setStep(3)}>
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
          {step === 3 && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => {
                toast.success(`${selectedPatients.length} patient(s) reassigned to ${targetTeamMember?.name}`);
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
