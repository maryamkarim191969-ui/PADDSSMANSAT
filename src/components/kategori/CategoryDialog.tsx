import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Kategori } from "@/lib/kategori-data";
import { CategoryForm, type CategoryFormValues } from "./CategoryForm";

export function CategoryDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: Kategori | null;
  onSubmit: (values: CategoryFormValues) => void;
}) {
  const isEdit = !!initial;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi kategori arsip yang dipilih."
              : "Buat kategori baru untuk mengelompokkan arsip."}
          </DialogDescription>
        </DialogHeader>

        <CategoryForm
          initial={initial}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={isEdit ? "Simpan Perubahan" : "Tambah Kategori"}
        />
      </DialogContent>
    </Dialog>
  );
}