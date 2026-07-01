import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * AI Document Intelligence — server-side orchestrator.
 *
 * Reads the document bytes, runs OCR/Document Understanding through the
 * Lovable AI Gateway (Gemini multimodal — same LLM that powers the in-app
 * AI Assistant), and returns structured metadata extracted strictly from
 * the document content. The model MUST return null for any field it cannot
 * find verbatim in the document; the UI then tags those fields "Perlu Diisi
 * Manual". Filenames are never passed to the model — we do not want them
 * leaking into the extraction prompt.
 */

const InputSchema = z.object({
  mime: z.string().min(1),
  base64: z.string().min(1),
  // textPreview is only populated for plain-text documents (csv/txt/etc.).
  textPreview: z.string().optional(),
  // sizeBytes is informational; the validation layer already enforced limits.
  sizeBytes: z.number().int().nonnegative(),
  /**
   * Daftar kategori aktif yang dimiliki platform. Dikirim dari klien agar
   * AI Smart Category Recognition selalu memilih kategori dari daftar
   * resmi. Bila daftar kosong, prompt jatuh ke fallback default.
   */
  availableCategories: z.array(z.string().trim().min(1).max(120)).max(200).optional(),
});

export type AnalyzeDocumentInput = z.infer<typeof InputSchema>;

const FieldSchema = z.object({
  value: z.string().nullable(),
  confidence: z.number().min(0).max(1).nullable(),
});

const ResponseSchema = z.object({
  judul: FieldSchema,
  nomor_surat: FieldSchema,
  tanggal_surat: FieldSchema,
  tanggal_dokumen: FieldSchema,
  pengirim: FieldSchema,
  penerima: FieldSchema,
  instansi: FieldSchema,
  perihal: FieldSchema,
  jenis: FieldSchema,
  kategori: FieldSchema,
  lokasi_fisik: FieldSchema,
  ringkasan: FieldSchema,
  keywords: z.object({
    value: z.array(z.string()).nullable(),
    confidence: z.number().min(0).max(1).nullable(),
  }),
  /**
   * Usulan kategori baru bila AI menilai dokumen benar-benar bukan bagian
   * dari daftar kategori aktif. Nilai default null; wajib disertai alasan
   * agar administrator dapat menilai kelayakannya.
   */
  kategori_saran_baru: z
    .object({
      value: z.string().nullable(),
      alasan: z.string().nullable(),
    })
    .optional()
    .default({ value: null, alasan: null }),
});

export type AnalyzeDocumentResult = {
  metadata: z.infer<typeof ResponseSchema>;
  durations: { parse: number; llm: number; total: number };
};

function buildSystemPrompt(availableCategories: string[] | undefined): string {
  const cats = (availableCategories ?? [])
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  const catList = cats.length > 0 ? cats : [
    "Administrasi",
    "Keuangan",
    "Kesiswaan",
    "Kepegawaian",
    "Kurikulum",
    "Lainnya",
  ];
  const catEnum = catList.map((c) => JSON.stringify(c)).join(" | ");
  return `You are PADDS SMANSAT Document Intelligence — an expert Indonesian school-archive analyst.

You read the SINGLE attached document and extract administrative metadata STRICTLY from its visible content. Follow these absolute rules:

1. Read the document text (use OCR for scans/images) and understand it as a whole.
2. Extract values only when they are stated or directly implied by the document body.
3. NEVER invent, guess, or infer from filename hints (you are not given the filename anyway).
4. If a field is not present in the document, set value = null and confidence = 0. Do not fabricate.
5. Output ONLY valid JSON that matches the schema below. No prose, no markdown, no commentary.
6. Indonesian language for textual values where the document is Indonesian. Preserve original casing for proper nouns / numbers.
7. "ringkasan" must be 1-3 sentences summarising the actual document content.
8. "keywords" is an array of 3-8 short Indonesian keywords found in the document.
9. "jenis" must be one of: "Surat Masuk", "Surat Keluar", "Internal" — only when the document type is clearly identifiable.
10. "kategori" — AI Smart Category Recognition — WAJIB dipilih dari salah satu kategori aktif berikut: ${catEnum}. Bila salah satu kategori tersebut cocok dengan dokumen, gunakan kategori itu (kembalikan namanya persis, case-sensitive). Jika tidak ada satupun yang cocok, set "kategori.value" = null dan gunakan field "kategori_saran_baru" untuk mengusulkan kategori baru beserta alasan singkat berbahasa Indonesia. JANGAN membuat kategori baru bila salah satu kategori aktif masih relevan.
11. "tanggal_surat" / "tanggal_dokumen" must be ISO format YYYY-MM-DD when day/month/year are present in the document.
12. Confidence reflects how clearly the value appears in the document: 1.0 = stated verbatim, 0.85+ = unambiguous, 0.6-0.84 = partial / inferred from neighbouring text, below 0.6 = weak signal (prefer null instead).

Schema (return ONE object, this shape exactly):
{
  "judul": { "value": string|null, "confidence": 0..1 },
  "nomor_surat": { "value": string|null, "confidence": 0..1 },
  "tanggal_surat": { "value": "YYYY-MM-DD"|null, "confidence": 0..1 },
  "tanggal_dokumen": { "value": "YYYY-MM-DD"|null, "confidence": 0..1 },
  "pengirim": { "value": string|null, "confidence": 0..1 },
  "penerima": { "value": string|null, "confidence": 0..1 },
  "instansi": { "value": string|null, "confidence": 0..1 },
  "perihal": { "value": string|null, "confidence": 0..1 },
  "jenis": { "value": "Surat Masuk"|"Surat Keluar"|"Internal"|null, "confidence": 0..1 },
  "kategori": { "value": (${catEnum})|null, "confidence": 0..1 },
  "lokasi_fisik": { "value": string|null, "confidence": 0..1 },
  "ringkasan": { "value": string|null, "confidence": 0..1 },
  "keywords": { "value": string[]|null, "confidence": 0..1 },
  "kategori_saran_baru": { "value": string|null, "alasan": string|null }
}`;
}

