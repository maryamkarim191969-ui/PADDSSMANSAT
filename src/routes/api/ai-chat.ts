import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  buildSipasteraSystemPrompt,
  createLovableAiGatewayProvider,
} from "@/lib/ai-gateway.server";
import { navigation } from "@/constants/navigation";
import type { RuntimePlatformSnapshot } from "@/lib/ai-knowledge-base";

type ChatRequestBody = {
  messages?: unknown;
};

/**
 * Build a runtime snapshot of the platform that AI Assistant uses to keep
 * its answers in sync with the deployed app. This pulls structural facts
 * only (navigation, app identity from system_settings, aggregate counts).
 * Failures are non-fatal — the assistant falls back to the static KB.
 */
async function loadRuntimeSnapshot(): Promise<RuntimePlatformSnapshot> {
  const snap: RuntimePlatformSnapshot = {
    navigation: navigation.map((sec) => ({
      title: sec.title,
      items: sec.items.map((it) => ({ label: it.label, to: it.to })),
    })),
    snapshotAt: new Date().toISOString(),
  };
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return snap;
    const sb = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const [settingsRes, arsipCount, kategoriCount, lokasiCount, profilesCount] =
      await Promise.all([
        sb.from("system_settings").select("key, value").in("key", ["app"]),
        sb.from("arsip").select("id", { count: "estimated", head: true }),
        sb.from("kategori").select("id", { count: "estimated", head: true }),
        sb.from("lokasi").select("id", { count: "estimated", head: true }),
        sb.from("profiles").select("id", { count: "estimated", head: true }),
      ]);
    const appRow = settingsRes.data?.find((r) => r.key === "app");
    if (appRow && appRow.value && typeof appRow.value === "object") {
      const v = appRow.value as Record<string, unknown>;
      snap.appIdentity = {
        name: typeof v.name === "string" ? v.name : undefined,
        description: typeof v.description === "string" ? v.description : undefined,
      };
    }
    snap.aggregates = {
      totalArsip: arsipCount.count ?? undefined,
      totalKategori: kategoriCount.count ?? undefined,
      totalLokasi: lokasiCount.count ?? undefined,
      totalPengguna: profilesCount.count ?? undefined,
    };
  } catch (err) {
    console.warn("[ai-chat] runtime snapshot failed; falling back to static KB", err);
  }
  return snap;
}

/**
 * Endpoint chat untuk PADDS SMANSAT AI Assistant (Digital Customer Assistant).
 *
 * Endpoint ini tidak menggunakan tool calling dan tidak bergantung pada
 * peran/permission pengguna. Setiap request membangun system prompt secara
 * dinamis dari navigasi terkini, identitas aplikasi pada Pengaturan, dan
 * ringkasan agregat sehingga jawaban AI Assistant selalu mengikuti
 * perkembangan platform tanpa redeploy knowledge base.
 */
export const Route = createFileRoute("/api/ai-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: ChatRequestBody;
        try {
          body = (await request.json()) as ChatRequestBody;
        } catch {
          return new Response("Invalid JSON body", { status: 400 });
        }

        const { messages } = body;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        try {
          const snapshot = await loadRuntimeSnapshot();
          const system = buildSipasteraSystemPrompt(snapshot);
          const gateway = createLovableAiGatewayProvider(key);
          const model = gateway("google/gemini-3-flash-preview");

          const result = streamText({
            model,
            system,
            messages: await convertToModelMessages(messages as UIMessage[]),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
            onError: (error) => {
              const msg = error instanceof Error ? error.message : String(error);
              if (msg.includes("429"))
                return "Layanan Asisten PADDS SMANSAT sedang sibuk. Mohon coba lagi beberapa saat kemudian.";
              if (msg.includes("402"))
                return "Kuota layanan Asisten PADDS SMANSAT telah habis. Mohon hubungi pengelola platform untuk menambah kuota.";
              return "Mohon maaf, terjadi gangguan saat menghubungi layanan Asisten PADDS SMANSAT. Silakan coba lagi.";
            },
          });
        } catch (err) {
          console.error("[ai-chat] gateway error", err);
          return new Response("AI gateway error", { status: 500 });
        }
      },
    },
  },
});
