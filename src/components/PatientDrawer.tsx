import { Patient } from "@/data/sampleData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X, Phone, Calendar, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PatientDrawerProps {
  patient: Patient | null;
  onClose: () => void;
}

const riskColor: Record<string, string> = {
  Low: "bg-success text-success-foreground",
  Medium: "bg-warning text-warning-foreground",
  High: "bg-accent text-accent-foreground",
  Critical: "bg-destructive text-destructive-foreground",
};

export function PatientDrawer({ patient, onClose }: PatientDrawerProps) {
  if (!patient) return null;

  const gapsClosed = patient.conditions.length;
  const totalGaps = gapsClosed + patient.gaps.length;
  const gapPct = totalGaps > 0 ? Math.round((gapsClosed / totalGaps) * 100) : 100;

  return (
    <div className="w-[380px] border-l bg-card flex flex-col h-full shrink-0 overflow-y-auto">
      <div className="flex items-center justify-between p-5 border-b">
        <h2 className="text-lg font-semibold">{patient.name}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-5 space-y-6 flex-1">
        {/* Demographics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Age</span>
            <p className="font-medium">{patient.age} ({patient.gender})</p>
          </div>
          <div>
            <span className="text-muted-foreground">Insurance</span>
            <p className="font-medium">{patient.insurance}</p>
          </div>
          <div>
            <span className="text-muted-foreground">PCP</span>
            <p className="font-medium">{patient.pcp}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Risk Score</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{patient.riskScore}</span>
              <Badge className={riskColor[patient.riskLevel]} variant="secondary">
                {patient.riskLevel}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Care Gaps */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Care Gap Closure</h3>
            <span className="text-xs text-muted-foreground">{gapPct}%</span>
          </div>
          <Progress value={gapPct} className="h-2" />
          {patient.gaps.length > 0 && (
            <ul className="mt-3 space-y-2">
              {patient.gaps.map((gap) => (
                <li key={gap} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Separator />

        {/* Conditions */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Active Conditions</h3>
          <div className="flex flex-wrap gap-1.5">
            {patient.conditions.map((c) => (
              <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Visits */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Last Visit</span>
            <p className="font-medium">{patient.lastVisit}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Next Visit</span>
            <p className="font-medium">{patient.nextVisit}</p>
          </div>
        </div>

        {/* TOC info */}
        {patient.tocStatus && (
          <>
            <Separator />
            <div className="text-sm space-y-1">
              <h3 className="font-semibold">Transition of Care</h3>
              <p><span className="text-muted-foreground">Facility:</span> {patient.facility}</p>
              <p><span className="text-muted-foreground">Discharged:</span> {patient.dischargeDate}</p>
              <Badge variant="outline">{patient.tocStatus}</Badge>
            </div>
          </>
        )}
      </div>

      <div className="border-t p-4 flex gap-2">
        <Button className="flex-1 gap-2" size="sm">
          <Phone className="h-3.5 w-3.5" /> Call
        </Button>
        <Button variant="outline" className="flex-1 gap-2" size="sm">
          <Calendar className="h-3.5 w-3.5" /> Schedule
        </Button>
      </div>
    </div>
  );
}
