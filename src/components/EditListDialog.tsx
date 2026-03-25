import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Pencil, Save } from "lucide-react";

interface EditListDialogProps {
  open: boolean;
  onClose: () => void;
  list: {
    name: string;
    campaignType: string;
    description: string;
    dueDate: string;
    priority: string;
  } | null;
}

export function EditListDialog({ open, onClose, list }: EditListDialogProps) {
  const [name, setName] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");

  useEffect(() => {
    if (list) {
      setName(list.name);
      setCampaignType(list.campaignType);
      setDescription(list.description);
      setDueDate(list.dueDate);
      setPriority(list.priority);
    }
  }, [list]);

  if (!list) return null;

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Edit List Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>List Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Campaign Type</Label>
            <Select value={campaignType} onValueChange={setCampaignType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AWV">AWV</SelectItem>
                <SelectItem value="Quality Gap">Quality Gap</SelectItem>
                <SelectItem value="Newly Attributed">Newly Attributed</SelectItem>
                <SelectItem value="Disease-Specific">Disease-Specific</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup value={priority} onValueChange={setPriority} className="flex gap-4">
              {["low", "medium", "high"].map(p => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value={p} />
                  <span className="text-sm capitalize">{p}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!name.trim()} onClick={() => {
            toast.success(`List "${name}" updated`);
            onClose();
          }}>
            <Save className="h-4 w-4 mr-1" />Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
