import { Dialog } from "./Dialog";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  const confirmClass =
    variant === "danger"
      ? "px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-mono"
      : "px-4 py-2 bg-winamp-accent text-winamp-bg font-mono hover:opacity-90";

  return (
    <Dialog title={title} onClose={onClose} maxWidth="lg">
      <p className="text-winamp-text text-sm mb-6 break-words min-w-0">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-winamp-accent-muted hover:text-winamp-accent"
        >
          {cancelLabel}
        </button>
        <button type="button" onClick={handleConfirm} className={confirmClass}>
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
