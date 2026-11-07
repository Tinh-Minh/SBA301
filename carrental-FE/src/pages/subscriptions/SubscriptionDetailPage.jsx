import { useState } from "react";
import { Link, useParams } from "react-router";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { LiveState } from "@/components/LiveUi.jsx";
import { StatusBadge } from "@/components/owner/StatusBadge.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { subscriptionService, subscriptionStatusMeta } from "@/services/subscriptionService.js";
import { ownerRoutes } from "@/routes/paths.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";

export default function SubscriptionDetailPage() {
    const { id } = useParams();
    const detail = useApiQuery(["subscription", id], () => subscriptionService.getById(id));
    const pay = useApiMutation(subscriptionService.payWithVnpay);
    const cancel = useApiMutation(subscriptionService.cancel, detail.reload);
    const [confirmPay, setConfirmPay] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const item = detail.data;
    const payable = item?.status === "PENDING_PAYMENT" && Number(item.totalAmount) > 0;
    const cancellable = item?.status === "PENDING_PAYMENT";
    return <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
    <Link to={ownerRoutes.subscriptions} className="text-sm font-bold text-[#FC6C26]">← Gói của tôi</Link>
    <LiveState loading={detail.loading && !item} error={detail.error} empty={false} label="gói đăng tin" onRetry={detail.reload}/>
    {item ? <article className="rounded-2xl border border-[#E9E9E7] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-[#666666]">{item.subscriptionCode}</p>
          <h1 className="mt-1 text-2xl font-bold">{item.carName}</h1>
          <p className="text-sm text-[#666666]">{item.packageName} • {item.licensePlate}</p>
        </div>
        <StatusBadge meta={subscriptionStatusMeta[item.status]}/>
      </div>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-[#666666]">Giá gói</dt><dd className="font-semibold">{formatMoney(item.basePrice)}</dd></div>
        <div><dt className="text-[#666666]">Giảm giá</dt><dd className="font-semibold">{formatMoney(item.discountAmount)}</dd></div>
        <div><dt className="text-[#666666]">Tổng thanh toán</dt><dd className="font-semibold">{formatMoney(item.totalAmount)}</dd></div>
        <div><dt className="text-[#666666]">Mã giảm giá</dt><dd>{item.voucherCode ?? "Không dùng"}</dd></div>
        <div><dt className="text-[#666666]">Bắt đầu</dt><dd>{formatDateTime(item.startDate)}</dd></div>
        <div><dt className="text-[#666666]">Kết thúc</dt><dd>{formatDateTime(item.endDate)}</dd></div>
        <div><dt className="text-[#666666]">Còn lại</dt><dd>{item.daysRemaining == null ? "—" : `${item.daysRemaining} ngày`}</dd></div>
        <div><dt className="text-[#666666]">Hết hạn thanh toán</dt><dd>{formatDateTime(item.paymentDeadline)}</dd></div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-2">
        {payable ? <button type="button" onClick={() => setConfirmPay(true)} className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white">Thanh toán VNPay</button> : null}
        {cancellable ? <button type="button" onClick={() => setConfirmCancel(true)} className="rounded-xl border border-[#EF4444] px-4 py-2 text-sm font-bold text-[#EF4444]">Huỷ gói</button> : null}
      </div>
    </article> : null}
    <ConfirmDialog open={confirmPay} title="Thanh toán gói đăng tin" description={item ? `Bạn sẽ được chuyển sang VNPay để thanh toán ${formatMoney(item.totalAmount)} cho xe ${item.licensePlate}.` : ""} confirmLabel="Đi tới VNPay" busy={pay.running} error={pay.error?.message} onClose={() => setConfirmPay(false)} onConfirm={() => { setConfirmPay(false); void pay.run(Number(id)); }}/>
    <ConfirmDialog open={confirmCancel} title="Huỷ gói chưa thanh toán" description="Gói sẽ không còn hiệu lực và mã giảm giá đã giữ chỗ được trả lại." confirmLabel="Huỷ gói" danger busy={cancel.running} error={cancel.error?.message} onClose={() => setConfirmCancel(false)} onConfirm={async () => { await cancel.run(Number(id)); setConfirmCancel(false); }}/>
  </div>;
}
