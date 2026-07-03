import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Archive,
  ExternalLink,
  FileText,
  Hash,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { getPublicLokasi } from "@/lib/public-lokasi.functions";

export const Route = createFileRoute("/p/lokasi/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Lokasi Arsip — PADDS SMANSAT" },
      {
        name: "description",
        content:
          "Halaman publik lokasi penyimpanan arsip PADDS SMANSAT — diakses melalui QR Code lokasi fisik.",
      },
    ],
  }),
  component: PublicLokasiPage,
});

function PublicLokasiPage() {
  const { id } = Route.useParams();
  const fetcher = useServerFn(getPublicLokasi);
  const q = useQuery({
    queryKey: ["public-lokasi", id],
    queryFn: () => fetcher({ data: { id } }),
    staleTime: 60_000,
  });

  if (q.isLoading) {
    return (
      <Shell>
        <div className="animate-pulse rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
          Memuat lokasi…
        </div>
      </Shell>
    );
  }

  if (q.isError || !q.data) {
    return (
      <Shell>
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-semibold text-foreground">
            Lokasi tidak ditemukan
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tautan ini mungkin sudah tidak berlaku atau lokasi telah dihapus.
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

  const lokasi = q.data;

  return (
    <Shell>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/40 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-muted-foreground">
                {lokasi.kode}
              </p>
              <h1 className="mt-0.5 text-lg font-semibold leading-snug text-foreground">
                {lokasi.nama}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                {lokasi.ruangan ? <Pill>Ruangan: {lokasi.ruangan}</Pill> : null}
                {lokasi.rak ? <Pill>Rak: {lokasi.rak}</Pill> : null}
                <Pill>{lokasi.status}</Pill>
                <Pill>{lokasi.jumlahArsip} arsip</Pill>
              </div>
            </div>
          </div>
        </div>

        {lokasi.deskripsi ? (
          <div className="border-b border-border px-6 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Deskripsi
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {lokasi.deskripsi}
            </p>
          </div>
        ) : null}

        <div className="px-6 py-5">
          <div className="mb-3 flex items-center gap-2">
            <Archive className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Arsip pada lokasi ini
            </h2>
          </div>
          {lokasi.arsip.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
              Belum ada arsip yang tersimpan pada lokasi ini.
            </p>
          ) : (
            <ul className="space-y-2">
              {lokasi.arsip.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
                >
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {a.judul}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {a.nomorSurat}
                      </span>
                      <span>·</span>
                      <span>{a.kategori}</span>
                      <span>·</span>
                      <span>{a.tahun}</span>
                    </p>
                  </div>
                  <Link
                    to="/p/arsip/$id"
                    params={{ id: a.id }}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2 text-[11px] font-medium text-foreground hover:bg-muted"
                  >
                    <ExternalLink className="h-3 w-3" /> Buka
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-6 py-3 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Halaman publik PADDS SMANSAT — diakses melalui QR Code resmi lokasi
          arsip fisik.
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