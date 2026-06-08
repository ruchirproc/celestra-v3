import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SheetPreview } from "@/lib/workbook-store";

export function SheetPreviewTable({ sheets }: { sheets: SheetPreview[] }) {
  const [active, setActive] = useState(0);
  if (!sheets.length) {
    return (
      <div className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-xs text-muted-foreground">
        No sheets found.
      </div>
    );
  }
  const sheet = sheets[active] ?? sheets[0];
  const header = sheet.rows[0] ?? [];
  const body = sheet.rows.slice(1, 26);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted/30 px-2 py-1.5">
        {sheets.map((s, i) => (
          <button
            key={s.name + i}
            onClick={() => setActive(i)}
            className={cn(
              "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
              i === active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            )}
          >
            {s.name}
          </button>
        ))}
      </div>
      <div className="max-h-80 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-muted/60 text-left">
            <tr>
              <th className="w-10 border-b border-r border-border px-2 py-1.5 text-[10px] font-mono text-muted-foreground">
                #
              </th>
              {header.map((h, i) => (
                <th
                  key={i}
                  className="whitespace-nowrap border-b border-r border-border px-2 py-1.5 font-semibold text-foreground"
                >
                  {String(h ?? "")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri} className="odd:bg-background even:bg-muted/20">
                <td className="border-b border-r border-border px-2 py-1 text-[10px] font-mono text-muted-foreground">
                  {ri + 2}
                </td>
                {header.map((_, ci) => (
                  <td
                    key={ci}
                    className="whitespace-nowrap border-b border-r border-border px-2 py-1 tabular-nums"
                  >
                    {row[ci] === null || row[ci] === undefined ? "" : String(row[ci])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
