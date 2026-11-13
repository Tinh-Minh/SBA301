import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Icon } from "@/components/Icon.jsx";
import { fieldClass } from "@/components/LiveUi.jsx";
import { useAuth } from "@/hooks/useAuth.js";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { tripService } from "@/services/tripService.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";
import { defaultWindow, durationLabel, toApiTime, windowError } from "@/utils/rental.js";

/** Khung đặt xe trên trang chi tiết: chọn giờ → báo giá → gửi yêu cầu thuê. */
export function BookingPanel({ car }) {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { loggedIn, user } = useAuth();
    const [pickupAt, setPickupAt] = useState(() => (params.get("pickupAt") || defaultWindow().pickupAt).slice(0, 16));
    const [returnAt, setReturnAt] = useState(() => (params.get("returnAt") || defaultWindow().returnAt).slice(0, 16));
    const [voucherCode, setVoucherCode] = useState("");
    const [quote, setQuote] = useState(null);
    const [error, setError] = useState("");
    const [note, setNote] = useState("");
    const [sending, setSending] = useState(false);
    const busy = useApiQuery(["availability", car.id], () => tripService.availability(car.id), { requiresAuth: false });
    const own = user && user.id === car.ownerId;

    useEffect(() => {
        const problem = windowError(pickupAt, returnAt);
        setQuote(null);
        if (problem) { setError(problem); return; }
        setError("");
        let alive = true;
        tripService.quote(car.id, toApiTime(pickupAt), toApiTime(returnAt), voucherCode.trim() || undefined)
            .then(q => alive && setQuote(q)).catch(e => alive && setError(e.message));
        return () => { alive = false; };
    }, [car.id, pickupAt, returnAt, voucherCode]);

    async function book() {
        setSending(true);
        setError("");
        try {
            const created = await tripService.create({
                carId: car.id,
                pickupAt: toApiTime(pickupAt),
                returnAt: toApiTime(returnAt),
                customerNote: note.trim() || null,
                voucherCode: voucherCode.trim() || null,
            });
            navigate(`/trips/${created.id}?created=1`);
        } catch (e) {
            setError(e.message);
        } finally {
            setSending(false);
        }
    }

    const next = encodeURIComponent(`/cars/${car.id}?pickupAt=${pickupAt}&returnAt=${returnAt}`);
    return <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <div className="flex items-baseline justify-between gap-2">
      <h2 className="text-lg font-bold text-[#292929]">Đặt xe</h2>
      <p className="text-sm"><b className="text-xl text-[#FC6C26]">{formatMoney(car.rentalPricePerDay || car.pricePerDay)}</b><span className="text-[#666666]">/ngày</span></p>
    </div>
    <p className="text-xs text-[#666666]">{formatMoney(car.pricePerHour)}/giờ lẻ{car.weekendPricePerDay ? ` • cuối tuần ${formatMoney(car.weekendPricePerDay)}/ngày` : ""}</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      <label className="text-xs font-semibold text-[#666666]">Nhận xe<input type="datetime-local" value={pickupAt} onChange={e => setPickupAt(e.target.value)} className={`${fieldClass} mt-1`}/></label>
      <label className="text-xs font-semibold text-[#666666]">Trả xe<input type="datetime-local" value={returnAt} min={pickupAt} onChange={e => setReturnAt(e.target.value)} className={`${fieldClass} mt-1`}/></label>
    </div>
    <div className="mt-3">
      <label htmlFor="booking-voucher" className="text-xs font-semibold text-[#666666]">Mã voucher giảm giá (tuỳ chọn)<input id="booking-voucher" type="text" placeholder="VD: CHAOBANMOI" value={voucherCode} onChange={e => setVoucherCode(e.target.value.toUpperCase())} className={`${fieldClass} mt-1`}/></label>
    </div>
    {busy.data?.length ? <p className="mt-2 text-xs text-[#666666]"><Icon name="event_busy" className="text-[14px]"/> Xe đã có lịch: {busy.data.slice(0, 3).map(r => `${formatDateTime(r.from)} → ${formatDateTime(r.to)}`).join("; ")}</p> : null}

    {quote ? <dl className="mt-4 flex flex-col gap-1.5 rounded-xl bg-[#FFF7F2] p-4 text-sm">
      <div className="flex justify-between"><dt className="text-[#666666]">Thời gian thuê</dt><dd className="font-semibold">{durationLabel(quote.rentalDays, quote.rentalHours)}</dd></div>
      {quote.breakdown.map(line => <div key={line} className="flex justify-between text-xs text-[#666666]"><dt>{line}</dt></div>)}
      <div className="flex justify-between border-t border-[#FED7AA] pt-2"><dt className="font-bold">Tiền thuê gốc</dt><dd className="text-base font-bold">{formatMoney(quote.rentalAmount)}</dd></div>
      {quote.discountAmount ? <div className="flex justify-between text-xs text-[#166534]"><dt>Giảm giá voucher ({quote.voucherCode})</dt><dd className="font-bold">-{formatMoney(quote.discountAmount)}</dd></div> : null}
      <div className="flex justify-between border-t border-[#FED7AA] pt-2"><dt className="font-bold">Tiền thuê sau giảm</dt><dd className="text-lg font-black text-[#FC6C26]">{formatMoney(quote.payableRentalAmount || quote.rentalAmount)}</dd></div>
      <div className="flex justify-between"><dt className="text-[#666666]">Tiền cọc (thanh toán VNPay sau khi chủ xe xác nhận)</dt><dd className="font-semibold">{quote.depositAmount ? formatMoney(quote.depositAmount) : "Miễn cọc"}</dd></div>
      {quote.includedKm ? <div className="flex justify-between text-xs text-[#666666]"><dt>Km bao gồm</dt><dd>{quote.includedKm} km{quote.extraKmFee ? `, vượt ${formatMoney(quote.extraKmFee)}/km` : ""}</dd></div> : null}
      {quote.lateFeePerHour ? <div className="flex justify-between text-xs text-[#666666]"><dt>Trả trễ</dt><dd>{formatMoney(quote.lateFeePerHour)}/giờ</dd></div> : null}
      {!quote.available ? <p role="alert" className="mt-1 font-semibold text-[#B91C1C]">{quote.unavailableReason}</p> : null}
    </dl> : null}
    {error ? <p role="alert" className="mt-3 rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">{error}</p> : null}

    {own ? <p className="mt-4 rounded-xl bg-[#F3F4F6] p-3 text-sm text-[#374151]">Đây là xe của bạn.</p>
      : !loggedIn ? <Link to={`/login?next=${next}`} className="mt-4 flex justify-center rounded-xl bg-[#FC6C26] py-3 font-bold text-white">Đăng nhập để đặt xe</Link>
      : <>
        <label className="mt-4 block text-xs font-semibold text-[#666666]">Lời nhắn cho chủ xe (tuỳ chọn)<textarea rows={2} maxLength={1000} value={note} onChange={e => setNote(e.target.value)} placeholder="VD: nhận xe tại nhà, cần ghế trẻ em…" className={`${fieldClass} mt-1`}/></label>
        <button type="button" disabled={!quote?.available || sending} onClick={book} className="mt-3 w-full rounded-xl bg-[#FC6C26] py-3 font-bold text-white hover:bg-[#e05615] disabled:opacity-50">{sending ? "Đang gửi…" : "Gửi yêu cầu thuê xe"}</button>
      </>}
    <ol className="mt-4 grid gap-1 text-xs text-[#666666]">
      <li>1. Gửi yêu cầu, chưa phải trả tiền trên CarDB.</li>
      <li>2. Chủ xe gọi cho bạn để thống nhất, rồi xác nhận đơn.</li>
      <li>3. Khi nhận xe, chủ xe chụp hiện trạng + giấy tờ; bạn kiểm tra và xác nhận từng mục trên CarDB.</li>
      <li>4. Trả xe: hai bên đối chiếu km, nhiên liệu, phụ phí trong biên bản trả xe.</li>
    </ol>
  </section>;
}
