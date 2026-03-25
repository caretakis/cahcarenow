import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { patients } from "@/data/sampleData";
import { toast } from "sonner";
import { XCircle } from "lucide-react";

interface MarkNotEligibleDialogProps {
  open: boolean;
  onClose: () => void;
  patientIds: string[];
}

export function MarkNotEligibleDialog({ open, onClose, patientIds }: MarkNotEligibleDialogProps) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const resetAndClose = () => {
    setReason("");
    setNotes("");
    onClose();
  };

  const patientNames = patientIds.map(id => patients.find(p => p.id === id)?.name || id);

  return (
    <Dialog open={open} onOpenChange={o => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Mark Not Eligible
          </DialogTitle>
          <DialogDescription>
            {patientIds.length === 1
              ? `Mark ${patientNames[0]} as not eligible for this list.`
              : `Mark ${patientIds.length} patients as not eligible.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Select reason…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="switched_provider">Switched provider</SelectItem>
                <SelectItem value="deceased">Deceased</SelectItem>
                <SelectItem value="disenrolled">Disenrolled from plan</SelectItem>
                <SelectItem value="duplicate">Duplicate record</SelectItem>
                <SelectItem value="already_completed">Already completed elsewhere</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional context…" rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
          <Button variant="destructive" disabled={!reason} onClick={() => {
            toast.success(`${patientIds.length} patient(s) marked as not eligible`);
            resetAndClose();
          }}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
