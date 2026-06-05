import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Target, Users, Map, ArrowRight, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FileUpload } from "@/components/FileUpload";
import { useUploads } from "@/lib/uploads";
import { sendPrompt } from "@/lib/send-prompt";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home · procDNA" },
      { name: "description", content: "Upload source files and launch HCP targeting, sizing, and alignment workflows." },
    ],
  }),
  component: HomePage,
});

const MODULES = [
  {
    to: "/targeting" as const,
    icon: Target,
    label: "Targeting",
    skill: "targeting-branded-skill",
    desc: "Weighted HCP target list with dynamic tier decile bands.",
  },
  {
    to: "/sizing" as const,
    icon: Users,
    label: "Field Force Sizing",
    skill: "sizing-skill",
    desc: "Bottom-up workload model with scenario comparison.",
  },
  {
    to: "/alignment" as const,
    icon: Map,
    label: "Territory Alignment",
    skill: "zip-based-alignment",
    desc: "ZIP-based territories with workload balancing.",
  },
];

type DispatchStatus = "idle" | "dispatching" | "dispatched";

function HomePage() {
  const allFiles = useUploads();
  const [dispatchStatus, setDispatchStatus] = useState<Record<string, DispatchStatus>>({});

  const handleDispatch = async (fileId: string, fileName: string, skill: string) => {
    const key = `${fileId}::${skill}`;
    if ((dispatchStatus[key] ?? "idle") !== "idle") return;
    setDispatchStatus((s) => ({ ...s, [key]: "dispatching" }));
    await sendPrompt({ skill, prompt: `Process uploaded file: ${fileName}`, artifact: fileName });
    setDispatchStatus((s) => ({ ...s, [key]: "dispatched" }));
  };

  return (
    <>
      <PageHeader
        eyebrow="Workspace · upload-hub"
        title="procDNA Analytics"
        description="Upload your source workbooks once, then drive any of the three skill modules."
      />

      <div className="grid gap-6 p-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Source files</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Drop HCP rosters, Rx feeds, territory crosswalks, or any reference Excel/CSV here.
              Files are shared across modules.
            </p>
            <div className="mt-4">
              <FileUpload module="home" label="Upload workspace files" />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Modules</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {MODULES.map((m) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={m.to}
                    to={m.to}
                    className="group flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/40"
                  >
                    <div className="flex items-start justify-between">
                      <div className="grid h-9 w-9 place-items-center rounded-md bg-foreground text-background">
                        <Icon className="h-4 w-4" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <div className="mt-4 text-sm font-semibold">{m.label}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{m.skill}</div>
                    <p className="mt-2 text-xs text-muted-foreground">{m.desc}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Recent uploads</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {allFiles.length === 0
                ? "No files yet. Upload to get started."
                : `${allFiles.length} file${allFiles.length === 1 ? "" : "s"} across modules.`}
            </p>
            {allFiles.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {allFiles
                  .slice()
                  .reverse()
                  .slice(0, 8)
                  .map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="flex-1 truncate text-xs">{f.name}</span>
                      <div className="flex items-center gap-1">
                        {MODULES.map((m) => {
                          const key = `${f.id}::${m.skill}`;
                          const ds = dispatchStatus[key] ?? "idle";
                          const Icon = m.icon;
                          return (
                            <button
                              key={m.skill}
                              onClick={() => handleDispatch(f.id, f.name, m.skill)}
                              disabled={ds !== "idle"}
                              title={
                                ds === "dispatched"
                                  ? `Dispatched to ${m.skill}`
                                  : ds === "dispatching"
                                    ? `Dispatching to ${m.label}…`
                                    : `Apply to ${m.label}`
                              }
                              className={cn(
                                "transition-colors",
                                ds === "idle" && "text-muted-foreground hover:text-foreground",
                                ds === "dispatching" && "cursor-default text-muted-foreground",
                                ds === "dispatched" && "cursor-default text-success",
                              )}
                              aria-label={`Apply to ${m.label}`}
                            >
                              {ds === "idle" && <Icon className="h-3 w-3" />}
                              {ds === "dispatching" && <Loader2 className="h-3 w-3 animate-spin" />}
                              {ds === "dispatched" && <CheckCircle2 className="h-3 w-3" />}
                            </button>
                          );
                        })}
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
