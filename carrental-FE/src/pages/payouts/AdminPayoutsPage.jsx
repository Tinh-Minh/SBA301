import { useState } from "react";
import { AdminPageHeader, AdminState, Pager } from "@/components/admin/AdminUi.jsx";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { transactionService } from "@/services/paymentService.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";

const statusLabel = { PENDING: "Chờ thanh toán", SUCCESS: "Thành công", FAILED: "Thất bại", CANCELLED: "Đã huỷ" };
/** Giao dịch chưa thanh toán của gói đã bị huỷ là "Đã huỷ", không phải thanh toán thất bại. */
const statusOf = row => row.status !== "SUCCESS" && row.subscriptionStatus === "CANCELLED" ? "CANCELLED" : row.status;
/** Ưu tiên thời điểm thanh toán thật; chưa thanh toán thì dùng thời điểm tạo giao dịch. */
const timeOf = row => row.paidAt ?? row.createdAt;

/** Các khoản hoàn cọc đang chờ admin chuyển tiền và xác nhận (kèm mã chuyển khoản). */
function PendingRefunds() {
    const refunds = useApiQuery(["admin", "refunds", "pending"],
        () => transactionService.listPage({ page: 0, size: 50, sort: "id,desc", type: "BOOKING_REFUND", status: "PENDING" }));
    const [refs, setRefs] = useState({});
    const [error, setError] = useState("");
    const rows = refunds.data?.content ?? [];
    if (!rows.length) return null;
    async function confirm(id) {
        setError("");
        try { await transactionService.confirmRefund(id, refs[id] ?? ""); await refunds.reload(); }
        catch (e) { setError(e.message); }
    }
    return <section className="rounded-2xl border border-[#FDBA8C] bg-[#FFF7F2] p-4">
      <h2 className="font-bold text-[#292929]">Hoàn cọc chờ xử lý ({rows.length})</h2>
      <p className="text-xs text-[#666666]">Chuyển tiền cho khách rồi nhập mã chuyển khoản để xác nhận đã hoàn.</p>
      {error ? <p role="alert" className="mt-2 text-sm text-[#B91C1C]">{error}</p> : null}
      <ul className="mt-3 flex flex-col gap-2">{rows.map(row => <li key={row.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 text-sm">
        <span className="font-mono text-xs">#{row.id}</span>
        <span>Đơn {row.bookingCode ?? row.bookingId}</span>
        <b>{formatMoney(row.amount)}</b>
        <input value={refs[row.id] ?? ""} onChange={e => setRefs(prev => ({ ...prev, [row.id]: e.target.value }))} placeholder="Mã chuyển khoản" className="min-w-40 flex-1 rounded-xl border border-[#E9E9E7] px-3 py-1.5"/>
        <button type="button" disabled={!refs[row.id]?.trim()} onClick={() => confirm(row.id)} className="rounded-xl bg-[#FC6C26] px-3 py-1.5 font-bold text-white disabled:opacity-50">Đã hoàn tiền</button>
      </li>)}</ul>
    </section>;
}

export default function AdminPayouts() {
    const [page, setPage] = useState(0);
    const [selected, setSelected] = useState(null);
    const list = useApiQuery(["admin", "transactions", page], () => transactionService.listPage({ page, size: 20, sort: "id,desc" }));
    const rows = list.data?.content ?? [];
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A06" title="Giao dịch gói đăng tin" description="Danh sách giao dịch thanh toán gói. Không còn khoản chi trả theo chuyến thuê."/>
    <PendingRefunds/>
    <AdminState loading={list.loading && !list.data} error={list.error} empty={!!list.data && rows.length === 0} label="giao dịch" onRetry={list.reload}/>
    {rows.length ? <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="text-xs uppercase text-[#666666]"><tr>
          <th className="p-3">Mã</th><th className="p-3">Gói</th><th className="p-3">Xe</th><th className="p-3">Số tiền</th><th className="p-3">Trạng thái</th><th className="p-3">Thanh toán / tạo lúc</th><th className="p-3"/>
        </tr></thead>
        <tbody>{rows.map(row => <tr key={row.id} className="border-t border-[#E9E9E7]">
          <td className="p-3 font-mono text-xs">#{row.id}</td>
          <td className="p-3">{row.packageName ?? "—"}<span className="block text-xs text-[#666666]">{row.subscriptionCode}</span></td>
          <td className="p-3">{row.carName}</td>
          <td className="p-3 font-semibold">{formatMoney(row.amount)}</td>
          <td className="p-3">{statusLabel[statusOf(row)] ?? row.status}</td>
          <td className="p-3">{formatDateTime(timeOf(row))}</td>
          <td className="p-3 text-right"><button type="button" onClick={() => setSelected(row)} className="font-bold text-[#FC6C26]">Chi tiết</button></td>
        </tr>)}</tbody>
      </table>
    </div> : null}
    <Pager page={page} totalPages={list.data?.totalPages} onPage={setPage}/>
    <ConfirmDialog open={Boolean(selected)} title={`Giao dịch #${selected?.id ?? ""}`} confirmLabel="Đóng" onClose={() => setSelected(null)} onConfirm={() => setSelected(null)}>
      {selected ? <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-[#666666]">Gói</dt><dd>{selected.packageName}</dd>
        <dt className="text-[#666666]">Xe</dt><dd>{selected.carLicensePlate}</dd>
        <dt className="text-[#666666]">Số tiền</dt><dd>{formatMoney(selected.amount)}</dd>
        <dt className="text-[#666666]">Cổng</dt><dd>{selected.method}</dd>
        <dt className="text-[#666666]">Mã đối soát</dt><dd>{selected.providerRef ?? "—"}</dd>
        <dt className="text-[#666666]">Tạo lúc</dt><dd>{formatDateTime(selected.createdAt)}</dd>
        <dt className="text-[#666666]">Thanh toán lúc</dt><dd>{formatDateTime(selected.paidAt)}</dd>
      </dl> : null}
    </ConfirmDialog>
  </div>;
}
