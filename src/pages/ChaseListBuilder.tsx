import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { patients } from "@/data/sampleData";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Save, X, Users, Split, Building2, UserCheck, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const toggleItem = (list: string[], v: string) =>
  list.includes(v) ? list.filter(r => r !== v) : [...list, v];

const MOCK_TEAMMATES = ["Sarah M.", "David K.", "Angela R.", "Marcus T.", "Priya S."];

type AssignStrategy = "even" | "by_payer" | "by_practice" | "by_pcp" | "by_partner" | "manual";

export default function ChaseListBuilder() {
  const [openAWV, setOpenAWV] = useState(false);
  const [riskTiers, setRiskTiers] = useState<string[]>([]);
  const [minOpenHcc, setMinOpenHcc] = useState("");
  const [openQualityGaps, setOpenQualityGaps] = useState(false);
  const [selectedPayers, setSelectedPayers] = useState<string[]>([]);
  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [listName, setListName] = useState("");
  const [assignStrategy, setAssignStrategy] = useState<AssignStrategy>("even");
  const [selectedTeammates, setSelectedTeammates] = useState<string[]>([]);

  const uniquePayers = useMemo(() => [...new Set(patients.map(p => p.payer))].sort(), []);
  const uniquePractices = useMemo(() => [...new Set(patients.map(p => p.practice))].sort(), []);
  const uniqueProviders = useMemo(() => [...new Set(patients.map(p => p.provider))].sort(), []);
  // Partners: using address city as a proxy for partner/region
  const uniquePartners = useMemo(() => [...new Set(patients.map(p => p.address.split(",")[0].trim()))].sort(), []);

  const preview = patients.filter(p => {
    if (openAWV && p.lastAWV && new Date(p.lastAWV) > new Date("2025-03-01")) return false;
    if (riskTiers.length > 0 && !riskTiers.includes(p.riskTier)) return false;
    if (minOpenHcc && p.openHccCount < parseInt(minOpenHcc)) return false;
    if (openQualityGaps && p.openQualityGaps < 1) return false;
    if (selectedPayers.length > 0 && !selectedPayers.includes(p.payer)) return false;
    if (selectedPractices.length > 0 && !selectedPractices.includes(p.practice)) return false;
    if (selectedProviders.length > 0 && !selectedProviders.includes(p.provider)) return false;
    if (selectedPartners.length > 0 && !selectedPartners.includes(p.address.split(",")[0].trim())) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chase List Builder</h1>
        <p className="text-muted-foreground mt-1">Define criteria and preview matching patients</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Criteria */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Criteria</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={openAWV} onCheckedChange={() => setOpenAWV(!openAWV)} />
              <span>Open AWV (no AWV in 12 months)</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={openQualityGaps} onCheckedChange={() => setOpenQualityGaps(!openQualityGaps)} />
              <span>Open Quality Gaps (≥ 1 gap)</span>
            </label>
            <div>
              <Label className="text-sm">Risk Tier</Label>
              <div className="space-y-1.5 mt-1.5">
                {["very_high", "high", "medium", "low"].map(t => (
                  <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={riskTiers.includes(t)} onCheckedChange={() => setRiskTiers(prev => toggleItem(prev, t))} />
                    <span className="capitalize">{t.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Multi-select filters */}
            {([
              { label: "Payer", options: uniquePayers, selected: selectedPayers, setSelected: setSelectedPayers },
              { label: "Practice", options: uniquePractices, selected: selectedPractices, setSelected: setSelectedPractices },
              { label: "PCP", options: uniqueProviders, selected: selectedProviders, setSelected: setSelectedProviders },
              { label: "Partner / Region", options: uniquePartners, selected: selectedPartners, setSelected: setSelectedPartners },
            ] as const).map(filter => (
              <div key={filter.label}>
                <Label className="text-sm">{filter.label}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full mt-1.5 justify-between font-normal">
                      {filter.selected.length === 0
                        ? <span className="text-muted-foreground">All</span>
                        : <span className="truncate">{filter.selected.length} selected</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="start">
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {filter.options.map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer px-1 py-0.5 rounded hover:bg-accent">
                          <Checkbox
                            checked={filter.selected.includes(opt)}
                            onCheckedChange={() => filter.setSelected(prev => toggleItem(prev, opt))}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                    {filter.selected.length > 0 && (
                      <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={() => filter.setSelected([])}>
                        <X className="h-3 w-3 mr-1" />Clear
                      </Button>
                    )}
                  </PopoverContent>
                </Popover>
                {filter.selected.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {filter.selected.map(v => (
                      <Badge key={v} variant="secondary" className="text-xs cursor-pointer" onClick={() => filter.setSelected(prev => prev.filter(x => x !== v))}>
                        {v} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div>
              <Label className="text-sm">Min Open HCC Count</Label>
              <Input type="number" step="1" min="0" max="4" value={minOpenHcc} onChange={e => setMinOpenHcc(e.target.value)} placeholder="e.g. 2" className="mt-1.5" />
            </div>
            <div className="pt-2 border-t space-y-2">
              <Button variant="outline" size="sm" className="w-full"><Upload className="h-4 w-4 mr-2" />Upload Cohort CSV</Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Preview ({preview.length} patients)</CardTitle>
            <Button size="sm" onClick={() => setShowAssignDialog(true)} disabled={preview.length === 0}>
              <Save className="h-4 w-4 mr-2" />Save & Assign
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Open HCCs</TableHead>
                  <TableHead>Open Gaps</TableHead>
                  <TableHead>Open Gaps</TableHead>
                  <TableHead>Last AWV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{p.riskTier.replace("_", " ")}</Badge></TableCell>
                    <TableCell>{p.openHccCount}</TableCell>
                    <TableCell>{p.openQualityGaps}</TableCell>
                    <TableCell>{p.hccCount}</TableCell>
                    <TableCell>{p.lastAWV || "None"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Save & Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Save & Assign Chase List</DialogTitle>
            <DialogDescription>
              {preview.length} patients matched. Choose a name, teammates, and how to distribute.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <Label className="text-sm">List Name</Label>
              <Input
                value={listName}
                onChange={e => setListName(e.target.value)}
                placeholder="e.g. Q1 AWV Outreach — Humana"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-sm">Assign To</Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {MOCK_TEAMMATES.map(name => {
                  const selected = selectedTeammates.includes(name);
                  return (
                    <button
                      key={name}
                      onClick={() => setSelectedTeammates(prev => toggleItem(prev, name))}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      <UserCheck className="h-4 w-4" />
                      <span className="flex-1 text-left">{name}</span>
                      {selected && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm">Assignment Strategy</Label>
              <RadioGroup
                value={assignStrategy}
                onValueChange={(v) => setAssignStrategy(v as AssignStrategy)}
                className="mt-2 space-y-2"
              >
                {[
                  { value: "even" as const, icon: Split, label: "Split evenly", desc: `~${selectedTeammates.length > 0 ? Math.ceil(preview.length / selectedTeammates.length) : preview.length} patients each` },
                  { value: "by_payer" as const, icon: Building2, label: "By payer", desc: "Each teammate handles specific payers" },
                  { value: "by_practice" as const, icon: Building2, label: "By practice", desc: "Each teammate handles specific practices" },
                  { value: "by_pcp" as const, icon: Users, label: "By PCP", desc: "Each teammate handles specific providers" },
                  { value: "by_partner" as const, icon: Building2, label: "By partner", desc: "Each teammate handles specific partners/regions" },
                  { value: "manual" as const, icon: UserCheck, label: "Manual assignment", desc: "Assign individual patients yourself" },
                ].map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                      assignStrategy === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"
                    }`}
                  >
                    <RadioGroupItem value={opt.value} className="mt-0.5" />
                    <opt.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button
              disabled={!listName.trim() || selectedTeammates.length === 0}
              onClick={() => {
                toast.success(`Chase list "${listName}" saved and assigned to ${selectedTeammates.length} teammate(s)`);
                setShowAssignDialog(false);
              }}
            >
              <Save className="h-4 w-4 mr-2" />Save & Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
