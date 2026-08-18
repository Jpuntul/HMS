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
      className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50"
      // Clicking the backdrop dismisses, matching the Cancel affordance.
      onClick={() => !deleting && handleCancel()}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        // Clicks inside must not bubble up to the backdrop handler above.
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
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
          <h3
            id={titleId}
            className="text-lg leading-6 font-medium text-gray-900 mt-4"
          >
            Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
          </h3>
          <div id={descriptionId} className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{itemName}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="items-center px-4 py-3">
            <div className="flex space-x-3">
              <button
                ref={cancelRef}
                type="button"
                onClick={handleCancel}
                disabled={deleting}
                className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
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
