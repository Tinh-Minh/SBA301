import { useMemo, useState } from "react";
import { Link } from "react-router";
import { OwnerCrumb, OwnerHeading } from "@/components/owner/OwnerScreen.jsx";
import { LiveState } from "@/components/LiveUi.jsx";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { transactionService } from "@/services/paymentService.js";
import { ownerRoutes } from "@/routes/paths.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";

const statusLabel = { PENDING: "Chờ thanh toán", SUCCESS: "Thành công", FAILED: "Thất bại", CANCELLED: "Đã huỷ" };
/** Giao dịch chưa thanh toán của gói đã bị huỷ là "Đã huỷ", không phải thanh toán thất bại. */
const statusOf = row => row.status !== "SUCCESS" && row.subscriptionStatus === "CANCELLED" ? "CANCELLED" : row.status;
/** Ưu tiên thời điểm thanh toán thật; chưa thanh toán thì dùng thời điểm tạo giao dịch. */
const timeOf = row => row.paidAt ?? row.createdAt;
const filters = [
    { id: "all", label: "Tất cả" },
    { id: "SUCCESS", label: "Thành công" },
    { id: "PENDING", label: "Đang chờ" },
    { id: "FAILED", label: "Thất bại" },
    { id: "CANCELLED", label: "Đã huỷ" },
];

export default function OwnerPayouts() {
    const list = useApiQuery(["transactions", "mine"], transactionService.listRecent);
    const [filter, setFilter] = useState("all");
    const [selected, setSelected] = useState(null);
    const rows = list.data ?? [];
    const visible = useMemo(() => rows.filter(row => filter === "all" || statusOf(row) === filter), [rows, filter]);
    const paid = rows.filter(row => row.status === "SUCCESS").reduce((sum, row) => sum + Number(row.amount || 0), 0);
    return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-col gap-2">
      <OwnerCrumb homeHref={ownerRoutes.dashboard} current="Giao dịch"/>
      <OwnerHeading title="Giao dịch mua gói" description="Các khoản thanh toán gói đăng tin lấy từ hệ thống giao dịch."/>
    </div>
    <p className="rounded-2xl border border-card-border bg-white p-4 text-sm">Đã thanh toán thành công: <strong>{formatMoney(paid)}</strong></p>
    <div className="flex flex-wrap gap-2">{filters.map(item => <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter === item.id ? "bg-[#FC6C26] text-white" : "bg-white text-[#292929]"}`}>{item.label}</button>)}</div>
    <LiveState loading={list.loading && !list.data} error={list.error} empty={!!list.data && visible.length === 0} label="giao dịch" onRetry={list.reload}/>
    <div className="flex flex-col gap-3">{visible.map(row => <button key={row.id} type="button" onClick={() => setSelected(row)} className="rounded-2xl border border-card-border bg-white p-4 text-left shadow-sm">
      <span className="flex items-center justify-between gap-3"><strong>{row.packageName ?? "Gói đăng tin"}</strong><span>{formatMoney(row.amount)}</span></span>
      <span className="mt-1 block text-xs text-[#666666]">{row.carName} • {row.subscriptionCode} • {statusLabel[statusOf(row)] ?? row.status} • {formatDateTime(timeOf(row))}</span>
    </button>)}</div>
    <ConfirmDialog open={Boolean(selected)} title="Chi tiết giao dịch" confirmLabel="Đóng" onClose={() => setSelected(null)} onConfirm={() => setSelected(null)} description={selected ? `${selected.carBrandModel ?? selected.carName ?? ""} • ${selected.subscriptionCode ?? ""}` : ""}>
      {selected ? <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-[#666666]">Mã giao dịch</dt><dd>#{selected.id}</dd>
        <dt className="text-[#666666]">Số tiền</dt><dd>{formatMoney(selected.amount)}</dd>
        <dt className="text-[#666666]">Phương thức</dt><dd>{selected.method ?? "—"}</dd>
        <dt className="text-[#666666]">Trạng thái</dt><dd>{statusLabel[statusOf(selected)] ?? selected.status}</dd>
        <dt className="text-[#666666]">Tạo lúc</dt><dd>{formatDateTime(selected.createdAt)}</dd>
        <dt className="text-[#666666]">Thanh toán lúc</dt><dd>{formatDateTime(selected.paidAt)}</dd>
      </dl> : null}
      {selected?.subscriptionId ? <Link to={`${ownerRoutes.subscriptions}/${selected.subscriptionId}`} className="mt-3 inline-flex font-bold text-[#FC6C26]">Mở gói đăng tin</Link> : null}
    </ConfirmDialog>
  </div>;
}
