import { useEffect } from "react";
import { Link } from "react-router";
import { useDocuments, useMyKyc } from "@/hooks/useAccount.js";
import { useAuth } from "@/hooks/useAuth.js";

import { ProfileLayout } from "@/components/layouts/ProfileLayout.jsx";
import { LiveState, Pill } from "@/components/LiveUi.jsx";

import { formatDateTime } from "@/utils/datetime.js";
import { docTypeLabels, verifyStatusLabels } from "@/utils/labels.js";
import { SubmitForm, tone } from "@/components/account/VerificationForm.jsx";

export default function VerificationLive() {
    const list = useDocuments();
    const kyc = useMyKyc();
    const { user, isOwner, isAdmin, refreshAccount } = useAuth();
    useEffect(() => {
        void refreshAccount();
    }, [refreshAccount]);

    const docs = list.data ?? [];
    const hasPending = docs.some(doc => doc.verifyStatus === "PENDING");
    const blocked = Boolean(kyc.data?.verificationBlocked && kyc.data?.verificationBlockedUntil);
    const rejectedAttempts = kyc.data?.rejectedAttempts ?? 0;
    const maxAttempts = kyc.data?.maxAttempts ?? 3;

    return <ProfileLayout live active="verification" title="Xác minh giấy tờ" description="Nộp CCCD hoặc Hộ chiếu để nâng cấp lên Chủ xe (OWNER), hoặc GPLX. CarDB duyệt ảnh và cập nhật trạng thái KYC.">
    {!isAdmin ? (isOwner
        ? <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <div>
              <p className="font-bold">Tài khoản đã được xác minh vai trò Chủ xe (OWNER)</p>
              <p className="mt-0.5 text-xs text-emerald-800">Bạn đã có quyền đăng ký xe và sử dụng các chức năng trên kênh Chủ xe.</p>
            </div>
            <Link to="/owner/dashboard" className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800">Vào kênh chủ xe</Link>
          </div>
        : blocked
            ? <div role="alert" className="mb-4 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">
                <p className="font-bold">Tài khoản tạm thời bị cấm gửi xác minh chủ xe đến {formatDateTime(kyc.data.verificationBlockedUntil)}</p>
                <p className="mt-1 text-xs leading-relaxed">Hồ sơ xác minh của bạn đã bị Admin từ chối đủ {maxAttempts} lần. Tài khoản không thể gửi lại yêu cầu xác minh trong vòng 1 tháng; vui lòng thử lại sau {formatDateTime(kyc.data.verificationBlockedUntil)}.</p>
              </div>
            : hasPending
                ? <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                    <p className="font-bold">Hồ sơ xác minh đang chờ duyệt</p>
                    <p className="mt-1 text-xs leading-relaxed text-blue-800">Bạn đã gửi yêu cầu xác minh và đang chờ Admin xét duyệt. Vui lòng đợi kết quả duyệt trước khi thực hiện thao tác mới.</p>
                  </div>
                : <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                    <p className="font-bold">Đăng ký trở thành Chủ xe (OWNER) — vai trò hiện tại: Khách hàng ({user?.role ?? "CUSTOMER"})</p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-900">Tài khoản Khách hàng chưa thể vào trang Chủ xe hoặc đăng ký xe. Hãy nộp CCCD hoặc Hộ chiếu bên dưới và chờ Admin xác nhận; ngay sau khi được duyệt, tài khoản sẽ tự động nâng cấp lên Chủ xe.</p>
                    {rejectedAttempts > 0 ? <p className="mt-1.5 text-xs font-semibold text-[#B91C1C]">Đã bị từ chối {rejectedAttempts}/{maxAttempts} lần. Nếu bị từ chối đủ {maxAttempts} lần, tài khoản sẽ bị cấm xác minh trong 1 tháng.</p> : null}
                  </div>) : null}
    <LiveState loading={list.loading && !list.data} error={list.error} label="giấy tờ" onRetry={list.reload}/>
    <div className="flex flex-col gap-3">
      {docs.map(doc => <article key={doc.id} className="rounded-2xl border border-[#E9E9E7] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">{docTypeLabels[doc.docType] ?? doc.docType}</h2>
          <Pill className={tone[doc.verifyStatus]}>{verifyStatusLabels[doc.verifyStatus] ?? doc.verifyStatus}</Pill>
        </div>
        <p className="mt-1 text-sm text-[#666666]">Số {doc.docNumberMasked ?? "—"} • nộp {formatDateTime(doc.createdAt)}</p>
        {doc.rejectReason ? <p className="mt-1 text-sm text-[#B91C1C]">Lý do: {doc.rejectReason}</p> : null}
      </article>)}
      {!docs.length ? <p className="text-sm text-[#666666]">Bạn chưa nộp giấy tờ nào.</p> : null}
    </div>
    {blocked || hasPending || isOwner ? null : <SubmitForm onDone={() => { void list.reload(); void kyc.reload(); }}/>}
  </ProfileLayout>;
}
