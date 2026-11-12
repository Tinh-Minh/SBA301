import { useEffect } from "react";
import { Link } from "react-router";
import { useDocuments, useMyKyc } from "@/hooks/useAccount.js";
import { useAuth } from "@/hooks/useAuth.js";

import { ProfileLayout } from "@/components/layouts/ProfileLayout.jsx";
import { LiveState, Pill } from "@/components/LiveUi.jsx";

import { formatDateTime } from "@/utils/datetime.js";
import { docTypeLabels, verifyStatusLabels } from "@/utils/labels.js";
import { SubmitForm, tone } from "@/components/account/VerificationForm.jsx";

const IDENTITY_DOC_TYPES = new Set(["CITIZEN_ID", "PASSPORT"]);

export default function VerificationLive() {
  const list = useDocuments();
  const kyc = useMyKyc();
  const { user, isOwner, isAdmin, refreshAccount } = useAuth();
  useEffect(() => {
    void refreshAccount();
  }, [refreshAccount]);

  const docs = list.data ?? [];
  const derivedUsed = docs.filter(doc => IDENTITY_DOC_TYPES.has(doc.docType)).length;
  const maxUpgradeAttempts = kyc.data?.maxUpgradeAttempts ?? 3;
  const upgradeAttemptsUsed = kyc.data?.upgradeAttemptsUsed ?? derivedUsed;
  const upgradeAttemptsRemaining = kyc.data?.upgradeAttemptsRemaining ?? Math.max(0, maxUpgradeAttempts - upgradeAttemptsUsed);
  const hasPendingUpgrade = kyc.data?.hasPendingUpgradeRequest ?? docs.some(doc => IDENTITY_DOC_TYPES.has(doc.docType) && doc.verifyStatus === "PENDING");
  const hasPendingDriverLicense = docs.some(doc => doc.docType === "DRIVER_LICENSE" && doc.verifyStatus === "PENDING");

  async function reloadAll() {
    await Promise.all([list.reload(), kyc.reload(), refreshAccount()]);
  }

  return <ProfileLayout live active="verification" title="Xác minh giấy tờ" description="Nộp CCCD hoặc Hộ chiếu để nâng cấp lên Chủ xe (OWNER), hoặc GPLX. CarDB duyệt ảnh và cập nhật trạng thái KYC.">
    {!isAdmin ? (isOwner
      ? <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <div>
          <p className="font-bold">Tài khoản đã được xác minh vai trò Chủ xe (OWNER)</p>
          <p className="mt-0.5 text-xs text-emerald-800">Bạn đã có quyền đăng ký xe và sử dụng các chức năng trên kênh Chủ xe.</p>
        </div>
        <Link to="/owner/dashboard" className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800">Vào kênh chủ xe</Link>
      </div>
      : <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-bold">Đăng ký trở thành Chủ xe (OWNER) — vai trò hiện tại: Khách hàng ({user?.role ?? "CUSTOMER"})</p>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-950 border border-amber-300">
            Đã gửi {upgradeAttemptsUsed}/{maxUpgradeAttempts} lần • Còn lại {upgradeAttemptsRemaining} lần
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-amber-900">Tài khoản Khách hàng chưa thể vào trang Chủ xe hoặc đăng ký xe. Hãy nộp CCCD hoặc Hộ chiếu bên dưới và chờ Admin xác nhận; ngay sau khi được duyệt, tài khoản sẽ tự động nâng cấp lên Chủ xe.</p>
        {hasPendingUpgrade ? (
          <p role="status" className="mt-2 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-950">
            Bạn đang có yêu cầu nâng cấp chủ xe chờ duyệt (PENDING). Không thể gửi thêm yêu cầu mới trong thời gian chờ.
          </p>
        ) : null}
        {upgradeAttemptsRemaining <= 0 ? (
          <p role="alert" className="mt-2 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-[#B91C1C]">
            Bạn đã sử dụng hết tối đa {maxUpgradeAttempts}/{maxUpgradeAttempts} lần gửi yêu cầu nâng cấp chủ xe.
          </p>
        ) : null}
      </div>) : null}
    <LiveState loading={list.loading && !list.data} error={list.error} label="giấy tờ" onRetry={reloadAll} />
    <div className="flex flex-col gap-3">
      {docs.map(doc => <article key={doc.id} className="rounded-2xl border border-[#E9E9E7] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">{docTypeLabels[doc.docType] ?? doc.docType}</h2>
          <Pill className={tone[doc.verifyStatus]}>{verifyStatusLabels[doc.verifyStatus] ?? doc.verifyStatus}</Pill>
        </div>
        <p className="mt-1 text-sm text-[#666666]">
          Số {doc.docNumberMasked ?? "—"} • nộp {formatDateTime(doc.createdAt)}
          {doc.verifiedAt ? ` • duyệt lúc ${formatDateTime(doc.verifiedAt)}` : ""}
        </p>
        {doc.verifyStatus === "REJECTED" ? (
          <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#B91C1C]">
            <span className="font-bold">Lý do từ chối:</span> {doc.rejectReason || "Không có ghi chú lý do."}
          </div>
        ) : doc.rejectReason ? (
          <p className="mt-1 text-sm text-[#B91C1C]">Lý do: {doc.rejectReason}</p>
        ) : null}
      </article>)}
      {list.data && !list.data.length ? <p className="text-sm text-[#666666]">Bạn chưa nộp giấy tờ nào.</p> : null}
    </div>
    <SubmitForm
      onDone={reloadAll}
      isOwner={isOwner}
      hasPendingUpgrade={hasPendingUpgrade}
      hasPendingDriverLicense={hasPendingDriverLicense}
      maxUpgradeAttempts={maxUpgradeAttempts}
      upgradeAttemptsRemaining={upgradeAttemptsRemaining}
    />
  </ProfileLayout>;
}
