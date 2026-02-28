import { createPortal } from "react-dom";
import { X } from "lucide-react";

type DialogProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
};

const maxWidthClass = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Dialog({ title, onClose, children, maxWidth = "md" }: DialogProps) {
  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className={`bg-winamp-panel border border-winamp-border p-6 w-full mx-4 max-h-[90vh] overflow-y-auto ${maxWidthClass[maxWidth]} rounded-lg shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="dialog-title" className="text-lg font-bold text-winamp-accent">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-winamp-accent-muted hover:text-winamp-accent p-1 rounded transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
