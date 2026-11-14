import { useMemo, useState } from "react";
import { Link } from "react-router";
import { OwnerCrumb, OwnerHeading } from "@/components/owner/OwnerScreen.jsx";
import { LiveState } from "@/components/LiveUi.jsx";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { Icon } from "@/components/Icon.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { transactionService } from "@/services/paymentService.js";
import { request } from "@/services/api.js";
import { ownerRoutes } from "@/routes/paths.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";

const statusLabel = { PENDING: "Chờ thanh toán", SUCCESS: "Thành công", FAILED: "Thất bại", CANCELLED: "Đã huỷ" };
const statusOf = row => row.status !== "SUCCESS" && row.subscriptionStatus === "CANCELLED" ? "CANCELLED" : row.status;
const timeOf = row => row.paidAt ?? row.createdAt;
const pkgFilters = [
    { id: "all", label: "Tất cả" },
    { id: "SUCCESS", label: "Thành công" },
    { id: "PENDING", label: "Đang chờ" },
    { id: "FAILED", label: "Thất bại" },
    { id: "CANCELLED", label: "Đã huỷ" },
];

const cashflowFilters = [
    { id: "ALL", label: "Tất cả khoản tiền" },
    { id: "PENDING", label: "⏳ Nền tảng đang giữ (Chưa chuyển)" },
    { id: "COMPLETED", label: "✓ Đã chuyển về tài khoản của bạn" },
    { id: "PENALTY", label: "Khấu trừ / Phạt" },
];

