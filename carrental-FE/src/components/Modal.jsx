import BootstrapModal from "react-bootstrap/Modal";
import { Icon } from "@/components/Icon.jsx";
export function Modal({ title, close, children }) {
    function wrapFocus(event) {
        if (event.key !== "Tab") return;
        const dialog = event.currentTarget;
        const controls = [...dialog.querySelectorAll("button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex='-1'])")]
            .filter(element => element.tabIndex >= 0 && element.getClientRects().length);
        const first = controls[0];
        const last = controls.at(-1);
        // Keep Tab inside the dialog when the next stop would be browser chrome.
        if (!event.shiftKey && document.activeElement === last || event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
            event.preventDefault();
            (event.shiftKey ? last : first)?.focus();
        }
    }
    return <BootstrapModal show centered animation={false} onKeyDown={wrapFocus} onHide={close} aria-labelledby="app-dialog-title" className="cardb-modal" backdropClassName="cardb-modal-backdrop" dialogClassName="mx-auto my-4 w-[calc(100%-2rem)] max-w-2xl" contentClassName="rounded-xl border border-border-light bg-white p-0 text-text-primary shadow-2xl">
      <div className="p-5 sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="app-dialog-title" className="text-xl font-bold">{title}</h2>
          <button type="button" aria-label="Đóng hộp thoại" onClick={close} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-section-bg"><Icon name="close" className="text-[20px]"/></button>
        </div>
        {children}
      </div>
    </BootstrapModal>;
}

