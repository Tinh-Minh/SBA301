import { useState } from "react";
import { AdminPageHeader, AdminState, Pager, StatusPill, Tabs } from "@/components/admin/AdminUi.jsx";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { transactionService } from "@/services/paymentService.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney, transactionTypeLabels } from "@/utils/labels.js";

const statusLabel = { PENDING: "Chờ thanh toán", SUCCESS: "Thành công", FAILED: "Thất bại", CANCELLED: "Đã huỷ" };
const statusTone = { PENDING: "warning", SUCCESS: "success", FAILED: "danger", CANCELLED: "neutral" };
/** Giao dịch chưa thanh toán của gói đã bị huỷ là "Đã huỷ", không phải thanh toán thất bại. */
const statusOf = row => row.status !== "SUCCESS" && row.subscriptionStatus === "CANCELLED" ? "CANCELLED" : row.status;
/** Ưu tiên thời điểm thanh toán thật; chưa thanh toán thì dùng thời điểm tạo giao dịch. */
const timeOf = row => row.paidAt ?? row.createdAt;

const titleOf = row => {
    if (row.packageName) return row.packageName;
    if (row.transactionType) return transactionTypeLabels[row.transactionType] ?? row.transactionType;
    return "—";
};

const refCodeOf = row => row.subscriptionCode ?? row.bookingCode ?? "—";

export default function AdminPayouts() {
    const [page, setPage] = useState(0);
    const [status, setStatus] = useState("");
    const [type, setType] = useState("");
    const [selected, setSelected] = useState(null);
    const list = useApiQuery(["admin", "transactions", page, status, type], () =>
        transactionService.listPage({
            status: status || undefined,
            type: type || undefined,
            page,
            size: 20,
            sort: "id,desc",
        })
    );
    const rows = list.data?.content ?? [];
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A06" title="Giao dịch hệ thống" description="Danh sách giao dịch thanh toán gói đăng tin, đặt cọc và hoàn cọc đơn thuê xe."/>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Tabs items={[{ id: "", label: "Tất cả trạng thái" }, { id: "SUCCESS", label: "Thành công" }, { id: "PENDING", label: "Chờ thanh toán" }, { id: "FAILED", label: "Thất bại" }]} value={status} onChange={id => { setStatus(id); setPage(0); }}/>
      <select value={type} onChange={e => { setType(e.target.value); setPage(0); }} className="rounded-xl border border-[#E9E9E7] bg-white px-3 py-2 text-xs font-semibold text-[#292929]">
        <option value="">Tất cả loại giao dịch</option>
        <option value="PACKAGE_PAYMENT">Mua gói đăng tin</option>
        <option value="BOOKING_DEPOSIT">Đặt cọc thuê xe</option>
        <option value="BOOKING_REFUND">Hoàn cọc thuê xe</option>
      </select>
    </div>
    <AdminState loading={list.loading && !list.data} error={list.error} empty={!!list.data && rows.length === 0} label="giao dịch" onRetry={list.reload}/>
    {rows.length ? <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="text-xs uppercase text-[#666666]"><tr>
          <th className="p-3">Mã</th><th className="p-3">Nội dung / Mã tham chiếu</th><th className="p-3">Xe</th><th className="p-3">Số tiền</th><th className="p-3">Trạng thái</th><th className="p-3">Thanh toán / tạo lúc</th><th className="p-3"/>
        </tr></thead>
        <tbody>{rows.map(row => {
          const st = statusOf(row);
          return <tr key={row.id} className="border-t border-[#E9E9E7]">
            <td className="p-3 font-mono text-xs">#{row.id}</td>
            <td className="p-3">
              <span className="font-semibold text-[#292929]">{titleOf(row)}</span>
              <span className="block font-mono text-xs text-[#666666]">{refCodeOf(row)}</span>
            </td>
            <td className="p-3">{row.carName ?? "—"}<span className="block font-mono text-xs text-[#666666]">{row.carLicensePlate ?? ""}</span></td>
            <td className="p-3 font-semibold">{formatMoney(row.amount)}</td>
            <td className="p-3"><StatusPill tone={statusTone[st] ?? "neutral"}>{statusLabel[st] ?? row.status}</StatusPill></td>
            <td className="p-3">{formatDateTime(timeOf(row))}</td>
            <td className="p-3 text-right"><button type="button" onClick={() => setSelected(row)} className="font-bold text-[#FC6C26]">Chi tiết</button></td>
          </tr>;
        })}</tbody>
      </table>
    </div> : null}
    <Pager page={page} totalPages={list.data?.totalPages} onPage={setPage}/>
    <ConfirmDialog open={Boolean(selected)} title={`Giao dịch #${selected?.id ?? ""}`} confirmLabel="Đóng" onClose={() => setSelected(null)} onConfirm={() => setSelected(null)}>
      {selected ? <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-[#666666]">Loại giao dịch</dt><dd>{transactionTypeLabels[selected.transactionType] ?? selected.transactionType ?? "—"}</dd>
        {selected.packageName ? <><dt className="text-[#666666]">Gói đăng tin</dt><dd>{selected.packageName}</dd></> : null}
        {selected.subscriptionCode ? <><dt className="text-[#666666]">Mã gói</dt><dd className="font-mono">{selected.subscriptionCode}</dd></> : null}
        {selected.bookingCode ? <><dt className="text-[#666666]">Mã đơn thuê</dt><dd className="font-mono">{selected.bookingCode}</dd></> : null}
        <dt className="text-[#666666]">Xe</dt><dd>{[selected.carName, selected.carLicensePlate].filter(Boolean).join(" • ") || "—"}</dd>
        <dt className="text-[#666666]">Số tiền</dt><dd className="font-semibold text-[#FC6C26]">{formatMoney(selected.amount)}</dd>
        <dt className="text-[#666666]">Cổng thanh toán</dt><dd>{selected.method ?? "—"}</dd>
        <dt className="text-[#666666]">Mã đối soát</dt><dd className="font-mono text-xs break-all">{selected.providerRef ?? "—"}</dd>
        <dt className="text-[#666666]">Trạng thái</dt><dd>{statusLabel[statusOf(selected)] ?? selected.status}</dd>
        <dt className="text-[#666666]">Tạo lúc</dt><dd>{formatDateTime(selected.createdAt)}</dd>
        <dt className="text-[#666666]">Thanh toán lúc</dt><dd>{formatDateTime(selected.paidAt)}</dd>
      </dl> : null}
    </ConfirmDialog>
  </div>;
}
