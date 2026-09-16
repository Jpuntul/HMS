import { useCallback, useEffect, useId, useRef, useState } from "react";
import axios from "axios";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemName: string;
  itemType: string;
  deleteEndpoint: string;
  onClose: () => void;
  onDelete: () => void;
}

/** Focusable elements inside the dialog, for the focus trap. */
const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  itemName,
  itemType,
  deleteEndpoint,
  onClose,
  onDelete,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  // Element that had focus before the dialog opened, so we can restore it.
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const descriptionId = useId();

  /** Return focus to whatever opened the dialog, if it still exists.
   *
   * The isConnected guard matters on the delete path: the element that opened
   * this dialog is the deleted row's button, and the parent refetches the list
   * on success, so by the time we close, that node is detached. Calling
   * .focus() on a detached node silently does nothing and focus falls to
   * <body> - i.e. the keyboard user lands nowhere, which is the failure this
   * whole component is meant to prevent.
   */
  const restoreFocus = useCallback(() => {
    const previous = restoreFocusRef.current;
    restoreFocusRef.current = null;
    if (previous?.isConnected) previous.focus();
  }, []);

  const handleCancel = useCallback(() => {
    setError("");
    restoreFocus();
    onClose();
  }, [onClose, restoreFocus]);

  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      await axios.delete(deleteEndpoint);
      // Restore before onDelete(): the parent's refetch detaches the trigger,
      // so this is the last moment the original node is still in the DOM.
      restoreFocus();
      onDelete();
      onClose();
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
      setError(`Failed to delete ${itemType}. Please try again.`);
    } finally {
      setDeleting(false);
    }
  };

  // On open: remember what was focused, then move focus to the safe (Cancel)
  // button rather than the destructive one.
  //
  // Restore is driven explicitly from the close paths above rather than from
  // this effect's cleanup - cleanup also fires on unmount, which would race
  // with the parent's post-delete re-render.
  useEffect(() => {
    if (!isOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
  }, [isOpen]);

  // Escape to dismiss, Tab to cycle within the dialog. Without the trap,
  // tabbing walks into the page behind the overlay while it is still visible.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) {
        e.preventDefault();
        handleCancel();
        return;
      }
      if (e.key !== "Tab") return;

      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes?.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, deleting, handleCancel]);

  // Stop the page behind the overlay from scrolling while the dialog is open.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-ink/40"
      // Clicking the backdrop dismisses, matching the Cancel affordance.
      onClick={() => !deleting && handleCancel()}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="badge-card relative top-20 mx-auto w-96 max-w-[calc(100%-2rem)] bg-panel p-6"
        // Clicks inside must not bubble up to the backdrop handler above.
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-stamp-red bg-stamp-red/5">
            <svg
              className="h-6 w-6 text-stamp-red-ink"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 id={titleId} className="mt-4 text-lg font-bold text-ink">
            Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
          </h3>
          <div id={descriptionId} className="mt-2 px-2 py-3">
            <p className="text-sm text-ink-soft">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-ink">{itemName}</span>?
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              This action cannot be undone.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-3 rounded border border-stamp-red/30 bg-stamp-red/5 p-3"
            >
              <p className="text-sm text-stamp-red-ink">{error}</p>
            </div>
          )}

          <div className="items-center pt-3">
            <div className="flex gap-3">
              <button
                ref={cancelRef}
                type="button"
                onClick={handleCancel}
                disabled={deleting}
                className="w-full rounded border-[1.5px] border-ink px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink/[0.05] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="w-full rounded border-[1.5px] border-stamp-red bg-stamp-red px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-stamp-red-ink hover:border-stamp-red-ink disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
            {/* Announced to screen readers when the request is in flight. */}
            <p aria-live="polite" className="sr-only">
              {deleting ? `Deleting ${itemType}` : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
