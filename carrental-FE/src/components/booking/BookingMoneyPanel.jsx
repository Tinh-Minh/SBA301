import { useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { tripService } from "@/services/tripService.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";

/** Chính sách phí huỷ chuyến (giống Mioto) – hiển thị cho khách và chủ xe. */
export const CANCEL_POLICY = [
    ["Trong 1 giờ sau khi giữ chỗ", "Miễn phí"],
    ["Trước chuyến đi hơn 7 ngày", "10% giá trị chuyến"],
    ["Trong vòng 7 ngày trước chuyến đi", "40% giá trị chuyến"],
];

/** Ước tính phí huỷ theo đúng công thức của backend. */
export function estimateCancelFee(booking, by) {
    const value = Math.max(0, Number(booking.rentalAmount || 0) - Number(booking.discountAmount || 0));
    const heldSince = by === "owner" ? booking.confirmedAt : booking.depositPaidAt;
    if (booking.status === "REQUESTED") return 0;
    const now = Date.now();
    if (heldSince && now <= new Date(heldSince).getTime() + 3600 * 1000) return 0;
    const days = (new Date(booking.pickupAt).getTime() - now) / 86400000;
    return Math.round(value * (days >= 7 ? 0.1 : 0.4));
}

const slipStatus = { PENDING: "Đang xử lý", COMPLETED: "Đã chuyển khoản" };

function PayButton({ label, onPay, disabled }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    return <div className="mt-3 flex flex-col gap-1">
      <button type="button" disabled={busy || disabled} onClick={async () => {
          setBusy(true); setError("");
          try { const res = await onPay(); if (res?.paymentUrl) window.location.href = res.paymentUrl; }
          catch (e) { setError(e.message); }
          finally { setBusy(false); }
      }} className="self-start rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e05615] disabled:opacity-50">{busy ? "Đang mở VNPay…" : label}</button>
      {error ? <p role="alert" className="text-xs text-[#B91C1C]">{error}</p> : null}
    </div>;
}

/**
 * Dòng tiền của đơn thuê: cọc 40% ngay khi đặt → trả đủ trước khi nhận xe → phí phát sinh khi trả xe;
 * báo vắng mặt khi nhận xe; danh sách phiếu hoàn/chi trả do Admin xử lý trong 1–3 ngày làm việc.
 */
export function BookingMoneyPanel({ booking: b, role, onChanged }) {
    const slips = useApiQuery(["trip", b.id, "settlements"], () => tripService.settlements(b.id));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const now = Date.now();
    const pickupMs = new Date(b.pickupAt).getTime();

    async function act(action) {
        setBusy(true); setError("");
        try { await action(); await onChanged?.(); await slips.reload(); }
        catch (e) { setError(e.message); }
        finally { setBusy(false); }
    }

    const box = "rounded-2xl border border-[#FDBA8C] bg-[#FFF7F2] p-5 shadow-sm";
    return <>
      {role === "customer" && b.status === "REQUESTED" && b.depositStatus === "UNPAID" ? <section className={box}>
        <h2 className="text-base font-bold text-[#292929]">Bước 1: Đặt cọc giữ chỗ</h2>
        <p className="mt-1 text-sm text-[#666666]">Thanh toán cọc <b>{formatMoney(b.depositAmount)}</b> (40% tiền thuê) qua VNPay để yêu cầu được gửi tới chủ xe.
          {b.depositDueAt ? <> Hạn thanh toán: <b>{formatDateTime(b.depositDueAt)}</b>, quá hạn yêu cầu sẽ tự huỷ.</> : null}</p>
        <PayButton label="Thanh toán cọc qua VNPay" onPay={() => tripService.payDeposit(b.id)}/>
      </section> : null}

      {role === "customer" && b.status === "REQUESTED" && b.depositStatus === "PAID" ? <section className="rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-4 text-sm text-[#065F46]">
        Đã cọc {formatMoney(b.depositAmount)}. Chủ xe phản hồi trước {formatDateTime(b.ownerResponseDueAt)}; quá hạn yêu cầu tự huỷ và bạn được hoàn 100% cọc.
      </section> : null}

      {role === "customer" && b.status === "CONFIRMED" && b.rentalPaymentStatus !== "PAID" ? <section className={box}>
        <h2 className="text-base font-bold text-[#292929]">Bước 2: Thanh toán đủ trước khi nhận xe</h2>
        <p className="mt-1 text-sm text-[#666666]">Còn lại <b>{formatMoney(b.rentalRemainingAmount)}</b>. Chủ xe chỉ giao xe khi bạn đã thanh toán đủ qua CarDB.</p>
        <PayButton label="Thanh toán phần còn lại qua VNPay" onPay={() => tripService.payRental(b.id)}/>
      </section> : null}

      {role === "customer" && b.status === "RETURN_PENDING" && b.extraFeeStatus === "UNPAID" ? <section className={box}>
        <h2 className="text-base font-bold text-[#292929]">Thanh toán phí phát sinh</h2>
        <p className="mt-1 text-sm text-[#666666]">Phí phát sinh khi trả xe: <b>{formatMoney(b.finalAmount)}</b>. Chuyến đi hoàn tất sau khi thanh toán.</p>
        <PayButton label="Thanh toán phí phát sinh qua VNPay" onPay={() => tripService.payExtraFee(b.id)}/>
      </section> : null}

      {role === "owner" && b.status === "CONFIRMED" && b.rentalPaymentStatus !== "PAID" ? <p className="rounded-2xl border border-[#E9E9E7] bg-white p-4 text-sm text-[#666666]">Khách chưa thanh toán đủ tiền thuê. Bạn chỉ lập biên bản giao xe sau khi khách thanh toán đủ qua CarDB.</p> : null}

      {b.status === "CONFIRMED" && role === "owner" && now >= pickupMs + 2 * 3600 * 1000 ? <section className="rounded-2xl border border-[#E9E9E7] bg-white p-4 text-sm">
        <p>Khách không đến nhận xe? Đơn sẽ đóng và bạn nhận phí huỷ chuyến theo chính sách.</p>
        <button type="button" disabled={busy} onClick={() => act(() => tripService.customerNoShow(b.id))} className="mt-2 rounded-xl border border-[#B91C1C] px-4 py-2 font-bold text-[#B91C1C]">Báo khách không đến</button>
      </section> : null}

      {b.status === "CONFIRMED" && role === "customer" && now >= pickupMs + 3600 * 1000 ? <section className="rounded-2xl border border-[#E9E9E7] bg-white p-4 text-sm">
        <p>Chủ xe không giao xe? Bạn được hoàn 100% số đã trả và nhận thêm tiền đền bù.</p>
        <button type="button" disabled={busy} onClick={() => act(() => tripService.ownerNoShow(b.id))} className="mt-2 rounded-xl border border-[#B91C1C] px-4 py-2 font-bold text-[#B91C1C]">Báo chủ xe không giao xe</button>
      </section> : null}

      {b.cancelFeeAmount !== null && b.cancelFeeAmount !== undefined && b.status === "CANCELLED" ? <section className="rounded-2xl border border-[#E9E9E7] bg-white p-4 text-sm">
        <h2 className="font-bold">Quyết toán huỷ chuyến</h2>
        <p className="mt-1">Phí huỷ: <b>{formatMoney(b.cancelFeeAmount)}</b> • Hoàn cho khách: <b>{formatMoney(b.refundAmount)}</b></p>
      </section> : null}

      {error ? <p role="alert" className="rounded-xl bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]">{error}</p> : null}

      {(slips.data ?? []).length ? <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 text-sm shadow-sm">
        <h2 className="font-bold">Phiếu hoàn tiền / chi trả</h2>
        <p className="text-xs text-[#666666]">Admin chuyển khoản theo tài khoản ngân hàng trong 1–3 ngày làm việc.</p>
        <ul className="mt-3 flex flex-col gap-2">{slips.data.filter(s => role === "admin" || s.recipientId === (role === "owner" ? b.ownerId : b.customerId)).map(s => <li key={s.id} className="rounded-xl bg-[#F7F7F5] p-3">
          <p className="font-semibold">{s.typeLabel} • {formatMoney(s.amount)} <span className={s.status === "COMPLETED" ? "text-[#047857]" : "text-[#D97706]"}>({slipStatus[s.status]})</span></p>
          <p className="text-xs text-[#666666]">{s.slipCode} • {s.reason}</p>
          <p className="text-xs text-[#666666]">{s.status === "COMPLETED" ? `Chuyển lúc ${formatDateTime(s.processedAt)} • Mã GD ${s.referenceCode}` : `Hạn xử lý ${formatDateTime(s.dueAt)}`}{s.bankMissing ? " • Cần cập nhật tài khoản ngân hàng" : ""}</p>
        </li>)}</ul>
      </section> : null}
    </>;
}
