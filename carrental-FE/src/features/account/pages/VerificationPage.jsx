import { useDocuments } from "@/shared/hooks/useAccount.js";

import { ProfileLayout } from "@/shared/layouts/ProfileLayout.jsx";
import { LiveState, Pill } from "@/shared/components/LiveUi.jsx";

import { formatDateTime } from "@/shared/utils/datetime.js";
import { docTypeLabels, verifyStatusLabels } from "@/shared/utils/labels.js";
import { SubmitForm, tone } from "@/features/account/components/VerificationForm.jsx";

export default function VerificationLive() {
    const list = useDocuments();
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
