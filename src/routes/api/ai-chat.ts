import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  SIPASTERA_SYSTEM_PROMPT,
  createLovableAiGatewayProvider,
} from "@/lib/ai-gateway.server";

type ChatRequestBody = {
  messages?: unknown;
};

/**
 * Endpoint chat untuk PADDS SMANSAT AI Assistant (Digital Customer Assistant).
 *
 * Endpoint ini tidak menyentuh database, tidak menggunakan tool calling,
 * dan tidak bergantung pada peran/permission pengguna. Tanggung jawabnya
 * hanya melakukan streaming jawaban model berdasarkan system prompt dan
 * knowledge base platform PADDS SMANSAT.
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
          const gateway = createLovableAiGatewayProvider(key);
          const model = gateway("google/gemini-3-flash-preview");

          const result = streamText({
            model,
            system: SIPASTERA_SYSTEM_PROMPT,
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
