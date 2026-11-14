import { useRef, useState } from "react";
import { Primary, fieldClass } from "@/components/LiveUi.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { DateField } from "@/components/DateField.jsx";
import { userDocumentService } from "@/services/accountService.js";

export const tone = { PENDING: "bg-[#FEF3C7] text-[#B45309]", APPROVED: "bg-[#D1FAE5] text-[#047857]", REJECTED: "bg-[#FEE2E2] text-[#B91C1C]" };

const IDENTITY = new Set(["CITIZEN_ID", "PASSPORT"]);
const blank = docType => ({ docType, docNumber: "", fullNameOnDoc: "", dateOfBirthOnDoc: "", issuePlace: "", issueDate: "", expiresAt: "", licenseClass: "" });

/** Trạng thái hiện tại của một nhóm giấy tờ: APPROVED (còn hạn) > PENDING > REJECTED > NONE. */
export function docGroupState(docs, isGroup, today = new Date()) {
    const group = (docs ?? []).filter(d => isGroup(d.docType));
    const valid = d => !d.expiresAt || new Date(d.expiresAt) >= new Date(today.toDateString());
    if (group.some(d => d.verifyStatus === "APPROVED" && valid(d))) return "APPROVED";
    if (group.some(d => d.verifyStatus === "PENDING")) return "PENDING";
    if (group.some(d => d.verifyStatus === "REJECTED")) return "REJECTED";
    return "NONE";
}
export const identityState = docs => docGroupState(docs, t => IDENTITY.has(t));
export const licenseState = docs => docGroupState(docs, t => t === "DRIVER_LICENSE");

const stateText = {
    APPROVED: ["Đã duyệt", "bg-[#D1FAE5] text-[#047857]"],
    PENDING: ["Chờ duyệt", "bg-[#FEF3C7] text-[#B45309]"],
    REJECTED: ["Bị từ chối – nộp lại", "bg-[#FEE2E2] text-[#B91C1C]"],
    NONE: ["Chưa nộp", "bg-[#EFEDE7] text-[#57564F]"],
};

/** Hai ô trạng thái CCCD + GPLX và kết luận có được thuê xe hay chưa. */
export function VerificationStatus({ docs }) {
    const id = identityState(docs), lic = licenseState(docs);
    const ready = id === "APPROVED" && lic === "APPROVED";
    const cell = (label, state) => <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E7E5DF] bg-white px-4 py-3">
        <span className="text-sm font-semibold">{label}</span>
        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${stateText[state][1]}`}>{stateText[state][0]}</span>
    </div>;
    return <section className="flex flex-col gap-3" aria-label="Trạng thái xác minh">
        <div className="grid gap-3 sm:grid-cols-2">
            {cell("1. CCCD / Hộ chiếu", id)}
            {cell("2. Giấy phép lái xe", lic)}
        </div>
        <p className={`rounded-xl px-4 py-2.5 text-sm ${ready ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#FBFAF8] text-[#57564F]"}`}>
            {ready ? "✓ Bạn đã đủ điều kiện thuê xe." : "Bạn chỉ có thể thuê xe khi Admin đã duyệt cả CCCD/Hộ chiếu và Giấy phép lái xe."}
        </p>
    </section>;
}

function DocFields({ title, form, setForm, kind, locked, lockText, files, setFiles, inputs }) {
    const update = key => e => setForm(f => ({ ...f, [key]: e.target.value }));
    const isLicense = kind === "license";
    const backRequired = form.docType !== "PASSPORT";
    return <fieldset className="flex flex-col gap-3 rounded-xl border border-[#E7E5DF] p-4" disabled={locked}>
        <legend className="px-1 text-base font-bold">{title}</legend>
        {locked ? <p className="rounded-lg bg-[#FBFAF8] px-3 py-2 text-sm text-[#57564F]">{lockText}</p> : <>
            <div className="grid gap-3 sm:grid-cols-2">
                {isLicense
                    ? <label className="text-xs font-semibold text-[#666666]">Hạng bằng *<input required value={form.licenseClass} onChange={update("licenseClass")} placeholder="VD: B2" maxLength={10} className={`${fieldClass} mt-1`}/></label>
                    : <label className="text-xs font-semibold text-[#666666]">Loại giấy tờ *
                        <select value={form.docType} onChange={update("docType")} className={`${fieldClass} mt-1`}><option value="CITIZEN_ID">CCCD / CMND</option><option value="PASSPORT">Hộ chiếu</option></select></label>}
                <label className="text-xs font-semibold text-[#666666]">Số giấy tờ *<input required maxLength={50} value={form.docNumber} onChange={update("docNumber")} className={`${fieldClass} mt-1`}/></label>
                <label className="text-xs font-semibold text-[#666666]">Họ tên trên giấy *<input required maxLength={150} value={form.fullNameOnDoc} onChange={update("fullNameOnDoc")} className={`${fieldClass} mt-1`}/></label>
                <label className="text-xs font-semibold text-[#666666]">Ngày sinh trên giấy *<DateField required value={form.dateOfBirthOnDoc} onChange={update("dateOfBirthOnDoc")} className={`${fieldClass} mt-1`}/></label>
                <label className="text-xs font-semibold text-[#666666]">Nơi cấp *<input required maxLength={150} value={form.issuePlace} onChange={update("issuePlace")} className={`${fieldClass} mt-1`}/></label>
                <label className="text-xs font-semibold text-[#666666]">Ngày cấp *<DateField required value={form.issueDate} onChange={update("issueDate")} className={`${fieldClass} mt-1`}/></label>
                <label className="text-xs font-semibold text-[#666666]">Ngày hết hạn{isLicense ? " *" : " (nếu có)"}<DateField required={isLicense} value={form.expiresAt} onChange={update("expiresAt")} className={`${fieldClass} mt-1`}/></label>
                <div aria-hidden="true" className="hidden sm:block"/>
                <label className="text-xs font-semibold text-[#666666]">Ảnh mặt trước (JPG/PNG) *<input ref={inputs.front} required type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" onChange={e => setFiles(f => ({ ...f, front: e.target.files?.[0] ?? null }))} className={`${fieldClass} mt-1`}/></label>
                <label className="text-xs font-semibold text-[#666666]">Ảnh mặt sau (JPG/PNG){backRequired ? " *" : " (nếu có)"}<input ref={inputs.back} required={backRequired} type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" onChange={e => setFiles(f => ({ ...f, back: e.target.files?.[0] ?? null }))} className={`${fieldClass} mt-1`}/></label>
            </div>
            {isLicense ? <p className="text-xs text-[#9A3412]">Chỉ được đặt xe có ngày trả trước ngày hết hạn GPLX ít nhất 10 ngày (VD: GPLX hết hạn ngày 14 thì ngày trả xe muộn nhất là ngày 4).</p> : null}
        </>}
    </fieldset>;
}

