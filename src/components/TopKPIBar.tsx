import { Card } from "@/components/ui/card";

interface KPIItem {
  label: string;
  value: string | number;
  sublabel?: string;
  urgent?: boolean;
}

interface TopKPIBarProps {
  items: KPIItem[];
}

export function TopKPIBar({ items }: TopKPIBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {items.map((item, i) => (
        <Card key={i} className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
          <p className={`text-2xl font-bold mt-1 ${item.urgent ? "text-destructive" : "text-foreground"}`}>
            {item.value}
          </p>
          {item.sublabel && <p className="text-xs text-muted-foreground mt-0.5">{item.sublabel}</p>}
        </Card>
      ))}
    </div>
  );
}
