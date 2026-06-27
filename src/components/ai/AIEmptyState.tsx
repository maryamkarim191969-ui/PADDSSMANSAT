import { Bot, LifeBuoy } from "lucide-react";

export function AIEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/20">
          <Bot className="h-8 w-8" />
        </div>
        <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-amber-400 text-white ring-2 ring-card">
          <LifeBuoy className="h-3.5 w-3.5" />
        </span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-foreground">Selamat datang di Asisten SIPASTERA</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Saya siap membantu Anda memahami fungsi setiap modul, cara menggunakan
        fitur, serta alur kerja pengarsipan pada platform SIPASTERA. Silakan
        ajukan pertanyaan kapan saja.
      </p>
    </div>
  );
}
