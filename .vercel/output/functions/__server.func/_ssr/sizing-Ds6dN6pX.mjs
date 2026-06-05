import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as PageHeader, B as Button } from "./SheetPreviewTable-DwbnLeGh.mjs";
import { L as Label, I as Input, s as sendPrompt } from "./send-prompt-mThDNmqZ.mjs";
import { D as DataSourcePanel } from "./DataSourcePanel-Cb9GVEQQ.mjs";
import { u as useWorkbooks, c as cn, m as makeSyntheticWorkbook } from "./router-D6sbifu3.mjs";
import "../_libs/sonner.mjs";
import { D as Download, b as TrendingUp, c as TrendingDown, d as Minus } from "../_libs/lucide-react.mjs";
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
const MODULE_ID = "sizing";
const SCENARIOS = [{
  id: "normal",
  label: "Normal Workload",
  mult: 1,
  note: "Baseline call plan"
}, {
  id: "reach",
  label: "Reach",
  mult: 1.18,
  note: "Wider HCP coverage, lower freq"
}, {
  id: "frequency",
  label: "Frequency",
  mult: 1.32,
  note: "Deeper engagement, narrow target"
}, {
  id: "segment",
  label: "Segment",
  mult: 1.09,
  note: "Tier-weighted prioritization"
}];
function SizingPage() {
  const {
    selectionByModule,
    getById,
    add
  } = useWorkbooks();
  const sourceId = selectionByModule[MODULE_ID];
  const source = sourceId ? getById(sourceId) : void 0;
  const [workingDays, setWorkingDays] = reactExports.useState(220);
  const [callsPerDay, setCallsPerDay] = reactExports.useState(8);
  const [tiers, setTiers] = reactExports.useState([{
    tier: "1",
    hcps: 1200,
    freq: 24
  }, {
    tier: "2",
    hcps: 3400,
    freq: 12
  }, {
    tier: "3",
    hcps: 5800,
    freq: 6
  }, {
    tier: "Monitor",
    hcps: 4200,
    freq: 2
  }]);
  const [active, setActive] = reactExports.useState("normal");
  const baseline = reactExports.useMemo(() => {
    const totalCalls = tiers.reduce((s, t) => s + t.hcps * t.freq, 0);
    const capacity = workingDays * callsPerDay;
    return {
      totalCalls,
      reps: Math.ceil(totalCalls / Math.max(capacity, 1))
    };
  }, [tiers, workingDays, callsPerDay]);
  const scenarioReps = (mult) => Math.ceil(baseline.totalCalls * mult / Math.max(workingDays * callsPerDay, 1));
  const updateTier = (i, key, v) => setTiers((t) => t.map((row, idx) => idx === i ? {
    ...row,
    [key]: v
  } : row));
  const handleExport = () => {
    sendPrompt({
      skill: "sizing-skill",
      prompt: `Field force sizing from ${source?.name}. Days=${workingDays}, calls/day=${callsPerDay}. Tiers=${JSON.stringify(tiers)}. Active=${active}.`,
      artifact: "FieldForce_Sizing.xlsx (7 sheets + tornado chart)"
    });
    add(makeSyntheticWorkbook({
      name: "FieldForce_Sizing.xlsx",
      module: MODULE_ID,
      sheets: [{
        name: "Summary",
        rows: [["Source", source?.name ?? ""], ["Active scenario", active], ["Reps required", scenarioReps(SCENARIOS.find((s) => s.id === active).mult)], ["Total calls/yr", baseline.totalCalls]]
      }, {
        name: "Inputs",
        rows: [["Working days/yr", workingDays], ["Calls/day/rep", callsPerDay], ["Capacity/rep", workingDays * callsPerDay]]
      }, {
        name: "Tiers",
        rows: [["Tier", "HCPs", "Calls/yr"], ...tiers.map((t) => [t.tier, t.hcps, t.freq])]
      }, {
        name: "Scenarios",
        rows: [["Scenario", "Multiplier", "Reps"], ...SCENARIOS.map((s) => [s.label, s.mult, scenarioReps(s.mult)])]
      }]
    }));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Module 02 · sizing-skill", title: "Field Force Sizing", description: "Upload HCP plan → bottom-up workload model → scenario comparison with sensitivity tornado.", actions: source ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleExport, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
      "Export formula workbook"
    ] }) : null }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-4 sm:p-6 lg:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DataSourcePanel, { module: MODULE_ID, label: "Call-plan / HCP universe data" }),
      source && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[360px_1fr]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-4 sm:p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Capacity inputs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Working days / year" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: workingDays, onChange: (e) => setWorkingDays(+e.target.value || 0), className: "mt-1" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Calls / day / rep" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: callsPerDay, onChange: (e) => setCallsPerDay(+e.target.value || 0), className: "mt-1" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-background px-3 py-2 text-xs font-mono tabular-nums text-muted-foreground", children: [
                "Capacity / rep =",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: workingDays * callsPerDay }),
                " calls/yr"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-4 sm:p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "HCP universe & call frequency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[80px_1fr_1fr] gap-2 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Tier" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "HCPs" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Calls/yr" })
              ] }),
              tiers.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[80px_1fr_1fr] items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 place-items-center rounded-md bg-foreground px-2 text-[11px] font-bold text-background", children: t.tier }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: t.hcps, onChange: (e) => updateTier(i, "hcps", +e.target.value || 0) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: t.freq, onChange: (e) => updateTier(i, "freq", +e.target.value || 0) })
              ] }, t.tier))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4", children: SCENARIOS.map((s) => {
            const reps = scenarioReps(s.mult);
            const delta = reps - baseline.reps;
            const isActive = active === s.id;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActive(s.id), className: cn("rounded-lg border bg-card p-4 text-left transition-all", isActive ? "border-foreground shadow-sm" : "border-border hover:border-foreground/40"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground", children: s.id }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm font-semibold", children: s.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 font-mono text-3xl font-bold tabular-nums", children: reps }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "reps required" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("mt-2 inline-flex items-center gap-1 text-xs font-mono", delta === 0 ? "text-muted-foreground" : "text-foreground"), children: [
                delta > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3" }) : delta < 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3 w-3" }),
                delta > 0 ? "+" : "",
                delta,
                " vs baseline"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: s.note })
            ] }, s.id);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-4 sm:p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold", children: [
                "Active scenario · ",
                SCENARIOS.find((s) => s.id === active)?.label
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-mono text-muted-foreground", children: [
                "Total calls/yr",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: baseline.totalCalls.toLocaleString() })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4", children: tiers.map((t) => {
              const calls = t.hcps * t.freq;
              const pct = baseline.totalCalls ? calls / baseline.totalCalls * 100 : 0;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-background p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono uppercase text-muted-foreground", children: [
                  "Tier ",
                  t.tier
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-mono text-lg font-semibold tabular-nums", children: calls.toLocaleString() }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
                  pct.toFixed(1),
                  "% of plan"
                ] })
              ] }, t.tier);
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground sm:p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono uppercase tracking-wider text-[10px] text-foreground/60", children: "Workbook sheets" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 grid grid-cols-1 gap-1.5 font-mono sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "1. Summary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "2. Inputs" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "3. Normal_Workload" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "4. Reach_Scenario" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "5. Frequency_Scenario" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "6. Segment_Scenario" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "7. Sensitivity + tornado" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  SizingPage as component
};
