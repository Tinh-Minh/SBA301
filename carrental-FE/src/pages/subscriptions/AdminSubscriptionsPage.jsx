import { useState } from "react";
import { AdminPageHeader, AdminState, Pager, Tabs } from "@/components/admin/AdminUi.jsx";
import { StatusBadge } from "@/components/owner/StatusBadge.jsx";
import { useAdminSubscriptions } from "@/hooks/useSubscriptions.js";
import { subscriptionStatusMeta } from "@/services/subscriptionService.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";

const statusTabs = [
    { id: "", label: "Tất cả" },
    ...Object.entries(subscriptionStatusMeta).map(([id, meta]) => ({ id, label: meta.label })),
];

export default function AdminSubscriptionsPage() {
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(0);
    const { data, loading, error, reload, cancel } = useAdminSubscriptions(status, page);
    const rows = data?.content ?? [];
    return <div className="flex min-w-0 flex-col gap-5">
    <AdminPageHeader code="A05" title="Gói đăng tin" description="Toàn bộ gói đăng tin trên sàn. Huỷ gói đang hiển thị sẽ ẩn tin của xe."/>
    <Tabs items={statusTabs} value={status} onChange={next => { setStatus(next); setPage(0); }}/>
    {cancel.error ? <p role="alert" className="rounded-xl bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]">{cancel.error.message}</p> : null}
    <AdminState loading={loading && !data} error={error} empty={!!data && rows.length === 0} label="gói đăng tin" onRetry={reload}/>
    {rows.length > 0 ? <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="text-xs uppercase text-[#666666]"><tr>
          <th className="p-3">Mã gói</th><th className="p-3">Xe</th><th className="p-3">Chủ xe</th><th className="p-3">Gói</th><th className="p-3">Tổng tiền</th><th className="p-3">Hết hạn</th><th className="p-3">Trạng thái</th><th className="p-3"/>
        </tr></thead>
        <tbody>
          {rows.map(subscription => <tr key={subscription.id} className="border-t border-[#E9E9E7]">
            <td className="p-3 font-mono text-xs">{subscription.subscriptionCode}</td>
            <td className="p-3">{subscription.carName}<span className="block font-mono text-xs text-[#666666]">{subscription.licensePlate}</span></td>
            <td className="p-3">{subscription.customerName}</td>
            <td className="p-3">{subscription.packageName}</td>
            <td className="p-3 font-semibold">{formatMoney(subscription.totalAmount)}</td>
            <td className="p-3">{formatDateTime(subscription.endDate)}</td>
            <td className="p-3"><StatusBadge meta={subscriptionStatusMeta[subscription.status]}/></td>
            <td className="p-3 text-right">{subscription.status === "ACTIVE" || subscription.status === "PENDING_PAYMENT" ? <button type="button" disabled={cancel.running} onClick={() => void cancel.run(subscription.id)} className="rounded-lg border border-[#EF4444] px-3 py-1.5 text-xs font-bold text-[#EF4444] disabled:opacity-50">Huỷ gói</button> : null}</td>
          </tr>)}
        </tbody>
      </table>
    </div> : null}
    <Pager page={page} totalPages={data?.totalPages} onPage={setPage}/>
  </div>;
}
