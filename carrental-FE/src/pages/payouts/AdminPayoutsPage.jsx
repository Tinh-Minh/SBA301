import { useState } from "react";
import { AdminPageHeader, AdminState, Pager } from "@/components/admin/AdminUi.jsx";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { transactionService } from "@/services/paymentService.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";

const statusLabel = { PENDING: "Chờ thanh toán", SUCCESS: "Thành công", FAILED: "Thất bại" };

export default function AdminPayouts() {
    const [page, setPage] = useState(0);
    const [selected, setSelected] = useState(null);
    const list = useApiQuery(["admin", "transactions", page], () => transactionService.listPage({ page, size: 20, sort: "id,desc" }));
    const rows = list.data?.content ?? [];
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A06" title="Giao dịch gói đăng tin" description="Danh sách giao dịch thanh toán gói. Không còn khoản chi trả theo chuyến thuê."/>
    <AdminState loading={list.loading && !list.data} error={list.error} empty={!!list.data && rows.length === 0} label="giao dịch" onRetry={list.reload}/>
    {rows.length ? <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="text-xs uppercase text-[#666666]"><tr>
          <th className="p-3">Mã</th><th className="p-3">Gói</th><th className="p-3">Xe</th><th className="p-3">Số tiền</th><th className="p-3">Trạng thái</th><th className="p-3">Thời điểm</th><th className="p-3"/>
        </tr></thead>
        <tbody>{rows.map(row => <tr key={row.id} className="border-t border-[#E9E9E7]">
          <td className="p-3 font-mono text-xs">#{row.id}</td>
          <td className="p-3">{row.packageName ?? "—"}<span className="block text-xs text-[#666666]">{row.subscriptionCode}</span></td>
          <td className="p-3">{row.carName}</td>
          <td className="p-3 font-semibold">{formatMoney(row.amount)}</td>
          <td className="p-3">{statusLabel[row.status] ?? row.status}</td>
          <td className="p-3">{formatDateTime(row.createdAt)}</td>
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
        <dt className="text-[#666666]">Thanh toán lúc</dt><dd>{formatDateTime(selected.paidAt)}</dd>
      </dl> : null}
    </ConfirmDialog>
  </div>;
}
