import { useCallback, useState } from "react";
import { AdminPageHeader, AdminState, Pager, StatusPill, Tabs } from "@/components/admin/AdminUi.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";
import { adminVoucherService } from "@/hooks/useAdmin.js";
import { CreateDialog, EditDialog, tabs, windowLabel } from "@/components/vouchers/VoucherDialogs.jsx";

export default function AdminVouchers() {
    const [windowState, setWindowState] = useState("");
    const [page, setPage] = useState(0);
    const load = useCallback(() => adminVoucherService.list({ window: windowState || undefined, page, size: 15 }), [windowState, page]);
    const list = useApiQuery(["admin", "vouchers", { windowState, page }], load);
    const rows = list.data?.content ?? [];
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(null);
    const toggle = useApiMutation((voucher) => adminVoucherService.setStatus(voucher.id, voucher.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"), list.reload);
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A04" title="Quản lý voucher" description="Tạo mã giảm giá, giới hạn lượt dùng và bật/tắt voucher." actions={<button type="button" onClick={() => setCreating(true)} className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white">+ Tạo voucher</button>}/>
    <Tabs items={tabs} value={windowState} onChange={id => { setWindowState(id); setPage(0); }}/>
    <AdminState loading={list.loading && !list.data} error={list.error} empty={list.data && !rows.length} label="voucher" onRetry={list.reload}/>
    {toggle.error ? <p className="text-sm text-[#B91C1C]">{toggle.error.message}</p> : null}
    {rows.length ? <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="text-[11px] uppercase tracking-wide text-[#666666]"><tr>{["Mã", "Ưu đãi", "Thời gian", "Đã dùng", "Trạng thái", ""].map(head => <th key={head} className="whitespace-nowrap px-4 py-3 font-bold">{head}</th>)}</tr></thead>
        <tbody>
          {rows.map(voucher => <tr key={voucher.id} className="border-t border-[#E9E9E7] align-top">
            <td className="px-4 py-3"><span className="font-mono font-bold text-[#FC6C26]">{voucher.code}</span><p className="max-w-56 text-xs text-[#666666]">{voucher.description}</p></td>
            <td className="whitespace-nowrap px-4 py-3">{voucher.discountType === "PERCENT" ? `${voucher.discountValue}%` : formatMoney(voucher.discountValue)}
              <p className="text-xs text-[#666666]">{voucher.maxDiscount ? `Tối đa ${formatMoney(voucher.maxDiscount)}` : "Không giới hạn"} • đơn từ {formatMoney(voucher.minOrderAmount)}</p></td>
            <td className="whitespace-nowrap px-4 py-3 text-xs">{formatDateTime(voucher.startAt)}<br/>→ {formatDateTime(voucher.endAt)}<p className="text-[#666666]">{windowLabel[voucher.windowState] ?? voucher.windowState}</p></td>
            <td className="whitespace-nowrap px-4 py-3">{voucher.usedCount}/{voucher.usageLimit ?? "∞"}<p className="text-xs text-[#666666]">{voucher.perUserLimit} lần/khách</p></td>
            <td className="px-4 py-3"><StatusPill tone={voucher.status === "ACTIVE" ? "success" : "neutral"}>{voucher.status === "ACTIVE" ? "Đang bật" : "Đã tắt"}</StatusPill></td>
            <td className="whitespace-nowrap px-4 py-3 text-right">
              <button type="button" onClick={() => setEditing(voucher)} className="mr-3 text-xs font-bold text-[#292929]">Sửa</button>
              <button type="button" disabled={toggle.running} onClick={() => void toggle.run(voucher)} className="text-xs font-bold text-[#FC6C26]">{voucher.status === "ACTIVE" ? "Tắt" : "Bật"}</button>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div> : null}
    <Pager page={page} totalPages={list.data?.totalPages} onPage={setPage}/>
    {creating ? <CreateDialog onClose={() => setCreating(false)} onCreated={() => { setCreating(false); list.reload(); }}/> : null}
    {editing ? <EditDialog voucher={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); list.reload(); }}/> : null}
  </div>;
}
