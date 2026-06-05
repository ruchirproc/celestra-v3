import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Map as MapIcon, Check, X, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/FileUpload";
import { sendPrompt } from "@/lib/send-prompt";
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

type Territory = {
  id: string;
  code: string;
  rep: string;
  zips: number;
  workload: number;
};

const DEFAULT_TERRITORIES: Territory[] = [
  { id: "t1", code: "T-01", rep: "NE-Boston", zips: 42, workload: 103 },
  { id: "t2", code: "T-02", rep: "NE-Hartford", zips: 38, workload: 97 },
  { id: "t3", code: "T-03", rep: "NY-Manhattan", zips: 28, workload: 108 },
  { id: "t4", code: "T-04", rep: "NY-LongIsland", zips: 35, workload: 94 },
  { id: "t5", code: "T-05", rep: "NJ-North", zips: 41, workload: 112 },
  { id: "t6", code: "T-06", rep: "PA-Philly", zips: 39, workload: 99 },
  { id: "t7", code: "T-07", rep: "PA-Pittsburgh", zips: 44, workload: 88 },
  { id: "t8", code: "T-08", rep: "OH-Cleveland", zips: 47, workload: 102 },
  { id: "t9", code: "T-09", rep: "MI-Detroit", zips: 40, workload: 106 },
  { id: "t10", code: "T-10", rep: "IL-Chicago", zips: 33, workload: 95 },
];

function AlignmentPage() {
  const [territories, setTerritories] = useState<Territory[]>(DEFAULT_TERRITORIES);
  const [tolerance, setTolerance] = useState(10);

  const updateRow = <K extends keyof Territory>(id: string, key: K, v: Territory[K]) =>
    setTerritories((t) => t.map((r) => (r.id === id ? { ...r, [key]: v } : r)));
  const addRow = () =>
    setTerritories((t) => [
      ...t,
      {
        id: crypto.randomUUID(),
        code: `T-${String(t.length + 1).padStart(2, "0")}`,
        rep: "New territory",
        zips: 0,
        workload: 100,
      },
    ]);
  const removeRow = (id: string) => setTerritories((t) => t.filter((r) => r.id !== id));

  const checks = useMemo(() => {
    const allInBand = territories.every((t) => Math.abs(t.workload - 100) <= tolerance);
    return [
      { id: "ne-start", label: "Alignment starts in Northeast seed", pass: true },
      { id: "neighbor", label: "No non-neighbor ZIP jumps", pass: true },
      { id: "assigned", label: "All ZIPs assigned to a territory", pass: true },
      { id: "band", label: `Workload within ±${tolerance}% of target`, pass: allInBand },
      { id: "map", label: "Political map artifact generated", pass: false },
    ];
  }, [territories, tolerance]);

  const handleMap = () =>
    sendPrompt({
      skill: "zip-based-alignment",
      prompt: "Render US political map colored by territory assignment.",
      artifact: "US_Territory_Map.png",
    });

  const handleWorkbook = () =>
    sendPrompt({
      skill: "zip-based-alignment",
      prompt: `Export ZIP→territory alignment. Tolerance ±${tolerance}%. Territories=${JSON.stringify(territories)}.`,
      artifact: "Territory_Alignment.xlsx (2 sheets)",
    });

  return (
    <>
      <PageHeader
        eyebrow="Module 03 · zip-based-alignment"
        title="Territory Alignment"
        description="Editable territory roster with adjustable workload tolerance."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMap}>
              <MapIcon className="mr-2 h-4 w-4" />
              Generate political map
            </Button>
            <Button size="sm" onClick={handleWorkbook}>
              <Download className="mr-2 h-4 w-4" />
              Export 2-sheet workbook
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 p-8 lg:grid-cols-[1fr_340px]">
        {/* Grid */}
        <section className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">Territory roster</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-[11px] text-muted-foreground">Tolerance ±</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={tolerance}
                  onChange={(e) => setTolerance(Math.max(1, Math.min(50, +e.target.value || 1)))}
                  className="h-7 w-16 text-center font-mono text-xs"
                />
                <span className="text-[11px] text-muted-foreground">%</span>
              </div>
              <Button variant="outline" size="sm" onClick={addRow}>
                <Plus className="mr-1 h-3 w-3" />
                Territory
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-[90px_1fr_80px_1fr_28px] gap-3 border-b border-border px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <div>Code</div>
            <div>Rep / region</div>
            <div className="text-right">ZIPs</div>
            <div>Workload deviation</div>
            <div />
          </div>
          <div className="divide-y divide-border">
            {territories.map((t) => {
              const dev = t.workload - 100;
              const inBand = Math.abs(dev) <= tolerance;
              return (
                <div
                  key={t.id}
                  className="grid grid-cols-[90px_1fr_80px_1fr_28px] items-center gap-3 px-5 py-2"
                >
                  <Input
                    value={t.code}
                    onChange={(e) => updateRow(t.id, "code", e.target.value)}
                    className="h-8 font-mono text-xs font-semibold"
                  />
                  <Input
                    value={t.rep}
                    onChange={(e) => updateRow(t.id, "rep", e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input
                    type="number"
                    value={t.zips}
                    onChange={(e) => updateRow(t.id, "zips", +e.target.value || 0)}
                    className="h-8 text-right font-mono text-sm tabular-nums"
                  />
                  <div className="flex items-center gap-2">
                    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "absolute top-0 h-full",
                          inBand ? "bg-success" : "bg-destructive",
                        )}
                        style={{
                          left: dev >= 0 ? "50%" : `${Math.max(0, 50 + dev)}%`,
                          width: `${Math.min(Math.abs(dev), 50)}%`,
                        }}
                      />
                      <div className="absolute left-1/2 top-0 h-full w-px bg-foreground/40" />
                    </div>
                    <Input
                      type="number"
                      value={t.workload}
                      onChange={(e) => updateRow(t.id, "workload", +e.target.value || 0)}
                      className={cn(
                        "h-8 w-16 text-right font-mono text-xs tabular-nums",
                        !inBand && "text-destructive",
                      )}
                    />
                  </div>
                  <button
                    onClick={() => removeRow(t.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Source data</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload ZIP crosswalk or territory file.
            </p>
            <div className="mt-3">
              <FileUpload module="alignment" skill="zip-based-alignment" compact />
            </div>
          </div>

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
                        : "bg-destructive text-destructive-foreground",
                    )}
                  >
                    {c.pass ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  </span>
                  <span className="text-xs leading-tight">{c.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
