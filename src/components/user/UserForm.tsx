import { useEffect, useState } from "react";
import type { AppUser, UserRole, UserStatus } from "@/lib/user-data";

export type UserFormValue = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};

type Props = {
  initial?: AppUser | null;
  mode: "create" | "edit";
  onSubmit: (v: UserFormValue) => void;
  onCancel: () => void;
};

export function UserForm({ initial, mode, onSubmit, onCancel }: Props) {
  const [value, setValue] = useState<UserFormValue>({
    name: "",
    email: "",
    password: "",
    role: "Staff TU",
    status: "Aktif",
  });

  useEffect(() => {
    if (initial) {
      setValue({
        name: initial.name,
        email: initial.email,
        password: "",
        role: initial.role,
        status: initial.status,
      });
    }
  }, [initial]);

  const valid =
    value.name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(value.email) &&
    (mode === "edit" || value.password.length >= 6);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit(value);
      }}
      className="space-y-4"
    >
      <Field label="Nama Lengkap">
        <input
          value={value.name}
          onChange={(e) => setValue({ ...value, name: e.target.value })}
          placeholder="Nama user"
          className="input"
        />
      </Field>
      <Field label="Email">
        <input
          type="email"
          value={value.email}
          onChange={(e) => setValue({ ...value, email: e.target.value })}
          placeholder="nama@sipastera.sch.id"
          className="input"
        />
      </Field>
      {mode === "create" && (
        <Field label="Password" hint="Minimal 6 karakter">
          <input
            type="password"
            value={value.password}
            onChange={(e) => setValue({ ...value, password: e.target.value })}
            placeholder="••••••••"
            className="input"
          />
        </Field>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Role">
          <select
            value={value.role}
            onChange={(e) => setValue({ ...value, role: e.target.value as UserRole })}
            className="input"
          >
            <option value="Admin">Admin</option>
            <option value="Staff TU">Staff TU</option>
          </select>
        </Field>
        <Field label="Status">
          <select
            value={value.status}
            onChange={(e) => setValue({ ...value, status: e.target.value as UserStatus })}
            className="input"
          >
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </Field>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={!valid}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mode === "create" ? "Tambah User" : "Simpan Perubahan"}
        </button>
      </div>

      <style>{`
        .input {
          width: 100%;
          height: 40px;
          padding: 0 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid var(--color-border);
          background: var(--color-card);
          color: var(--color-foreground);
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: color-mix(in oklch, var(--color-primary) 40%, transparent);
          box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-primary) 10%, transparent);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}