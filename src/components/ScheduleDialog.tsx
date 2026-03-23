import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import type { Patient } from "@/data/models";

interface ScheduleDialogProps {
  patient: Patient | null;
  onClose: () => void;
}

const visitTypes = ["AWV", "Follow-up", "New Patient", "Telehealth", "Lab/Screening", "Specialist Referral"];

export function ScheduleDialog({ patient, onClose }: ScheduleDialogProps) {
  const [visitType, setVisitType] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    toast.success(`Appointment scheduled for ${patient?.name}`, {
      description: `${visitType} on ${new Date(date).toLocaleDateString()}`,
    });
    setVisitType("");
    setDate("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={!!patient} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Schedule — {patient?.name}
          </DialogTitle>
          <DialogDescription>Schedule a visit for this patient.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
            <p>{patient?.phone} · {patient?.practice} · {patient?.provider}</p>
          </div>
          <div className="space-y-2">
            <Label>Visit Type</Label>
            <Select value={visitType} onValueChange={setVisitType}>
              <SelectTrigger><SelectValue placeholder="Select visit type…" /></SelectTrigger>
              <SelectContent>
                {visitTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date & Time</Label>
            <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Scheduling notes…" className="h-20" />
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!visitType || !date}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
