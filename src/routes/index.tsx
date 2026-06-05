import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { DataSourcePanel } from "@/components/DataSourcePanel";
import { sendPrompt } from "@/lib/send-prompt";
import { makeSyntheticWorkbook, useWorkbooks } from "@/lib/workbook-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HCP Targeting · procDNA" },
      { name: "description", content: "Build weighted HCP target lists with tier decile distribution." },
    ],
  }),
  component: TargetingPage,
});

type Role = "Prescriber" | "Influencer" | "Decision Maker";
type Metric = { id: string; name: string; role: Role; weight: number };

const OBJECTIVE = "Non-Rare disease market";
const MODULE_ID = "targeting";

const DEFAULT_METRICS: Metric[] = [
  { id: "total_trx", name: "Total TRx", role: "Prescriber", weight: 18 },
  { id: "nst_trx", name: "Total Non-Steroid Topical TRx", role: "Prescriber", weight: 12 },
  { id: "comm_trx", name: "Commercial TRx", role: "Decision Maker", weight: 8 },
  { id: "brand_trx", name: "Branded TRx", role: "Prescriber", weight: 10 },
  { id: "zoryve_trx", name: "Zoryve TRx", role: "Prescriber", weight: 9 },
  { id: "gen_trx", name: "Generic TRx", role: "Prescriber", weight: 7 },
  { id: "noncomm_trx", name: "NonCommercial TRx", role: "Decision Maker", weight: 8 },
  { id: "brand_comm_trx", name: "Branded Commercial TRx", role: "Prescriber", weight: 9 },
  { id: "brand_noncomm_trx", name: "Branded NonCommercial TRx", role: "Prescriber", weight: 7 },
  { id: "gen_comm_trx", name: "Generic Commercial TRx", role: "Influencer", weight: 6 },
  { id: "gen_noncomm_trx", name: "Generic NonCommercial TRx", role: "Influencer", weight: 6 },
];

const TIERS = [
  { tier: "1", decile: "D8–10", color: "bg-foreground text-background", label: "High frequency" },
  { tier: "2", decile: "D4–7", color: "bg-foreground/70 text-background", label: "Standard Call frequency" },
  { tier: "3", decile: "D1–3", color: "bg-muted-foreground/40 text-foreground", label: "Low Frequency" },
];

function TargetingPage() {
  const { selectionByModule, getById, add } = useWorkbooks();
  const sourceId = selectionByModule[MODULE_ID];
  const source = sourceId ? getById(sourceId) : undefined;

  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const total = useMemo(() => metrics.reduce((s, m) => s + m.weight, 0), [metrics]);
  const valid = total === 100;

  const updateWeight = (id: string, v: number) =>
    setMetrics((m) => m.map((x) => (x.id === id ? { ...x, weight: v } : x)));

  const handleExport = () => {
    if (!valid) return;
    sendPrompt({
      skill: "targeting-branded-skill",
      prompt: `Generate HCP target list for: ${OBJECTIVE} from ${source?.name}. Weights: ${metrics
        .map((m) => `${m.name}=${m.weight}%`)
        .join(", ")}.`,
      artifact: "HCP_Targeting_Workbook.xlsx (7 sheets)",
    });
    add(
      makeSyntheticWorkbook({
        name: "HCP_Targeting_Workbook.xlsx",
        module: MODULE_ID,
        sheets: [
          {
            name: "Summary",
            rows: [
              ["Objective", OBJECTIVE],
              ["Source", source?.name ?? ""],
              ["Total HCPs", 14600],
              ["Weights Σ%", total],
            ],
          },
          {
            name: "Weights",
            rows: [["Metric", "Role", "Weight %"], ...metrics.map((m) => [m.name, m.role, m.weight])],
          },
          {
            name: "Tier roster",
            rows: [["Tier", "Decile", "Label"], ...TIERS.map((t) => [t.tier, t.decile, t.label])],
          },
        ],
      })
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Module 01 · targeting-branded-skill"
        title="HCP Targeting"
        description="Upload HCP universe → weight metrics to 100% → export decile-bucketed target list."
        actions={
          source ? (
            <Button onClick={handleExport} disabled={!valid} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export 7-sheet workbook
            </Button>
          ) : null
        }
      />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <DataSourcePanel module={MODULE_ID} label="HCP universe data" />

        {source && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Targeting objective
                </label>
                <div
                  className="mt-2 flex h-11 cursor-not-allowed items-center justify-between rounded-md border border-border bg-muted/40 px-3 text-sm font-medium text-foreground"
                  aria-disabled="true"
                  title="Locked objective"
                >
                  <span className="truncate">{OBJECTIVE}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Locked
                  </span>
                </div>
              </section>

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
                    <div
                      key={m.id}
                      className="grid grid-cols-[1fr_60px] items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_120px_1fr_60px] sm:gap-4 sm:px-5"
                    >
                      <div className="text-sm font-medium">{m.name}</div>
                      <Badge variant="outline" className="hidden justify-center font-normal sm:flex">
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
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-3">
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-sm font-semibold">Tier distribution</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Composite score → decile → tier assignment.
                </p>
                <div className="mt-4 space-y-2">
                  {TIERS.map((t) => (
                    <div
                      key={t.tier}
                      className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "grid h-7 w-7 place-items-center rounded-md text-xs font-bold",
                            t.color
                          )}
                        >
                          {t.tier}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">{t.decile}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5 text-xs text-muted-foreground">
                <div className="font-mono uppercase tracking-wider text-[10px] text-foreground/60">
                  Workbook contents
                </div>
                <ol className="mt-2 list-decimal space-y-1 pl-4">
                  <li>Summary</li>
                  <li>Raw data</li>
                  <li>Metric mapping</li>
                  <li>Normalization helper</li>
                  <li>Scoring calculator</li>
                  <li>Final target list</li>
                  <li>Final summary dashboard</li>
                </ol>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
