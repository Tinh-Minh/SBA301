export function ConfirmDialog({ open, title, description, confirmLabel = "Xác nhận", danger = false, busy = false, error, onClose, onConfirm, children }) {
    if (!open)
        return null;
    return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#292929]/45 p-4" role="presentation" onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={event => event.stopPropagation()}>
      <h2 id="confirm-dialog-title" className="text-lg font-bold text-[#292929]">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-[#666666]">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
      {error ? <p role="alert" className="mt-3 text-sm text-[#B91C1C]">{error}</p> : null}
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-xl border border-[#E9E9E7] px-4 py-2 text-sm font-semibold text-[#292929]">Đóng</button>
        <button type="button" disabled={busy} onClick={onConfirm} className={`rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-50 ${danger ? "bg-[#B91C1C]" : "bg-[#FC6C26]"}`}>{busy ? "Đang xử lý…" : confirmLabel}</button>
      </div>
    </div>
  </div>;
}
