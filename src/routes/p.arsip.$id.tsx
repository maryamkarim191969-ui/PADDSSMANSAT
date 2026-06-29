import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Calendar,
  ExternalLink,
  FileText,
  Hash,
  MapPin,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { getPublicArsip } from "@/lib/public-arsip.functions";

export const Route = createFileRoute("/p/arsip/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Arsip Publik — PADDS SMANSAT" },
      {
        name: "description",
        content:
          "Halaman publik arsip PADDS SMANSAT — diakses melalui QR Code atau tautan langsung.",
      },
    ],
  }),
  component: PublicArsipPage,
});

function PublicArsipPage() {
  const { id } = Route.useParams();
  const fetcher = useServerFn(getPublicArsip);
  const q = useQuery({
    queryKey: ["public-arsip", id],
    queryFn: () => fetcher({ data: { id } }),
    staleTime: 60_000,
  });

  if (q.isLoading) {
    return (
      <Shell>
        <div className="animate-pulse rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
          Memuat arsip…
        </div>
      </Shell>
    );
  }

  if (q.isError || !q.data) {
    return (
      <Shell>
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-semibold text-foreground">
            Arsip tidak ditemukan
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tautan ini mungkin sudah tidak berlaku atau arsip telah dihapus.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Kembali ke beranda
          </Link>
        </div>
      </Shell>
    );
  }

  const arsip = q.data;
  const tanggal = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(arsip.tanggalUpload));

  return (
    <Shell>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/40 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-muted-foreground">
                {arsip.nomorSurat}
              </p>
              <h1 className="mt-0.5 text-lg font-semibold leading-snug text-foreground">
                {arsip.judul}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <Pill>{arsip.jenis}</Pill>
                <Pill>{arsip.status}</Pill>
                <Pill>{arsip.kategori}</Pill>
                <Pill>{arsip.tahun}</Pill>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 px-6 py-5 sm:grid-cols-2">
          <Info icon={Hash} label="Nomor Surat" value={arsip.nomorSurat} />
          <Info icon={Tag} label="Kategori" value={arsip.kategori} />
          <Info icon={Calendar} label="Tanggal Upload" value={tanggal} />
          <Info
            icon={MapPin}
            label="Lokasi Fisik"
            value={arsip.lokasiFisik || "—"}
          />
        </div>

        {arsip.deskripsi ? (
          <div className="border-t border-border px-6 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Deskripsi
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {arsip.deskripsi}
            </p>
          </div>
        ) : null}

        {arsip.previewUrl ? (
          <div className="border-t border-border px-6 py-5">
            <a
              href={arsip.previewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Lihat dokumen
            </a>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Tautan dokumen berlaku sementara untuk alasan keamanan.
            </p>
          </div>
        ) : null}

        <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-6 py-3 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Halaman publik PADDS SMANSAT — diakses melalui QR Code resmi arsip.
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">{children}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-foreground ring-1 ring-border">
      {children}
    </span>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}