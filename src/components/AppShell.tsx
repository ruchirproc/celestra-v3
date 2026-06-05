import { Link, useRouterState } from "@tanstack/react-router";
import { Target, Users, Map, Activity, Library, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Targeting", icon: Target, skill: "targeting-branded-skill" },
  { to: "/sizing", label: "Field Force Sizing", icon: Users, skill: "sizing-skill" },
  { to: "/alignment", label: "Territory Alignment", icon: Map, skill: "zip-based-alignment" },
  { to: "/library", label: "Workbook Library", icon: Library, skill: "workbook-library" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const navList = (
    <>
      <div className="px-2 pb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white/50">
        Modules
      </div>
      {nav.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex flex-col gap-0.5 rounded-md px-3 py-2.5 mb-1 transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-white/80 hover:bg-white/5 hover:text-white"
            )}
          >
            <div className="flex items-center gap-2.5">
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className="pl-6 text-[10px] font-mono text-white/45">{item.skill}</span>
          </Link>
        );
      })}
    </>
  );

  const brand = (
    <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-white/10">
        <Activity className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold tracking-tight">procDNA</div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-white/60">Pharma Analytics</div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-white/10">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold">procDNA</span>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-md p-1.5 hover:bg-white/10"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Sidebar — desktop persistent, mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {brand}
        <nav className="flex-1 overflow-y-auto px-3 py-4">{navList}</nav>
        <div className="border-t border-white/10 px-5 py-3 text-[10px] text-white/50">
          Skill-driven · sendPrompt() bridge
        </div>
      </aside>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          aria-hidden
        />
      )}

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
