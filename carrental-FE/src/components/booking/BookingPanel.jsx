import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Icon } from "@/components/Icon.jsx";
import { fieldClass } from "@/components/LiveUi.jsx";
import { useAuth } from "@/hooks/useAuth.js";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { tripService } from "@/services/tripService.js";
import { useSafety } from "@/components/booking/SafetyPanel.jsx";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";
import { defaultWindow, durationLabel, toApiTime, windowError } from "@/utils/rental.js";
import { LocationPicker } from "@/components/location/LocationPicker.jsx";
import { useDocuments } from "@/hooks/useAccount.js";
import { licenseState } from "@/components/account/VerificationForm.jsx";
import { locationLabel, locationPoint, useDeliveryLocation, DELIVERY_FREE_KM, DELIVERY_FEE_PER_KM } from "@/utils/delivery.js";

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
    const location = useDeliveryLocation();
    const point = locationPoint(location);
    const [mode, setMode] = useState(() => (point ? "delivery" : "self"));
    const delivery = mode === "delivery" && point ? point : null;
    const busy = useApiQuery(["availability", car.id], () => tripService.availability(car.id), { requiresAuth: false });
    const own = user && user.id === car.ownerId;
    const safety = useSafety(car.id);
    const unsafe = safety.data?.level === "UNSAFE";
    const myDocs = useDocuments();
    const kycVerified = user?.kycStatus === "VERIFIED" && licenseState(myDocs.data) === "APPROVED";

    useEffect(() => {
        const problem = windowError(pickupAt, returnAt);
        setQuote(null);
        if (problem) { setError(problem); return; }
        setError("");
        let alive = true;
        tripService.quote(car.id, toApiTime(pickupAt), toApiTime(returnAt), voucherCode.trim() || undefined, delivery)
            .then(q => alive && setQuote(q)).catch(e => alive && setError(e.message));
        return () => { alive = false; };
    }, [car.id, pickupAt, returnAt, voucherCode, delivery?.lat, delivery?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

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
                deliveryAddress: delivery ? locationLabel(location) : null,
                deliveryLatitude: delivery?.lat ?? null,
                deliveryLongitude: delivery?.lng ?? null,
            });
            navigate(`/trips/${created.id}?created=1`);
        } catch (e) {
            setError(e.message);
        } finally {
            setSending(false);
        }
    }

    const next = encodeURIComponent(`/cars/${car.id}?pickupAt=${pickupAt}&returnAt=${returnAt}`);
    return <section className="overflow-hidden rounded-[24px] border border-[#E4E2D8] bg-white shadow-sm">
    {/* Header giá nổi bật */}
    <div className="border-b border-[#ECEAE2] bg-[#FAF9F5] px-6 py-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="editorial-kicker">Đặt xe trực tuyến</span>
        <p className="text-sm"><b className="text-2xl font-extrabold tabular-nums text-[#D95018]">{formatMoney(car.rentalPricePerDay || car.pricePerDay)}</b><span className="font-medium text-[#6C6C61]">/ngày</span></p>
      </div>
      <p className="mt-1 text-right text-xs text-[#6C6C61]">{formatMoney(car.pricePerHour)}/giờ lẻ{car.weekendPricePerDay ? ` • cuối tuần ${formatMoney(car.weekendPricePerDay)}/ngày` : ""}</p>
    </div>

    <div className="p-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <label className="text-xs font-bold text-[#5C584F]">Nhận xe<input type="datetime-local" value={pickupAt} onChange={e => setPickupAt(e.target.value)} className={`${fieldClass} mt-1`}/></label>
        <label className="text-xs font-bold text-[#5C584F]">Trả xe<input type="datetime-local" value={returnAt} min={pickupAt} onChange={e => setReturnAt(e.target.value)} className={`${fieldClass} mt-1`}/></label>
      </div>
      <div className="mt-3">
        <label htmlFor="booking-voucher" className="text-xs font-bold text-[#5C584F]">Mã voucher giảm giá (tuỳ chọn)<input id="booking-voucher" type="text" placeholder="VD: CHAOBANMOI" value={voucherCode} onChange={e => setVoucherCode(e.target.value.toUpperCase())} className={`${fieldClass} mt-1`}/></label>
      </div>
      {busy.data?.length ? <p className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-[#FAF9F5] px-3 py-2 text-xs text-[#5C584F]"><Icon name="event_busy" className="text-[15px] text-[#FC6C26]"/> Xe đã có lịch: {busy.data.slice(0, 3).map(r => `${formatDateTime(r.from)} → ${formatDateTime(r.to)}`).join("; ")}</p> : null}

      <fieldset className="mt-4">
        <legend className="text-xs font-bold text-[#5C584F]">Phương thức nhận xe</legend>
        <div className="mt-1.5 grid grid-cols-2 gap-2 text-sm">
          {[["self", "Tự đến lấy xe"], ["delivery", "Giao tận nơi"]].map(([id, label]) =>
            <label key={id} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 transition ${mode === id ? "border-[#25251F] bg-[#FAF9F5] font-bold text-[#25251F]" : "border-[#D6D3CB] text-[#5C584F]"}`}>
              <input type="radio" name="pickup-mode" checked={mode === id} onChange={() => setMode(id)}/>{label}</label>)}
        </div>
        {mode === "self" ? <p className="mt-1.5 text-xs text-[#6C6C61]">Nhận xe tại địa chỉ của xe, miễn phí.</p>
          : <div className="mt-2"><p className="mb-1 text-xs text-[#6C6C61]">Miễn phí {DELIVERY_FREE_KM} km đầu, sau đó {formatMoney(DELIVERY_FEE_PER_KM)}/km.</p><LocationPicker compact/></div>}
      </fieldset>

      {quote ? (() => {
        const deliveryFee = Number(quote.deliveryFee || 0);
        const payable = Number(quote.payableRentalAmount || quote.rentalAmount) + deliveryFee;
        const deposit = Number(quote.depositAmount) || Math.min(payable, Math.ceil(payable * 0.4 / 1000) * 1000);
        return <div className="mt-4 rounded-2xl border border-[#ECEAE2] bg-[#FAF9F5] p-4 text-sm">
          <dl className="flex flex-col gap-2">
            <div className="flex justify-between"><dt className="text-[#5C584F]">Thời gian thuê</dt><dd className="font-bold text-[#25251F]">{durationLabel(quote.rentalDays, quote.rentalHours)}</dd></div>
            {quote.discountAmount ? <div className="flex justify-between text-[#047857]"><dt>Voucher {quote.voucherCode}</dt><dd className="font-bold tabular-nums">-{formatMoney(quote.discountAmount)}</dd></div> : null}
            {quote.deliveryDistanceKm != null ? <div className="flex justify-between"><dt className="text-[#5C584F]">Giao xe ~{Number(quote.deliveryDistanceKm).toLocaleString("vi-VN")} km</dt><dd className="font-bold tabular-nums">{deliveryFee ? formatMoney(deliveryFee) : "Miễn phí"}</dd></div> : null}
            <div className="flex items-baseline justify-between border-t border-[#E4E2D8] pt-2.5"><dt className="font-extrabold text-[#25251F]">Tổng tiền thuê</dt><dd className="text-lg font-extrabold tabular-nums text-[#D95018]">{formatMoney(payable)}</dd></div>
            <div className="flex justify-between"><dt className="text-[#5C584F]">Cọc 40% trả ngay</dt><dd className="font-bold tabular-nums text-[#25251F]">{formatMoney(deposit)}</dd></div>
          </dl>
          {!quote.available ? <p role="alert" className="mt-2 font-semibold text-[#B91C1C]">{quote.unavailableReason}</p> : null}
          <details className="mt-2.5 text-xs text-[#5C584F]">
            <summary className="font-bold text-[#25251F] underline decoration-[#D6D3CB] underline-offset-4 hover:decoration-[#FC6C26]">Xem chi tiết giá</summary>
            <dl className="mt-2 flex flex-col gap-1 rounded-xl bg-white p-3">
              {quote.breakdown.map(line => <div key={line}><dt>{line}</dt></div>)}
              <div className="flex justify-between"><dt>Tiền thuê gốc</dt><dd className="tabular-nums">{formatMoney(quote.rentalAmount)}</dd></div>
              {quote.includedKm ? <div className="flex justify-between"><dt>Km bao gồm</dt><dd>{quote.includedKm} km{quote.extraKmFee ? `, vượt ${formatMoney(quote.extraKmFee)}/km` : ""}</dd></div> : null}
              {quote.lateFeePerHour ? <div className="flex justify-between"><dt>Trả trễ</dt><dd>{formatMoney(quote.lateFeePerHour)}/giờ</dd></div> : null}
              <div className="flex justify-between"><dt>Còn lại (trả trước khi nhận xe)</dt><dd className="tabular-nums">{formatMoney(payable - deposit)}</dd></div>
            </dl>
          </details>
        </div>;
      })() : null}
      {error ? <p role="alert" className="mt-3 rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">{error}</p> : null}

      {own ? <p className="mt-4 rounded-xl bg-[#F3F2EC] p-3 text-center text-sm font-medium text-[#5C584F]">Đây là xe của bạn.</p>
        : !loggedIn ? <Link to={`/login?next=${next}`} className="mt-4 flex justify-center rounded-xl bg-[#FC6C26] py-3.5 text-sm font-bold text-white shadow-sm">Đăng nhập để đặt xe</Link>
        : unsafe ? <p className="mt-4 rounded-xl bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]">Xe đang có đăng kiểm/bảo hiểm hết hạn hoặc không đạt nên tạm thời không nhận đặt.</p>
        : !kycVerified ? <><p className="mt-4 text-xs leading-relaxed text-[#5C584F]">Cần được duyệt cả CCCD/Hộ chiếu và Giấy phép lái xe trước khi thuê.</p><Link to="/account/verification" className="mt-2 flex justify-center rounded-xl bg-[#FC6C26] py-3.5 text-sm font-bold text-white">Xác minh để đặt xe</Link></>
        : <>
          <label className="mt-4 block text-xs font-bold text-[#5C584F]">Lời nhắn cho chủ xe (tuỳ chọn)<textarea rows={2} maxLength={1000} value={note} onChange={e => setNote(e.target.value)} placeholder="VD: nhận xe tại nhà, cần ghế trẻ em…" className={`${fieldClass} mt-1`}/></label>
          <button type="button" disabled={!quote?.available || sending} onClick={book} className="mt-3 w-full rounded-xl bg-[#FC6C26] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#25251F] disabled:opacity-50">{sending ? "Đang gửi…" : "Gửi yêu cầu thuê xe"}</button>
        </>}
      <details className="mt-4 border-t border-[#ECEAE2] pt-3 text-xs text-[#5C584F]">
        <summary className="font-bold text-[#25251F] underline decoration-[#D6D3CB] underline-offset-4 hover:decoration-[#FC6C26]">Chính sách huỷ &amp; quy trình nhận xe</summary>
        <p className="mt-2">Huỷ trong 1 giờ sau khi cọc: miễn phí. Trước chuyến hơn 7 ngày: phí 10%. Trong 7 ngày: phí 40% giá trị chuyến.</p>
        <ol className="mt-2 grid gap-1">
          <li>1. Gửi yêu cầu và thanh toán cọc 40% qua VNPay.</li>
          <li>2. Chủ xe gọi cho bạn để thống nhất, rồi xác nhận đơn.</li>
          <li>3. Thanh toán phần còn lại trước khi nhận xe; chủ xe chụp hiện trạng, bạn kiểm tra và xác nhận.</li>
          <li>4. Trả xe: hai bên đối chiếu km, nhiên liệu, phụ phí trong biên bản trả xe.</li>
        </ol>
      </details>
    </div>
  </section>;
}
