import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { Patient } from "@/data/models";

interface EscalateDialogProps {
  patient: Patient | null;
  onClose: () => void;
}

const escalationReasons = [
  "Clinical concern",
  "Unable to reach after 3+ attempts",
  "Patient requested provider callback",
  "Medication safety issue",
  "Social determinant barrier",
  "Other",
];

export function EscalateDialog({ patient, onClose }: EscalateDialogProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const handleConfirm = () => {
    toast.success(`${patient?.name} escalated`, {
      description: reason,
    });
    setReason("");
    setDetails("");
    onClose();
  };

  return (
    <Dialog open={!!patient} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Escalate — {patient?.name}
          </DialogTitle>
          <DialogDescription>Flag this patient for supervisor review.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Select reason…" /></SelectTrigger>
              <SelectContent>
                {escalationReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Details</Label>
            <Textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Additional context…" className="h-20" />
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!reason}>Escalate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
