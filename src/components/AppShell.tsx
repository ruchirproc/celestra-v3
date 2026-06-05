import { Link, useRouterState } from "@tanstack/react-router";
import { Target, Users, Map, Activity, Home } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home", icon: Home, skill: "upload-hub" },
  { to: "/targeting", label: "Targeting", icon: Target, skill: "targeting-branded-skill" },
  { to: "/sizing", label: "Field Force Sizing", icon: Users, skill: "sizing-skill" },
  { to: "/alignment", label: "Territory Alignment", icon: Map, skill: "zip-based-alignment" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-white/10">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">procDNA</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/60">Pharma Analytics</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4">
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
        </nav>
        <div className="border-t border-white/10 px-5 py-3 text-[10px] text-white/50">
          Skill-driven · sendPrompt() bridge
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
