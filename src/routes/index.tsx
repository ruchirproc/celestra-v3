import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Download, AlertCircle, CheckCircle2, Loader2, Sparkles,
  ShieldCheck, BookmarkPlus, BarChart3, ChevronDown, RotateCcw,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataSourcePanel } from "@/components/DataSourcePanel";
import { makeSyntheticWorkbook, useWorkbooks } from "@/lib/workbook-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Celestra" },
      { name: "description", content: "Build weighted HCP target lists with tier decile distribution." },
    ],
  }),
  component: TargetingPage,
});

type Role = "Prescriber" | "Influencer" | "Decision Maker";
type Metric = { id: string; name: string; role: Role; weight: number; rationale: string };
type Tier = { tier: string; decileMin: number; decileMax: number; color: string; label: string };
type Scenario = { id: string; name: string; metrics: Metric[] };
type Step = "context" | "analyzing" | "configure";

const MODULE_ID = "targeting";
const OUTPUT_FILENAME = "HCP_Target_List_v1.xlsx";
const MOCK_UNIVERSE = 2847;

const CONTEXT_QUESTIONS = [
  {
    id: "therapeuticArea",
    label: "Therapeutic Area",
    options: ["Dermatology", "Oncology", "Rare Disease", "Neurology", "Cardiology", "Other"],
  },
  {
    id: "marketType",
    label: "Market Type",
    options: ["Primary Care", "Specialty", "Rare Disease / Orphan", "Ultra-Rare"],
  },
  {
    id: "launchPhase",
    label: "Launch Phase",
    options: ["Pre-Launch (< 6 mo)", "Launch (0–12 mo)", "Growth (1–3 yr)", "Mature Brand (3+ yr)"],
  },
  {
    id: "competitorDynamic",
    label: "Competitive Landscape",
    options: ["First-to-Market", "1–2 Established Competitors", "Crowded (3+)", "Generic Erosion"],
  },
  {
    id: "hcpUniverseSize",
    label: "Estimated HCP Universe",
    options: ["< 500 HCPs", "500–5,000 HCPs", "5,000–20,000 HCPs", "> 20,000 HCPs"],
  },
] as const;

// Arcutis-derived weights — generic names with rationale
const BASE_METRICS: Metric[] = [
  {
    id: "total_trx",
    name: "Total Market TRx",
    role: "Prescriber",
    weight: 30,
    rationale: "Highest weight — broadest signal of overall prescribing volume. Separates high-potential HCPs from the rest of the universe before any brand filter is applied.",
  },
  {
    id: "nst_trx",
    name: "Total Non-Steroidal Topical TRx",
    role: "Prescriber",
    weight: 25,
    rationale: "Second most important — identifies HCPs already receptive to non-steroidal mechanisms, directly aligned with the asset's therapeutic positioning.",
  },
  {
    id: "comm_trx",
    name: "Commercial TRx",
    role: "Decision Maker",
    weight: 15,
    rationale: "Commercial payer mix signals lower access friction and faster pull-through. Decision makers with high commercial utilization are critical for formulary placement.",
  },
  {
    id: "branded_trx",
    name: "Branded TRx",
    role: "Prescriber",
    weight: 15,
    rationale: "Brand-loyal prescribers generate more durable revenue and signal openness to premium positioning over generics in the same class.",
  },
  {
    id: "asset_brand_trx",
    name: "Asset Brand TRx",
    role: "Prescriber",
    weight: 15,
    rationale: "Direct measure of existing asset adoption — proven writers are the fastest path to incremental share growth and highest ROI on rep effort.",
  },
];

const DEFAULT_TIERS: Tier[] = [
  { tier: "1", decileMin: 10, decileMax: 10, color: "bg-foreground text-background", label: "High frequency" },
  { tier: "2", decileMin: 8, decileMax: 9, color: "bg-foreground/70 text-background", label: "Standard call frequency" },
  { tier: "3", decileMin: 5, decileMax: 7, color: "bg-muted-foreground/40 text-foreground", label: "Low frequency" },
  { tier: "4", decileMin: 1, decileMax: 4, color: "bg-muted/60 text-muted-foreground", label: "Minimal / No call" },
];

function tierSizes(tiers: Tier[], universe: number) {
  return tiers.map((t) => ({
    tier: t.tier,
    label: t.label,
    pct: (t.decileMax - t.decileMin + 1) / 10,
    hcps: Math.round(((t.decileMax - t.decileMin + 1) / 10) * universe),
  }));
}

