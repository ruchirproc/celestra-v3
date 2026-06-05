import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, X, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseExcelFile, useWorkbooks } from "@/lib/workbook-store";
import { SheetPreviewTable } from "./SheetPreviewTable";
import { toast } from "sonner";

export function DataSourcePanel({
  module,
  label,
  accept = ".xlsx,.xls,.csv",
}: {
  module: string;
  label: string;
  accept?: string;
}) {
  const { workbooks, add, selectForModule, selectionByModule, getById, remove } = useWorkbooks();
  const selectedId = selectionByModule[module];
  const selected = selectedId ? getById(selectedId) : undefined;
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const wb = await parseExcelFile(files[0]);
      add(wb);
      selectForModule(module, wb.id);
      toast.success(`Loaded ${wb.name}`, { description: `${wb.sheets.length} sheet(s) parsed` });
    } catch (e) {
      toast.error("Could not parse file", { description: (e as Error).message });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (selected) {
    return (
      <section className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-foreground text-background">
              <FileSpreadsheet className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{selected.name}</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {selected.source} · {selected.sheets.length} sheet{selected.sheets.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <select
              value={selectedId ?? ""}
              onChange={(e) => selectForModule(module, e.target.value || undefined)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            >
              {workbooks.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.source})
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectForModule(module, undefined)}
              title="Replace data source"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="p-3 sm:p-5">
          <SheetPreviewTable sheets={selected.sheets} />
        </div>
      </section>
    );
  }

  const libraryItems = workbooks;

  return (
    <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{label}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Upload a workbook or pick one from the Workbook Library.
          </p>
        </div>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-10 text-center transition-colors",
          drag ? "border-foreground bg-muted/40" : "border-border bg-background hover:bg-muted/30"
        )}
      >
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <span className="grid h-10 w-10 place-items-center rounded-full bg-muted">
          <Upload className="h-4 w-4" />
        </span>
        <div className="text-sm font-medium">{busy ? "Parsing…" : "Drop .xlsx / .csv or click to upload"}</div>
        <div className="text-[11px] text-muted-foreground">Parsed locally · preview shown before use</div>
      </label>

      {libraryItems.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <Library className="h-3 w-3" />
            From workbook library
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {libraryItems.slice(0, 6).map((w) => (
              <button
                key={w.id}
                onClick={() => selectForModule(module, w.id)}
                className="group flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-left transition-colors hover:border-foreground/40"
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium">{w.name}</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {w.source}
                    {w.module ? ` · ${w.module}` : ""}
                  </div>
                </div>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(w.id);
                  }}
                  className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  role="button"
                  aria-label="Remove"
                >
                  <X className="h-3 w-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
