import { useRef, useState } from "react";
import { Primary, fieldClass } from "@/components/LiveUi.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { DateField } from "@/components/DateField.jsx";
import { userDocumentService } from "@/services/accountService.js";

export const tone = { PENDING: "bg-[#FEF3C7] text-[#B45309]", APPROVED: "bg-[#D1FAE5] text-[#047857]", REJECTED: "bg-[#FEE2E2] text-[#B91C1C]" };
const empty = { docType: "CITIZEN_ID", docNumber: "", fullNameOnDoc: "", dateOfBirthOnDoc: "", issuePlace: "", issueDate: "", expiresAt: "", licenseClass: "" };

export function SubmitForm({
    onDone,
    isOwner = false,
    hasPendingUpgrade = false,
    hasPendingDriverLicense = false,
    maxUpgradeAttempts = 3,
    upgradeAttemptsRemaining = 3,
}) {
    const [form, setForm] = useState(empty);
    const [frontImage, setFront] = useState(null);
    const [backImage, setBack] = useState(null);
    const frontInput = useRef(null);
    const backInput = useRef(null);
    const update = (key) => (event) => setForm(current => ({ ...current, [key]: event.target.value }));
    const isIdentityDoc = form.docType === "CITIZEN_ID" || form.docType === "PASSPORT";
    const limitBlocked = isIdentityDoc && !isOwner && upgradeAttemptsRemaining <= 0;
    const pendingBlocked = isIdentityDoc ? hasPendingUpgrade : hasPendingDriverLicense;
    const blockedMessage = limitBlocked
        ? `Bạn đã sử dụng hết tối đa ${maxUpgradeAttempts}/${maxUpgradeAttempts} lần gửi yêu cầu nâng cấp chủ xe (kể cả các lần đã bị từ chối). Không thể gửi thêm yêu cầu mới.`
        : pendingBlocked
            ? (isIdentityDoc
                ? "Bạn đang có yêu cầu nâng cấp chủ xe (CCCD/Hộ chiếu) ở trạng thái chờ duyệt (PENDING). Vui lòng chờ Admin xử lý trước khi gửi lại."
                : "Bạn đang có hồ sơ Giấy phép lái xe chờ duyệt (PENDING). Vui lòng chờ kết quả trước khi gửi lại.")
            : "";

    const submit = useApiMutation(async () => {
        if (blockedMessage)
            throw new Error(blockedMessage);
        await userDocumentService.submit({ ...form, frontImage, backImage });
        setForm(empty);
        setFront(null);
        setBack(null);
        if (frontInput.current) frontInput.current.value = "";
        if (backInput.current) backInput.current.value = "";
        onDone();
    });
    return <form className="grid gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm sm:grid-cols-2" onSubmit={event => { event.preventDefault(); if (blockedMessage || !event.currentTarget.reportValidity())
        return; void submit.run(); }}>
    <h2 className="sm:col-span-2 text-lg font-bold">Nộp giấy tờ mới</h2>
    <p className="sm:col-span-2 text-xs text-[#666666]">Ảnh mặt trước là bắt buộc. Máy chủ phải bật lưu trữ giấy tờ (APP_DOCUMENT_STORAGE_ENABLED) thì mới nhận file.</p>
    {blockedMessage ? (
      <div role="alert" className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-[#B91C1C]">
        {blockedMessage}
      </div>
    ) : null}
    <label className="text-xs font-semibold text-[#666666]">Loại giấy tờ
      <select value={form.docType} onChange={update("docType")} className={`${fieldClass} mt-1`}><option value="CITIZEN_ID">CCCD / CMND</option><option value="DRIVER_LICENSE">Giấy phép lái xe</option><option value="PASSPORT">Hộ chiếu</option></select>
    </label>
    <label className="text-xs font-semibold text-[#666666]">Số giấy tờ<input required disabled={Boolean(blockedMessage)} maxLength={50} value={form.docNumber} onChange={update("docNumber")} className={`${fieldClass} mt-1`}/></label>
    <label className="text-xs font-semibold text-[#666666]">Họ tên trên giấy<input disabled={Boolean(blockedMessage)} value={form.fullNameOnDoc} onChange={update("fullNameOnDoc")} className={`${fieldClass} mt-1`}/></label>
    <label className="text-xs font-semibold text-[#666666]">Ngày sinh trên giấy<DateField value={form.dateOfBirthOnDoc} onChange={update("dateOfBirthOnDoc")} className={`${fieldClass} mt-1`}/></label>
    <label className="text-xs font-semibold text-[#666666]">Nơi cấp<input disabled={Boolean(blockedMessage)} value={form.issuePlace} onChange={update("issuePlace")} className={`${fieldClass} mt-1`}/></label>
    <label className="text-xs font-semibold text-[#666666]">Ngày cấp<DateField value={form.issueDate} onChange={update("issueDate")} className={`${fieldClass} mt-1`}/></label>
    <label className="text-xs font-semibold text-[#666666]">Ngày hết hạn<DateField value={form.expiresAt} onChange={update("expiresAt")} className={`${fieldClass} mt-1`}/></label>
    {form.docType === "DRIVER_LICENSE" ? <label className="text-xs font-semibold text-[#666666]">Hạng bằng<input required disabled={Boolean(blockedMessage)} value={form.licenseClass} onChange={update("licenseClass")} placeholder="B2" className={`${fieldClass} mt-1`}/></label> : null}
    <label className="text-xs font-semibold text-[#666666]">Ảnh mặt trước<input ref={frontInput} required disabled={Boolean(blockedMessage)} type="file" accept="image/*" onChange={event => setFront(event.target.files?.[0] ?? null)} className={`${fieldClass} mt-1`}/></label>
    <label className="text-xs font-semibold text-[#666666]">Ảnh mặt sau<input ref={backInput} disabled={Boolean(blockedMessage)} type="file" accept="image/*" onChange={event => setBack(event.target.files?.[0] ?? null)} className={`${fieldClass} mt-1`}/></label>
    {submit.error ? <p role="alert" className="sm:col-span-2 text-sm text-[#B91C1C]">{submit.error.message}</p> : null}
    <div className="sm:col-span-2">
      <Primary type="submit" disabled={submit.running || Boolean(blockedMessage)}>
        {submit.running ? "Đang gửi…" : limitBlocked ? `Đã đạt giới hạn (${maxUpgradeAttempts}/${maxUpgradeAttempts})` : pendingBlocked ? "Đang có hồ sơ chờ duyệt" : "Gửi hồ sơ"}
      </Primary>
    </div>
  </form>;
}
