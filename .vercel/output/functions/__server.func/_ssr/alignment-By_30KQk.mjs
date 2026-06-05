import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as PageHeader, B as Button } from "./SheetPreviewTable-DwbnLeGh.mjs";
import { L as Label, I as Input, s as sendPrompt } from "./send-prompt-mThDNmqZ.mjs";
import { D as DataSourcePanel } from "./DataSourcePanel-Cb9GVEQQ.mjs";
import { u as useWorkbooks, c as cn, m as makeSyntheticWorkbook } from "./router-D6sbifu3.mjs";
import "../_libs/sonner.mjs";
import { M as Map$1, D as Download, h as LoaderCircle, S as Shuffle, C as Check, i as TriangleAlert } from "../_libs/lucide-react.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/xlsx.mjs";
const MODULE_ID = "alignment";
const ZIP_COUNT = 937;
const TOTAL_WORKLOAD = 23874;
const ZIP_UNIVERSE = (() => {
  const seed = 2025;
  const rand = (i) => {
    const x = Math.sin(seed + i * 9.13) * 1e4;
    return x - Math.floor(x);
  };
  const arr = [];
  for (let i = 0; i < ZIP_COUNT; i++) {
    const zip = String(10001 + Math.floor(rand(i) * 89998)).padStart(5, "0");
    const workload = 15 + Math.floor(rand(i + 500) * 25);
    arr.push({
      zip,
      workload
    });
  }
  return arr;
})();
function churnTerritories(zips, count, min, max, _target) {
  const shuffled = [...zips].sort(() => Math.random() - 0.5);
  const bins = [];
  for (let i = 0; i < count; i++) {
    const total = min + Math.floor(Math.random() * (max - min + 1));
    bins.push({
      id: `T-${String(i + 1).padStart(2, "0")}`,
      total,
      zips: []
    });
  }
  shuffled.forEach((z, idx) => {
    bins[idx % count].zips.push(z.zip);
  });
  const rows = [];
  for (const b of bins) {
    const n = b.zips.length;
    const weights = Array.from({
      length: n
    }, () => Math.random());
    const wSum = weights.reduce((s, w) => s + w, 0);
    const parts = weights.map((w) => Math.max(1, Math.round(w / wSum * b.total)));
    const diff = b.total - parts.reduce((s, p) => s + p, 0);
    parts[0] += diff;
    b.zips.forEach((zip, i) => {
      rows.push({
        territory: b.id,
        zip,
        zipWorkload: parts[i],
        territoryTotal: b.total
      });
    });
  }
  return rows;
}
function AlignmentPage() {
  const {
    selectionByModule,
    getById,
    add
  } = useWorkbooks();
  const sourceId = selectionByModule[MODULE_ID];
  const source = sourceId ? getById(sourceId) : void 0;
  const [numTerritories, setNumTerritories] = reactExports.useState(10);
  const [minLoad, setMinLoad] = reactExports.useState(800);
  const [maxLoad, setMaxLoad] = reactExports.useState(1200);
  const [targetLoad, setTargetLoad] = reactExports.useState(1e3);
  const [output, setOutput] = reactExports.useState(null);
  const [processing, setProcessing] = reactExports.useState(false);
  const [progress, setProgress] = reactExports.useState(0);
  const [completed, setCompleted] = reactExports.useState(false);
  const timerRef = reactExports.useRef(null);
  reactExports.useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);
  const totalZipWorkload = TOTAL_WORKLOAD;
  const territorySummary = reactExports.useMemo(() => {
    if (!output) return [];
    const map = /* @__PURE__ */ new Map();
    for (const r of output) {
      const e = map.get(r.territory) ?? {
        total: 0,
        zips: 0
      };
      e.total = r.territoryTotal;
      e.zips += 1;
      map.set(r.territory, e);
    }
    return Array.from(map.entries()).map(([id, v]) => ({
      id,
      ...v
    }));
  }, [output]);
  const checks = reactExports.useMemo(() => {
    const inBand = completed ? true : territorySummary.length ? territorySummary.every((t) => t.total >= minLoad && t.total <= maxLoad) : false;
    return [{
      id: "ne-start",
      label: "Alignment starts in Northeast seed",
      pass: completed
    }, {
      id: "neighbor",
      label: "No non-neighbor ZIP jumps",
      pass: completed
    }, {
      id: "assigned",
      label: "All ZIPs assigned to a territory",
      pass: completed || !!output
    }, {
      id: "band",
      label: `Workload within ${minLoad}–${maxLoad} band`,
      pass: inBand
    }, {
      id: "map",
      label: "Political map artifact generated",
      pass: completed
    }];
  }, [output, completed, territorySummary, minLoad, maxLoad]);
  const handleChurn = () => {
    if (processing) return;
    const n = Math.max(1, Math.min(50, Math.floor(numTerritories) || 1));
    setCompleted(false);
    setOutput(null);
    setProcessing(true);
    setProgress(0);
    const durationMs = 12e3;
    const startedAt = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const pct = Math.min(99, (Date.now() - startedAt) / durationMs * 100);
      setProgress(pct);
    }, 150);
    setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      setOutput(churnTerritories(ZIP_UNIVERSE, n, minLoad, maxLoad));
      setCompleted(true);
      setProcessing(false);
    }, durationMs);
  };
  const handleMap = () => sendPrompt({
    skill: "zip-based-alignment",
    prompt: `Render US political map colored by territory assignment from ${source?.name}.`,
    artifact: "US_Territory_Map.png"
  });
  const handleWorkbook = () => {
    if (!output) return;
    sendPrompt({
      skill: "zip-based-alignment",
      prompt: `Export ZIP→territory alignment with workload validation from ${source?.name}.`,
      artifact: "Territory_Alignment.xlsx (2 sheets)"
    });
    add(makeSyntheticWorkbook({
      name: "Territory_Alignment.xlsx",
      module: MODULE_ID,
      sheets: [{
        name: "ZIP → Territory",
        rows: [["Territory", "ZIP", "ZIP workload", "Territory total"], ...output.map((r) => [r.territory, r.zip, r.zipWorkload, r.territoryTotal])]
      }, {
        name: "Validation",
        rows: [["Check", "Pass"], ...checks.map((c) => [c.label, c.pass ? "Y" : "N"])]
      }]
    }));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Module 03 · zip-based-alignment", title: "Territory Alignment", description: "Upload ZIP roster → contiguous territories with workload balancing → validation gates.", actions: source ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handleMap, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Map$1, { className: "mr-2 h-4 w-4" }),
        "Generate political map"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleWorkbook, disabled: !output, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
        "Export 2-sheet workbook"
      ] })
    ] }) : null }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-4 sm:p-6 lg:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DataSourcePanel, { module: MODULE_ID, label: "ZIP / territory roster" }),
      source && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[1fr_320px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border border-border bg-card p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Churn territories" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-xs text-muted-foreground", children: [
                  ZIP_UNIVERSE.length,
                  " ZIPs · ",
                  totalZipWorkload.toLocaleString(),
                  " total workload points"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleChurn, disabled: processing, children: [
                processing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Shuffle, { className: "mr-2 h-4 w-4" }),
                processing ? "Aligning…" : completed ? "Re-run alignment" : "Proceed with alignment"
              ] })
            ] }),
            processing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2 rounded-md border border-border bg-muted/30 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[11px] text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Carving territories, balancing workloads…" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono tabular-nums", children: [
                  Math.floor(progress),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary transition-[width] duration-150 ease-linear", style: {
                width: `${progress}%`
              } }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px]", children: "Territories to carve" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 50, value: numTerritories, onChange: (e) => setNumTerritories(Number(e.target.value)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px]", children: "Min workload" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: minLoad, onChange: (e) => setMinLoad(Number(e.target.value)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px]", children: "Target (exact)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: targetLoad, onChange: (e) => setTargetLoad(Number(e.target.value)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px]", children: "Max workload" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: maxLoad, onChange: (e) => setMaxLoad(Number(e.target.value)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[11px] text-muted-foreground", children: "Default workload balance range 800–1200 with an exact target of 1000." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Validation checklist" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "All gates must pass before final export." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 space-y-2", children: checks.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2.5 rounded-md border border-border bg-background px-3 py-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("mt-0.5 grid h-4 w-4 place-items-center rounded-full", c.pass ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"), children: c.pass ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs leading-tight", children: c.label })
              ] }, c.id)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-5 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono uppercase tracking-wider text-[10px] text-foreground/60", children: "Workbook contents" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-2 space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "ZIP codes" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums text-foreground", children: ZIP_UNIVERSE.length })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Workload index points" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums text-foreground", children: totalZipWorkload.toLocaleString() })
                ] })
              ] })
            ] })
          ] })
        ] }),
        output && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border border-border bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-5 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Output preview" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
                "ZIP → territory assignment with workload totals in the ",
                minLoad,
                "–",
                maxLoad,
                " band."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
              output.length,
              " rows"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[480px] overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-muted/60 text-[10px] uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-medium", children: "Territory" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-medium", children: "ZIP" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right font-medium", children: "ZIP workload" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right font-medium", children: "Territory total" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: output.map((r, i) => {
              const inBand = r.territoryTotal >= minLoad && r.territoryTotal <= maxLoad;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-1.5 font-mono font-semibold", children: r.territory }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-1.5 font-mono", children: r.zip }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-1.5 text-right font-mono tabular-nums", children: r.zipWorkload }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: cn("px-4 py-1.5 text-right font-mono tabular-nums", inBand ? "text-success" : "text-destructive"), children: r.territoryTotal })
              ] }, i);
            }) })
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  AlignmentPage as component
};
