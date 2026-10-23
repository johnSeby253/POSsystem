
import { AlertTriangle, Trash2 } from "lucide-react";
import CustomModal from "./CustomModal";
import Button from "./Button";

const DeleteConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = "Delete item?",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName = "",
  size="sm",
  confirmText = "Delete",
  loading = false,
}) => {
  const handleConfirm = async () => {
    if (loading) return;

    await onConfirm?.();
  };

  return (
    <CustomModal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      size={size}
      closeOnBackdrop={!loading}
      showCloseButton={!loading}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            disabled={loading}
          >
            <Trash2 size={16} />
            {loading ? "Deleting..." : confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle size={24} />
        </div>

        <div className="min-w-0">
          <p className="text-sm leading-6 text-slate-600">
            {message}
          </p>

          {itemName && (
            <p className="mt-2 break-words text-sm font-semibold text-slate-900">
              {itemName}
            </p>
          )}

          <p className="mt-3 text-xs text-red-600">
            This action cannot be undone.
          </p>
        </div>
      </div>
    </CustomModal>
  );
};

export default DeleteConfirmModal;
