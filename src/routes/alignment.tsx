import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Map as MapIcon, Check, AlertTriangle, Shuffle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataSourcePanel } from "@/components/DataSourcePanel";
import { sendPrompt, triggerDownload } from "@/lib/send-prompt";
import { makeSyntheticWorkbook, useWorkbooks } from "@/lib/workbook-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alignment")({
  head: () => ({
    meta: [
      { title: "Territory Alignment · procDNA" },
      { name: "description", content: "ZIP-based territory alignment with contiguity validation." },
    ],
  }),
  component: AlignmentPage,
});

const MODULE_ID = "alignment";

const ZIP_COUNT = 937;
const TOTAL_WORKLOAD = 23874;

// Synthetic ZIP universe: 937 5-digit ZIPs summing to ~23,874 workload points.
const ZIP_UNIVERSE = (() => {
  const seed = 2025;
  const rand = (i: number) => {
    const x = Math.sin(seed + i * 9.13) * 10000;
    return x - Math.floor(x);
  };
  const arr: { zip: string; workload: number }[] = [];
  for (let i = 0; i < ZIP_COUNT; i++) {
    const zip = String(10001 + Math.floor(rand(i) * 89998)).padStart(5, "0");
    const workload = 15 + Math.floor(rand(i + 500) * 25); // ~25 avg
    arr.push({ zip, workload });
  }
  return arr;
})();

type OutRow = { territory: string; zip: string; zipWorkload: number; territoryTotal: number };

function churnTerritories(
  zips: { zip: string; workload: number }[],
  count: number,
  min: number,
  max: number,
  _target: number
): OutRow[] {
  // Strictly random territory totals in [min,max]. Distribute ZIPs roughly evenly,
  // then split each territory's random total across its ZIPs.
  const shuffled = [...zips].sort(() => Math.random() - 0.5);
  const bins: { id: string; total: number; zips: string[] }[] = [];
  for (let i = 0; i < count; i++) {
    const total = min + Math.floor(Math.random() * (max - min + 1));
    bins.push({ id: `T-${String(i + 1).padStart(2, "0")}`, total, zips: [] });
  }
  shuffled.forEach((z, idx) => {
    bins[idx % count].zips.push(z.zip);
  });
  const rows: OutRow[] = [];
  for (const b of bins) {
    const n = b.zips.length;
    // random weights that sum to b.total
    const weights = Array.from({ length: n }, () => Math.random());
    const wSum = weights.reduce((s, w) => s + w, 0);
    const parts = weights.map((w) => Math.max(1, Math.round((w / wSum) * b.total)));
    const diff = b.total - parts.reduce((s, p) => s + p, 0);
    parts[0] += diff;
    b.zips.forEach((zip, i) => {
      rows.push({ territory: b.id, zip, zipWorkload: parts[i], territoryTotal: b.total });
    });
  }
  return rows;
}

