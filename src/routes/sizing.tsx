import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataSourcePanel } from "@/components/DataSourcePanel";
import { sendPrompt } from "@/lib/send-prompt";
import { makeSyntheticWorkbook, useWorkbooks } from "@/lib/workbook-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sizing")({
  head: () => ({
    meta: [
      { title: "Field Force Sizing · procDNA" },
      { name: "description", content: "Bottom-up sales force sizing across workload scenarios." },
    ],
  }),
  component: SizingPage,
});

type Scenario = "normal" | "reach" | "frequency" | "segment";
const MODULE_ID = "sizing";

const SCENARIOS: { id: Scenario; label: string; mult: number; note: string }[] = [
  { id: "normal", label: "Normal Workload", mult: 1, note: "Baseline call plan" },
  { id: "reach", label: "Reach", mult: 1.18, note: "Wider HCP coverage, lower freq" },
  { id: "frequency", label: "Frequency", mult: 1.32, note: "Deeper engagement, narrow target" },
  { id: "segment", label: "Segment", mult: 1.09, note: "Tier-weighted prioritization" },
];

function SizingPage() {
  const { selectionByModule, getById, add } = useWorkbooks();
  const sourceId = selectionByModule[MODULE_ID];
  const source = sourceId ? getById(sourceId) : undefined;

  const [workingDays, setWorkingDays] = useState(220);
  const [callsPerDay, setCallsPerDay] = useState(8);
  const [tiers, setTiers] = useState([
    { tier: "1", hcps: 1200, freq: 24 },
    { tier: "2", hcps: 3400, freq: 12 },
    { tier: "3", hcps: 5800, freq: 6 },
    { tier: "Monitor", hcps: 4200, freq: 2 },
  ]);
  const [active, setActive] = useState<Scenario>("normal");

  const baseline = useMemo(() => {
    const totalCalls = tiers.reduce((s, t) => s + t.hcps * t.freq, 0);
    const capacity = workingDays * callsPerDay;
    return { totalCalls, reps: Math.ceil(totalCalls / Math.max(capacity, 1)) };
  }, [tiers, workingDays, callsPerDay]);

  const scenarioReps = (mult: number) =>
    Math.ceil((baseline.totalCalls * mult) / Math.max(workingDays * callsPerDay, 1));

  const updateTier = (i: number, key: "hcps" | "freq", v: number) =>
    setTiers((t) => t.map((row, idx) => (idx === i ? { ...row, [key]: v } : row)));

  const handleExport = () => {
    sendPrompt({
      skill: "sizing-skill",
      prompt: `Field force sizing from ${source?.name}. Days=${workingDays}, calls/day=${callsPerDay}. Tiers=${JSON.stringify(tiers)}. Active=${active}.`,
      artifact: "FieldForce_Sizing.xlsx (7 sheets + tornado chart)",
    });
    add(
      makeSyntheticWorkbook({
        name: "FieldForce_Sizing.xlsx",
        module: MODULE_ID,
        sheets: [
          {
            name: "Summary",
            rows: [
              ["Source", source?.name ?? ""],
              ["Active scenario", active],
              ["Reps required", scenarioReps(SCENARIOS.find((s) => s.id === active)!.mult)],
              ["Total calls/yr", baseline.totalCalls],
            ],
          },
          {
            name: "Inputs",
            rows: [
              ["Working days/yr", workingDays],
              ["Calls/day/rep", callsPerDay],
              ["Capacity/rep", workingDays * callsPerDay],
            ],
          },
          {
            name: "Tiers",
            rows: [["Tier", "HCPs", "Calls/yr"], ...tiers.map((t) => [t.tier, t.hcps, t.freq])],
          },
          {
            name: "Scenarios",
            rows: [
              ["Scenario", "Multiplier", "Reps"],
              ...SCENARIOS.map((s) => [s.label, s.mult, scenarioReps(s.mult)]),
            ],
          },
        ],
      })
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Module 02 · sizing-skill"
        title="Field Force Sizing"
        description="Upload HCP plan → bottom-up workload model → scenario comparison with sensitivity tornado."
        actions={
          source ? (
            <Button size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export formula workbook
            </Button>
          ) : null
        }
      />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <DataSourcePanel module={MODULE_ID} label="Call-plan / HCP universe data" />

        {source && (
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <section className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
                <h2 className="text-sm font-semibold">Capacity inputs</h2>
                <div className="mt-4 space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Working days / year</Label>
                    <Input
                      type="number"
                      value={workingDays}
                      onChange={(e) => setWorkingDays(+e.target.value || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Calls / day / rep</Label>
                    <Input
                      type="number"
                      value={callsPerDay}
                      onChange={(e) => setCallsPerDay(+e.target.value || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div className="rounded-md bg-background px-3 py-2 text-xs font-mono tabular-nums text-muted-foreground">
                    Capacity / rep ={" "}
                    <span className="text-foreground">{workingDays * callsPerDay}</span> calls/yr
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
                <h2 className="text-sm font-semibold">HCP universe &amp; call frequency</h2>
                <div className="mt-4 space-y-2">
                  <div className="grid grid-cols-[80px_1fr_1fr] gap-2 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <div>Tier</div>
                    <div>HCPs</div>
                    <div>Calls/yr</div>
                  </div>
                  {tiers.map((t, i) => (
                    <div key={t.tier} className="grid grid-cols-[80px_1fr_1fr] items-center gap-2">
                      <div className="grid h-9 place-items-center rounded-md bg-foreground px-2 text-[11px] font-bold text-background">
                        {t.tier}
                      </div>
                      <Input
                        type="number"
                        value={t.hcps}
                        onChange={(e) => updateTier(i, "hcps", +e.target.value || 0)}
                      />
                      <Input
                        type="number"
                        value={t.freq}
                        onChange={(e) => updateTier(i, "freq", +e.target.value || 0)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {SCENARIOS.map((s) => {
                  const reps = scenarioReps(s.mult);
                  const delta = reps - baseline.reps;
                  const isActive = active === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActive(s.id)}
                      className={cn(
                        "rounded-lg border bg-card p-4 text-left transition-all",
                        isActive ? "border-foreground shadow-sm" : "border-border hover:border-foreground/40"
                      )}
                    >
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        {s.id}
                      </div>
                      <div className="mt-1 text-sm font-semibold">{s.label}</div>
                      <div className="mt-3 font-mono text-3xl font-bold tabular-nums">{reps}</div>
                      <div className="text-[10px] text-muted-foreground">reps required</div>
                      <div
                        className={cn(
                          "mt-2 inline-flex items-center gap-1 text-xs font-mono",
                          delta === 0 ? "text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {delta > 0 ? <TrendingUp className="h-3 w-3" /> : delta < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        {delta > 0 ? "+" : ""}
                        {delta} vs baseline
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">{s.note}</p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold">
                    Active scenario · {SCENARIOS.find((s) => s.id === active)?.label}
                  </h2>
                  <div className="text-xs font-mono text-muted-foreground">
                    Total calls/yr{" "}
                    <span className="text-foreground">{baseline.totalCalls.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                  {tiers.map((t) => {
                    const calls = t.hcps * t.freq;
                    const pct = baseline.totalCalls ? (calls / baseline.totalCalls) * 100 : 0;
                    return (
                      <div key={t.tier} className="rounded-md border border-border bg-background p-3">
                        <div className="text-[10px] font-mono uppercase text-muted-foreground">Tier {t.tier}</div>
                        <div className="mt-1 font-mono text-lg font-semibold tabular-nums">
                          {calls.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{pct.toFixed(1)}% of plan</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground sm:p-5">
                <div className="font-mono uppercase tracking-wider text-[10px] text-foreground/60">
                  Workbook sheets
                </div>
                <div className="mt-2 grid grid-cols-1 gap-1.5 font-mono sm:grid-cols-2">
                  <div>1. Summary</div>
                  <div>2. Inputs</div>
                  <div>3. Normal_Workload</div>
                  <div>4. Reach_Scenario</div>
                  <div>5. Frequency_Scenario</div>
                  <div>6. Segment_Scenario</div>
                  <div>7. Sensitivity + tornado</div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
