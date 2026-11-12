import { Link } from "react-router";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { FormErrors } from "@/components/FormErrors.jsx";
import { LiveState } from "@/components/LiveUi.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useAuth } from "@/hooks/useAuth.js";
import { carImage, carName, carTypeLabels, formatMoney, fuelTypeLabels, transmissionLabels } from "@/utils/labels.js";
import { formatDateTime } from "@/utils/datetime.js";
import { carService } from "@/services/vehicleService.js";
import { reviewService } from "@/services/reviewService.js";
import { Icon } from "@/components/Icon.jsx";
import { BookingPanel } from "@/components/booking/BookingPanel.jsx";
import { SafetyBadge, SafetyPanel, useSafety } from "@/components/booking/SafetyPanel.jsx";

function SafetyBadgeFor({ carId }) {
    const { data } = useSafety(carId);
    return data ? <SafetyBadge level={data.level}/> : null;
}

export function Detail({ carId }) {
    const load = useCallback(async () => {
        const car = await carService.getPublic(carId);
        return { car };
    }, [carId]);

    const detail = useApiQuery(["vehicles", "public-detail", { carId }], load, { requiresAuth: false });

    if (!detail.data)
        return detail.error?.status === 404
            ? <div className="rounded-2xl border border-[#E9E9E7] bg-white p-10 text-center">
                <p className="text-lg font-bold text-[#292929]">Xe không tồn tại hoặc không còn hiển thị</p>
                <p className="mt-1 text-sm text-[#666666]">Tin đăng có thể đã hết hạn hoặc đang chờ duyệt.</p>
                <Link to="/explore" className="mt-4 inline-flex rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white">Tìm xe khác</Link>
              </div>
            : <LiveState loading={detail.loading} error={detail.error} label="thông tin xe" onRetry={detail.reload}/>;

    return <Body car={detail.data.car} />;
}