/**
 * Nộp hồ sơ xác minh gồm CẢ HAI giấy tờ: CCCD/Hộ chiếu và Giấy phép lái xe, gửi cùng một lần.
 * Giấy nào đã được duyệt hoặc đang chờ duyệt thì phần đó bị khoá, chỉ nộp phần còn thiếu.
 */
export function SubmitForm({ docs = [], onDone, isOwner = false, maxUpgradeAttempts = 3, upgradeAttemptsRemaining = 3 }) {
    const id = identityState(docs), lic = licenseState(docs);
    const idLocked = id === "APPROVED" || id === "PENDING" || isOwner || upgradeAttemptsRemaining <= 0;
    const licLocked = lic === "APPROVED" || lic === "PENDING";
    const idLockText = id === "APPROVED" || isOwner ? "CCCD/Hộ chiếu đã được duyệt." : id === "PENDING" ? "CCCD/Hộ chiếu đang chờ Admin duyệt."
        : `Bạn đã dùng hết ${maxUpgradeAttempts}/${maxUpgradeAttempts} lần nộp CCCD/Hộ chiếu. Vui lòng liên hệ hỗ trợ.`;
    const licLockText = lic === "APPROVED" ? "Giấy phép lái xe đã được duyệt." : "Giấy phép lái xe đang chờ Admin duyệt.";

    const [idForm, setIdForm] = useState(() => blank("CITIZEN_ID"));
    const [licForm, setLicForm] = useState(() => blank("DRIVER_LICENSE"));
    const [idFiles, setIdFiles] = useState({ front: null, back: null });
    const [licFiles, setLicFiles] = useState({ front: null, back: null });
    const idInputs = { front: useRef(null), back: useRef(null) };
    const licInputs = { front: useRef(null), back: useRef(null) };
    const [success, setSuccess] = useState("");
    const nothingToSend = idLocked && licLocked;

    const submit = useApiMutation(async () => {
        setSuccess("");
        const sent = [];
        if (!idLocked) {
            await userDocumentService.submit({ ...idForm, frontImage: idFiles.front, backImage: idFiles.back });
            sent.push("CCCD/Hộ chiếu");
            setIdForm(blank("CITIZEN_ID")); setIdFiles({ front: null, back: null });
            Object.values(idInputs).forEach(r => { if (r.current) r.current.value = ""; });
        }
        if (!licLocked) {
            try {
                await userDocumentService.submit({ ...licForm, frontImage: licFiles.front, backImage: licFiles.back });
            } catch (e) {
                await onDone();
                throw new Error((sent.length ? "Đã gửi CCCD/Hộ chiếu, nhưng GPLX chưa gửi được: " : "") + e.message);
            }
            sent.push("Giấy phép lái xe");
            setLicForm(blank("DRIVER_LICENSE")); setLicFiles({ front: null, back: null });
            Object.values(licInputs).forEach(r => { if (r.current) r.current.value = ""; });
        }
        setSuccess(`Đã gửi ${sent.join(" và ")}. Hồ sơ đang chờ Admin duyệt; bạn được thuê xe khi cả hai giấy tờ được duyệt.`);
        await onDone();
    });

    return <form noValidate={false} className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5"
        onSubmit={e => { e.preventDefault(); if (nothingToSend || !e.currentTarget.reportValidity()) return; void submit.run(); }}>
        <div>
            <h2 className="text-lg font-bold">Hồ sơ xác minh</h2>
            <p className="mt-0.5 text-xs text-[#666666]">Nộp cùng lúc CCCD/Hộ chiếu và Giấy phép lái xe. Ảnh JPG/PNG rõ nét, không bị loá hoặc mất góc.</p>
        </div>
        {success ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-[#047857]">{success}</div> : null}
        <DocFields title="1. CCCD / Hộ chiếu" kind="identity" form={idForm} setForm={setIdForm} locked={idLocked} lockText={idLockText} files={idFiles} setFiles={setIdFiles} inputs={idInputs}/>
        <DocFields title="2. Giấy phép lái xe" kind="license" form={licForm} setForm={setLicForm} locked={licLocked} lockText={licLockText} files={licFiles} setFiles={setLicFiles} inputs={licInputs}/>
        {submit.error ? <p role="alert" className="text-sm text-[#B91C1C]">{submit.error.message}</p> : null}
        <div>
            <Primary type="submit" disabled={submit.running || nothingToSend}>
                {submit.running ? "Đang gửi…" : nothingToSend ? "Không có giấy tờ cần nộp" : idLocked || licLocked ? "Gửi giấy tờ còn thiếu" : "Gửi hồ sơ (CCCD + GPLX)"}
            </Primary>
        </div>
    </form>;
}
