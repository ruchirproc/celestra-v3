import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as PageHeader, B as Button } from "./SheetPreviewTable-DwbnLeGh.mjs";
import { R as Root, T as Track, a as Range, b as Thumb } from "../_libs/radix-ui__react-slider.mjs";
import { u as useWorkbooks, c as cn, m as makeSyntheticWorkbook } from "./router-D6sbifu3.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { D as DataSourcePanel } from "./DataSourcePanel-Cb9GVEQQ.mjs";
import "../_libs/sonner.mjs";
import { D as Download, j as CircleCheck, k as CircleAlert } from "../_libs/lucide-react.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/radix-ui__react-collection.mjs";
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
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/xlsx.mjs";
const Slider = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Root,
  {
    ref,
    className: cn("relative flex w-full touch-none select-none items-center", className),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Track, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Range, { className: "absolute h-full bg-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Thumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider.displayName = Root.displayName;
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const OBJECTIVE = "Non-Rare disease market";
const MODULE_ID = "targeting";
const DEFAULT_METRICS = [{
  id: "total_trx",
  name: "Total TRx",
  role: "Prescriber",
  weight: 18
}, {
  id: "nst_trx",
  name: "Total Non-Steroid Topical TRx",
  role: "Prescriber",
  weight: 12
}, {
  id: "comm_trx",
  name: "Commercial TRx",
  role: "Decision Maker",
  weight: 8
}, {
  id: "brand_trx",
  name: "Branded TRx",
  role: "Prescriber",
  weight: 10
}, {
  id: "zoryve_trx",
  name: "Zoryve TRx",
  role: "Prescriber",
  weight: 9
}, {
  id: "gen_trx",
  name: "Generic TRx",
  role: "Prescriber",
  weight: 7
}, {
  id: "noncomm_trx",
  name: "NonCommercial TRx",
  role: "Decision Maker",
  weight: 8
}, {
  id: "brand_comm_trx",
  name: "Branded Commercial TRx",
  role: "Prescriber",
  weight: 9
}, {
  id: "brand_noncomm_trx",
  name: "Branded NonCommercial TRx",
  role: "Prescriber",
  weight: 7
}, {
  id: "gen_comm_trx",
  name: "Generic Commercial TRx",
  role: "Influencer",
  weight: 6
}, {
  id: "gen_noncomm_trx",
  name: "Generic NonCommercial TRx",
  role: "Influencer",
  weight: 6
}];
const DEFAULT_TIERS = [{
  tier: "1",
  decileMin: 8,
  decileMax: 10,
  color: "bg-foreground text-background",
  label: "High frequency"
}, {
  tier: "2",
  decileMin: 4,
  decileMax: 7,
  color: "bg-foreground/70 text-background",
  label: "Standard Call frequency"
}, {
  tier: "3",
  decileMin: 1,
  decileMax: 3,
  color: "bg-muted-foreground/40 text-foreground",
  label: "Low Frequency"
}];
function TargetingPage() {
  const {
    selectionByModule,
    getById,
    add
  } = useWorkbooks();
  const sourceId = selectionByModule[MODULE_ID];
  const source = sourceId ? getById(sourceId) : void 0;
  const [metrics, setMetrics] = reactExports.useState(DEFAULT_METRICS);
  const [tiers, setTiers] = reactExports.useState(DEFAULT_TIERS);
  const total = reactExports.useMemo(() => metrics.reduce((s, m) => s + m.weight, 0), [metrics]);
  const valid = total === 100;
  const updateWeight = (id, v) => setMetrics((m) => m.map((x) => x.id === id ? {
    ...x,
    weight: v
  } : x));
  const updateTierDecile = (tier, field, v) => setTiers((ts) => ts.map((t) => t.tier === tier ? {
    ...t,
    [field]: Math.min(10, Math.max(1, v))
  } : t));
  const handleExport = () => {
    if (!valid) return;
    const a = document.createElement("a");
    a.href = "/Zoryve_HCP_Target_List_v5_Updated.xlsx";
    a.download = "Zoryve_HCP_Target_List_v5_Updated.xlsx";
    a.click();
    add(makeSyntheticWorkbook({
      name: "Zoryve_HCP_Target_List_v5_Updated.xlsx",
      module: MODULE_ID,
      sheets: [{
        name: "Summary",
        rows: [["Objective", OBJECTIVE], ["Source", source?.name ?? ""], ["Total HCPs", 14600]]
      }, {
        name: "Raw data",
        rows: []
      }, {
        name: "Metric mapping",
        rows: [["Metric", "Role", "Weight %"], ...metrics.map((m) => [m.name, m.role, m.weight])]
      }, {
        name: "Normalization helper",
        rows: []
      }, {
        name: "Scoring calculator",
        rows: []
      }, {
        name: "Final target list",
        rows: [["Tier", "Decile Min", "Decile Max", "Label"], ...tiers.map((t) => [t.tier, t.decileMin, t.decileMax, t.label])]
      }, {
        name: "Final summary dashboard",
        rows: []
      }]
    }));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Module 01 · targeting-branded-skill", title: "HCP Targeting", description: "Upload HCP universe → weight metrics to 100% → export decile-bucketed target list.", actions: source ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleExport, disabled: !valid, size: "sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
      "Export 7-sheet workbook"
    ] }) : null }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-4 sm:p-6 lg:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DataSourcePanel, { module: MODULE_ID, label: "HCP universe data" }),
      source && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[1fr_320px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border border-border bg-card p-4 sm:p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: "Targeting objective" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex h-11 cursor-not-allowed items-center justify-between rounded-md border border-border bg-muted/40 px-3 text-sm font-medium text-foreground", "aria-disabled": "true", title: "Locked objective", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: OBJECTIVE }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: "Locked" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border border-border bg-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-4 py-3 sm:px-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Metrics & weights" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono tabular-nums", valid ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"), children: [
                valid ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5" }),
                "Σ ",
                total,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: metrics.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_60px] items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_120px_1fr_60px] sm:gap-4 sm:px-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: m.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "hidden justify-center font-normal sm:flex", children: m.role }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { value: [m.weight], onValueChange: ([v]) => updateWeight(m.id, v), max: 50, step: 1, className: "col-span-2 sm:col-span-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right font-mono text-sm tabular-nums", children: [
                m.weight,
                "%"
              ] })
            ] }, m.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Tier distribution" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Composite score → decile → tier assignment." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-2", children: tiers.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("grid h-7 w-7 place-items-center rounded-md text-xs font-bold", t.color), children: t.tier }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 font-mono text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "D" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 1, max: t.decileMax, value: t.decileMin, onChange: (e) => updateTierDecile(t.tier, "decileMin", +e.target.value), className: "w-12 rounded border border-border bg-muted/40 px-1 py-0.5 text-center font-mono text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-ring" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "–" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: t.decileMin, max: 10, value: t.decileMax, onChange: (e) => updateTierDecile(t.tier, "decileMax", +e.target.value), className: "w-12 rounded border border-border bg-muted/40 px-1 py-0.5 text-center font-mono text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-ring" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: t.label })
            ] }, t.tier)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-5 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono uppercase tracking-wider text-[10px] text-foreground/60", children: "Workbook contents" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "mt-2 list-decimal space-y-1 pl-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Summary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Raw data" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Metric mapping" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Normalization helper" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Scoring calculator" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Final target list" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Final summary dashboard" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  TargetingPage as component
};
