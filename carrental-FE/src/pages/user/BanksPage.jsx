import { useCallback, useState } from "react";
import { ProfileLayout } from "@/layouts/ProfileLayout.jsx";
import { LiveState, Primary, fieldClass } from "@/components/LiveUi.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { bankAccountService } from "@/services/bank-account.service";

export default function BanksLive() {
    const load = useCallback(() => bankAccountService.list(), []);
    const list = useApiQuery(["account", "banks"], load);
    const setDefault = useApiMutation(bankAccountService.setDefault, list.reload);
    const remove = useApiMutation(bankAccountService.remove, list.reload);
    return <ProfileLayout live active="banks" title="Tài khoản ngân hàng" description="Tài khoản nhận tiền thuê. Số tài khoản hiển thị dạng đã che sau khi lưu.">
    <LiveState loading={list.loading && !list.data} error={list.error} label="tài khoản ngân hàng" onRetry={list.reload}/>
    <div className="flex flex-col gap-3">
      {(list.data ?? []).map(account => <article key={account.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-4 shadow-sm">
        <div>
          <p className="font-bold">{account.bankName} {account.isDefault ? <span className="text-xs text-[#047857]">• Mặc định</span> : null}</p>
          <p className="font-mono text-sm">{account.accountNumber}</p>
          <p className="text-xs text-[#666666]">{account.accountHolder}</p>
        </div>
        <div className="flex gap-2">
          {!account.isDefault ? <button type="button" disabled={setDefault.running} onClick={() => void setDefault.run(account.id)} className="rounded-lg border border-[#E9E9E7] px-3 py-1.5 text-xs font-bold">Đặt mặc định</button> : null}
          <button type="button" disabled={remove.running} onClick={() => { if (window.confirm("Xóa tài khoản này?")) void remove.run(account.id); }} className="rounded-lg border border-[#EF4444] px-3 py-1.5 text-xs font-bold text-[#EF4444]">Xóa</button>
        </div>
      </article>)}
      {list.data && !list.data.length ? <p className="text-sm text-[#666666]">Chưa có tài khoản nào.</p> : null}
      {setDefault.error || remove.error ? <p className="text-sm text-[#B91C1C]">{(setDefault.error ?? remove.error).message}</p> : null}
    </div>
    <AddForm onDone={list.reload}/>
  </ProfileLayout>;
}

function AddForm({ onDone }) {
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
