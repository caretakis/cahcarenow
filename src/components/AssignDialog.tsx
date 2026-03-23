import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { Patient } from "@/data/models";
import { TEAM_MEMBERS } from "@/components/ViewingAsSelector";

interface AssignDialogProps {
  patient: Patient | null;
  onClose: () => void;
}

export function AssignDialog({ patient, onClose }: AssignDialogProps) {
  const [assignee, setAssignee] = useState("");
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    const member = TEAM_MEMBERS.find(m => m.id === assignee);
    toast.success(`${patient?.name} assigned to ${member?.name || assignee}`, {
      description: notes || undefined,
    });
    setAssignee("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={!!patient} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Assign — {patient?.name}
          </DialogTitle>
          <DialogDescription>Reassign this patient to a team member.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger><SelectValue placeholder="Select team member…" /></SelectTrigger>
              <SelectContent>
                {TEAM_MEMBERS.filter(m => m.id !== "me").map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Assignment notes…" className="h-20" />
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!assignee}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
