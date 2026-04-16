import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { tierLabels, tierColors, recordTierChange, type CareTier } from "@/data/populationData";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface TierChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
  currentTier: CareTier;
  newTier: CareTier;
  onComplete?: () => void;
}

export function TierChangeDialog({ open, onOpenChange, patientId, patientName, currentTier, newTier, onComplete }: TierChangeDialogProps) {
  const [justification, setJustification] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    const trimmed = justification.trim();
    if (!trimmed) {
      setError(true);
      return;
    }
    recordTierChange(patientId, currentTier, newTier, trimmed);
    toast.success(`${patientName} moved to Tier ${newTier} — ${tierLabels[newTier]}`);
    setJustification("");
    setError(false);
    onOpenChange(false);
    onComplete?.();
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setJustification("");
      setError(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Care Tier</DialogTitle>
          <DialogDescription>
            Moving <span className="font-medium text-foreground">{patientName}</span> to a new care tier. A justification is required and will be recorded in the patient chart.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground mb-1">Current</p>
              <Badge variant="outline" className={`${tierColors[currentTier]} text-xs font-bold`}>
                Tier {currentTier} — {tierLabels[currentTier]}
              </Badge>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground mb-1">New</p>
              <Badge variant="outline" className={`${tierColors[newTier]} text-xs font-bold`}>
                Tier {newTier} — {tierLabels[newTier]}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="justification">Justification <span className="text-destructive">*</span></Label>
            <Textarea
              id="justification"
              placeholder="Why is this tier change appropriate? (e.g., acuity improved, new diagnosis, post-discharge stabilization…)"
              value={justification}
              onChange={e => { setJustification(e.target.value); setError(false); }}
              className={`min-h-[100px] ${error ? "border-destructive" : ""}`}
              maxLength={500}
            />
            {error && <p className="text-xs text-destructive">Justification is required to change a patient's tier.</p>}
            <p className="text-xs text-muted-foreground text-right">{justification.length}/500</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Confirm Change</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
