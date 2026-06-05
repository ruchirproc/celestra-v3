import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, X, Play, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadStore, useUploads } from "@/lib/uploads";
import { sendPrompt } from "@/lib/send-prompt";
import { toast } from "sonner";

const ACCEPT = ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

type DispatchStatus = "idle" | "dispatching" | "dispatched";

export function FileUpload({
  module,
  label = "Upload Excel / CSV",
  compact = false,
  skill,
}: {
  module: string;
  label?: string;
  compact?: boolean;
  skill?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<Record<string, DispatchStatus>>({});
  const files = useUploads(module);

  const handleFiles = (fl: FileList | null) => {
    if (!fl || fl.length === 0) return;
    const added = uploadStore.add(module, fl);
    toast.success(`Uploaded ${added.length} file${added.length > 1 ? "s" : ""}`, {
      description: added.map((f) => f.name).join(", "),
    });
  };

  const handleDispatch = async (fileId: string, fileName: string) => {
    if (!skill) return;
    if ((dispatchStatus[fileId] ?? "idle") !== "idle") return;
    setDispatchStatus((s) => ({ ...s, [fileId]: "dispatching" }));
    await sendPrompt({
      skill,
      prompt: `Process uploaded file: ${fileName}`,
      artifact: fileName,
    });
    setDispatchStatus((s) => ({ ...s, [fileId]: "dispatched" }));
  };

  return (
    <div className="space-y-2">
      <div
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
        onClick={() => inputRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-md border border-dashed bg-background text-center transition-colors",
          compact ? "px-3 py-3" : "px-4 py-6",
          drag ? "border-foreground bg-muted/40" : "border-border hover:border-foreground/40",
        )}
      >
        <Upload className={cn("mx-auto text-muted-foreground", compact ? "h-4 w-4" : "h-5 w-5")} />
        <div className={cn("mt-1.5 font-medium", compact ? "text-xs" : "text-sm")}>{label}</div>
        <div className="text-[10px] text-muted-foreground">Drop .xlsx · .xls · .csv or click</div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((f) => {
            const ds = dispatchStatus[f.id] ?? "idle";
            return (
              <li
                key={f.id}
                className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 truncate text-xs">{f.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {(f.size / 1024).toFixed(1)} KB
                </span>
                {skill && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDispatch(f.id, f.name);
                    }}
                    disabled={ds !== "idle"}
                    title={
                      ds === "dispatched"
                        ? `Dispatched to ${skill}`
                        : ds === "dispatching"
                          ? "Dispatching…"
                          : `Apply ${skill}`
                    }
                    className={cn(
                      "transition-colors",
                      ds === "idle" && "text-muted-foreground hover:text-foreground",
                      ds === "dispatching" && "cursor-default text-muted-foreground",
                      ds === "dispatched" && "cursor-default text-success",
                    )}
                    aria-label={ds === "dispatched" ? "Dispatched" : `Dispatch to ${skill}`}
                  >
                    {ds === "idle" && <Play className="h-3.5 w-3.5" />}
                    {ds === "dispatching" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {ds === "dispatched" && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>
                )}
                <button
                  onClick={() => uploadStore.remove(f.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