export default function OwnerPayouts() {
    const [tab, setTab] = useState("CASHFLOW");
    const settlements = useApiQuery(["settlements", "owner-cashflow"], () => request("/api/settlements/my"));
    const pkgList = useApiQuery(["transactions", "mine"], transactionService.listRecent);

    const [cfFilter, setCfFilter] = useState("ALL");
    const [filter, setFilter] = useState("all");
    const [selected, setSelected] = useState(null);

    const slips = settlements.data ?? [];
    const payoutSlips = useMemo(() => slips.filter(s => s.slipType === "OWNER_PAYOUT"), [slips]);
    const penaltySlips = useMemo(() => slips.filter(s => s.slipType === "OWNER_PENALTY"), [slips]);

    const pendingAmount = useMemo(
        () => payoutSlips.filter(s => s.status === "PENDING").reduce((sum, s) => sum + Number(s.amount || 0), 0),
        [payoutSlips]
    );
    const completedAmount = useMemo(
        () => payoutSlips.filter(s => s.status === "COMPLETED").reduce((sum, s) => sum + Number(s.amount || 0), 0),
        [payoutSlips]
    );
    const pendingCount = useMemo(() => payoutSlips.filter(s => s.status === "PENDING").length, [payoutSlips]);
    const completedCount = useMemo(() => payoutSlips.filter(s => s.status === "COMPLETED").length, [payoutSlips]);

    const visibleSlips = useMemo(() => {
        if (cfFilter === "PENDING") return payoutSlips.filter(s => s.status === "PENDING");
        if (cfFilter === "COMPLETED") return payoutSlips.filter(s => s.status === "COMPLETED");
        if (cfFilter === "PENALTY") return penaltySlips;
        return slips.filter(s => s.slipType === "OWNER_PAYOUT" || s.slipType === "OWNER_PENALTY");
    }, [slips, payoutSlips, penaltySlips, cfFilter]);

    const rows = pkgList.data ?? [];
    const visible = useMemo(() => rows.filter(row => filter === "all" || statusOf(row) === filter), [rows, filter]);
    const paid = rows.filter(row => row.status === "SUCCESS").reduce((sum, row) => sum + Number(row.amount || 0), 0);

    return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-col gap-2">
        <OwnerCrumb homeHref={ownerRoutes.dashboard} current="Kiểm soát dòng tiền"/>
        <OwnerHeading
          title="Kiểm soát dòng tiền với nền tảng"
          description="Theo dõi minh bạch các khoản tiền cọc và tiền thuê xe do nền tảng giữ từ khách hàng: khoản nào đang chờ chuyển và khoản nào Admin đã chuyển về tài khoản của bạn."
        />
      </div>
      <button
        type="button"
        onClick={() => { void settlements.reload(); void pkgList.reload(); }}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[#E4E2D8] bg-white px-3.5 py-2 text-xs font-bold text-[#25251F] shadow-sm hover:bg-[#F3F1EA]"
      >
        <Icon name="refresh" className="text-[16px]"/> Đồng bộ trạng thái
      </button>
    </div>

    <div className="flex flex-wrap gap-2 border-b border-[#E4E2D8] pb-3">
      <button
        type="button"
        onClick={() => setTab("CASHFLOW")}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${tab === "CASHFLOW" ? "bg-[#25251F] text-[#FAF8F2] shadow-sm" : "bg-white text-[#25251F] border border-[#E4E2D8] hover:bg-[#F3F1EA]"}`}
      >
        <Icon name="account_balance_wallet" className="text-[17px]"/>
        Dòng tiền thuê xe & đặt cọc ({payoutSlips.length})
      </button>
      <button
        type="button"
        onClick={() => setTab("PACKAGE")}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${tab === "PACKAGE" ? "bg-[#25251F] text-[#FAF8F2] shadow-sm" : "bg-white text-[#25251F] border border-[#E4E2D8] hover:bg-[#F3F1EA]"}`}
      >
        <Icon name="workspace_premium" className="text-[17px]"/>
        Giao dịch mua gói đăng tin ({rows.length})
      </button>
    </div>

    {tab === "CASHFLOW" ? (
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Nền tảng đang giữ (Chờ chuyển về bạn)</span>
            <p className="mt-1 text-2xl font-extrabold text-amber-950">{formatMoney(pendingAmount)}</p>
            <p className="mt-1 text-xs text-amber-800">{pendingCount} khoản đang chờ Admin phê duyệt chuyển</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Đã chuyển về tài khoản của bạn</span>
            <p className="mt-1 text-2xl font-extrabold text-emerald-950">{formatMoney(completedAmount)}</p>
            <p className="mt-1 text-xs text-emerald-800">{completedCount} khoản Admin đã xác nhận chuyển</p>
          </div>
          <div className="rounded-2xl border border-[#E4E2D8] bg-white p-4 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6C6C61]">Tổng doanh thu qua nền tảng</span>
            <p className="mt-1 text-2xl font-extrabold text-[#25251F]">{formatMoney(pendingAmount + completedAmount)}</p>
            <p className="mt-1 text-xs text-[#6C6C61]">Tổng cộng {payoutSlips.length} phiếu chi trả đơn thuê</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {cashflowFilters.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCfFilter(item.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${cfFilter === item.id ? "bg-[#FC6C26] text-white shadow-sm" : "border border-[#E4E2D8] bg-white text-[#25251F] hover:bg-[#F3F1EA]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <LiveState
          loading={settlements.loading && !settlements.data}
          error={settlements.error}
          empty={!!settlements.data && visibleSlips.length === 0}
          label="khoản đối soát dòng tiền"
          onRetry={settlements.reload}
        />

        <div className="flex flex-col gap-3">
          {visibleSlips.map(s => {
            const isCompleted = s.status === "COMPLETED";
            const isPenalty = s.slipType === "OWNER_PENALTY";
            return (
              <article
                key={s.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${isCompleted ? "border-emerald-200" : isPenalty ? "border-red-200" : "border-amber-200"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#6C6C61]">{s.slipCode}</span>
                      {s.bookingId ? (
                        <Link to={`/trips/${s.bookingId}`} className="rounded-lg bg-[#FFF2EB] px-2.5 py-0.5 font-mono text-xs font-bold text-[#FC6C26] hover:underline">
                          Đơn #{s.bookingCode}
                        </Link>
                      ) : null}
                      {s.carName ? <span className="text-xs font-semibold text-[#25251F]">• {s.carName}</span> : null}
                      {s.customerName ? <span className="text-xs text-[#6C6C61]">• Khách thuê: <strong>{s.customerName}</strong></span> : null}
                    </div>
                    <p className="mt-2 text-lg font-extrabold text-[#25251F]">
                      {isPenalty ? "Khoản khấu trừ / phạt: " : "Số tiền chuyển về Chủ xe: "}
                      <span className={isPenalty ? "text-[#B91C1C]" : "text-[#FC6C26]"}>{formatMoney(s.amount)}</span>
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#444444]">{s.reason}</p>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold ${isCompleted ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : isPenalty ? "bg-red-100 text-red-900" : "bg-amber-100 text-amber-900 border border-amber-300"}`}>
                    {isCompleted ? "✓ Admin đã chuyển về tài khoản của bạn" : isPenalty ? "Chờ cấn trừ" : "⏳ Nền tảng đang giữ — Chờ Admin chuyển"}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 rounded-xl bg-[#FAF8F2] p-3 text-xs sm:grid-cols-3">
                  <div>
                    <span className="text-[#6C6C61]">Tiền khách đã chuyển nền tảng: </span>
                    <strong className="text-[#25251F]">{s.customerPaidAmount != null ? formatMoney(s.customerPaidAmount) : formatMoney(s.amount)}</strong>
                    {s.depositAmount ? <span className="block text-[11px] text-[#6C6C61]">(Cọc: {formatMoney(s.depositAmount)}{s.rentalAmount ? ` • Giá thuê: ${formatMoney(s.rentalAmount)}` : ""})</span> : null}
                  </div>
                  <div>
                    <span className="text-[#6C6C61]">Tài khoản nhận của bạn: </span>
                    {s.bankAccountNumber ? (
                      <strong className="text-[#25251F]">{s.bankName} • {s.bankAccountNumber} ({s.bankAccountHolder})</strong>
                    ) : (
                      <Link to="/account" className="font-bold text-[#FC6C26] underline">Cập nhật STK ngân hàng nhận tiền</Link>
                    )}
                  </div>
                  <div>
                    {isCompleted ? (
                      <>
                        <span className="text-emerald-800 font-semibold">Đã chuyển lúc: {formatDateTime(s.processedAt)}</span>
                        <span className="block font-mono text-[11px] text-emerald-900">Mã đối soát: {s.referenceCode ?? "—"}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[#6C6C61]">Tạo phiếu lúc: {formatDateTime(s.createdAt)}</span>
                        <span className="block text-[11px] text-amber-800">Hạn xử lý dự kiến: {formatDateTime(s.dueAt)}</span>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        <p className="rounded-2xl border border-card-border bg-white p-4 text-sm">Đã thanh toán gói đăng tin: <strong>{formatMoney(paid)}</strong></p>
        <div className="flex flex-wrap gap-2">{pkgFilters.map(item => <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter === item.id ? "bg-[#FC6C26] text-white" : "bg-white text-[#292929]"}`}>{item.label}</button>)}</div>
        <LiveState loading={pkgList.loading && !pkgList.data} error={pkgList.error} empty={!!pkgList.data && visible.length === 0} label="giao dịch gói" onRetry={pkgList.reload}/>
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
      </div>
    )}
  </div>;
}
