import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileSpreadsheet, Trash2, Upload, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { SheetPreviewTable } from "@/components/SheetPreviewTable";
import { parseExcelFile, useWorkbooks } from "@/lib/workbook-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Workbook Library · procDNA" },
      { name: "description", content: "Shared store for uploaded and exported analytics workbooks." },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { workbooks, add, remove } = useWorkbooks();
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const f of Array.from(files)) {
        const wb = await parseExcelFile(f);
        add(wb);
      }
      toast.success(`Added ${files.length} file(s) to library`);
    } catch (e) {
      toast.error("Could not parse", { description: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Module 04 · workbook-library"
        title="Workbook Library"
        description="Central store for uploaded inputs and module exports. Output of one module can be reused as input to another."
        actions={
          <label className="inline-flex">
            <input
              type="file"
              multiple
              accept=".xlsx,.xls,.csv"
              className="sr-only"
              onChange={(e) => handleUpload(e.target.files)}
            />
            <Button size="sm" asChild>
              <span className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                {busy ? "Adding…" : "Add workbook"}
              </span>
            </Button>
          </label>
        }
      />
      <div className="p-4 sm:p-6 lg:p-8">
        {workbooks.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
            <FileSpreadsheet className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-3 text-sm font-semibold">No workbooks yet</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload an Excel file or run an export from any module — it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workbooks.map((w) => {
              const open = openId === w.id;
              return (
                <div key={w.id} className="rounded-lg border border-border bg-card">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-md",
                          w.source === "exported"
                            ? "bg-success/10 text-success"
                            : "bg-foreground text-background"
                        )}
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{w.name}</div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                          {w.source}
                          {w.module ? ` · from ${w.module}` : ""} · {w.sheets.length} sheet
                          {w.sheets.length === 1 ? "" : "s"} ·{" "}
                          {new Date(w.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOpenId(open ? null : w.id)}
                      >
                        {open ? <EyeOff className="mr-1.5 h-3.5 w-3.5" /> : <Eye className="mr-1.5 h-3.5 w-3.5" />}
                        {open ? "Hide" : "Preview"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(w.id)}
                        title="Delete from library"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {open && (
                    <div className="border-t border-border p-3 sm:p-5">
                      <SheetPreviewTable sheets={w.sheets} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
