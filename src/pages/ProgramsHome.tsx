import { useState, useMemo } from "react";
import { ViewingAsSelector } from "@/components/ViewingAsSelector";
import { programs, programEnrollments, patients, getPatientById } from "@/data/sampleData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";

export default function ProgramsHome() {
  const navigate = useNavigate();
  const [viewingAs, setViewingAs] = useState("me");

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground mt-1">Protocol-driven longitudinal care programs</p>
        </div>
        <ViewingAsSelector value={viewingAs} onChange={setViewingAs} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map(prog => {
          const enrolled = programEnrollments.filter(e => e.programId === prog.id && e.status === "active");
          const overdue = enrolled.filter(e => e.checkpointStatuses.some(c => c.status === "OPEN" && c.nextDue && c.nextDue < "2026-03-02"));
          return (
            <Card key={prog.id} className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => navigate(`/programs/${prog.id}`)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{prog.name}</CardTitle>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground">{prog.enrollmentRule}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary"><Users className="h-3 w-3 mr-1" />{enrolled.length} enrolled</Badge>
                  {overdue.length > 0 && (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                      {overdue.length} overdue
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {prog.checkpoints.map(cp => (
                    <span key={cp.key} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{cp.label}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
