import { useCallback, useState } from "react";
import { AdminDialog, AdminState, PrimaryButton, StatusPill } from "@/components/admin/AdminUi.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatDate, formatDateTime } from "@/utils/datetime.js";
import { docTypeLabels, kycStatusLabels, verifyStatusLabels } from "@/utils/labels.js";
import { adminUserService } from "@/services/adminService.js";

export const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "role:OWNER", label: "Chủ xe" },
    { id: "role:CUSTOMER", label: "Khách hàng" },
    { id: "kyc:PENDING", label: "Chờ duyệt KYC" },
    { id: "kyc:VERIFIED", label: "Đã xác thực" },
    { id: "kyc:REJECTED", label: "KYC bị từ chối" },
    { id: "status:LOCKED", label: "Bị khóa" },
];
export const roleLabels = { CUSTOMER: "Khách hàng (CUSTOMER)", OWNER: "Chủ xe (OWNER)", ADMIN: "Quản trị viên (ADMIN)" };
export const kycTone = { NONE: "neutral", PENDING: "warning", VERIFIED: "success", REJECTED: "danger" };
const docTone = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" };

export function UserDetail({ id, onChanged }) {
    const load = useCallback(async () => {
        const [profile, kyc, documents] = await Promise.all([
            adminUserService.get(id),
            adminUserService.kyc(id).catch(() => null),
            adminUserService.listDocuments({ customerId: id }).then(page => page.content).catch(() => []),
        ]);
        return { profile, kyc, documents };
    }, [id]);
    const detail = useApiQuery(["admin", "user-detail", id], load);
    const refresh = () => { detail.reload(); onChanged(); };
    const [dialog, setDialog] = useState(null);
    const [reason, setReason] = useState("");
    const review = useApiMutation((docId, status, why) => adminUserService.reviewDocument(docId, status, why), () => { setDialog(null); setReason(""); refresh(); });
    const lock = useApiMutation((status, why) => adminUserService.setStatus(id, status, why || null), () => { setDialog(null); setReason(""); refresh(); });
    const changeRole = useApiMutation((nextRole) => adminUserService.setRole(id, nextRole), () => refresh());
    if (!detail.data)
        return <aside><AdminState loading={detail.loading} error={detail.error} label="hồ sơ"/></aside>;
    const { profile, kyc, documents } = detail.data;
    const locked = profile.status === "LOCKED";
    const kycState = kyc?.kycStatus ?? profile.kycStatus;
    return <aside className="flex min-w-0 flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <div>
      <h2 className="break-words text-base font-bold text-[#292929]">{profile.fullName}</h2>
      <p className="text-xs text-[#666666]">TK #{profile.id} • tạo {formatDate(profile.createdAt)}</p>
    </div>
    <dl className="grid gap-2 text-sm">
      <Row term="Vai trò" value={roleLabels[profile.role] ?? profile.role}/>
      <Row term="Email" value={`${profile.email}${profile.emailVerified ? " ✓" : ""}`}/>
      <Row term="Điện thoại" value={profile.phone || "—"}/>
      <Row term="Ngày sinh" value={formatDate(profile.dateOfBirth)}/>
      <Row term="Địa chỉ" value={profile.address || "—"}/>
      <Row term="KYC" value={kycStatusLabels[kycState] ?? profile.kycStatus}/>
    </dl>
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-bold text-[#292929]">Giấy tờ đã nộp ({documents.length})</h3>
      {!documents.length ? <p className="text-sm text-[#666666]">Khách hàng chưa nộp giấy tờ.</p> : null}
      {documents.map(doc => <DocumentCard key={doc.id} doc={doc} busy={review.running}
            onApprove={() => void review.run(doc.id, "APPROVED")} onReject={() => setDialog({ type: "reject-doc", docId: doc.id })}/>)}
      {review.error ? (
        <div role="alert" className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-[#B91C1C]">
          <p className="font-bold">Không thể duyệt giấy tờ:</p>
          <p className="mt-1 leading-relaxed whitespace-pre-wrap">{review.error.message}</p>
        </div>
      ) : null}
    </div>
    <div className="flex flex-col gap-2 border-t border-[#E9E9E7] pt-4">
      {profile.role !== "ADMIN" ? (profile.role === "OWNER"
            ? <button type="button" disabled={changeRole.running} onClick={() => void changeRole.run("CUSTOMER")} className="rounded-xl border border-[#E9E9E7] bg-[#F7F7F5] px-4 py-2.5 text-sm font-bold text-[#292929] hover:bg-[#EFEFED] disabled:opacity-50">Chuyển về Khách hàng (CUSTOMER)</button>
            : kycState === "VERIFIED"
                ? <button type="button" disabled={changeRole.running || locked} onClick={() => void changeRole.run("OWNER")} className="rounded-xl border border-[#047857] bg-[#ECFDF5] px-4 py-2.5 text-sm font-bold text-[#047857] hover:bg-[#D1FAE5] disabled:opacity-50">Nâng cấp lên Chủ xe (OWNER)</button>
                : <p className="rounded-xl bg-[#FFFBEB] px-3 py-2 text-xs text-[#92400E]">Cần duyệt giấy xác nhận danh tính (KYC VERIFIED) trước khi nâng cấp Chủ xe.</p>) : null}
      {changeRole.error ? <p className="text-sm text-[#B91C1C]">{changeRole.error.message}</p> : null}
      {locked
            ? <PrimaryButton disabled={lock.running} onClick={() => void lock.run("ACTIVE")}>Mở khóa tài khoản</PrimaryButton>
            : profile.role === "ADMIN"
                ? <p className="rounded-xl bg-[#F7F7F5] px-4 py-2.5 text-center text-sm text-[#666666]">Tài khoản quản trị không khóa tại đây.</p>
                : <button type="button" disabled={lock.running} onClick={() => setDialog({ type: "lock" })} className="rounded-xl border border-[#EF4444] px-4 py-2.5 text-sm font-bold text-[#EF4444] disabled:opacity-50">Khóa tài khoản</button>}
      {lock.error ? <p className="text-sm text-[#B91C1C]">{lock.error.message}</p> : null}
    </div>
    {dialog ? <AdminDialog title={dialog.type === "lock" ? "Khóa tài khoản" : "Từ chối giấy tờ"} onClose={() => setDialog(null)}>
      <label className="block text-sm text-[#666666]">Lý do
        <textarea value={reason} onChange={event => setReason(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E9E9E7] p-3 text-[#292929]" rows={3}/>
      </label>
      <div className="mt-3"><PrimaryButton disabled={review.running || lock.running || (dialog.type === "reject-doc" && !reason.trim())} onClick={() => dialog.type === "lock" ? void lock.run("LOCKED", reason.trim()) : void review.run(dialog.docId, "REJECTED", reason.trim())}>Xác nhận</PrimaryButton></div>
    </AdminDialog> : null}
  </aside>;
}

function DocumentCard({ doc, busy, onApprove, onReject }) {
    const [images, setImages] = useState(null);
    const [failed, setFailed] = useState(false);
    const [detail, setDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    async function toggleDetail() {
        if (detail) { setDetail(null); return; }
        setLoadingDetail(true);
        try {
            const data = await adminUserService.getDocument(doc.id);
            setDetail(data);
        } catch {
            // ignore
        } finally {
            setLoadingDetail(false);
        }
    }

    async function preview() {
        try {
            const sides = [doc.hasFrontImage ? "front" : null, doc.hasBackImage ? "back" : null].filter(Boolean);
            setImages(await Promise.all(sides.map(side => adminUserService.documentImage(doc.id, side))));
        }
        catch {
            setFailed(true);
        }
    }
    return <div className="rounded-xl border border-[#E9E9E7] p-3 text-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="font-bold text-[#292929]">{docTypeLabels[doc.docType] ?? doc.docType}</span>
      <StatusPill tone={docTone[doc.verifyStatus]}>{verifyStatusLabels[doc.verifyStatus] ?? doc.verifyStatus}</StatusPill>
    </div>
    <p className="mt-1 text-xs text-[#666666]">Số: {doc.docNumberMasked ?? "—"} • nộp {formatDateTime(doc.createdAt)}</p>
    {doc.rejectReason ? <p className="mt-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-[#B91C1C]">Lý do từ chối: {doc.rejectReason}</p> : null}
    <div className="mt-2 flex flex-wrap items-center gap-3">
      {(doc.hasFrontImage || doc.hasBackImage) && !images ? <button type="button" onClick={preview} className="text-xs font-bold text-[#FC6C26] hover:underline">Xem ảnh giấy tờ</button> : null}
      <button type="button" onClick={toggleDetail} className="text-xs font-bold text-[#2563EB] hover:underline">
        {loadingDetail ? "Đang tải…" : detail ? "Ẩn thông tin" : "Xem thông tin đã nộp"}
      </button>
    </div>
    {failed ? <p className="mt-1 text-xs text-[#B91C1C]">Không tải được ảnh (backend có thể đang tắt lưu trữ file).</p> : null}
    {detail ? (
      <div className="mt-2 space-y-1 rounded-xl bg-[#F7F7F5] p-2.5 text-xs text-[#292929]">
        <p><span className="text-[#666666]">Họ và tên:</span> <b className="text-[#111827]">{detail.fullNameOnDoc || "—"}</b></p>
        <p><span className="text-[#666666]">Ngày sinh:</span> <b className="text-[#111827]">{detail.dateOfBirthOnDoc ? formatDate(detail.dateOfBirthOnDoc) : "—"}</b></p>
        <p><span className="text-[#666666]">Số giấy tờ:</span> <b className="text-[#111827]">{detail.docNumber || "—"}</b></p>
        <p><span className="text-[#666666]">Nơi cấp:</span> <b className="text-[#111827]">{detail.issuePlace || "—"}</b></p>
        <p><span className="text-[#666666]">Ngày cấp:</span> <b className="text-[#111827]">{detail.issueDate ? formatDate(detail.issueDate) : "—"}</b></p>
        <p><span className="text-[#666666]">Ngày hết hạn:</span> <b className="text-[#111827]">{detail.expiresAt ? formatDate(detail.expiresAt) : "Không thời hạn"}</b></p>
        {detail.licenseClass ? <p><span className="text-[#666666]">Hạng bằng:</span> <b className="text-[#111827]">{detail.licenseClass}</b></p> : null}
      </div>
    ) : null}
    {images ? <div className="mt-2 grid grid-cols-2 gap-2">{images.map(src => <img key={src} src={src} alt="Ảnh giấy tờ" className="h-24 w-full rounded-lg object-cover"/>)}</div> : null}
    {doc.verifyStatus === "PENDING" ? <div className="mt-3 flex gap-2">
      <button type="button" disabled={busy} onClick={onApprove} className="rounded-lg bg-[#047857] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">Duyệt</button>
      <button type="button" disabled={busy} onClick={onReject} className="rounded-lg border border-[#EF4444] px-3 py-1.5 text-xs font-bold text-[#EF4444] disabled:opacity-60">Từ chối</button>
    </div> : null}
  </div>;
}

function Row({ term, value }) {
    return <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3"><dt className="text-[#666666]">{term}</dt><dd className="break-all text-right font-semibold text-[#292929]">{value}</dd></div>;
}
