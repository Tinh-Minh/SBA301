import { useState } from "react";
import { Primary, fieldClass } from "@/components/LiveUi.jsx";
import { useApiMutation } from "@/shared/hooks/useApiMutation.js";
import { DateField } from "@/components/DateField.jsx";
import { userDocumentService } from "@/shared/hooks/useAccount.js";

export const tone = { PENDING: "bg-[#FEF3C7] text-[#B45309]", APPROVED: "bg-[#D1FAE5] text-[#047857]", REJECTED: "bg-[#FEE2E2] text-[#B91C1C]" };
const empty = { docType: "CITIZEN_ID", docNumber: "", fullNameOnDoc: "", dateOfBirthOnDoc: "", issuePlace: "", issueDate: "", expiresAt: "", licenseClass: "" };

export function SubmitForm({ onDone }) {
    const [form, setForm] = useState(empty);
    const [frontImage, setFront] = useState(null);
    const [backImage, setBack] = useState(null);
    const update = (key) => (event) => setForm(current => ({ ...current, [key]: event.target.value }));
    const submit = useApiMutation(async () => {
        await userDocumentService.submit({ ...form, frontImage, backImage });
        setForm(empty);
        setFront(null);
        setBack(null);
        onDone();
    });
    return <form className="grid gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm sm:grid-cols-2" onSubmit={event => { event.preventDefault(); if (!event.currentTarget.reportValidity())
        return; void submit.run(); }}>
    <h2 className="sm:col-span-2 text-lg font-bold">Nộp giấy tờ mới</h2>
    <p className="sm:col-span-2 text-xs text-[#666666]">Ảnh mặt trước là bắt buộc. Máy chủ phải bật lưu trữ giấy tờ (APP_DOCUMENT_STORAGE_ENABLED) thì mới nhận file.</p>
    <label className="text-xs font-semibold text-[#666666]">Loại giấy tờ
      <select value={form.docType} onChange={update("docType")} className={`${fieldClass} mt-1`}><option value="CITIZEN_ID">CCCD / CMND</option><option value="DRIVER_LICENSE">Giấy phép lái xe</option><option value="PASSPORT">Hộ chiếu</option></select>
    </label>
    <label className="text-xs font-semibold text-[#666666]">Số giấy tờ<input required maxLength={50} value={form.docNumber} onChange={update("docNumber")} className={`${fieldClass} mt-1`}/></label>
    <label className="text-xs font-semibold text-[#666666]">Họ tên trên giấy<input value={form.fullNameOnDoc} onChange={update("fullNameOnDoc")} className={`${fieldClass} mt-1`}/></label>
    <label className="text-xs font-semibold text-[#666666]">Ngày sinh trên giấy<DateField value={form.dateOfBirthOnDoc} onChange={update("dateOfBirthOnDoc")} className={`${fieldClass} mt-1`}/></label>
    <label className="text-xs font-semibold text-[#666666]">Nơi cấp<input value={form.issuePlace} onChange={update("issuePlace")} className={`${fieldClass} mt-1`}/></label>
    <label className="text-xs font-semibold text-[#666666]">Ngày cấp<DateField value={form.issueDate} onChange={update("issueDate")} className={`${fieldClass} mt-1`}/></label>
    <label className="text-xs font-semibold text-[#666666]">Ngày hết hạn<DateField value={form.expiresAt} onChange={update("expiresAt")} className={`${fieldClass} mt-1`}/></label>
    {form.docType === "DRIVER_LICENSE" ? <label className="text-xs font-semibold text-[#666666]">Hạng bằng<input required value={form.licenseClass} onChange={update("licenseClass")} placeholder="B2" className={`${fieldClass} mt-1`}/></label> : null}
    <label className="text-xs font-semibold text-[#666666]">Ảnh mặt trước<input required type="file" accept="image/*" onChange={event => setFront(event.target.files?.[0] ?? null)} className={`${fieldClass} mt-1`}/></label>
    <label className="text-xs font-semibold text-[#666666]">Ảnh mặt sau<input type="file" accept="image/*" onChange={event => setBack(event.target.files?.[0] ?? null)} className={`${fieldClass} mt-1`}/></label>
    {submit.error ? <p className="sm:col-span-2 text-sm text-[#B91C1C]">{submit.error.message}</p> : null}
    <div className="sm:col-span-2"><Primary type="submit" disabled={submit.running}>{submit.running ? "Đang gửi…" : "Gửi hồ sơ"}</Primary></div>
  </form>;
}
