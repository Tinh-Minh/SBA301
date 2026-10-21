"use client";
import { useMemo, useState } from "react";
import { AdminPageHeader, StatusPill } from "@/components/admin/admin-ui";
import { Money } from "@/components/owner/money";
import { calculatePayout } from "@/lib/owner/finance";
import { loadAdminSeed } from "@/services/mock/admin-db";

export default function AdminPayouts() {
    const seed = useMemo(() => loadAdminSeed(), []);
    const [rows, setRows] = useState(seed.payouts);
    const orders = seed.orders;

    function approve(id) {
        setRows(list => list.map(row => row.id === id ? { ...row, status: "PAID" } : row));
    }

    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A06" title="Giao dịch & Chi trả" description="Phí nền tảng 10% trên tiền thuê. Thực nhận chủ xe bằng 90%."/>
    <p className="rounded-2xl border border-[#E9E9E7] bg-white px-4 py-3 text-sm text-[#292929]">Đơn CDB-ORD-20261026-904: tiền thuê 3.700.000 đ, phí 370.000 đ, thực nhận 3.330.000 đ. Cọc 15.000.000 đ do chủ xe thu tại điểm giao.</p>
    <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="text-[11px] uppercase tracking-wide text-[#666666]"><tr>{["Mã giao dịch", "Mã đơn", "Người nhận", "Ngân hàng", "Gross", "Phí 10%", "Thực nhận", "Trạng thái"].map(head => <th key={head} className="whitespace-nowrap px-4 py-3 font-bold">{head}</th>)}</tr></thead>
        <tbody>
          {rows.map(row => {
                const order = orders.find(item => item.id === row.orderId);
                const money = calculatePayout(order);
                return <tr key={row.id} className="border-t border-[#E9E9E7]">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold">{row.txnCode}</td>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#FC6C26]">{order.orderCode}</td>
              <td className="whitespace-nowrap px-4 py-3 font-semibold">{order.owner}</td>
              <td className="whitespace-nowrap px-4 py-3">{order.bank}</td>
              <td className="whitespace-nowrap px-4 py-3"><Money amount={money.grossAmount}/></td>
              <td className="whitespace-nowrap px-4 py-3"><Money amount={money.platformFee}/></td>
              <td className="whitespace-nowrap px-4 py-3 font-bold"><Money amount={money.netAmount}/></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={row.status === "PAID" ? "success" : "warning"}>{row.status === "PAID" ? "PAID" : "PENDING"}</StatusPill>
                  {row.status === "PENDING" ? <button type="button" onClick={() => approve(row.id)} className="whitespace-nowrap rounded-lg bg-[#FC6C26] px-3 py-1.5 text-xs font-bold text-white">✓ Duyệt chi trả nhanh ➔</button> : null}
                </div>
              </td>
            </tr>;
            })}
        </tbody>
      </table>
    </div>
  </div>;
}
