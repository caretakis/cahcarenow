import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Shield, Database } from "lucide-react";

export default function Admin() {
  const sections = [
    { title: "User Management", description: "Manage roles and permissions", icon: Users, count: "12 users" },
    { title: "Queue Configuration", description: "Configure work queue rules and assignments", icon: Settings, count: "4 queues" },
    { title: "Role Permissions", description: "Set role-based access controls", icon: Shield, count: "6 roles" },
    { title: "Data Sources", description: "Manage data integrations and feeds", icon: Database, count: "5 sources" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <p className="text-muted-foreground mt-1">System configuration and management</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map(s => (
          <Card key={s.title} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{s.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{s.count}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
