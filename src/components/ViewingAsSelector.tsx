import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye } from "lucide-react";

export const TEAM_MEMBERS = [
  { id: "me", name: "My Queue" },
  { id: "lisa_thompson", name: "Lisa Thompson" },
  { id: "karen_wells", name: "Karen Wells" },
  { id: "sarah_mitchell", name: "Sarah Mitchell" },
  { id: "mike_rodriguez", name: "Mike Rodriguez" },
  { id: "james_park", name: "James Park" },
];

/** Resolve the display name for a ViewingAs ID */
export function getTeamMemberName(id: string): string | null {
  if (id === "me") return null;
  return TEAM_MEMBERS.find(m => m.id === id)?.name ?? null;
}

interface ViewingAsSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ViewingAsSelector({ value, onChange }: ViewingAsSelectorProps) {
  const isCovering = value !== "me";

  return (
    <div className={`flex items-center gap-2 ${isCovering ? "bg-primary/10 rounded-lg px-3 py-1" : ""}`}>
      {isCovering && <Eye className="h-4 w-4 text-primary shrink-0" />}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`h-8 text-sm w-[180px] ${isCovering ? "border-primary/30 bg-transparent" : ""}`}>
          <SelectValue placeholder="My Queue" />
        </SelectTrigger>
        <SelectContent>
          {TEAM_MEMBERS.map(member => (
            <SelectItem key={member.id} value={member.id}>
              {member.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
