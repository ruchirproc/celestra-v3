import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button, S as SheetPreviewTable } from "./SheetPreviewTable-DwbnLeGh.mjs";
import { u as useWorkbooks, c as cn, p as parseExcelFile } from "./router-D6sbifu3.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { F as FileSpreadsheet, X, e as Upload, L as Library } from "../_libs/lucide-react.mjs";
function DataSourcePanel({
  module,
  label,
  accept = ".xlsx,.xls,.csv"
}) {
  const { workbooks, add, selectForModule, selectionByModule, getById, remove } = useWorkbooks();
  const selectedId = selectionByModule[module];
  const selected = selectedId ? getById(selectedId) : void 0;
  const [drag, setDrag] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const fileRef = reactExports.useRef(null);
  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const wb = await parseExcelFile(files[0]);
      add(wb);
      selectForModule(module, wb.id);
      toast.success(`Loaded ${wb.name}`, { description: `${wb.sheets.length} sheet(s) parsed` });
    } catch (e) {
      toast.error("Could not parse file", { description: e.message });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  if (selected) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border border-border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-8 w-8 shrink-0 place-items-center rounded-md bg-foreground text-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-semibold", children: selected.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground", children: [
              selected.source,
              " · ",
              selected.sheets.length,
              " sheet",
              selected.sheets.length === 1 ? "" : "s"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: selectedId ?? "",
              onChange: (e) => selectForModule(module, e.target.value || void 0),
              className: "h-8 rounded-md border border-input bg-background px-2 text-xs",
              children: workbooks.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: w.id, children: [
                w.name,
                " (",
                w.source,
                ")"
              ] }, w.id))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => selectForModule(module, void 0),
              title: "Replace data source",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 sm:p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetPreviewTable, { sheets: selected.sheets }) })
    ] });
  }
  const libraryItems = workbooks;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border border-border bg-card p-4 sm:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: "Upload a workbook or pick one from the Workbook Library." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "label",
      {
        onDragOver: (e) => {
          e.preventDefault();
          setDrag(true);
        },
        onDragLeave: () => setDrag(false),
        onDrop: (e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        },
        className: cn(
          "mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-10 text-center transition-colors",
          drag ? "border-foreground bg-muted/40" : "border-border bg-background hover:bg-muted/30"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: fileRef,
              type: "file",
              accept,
              className: "sr-only",
              onChange: (e) => handleFiles(e.target.files)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-10 w-10 place-items-center rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: busy ? "Parsing…" : "Drop .xlsx / .csv or click to upload" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Parsed locally · preview shown before use" })
        ]
      }
    ),
    libraryItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Library, { className: "h-3 w-3" }),
        "From workbook library"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: libraryItems.slice(0, 6).map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => selectForModule(module, w.id),
          className: "group flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-left transition-colors hover:border-foreground/40",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs font-medium", children: w.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground", children: [
                w.source,
                w.module ? ` · ${w.module}` : ""
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  remove(w.id);
                },
                className: "rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100",
                role: "button",
                "aria-label": "Remove",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
              }
            )
          ]
        },
        w.id
      )) })
    ] })
  ] });
}
export {
  DataSourcePanel as D
};
