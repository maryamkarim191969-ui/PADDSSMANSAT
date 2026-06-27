import type { ArsipStatus, ArsipJenis } from "@/lib/arsip-data";

export function formatDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function statusTone(status: ArsipStatus) {
  switch (status) {
    case "Aktif":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
    case "Inaktif":
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
    case "Diarsipkan":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  }
}

export function jenisTone(jenis: ArsipJenis) {
  switch (jenis) {
    case "Surat Keluar":
      return "bg-violet-50 text-violet-700 ring-1 ring-violet-100";
    case "Surat Masuk":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-100";
    case "Internal":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  }
}

export function publicLinkFor(id: string) {
  if (typeof window === "undefined") return `/p/arsip/${id}`;
  return `${window.location.origin}/p/arsip/${id}`;
}
