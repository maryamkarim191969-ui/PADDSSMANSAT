import { createFileRoute } from "@tanstack/react-router";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { RetensiAlert } from "@/components/dashboard/RetensiAlert";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { GrowthChart } from "@/components/dashboard/GrowthChart";
import { ArsipTerbaru } from "@/components/dashboard/ArsipTerbaru";
import { AktivitasTerkini } from "@/components/dashboard/AktivitasTerkini";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useDashboardOverview } from "@/hooks/use-dashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PADDS SMANSAT" },
      { name: "description", content: "Ringkasan sistem arsip digital PADDS SMANSAT." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useCurrentUser();
  const { data, isLoading, error } = useDashboardOverview();

  const stats = data?.stats ?? { total: 0, aktif: 0, kategori: 0, qrAktif: 0 };
  const cards = [
    { key: "total", label: "Total Arsip", value: stats.total, hint: "Seluruh arsip di sistem", tone: "blue" as const, icon: "folder" as const },
    { key: "aktif", label: "Arsip Aktif", value: stats.aktif, hint: "Status aktif", tone: "green" as const, icon: "check" as const },
    { key: "kategori", label: "Jumlah Kategori", value: stats.kategori, hint: "Kategori unik terpakai", tone: "violet" as const, icon: "tag" as const },
    { key: "qr", label: "QR Aktif", value: stats.qrAktif, hint: "Arsip dengan QR", tone: "amber" as const, icon: "qr" as const },
  ];

  return (
    <div className="space-y-6">
      <WelcomeBanner name={user?.name} role={user?.role} />

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Gagal memuat dashboard: {(error as Error).message}
        </div>
      ) : null}

      <RetensiAlert
        mendekati={data?.retention.mendekati}
        kadaluarsa={data?.retention.kadaluarsa}
        nextItem={data?.retention.nextItem}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s) => (
          <StatCard
            key={s.key}
            label={s.label}
            value={isLoading ? "…" : s.value}
            hint={s.hint}
            tone={s.tone}
            icon={s.icon}
          />
        ))}
      </div>

      <QuickAccess />
      <GrowthChart data={data?.growth} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ArsipTerbaru items={data?.terbaru} />
        </div>
        <AktivitasTerkini items={data?.aktivitas} />
      </div>
    </div>
  );
}
