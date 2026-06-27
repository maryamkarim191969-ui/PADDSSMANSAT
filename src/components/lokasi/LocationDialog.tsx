import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Lokasi } from "@/lib/lokasi-data";
import { LocationForm, type LocationFormValues } from "./LocationForm";

export function LocationDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: Lokasi | null;
  onSubmit: (values: LocationFormValues) => void;
}) {
  const isEdit = !!initial;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Lokasi" : "Tambah Lokasi"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi lokasi penyimpanan fisik arsip."
              : "Tambahkan lokasi penyimpanan fisik baru untuk arsip."}
          </DialogDescription>
        </DialogHeader>

        <LocationForm
          initial={initial}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={isEdit ? "Simpan Perubahan" : "Tambah Lokasi"}
        />
      </DialogContent>
    </Dialog>
  );
}
