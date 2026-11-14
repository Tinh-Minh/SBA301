import { useState } from "react";
import { Primary, fieldClass } from "@/components/LiveUi.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { bankAccountService } from "@/services/accountService.js";

export function AddForm({ onDone }) {
    const [form, setForm] = useState({ bankName: "", accountNumber: "", accountHolder: "", makeDefault: true });
    const [localError, setLocalError] = useState("");
    const [confirm, setConfirm] = useState(false);
    const update = (key) => (event) => setForm(current => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
    const create = useApiMutation(() => bankAccountService.create(form), () => { setForm({ bankName: "", accountNumber: "", accountHolder: "", makeDefault: false }); setConfirm(false); onDone(); });
    function askSave(event) {
        event.preventDefault();
        const bankName = form.bankName.trim();
        const accountNumber = form.accountNumber.trim();
        const accountHolder = form.accountHolder.trim();
        if (!bankName || bankName.length > 100) { setLocalError("Tên ngân hàng từ 1 đến 100 ký tự."); return; }
        if (!accountNumber || accountNumber.length > 30) { setLocalError("Số tài khoản từ 1 đến 30 ký tự."); return; }
        if (!accountHolder || accountHolder.length > 150) { setLocalError("Tên chủ tài khoản từ 1 đến 150 ký tự."); return; }
        setLocalError("");
        setConfirm(true);
    }
    return <form className="grid gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm sm:grid-cols-2" onSubmit={askSave}>
    <h2 className="sm:col-span-2 text-lg font-bold">Thêm tài khoản</h2>
    <label className="text-xs font-semibold text-[#666666]">Ngân hàng<input required maxLength={100} value={form.bankName} onChange={update("bankName")} className={`${fieldClass} mt-1`} placeholder="Vietcombank"/></label>
    <label className="text-xs font-semibold text-[#666666]">Số tài khoản<input required maxLength={30} value={form.accountNumber} onChange={update("accountNumber")} className={`${fieldClass} mt-1`}/></label>
    <label className="sm:col-span-2 text-xs font-semibold text-[#666666]">Chủ tài khoản<input required maxLength={150} value={form.accountHolder} onChange={update("accountHolder")} className={`${fieldClass} mt-1`}/></label>
    <label className="sm:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.makeDefault} onChange={update("makeDefault")}/> Đặt làm tài khoản mặc định</label>
    {localError || create.error ? <p className="sm:col-span-2 text-sm text-[#B91C1C]">{localError || create.error.message}</p> : null}
    <div className="sm:col-span-2"><Primary type="submit" disabled={create.running}>{create.running ? "Đang lưu…" : "Lưu tài khoản"}</Primary></div>
    {confirm ? <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#292929]/45 p-4" role="presentation" onClick={() => setConfirm(false)}>
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={event => event.stopPropagation()}>
        <h3 className="text-lg font-bold">Xác nhận lưu tài khoản</h3>
        <p className="mt-2 text-sm text-[#666666]">{form.bankName.trim()} • {form.accountNumber.trim()} • {form.accountHolder.trim()}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setConfirm(false)} className="rounded-xl border border-[#E9E9E7] px-4 py-2 text-sm font-semibold">Đóng</button>
          <button type="button" disabled={create.running} onClick={() => void create.run()} className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Lưu</button>
        </div>
      </div>
    </div> : null}
  </form>;
}
