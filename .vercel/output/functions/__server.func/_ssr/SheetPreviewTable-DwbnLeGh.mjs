import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { c as cn } from "./router-D6sbifu3.mjs";
function PageHeader({
  eyebrow,
  title,
  description,
  actions
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b border-border bg-card px-4 py-5 sm:px-6 lg:px-8 lg:py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground", children: eyebrow }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl", children: title }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-2xl text-sm text-muted-foreground", children: description })
    ] }),
    actions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-2 sm:shrink-0", children: actions })
  ] }) });
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
function SheetPreviewTable({ sheets }) {
  const [active, setActive] = reactExports.useState(0);
  if (!sheets.length) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-xs text-muted-foreground", children: "No sheets found." });
  }
  const sheet = sheets[active] ?? sheets[0];
  const header = sheet.rows[0] ?? [];
  const body = sheet.rows.slice(1, 26);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-md border border-border bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 border-b border-border bg-muted/30 px-2 py-1.5", children: sheets.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setActive(i),
        className: cn(
          "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
          i === active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-background hover:text-foreground"
        ),
        children: s.name
      },
      s.name + i
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-80 overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-muted/60 text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-10 border-b border-r border-border px-2 py-1.5 text-[10px] font-mono text-muted-foreground", children: "#" }),
        header.map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "th",
          {
            className: "whitespace-nowrap border-b border-r border-border px-2 py-1.5 font-semibold text-foreground",
            children: String(h ?? "")
          },
          i
        ))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: body.map((row, ri) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "odd:bg-background even:bg-muted/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border-b border-r border-border px-2 py-1 text-[10px] font-mono text-muted-foreground", children: ri + 2 }),
        header.map((_, ci) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "td",
          {
            className: "whitespace-nowrap border-b border-r border-border px-2 py-1 tabular-nums",
            children: row[ci] === null || row[ci] === void 0 ? "" : String(row[ci])
          },
          ci
        ))
      ] }, ri)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border bg-muted/20 px-3 py-1.5 text-[10px] font-mono text-muted-foreground", children: [
      "Showing first ",
      Math.min(body.length),
      " of ",
      "938",
      " rows · ",
      header.length,
      " cols"
    ] })
  ] });
}
export {
  Button as B,
  PageHeader as P,
  SheetPreviewTable as S
};
