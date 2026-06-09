import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Loader2, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataSourcePanel } from "@/components/DataSourcePanel";
import { useWorkbooks } from "@/lib/workbook-store";

export const Route = createFileRoute("/sizing")({
  head: () => ({
    meta: [
      { title: "Field Force Sizing · procDNA" },
      { name: "description", content: "Bottom-up sales force sizing across workload scenarios." },
    ],
  }),
  component: SizingPage,
});

const MODULE_ID = "sizing";
const OUTPUT_FILENAME = "Field_Force_Sizing_v4.xlsx";

function SizingPage() {
  const { selectionByModule, getById } = useWorkbooks();
  const sourceId = selectionByModule[MODULE_ID];
  const source = sourceId ? getById(sourceId) : undefined;

  const [drug, setDrug] = useState("Axatilimab");
  const [indication, setIndication] = useState("Chronic GVHD");
  const [marketType, setMarketType] = useState("rare");
  const [workingDays, setWorkingDays] = useState(220);
  const [callsPerDay, setCallsPerDay] = useState(8);
  const [isRunning, setIsRunning] = useState(false);
  const [done, setDone] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setDone(false);
    await new Promise<void>((resolve) => setTimeout(resolve, 5000));
    const a = document.createElement("a");
    a.href = `/${OUTPUT_FILENAME}`;
    a.download = OUTPUT_FILENAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setIsRunning(false);
    setDone(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Module 02 · sizing-skill"
        title="Field Force Sizing"
        description="Upload HCP plan → configure parameters → run sizing model → download results."
      />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <DataSourcePanel module={MODULE_ID} label="Call-plan / HCP universe data" />

        {source && (
          <div className="max-w-2xl space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Drug / Brand
                </Label>
                <Input
                  value={drug}
                  onChange={(e) => setDrug(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Indication
                </Label>
                <Input
                  value={indication}
                  onChange={(e) => setIndication(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Geography
                </Label>
                <Input
                  value="United States"
                  readOnly
                  className="mt-1 cursor-default bg-muted text-muted-foreground"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Market Type
                </Label>
                <Select value={marketType} onValueChange={setMarketType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rare">Rare disease market</SelectItem>
                    <SelectItem value="broad">Non-rare / Broad specialty</SelectItem>
                    <SelectItem value="specialty">Specialty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Working Days / Year
                </Label>
                <span className="font-mono text-sm font-semibold tabular-nums">{workingDays}</span>
              </div>
              <Slider
                min={100}
                max={365}
                step={5}
                value={[workingDays]}
                onValueChange={([v]) => setWorkingDays(v)}
              />
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Calls Per Day
                </Label>
                <span className="font-mono text-sm font-semibold tabular-nums">{callsPerDay}</span>
              </div>
              <Slider
                min={1}
                max={15}
                step={1}
                value={[callsPerDay]}
                onValueChange={([v]) => setCallsPerDay(v)}
              />
            </div>

            <div className="pt-2">
              <Button onClick={handleRun} disabled={isRunning} size="lg">
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running sizing skill.....
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Run Sizing Skill
                  </>
                )}
              </Button>
            </div>

            {done && (
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Sizing complete
                  </p>
                  <p className="truncate text-xs text-green-600 dark:text-green-400">
                    {OUTPUT_FILENAME}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = `/${OUTPUT_FILENAME}`;
                    a.download = OUTPUT_FILENAME;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Re-download
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
