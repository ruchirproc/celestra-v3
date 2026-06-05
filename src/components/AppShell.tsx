import { Link, useRouterState } from "@tanstack/react-router";
import { Target, Users, Map, Library, Menu, X } from "lucide-react";
import { useState, useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function CelestraLogo({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}a`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0A1E78" />
          <stop offset="50%" stopColor="#1A56DB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id={`${uid}b`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#E0D7FF" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="16" stroke={`url(#${uid}a)`} strokeWidth="2.5" />
      <path d="M 10 24 A 10 10 0 0 1 30 16" stroke="#1A56DB" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path
        d="M20 14 L21.3 18.7 L26 20 L21.3 21.3 L20 26 L18.7 21.3 L14 20 L18.7 18.7 Z"
        fill={`url(#${uid}b)`}
      />
      <circle cx="20" cy="4" r="2" fill="#06B6D4" />
      <circle cx="34" cy="16" r="1.5" fill="#06B6D4" />
      <circle cx="30" cy="33" r="1.5" fill="#1A56DB" />
      <circle cx="8" cy="28" r="1.5" fill="#1A56DB" />
    </svg>
  );
}

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
      {/* "Modules" label — always visible on mobile, fades in on desktop hover */}
      <div className="overflow-hidden whitespace-nowrap pb-2 pl-4 text-[10px] font-medium uppercase tracking-[0.14em] text-white/50 transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100">
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
              "mb-1 flex items-center overflow-hidden rounded-md py-2.5 transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-white/80 hover:bg-white/5 hover:text-white"
            )}
          >
            {/* Icon: pinned in a fixed-width box so it stays centered when collapsed */}
            <div className="flex w-16 shrink-0 items-center justify-center">
              <Icon className="h-4 w-4" />
            </div>
            {/* Label + skill: always visible on mobile, fades in on desktop hover */}
            <div className="overflow-hidden whitespace-nowrap pr-3 transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100">
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-[10px] font-mono text-white/45">{item.skill}</div>
            </div>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <div className="flex items-center gap-2.5">
          <CelestraLogo className="h-7 w-7" />
          <span className="text-sm font-bold tracking-widest">CELESTRA</span>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-md p-1.5 hover:bg-white/10"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/*
        Sidebar
        Mobile  : full-width (w-64) drawer toggled by hamburger
        Desktop : collapsed (w-16) by default, expands to w-64 on hover
        `group` enables group-hover selectors on children for fade-in text
      */}
      <aside
        className={cn(
          "group fixed inset-y-0 left-0 z-30 flex shrink-0 flex-col bg-sidebar text-sidebar-foreground",
          "overflow-x-hidden transition-[width] duration-300 ease-in-out",
          "w-64 lg:w-16 lg:hover:w-64",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex items-center border-b border-white/10 py-5">
          <div className="flex w-16 shrink-0 items-center justify-center">
            <CelestraLogo className="h-9 w-9" />
          </div>
          {/* Brand text: always visible on mobile, fades in on desktop hover */}
          <div className="overflow-hidden whitespace-nowrap pr-3 transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100">
            <div className="text-sm font-bold tracking-widest text-white">CELESTRA</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/60">Pharma Intelligence</div>
          </div>
        </div>

        <nav className="flex-1 overflow-x-hidden overflow-y-auto py-4">{navList}</nav>

        {/* Footer */}
        <div className="border-t border-white/10 py-3">
          <div className="overflow-hidden whitespace-nowrap px-5 text-[10px] text-white/50 transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100">
            Skill-driven · sendPrompt() bridge
          </div>
        </div>
      </aside>

      {/* Backdrop (mobile only) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          aria-hidden
        />
      )}

      {/* Main content column */}
      <div className="flex flex-1 min-w-0 flex-col">
        {/* Desktop top header bar */}
        <header className="hidden lg:flex items-center justify-between bg-white px-6 py-3.5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CelestraLogo className="h-8 w-8 shrink-0" />
            <div className="flex items-baseline gap-3">
              <span className="text-base font-bold tracking-widest text-[oklch(0.32_0.18_265)]">CELESTRA</span>
              <span className="text-gray-300 select-none">|</span>
              <span className="text-sm text-gray-500 font-light">
                The intelligence layer for pharma commercial
              </span>
            </div>
          </div>
          <div className="text-[11px] font-mono text-gray-400 tracking-wider">
            V1.0 · procDNA Analytics
          </div>
        </header>

        {/* Status bar */}
        <div className="hidden lg:flex items-center justify-between bg-slate-50 px-6 py-1.5 text-[11px] font-mono text-gray-400 tracking-wider border-b border-gray-100">
          <span>ANALYTICS PLATFORM · All Modules Active</span>
          <span>AUTO-REFRESH ON LOAD</span>
        </div>

        <main className="flex-1 min-w-0 overflow-y-auto pt-14 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}
