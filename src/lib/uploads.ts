import { useSyncExternalStore } from "react";

export type UploadedFile = {
  id: string;
  name: string;
  size: number;
  module: string; // "home" | "targeting" | "sizing" | "alignment"
  uploadedAt: number;
};

const listeners = new Set<() => void>();
let files: UploadedFile[] = [];
let filteredCache: Record<string, UploadedFile[]> = {};

function emit() {
  filteredCache = {};
  listeners.forEach((l) => l());
}

export const uploadStore = {
  add(module: string, fileList: FileList | File[]) {
    const incoming = Array.from(fileList).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      module,
      uploadedAt: Date.now(),
    }));
    files = [...files, ...incoming];
    emit();
    return incoming;
  },
  remove(id: string) {
    files = files.filter((f) => f.id !== id);
    emit();
  },
  all() {
    return files;
  },
  byModule(module: string) {
    return files.filter((f) => f.module === module);
  },
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useUploads(module?: string) {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (!module) return files;
      if (!filteredCache[module]) {
        filteredCache[module] = files.filter((f) => f.module === module);
      }
      return filteredCache[module];
    },
    () => [],
  );
}
