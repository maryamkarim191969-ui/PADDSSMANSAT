import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  HelpCircle,
  Info as InfoIcon,
  LifeBuoy,
  Mail,
  ScrollText,
  ShieldCheck,
  Sparkles,
  History,
} from "lucide-react";
import {
  INFO_CHANGELOG,
  INFO_FAQ,
  INFO_GUIDE,
  INFO_PLATFORM,
  INFO_PRIVACY,
  INFO_PROFILE,
  INFO_TOS,
  PLATFORM_INFO,
} from "@/lib/info-content";

export const Route = createFileRoute("/_authenticated/info")({
  head: () => ({
    meta: [
      { title: "Pusat Informasi — PADDS SMANSAT" },
      {
        name: "description",
        content:
          "Dokumentasi resmi PADDS SMANSAT: profil platform, panduan penggunaan, FAQ, dan kebijakan.",
      },
    ],
  }),
  component: InfoPage,
});

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header className="mb-3 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </header>
      <div className="text-sm text-foreground">{children}</div>
    </section>
  );
}

function InfoPage() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-blue-600 to-violet-600 p-6 text-white shadow-sm">
        <p className="font-mono text-[11px] uppercase tracking-wider text-white/70">
          Pusat Informasi Platform
        </p>
        <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
          {PLATFORM_INFO.name}
        </h1>
        <p className="mt-1 text-sm text-white/90">
          {PLATFORM_INFO.longName} — {PLATFORM_INFO.institution}
        </p>
        <p className="mt-3 text-xs text-white/75">
          Versi {PLATFORM_INFO.version} · Tahun {PLATFORM_INFO.releasedAt}
        </p>
      </section>

      <Section
        icon={InfoIcon}
        title="Profil Platform"
        description="Ringkasan resmi mengenai PADDS SMANSAT."
      >
        <div className="space-y-3 text-sm leading-relaxed text-foreground">
          {INFO_PROFILE.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Section>

      <Section
        icon={Sparkles}
        title="Informasi Platform"
        description="Fitur utama yang tersedia pada platform."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {INFO_PLATFORM.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-background/60 p-4"
            >
              <p className="text-sm font-semibold text-foreground">{f.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        icon={HelpCircle}
        title="Frequently Asked Questions"
        description="Pertanyaan yang sering diajukan pengguna."
      >
        <ul className="divide-y divide-border">
          {INFO_FAQ.map((f) => (
            <li key={f.q} className="py-3 first:pt-0 last:pb-0">
              <p className="text-sm font-semibold text-foreground">{f.q}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        icon={ScrollText}
        title="Terms of Service"
        description="Ketentuan penggunaan platform."
      >
        <ul className="list-disc space-y-2 pl-5 text-sm text-foreground">
          {INFO_TOS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Section>

      <Section
        icon={ShieldCheck}
        title="Privacy Policy"
        description="Kebijakan privasi dan keamanan data."
      >
        <ul className="list-disc space-y-2 pl-5 text-sm text-foreground">
          {INFO_PRIVACY.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Section>

      <Section
        icon={BookOpen}
        title="Panduan Penggunaan"
        description="Langkah ringkas untuk fitur utama platform."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {INFO_GUIDE.map((g) => (
            <div
              key={g.title}
              className="rounded-xl border border-border bg-background/60 p-4"
            >
              <p className="text-sm font-semibold text-foreground">{g.title}</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-muted-foreground">
                {g.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Section>

      <Section
        icon={History}
        title="Informasi Versi & Changelog"
        description={`Versi saat ini: ${PLATFORM_INFO.version}.`}
      >
        <div className="space-y-4">
          {INFO_CHANGELOG.map((c) => (
            <div
              key={c.version}
              className="rounded-xl border border-border bg-background/60 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Versi {c.version}
                </p>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {c.date}
                </span>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                {c.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section
        icon={LifeBuoy}
        title="Kontak Administrator"
        description="Hubungi Administrator untuk kebutuhan akun atau bantuan teknis."
      >
        <div className="flex flex-col gap-1 text-sm text-foreground">
          <p>
            <span className="text-muted-foreground">Peran:</span>{" "}
            <span className="font-medium">{PLATFORM_INFO.contact.role}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Instansi:</span>{" "}
            <span className="font-medium">
              {PLATFORM_INFO.contact.institution}
            </span>
          </p>
          <p className="inline-flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a
              href={`mailto:${PLATFORM_INFO.contact.email}`}
              className="font-medium text-primary hover:underline"
            >
              {PLATFORM_INFO.contact.email}
            </a>
          </p>
        </div>
      </Section>
    </div>
  );
}