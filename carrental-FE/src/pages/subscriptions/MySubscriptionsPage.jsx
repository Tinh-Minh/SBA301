import { useState } from "react";
import { Link } from "react-router";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { LiveState } from "@/components/LiveUi.jsx";
import { OwnerCrumb, OwnerHeading } from "@/components/owner/OwnerScreen.jsx";
import { StatusBadge } from "@/components/owner/StatusBadge.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { useMySubscriptions } from "@/hooks/useSubscriptions.js";
import { ownerRoutes } from "@/routes/paths.js";
import { subscriptionService, subscriptionStatusMeta } from "@/services/subscriptionService.js";
import { formatDateTime, parseDate } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";

/** Slot hiện tại còn hạn => chưa thể kích hoạt slot kế tiếp. */
function slotRunning(subscription) {
    const end = parseDate(subscription.currentSlotEndDate);
    return Boolean(end && end.getTime() > Date.now());
}

function Fact({ term, value, hint, strong = false }) {
    return <div className="min-w-0">
    <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-gray">{term}</dt>
    <dd className={`mt-0.5 text-sm text-charcoal ${strong ? "text-base font-bold" : "font-semibold"}`}>{value}</dd>
    {hint ? <dd className="text-xs text-muted-gray">{hint}</dd> : null}
  </div>;
}

export default function MySubscriptionsPage() {
    const { data, loading, error, reload } = useMySubscriptions();
    const pay = useApiMutation(subscriptionService.payWithVnpay);
    const cancel = useApiMutation(subscriptionService.cancel, reload);
    const activateSlot = useApiMutation(subscriptionService.activateSlot, reload);
    const [pending, setPending] = useState(null);
    // Lỗi thao tác hiển thị ngay trong thẻ của gói vừa bấm, không dồn lên đầu trang.
    const [failedId, setFailedId] = useState(null);
    const actionError = pay.error ?? cancel.error ?? activateSlot.error;
    return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-col gap-2">
      <OwnerCrumb homeHref={ownerRoutes.dashboard} current="Gói đăng tin"/>
      <OwnerHeading title="Gói đăng tin" description="Lịch sử mua gói và thời hạn hiển thị của từng xe." actions={<Link to={ownerRoutes.subscriptionNew} className="inline-flex items-center rounded-xl bg-brand-accent px-4 py-2 text-sm font-bold text-white">Mua gói đăng tin</Link>}/>
    </div>
    <LiveState loading={loading && !data} error={error} empty={!!data && data.length === 0} label="gói đăng tin" onRetry={reload}/>
    <div className="flex flex-col gap-3">
      {(data ?? []).map(subscription => <article key={subscription.id} className="flex flex-col gap-3 rounded-2xl border border-card-border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-bold text-charcoal"><Link to={`${ownerRoutes.subscriptions}/${subscription.id}`} className="hover:text-[#FC6C26]">{subscription.carName}</Link> <span className="font-mono text-xs text-muted-gray">{subscription.licensePlate}</span></h2>
            <p className="text-sm text-muted-gray">{subscription.packageName} • {subscription.subscriptionCode}</p>
          </div>
          <StatusBadge meta={subscriptionStatusMeta[subscription.status]}/>
        </div>
        <dl className="grid gap-x-6 gap-y-3 rounded-xl bg-bg-light p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Fact term="Tổng tiền" value={formatMoney(subscription.totalAmount)} strong/>
          <Fact term="Slot hiển thị" value={subscription.totalSlots ? `${subscription.totalSlots - (subscription.remainingSlots ?? 0)}/${subscription.totalSlots} đã dùng` : "—"} hint={subscription.totalSlots ? `Còn ${subscription.remainingSlots ?? 0} slot • ${subscription.durationDaysPerSlot || 7} ngày/slot` : undefined}/>
          <Fact term="Bắt đầu" value={formatDateTime(subscription.startDate)}/>
          <Fact term="Slot hiện tại đến" value={formatDateTime(subscription.currentSlotEndDate)} hint={slotRunning(subscription) ? (subscription.daysRemaining !== null && subscription.daysRemaining !== undefined ? `Còn ${subscription.daysRemaining} ngày hiển thị` : "Đang hiển thị") : subscription.status === "ACTIVE" ? "Slot đã hết, xe đang ẩn" : undefined}/>
        </dl>
        {failedId === subscription.id && actionError ? <p role="alert" className="rounded-xl bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]">{actionError.message}</p> : null}
        <div className="flex flex-wrap items-center gap-2">
          {subscription.status === "ACTIVE" && (subscription.remainingSlots ?? 0) > 0 ? (slotRunning(subscription)
            ? <p className="text-xs text-muted-gray">Slot tiếp theo kích hoạt được sau khi slot hiện tại kết thúc ({formatDateTime(subscription.currentSlotEndDate)}).</p>
            : <button
              type="button"
              disabled={activateSlot.running}
              onClick={() => { setFailedId(subscription.id); void activateSlot.run(subscription.id); }}
              className="rounded-xl bg-[#047857] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#065F46] disabled:opacity-50"
            >
              {activateSlot.running ? "Đang kích hoạt…" : `Kích hoạt slot tiếp theo (${subscription.durationDaysPerSlot || 7} ngày)`}
            </button>
          ) : null}
          {subscription.status === "PENDING_PAYMENT" ? <>
            <button type="button" disabled={pay.running} onClick={() => setPending({ kind: "pay", subscription })} className="rounded-xl bg-brand-accent px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50">Thanh toán ngay qua VNPay</button>
            <button type="button" disabled={cancel.running} onClick={() => setPending({ kind: "cancel", subscription })} className="rounded-xl border border-card-border px-3.5 py-2 text-xs font-bold text-charcoal disabled:opacity-50">Huỷ yêu cầu</button>
          </> : null}
          <Link to={`${ownerRoutes.subscriptions}/${subscription.id}`} className="ml-auto text-xs font-bold text-brand-accent">Xem chi tiết →</Link>
        </div>
      </article>)}
    </div>
    <ConfirmDialog open={pending?.kind === "pay"} title="Thanh toán gói đăng tin" description={pending?.subscription ? `Chuyển sang VNPay để thanh toán ${formatMoney(pending.subscription.totalAmount)} cho xe ${pending.subscription.licensePlate}.` : ""} confirmLabel="Đi tới VNPay" busy={pay.running} error={pay.error?.message} onClose={() => setPending(null)} onConfirm={() => { const id = pending.subscription.id; setPending(null); setFailedId(id); void pay.run(id); }}/>
    <ConfirmDialog open={pending?.kind === "cancel"} title="Huỷ gói chưa thanh toán" description="Gói sẽ không còn hiệu lực và mã giảm giá đã giữ chỗ được trả lại." confirmLabel="Huỷ gói" danger busy={cancel.running} error={cancel.error?.message} onClose={() => setPending(null)} onConfirm={async () => { setFailedId(pending.subscription.id); await cancel.run(pending.subscription.id); setPending(null); }}/>
  </div>;
}
