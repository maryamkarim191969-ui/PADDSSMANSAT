import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings, Save, RotateCcw, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SchoolProfile } from "@/components/settings/SchoolProfile";
import { SystemIdentity } from "@/components/settings/SystemIdentity";
import { AppearanceSetting } from "@/components/settings/AppearanceSetting";
import { LanguageSetting } from "@/components/settings/LanguageSetting";
import { TimezoneSetting } from "@/components/settings/TimezoneSetting";
import { StorageSetting } from "@/components/settings/StorageSetting";
import { QRSetting } from "@/components/settings/QRSetting";
import { SecuritySetting } from "@/components/settings/SecuritySetting";
import { SystemInfo } from "@/components/settings/SystemInfo";
import { defaultSettings, type SystemSettings } from "@/lib/settings-data";
import { getSystemSettings, saveSystemSettings } from "@/lib/system.functions";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_authenticated/pengaturan")({
  head: () => ({ meta: [{ title: "Pengaturan — PADDS SMANSAT" }] }),
  component: SettingsPage,
});

function mergeWithDefaults(input: unknown): SystemSettings {
  if (!input || typeof input !== "object") return defaultSettings;
  const i = input as Partial<SystemSettings>;
  return {
    school: { ...defaultSettings.school, ...(i.school ?? {}) },
    app: { ...defaultSettings.app, ...(i.app ?? {}) },
    appearance: i.appearance ?? defaultSettings.appearance,
    language: i.language ?? defaultSettings.language,
    time: { ...defaultSettings.time, ...(i.time ?? {}) },
    qr: { ...defaultSettings.qr, ...(i.qr ?? {}) },
    security: { ...defaultSettings.security, ...(i.security ?? {}) },
  };
}

function SettingsPage() {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === "Admin";

  const fetchSettings = useServerFn(getSystemSettings);
  const saveFn = useServerFn(saveSystemSettings);
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["system-settings"],
    queryFn: () => fetchSettings(),
  });

  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!q.data) return;
    if (q.data.json) {
      try {
        setSettings(mergeWithDefaults(JSON.parse(q.data.json)));
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, [q.data]);

  const saveMut = useMutation({
    mutationFn: () => saveFn({ data: { json: JSON.stringify(settings) } }),
    onSuccess: () => {
      setErr(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
      void qc.invalidateQueries({ queryKey: ["system-settings"] });
    },
    onError: (e: Error) => {
      setErr(e.message);
      setSaved(false);
    },
  });

  const handleSave = () => saveMut.mutate();
  const handleReset = () => setSettings(defaultSettings);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-sm shadow-blue-500/20">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan Sistem</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Pusat konfigurasi PADDS SMANSAT untuk profil sekolah, tampilan, keamanan, dan lainnya.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={!isAdmin}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!isAdmin || saveMut.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Pengaturan
          </button>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          Pengaturan berhasil disimpan.
        </div>
      )}

      {err && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4" /> {err}
        </div>
      )}

      {!isAdmin && (
        <div className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
          <AlertTriangle className="h-4 w-4" />
          Hanya Admin yang dapat menyimpan perubahan pengaturan.
        </div>
      )}

      <SchoolProfile
        value={settings.school}
        onChange={(school) => setSettings((p) => ({ ...p, school }))}
      />
      <SystemIdentity
        value={settings.app}
        onChange={(app) => setSettings((p) => ({ ...p, app }))}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AppearanceSetting
          value={settings.appearance}
          onChange={(appearance) => setSettings((p) => ({ ...p, appearance }))}
        />
        <LanguageSetting
          value={settings.language}
          onChange={(language) => setSettings((p) => ({ ...p, language }))}
        />
      </div>

      <TimezoneSetting
        value={settings.time}
        onChange={(time) => setSettings((p) => ({ ...p, time }))}
      />

      <StorageSetting />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <QRSetting
          value={settings.qr}
          onChange={(qr) => setSettings((p) => ({ ...p, qr }))}
        />
        <SecuritySetting
          value={settings.security}
          onChange={(security) => setSettings((p) => ({ ...p, security }))}
        />
      </div>

      <SystemInfo />

      <div className="flex items-center justify-end gap-2 pb-2">
        <button
          onClick={handleReset}
          disabled={!isAdmin}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
        <button
          onClick={handleSave}
          disabled={!isAdmin || saveMut.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}