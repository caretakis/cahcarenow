import { useState } from "react";
import { chaseLists } from "@/data/sampleData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ChaseListsHome() {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chase Lists</h1>
          <p className="text-muted-foreground mt-1">Manage and work reusable patient lists</p>
        </div>
        <Button onClick={() => navigate("/lists/builder")}>
          <Plus className="h-4 w-4 mr-2" />
          Build New List
        </Button>
      </div>

      <div className="space-y-4">
        {chaseLists.map(list => {
          const pct = list.stats.total > 0 ? Math.round((list.stats.scheduled / list.stats.total) * 100) : 0;
          return (
            <Card key={list.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate(`/lists/${list.id}`)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{list.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Created by {list.createdBy} · {list.createdAt}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm">
                  <span>Total: <strong>{list.stats.total}</strong></span>
                  <span>Remaining: <strong>{list.stats.remaining}</strong></span>
                  <span>Attempted: <strong>{list.stats.attempted}</strong></span>
                  <span>Connected: <strong>{list.stats.connected}</strong></span>
                  <span>Scheduled: <strong>{list.stats.scheduled}</strong></span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <Progress value={pct} className="h-2 flex-1" />
                  <span className="text-sm font-medium text-muted-foreground">{pct}% scheduled</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
