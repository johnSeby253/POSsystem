
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import Button from "../common/Button";

const CustomModal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          closeOnBackdrop &&
          event.target === event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-modal-title"
        aria-describedby={
          description ? "custom-modal-description" : undefined
        }
        className={[
          "relative my-auto flex max-h-[90dvh] w-full flex-col",
          "overflow-hidden rounded-2xl bg-white shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-200",
          widthClasses[size] || widthClasses.md,
        ].join(" ")}
      >
        {(title || showCloseButton) && (
          <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              {title && (
                <h2
                  id="custom-modal-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {title}
                </h2>
              )}

              {description && (
                <p
                  id="custom-modal-description"
                  className="mt-1 text-sm leading-6 text-slate-500"
                >
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close dialog"
                className="shrink-0 rounded-lg"
              >
                <X size={20} />
              </Button>
            )}
          </header>
        )}

        <div className="overflow-y-auto p-6">
          {children}
        </div>

        {footer && (
          <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-100 px-6 py-4">
            {footer}
          </footer>
        )}
      </section>
    </div>,
    document.body
  );
};

export default CustomModal;
