import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { Patient } from "@/data/models";
import { Phone } from "lucide-react";

interface CallWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
}

const dispositions = [
  "connected", "left_vm", "no_answer", "refused", "wrong_number", "scheduled", "needs_followup"
];

export function CallWorkspaceModal({ open, onOpenChange, patient }: CallWorkspaceModalProps) {
  const [outcome, setOutcome] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    // In a real app, this would save to the database
    onOpenChange(false);
    setOutcome("");
    setScheduledDate("");
    setFollowUpDate("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Call Workspace — {patient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
            <p>📞 {patient.phone} · Prefers {patient.preferredContact}</p>
            <p className="mt-1">{patient.practice} · {patient.provider}</p>
          </div>

          <div className="space-y-2">
            <Label>Call Outcome</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger>
                <SelectValue placeholder="Select outcome…" />
              </SelectTrigger>
              <SelectContent>
                {dispositions.map(d => (
                  <SelectItem key={d} value={d}>
                    {d.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {outcome === "scheduled" && (
            <div className="space-y-2">
              <Label>Scheduled Date/Time</Label>
              <Input type="datetime-local" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
            </div>
          )}

          <div className="space-y-2">
            <Label>Follow-up Date</Label>
            <Input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Call notes…" className="h-20" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!outcome}>Log Call</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