function buildUserContent(input: AnalyzeDocumentInput): unknown[] {
  const blocks: unknown[] = [
    {
      type: "text",
      text: "Analisis dokumen berikut dan kembalikan metadata sesuai schema. Jika sebuah field tidak terdapat di dalam dokumen, set value=null dan confidence=0. Jangan menggunakan informasi di luar isi dokumen.",
    },
  ];

  if (input.mime.startsWith("image/")) {
    blocks.push({
      type: "image_url",
      image_url: { url: `data:${input.mime};base64,${input.base64}` },
    });
  } else if (input.mime === "application/pdf") {
    blocks.push({
      type: "file",
      file: {
        filename: "document.pdf",
        file_data: `data:${input.mime};base64,${input.base64}`,
      },
    });
  } else if (input.textPreview) {
    // For DOC/DOCX/XLS/XLSX/CSV/TXT we send the parsed text so the LLM
    // still works on the document's actual content, not its filename.
    blocks.push({
      type: "text",
      text: `Isi dokumen (teks mentah):\n\n${input.textPreview.slice(0, 60_000)}`,
    });
  } else {
    blocks.push({
      type: "text",
      text: "Dokumen ini bertipe biner non-multimodal dan tidak memiliki preview teks. Kembalikan semua field bernilai null dengan confidence 0.",
    });
  }
  return blocks;
}

async function callLovableAi(
  content: unknown[],
  systemPrompt: string,
): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    throw new Error("LOVABLE_API_KEY belum dikonfigurasi.");
  }
  const body = {
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content },
    ],
    response_format: { type: "json_object" },
    temperature: 0.05,
  };
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(
        "Layanan AI sedang sibuk (rate limit). Coba lagi dalam beberapa saat.",
      );
    }
    if (res.status === 402) {
      throw new Error(
        "Kredit AI Gateway habis. Tambahkan kredit pada workspace Lovable.",
      );
    }
    const text = await res.text().catch(() => "");
    throw new Error(`AI Gateway error ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content_str = json.choices?.[0]?.message?.content;
  if (!content_str) {
    throw new Error("Respons AI kosong.");
  }
  return content_str;
}

function safeJsonParse(raw: string): unknown {
  // The model is instructed to return JSON, but occasionally wraps it in
  // markdown fences. Strip them defensively before parsing.
  const trimmed = raw.trim();
  const stripped = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(stripped);
  } catch {
    // Try to locate the first {...} block.
    const start = stripped.indexOf("{");
    const end = stripped.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(stripped.slice(start, end + 1));
    }
    throw new Error("AI mengembalikan respons yang tidak dapat di-parse sebagai JSON.");
  }
}

export const analyzeDocument = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalyzeDocumentResult> => {
    const t0 = Date.now();
    const content = buildUserContent(data);
    const tParse = Date.now() - t0;

    const tLlmStart = Date.now();
    const raw = await callLovableAi(
      content,
      buildSystemPrompt(data.availableCategories),
    );
    const tLlm = Date.now() - tLlmStart;

    const parsed = safeJsonParse(raw);
    const metadata = ResponseSchema.parse(parsed);

    return {
      metadata,
      durations: { parse: tParse, llm: tLlm, total: Date.now() - t0 },
    };
  });
