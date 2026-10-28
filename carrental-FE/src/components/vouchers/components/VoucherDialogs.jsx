import { useState } from "react";
import { AdminDialog, PrimaryButton, adminInput } from "@/components/admin/AdminUi.jsx";
import { DateTimeField } from "@/components/DateField.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { toInputDateTime } from "@/utils/datetime.js";
import { adminVoucherService } from "@/hooks/useAdmin.js";

export const tabs = [
    { id: "", label: "Tất cả" },
    { id: "CURRENT", label: "Đang hiệu lực" },
    { id: "UPCOMING", label: "Sắp diễn ra" },
    { id: "ENDED", label: "Đã kết thúc" },
];
export const windowLabel = { CURRENT: "Đang hiệu lực", UPCOMING: "Sắp diễn ra", ENDED: "Đã kết thúc" };

function emptyForm() {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 30);
    return { code: "", description: "", discountType: "PERCENT", discountValue: "10", maxDiscount: "200000", minOrderAmount: "0", startAt: toInputDateTime(start), endAt: toInputDateTime(end), usageLimit: "100", perUserLimit: "1" };
}

export function CreateDialog({ onClose, onCreated }) {
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

export function EditDialog({ voucher, onClose, onSaved }) {
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
