import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/FileUpload";
import { sendPrompt } from "@/lib/send-prompt";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/targeting")({
  head: () => ({
    meta: [
      { title: "HCP Targeting · procDNA" },
      { name: "description", content: "Build weighted HCP target lists with dynamic tier decile distribution." },
    ],
  }),
  component: TargetingPage,
});

type Role = "Prescriber" | "Influencer" | "Decision Maker";
type Metric = { id: string; name: string; role: Role; weight: number };
type Tier = { id: string; tier: string; label: string; min: number; max: number };

const OBJECTIVE = "Non-Rare disease market";

const DEFAULT_METRICS: Metric[] = [
  { id: "m1", name: "Total TRx", role: "Prescriber", weight: 20 },
  { id: "m2", name: "Total Non-Steroid Topical TRx", role: "Prescriber", weight: 20 },
  { id: "m3", name: "Commercial TRx", role: "Decision Maker", weight: 15 },
  { id: "m4", name: "Branded TRx", role: "Prescriber", weight: 15 },
  { id: "m5", name: "Zoryve TRx", role: "Prescriber", weight: 15 },
  { id: "m6", name: "Generic TRx", role: "Prescriber", weight: 15 },
];

const DEFAULT_TIERS: Tier[] = [
  { id: "t1", tier: "1", label: "High frequency", min: 8, max: 10 },
  { id: "t2", tier: "2", label: "Standard Call frequency", min: 4, max: 7 },
  { id: "t3", tier: "3", label: "Low Frequency", min: 1, max: 3 },
];

const ROLES: Role[] = ["Prescriber", "Influencer", "Decision Maker"];

