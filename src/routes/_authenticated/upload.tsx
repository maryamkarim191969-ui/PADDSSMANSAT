import { createFileRoute } from "@tanstack/react-router";
import { UploadWorkspace } from "@/features/upload-intelligence/components/UploadWorkspace";

export const Route = createFileRoute("/_authenticated/upload")({
  head: () => ({
    meta: [
      { title: "Upload Arsip — SIPASTERA" },
      {
        name: "description",
        content:
          "AI Document Intelligence Workspace — unggah, analisis, dan simpan dokumen arsip secara otomatis.",
      },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  return <UploadWorkspace />;
}
