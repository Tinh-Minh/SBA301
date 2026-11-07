import { Link } from "react-router";
import { LiveState } from "@/components/LiveUi.jsx";
import { OwnerCrumb, OwnerHeading } from "@/components/owner/OwnerScreen.jsx";
import { StatusBadge } from "@/components/owner/StatusBadge.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { useMySubscriptions } from "@/hooks/useSubscriptions.js";
import { ownerRoutes } from "@/routes/paths.js";
import { subscriptionService, subscriptionStatusMeta } from "@/services/subscriptionService.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";

export default function MySubscriptionsPage() {
    const { data, loading, error, reload } = useMySubscriptions();
    const pay = useApiMutation(subscriptionService.payWithVnpay);
    const cancel = useApiMutation(subscriptionService.cancel, reload);
    const actionError = pay.error ?? cancel.error;
    return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-col gap-2">
      <OwnerCrumb homeHref={ownerRoutes.dashboard} current="Gói đăng tin"/>
      <OwnerHeading title="Gói đăng tin" description="Lịch sử mua gói và thời hạn hiển thị của từng xe." actions={<Link to={ownerRoutes.subscriptionNew} className="inline-flex items-center rounded-xl bg-brand-accent px-4 py-2 text-sm font-bold text-white">Mua gói đăng tin</Link>}/>
    </div>
    {actionError ? <p role="alert" className="rounded-xl bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]">{actionError.message}</p> : null}
    <LiveState loading={loading && !data} error={error} empty={!!data && data.length === 0} label="gói đăng tin" onRetry={reload}/>
    <div className="flex flex-col gap-3">
      {(data ?? []).map(subscription => <article key={subscription.id} className="flex flex-col gap-3 rounded-2xl border border-card-border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-bold text-charcoal">{subscription.carName} <span className="font-mono text-xs text-muted-gray">{subscription.licensePlate}</span></h2>
            <p className="text-sm text-muted-gray">{subscription.packageName} • {subscription.subscriptionCode}</p>
          </div>
          <StatusBadge meta={subscriptionStatusMeta[subscription.status]}/>
        </div>
        <p className="text-sm text-muted-gray">
          Tổng tiền: <strong className="text-charcoal">{formatMoney(subscription.totalAmount)}</strong>
          {subscription.startDate ? ` • Từ ${formatDateTime(subscription.startDate)} đến ${formatDateTime(subscription.endDate)}` : ""}
          {subscription.daysRemaining !== null ? ` • Còn ${subscription.daysRemaining} ngày hiển thị` : ""}
        </p>
        {subscription.status === "PENDING_PAYMENT" ? <div className="flex flex-wrap gap-2">
          <button type="button" disabled={pay.running} onClick={() => void pay.run(subscription.id)} className="rounded-xl bg-brand-accent px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50">Thanh toán ngay qua VNPay</button>
          <button type="button" disabled={cancel.running} onClick={() => void cancel.run(subscription.id)} className="rounded-xl border border-card-border px-3.5 py-2 text-xs font-bold text-charcoal disabled:opacity-50">Huỷ yêu cầu</button>
        </div> : null}
      </article>)}
    </div>
  </div>;
}
