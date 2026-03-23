import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import type { Patient } from "@/data/models";

interface SnoozeDialogProps {
  patient: Patient | null;
  onClose: () => void;
}

export function SnoozeDialog({ patient, onClose }: SnoozeDialogProps) {
  const [until, setUntil] = useState("");
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    toast.success(`${patient?.name} snoozed`, {
      description: `Until ${new Date(until).toLocaleDateString()}`,
    });
    setUntil("");
    setReason("");
    onClose();
  };

  return (
    <Dialog open={!!patient} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Snooze — {patient?.name}
          </DialogTitle>
          <DialogDescription>Temporarily remove this patient from the active queue.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Snooze Until</Label>
            <Input type="date" value={until} onChange={e => setUntil(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Why are you snoozing this patient?" className="h-20" />
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!until}>Snooze</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
