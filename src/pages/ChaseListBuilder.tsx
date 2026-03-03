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
import { Upload, Save, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const toggleItem = (list: string[], v: string) =>
  list.includes(v) ? list.filter(r => r !== v) : [...list, v];

export default function ChaseListBuilder() {
  const [openAWV, setOpenAWV] = useState(false);
  const [riskTiers, setRiskTiers] = useState<string[]>([]);
  const [minRAF, setMinRAF] = useState("");
  const [selectedPayers, setSelectedPayers] = useState<string[]>([]);
  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);

  const uniquePayers = useMemo(() => [...new Set(patients.map(p => p.payer))].sort(), []);
  const uniquePractices = useMemo(() => [...new Set(patients.map(p => p.practice))].sort(), []);
  const uniqueProviders = useMemo(() => [...new Set(patients.map(p => p.provider))].sort(), []);
  // Partners: using address city as a proxy for partner/region
  const uniquePartners = useMemo(() => [...new Set(patients.map(p => p.address.split(",")[0].trim()))].sort(), []);

  const preview = patients.filter(p => {
    if (openAWV && p.lastAWV && new Date(p.lastAWV) > new Date("2025-03-01")) return false;
    if (riskTiers.length > 0 && !riskTiers.includes(p.riskTier)) return false;
    if (minRAF && p.rafOpportunity < parseFloat(minRAF)) return false;
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
              <Label className="text-sm">Min RAF Opportunity</Label>
              <Input type="number" step="0.1" value={minRAF} onChange={e => setMinRAF(e.target.value)} placeholder="e.g. 0.3" className="mt-1.5" />
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
            <Button size="sm"><Save className="h-4 w-4 mr-2" />Save & Assign</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>RAF Opp</TableHead>
                  <TableHead>HCCs</TableHead>
                  <TableHead>Last AWV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{p.riskTier.replace("_", " ")}</Badge></TableCell>
                    <TableCell>+{p.rafOpportunity}</TableCell>
                    <TableCell>{p.hccCount}</TableCell>
                    <TableCell>{p.lastAWV || "None"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
