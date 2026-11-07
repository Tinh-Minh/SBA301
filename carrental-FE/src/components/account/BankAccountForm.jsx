import { useState } from "react";
import { Primary, fieldClass } from "@/components/LiveUi.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { bankAccountService } from "@/services/accountService.js";

export function AddForm({ onDone }) {
    const [form, setForm] = useState({ bankName: "", accountNumber: "", accountHolder: "", makeDefault: true });
    const update = (key) => (event) => setForm(current => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
    const create = useApiMutation(() => bankAccountService.create(form), () => { setForm({ bankName: "", accountNumber: "", accountHolder: "", makeDefault: false }); onDone(); });
    return <form className="grid gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm sm:grid-cols-2" onSubmit={event => { event.preventDefault(); void create.run(); }}>
    <h2 className="sm:col-span-2 text-lg font-bold">Thêm tài khoản</h2>
    <label className="text-xs font-semibold text-[#666666]">Ngân hàng<input required value={form.bankName} onChange={update("bankName")} className={`${fieldClass} mt-1`} placeholder="Vietcombank"/></label>
    <label className="text-xs font-semibold text-[#666666]">Số tài khoản<input required value={form.accountNumber} onChange={update("accountNumber")} className={`${fieldClass} mt-1`}/></label>
    <label className="sm:col-span-2 text-xs font-semibold text-[#666666]">Chủ tài khoản<input required value={form.accountHolder} onChange={update("accountHolder")} className={`${fieldClass} mt-1`}/></label>
    <label className="sm:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.makeDefault} onChange={update("makeDefault")}/> Đặt làm tài khoản mặc định</label>
    {create.error ? <p className="sm:col-span-2 text-sm text-[#B91C1C]">{create.error.message}</p> : null}
    <div className="sm:col-span-2"><Primary type="submit" disabled={create.running}>{create.running ? "Đang lưu…" : "Lưu tài khoản"}</Primary></div>
  </form>;
}
