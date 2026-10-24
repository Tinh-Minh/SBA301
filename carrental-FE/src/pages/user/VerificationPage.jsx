import { useCallback, useState } from "react";
import { ProfileLayout } from "@/shared/layouts/ProfileLayout.jsx";
import { LiveState, Pill, Primary, fieldClass } from "@/shared/components/LiveUi.jsx";
import { useApiQuery } from "@/shared/hooks/useApiQuery.js";
import { useApiMutation } from "@/shared/hooks/useApiMutation.js";
import { DateField } from "@/shared/components/DateField.jsx";
import { formatDateTime } from "@/shared/utils/datetime.js";
import { docTypeLabels, verifyStatusLabels } from "@/shared/utils/labels.js";
import { userDocumentService } from "@/services/customer-extra.service";

const tone = { PENDING: "bg-[#FEF3C7] text-[#B45309]", APPROVED: "bg-[#D1FAE5] text-[#047857]", REJECTED: "bg-[#FEE2E2] text-[#B91C1C]" };
const empty = { docType: "CITIZEN_ID", docNumber: "", fullNameOnDoc: "", dateOfBirthOnDoc: "", issuePlace: "", issueDate: "", expiresAt: "", licenseClass: "" };

export default function VerificationLive() {
    const load = useCallback(() => userDocumentService.listMine(), []);
    const list = useApiQuery(["account", "documents"], load);
    return <ProfileLayout live active="verification" title="Xác minh giấy tờ" description="Nộp CCCD hoặc giấy phép lái xe. CarDB duyệt ảnh và cập nhật trạng thái KYC.">
    <LiveState loading={list.loading && !list.data} error={list.error} label="giấy tờ" onRetry={list.reload}/>
    <div className="flex flex-col gap-3">
      {(list.data ?? []).map(doc => <article key={doc.id} className="rounded-2xl border border-[#E9E9E7] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">{docTypeLabels[doc.docType] ?? doc.docType}</h2>
          <Pill className={tone[doc.verifyStatus]}>{verifyStatusLabels[doc.verifyStatus] ?? doc.verifyStatus}</Pill>
        </div>
        <p className="mt-1 text-sm text-[#666666]">Số {doc.docNumberMasked ?? "—"} • nộp {formatDateTime(doc.createdAt)}</p>
        {doc.rejectReason ? <p className="mt-1 text-sm text-[#B91C1C]">Lý do: {doc.rejectReason}</p> : null}
      </article>)}
      {list.data && !list.data.length ? <p className="text-sm text-[#666666]">Bạn chưa nộp giấy tờ nào.</p> : null}
    </div>
    <SubmitForm onDone={list.reload}/>
  </ProfileLayout>;
}

function SubmitForm({ onDone }) {
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
