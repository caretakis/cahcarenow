import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Episode } from "@/data/models";
import { toast } from "sonner";

const NURSES = ["Lisa Thompson", "Karen Wells", "Amy Chen", "Dana Roberts"];
const CARE_COORDINATORS = ["Sarah Mitchell", "Mike Rodriguez", "Jessica Park", "Tom Nguyen"];

interface TOCReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episode: Episode;
  patientName: string;
}

export function TOCReassignDialog({ open, onOpenChange, episode, patientName }: TOCReassignDialogProps) {
  const [nurse, setNurse] = useState(episode.assignedNurse);
  const [cc, setCc] = useState(episode.assignedCareCoordinator);

  const handleSave = () => {
    toast.success("Assignments updated", {
      description: `Nurse: ${nurse}, Care Coordinator: ${cc}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign TOC Episode</DialogTitle>
          <DialogDescription>
            {patientName} — {episode.admitReason}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Current stage:</span>
            <Badge variant="outline">{episode.currentStage.replace(/_/g, " ")}</Badge>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Assigned Nurse (RN)</Label>
            <p className="text-xs text-muted-foreground">Responsible for interactive contact and clinical assessments</p>
            <Select value={nurse} onValueChange={setNurse}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {NURSES.map(n => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Care Coordinator (CC)</Label>
            <p className="text-xs text-muted-foreground">Responsible for follow-ups, scheduling, and most tasks</p>
            <Select value={cc} onValueChange={setCc}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CARE_COORDINATORS.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Assignments</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
