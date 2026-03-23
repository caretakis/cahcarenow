import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import type { Patient } from "@/data/models";
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CallWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  onLogAndNext?: () => void;
}

const dispositions = [
  "connected", "left_vm", "no_answer", "refused", "wrong_number", "scheduled", "needs_followup"
];

type Phase = "calling" | "connected" | "logging";

export function CallWorkspaceModal({ open, onOpenChange, patient, onLogAndNext }: CallWorkspaceModalProps) {
  const [phase, setPhase] = useState<Phase>("calling");
  const [outcome, setOutcome] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset state when patient changes or modal opens
  useEffect(() => {
    if (open) {
      setPhase("calling");
      setOutcome("");
      setScheduledDate("");
      setFollowUpDate("");
      setNotes("");
      setMuted(false);
      setElapsed(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [open, patient.id]);

  // Simulate ringing → connected after 2-3s
  useEffect(() => {
    if (phase === "calling") {
      const delay = 2000 + Math.random() * 1500;
      const t = setTimeout(() => setPhase("connected"), delay);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Timer for connected phase
  useEffect(() => {
    if (phase === "connected") {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [phase]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("logging");
  };

  const resetAndClose = () => {
    onOpenChange(false);
  };

  const handleLogAndClose = () => {
    resetAndClose();
  };

  const handleLogAndNext = () => {
    if (onLogAndNext) {
      onLogAndNext();
    } else {
      resetAndClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            {phase === "logging" ? "Log Call" : "Call"} — {patient.name}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* CALLING / CONNECTED PHASE */}
          {(phase === "calling" || phase === "connected") && (
            <motion.div
              key="call-active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="py-4 space-y-6"
            >
              {/* Patient info */}
              <div className="text-center space-y-1">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Phone className={`h-7 w-7 text-primary ${phase === "calling" ? "animate-pulse" : ""}`} />
                </div>
                <p className="text-lg font-semibold">{patient.name}</p>
                <p className="text-sm text-muted-foreground font-mono">{patient.phone}</p>
                <p className="text-xs text-muted-foreground">{patient.practice} · {patient.provider}</p>
              </div>

              {/* Status */}
              <div className="text-center">
                {phase === "calling" ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <span className="text-sm text-muted-foreground">Calling…</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      <span className="text-sm text-green-400 font-medium">Connected</span>
                    </div>
                    <p className="text-2xl font-mono font-bold text-foreground">{formatTime(elapsed)}</p>
                  </div>
                )}
              </div>

              {/* Call controls */}
              <div className="flex items-center justify-center gap-4">
                {phase === "connected" && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={() => setMuted(!muted)}
                  >
                    {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-14 w-14 rounded-full"
                  onClick={handleEndCall}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
                {phase === "connected" && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    disabled
                  >
                    <Volume2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* LOGGING PHASE */}
          {phase === "logging" && (
            <motion.div
              key="logging"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 py-2"
            >
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
                <p>📞 {patient.phone} · Call duration: {formatTime(elapsed)}</p>
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

              {outcome !== "scheduled" && (
                <div className="space-y-2">
                  <Label>Follow-up Date</Label>
                  <Input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
                </div>
              )}

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Call notes…" className="h-20" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "logging" && (
          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
            <Button variant="secondary" onClick={handleLogAndClose} disabled={!outcome}>Log & Close</Button>
            {onLogAndNext && (
              <Button onClick={handleLogAndNext} disabled={!outcome}>Log & Next</Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
