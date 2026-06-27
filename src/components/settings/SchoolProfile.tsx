import { School } from "lucide-react";
import { SectionCard, Field, inputCls } from "./SectionCard";
import type { SystemSettings } from "@/lib/settings-data";

type Props = {
  value: SystemSettings["school"];
  onChange: (v: SystemSettings["school"]) => void;
};

export function SchoolProfile({ value, onChange }: Props) {
  const set = <K extends keyof SystemSettings["school"]>(k: K, v: SystemSettings["school"][K]) =>
    onChange({ ...value, [k]: v });
  return (
    <SectionCard title="Profil Sekolah" subtitle="Informasi identitas sekolah." icon={School}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nama Sekolah">
          <input className={inputCls} value={value.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="NPSN">
          <input className={inputCls} value={value.npsn} onChange={(e) => set("npsn", e.target.value)} />
        </Field>
        <Field label="Nomor Telepon">
          <input className={inputCls} value={value.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="Email">
          <input className={inputCls} value={value.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="Website">
          <input className={inputCls} value={value.website} onChange={(e) => set("website", e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Alamat">
            <textarea
              className={`${inputCls} min-h-[72px]`}
              value={value.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Logo Sekolah">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-xl border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
                Logo
              </div>
              <button className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent">
                Unggah Logo
              </button>
            </div>
          </Field>
        </div>
      </div>
    </SectionCard>
  );
}
