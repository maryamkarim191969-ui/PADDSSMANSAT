import { Shield } from "lucide-react";
import { SectionCard, Field, inputCls } from "./SectionCard";
import type { SystemSettings } from "@/lib/settings-data";

type Props = {
  value: SystemSettings["security"];
  onChange: (v: SystemSettings["security"]) => void;
};

export function SecuritySetting({ value, onChange }: Props) {
  return (
    <SectionCard title="Pengaturan Keamanan" subtitle="Kebijakan sesi dan password." icon={Shield} tone="from-red-500 to-rose-600">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Session Timeout">
          <select
            className={inputCls}
            value={value.sessionTimeout}
            onChange={(e) => onChange({ ...value, sessionTimeout: e.target.value })}
          >
            <option>15 menit</option>
            <option>30 menit</option>
            <option>60 menit</option>
            <option>120 menit</option>
          </select>
        </Field>
        <Field label="Login Security">
          <select
            className={inputCls}
            value={value.loginSecurity}
            onChange={(e) => onChange({ ...value, loginSecurity: e.target.value })}
          >
            <option>Standar</option>
            <option>2FA Email</option>
            <option>2FA Authenticator</option>
          </select>
        </Field>
        <Field label="Password Policy">
          <input
            className={inputCls}
            value={value.passwordPolicy}
            onChange={(e) => onChange({ ...value, passwordPolicy: e.target.value })}
          />
        </Field>
      </div>
    </SectionCard>
  );
}
