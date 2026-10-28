import { DetailItem } from "@/components/DetailItem.jsx";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useCallback, useState } from "react";
import { useAuth } from "@/hooks/useAuth.js";
import { DateTimeField } from "@/components/DateField.jsx";
import { LiveState, Primary, fieldClass } from "@/components/LiveUi.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatDateTime, hoursBetween, parseQueryDateTime, toInputDateTime } from "@/utils/datetime.js";
import { carImage, carName, carTypeLabels, formatMoney, fuelTypeLabels, rentalTypeLabels, transmissionLabels } from "@/utils/labels.js";
import { carService } from "@/services/vehicleService.js";
import { rentalService } from "@/services/bookingService.js";
import { slotService } from "@/services/slotService.js";
import { CarReviews } from "@/components/reviews/CarReviews.jsx";

export function Detail({ carId }) {
    const [params] = useSearchParams();
    const slotId = params.get("slotId");
    const load = useCallback(async () => {
        const [car, slot] = await Promise.all([
            carService.getPublic(carId),
            slotId ? slotService.getById(slotId) : Promise.resolve(null),
        ]);
        return { car, slot };
    }, [carId, slotId]);
    const detail = useApiQuery(["vehicles", "public-detail", { carId, slotId }], load, { requiresAuth: false });
    if (!detail.data)
        return <LiveState loading={detail.loading} error={detail.error} label="thông tin xe" onRetry={detail.reload}/>;
    return <Body car={detail.data.car} slot={detail.data.slot} presetStart={params.get("start")} presetEnd={params.get("end")}/>;
}

