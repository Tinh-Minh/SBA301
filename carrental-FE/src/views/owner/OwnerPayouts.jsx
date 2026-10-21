"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { Money } from "@/components/owner/money";
import { FilterBar, OwnerCrumb, OwnerHeading, OwnerState } from "@/components/owner/owner-screen";
import { StatusBadge } from "@/components/owner/status-badge";
import { useOwnerPayouts } from "@/hooks/owner/use-owner-payouts";
import { maskBankAccount } from "@/lib/owner/format";
import { formatTrVnd } from "@/lib/owner/finance";
import { payoutStatusMeta } from "@/lib/owner/status";
const filters = [
    { id: "all", label: "Tất cả" },
    { id: "held", label: "Đang giữ escrow" },
    { id: "paid", label: "Đã chi trả" },
];
const paidAt = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
export default function OwnerPayouts() {
    const { data, loading, error } = useOwnerPayouts();
    const [filter, setFilter] = useState("all");
    const rows = data?.rows ?? [];
    const visible = useMemo(() => rows.filter(row => {
        if (filter === "paid")
            return row.payout.status === "PAID";
        if (filter === "held")
            return row.payout.status === "PENDING" || row.payout.status === "PROCESSING";
        return true;
    }), [rows, filter]);
    const held = rows.filter(row => row.payout.status === "PENDING" || row.payout.status === "PROCESSING");
    const paid = rows.filter(row => row.payout.status === "PAID");
    const heldNet = held.reduce((sum, row) => sum + row.payout.netAmount, 0);
    const paidNet = paid.reduce((sum, row) => sum + row.payout.netAmount, 0);
    const bank = data?.defaultBankAccount;
    return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-col gap-2">
      <OwnerCrumb current="Doanh thu & Chi trả"/>
      <OwnerHeading title="Doanh thu & Chi trả" description="Báo cáo tiền thuê, khoản escrow đang giữ và các đợt đã chuyển về tài khoản." actions={<button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-xl border border-card-border bg-white px-4 py-2.5 text-sm font-bold text-charcoal">
          <Icon name="print" className="text-[18px]"/>
          Xuất báo cáo
        </button>}/>
    </div>
    <OwnerState loading={loading} error={error} label="đối soát"/>
    {data ? <>
      <div className="grid gap-3 lg:grid-cols-3">
        <article className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-gray">Tổng doanh thu</p>
          <p className="mt-2 text-2xl font-bold text-charcoal"><Money amount={data.totals.grossAmount} compact/></p>
          <p className="mt-1 text-xs text-muted-gray">Tổng tiền thuê của {rows.length} chuyến đã ghi nhận</p>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-status-amber-bg p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-status-amber-dark">Đang giữ escrow</p>
          <p className="mt-2 text-2xl font-bold text-charcoal"><Money amount={heldNet} compact/></p>
          <p className="mt-1 text-xs text-status-amber-dark">{held.length} đơn chờ ký C10-B rồi mới chi trả</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-status-green-bg p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-status-success-ink">Đã chi trả</p>
          <p className="mt-2 text-2xl font-bold text-charcoal"><Money amount={paidNet} compact/></p>
          <p className="mt-1 text-xs text-status-success-ink">{paid.length} đợt đã chuyển khoản</p>
        </article>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-card-border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-charcoal">{bank ? bank.bankName : "Chưa có tài khoản nhận tiền"}</p>
          <p className="text-sm text-muted-gray">{bank ? `${bank.accountHolder} • ${maskBankAccount(bank.accountNumber)}` : "Thêm tài khoản ngân hàng để nhận chi trả."}</p>
        </div>
        <Link href="/tai-khoan/ngan-hang" className="inline-flex items-center gap-1 text-sm font-bold text-brand-accent">Cập nhật tài khoản <Icon name="arrow_forward" className="text-[16px]"/></Link>
      </section>

      <FilterBar value={filter} onChange={setFilter} options={filters.map(item => ({ ...item, label: `${item.label} (${item.id === "all" ? rows.length : item.id === "paid" ? paid.length : held.length})` }))}/>

      <div className="overflow-x-auto rounded-2xl border border-card-border bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-bg-light text-[11px] font-bold uppercase tracking-wide text-muted-gray">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Phương tiện</th>
              <th className="px-4 py-3">Tiền thuê</th>
              <th className="px-4 py-3">Phí CarDB</th>
              <th className="px-4 py-3">Thực nhận</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Giải ngân</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(row => <tr key={row.payout.id} className="border-t border-card-border">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-brand-accent">{row.order.orderCode}</td>
              <td className="px-4 py-3">
                <span className="block font-semibold text-charcoal">{row.car.brand} {row.car.model}</span>
                <span className="text-xs text-muted-gray">{row.car.licensePlate}</span>
              </td>
              <td className="whitespace-nowrap px-4 py-3"><Money amount={row.payout.grossAmount} compact/></td>
              <td className="whitespace-nowrap px-4 py-3"><Money amount={row.payout.platformFee} sign="-" compact/></td>
              <td className="whitespace-nowrap px-4 py-3 font-bold"><Money amount={row.payout.netAmount} compact/></td>
              <td className="px-4 py-3"><StatusBadge meta={payoutStatusMeta[row.payout.status]}/></td>
              <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-gray">{row.payout.paidAt ? paidAt.format(new Date(row.payout.paidAt)) : "Sau khi ký C10-B"}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-gray">
        Tổng doanh thu {formatTrVnd(data.totals.grossAmount)} • Phí dịch vụ {formatTrVnd(data.totals.platformFee)} • Thực nhận {formatTrVnd(data.totals.netAmount)}. Voucher của khách không làm giảm số thực nhận.
      </p>
    </> : null}
  </div>;
}