function Body({ car }) {
    const features = parseFeatures(car.features);
    const dayPrice = car.rentalPricePerDay || car.pricePerDay || 0;
    const monthPrice = car.rentalPricePerMonth;
    const contactName = car.contactName || car.ownerFullName || "Chủ xe";
    const phone = car.contactPhone || "";
    const zalo = car.contactZalo || car.contactPhone || "";

    return (
        <div className="flex flex-col gap-6">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            {/* Cột trái: Hình ảnh và thông số xe */}
            <article className="overflow-hidden rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
                <img src={carImage(car)} alt={carName(car)} className="h-64 w-full object-cover" />
                {car.images?.length > 1 ? (
                    <div className="flex gap-2 overflow-x-auto p-3">
                        {car.images.map((image) => (
                            <img
                                key={image.id}
                                src={image.imageUrl}
                                alt=""
                                className="h-16 w-24 shrink-0 rounded-lg object-cover"
                            />
                        ))}
                    </div>
                ) : null}
                <div className="flex flex-col gap-3 p-5">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-[#292929]">
                            {car.brand} {car.model} {car.manufactureYear ?? ""}
                        </h1>
                        <SafetyBadgeFor carId={car.id}/>
                    </div>

                    <p className="text-sm text-[#666666]">
                        {carTypeLabels[car.carType] ?? car.carType} • {car.seats} chỗ • {transmissionLabels[car.transmission] ?? car.transmission} • {fuelTypeLabels[car.fuelType] ?? car.fuelType}
                        {car.color ? ` • ${car.color}` : ""}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-[#292929]">
                        <span>📍</span>
                        <span>{car.pickupAddress || [car.district, car.city].filter(Boolean).join(", ")}</span>
                    </div>

                    {car.description ? (
                        <div className="mt-2 border-t border-[#F2F2F0] pt-3">
                            <h2 className="text-sm font-bold text-[#292929] mb-1">Mô tả chi tiết</h2>
                            <p className="whitespace-pre-line text-sm text-[#666666]">{car.description}</p>
                        </div>
                    ) : null}

                    {features.length ? (
                        <div className="mt-2 border-t border-[#F2F2F0] pt-3">
                            <h2 className="text-sm font-bold text-[#292929] mb-2">Tiện ích trang bị</h2>
                            <ul className="flex flex-wrap gap-2">
                                {features.map((item) => (
                                    <li key={item} className="rounded-full bg-[#F7F7F5] px-3 py-1 text-xs font-semibold text-[#292929]">
                                        ✓ {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            </article>

            <div className="flex flex-col gap-4">
            <BookingPanel car={car}/>
            <aside className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wide text-[#292929]">Chủ xe</h2>
                <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FC6C26] text-lg font-bold text-white">{contactName.charAt(0).toUpperCase()}</div>
                    <div>
                        <p className="font-bold text-[#292929]">{contactName}</p>
                        <span className="text-xs font-medium text-[#059669]">✓ Đã xác thực danh tính</span>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                    {phone ? <a href={`tel:${phone}`} className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E9E9E7] py-2.5 text-sm font-bold text-[#292929]"><Icon name="call" className="text-[18px]"/>{phone}</a> : null}
                    {zalo ? <a href={`https://zalo.me/${zalo.replace(/\s+/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 rounded-xl border border-[#0068FF] bg-[#F0F6FF] py-2.5 text-sm font-bold text-[#0068FF]">Zalo</a> : null}
                </div>
                {monthPrice ? <p className="mt-3 text-xs text-[#666666]">Thuê theo tháng: liên hệ chủ xe, giá tham khảo {formatMoney(monthPrice)}/tháng.</p> : null}
                <Link to="/explore" className="mt-3 block text-center text-xs font-semibold text-[#666666] hover:text-[#FC6C26]">← Xem xe khác</Link>
            </aside>
            </div>
        </div>
        <SafetyPanel carId={car.id} />
        <CarReviews carId={car.id} />
        </div>
    );
}

const reviewSchema = z.object({
    rating: z.coerce.number().int().min(1, "Chọn từ 1 đến 5 sao").max(5, "Tối đa 5 sao"),
    comment: z.string().max(2000, "Nhận xét tối đa 2000 ký tự"),
});

function CarReviews({ carId }) {
    const { loggedIn } = useAuth();
    const summary = useApiQuery(["reviews", "car", carId], () => reviewService.byCar(carId), { requiresAuth: false });
    const create = useApiMutation(reviewService.create, summary.reload);
    const [open, setOpen] = useState(false);
    const form = useForm({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 5, comment: "" } });
    const data = summary.data;
    async function submit(values) {
        const created = await create.run({ carId, ...values });
        if (created) {
            setOpen(false);
            form.reset({ rating: 5, comment: "" });
        }
    }
    return <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-[#292929]">Đánh giá từ khách đã thuê {data ? `• ${Number(data.averageRating || 0).toFixed(1)}/5 (${data.totalReviews})` : ""}</h2>
      {loggedIn ? <button type="button" title="Chỉ khách đã hoàn tất chuyến thuê xe này mới đánh giá được" onClick={() => setOpen(true)} className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white">Viết đánh giá</button> : <Link to={`/login?next=/cars/${carId}`} className="text-sm font-bold text-[#FC6C26]">Đăng nhập để đánh giá</Link>}
    </div>
    <LiveState loading={summary.loading && !data} error={summary.error} empty={!!data && !data.reviews?.length} label="đánh giá" onRetry={summary.reload}/>
    <ul className="mt-3 flex flex-col gap-3">{(data?.reviews ?? []).map(review => <li key={review.id} className="rounded-xl bg-[#F7F7F5] p-3 text-sm">
      <p className="font-bold">{review.customerName} <span className="text-[#FC6C26]">{review.rating}/5</span></p>
      <p className="mt-1">{review.comment || "Không có nhận xét"}</p>
      <p className="mt-1 text-xs text-[#666666]">{formatDateTime(review.createdAt)}</p>
    </li>)}</ul>
    <ConfirmDialog open={open} title="Đánh giá xe này" confirmLabel="Gửi đánh giá" busy={create.running} error={create.error?.message} onClose={() => setOpen(false)} onConfirm={form.handleSubmit(submit)}>
      <form className="flex flex-col gap-3" onSubmit={form.handleSubmit(submit)}>
        <label className="text-xs font-semibold text-[#666666]">Số sao<select className="mt-1 w-full rounded-xl border border-[#E9E9E7] px-3 py-2 text-sm" {...form.register("rating")}>{[5, 4, 3, 2, 1].map(star => <option key={star} value={star}>{star} sao</option>)}</select></label>
        <label className="text-xs font-semibold text-[#666666]">Nhận xét<textarea maxLength={2000} rows={4} className="mt-1 w-full rounded-xl border border-[#E9E9E7] px-3 py-2 text-sm" {...form.register("comment")}/></label>
        <FormErrors errors={form.formState.errors}/>
      </form>
    </ConfirmDialog>
  </section>;
}

function parseFeatures(raw) {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
        return String(raw).split(",").map((item) => item.trim()).filter(Boolean);
    }
}
