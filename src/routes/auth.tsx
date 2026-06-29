import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import authCss from "./auth.css?url";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "PADDS SMANSAT | Login" },
      {
        name: "description",
        content:
          "Masuk ke PADDS SMANSAT — Pusat Arsip dan Dokumen Digital Sekolah SMAN 1 Suwawa Timur berbasis QR Code dan AI.",
      },
    ],
    links: [
      { rel: "stylesheet", href: authCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<"google" | "microsoft" | null>(null);

  // If already signed in, jump straight to dashboard.
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) {
        void navigate({ to: "/dashboard", replace: true });
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        void router.invalidate();
        void navigate({ to: "/dashboard", replace: true });
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, router]);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0 && !submitting;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        const msg = error.message?.toLowerCase() ?? "";
        if (msg.includes("invalid")) {
          toast.error("Email atau password salah.");
        } else if (msg.includes("not confirmed") || msg.includes("confirm")) {
          toast.error("Email belum diverifikasi. Periksa kotak masuk Anda.");
        } else {
          toast.error(error.message || "Gagal masuk. Coba lagi.");
        }
        return;
      }
      toast.success("Berhasil masuk. Mengarahkan ke Dashboard…");
      // onAuthStateChange listener above will navigate.
    } catch (err) {
      console.error("[auth] signInWithPassword", err);
      toast.error("Terjadi kesalahan tak terduga.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOAuth(provider: "google" | "microsoft") {
    if (oauthBusy) return;
    setOauthBusy(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/auth/callback`,
      });
      if (result.error) {
        const msg =
          result.error instanceof Error ? result.error.message : String(result.error);
        toast.error(`Gagal masuk dengan ${labelFor(provider)}: ${msg}`);
        setOauthBusy(null);
        return;
      }
      if (result.redirected) {
        // Browser navigates to provider — leave busy state on.
        return;
      }
      // Popup flow returned tokens; session is set. Navigate.
      toast.success(`Berhasil masuk dengan ${labelFor(provider)}.`);
      void router.invalidate();
      void navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      console.error(`[auth] OAuth ${provider}`, err);
      toast.error(`Gagal memulai login ${labelFor(provider)}.`);
      setOauthBusy(null);
    }
  }

  return (
    <div className="page">
      <div className="ambient" />
      <main className="wrap">
        <div className="grid">
          <section className="hero" aria-label="Hero PADDS SMANSAT">
            <div className="brand">
              <div className="mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l8 4.5v11L12 22l-8-4.5v-11L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 2v20M4 6.5l8 4.5 8-4.5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />
                </svg>
              </div>
              <div className="brand-title">
                <div className="name">PADDS SMANSAT</div>
                <div className="tagline">Pusat Arsip & Dokumen Digital</div>
              </div>
            </div>

            <h1>
              Kelola Arsip Sekolah Lebih Mudah, Cepat, dan Aman dengan
              <span className="accent"> Teknologi Modern</span>
            </h1>
            <p>
              PADDS SMANSAT adalah solusi pengarsipan digital terintegrasi dengan AI Assistant,
              QR Code, dan sistem keamanan berlapis untuk mendukung transformasi digital
              sekolah.
            </p>

            <div className="hero-visual">
              <div className="halo" aria-hidden="true" />
              <div className="frame">
                <img
                  loading="eager"
                  decoding="async"
                  alt="Ilustrasi PADDS SMANSAT"
                  src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Ultra%20clean%20isometric%203D%20illustration%2C%20blue%20and%20white%20glassmorphism%20tech%20style%2C%20cloud%20storage%20platform%20with%20digital%20archive%20folders%2C%20connected%20small%20pedestals%20showing%20AI%20assistant%20robot%2C%20QR%20code%20tile%2C%20and%20secure%20shield%20badge%2C%20soft%20shadows%2C%20bright%20studio%20lighting%2C%20minimal%20background%2C%20high%20detail%2C%20premium%20UI%20landing%20page%20hero&image_size=landscape_4_3"
                />
              </div>
            </div>

            <div className="features" aria-label="Fitur PADDS SMANSAT">
              <div className="feature">
                <div className="ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 12l2 2 4-5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="t">Aman</div>
                  <div className="d">Keamanan berlapis dan terenkripsi</div>
                </div>
              </div>

              <div className="feature">
                <div className="ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M13 2L3 14h9l-1 8 10-12h-9l1-8Z"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="t">Cepat</div>
                  <div className="d">Pencarian instan berbasis AI</div>
                </div>
              </div>

              <div className="feature">
                <div className="ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2l9 5-9 5-9-5 9-5Z"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 12l9 5 9-5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                      opacity="0.9"
                    />
                    <path
                      d="M3 17l9 5 9-5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                      opacity="0.75"
                    />
                  </svg>
                </div>
                <div>
                  <div className="t">Terintegrasi</div>
                  <div className="d">Semua arsip dalam satu sistem</div>
                </div>
              </div>

              <div className="feature">
                <div className="ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 7h16M4 12h16M4 17h10"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="t">Modern</div>
                  <div className="d">Berbasis cloud dan teknologi terkini</div>
                </div>
              </div>
            </div>
          </section>

          <div className="right">
            <section className="auth" aria-label="Kartu Login PADDS SMANSAT">
              <div className="glow-card">
                <div className="card-inner">
                  <div className="card-title">Selamat Datang Kembali</div>
                  <div className="card-sub">
                    Masuk ke akun PADDS SMANSAT Anda untuk melanjutkan
                  </div>

                  <form className="form" id="loginForm" onSubmit={handleSubmit} noValidate>
                    <div className="field">
                      <label htmlFor="email">Email</label>
                      <div className="control">
                        <div className="lead" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path
                              d="M4 6h16v12H4z"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M4 7l8 6 8-6"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="Masukkan email Anda"
                          className="input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={submitting || oauthBusy !== null}
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label htmlFor="password">Password</label>
                      <div className="control">
                        <div className="lead" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <rect
                              x="4"
                              y="10"
                              width="16"
                              height="10"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="2.2"
                            />
                            <path
                              d="M8 10V8a4 4 0 1 1 8 0v2"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          placeholder="Masukkan password Anda"
                          className="input"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={submitting || oauthBusy !== null}
                        />
                        <div className="trail">
                          <button
                            className="icon-btn"
                            type="button"
                            aria-label={
                              showPassword ? "Sembunyikan password" : "Tampilkan password"
                            }
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            <svg viewBox="0 0 24 24" fill="none">
                              {showPassword ? (
                                <>
                                  <path
                                    d="M3 3l18 18"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M6.2 6.2C3.8 8 2 12 2 12s3.5 7 10 7c2 0 3.7-.5 5.2-1.3"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M9.8 5.3C10.5 5.1 11.2 5 12 5c6.5 0 10 7 10 7s-1 2-2.8 3.9"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </>
                              ) : (
                                <>
                                  <path
                                    d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinejoin="round"
                                  />
                                </>
                              )}
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <label className="check">
                        <input
                          id="remember"
                          type="checkbox"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                        />
                        Ingat saya
                      </label>
                      <button
                        className="link"
                        type="button"
                        onClick={() =>
                          toast.info(
                            "Hubungi administrator PADDS SMANSAT untuk memulihkan password Anda.",
                          )
                        }
                      >
                        Lupa Password?
                      </button>
                    </div>

                    <button
                      className="primary"
                      id="loginBtn"
                      type="submit"
                      disabled={!canSubmit}
                    >
                      <span className="shine" aria-hidden="true" />
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M10 17l5-5-5-5"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4 12h10"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 4h6v16h-6"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.9"
                        />
                      </svg>
                      {submitting ? "Memproses…" : "Masuk"}
                    </button>

                    <div className="divider" aria-hidden="true">
                      <div className="line" />
                      <div className="txt">atau masuk dengan</div>
                      <div className="line" />
                    </div>

                    <div className="social">
                      <button
                        className="social-btn"
                        type="button"
                        disabled={submitting || oauthBusy !== null}
                        onClick={() => handleOAuth("google")}
                      >
                        <svg viewBox="0 0 48 48" aria-hidden="true">
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.67 1.22 9.14 3.62l6.23-6.23C35.59 3.44 30.24 1 24 1 14.62 1 6.52 6.38 2.55 14.22l7.26 5.64C11.54 13.87 17.28 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.15 24.5c0-1.64-.15-3.22-.43-4.74H24v9h12.47c-.54 2.9-2.17 5.36-4.63 7.02l7.1 5.51c4.14-3.82 6.21-9.45 6.21-16.79z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M9.81 28.41A14.5 14.5 0 0 1 9 24c0-1.53.27-3.01.75-4.41l-7.26-5.64A23.01 23.01 0 0 0 1 24c0 3.73.89 7.26 2.45 10.38l7.36-5.97z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 47c6.24 0 11.49-2.05 15.32-5.59l-7.1-5.51c-1.97 1.32-4.5 2.1-8.22 2.1-6.68 0-12.34-4.32-14.14-10.34l-7.36 5.97C6.46 41.56 14.58 47 24 47z"
                          />
                          <path fill="none" d="M1 1h46v46H1z" />
                        </svg>
                        {oauthBusy === "google" ? "Membuka…" : "Google"}
                      </button>
                      <button
                        className="social-btn"
                        type="button"
                        disabled={submitting || oauthBusy !== null}
                        onClick={() => handleOAuth("microsoft")}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <rect x="2.5" y="2.5" width="9" height="9" fill="#F25022" />
                          <rect x="12.5" y="2.5" width="9" height="9" fill="#7FBA00" />
                          <rect x="2.5" y="12.5" width="9" height="9" fill="#00A4EF" />
                          <rect x="12.5" y="12.5" width="9" height="9" fill="#FFB900" />
                        </svg>
                        {oauthBusy === "microsoft" ? "Membuka…" : "Microsoft"}
                      </button>
                    </div>
                  </form>

                  <div className="security">
                    <div className="badge" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 12l2 2 4-5"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <p>
                      PADDS SMANSAT dilengkapi dengan sistem keamanan berlapis untuk menjaga
                      data arsip sekolah tetap aman.
                    </p>
                  </div>

                  <div className="footer">© 2025 PADDS SMANSAT. Semua hak dilindungi.</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function labelFor(p: "google" | "microsoft") {
  return p === "google" ? "Google" : "Microsoft";
}
