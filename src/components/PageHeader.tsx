import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-border bg-card px-8 py-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
