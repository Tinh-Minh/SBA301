import { useCallback, useState } from "react";
import { AdminDialog, AdminPageHeader, AdminState, Pager, PrimaryButton, StatusPill, Tabs, adminInput } from "@/components/admin/AdminUi.jsx";
import { DateTimeField } from "@/components/DateField.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatDateTime, toInputDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";
import { adminVoucherService } from "@/services/admin.service";

const tabs = [
    { id: "", label: "Tất cả" },
    { id: "CURRENT", label: "Đang hiệu lực" },
    { id: "UPCOMING", label: "Sắp diễn ra" },
    { id: "ENDED", label: "Đã kết thúc" },
];
const windowLabel = { CURRENT: "Đang hiệu lực", UPCOMING: "Sắp diễn ra", ENDED: "Đã kết thúc" };

function emptyForm() {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 30);
    return { code: "", description: "", discountType: "PERCENT", discountValue: "10", maxDiscount: "200000", minOrderAmount: "0", startAt: toInputDateTime(start), endAt: toInputDateTime(end), usageLimit: "100", perUserLimit: "1" };
}

export default function AdminVouchers() {
    const [windowState, setWindowState] = useState("");
    const [page, setPage] = useState(0);
    const load = useCallback(() => adminVoucherService.list({ window: windowState || undefined, page, size: 15 }), [windowState, page]);
    const list = useApiQuery(["admin", "vouchers", { windowState, page }], load);
    const rows = list.data?.content ?? [];
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(null);
    const toggle = useApiMutation((voucher) => adminVoucherService.setStatus(voucher.id, voucher.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"), list.reload);
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A04" title="Quản lý voucher" description="Tạo mã giảm giá, giới hạn lượt dùng và bật/tắt voucher." actions={<button type="button" onClick={() => setCreating(true)} className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white">+ Tạo voucher</button>}/>
    <Tabs items={tabs} value={windowState} onChange={id => { setWindowState(id); setPage(0); }}/>
    <AdminState loading={list.loading && !list.data} error={list.error} empty={list.data && !rows.length} label="voucher" onRetry={list.reload}/>
    {toggle.error ? <p className="text-sm text-[#B91C1C]">{toggle.error.message}</p> : null}
    {rows.length ? <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="text-[11px] uppercase tracking-wide text-[#666666]"><tr>{["Mã", "Ưu đãi", "Thời gian", "Đã dùng", "Trạng thái", ""].map(head => <th key={head} className="whitespace-nowrap px-4 py-3 font-bold">{head}</th>)}</tr></thead>
        <tbody>
          {rows.map(voucher => <tr key={voucher.id} className="border-t border-[#E9E9E7] align-top">
            <td className="px-4 py-3"><span className="font-mono font-bold text-[#FC6C26]">{voucher.code}</span><p className="max-w-56 text-xs text-[#666666]">{voucher.description}</p></td>
            <td className="whitespace-nowrap px-4 py-3">{voucher.discountType === "PERCENT" ? `${voucher.discountValue}%` : formatMoney(voucher.discountValue)}
              <p className="text-xs text-[#666666]">{voucher.maxDiscount ? `Tối đa ${formatMoney(voucher.maxDiscount)}` : "Không giới hạn"} • đơn từ {formatMoney(voucher.minOrderAmount)}</p></td>
            <td className="whitespace-nowrap px-4 py-3 text-xs">{formatDateTime(voucher.startAt)}<br/>→ {formatDateTime(voucher.endAt)}<p className="text-[#666666]">{windowLabel[voucher.windowState] ?? voucher.windowState}</p></td>
            <td className="whitespace-nowrap px-4 py-3">{voucher.usedCount}/{voucher.usageLimit ?? "∞"}<p className="text-xs text-[#666666]">{voucher.perUserLimit} lần/khách</p></td>
            <td className="px-4 py-3"><StatusPill tone={voucher.status === "ACTIVE" ? "success" : "neutral"}>{voucher.status === "ACTIVE" ? "Đang bật" : "Đã tắt"}</StatusPill></td>
            <td className="whitespace-nowrap px-4 py-3 text-right">
              <button type="button" onClick={() => setEditing(voucher)} className="mr-3 text-xs font-bold text-[#292929]">Sửa</button>
              <button type="button" disabled={toggle.running} onClick={() => void toggle.run(voucher)} className="text-xs font-bold text-[#FC6C26]">{voucher.status === "ACTIVE" ? "Tắt" : "Bật"}</button>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div> : null}
    <Pager page={page} totalPages={list.data?.totalPages} onPage={setPage}/>
    {creating ? <CreateDialog onClose={() => setCreating(false)} onCreated={() => { setCreating(false); list.reload(); }}/> : null}
    {editing ? <EditDialog voucher={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); list.reload(); }}/> : null}
  </div>;
}

function CreateDialog({ onClose, onCreated }) {
    const [form, setForm] = useState(emptyForm);
    const update = (key) => (event) => setForm(current => ({ ...current, [key]: event.target.value }));
    const create = useApiMutation(() => adminVoucherService.create({ ...form, startAt: new Date(form.startAt), endAt: new Date(form.endAt) }), onCreated);
    return <AdminDialog title="Tạo voucher mới" onClose={onClose}>
    <form className="grid grid-cols-2 gap-3 text-sm" onSubmit={event => { event.preventDefault(); if (!event.currentTarget.reportValidity())
        return; void create.run(); }}>
      <Field label="Mã voucher" wide><input required maxLength={50} value={form.code} onChange={update("code")} className={`${adminInput} uppercase`} placeholder="CARDB10"/></Field>
      <Field label="Mô tả" wide><input value={form.description} onChange={update("description")} className={adminInput}/></Field>
      <Field label="Loại giảm"><select value={form.discountType} onChange={update("discountType")} className={adminInput}><option value="PERCENT">Phần trăm (%)</option><option value="FIXED">Số tiền cố định</option></select></Field>
      <Field label={form.discountType === "PERCENT" ? "Giá trị (%)" : "Giá trị (đ)"}><input required type="number" min="1" value={form.discountValue} onChange={update("discountValue")} className={adminInput}/></Field>
      <Field label="Giảm tối đa (đ)"><input type="number" min="0" value={form.maxDiscount} onChange={update("maxDiscount")} className={adminInput} placeholder="Không giới hạn"/></Field>
      <Field label="Đơn tối thiểu (đ)"><input type="number" min="0" value={form.minOrderAmount} onChange={update("minOrderAmount")} className={adminInput}/></Field>
      <Field label="Bắt đầu"><DateTimeField required value={form.startAt} onChange={update("startAt")} className={adminInput}/></Field>
      <Field label="Kết thúc"><DateTimeField required value={form.endAt} onChange={update("endAt")} className={adminInput}/></Field>
      <Field label="Tổng lượt dùng"><input type="number" min="1" value={form.usageLimit} onChange={update("usageLimit")} className={adminInput} placeholder="Không giới hạn"/></Field>
      <Field label="Lượt / khách"><input required type="number" min="1" value={form.perUserLimit} onChange={update("perUserLimit")} className={adminInput}/></Field>
      {create.error ? <p className="col-span-2 text-sm text-[#B91C1C]">{create.error.message}</p> : null}
      <div className="col-span-2"><PrimaryButton type="submit" disabled={create.running}>{create.running ? "Đang tạo…" : "Tạo voucher"}</PrimaryButton></div>
    </form>
  </AdminDialog>;
}

function EditDialog({ voucher, onClose, onSaved }) {
    const [description, setDescription] = useState(voucher.description ?? "");
    const [usageLimit, setUsageLimit] = useState(voucher.usageLimit ?? "");
    const save = useApiMutation(() => adminVoucherService.update(voucher.id, { description, usageLimit }), onSaved);
    return <AdminDialog title={`Sửa voucher ${voucher.code}`} onClose={onClose}>
    <form className="grid gap-3 text-sm" onSubmit={event => { event.preventDefault(); void save.run(); }}>
      <Field label="Mô tả"><input value={description} onChange={event => setDescription(event.target.value)} className={adminInput}/></Field>
      <Field label={`Tổng lượt dùng (đã dùng ${voucher.usedCount})`}><input type="number" min={Math.max(1, voucher.usedCount)} value={usageLimit} onChange={event => setUsageLimit(event.target.value)} className={adminInput} placeholder="Không giới hạn"/></Field>
      {save.error ? <p className="text-sm text-[#B91C1C]">{save.error.message}</p> : null}
      <PrimaryButton type="submit" disabled={save.running}>Lưu thay đổi</PrimaryButton>
    </form>
  </AdminDialog>;
}

function Field({ label, wide, children }) {
    return <label className={`flex flex-col gap-1 text-xs font-semibold text-[#666666] ${wide ? "col-span-2" : ""}`}>{label}{children}</label>;
}