function TargetingPage() {
  const { selectionByModule, getById, add } = useWorkbooks();
  const sourceId = selectionByModule[MODULE_ID];
  const source = sourceId ? getById(sourceId) : undefined;

  const [step, setStep] = useState<Step>("context");
  const [contextAnswers, setContextAnswers] = useState<Record<string, string>>({});
  const [showRecs, setShowRecs] = useState(true);

  const [metrics, setMetrics] = useState(BASE_METRICS);
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [dqmOpen, setDqmOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const total = useMemo(() => metrics.reduce((s, m) => s + m.weight, 0), [metrics]);
  const valid = total === 100;
  const contextComplete = CONTEXT_QUESTIONS.every((q) => contextAnswers[q.id]);

  const handleAnalyze = async () => {
    setStep("analyzing");
    await new Promise<void>((r) => setTimeout(r, 2500));
    setStep("configure");
    setShowRecs(true);
  };

  const updateWeight = (id: string, v: number) =>
    setMetrics((m) => m.map((x) => (x.id === id ? { ...x, weight: v } : x)));

  const updateTierDecile = (tier: string, field: "decileMin" | "decileMax", v: number) =>
    setTiers((ts) =>
      ts.map((t) => (t.tier === tier ? { ...t, [field]: Math.min(10, Math.max(1, v)) } : t))
    );

  const saveScenario = () => {
    const name = newScenarioName.trim() || `Scenario ${scenarios.length + 1}`;
    setScenarios((s) => [
      ...s.filter((x) => x.name !== name),
      { id: Date.now().toString(), name, metrics: metrics.map((m) => ({ ...m })) },
    ]);
    setNewScenarioName("");
  };

  const dqmChecks = useMemo(() => {
    const covered = new Set<number>();
    tiers.forEach((t) => { for (let d = t.decileMin; d <= t.decileMax; d++) covered.add(d); });
    const hasOverlap = tiers.some((a, i) =>
      tiers.some((b, j) => i !== j && a.decileMax >= b.decileMin && a.decileMin <= b.decileMax)
    );
    const highConc = metrics.find((m) => m.weight > 35);
    return [
      {
        id: "sum",
        label: "Metric weights sum to 100%",
        pass: valid,
        detail: valid ? "Σ = 100%" : `Σ = ${total}% — ${total < 100 ? `+${100 - total}% needed` : `-${total - 100}% to remove`}`,
      },
      {
        id: "conc",
        label: "No single metric exceeds 35%",
        pass: !highConc,
        detail: highConc ? `${highConc.name} at ${highConc.weight}%` : "Concentration within limits",
      },
      {
        id: "coverage",
        label: "Tier boundaries cover D1–D10",
        pass: covered.size === 10,
        detail: covered.size === 10 ? "Full spectrum covered" : `${10 - covered.size} decile(s) unassigned`,
      },
      {
        id: "overlap",
        label: "Tier boundaries do not overlap",
        pass: !hasOverlap,
        detail: hasOverlap ? "Overlapping decile ranges detected" : "Boundaries are mutually exclusive",
      },
      {
        id: "roles",
        label: "Key HCP roles represented",
        pass: (["Prescriber", "Decision Maker"] as Role[]).every((r) =>
          metrics.some((m) => m.role === r && m.weight > 0)
        ),
        detail: "Prescriber · Decision Maker both weighted",
      },
    ];
  }, [metrics, tiers, total, valid]);

  const dqmAllPass = dqmChecks.every((c) => c.pass);
  const simulation = useMemo(() => tierSizes(tiers, MOCK_UNIVERSE), [tiers]);

  const handleExport = async () => {
    if (!valid || exporting || !source) return;
    setExporting(true);
    setDone(false);
    await new Promise<void>((r) => setTimeout(r, 4000));
    const a = document.createElement("a");
    a.href = `/${OUTPUT_FILENAME}`;
    a.download = OUTPUT_FILENAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    add(
      makeSyntheticWorkbook({
        name: OUTPUT_FILENAME,
        module: MODULE_ID,
        sheets: [
          { name: "Summary", rows: [] },
          { name: "Raw data", rows: [] },
          { name: "Metric mapping", rows: [["Metric", "Role", "Weight %"], ...metrics.map((m) => [m.name, m.role, m.weight])] },
          { name: "Normalization helper", rows: [] },
          { name: "Scoring calculator", rows: [] },
          { name: "Final target list", rows: [] },
          { name: "Final summary dashboard", rows: [] },
        ],
      })
    );
    setExporting(false);
    setDone(true);
  };

  // ── CONTEXT STEP ──────────────────────────────────────────────────────────
  if (step === "context") {
    return (
      <>
        <PageHeader
          eyebrow="Module 01 · targeting-branded-skill"
          title="HCP Targeting"
          description="Before configuring weights, tell us about the project so the model can offer calibrated recommendations."
        />
        <div className="max-w-3xl space-y-7 p-4 sm:p-6 lg:p-8">
          {CONTEXT_QUESTIONS.map((q) => (
            <div key={q.id}>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {q.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setContextAnswers((a) => ({ ...a, [q.id]: opt }))}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                      contextAnswers[q.id] === opt
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/40"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Button onClick={handleAnalyze} disabled={!contextComplete} size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Recommendations
            </Button>
            {!contextComplete && (
              <p className="mt-2 text-xs text-muted-foreground">Answer all five questions to continue</p>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── ANALYZING STATE ───────────────────────────────────────────────────────
  if (step === "analyzing") {
    return (
      <>
        <PageHeader eyebrow="Module 01 · targeting-branded-skill" title="HCP Targeting" />
        <div className="flex flex-col items-center justify-center gap-4 p-20 text-center">
          <Sparkles className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-sm font-medium">Analyzing project context…</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Calibrating metric weights and deciling strategy for your{" "}
            <span className="font-medium text-foreground">{contextAnswers.therapeuticArea}</span>{" "}
            /{" "}
            <span className="font-medium text-foreground">{contextAnswers.marketType}</span>{" "}
            scenario.
          </p>
        </div>
      </>
    );
  }

  // ── CONFIGURE STEP ────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader
        eyebrow="Module 01 · targeting-branded-skill"
        title="HCP Targeting"
        description="Upload HCP universe → review recommendations → configure weights → export target list."
        actions={
          <button
            onClick={() => { setStep("context"); setShowRecs(false); }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Re-configure context
          </button>
        }
      />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">

        <DataSourcePanel module={MODULE_ID} label="HCP universe data" />

        {source && (
          <>
            {/* Claude's recommendations panel — shown only after dataset is uploaded */}
            {showRecs && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm font-semibold text-primary">Claude's Recommendations</p>
                  </div>
                  <button
                    onClick={() => setShowRecs(false)}
                    className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Dismiss
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Based on{" "}
                  {(["therapeuticArea", "marketType", "launchPhase", "competitorDynamic"] as const).map((k, i) => (
                    <span key={k}>
                      {i > 0 && " · "}
                      <span className="font-medium text-foreground">{contextAnswers[k]}</span>
                    </span>
                  ))}
                  {" "}· <span className="font-medium text-foreground">{source.name}</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  For a <strong>Specialty / {contextAnswers.competitorDynamic}</strong> market, we recommend leading with <strong>total volume + mechanism-aligned TRx</strong> as primary signals, with brand preference and payer mix as secondary differentiators. Based on the columns detected in your dataset, the metrics below have been pre-weighted accordingly.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {BASE_METRICS.slice(0, 3).map((m) => (
                    <div key={m.id} className="rounded-lg bg-background/70 p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{m.name}</span>
                        <span className="font-mono font-semibold text-primary">{m.weight}%</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{m.rationale}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  + {BASE_METRICS.length - 3} more {BASE_METRICS.length - 3 === 1 ? "metric" : "metrics"} pre-weighted below. Adjust sliders to override any recommendation.
                </p>
              </div>
            )}

            {/* DQM panel */}
            <div className="rounded-lg border border-border bg-card">
              <button
                onClick={() => setDqmOpen((o) => !o)}
                className="flex w-full items-center justify-between px-4 py-3 sm:px-5"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className={cn("h-4 w-4", dqmAllPass ? "text-green-600" : "text-destructive")} />
                  <span className="text-sm font-semibold">Data Quality &amp; Model Checks</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-mono",
                      dqmAllPass ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {dqmChecks.filter((c) => c.pass).length}/{dqmChecks.length} passed
                  </span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", dqmOpen && "rotate-180")} />
              </button>
              {dqmOpen && (
                <div className="divide-y divide-border border-t border-border">
                  {dqmChecks.map((c) => (
                    <div key={c.id} className="flex items-start gap-3 px-4 py-3 sm:px-5">
                      {c.pass
                        ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                        : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
                      <div>
                        <p className="text-sm">{c.label}</p>
                        <p className="text-xs text-muted-foreground">{c.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Export bar */}
            <div className="flex items-center justify-end gap-3">
              {done && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 dark:border-green-800 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                  <span className="text-xs font-medium text-green-800 dark:text-green-200">{OUTPUT_FILENAME}</span>
                  <button
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = `/${OUTPUT_FILENAME}`;
                      a.download = OUTPUT_FILENAME;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="ml-1 text-xs text-green-600 underline underline-offset-2 hover:text-green-800"
                  >
                    Re-download
                  </button>
                </div>
              )}
              <Button onClick={handleExport} disabled={!valid || exporting} size="sm">
                {exporting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Running targeting skill…</>
                ) : (
                  <><Download className="mr-2 h-4 w-4" />Export 7-sheet workbook</>
                )}
              </Button>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
              {/* Metrics & weights */}
              <section className="rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
                  <h2 className="text-sm font-semibold">Metrics &amp; weights</h2>
                  <div
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono tabular-nums",
                      valid ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    Σ {total}%
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {metrics.map((m) => (
                    <div key={m.id} className="px-4 py-3 sm:px-5">
                      <div className="grid grid-cols-[1fr_60px] items-start gap-3 sm:grid-cols-[1fr_120px_1fr_60px] sm:gap-4">
                        <div>
                          <div className="text-sm font-medium">{m.name}</div>
                          <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{m.rationale}</div>
                        </div>
                        <Badge variant="outline" className="mt-0.5 hidden justify-center font-normal sm:flex">
                          {m.role}
                        </Badge>
                        <Slider
                          value={[m.weight]}
                          onValueChange={([v]) => updateWeight(m.id, v)}
                          max={50}
                          step={1}
                          className="col-span-2 sm:col-span-1"
                        />
                        <div className="text-right font-mono text-sm tabular-nums">{m.weight}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="space-y-3">
                {/* Live simulation */}
                <div className="rounded-lg border border-border bg-card p-5">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Live Simulation</h2>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Estimated HCP split across tiers · universe ~{MOCK_UNIVERSE.toLocaleString()}
                  </p>
                  <div className="mt-4 space-y-3">
                    {simulation.map((s) => (
                      <div key={s.tier}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium">Tier {s.tier} — {s.label}</span>
                          <span className="font-mono text-muted-foreground">
                            ~{s.hcps.toLocaleString()} · {Math.round(s.pct * 100)}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${s.pct * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[10px] text-muted-foreground">
                    Adjust tier decile boundaries below to reshape the distribution live.
                  </p>
                </div>

                {/* Tier distribution */}
                <div className="rounded-lg border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold">Tier distribution</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Composite score → decile → tier assignment
                  </p>
                  <div className="mt-4 space-y-2">
                    {tiers.map((t) => (
                      <div key={t.tier} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5">
                        <div className="flex items-center gap-3">
                          <span className={cn("grid h-7 w-7 place-items-center rounded-md text-xs font-bold", t.color)}>
                            {t.tier}
                          </span>
                          <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                            <span>D</span>
                            <input
                              type="number"
                              min={1}
                              max={t.decileMax}
                              value={t.decileMin}
                              onChange={(e) => updateTierDecile(t.tier, "decileMin", +e.target.value)}
                              className="w-12 rounded border border-border bg-muted/40 px-1 py-0.5 text-center font-mono text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            <span>–</span>
                            <input
                              type="number"
                              min={t.decileMin}
                              max={10}
                              value={t.decileMax}
                              onChange={(e) => updateTierDecile(t.tier, "decileMax", +e.target.value)}
                              className="w-12 rounded border border-border bg-muted/40 px-1 py-0.5 text-center font-mono text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scenarios */}
                <div className="rounded-lg border border-border bg-card p-5">
                  <div className="flex items-center gap-2">
                    <BookmarkPlus className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Scenarios</h2>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Save the current weight configuration and compare alternatives.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Input
                      value={newScenarioName}
                      onChange={(e) => setNewScenarioName(e.target.value)}
                      placeholder="e.g. Conservative, Aggressive Launch…"
                      className="h-8 text-xs"
                    />
                    <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={saveScenario}>
                      Save
                    </Button>
                  </div>
                  {scenarios.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {scenarios.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setMetrics(s.metrics.map((m) => ({ ...m })))}
                          className="flex w-full items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-xs hover:bg-muted/60"
                        >
                          <span className="font-medium">{s.name}</span>
                          <span className="text-muted-foreground">Load →</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </>
  );
}
