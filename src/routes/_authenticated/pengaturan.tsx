import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Settings, Save, RotateCcw, CheckCircle2 } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/pengaturan")({
  head: () => ({ meta: [{ title: "Pengaturan — SIPASTERA" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

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
              Pusat konfigurasi SIPASTERA untuk profil sekolah, tampilan, keamanan, dan lainnya.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Save className="h-4 w-4" /> Simpan Pengaturan
          </button>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          Pengaturan berhasil disimpan.
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
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <Save className="h-4 w-4" /> Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}