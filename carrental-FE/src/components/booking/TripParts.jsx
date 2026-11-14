import { Link } from "react-router";
import { Icon } from "@/components/Icon.jsx";
import { StatusBadge } from "@/components/owner/StatusBadge.jsx";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney, resolveAssetUrl } from "@/utils/labels.js";
import { bookingStatusMeta, durationLabel } from "@/utils/rental.js";

const steps = [
    { id: "REQUESTED", label: "Gửi yêu cầu" },
    { id: "CONTACTED", label: "Chủ xe liên hệ" },
    { id: "CONFIRMED", label: "Xác nhận đơn" },
    { id: "PICKUP", label: "Nhận xe" },
    { id: "IN_PROGRESS", label: "Đang thuê" },
    { id: "RETURN", label: "Trả xe" },
    { id: "COMPLETED", label: "Hoàn tất" },
];

function reached(b) {
    const order = { REQUESTED: 0, CONFIRMED: 2, PICKUP_PENDING: 3, IN_PROGRESS: 4, RETURN_PENDING: 5, COMPLETED: 6 };
    let index = order[b.status] ?? 0;
    if (b.status === "REQUESTED" && b.ownerContactedAt) index = 1;
    return index;
}

/** Thanh tiến trình đơn thuê. */
export function TripTimeline({ booking }) {
    if (["REJECTED", "CANCELLED", "EXPIRED"].includes(booking.status)) return null;
    const done = booking.status === "COMPLETED";
    const current = reached(booking);
    return <ol className="flex items-start rounded-2xl border border-[#ECEAE2] bg-[#FAF9F5] p-4" aria-label="Tiến trình đơn thuê">{steps.map((s, i) => {
        const passed = done || i < current;
        const now = !done && i === current;
        return <li key={s.id} aria-current={now ? "step" : undefined} className="relative flex flex-1 flex-col items-center gap-2 text-center">
          {i > 0 ? <span aria-hidden="true" className={`absolute top-[13px] h-0.5 ${passed || now ? "bg-[#25251F]" : "bg-[#E4E2D8]"}`} style={{ right: "calc(50% + 18px)", width: "calc(100% - 36px)" }}/> : null}
          <span className={`relative z-[1] flex size-7 items-center justify-center rounded-full text-xs font-extrabold ${passed ? "bg-[#25251F] text-white" : now ? "bg-[#FC6C26] text-white ring-4 ring-[#FC6C26]/20" : "bg-white text-[#868379] ring-1 ring-[#D6D3CB]"}`}>{passed ? <Icon name="check" className="text-[15px]"/> : i + 1}</span>
          <span className={`px-1 text-[11px] leading-tight sm:text-xs ${now ? "font-extrabold text-[#25251F]" : passed ? "font-medium text-[#5C584F]" : "text-[#868379]"}`}>{s.label}</span>
        </li>;
    })}</ol>;
}

/** Thẻ đơn thuê trong danh sách. */
export function TripCard({ booking, role, highlight }) {
    return <Link to={`/trips/${booking.id}`} className={`group flex gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#25251F] ${highlight ? "border-[#E4E2D8] shadow-[inset_4px_0_0_#FC6C26]" : "border-[#E4E2D8]"}`}>
    <img src={resolveAssetUrl(booking.carImageUrl) || "/images/pricing-sedan.webp"} alt="" className="hidden h-22 w-32 shrink-0 rounded-xl bg-[#F3F3EE] object-cover sm:block"/>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-extrabold text-[#25251F] group-hover:text-[#FC6C26]">{booking.carName} <span className="ml-1 font-mono text-xs font-medium text-[#868379]">{booking.bookingCode}</span></p>
        <StatusBadge meta={bookingStatusMeta[booking.status]}/>
      </div>
      <p className="mt-1 text-sm text-[#5C584F]">{formatDateTime(booking.pickupAt)} → {formatDateTime(booking.returnAt)} • {durationLabel(booking.rentalDays, booking.rentalHours)}</p>
      <p className="mt-1.5 flex flex-wrap justify-between gap-2 text-sm"><span className="text-[#6C6C61]">{role === "owner" ? `Khách: ${booking.customerName}` : `Chủ xe: ${booking.ownerName ?? "hiện sau khi cọc"}`}</span><b className="tabular-nums font-extrabold text-[#D95018]">{formatMoney(booking.finalAmount ?? booking.rentalAmount)}</b></p>
      {highlight ? <p className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-[#FFF3EB] px-2.5 py-0.5 text-xs font-bold text-[#B45309]">→ {highlight}</p> : null}
    </div>
  </Link>;
}

/** Việc cần làm tiếp theo của mỗi bên — dùng cho danh sách và bảng theo dõi. */
export function nextAction(booking, role) {
    const handover = (booking.handovers ?? []).at(-1);
    if (role === "owner") {
        if (booking.status === "REQUESTED") return booking.ownerContactedAt ? "Đã liên hệ – hãy xác nhận hoặc từ chối" : "Gọi cho khách và xác nhận đã liên hệ";
        if (booking.status === "CONFIRMED") return booking.rentalPaymentStatus && booking.rentalPaymentStatus !== "PAID" ? "Chờ khách thanh toán phần còn lại" : "Lập biên bản nhận xe khi giao xe";
        if (booking.status === "IN_PROGRESS") return "Lập biên bản trả xe khi nhận lại xe";
        if (handover?.status === "DISPUTED") return "Khách yêu cầu sửa biên bản";
        if (handover?.status === "SUBMITTED") return "Chờ khách xác nhận biên bản";
    } else {
        if (booking.status === "REQUESTED") return booking.ownerContactedAt ? "Chủ xe đã liên hệ, chờ xác nhận" : "Chờ chủ xe liên hệ";
        if (booking.status === "CONFIRMED" && booking.rentalPaymentStatus && booking.rentalPaymentStatus !== "PAID") return "Thanh toán phần còn lại trước khi nhận xe";
        if (handover?.status === "SUBMITTED") return "Kiểm tra và xác nhận biên bản";
        if (handover?.status === "DISPUTED") return "Chờ chủ xe sửa biên bản";
        if (booking.status === "COMPLETED" && !booking.reviewed) return "Đánh giá chuyến đi";
    }
    return null;
}