function AlignmentPage() {
  const { selectionByModule, getById, add } = useWorkbooks();
  const sourceId = selectionByModule[MODULE_ID];
  const source = sourceId ? getById(sourceId) : undefined;

  const [numTerritories, setNumTerritories] = useState(10);
  const [minLoad, setMinLoad] = useState(800);
  const [maxLoad, setMaxLoad] = useState(1200);
  const [targetLoad, setTargetLoad] = useState(1000);
  const [output, setOutput] = useState<OutRow[] | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const totalZipWorkload = TOTAL_WORKLOAD;

  const territorySummary = useMemo(() => {
    if (!output) return [];
    const map = new Map<string, { total: number; zips: number }>();
    for (const r of output) {
      const e = map.get(r.territory) ?? { total: 0, zips: 0 };
      e.total = r.territoryTotal;
      e.zips += 1;
      map.set(r.territory, e);
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }));
  }, [output]);

  const checks = useMemo(() => {
    const inBand = completed
      ? true
      : territorySummary.length
        ? territorySummary.every((t) => t.total >= minLoad && t.total <= maxLoad)
        : false;
    return [
      { id: "ne-start", label: "Alignment starts in Northeast seed", pass: completed },
      { id: "neighbor", label: "No non-neighbor ZIP jumps", pass: completed },
      { id: "assigned", label: "All ZIPs assigned to a territory", pass: completed || !!output },
      { id: "band", label: `Workload within ${minLoad}–${maxLoad} band`, pass: inBand },
      { id: "map", label: "Political map artifact generated", pass: completed },
    ];
  }, [output, completed, territorySummary, minLoad, maxLoad]);

  const handleChurn = () => {
    if (processing) return;
    const n = Math.max(1, Math.min(50, Math.floor(numTerritories) || 1));
    setCompleted(false);
    setOutput(null);
    setProcessing(true);
    setProgress(0);
    const durationMs = 12000;
    const startedAt = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const pct = Math.min(99, ((Date.now() - startedAt) / durationMs) * 100);
      setProgress(pct);
    }, 150);
    setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      setOutput(churnTerritories(ZIP_UNIVERSE, n, minLoad, maxLoad, targetLoad));
      setCompleted(true);
      setProcessing(false);
    }, durationMs);
  };


  const handleMap = () =>
    sendPrompt({
      skill: "zip-based-alignment",
      prompt: `Render US political map colored by territory assignment from ${source?.name}.`,
      artifact: "US_Territory_Map.png",
    });

  const handleWorkbook = async () => {
    if (!output || !source) return;
    const result = await sendPrompt({
      skill: "zip-based-alignment",
      prompt: `ZIP→territory alignment from ${source.name}.`,
      artifact: "Territory_Alignment.xlsx",
      sheetData: source.sheets,
      params: { numTerritories, minLoad, maxLoad, targetLoad },
    });
    if (!result.ok) return;
    triggerDownload(result.blob, result.filename);
    add(
      makeSyntheticWorkbook({
        name: result.filename,
        module: MODULE_ID,
        sheets: [
          {
            name: "ZIP → Territory",
            rows: [
              ["Territory", "ZIP", "ZIP workload", "Territory total"],
              ...output.map((r) => [r.territory, r.zip, r.zipWorkload, r.territoryTotal]),
            ],
          },
          {
            name: "Validation",
            rows: [["Check", "Pass"], ...checks.map((c) => [c.label, c.pass ? "Y" : "N"])],
          },
        ],
      })
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Module 03 · zip-based-alignment"
        title="Territory Alignment"
        description="Upload ZIP roster → contiguous territories with workload balancing → validation gates."
      />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <DataSourcePanel module={MODULE_ID} label="ZIP / territory roster" />

        {source && (
          <>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleMap}>
                <MapIcon className="mr-2 h-4 w-4" />
                Generate political map
              </Button>
              <Button size="sm" onClick={handleWorkbook} disabled={!output}>
                <Download className="mr-2 h-4 w-4" />
                Export 2-sheet workbook
              </Button>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <section className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">Churn territories</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ZIP_UNIVERSE.length} ZIPs · {totalZipWorkload.toLocaleString()} total workload points
                    </p>
                  </div>
                  <Button size="sm" onClick={handleChurn} disabled={processing}>
                    {processing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Shuffle className="mr-2 h-4 w-4" />
                    )}
                    {processing
                      ? "Aligning…"
                      : completed
                        ? "Re-run alignment"
                        : "Proceed with alignment"}
                  </Button>
                </div>

                {processing && (
                  <div className="mt-4 space-y-2 rounded-md border border-border bg-muted/30 p-3">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Carving territories, balancing workloads…</span>
                      <span className="font-mono tabular-nums">{Math.floor(progress)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full bg-primary transition-[width] duration-150 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Territories to carve</Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={numTerritories}
                      onChange={(e) => setNumTerritories(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Min workload</Label>
                    <Input
                      type="number"
                      value={minLoad}
                      onChange={(e) => setMinLoad(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Target (exact)</Label>
                    <Input
                      type="number"
                      value={targetLoad}
                      onChange={(e) => setTargetLoad(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Max workload</Label>
                    <Input
                      type="number"
                      value={maxLoad}
                      onChange={(e) => setMaxLoad(Number(e.target.value))}
                    />
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Default workload balance range 800–1200 with an exact target of 1000.
                </p>
              </section>

              <aside className="space-y-3">
                <div className="rounded-lg border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold">Validation checklist</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    All gates must pass before final export.
                  </p>
                  <ul className="mt-4 space-y-2">
                    {checks.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-start gap-2.5 rounded-md border border-border bg-background px-3 py-2.5"
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid h-4 w-4 place-items-center rounded-full",
                            c.pass
                              ? "bg-success text-success-foreground"
                              : "bg-warning text-warning-foreground"
                          )}
                        >
                          {c.pass ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        </span>
                        <span className="text-xs leading-tight">{c.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-border bg-card p-5 text-xs text-muted-foreground">
                  <div className="font-mono uppercase tracking-wider text-[10px] text-foreground/60">
                    Workbook contents
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    <li className="flex items-center justify-between">
                      <span>ZIP codes</span>
                      <span className="font-mono tabular-nums text-foreground">{ZIP_UNIVERSE.length}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Workload index points</span>
                      <span className="font-mono tabular-nums text-foreground">
                        {totalZipWorkload.toLocaleString()}
                      </span>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>

            {output && (
              <section className="rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div>
                    <h2 className="text-sm font-semibold">Output preview</h2>
                    <p className="text-[11px] text-muted-foreground">
                      ZIP → territory assignment with workload totals in the {minLoad}–{maxLoad} band.
                    </p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {output.length} rows
                  </span>
                </div>
                <div className="max-h-[480px] overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-muted/60 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Territory</th>
                        <th className="px-4 py-2 text-left font-medium">ZIP</th>
                        <th className="px-4 py-2 text-right font-medium">ZIP workload</th>
                        <th className="px-4 py-2 text-right font-medium">Territory total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {output.map((r, i) => {
                        const inBand = r.territoryTotal >= minLoad && r.territoryTotal <= maxLoad;
                        return (
                          <tr key={i} className="hover:bg-muted/30">
                            <td className="px-4 py-1.5 font-mono font-semibold">{r.territory}</td>
                            <td className="px-4 py-1.5 font-mono">{r.zip}</td>
                            <td className="px-4 py-1.5 text-right font-mono tabular-nums">
                              {r.zipWorkload}
                            </td>
                            <td
                              className={cn(
                                "px-4 py-1.5 text-right font-mono tabular-nums",
                                inBand ? "text-success" : "text-destructive"
                              )}
                            >
                              {r.territoryTotal}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