function TargetingPage() {
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [tiers, setTiers] = useState(DEFAULT_TIERS);

  const total = useMemo(() => metrics.reduce((s, m) => s + m.weight, 0), [metrics]);
  const valid = total === 100;

  const updateMetric = <K extends keyof Metric>(id: string, key: K, v: Metric[K]) =>
    setMetrics((m) => m.map((x) => (x.id === id ? { ...x, [key]: v } : x)));
  const addMetric = () =>
    setMetrics((m) => [
      ...m,
      { id: crypto.randomUUID(), name: "New metric", role: "Prescriber", weight: 0 },
    ]);
  const removeMetric = (id: string) => setMetrics((m) => m.filter((x) => x.id !== id));

  const updateTier = <K extends keyof Tier>(id: string, key: K, v: Tier[K]) =>
    setTiers((t) => t.map((x) => (x.id === id ? { ...x, [key]: v } : x)));
  const addTier = () =>
    setTiers((t) => [
      ...t,
      { id: crypto.randomUUID(), tier: String(t.length + 1), label: "New tier", min: 1, max: 1 },
    ]);
  const removeTier = (id: string) => setTiers((t) => t.filter((x) => x.id !== id));

  // tier coverage validation: deciles 1..10 covered exactly once
  const coverage = useMemo(() => {
    const counts = new Array(11).fill(0) as number[];
    tiers.forEach((t) => {
      const lo = Math.min(t.min, t.max);
      const hi = Math.max(t.min, t.max);
      for (let d = lo; d <= hi; d++) if (d >= 1 && d <= 10) counts[d]++;
    });
    const missing = counts.slice(1).map((c, i) => (c === 0 ? i + 1 : null)).filter(Boolean);
    const overlap = counts.slice(1).map((c, i) => (c > 1 ? i + 1 : null)).filter(Boolean);
    return { ok: missing.length === 0 && overlap.length === 0, missing, overlap };
  }, [tiers]);

  const handleExport = () => {
    if (!valid) return;
    sendPrompt({
      skill: "targeting-branded-skill",
      prompt: `Generate HCP target list for: ${OBJECTIVE}. Weights: ${metrics
        .map((m) => `${m.name}=${m.weight}%`)
        .join(", ")}. Tiers: ${tiers
        .map((t) => `${t.tier}=${t.label} (D${t.min}-${t.max})`)
        .join("; ")}.`,
      artifact: "HCP_Targeting_Workbook.xlsx (7 sheets)",
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Module 01 · targeting-branded-skill"
        title="HCP Targeting"
        description="Define objective, weight metrics to 100%, configure tier decile bands, export."
        actions={
          <Button onClick={handleExport} disabled={!valid} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export 7-sheet workbook
          </Button>
        }
      />

      <div className="grid gap-6 p-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Objective */}
          <section className="rounded-lg border border-border bg-card p-5">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Targeting objective
            </label>
            <div
              className="mt-2 flex h-11 cursor-not-allowed items-center justify-between rounded-md border border-border bg-muted/40 px-3 text-sm font-medium text-foreground"
              aria-disabled="true"
              title="Locked objective"
            >
              <span>{OBJECTIVE}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Locked
              </span>
            </div>
          </section>

          {/* Metric table */}
          <section className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold">Metrics &amp; weights</h2>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono tabular-nums",
                    valid
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {valid ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5" />
                  )}
                  Σ {total}%
                </div>
                <Button variant="outline" size="sm" onClick={addMetric}>
                  <Plus className="mr-1 h-3 w-3" />
                  Metric
                </Button>
              </div>
            </div>
            <div className="divide-y divide-border">
              {metrics.map((m) => (
                <div
                  key={m.id}
                  className="grid grid-cols-[1.4fr_130px_1fr_72px_32px] items-center gap-3 px-5 py-3"
                >
                  <Input
                    value={m.name}
                    onChange={(e) => updateMetric(m.id, "name", e.target.value)}
                    className="h-8 text-sm"
                  />
                  <select
                    value={m.role}
                    onChange={(e) => updateMetric(m.id, "role", e.target.value as Role)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <Slider
                    value={[m.weight]}
                    onValueChange={([v]) => updateMetric(m.id, "weight", v)}
                    max={100}
                    step={1}
                  />
                  <Input
                    type="number"
                    value={m.weight}
                    onChange={(e) => updateMetric(m.id, "weight", +e.target.value || 0)}
                    className="h-8 text-right font-mono text-sm tabular-nums"
                  />
                  <button
                    onClick={() => removeMetric(m.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Dynamic tiers */}
          <section className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div>
                <h2 className="text-sm font-semibold">Tier decile bands</h2>
                <p className="text-[11px] text-muted-foreground">
                  Set the decile range for each tier. Deciles 1–10 should be covered exactly once.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-mono",
                    coverage.ok
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {coverage.ok ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5" />
                  )}
                  {coverage.ok
                    ? "D1–10 covered"
                    : coverage.overlap.length
                      ? `Overlap D${coverage.overlap.join(",")}`
                      : `Missing D${coverage.missing.join(",")}`}
                </div>
                <Button variant="outline" size="sm" onClick={addTier}>
                  <Plus className="mr-1 h-3 w-3" />
                  Tier
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-[80px_1fr_90px_90px_32px] gap-3 border-b border-border px-5 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <div>Tier</div>
              <div>Label</div>
              <div>Min decile</div>
              <div>Max decile</div>
              <div />
            </div>
            <div className="divide-y divide-border">
              {tiers.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-[80px_1fr_90px_90px_32px] items-center gap-3 px-5 py-3"
                >
                  <Input
                    value={t.tier}
                    onChange={(e) => updateTier(t.id, "tier", e.target.value)}
                    className="h-8 text-center font-mono text-xs font-bold"
                  />
                  <Input
                    value={t.label}
                    onChange={(e) => updateTier(t.id, "label", e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={t.min}
                    onChange={(e) => updateTier(t.id, "min", Math.max(1, Math.min(10, +e.target.value || 1)))}
                    className="h-8 text-center font-mono text-sm tabular-nums"
                  />
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={t.max}
                    onChange={(e) => updateTier(t.id, "max", Math.max(1, Math.min(10, +e.target.value || 1)))}
                    className="h-8 text-center font-mono text-sm tabular-nums"
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
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Source data</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload HCP roster or Rx feed for this module.
            </p>
            <div className="mt-3">
              <FileUpload module="targeting" skill="targeting-branded-skill" compact />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Tier preview</h2>
            <div className="mt-3 space-y-2">
              {tiers.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      T{t.tier}
                    </Badge>
                    <span className="text-xs">{t.label}</span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    D{Math.min(t.min, t.max)}–{Math.max(t.min, t.max)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
