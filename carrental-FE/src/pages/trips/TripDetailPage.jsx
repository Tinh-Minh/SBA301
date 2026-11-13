import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { Icon } from "@/components/Icon.jsx";
import { LivePage, LiveState, fieldClass } from "@/components/LiveUi.jsx";
import { RequireAuth } from "@/components/RequireAuth.jsx";
import { StatusBadge } from "@/components/owner/StatusBadge.jsx";
import { HandoverForm, HandoverView } from "@/components/booking/Handover.jsx";
import { TripTimeline } from "@/components/booking/TripParts.jsx";
import { CustomerReviewPanel } from "@/components/booking/CustomerReviewPanel.jsx";
import { BookingMoneyPanel, CANCEL_POLICY, estimateCancelFee } from "@/components/booking/BookingMoneyPanel.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useAuth } from "@/hooks/useAuth.js";
import { tripService } from "@/services/tripService.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";
import { bookingStatusMeta, durationLabel } from "@/utils/rental.js";

function Row({ term, value, strong }) {
    return <div className="flex justify-between gap-3 py-1"><dt className="text-[#666666]">{term}</dt><dd className={strong ? "font-bold text-[#292929]" : "text-[#292929]"}>{value}</dd></div>;
}

function Trip({ id }) {
    const { user, isAdmin } = useAuth();
    const [params] = useSearchParams();
    const query = useApiQuery(["trip", id], () => tripService.get(id));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [contactNote, setContactNote] = useState("");
    const [contacted, setContacted] = useState(false);
    const [reason, setReason] = useState("");
    const [asking, setAsking] = useState(null); // "reject" | "cancel"
    const b = query.data;
    if (!b) return <LiveState loading={query.loading} error={query.error} label="đơn thuê"/>;
    const role = b.ownerId === user?.id ? "owner" : b.customerId === user?.id ? "customer" : isAdmin ? "admin" : "viewer";
    const pickup = b.handovers.find(h => h.type === "PICKUP");
    const ret = b.handovers.find(h => h.type === "RETURN");

    async function run(action, after) {
        setBusy(true);
        setError("");
        try { await action(); after?.(); await query.reload(); }
        catch (e) { setError(e.message); }
        finally { setBusy(false); }
    }

    return <div className="flex flex-col gap-5">
    <Link to={role === "owner" ? "/owner/bookings" : isAdmin ? "/admin/bookings" : "/trips"} className="inline-flex items-center gap-1 text-sm text-[#666666]"><Icon name="arrow_back" className="text-[16px]"/>Danh sách đơn thuê</Link>
    {params.get("created") ? <p role="status" className="rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-4 text-sm text-[#065F46]"><b>Đã tạo yêu cầu thuê xe.</b> Vui lòng thanh toán cọc 40% trong 30 phút để yêu cầu được gửi tới chủ xe.</p> : null}
    <header className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-[#666666]">{b.bookingCode}</p>
          <h1 className="text-2xl font-bold text-[#292929]">{b.carName}</h1>
          <p className="text-sm text-[#666666]">{b.carLicensePlate ? `${b.carLicensePlate} • ` : ""}{b.pickupAddress}</p>
        </div>
        <StatusBadge meta={bookingStatusMeta[b.status]}/>
      </div>
      <TripTimeline booking={b}/>
      {b.rejectReason ? <p className="rounded-xl bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]">Chủ xe từ chối: {b.rejectReason}</p> : null}
      {b.cancelReason ? <p className="rounded-xl bg-[#F3F4F6] p-3 text-sm text-[#374151]">Đơn đã huỷ ({({ OWNER: "chủ xe", ADMIN: "quản trị viên", CUSTOMER: "khách", CUSTOMER_NO_SHOW: "khách không đến", OWNER_NO_SHOW: "chủ xe không giao xe", SYSTEM: "hệ thống" })[b.cancelledBy] ?? "khách"}): {b.cancelReason}</p> : null}
      {b.status === "EXPIRED" ? <p className="rounded-xl bg-[#F3F4F6] p-3 text-sm text-[#374151]">Yêu cầu đã hết hạn{b.cancelReason ? "" : " (chưa thanh toán cọc hoặc chủ xe chưa xác nhận kịp)"}.</p> : null}
    </header>

    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-5">
        {role === "owner" && b.status === "REQUESTED" ? <section className="rounded-2xl border border-[#FDBA8C] bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-[#292929]">Bước 1: Liên hệ khách</h2>
          <p className="mt-1 text-sm text-[#666666]">Gọi cho <b>{b.customerName}</b> qua <a className="font-bold text-[#FC6C26]" href={`tel:${b.customerPhone}`}>{b.customerPhone}</a> để thống nhất giờ, địa điểm giao xe và giấy tờ cần mang theo.</p>
          {b.ownerContactedAt ? <p className="mt-3 rounded-xl bg-[#ECFDF5] p-3 text-sm text-[#065F46]"><Icon name="task_alt" className="text-[16px]"/> Đã liên hệ lúc {formatDateTime(b.ownerContactedAt)}: {b.contactNote}</p>
            : <div className="mt-3 flex flex-col gap-2">
              <textarea rows={2} value={contactNote} maxLength={1000} onChange={e => setContactNote(e.target.value)} placeholder="Nội dung đã trao đổi: giờ giao, địa điểm, giấy tờ…" className={fieldClass}/>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={contacted} onChange={e => setContacted(e.target.checked)}/>Tôi xác nhận đã liên hệ trực tiếp với khách</label>
              <button type="button" disabled={busy || !contacted || !contactNote.trim()} onClick={() => run(() => tripService.contacted(b.id, contactNote.trim()))} className="self-start rounded-xl bg-[#292929] px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Xác nhận đã liên hệ</button>
            </div>}
          <h2 className="mt-5 text-base font-bold text-[#292929]">Bước 2: Nhận hoặc từ chối đơn</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" disabled={busy || !b.ownerContactedAt || b.depositStatus !== "PAID"} title={b.depositStatus !== "PAID" ? "Khách chưa thanh toán cọc" : undefined} onClick={() => run(() => tripService.accept(b.id))} className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Xác nhận cho thuê</button>
            <button type="button" disabled={busy} onClick={() => setAsking("reject")} className="rounded-xl border border-[#E9E9E7] px-4 py-2 text-sm font-bold">Từ chối</button>
          </div>
        </section> : null}

        <BookingMoneyPanel booking={b} role={role} onChanged={query.reload}/>

        {asking ? <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
          <h2 className="font-bold">{asking === "reject" ? "Lý do từ chối" : "Lý do huỷ đơn"}</h2>
          {asking === "cancel" ? <div className="mt-2 rounded-xl bg-[#F7F7F5] p-3 text-xs text-[#444444]">
            <p className="font-bold">Chính sách huỷ chuyến</p>
            <ul className="mt-1">{CANCEL_POLICY.map(([when, fee]) => <li key={when}>• {when}: {fee}</li>)}</ul>
            {role === "owner"
              ? <p className="mt-2">Chủ xe huỷ: khách được hoàn 100% và nhận đền bù. Bạn bị phạt <b>{formatMoney(estimateCancelFee(b, "owner"))}</b> (cấn trừ vào lần chi trả sau); huỷ từ 3 lần/30 ngày sẽ bị tạm ẩn tin.</p>
              : <p className="mt-2">Phí huỷ ước tính: <b>{formatMoney(estimateCancelFee(b, "customer"))}</b>. Phần còn lại được hoàn về tài khoản ngân hàng của bạn trong 1–3 ngày làm việc.</p>}
          </div> : null}
          <textarea rows={2} value={reason} maxLength={500} onChange={e => setReason(e.target.value)} className={`${fieldClass} mt-2`}/>
          <div className="mt-2 flex gap-2">
            <button type="button" disabled={busy || !reason.trim()} onClick={() => run(() => asking === "reject" ? tripService.reject(b.id, reason.trim()) : tripService.cancel(b.id, reason.trim()), () => setAsking(null))} className="rounded-xl bg-[#B91C1C] px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Xác nhận</button>
            <button type="button" onClick={() => setAsking(null)} className="rounded-xl border border-[#E9E9E7] px-4 py-2 text-sm font-bold">Đóng</button>
          </div>
        </section> : null}

        {role === "owner" && b.status === "CONFIRMED" && !pickup && b.rentalPaymentStatus === "PAID" ? <HandoverForm type="PICKUP" booking={b} busy={busy} error={error} onSubmit={body => run(() => tripService.submitHandover(b.id, "PICKUP", body))}/> : null}
        {pickup ? <HandoverView handover={pickup} booking={b} busy={busy} error={error}
          mode={role === "customer" && pickup.status === "SUBMITTED" ? "respond" : role === "owner" && pickup.status === "DISPUTED" ? "revise" : "view"}
          onRespond={body => run(() => tripService.respondHandover(b.id, "PICKUP", body))}
          onRevise={body => run(() => tripService.reviseHandover(b.id, "PICKUP", body))}/> : null}
        {role === "owner" && b.status === "IN_PROGRESS" && !ret ? <HandoverForm type="RETURN" booking={b} busy={busy} error={error} onSubmit={body => run(() => tripService.submitHandover(b.id, "RETURN", body))}/> : null}
        {ret ? <HandoverView handover={ret} booking={b} busy={busy} error={error}
          mode={role === "customer" && ret.status === "SUBMITTED" ? "respond" : role === "owner" && ret.status === "DISPUTED" ? "revise" : "view"}
          onRespond={body => run(() => tripService.respondHandover(b.id, "RETURN", body))}
          onRevise={body => run(() => tripService.reviseHandover(b.id, "RETURN", body))}/> : null}

        {role === "customer" && b.status === "COMPLETED" && !b.reviewed ? <Link to={`/cars/${b.carId}#reviews`} className="rounded-2xl border border-[#FDBA8C] bg-[#FFF7F2] p-4 text-sm font-bold text-[#9A3412]">Chuyến đi đã hoàn tất — viết đánh giá cho xe này →</Link> : null}
        {error && !asking ? <p role="alert" className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">{error}</p> : null}
      </div>

      <aside className="flex flex-col gap-4">
        <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 text-sm shadow-sm">
          <h2 className="mb-2 font-bold">Thời gian & chi phí</h2>
          <dl>
            <Row term="Nhận xe" value={formatDateTime(b.pickupAt)}/>
            <Row term="Trả xe" value={formatDateTime(b.returnAt)}/>
            <Row term="Thời lượng" value={durationLabel(b.rentalDays, b.rentalHours)} strong/>
            <div className="my-2 border-t border-[#F1F1EF]"/>
            {b.rentalDays ? <Row term={`${b.rentalDays} ngày`} value={formatMoney(b.dayAmount)}/> : null}
            {b.rentalHours ? <Row term={`${b.rentalHours} giờ lẻ × ${formatMoney(b.pricePerHour)}`} value={formatMoney(b.hourAmount)}/> : null}
            <Row term="Tiền thuê" value={formatMoney(b.rentalAmount)} strong/>
            {b.voucherCode ? <Row term={`Voucher (${b.voucherCode})`} value={<span className="text-[#166534]">-{formatMoney(b.discountAmount)}</span>}/> : null}
            {b.voucherCode && b.discountAmount ? <Row term="Tiền thuê sau giảm" value={formatMoney(Math.max(0, (b.rentalAmount || 0) - (b.discountAmount || 0)))} strong/> : null}
            {Number(b.extraKmAmount) ? <Row term="Phí quá km" value={formatMoney(b.extraKmAmount)}/> : null}
            {Number(b.lateAmount) ? <Row term="Phí trả trễ" value={formatMoney(b.lateAmount)}/> : null}
            {Number(b.otherFeeAmount) ? <Row term={`Phí khác: ${b.otherFeeNote ?? ""}`} value={formatMoney(b.otherFeeAmount)}/> : null}
            {Number(b.fuelFeeAmount) ? <Row term="Phí xăng/pin hụt" value={formatMoney(b.fuelFeeAmount)}/> : null}
            <Row term="Cọc 40% (trả khi đặt xe)" value={<span>{formatMoney(b.depositAmount)} <b className={b.depositStatus === "PAID" ? "text-[#166534]" : "text-[#D97706]"}>({b.depositStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"})</b></span>}/>
            <Row term="Còn lại (trả trước khi nhận xe)" value={<span>{formatMoney(b.rentalRemainingAmount)} <b className={b.rentalPaymentStatus === "PAID" ? "text-[#166534]" : "text-[#D97706]"}>({b.rentalPaymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"})</b></span>}/>
            {Number(b.finalAmount) ? <Row term="Phí phát sinh khi trả xe" value={<span className="text-lg font-black text-[#FC6C26]">{formatMoney(b.finalAmount)} <b className="text-xs">({b.extraFeeStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"})</b></span>} strong/> : null}
            {b.kmLimitPerDay ? <Row term="Giới hạn km" value={`${b.kmLimitPerDay} km/ngày`}/> : null}
          </dl>
          <p className="mt-2 text-xs text-[#666666]">Mọi khoản thanh toán qua VNPay trên CarDB: cọc 40% khi đặt xe, phần còn lại trước khi nhận xe, phí phát sinh khi trả xe. Tiền hoàn và tiền thuê được chuyển khoản trong 1–3 ngày làm việc.</p>
        </section>
        <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 text-sm shadow-sm">
          <h2 className="mb-2 font-bold">{role === "owner" ? "Khách thuê" : "Chủ xe"}</h2>
          <p className="font-semibold">{role === "owner" ? b.customerName : b.ownerName}</p>
          {(role === "owner" ? b.customerPhone : b.ownerPhone) ? <a href={`tel:${role === "owner" ? b.customerPhone : b.ownerPhone}`} className="mt-1 inline-flex items-center gap-1 font-bold text-[#FC6C26]"><Icon name="call" className="text-[16px]"/>{role === "owner" ? b.customerPhone : b.ownerPhone}</a> : null}
          {b.customerNote ? <p className="mt-2 text-[#666666]">Lời nhắn của khách: {b.customerNote}</p> : null}
          {role === "customer" && b.ownerContactedAt ? <p className="mt-2 text-[#065F46]">Chủ xe đã liên hệ lúc {formatDateTime(b.ownerContactedAt)}.</p> : null}
        </section>
        {((role === "customer" || role === "owner") && ["REQUESTED", "CONFIRMED"].includes(b.status)) || (role === "admin" && ["REQUESTED", "CONFIRMED", "PICKUP_PENDING", "IN_PROGRESS", "RETURN_PENDING"].includes(b.status)) ? <button type="button" onClick={() => setAsking("cancel")} className="rounded-xl border border-[#E9E9E7] bg-white px-4 py-2 text-sm font-bold text-[#B91C1C]">Huỷ đơn thuê</button> : null}
        {role === "customer" && b.status === "IN_PROGRESS" ? (
          <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 text-sm shadow-sm">
            <h2 className="mb-1 font-bold">Trả xe</h2>
            {b.returnReportedAt
              ? <p className="text-[#065F46]">Bạn đã báo trả xe lúc {formatDateTime(b.returnReportedAt)}. Phí trễ (nếu có) được tính đến thời điểm này.</p>
              : <>
                  <p className="text-[#666666]">Khi đã giao lại xe cho chủ xe, bấm nút dưới để chốt giờ trả (dùng để tính phí trễ).</p>
                  <button type="button" disabled={busy} onClick={() => run(() => tripService.reportReturned(b.id))} className="mt-2 rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Tôi đã trả xe</button>
                </>}
          </section>
        ) : null}
        <CustomerReviewPanel bookingId={b.id} role={role}/>
        <Link to={`/cars/${b.carId}`} className="text-center text-sm font-bold text-[#666666]">Xem trang xe</Link>
      </aside>
    </div>
  </div>;
}

export default function TripDetailPage() {
    const { id } = useParams();
    return <LivePage width="max-w-6xl"><RequireAuth title="Đăng nhập để xem đơn thuê"><Trip id={id}/></RequireAuth></LivePage>;
}
