import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, TrendingUp, TrendingDown, Minus, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/FileUpload";
import { sendPrompt } from "@/lib/send-prompt";
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

type Tier = { id: string; tier: string; hcps: number; freq: number };
type Scenario = { id: string; label: string; mult: number; note: string };

const DEFAULT_TIERS: Tier[] = [
  { id: "t1", tier: "1", hcps: 1200, freq: 24 },
  { id: "t2", tier: "2", hcps: 3400, freq: 12 },
  { id: "t3", tier: "3", hcps: 5800, freq: 6 },
  { id: "tm", tier: "Monitor", hcps: 4200, freq: 2 },
];

const DEFAULT_SCENARIOS: Scenario[] = [
  { id: "normal", label: "Normal Workload", mult: 1.0, note: "Baseline call plan" },
  { id: "reach", label: "Reach", mult: 1.18, note: "Wider HCP coverage, lower freq" },
  { id: "frequency", label: "Frequency", mult: 1.32, note: "Deeper engagement, narrow target" },
  { id: "segment", label: "Segment", mult: 1.09, note: "Tier-weighted prioritization" },
];

function SizingPage() {
  const [workingDays, setWorkingDays] = useState(220);
  const [callsPerDay, setCallsPerDay] = useState(8);
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS);
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS);
  const [activeId, setActiveId] = useState<string>("normal");

  const baseline = useMemo(() => {
    const totalCalls = tiers.reduce((s, t) => s + t.hcps * t.freq, 0);
    const capacity = Math.max(workingDays * callsPerDay, 1);
    return { totalCalls, reps: Math.ceil(totalCalls / capacity) };
  }, [tiers, workingDays, callsPerDay]);

  const scenarioReps = (mult: number) =>
    Math.ceil((baseline.totalCalls * mult) / Math.max(workingDays * callsPerDay, 1));

  const updateTier = <K extends keyof Tier>(id: string, key: K, v: Tier[K]) =>
    setTiers((t) => t.map((r) => (r.id === id ? { ...r, [key]: v } : r)));
  const addTier = () =>
    setTiers((t) => [
      ...t,
      { id: crypto.randomUUID(), tier: String(t.length + 1), hcps: 0, freq: 0 },
    ]);
  const removeTier = (id: string) => setTiers((t) => t.filter((r) => r.id !== id));

  const updateScenario = <K extends keyof Scenario>(id: string, key: K, v: Scenario[K]) =>
    setScenarios((s) => s.map((r) => (r.id === id ? { ...r, [key]: v } : r)));
  const addScenario = () => {
    const id = crypto.randomUUID();
    setScenarios((s) => [...s, { id, label: "New scenario", mult: 1.0, note: "" }]);
  };
  const removeScenario = (id: string) => {
    setScenarios((s) => s.filter((r) => r.id !== id));
    if (activeId === id) setActiveId(scenarios.find((s) => s.id !== id)?.id ?? "");
  };

  const active = scenarios.find((s) => s.id === activeId) ?? scenarios[0];

  const handleExport = () => {
    sendPrompt({
      skill: "sizing-skill",
      prompt: `Field force sizing. Days=${workingDays}, calls/day=${callsPerDay}. Tiers=${JSON.stringify(
        tiers,
      )}. Scenarios=${JSON.stringify(scenarios)}. Active=${active?.label}.`,
      artifact: "FieldForce_Sizing.xlsx (7 sheets + tornado chart)",
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Module 02 · sizing-skill"
        title="Field Force Sizing"
        description="Bottom-up workload model with editable tiers and scenarios."
        actions={
          <Button size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export formula workbook
          </Button>
        }
      />

      <div className="grid gap-6 p-8 lg:grid-cols-[380px_1fr]">
        {/* Inputs */}
        <section className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Source data</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload HCP universe or call plan file.
            </p>
            <div className="mt-3">
              <FileUpload module="sizing" skill="sizing-skill" compact />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
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

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">HCP universe &amp; frequency</h2>
              <Button variant="outline" size="sm" onClick={addTier}>
                <Plus className="mr-1 h-3 w-3" />
                Tier
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-[90px_1fr_1fr_28px] gap-2 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                <div>Tier</div>
                <div>HCPs</div>
                <div>Calls/yr</div>
                <div />
              </div>
              {tiers.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-[90px_1fr_1fr_28px] gap-2 items-center"
                >
                  <Input
                    value={t.tier}
                    onChange={(e) => updateTier(t.id, "tier", e.target.value)}
                    className="h-9 text-center text-[11px] font-bold"
                  />
                  <Input
                    type="number"
                    value={t.hcps}
                    onChange={(e) => updateTier(t.id, "hcps", +e.target.value || 0)}
                  />
                  <Input
                    type="number"
                    value={t.freq}
                    onChange={(e) => updateTier(t.id, "freq", +e.target.value || 0)}
                  />
                  <button
                    onClick={() => removeTier(t.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Scenarios */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Scenarios</h2>
            <Button variant="outline" size="sm" onClick={addScenario}>
              <Plus className="mr-1 h-3 w-3" />
              Scenario
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {scenarios.map((s) => {
              const reps = scenarioReps(s.mult);
              const baseReps = baseline.reps;
              const delta = reps - baseReps;
              const isActive = activeId === s.id;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "relative rounded-lg border bg-card p-4 transition-all",
                    isActive
                      ? "border-foreground shadow-sm"
                      : "border-border hover:border-foreground/40",
                  )}
                >
                  <button
                    onClick={() => removeScenario(s.id)}
                    className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveId(s.id)}
                    className="block w-full text-left"
                  >
                    <Input
                      value={s.label}
                      onChange={(e) => updateScenario(s.id, "label", e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-7 border-0 bg-transparent p-0 text-sm font-semibold shadow-none focus-visible:ring-0"
                    />
                    <div className="mt-2 font-mono text-3xl font-bold tabular-nums">{reps}</div>
                    <div className="text-[10px] text-muted-foreground">reps required</div>
                    <div
                      className={cn(
                        "mt-2 inline-flex items-center gap-1 text-xs font-mono",
                        delta === 0 ? "text-muted-foreground" : "text-foreground",
                      )}
                    >
                      {delta > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : delta < 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {delta > 0 ? "+" : ""}
                      {delta} vs baseline
                    </div>
                  </button>
                  <div className="mt-3 flex items-center gap-2">
                    <Label className="text-[10px] uppercase text-muted-foreground">Mult</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={s.mult}
                      onChange={(e) => updateScenario(s.id, "mult", +e.target.value || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <Input
                    value={s.note}
                    onChange={(e) => updateScenario(s.id, "note", e.target.value)}
                    placeholder="Notes"
                    className="mt-2 h-7 text-[11px]"
                  />
                </div>
              );
            })}
          </div>

          {active && (
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Active scenario · {active.label}</h2>
                <div className="text-xs font-mono text-muted-foreground">
                  Total calls/yr{" "}
                  <span className="text-foreground">{baseline.totalCalls.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(tiers.length, 1)}, minmax(0, 1fr))` }}>
                {tiers.map((t) => {
                  const calls = t.hcps * t.freq;
                  const pct = baseline.totalCalls ? (calls / baseline.totalCalls) * 100 : 0;
                  return (
                    <div key={t.id} className="rounded-md border border-border bg-background p-3 text-center">
                      <div className="text-[10px] font-mono uppercase text-muted-foreground">
                        Tier {t.tier}
                      </div>
                      <div className="mt-1 font-mono text-lg font-semibold tabular-nums">
                        {calls.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{pct.toFixed(1)}% of plan</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-5 text-xs text-muted-foreground">
            <div className="font-mono uppercase tracking-wider text-[10px] text-foreground/60">
              Workbook sheets
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono">
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
    </>
  );
}
