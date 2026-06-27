import { FileDown, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

function notify(label: string) {
  if (typeof window !== "undefined") {
    window.alert(`${label} akan tersedia pada sprint berikutnya.`);
  }
}

export function StatisticsExport() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => notify("Export PDF")}>
        <FileDown className="mr-2 h-4 w-4" /> Export PDF
      </Button>
      <Button variant="outline" size="sm" onClick={() => notify("Export Excel")}>
        <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
      </Button>
    </div>
  );
}