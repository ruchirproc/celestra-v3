import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Target, Users, Map, Workflow, UploadCloud, FileSpreadsheet, X } from "lucide-react";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "End-to-End Pipeline · procDNA" },
      { name: "description", content: "Orchestrate targeting, sizing, and alignment in a single automated pipeline." },
    ],
  }),
  component: PipelinePage,
});

const STAGES = [
  {
    step: "01",
    skill: "targeting-branded-skill",
    label: "HCP Targeting",
    icon: Target,
    description: "Build weighted HCP target lists with tier decile distribution across prescriber, influencer, and decision-maker roles.",
    inputs: ["Raw HCP universe", "Metric weights", "Tier thresholds"],
    output: "HCP_Target_List.xlsx",
    route: "/",
  },
  {
    step: "02",
    skill: "sizing-skill",
    label: "Field Force Sizing",
    icon: Users,
    description: "Bottom-up sizing across workload scenarios using call-plan data and capacity parameters.",
    inputs: ["HCP_Target_List.xlsx (from Step 01)", "Working days / year", "Calls per day"],
    output: "Field_Force_Sizing_v4.xlsx",
    route: "/sizing",
  },
  {
    step: "03",
    skill: "zip-based-alignment",
    label: "Territory Alignment",
    icon: Map,
    description: "Distribute territories geographically by ZIP code, balancing workload against the sized rep count.",
    inputs: ["Field_Force_Sizing_v4.xlsx (from Step 02)", "ZIP-to-territory map", "Alignment constraints"],
    output: "Territory_Alignment.xlsx",
    route: "/alignment",
  },
] as const;

function PipelinePage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) {
      setFile(f);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Module 00 · full-pipeline-orchestration"
        title="End-to-End Pipeline"
        description="Run all three skills in sequence — targeting → sizing → alignment — passing outputs automatically as inputs to the next stage."
      />

      <div className="space-y-8 p-4 sm:p-6 lg:p-8">

        {/* File upload */}
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Source data · HCP universe / call-plan
          </p>

          {file ? (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
              <FileSpreadsheet className="h-5 w-5 shrink-0 text-green-600" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
              <button
                onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }}
                className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
                dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <UploadCloud className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drop an <span className="font-medium text-foreground">.xlsx</span> file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground/60">HCP universe or call-plan workbook</p>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Global run button */}
        <div className="flex items-center gap-4">
          <Button size="lg" disabled={!file} className="gap-2">
            <Workflow className="h-4 w-4" />
            Run Full Pipeline
          </Button>
          <span className="text-xs text-muted-foreground">All 3 skills · sequential execution · auto-passes outputs</span>
        </div>

        {/* Pipeline stages */}
        <div className="flex flex-col gap-0">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <div key={stage.step} className="flex flex-col">
                {/* Stage card */}
                <div className="flex gap-5 rounded-xl border border-border bg-card p-5 shadow-sm">
                  {/* Step indicator */}
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">{stage.step}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{stage.label}</h3>
                      <Badge variant="outline" className="font-mono text-[10px]">{stage.skill}</Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">{stage.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Inputs */}
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Inputs</p>
                        <ul className="space-y-1">
                          {stage.inputs.map((inp) => (
                            <li key={inp} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                              {inp}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Output */}
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Output</p>
                        <span className="inline-block rounded bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                          {stage.output}
                        </span>
                        {i < STAGES.length - 1 && (
                          <p className="mt-1 text-[10px] text-muted-foreground">→ auto-fed into Step {String(i + 2).padStart(2, "0")}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connector arrow between stages */}
                {i < STAGES.length - 1 && (
                  <div className="flex items-center justify-center py-2">
                    <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground">
          In the orchestrated run, each stage will stream its progress and automatically hand its output workbook to the next stage — no manual upload required.
        </p>
      </div>
    </>
  );
}