function Body({ car, slot, presetStart, presetEnd }) {
    const navigate = useNavigate();
    const { loggedIn } = useAuth();
    function continueAsMember(action) {
        if (loggedIn) {
            action();
            return;
        }
        const next = `${window.location.pathname}${window.location.search}`;
        navigate(`/login?next=${encodeURIComponent(next)}`);
    }
    const options = slot?.rentalOption === "HOURLY" ? ["HOURLY"] : slot?.rentalOption === "DAILY" ? ["DAILY"] : ["DAILY", "HOURLY"];
    const [type, setType] = useState(options[0]);
    const [startTime, setStartTime] = useState(parseQueryDateTime(presetStart) || toInputDateTime(slot?.startTime));
    const [endTime, setEndTime] = useState(parseQueryDateTime(presetEnd) || "");
    const [voucher, setVoucher] = useState("");
    const [priced, setPriced] = useState(null);
    const quote = useApiMutation(async () => {
        const result = await rentalService.quote({ carSlotId: slot.id, rentalType: type, startTime: new Date(startTime), endTime: new Date(endTime), voucherCode: voucher });
        setPriced(result);
        return result;
    });
    const features = parseFeatures(car.features);
    function goCheckout() {
        const search = new URLSearchParams({ slotId: String(slot.id), start: startTime, end: endTime, type, voucher });
        navigate(`/booking/confirm?${search}`);
    }
    return <div className="flex flex-col gap-6">
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
    <article className="overflow-hidden rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
      <img src={carImage(car)} alt={carName(car)} className="h-64 w-full object-cover"/>
      {car.images?.length > 1 ? <div className="flex gap-2 overflow-x-auto p-3">{car.images.map(image => <img key={image.id} src={image.imageUrl} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover"/>)}</div> : null}
      <div className="flex flex-col gap-3 p-5">
        <h1 className="text-2xl font-bold text-[#292929]">{car.brand} {car.model} {car.manufactureYear ?? ""}</h1>
        <p className="text-sm text-[#666666]">{carTypeLabels[car.carType] ?? car.carType} • {car.seats} chỗ • {transmissionLabels[car.transmission] ?? car.transmission} • {fuelTypeLabels[car.fuelType] ?? car.fuelType}{car.color ? ` • ${car.color}` : ""}</p>
        <p className="text-sm text-[#292929]">{[car.pickupAddress, car.district, car.city].filter(Boolean).join(", ")}</p>
        <p className="text-sm font-bold text-[#FC6C26]">{formatMoney(car.pricePerHour)}/giờ • {formatMoney(car.pricePerDay)}/ngày • cọc {formatMoney(car.depositAmount)}</p>
        {car.kmLimitPerDay ? <p className="text-xs text-[#666666]">Giới hạn {car.kmLimitPerDay} km/ngày, vượt {formatMoney(car.extraKmFee)}/km.</p> : null}
        {car.description ? <p className="whitespace-pre-line text-sm text-[#666666]">{car.description}</p> : null}
        {features.length ? <ul className="flex flex-wrap gap-2">{features.map(item => <li key={item} className="rounded-full bg-[#F7F7F5] px-3 py-1 text-xs font-semibold text-[#292929]">{item}</li>)}</ul> : null}
        <p className="text-xs text-[#666666]">Chủ xe: {car.ownerFullName || `#${car.ownerId}`}</p>
      </div>
    </article>
    <aside className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
      {slot ? <>
        <h2 className="text-lg font-bold text-[#292929]">Đặt khung giờ #{slot.id}</h2>
        <p className="mt-1 text-xs text-[#666666]">Mở từ {formatDateTime(slot.startTime)} đến {formatDateTime(slot.endTime)} • {rentalTypeLabels[slot.rentalOption]} • tối thiểu {slot.minRentalHours} giờ</p>
        <div className="mt-4 grid gap-3">
          <label className="text-xs font-semibold text-[#666666]">Hình thức thuê
            <select value={type} onChange={event => setType(event.target.value)} className={`${fieldClass} mt-1`}>{options.map(option => <option key={option} value={option}>{rentalTypeLabels[option]}</option>)}</select>
          </label>
          <label className="text-xs font-semibold text-[#666666]">Nhận xe<DateTimeField value={startTime} onChange={event => setStartTime(event.target.value)} className={`${fieldClass} mt-1`}/></label>
          <label className="text-xs font-semibold text-[#666666]">Trả xe<DateTimeField value={endTime} onChange={event => setEndTime(event.target.value)} className={`${fieldClass} mt-1`}/></label>
          <label className="text-xs font-semibold text-[#666666]">Mã voucher (nếu có)<input value={voucher} onChange={event => setVoucher(event.target.value.toUpperCase())} className={`${fieldClass} mt-1 uppercase`} placeholder="CARDB10"/></label>
          {startTime && endTime ? <p className="text-xs text-[#666666]">Thời lượng khoảng {hoursBetween(startTime, endTime).toFixed(1)} giờ.</p> : null}
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!startTime || !endTime || quote.running} onClick={() => continueAsMember(() => void quote.run())} className="rounded-xl border border-[#E9E9E7] px-4 py-2 text-sm font-bold disabled:opacity-50">Xem giá</button>
            <Primary disabled={!startTime || !endTime} onClick={() => continueAsMember(goCheckout)}>Tiếp tục đặt xe</Primary>
          </div>
          {quote.error ? <p className="text-sm text-[#B91C1C]">{quote.error.message}</p> : null}
          {priced ? <QuoteBox quote={priced}/> : null}
        </div>
      </> : <>
        <h2 className="text-lg font-bold text-[#292929]">Chưa chọn khung giờ</h2>
        <p className="mt-2 text-sm text-[#666666]">Xe chỉ đặt được trong khung giờ chủ xe đang mở.</p>
        <Link to="/explore" className="mt-4 inline-flex font-bold text-[#FC6C26]">Tìm khung giờ trống</Link>
      </>}
    </aside>
    </div>
    <CarReviews ownerId={car.ownerId} ownerName={car.ownerFullName}/>
  </div>;
}

function QuoteBox({ quote }) {
    if (!quote?.totalAmount && quote?.totalAmount !== 0)
        return null;
    return <dl className="grid grid-cols-2 gap-2 rounded-xl bg-[#FFF7F2] p-3 text-sm">
    <DetailItem term="Đơn giá" value={formatMoney(quote.unitPrice)}/>
    <DetailItem term="Số lượng" value={`${quote.quantity} ${quote.rentalType === "HOURLY" ? "giờ" : "ngày"}`}/>
    <DetailItem term="Tiền thuê" value={formatMoney(quote.rentalAmount)}/>
    <DetailItem term="Giảm giá" value={formatMoney(quote.discountAmount)}/>
    <DetailItem term="Tổng thanh toán" value={formatMoney(quote.totalAmount)}/>
    <DetailItem term="Tiền cọc" value={formatMoney(quote.depositAmount)}/>
  </dl>;
}



function parseFeatures(raw) {
    if (!raw)
        return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : [];
    }
    catch {
        return String(raw).split(",").map(item => item.trim()).filter(Boolean);
    }
}
