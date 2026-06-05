import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as XLSX from "xlsx";

export type SheetPreview = {
  name: string;
  rows: (string | number | null)[][];
};

export type StoredWorkbook = {
  id: string;
  name: string;
  source: "uploaded" | "exported";
  module?: string; // which module produced/consumed it
  createdAt: number;
  sheets: SheetPreview[];
};

type Ctx = {
  workbooks: StoredWorkbook[];
  add: (wb: StoredWorkbook) => void;
  remove: (id: string) => void;
  getById: (id: string) => StoredWorkbook | undefined;
  selectionByModule: Record<string, string | undefined>;
  selectForModule: (module: string, id: string | undefined) => void;
};

const WorkbookCtx = createContext<Ctx | null>(null);
const LS_KEY = "procdna-workbooks-v1";
const LS_SEL = "procdna-workbook-selection-v1";

const PREVIEW_ROW_LIMIT = 200;
const PREVIEW_COL_LIMIT = 30;

export async function parseExcelFile(file: File): Promise<StoredWorkbook> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheets: SheetPreview[] = wb.SheetNames.map((name) => {
    const ws = wb.Sheets[name];
    const raw = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
      header: 1,
      blankrows: false,
      defval: null,
    });
    const rows = raw
      .slice(0, PREVIEW_ROW_LIMIT)
      .map((r) => (Array.isArray(r) ? r.slice(0, PREVIEW_COL_LIMIT) : []));
    return { name, rows };
  });
  return {
    id: crypto.randomUUID(),
    name: file.name,
    source: "uploaded",
    createdAt: Date.now(),
    sheets,
  };
}

export function makeSyntheticWorkbook(opts: {
  name: string;
  module: string;
  sheets: SheetPreview[];
}): StoredWorkbook {
  return {
    id: crypto.randomUUID(),
    name: opts.name,
    source: "exported",
    module: opts.module,
    createdAt: Date.now(),
    sheets: opts.sheets,
  };
}

export function WorkbookProvider({ children }: { children: ReactNode }) {
  const [workbooks, setWorkbooks] = useState<StoredWorkbook[]>([]);
  const [selectionByModule, setSelection] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setWorkbooks(JSON.parse(raw));
      const sel = localStorage.getItem(LS_SEL);
      if (sel) setSelection(JSON.parse(sel));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(workbooks));
    } catch {}
  }, [workbooks]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SEL, JSON.stringify(selectionByModule));
    } catch {}
  }, [selectionByModule]);

  const add = useCallback((wb: StoredWorkbook) => {
    setWorkbooks((arr) => [wb, ...arr]);
  }, []);
  const remove = useCallback((id: string) => {
    setWorkbooks((arr) => arr.filter((w) => w.id !== id));
    setSelection((s) => {
      const next = { ...s };
      for (const k of Object.keys(next)) if (next[k] === id) next[k] = undefined;
      return next;
    });
  }, []);
  const getById = useCallback((id: string) => workbooks.find((w) => w.id === id), [workbooks]);
  const selectForModule = useCallback((module: string, id: string | undefined) => {
    setSelection((s) => ({ ...s, [module]: id }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({ workbooks, add, remove, getById, selectionByModule, selectForModule }),
    [workbooks, add, remove, getById, selectionByModule, selectForModule]
  );

  return <WorkbookCtx.Provider value={value}>{children}</WorkbookCtx.Provider>;
}

export function useWorkbooks() {
  const ctx = useContext(WorkbookCtx);
  if (!ctx) throw new Error("useWorkbooks must be used within WorkbookProvider");
  return ctx;
}
