import { Users, Shield, UserCog, UserCheck } from "lucide-react";

type Item = {
  label: string;
  value: number;
  tone: "blue" | "violet" | "amber" | "green";
  icon: React.ComponentType<{ className?: string }>;
};

const TONE = {
  blue: { bar: "bg-blue-500", icon: "bg-blue-50 text-blue-600", ring: "ring-blue-100" },
  violet: { bar: "bg-violet-500", icon: "bg-violet-50 text-violet-600", ring: "ring-violet-100" },
  amber: { bar: "bg-amber-500", icon: "bg-amber-50 text-amber-600", ring: "ring-amber-100" },
  green: { bar: "bg-emerald-500", icon: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-100" },
} as const;

type Props = {
  total: number;
  admin: number;
  staff: number;
  active: number;
};

export function UserSummary({ total, admin, staff, active }: Props) {
  const items: Item[] = [
    { label: "Total User", value: total, tone: "blue", icon: Users },
    { label: "Admin", value: admin, tone: "violet", icon: Shield },
    { label: "Staff TU", value: staff, tone: "amber", icon: UserCog },
    { label: "User Aktif", value: active, tone: "green", icon: UserCheck },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => {
        const t = TONE[it.tone];
        const Icon = it.icon;
        return (
          <div
            key={it.label}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className={`absolute left-0 top-0 h-full w-1 ${t.bar}`} />
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${t.icon} ring-4 ${t.ring}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">{it.value}</p>
            <p className="mt-1 text-sm font-medium text-foreground/80">{it.label}</p>
          </div>
        );
      })}
    </div>
  );
}