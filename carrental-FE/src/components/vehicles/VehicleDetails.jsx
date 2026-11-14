import { Link } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { FormErrors } from "@/components/FormErrors.jsx";
import { LiveState } from "@/components/LiveUi.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useAuth } from "@/hooks/useAuth.js";
import { carImage, carName, carTypeLabels, formatMoney, fuelTypeLabels, resolveAssetUrl, transmissionLabels } from "@/utils/labels.js";
import { formatDateTime } from "@/utils/datetime.js";
import { carService } from "@/services/vehicleService.js";
import { reviewService } from "@/services/reviewService.js";
import { tripService } from "@/services/tripService.js";
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
            ? <div className="rounded-2xl border border-[#E4E2D8] bg-white p-10 text-center">
                <p className="text-lg font-bold text-[#25251F]">Xe không tồn tại hoặc không còn hiển thị</p>
                <p className="mt-1 text-sm text-[#5C584F]">Tin đăng có thể đã hết hạn hoặc đang chờ duyệt.</p>
                <Link to="/explore" className="mt-4 inline-flex rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white">Tìm xe khác</Link>
              </div>
            : <LiveState loading={detail.loading} error={detail.error} label="thông tin xe" onRetry={detail.reload}/>;

    return <Body car={detail.data.car} />;
}

function Body({ car }) {
    const [activeImage, setActiveImage] = useState(null);
    useEffect(() => {
        const name = carName(car);
        if (name) document.title = `${name} | CarDB`;
    }, [car]);
    const features = parseFeatures(car.features);
    const monthPrice = car.rentalPricePerMonth;
    const phone = car.contactPhone || "";
    const zalo = car.contactZalo || car.contactPhone || "";
    const ownerRating = useApiQuery(["owner-rating", car.ownerId], () => reviewService.ownerRating(car.ownerId), { requiresAuth: false, enabled: Boolean(car.ownerId) });
    const rating = ownerRating.data;
    const displayedImage = resolveAssetUrl(activeImage) || carImage(car);

    return (
        <div className="flex flex-col gap-6">
        <nav aria-label="Điều hướng quay lại" className="flex items-center justify-between">
          <Link to="/explore" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5C584F] transition hover:text-[#FC6C26]">
            <Icon name="arrow_back" className="text-[16px] text-[#FC6C26]"/>Quay lại danh sách xe
          </Link>
          <span className="font-mono text-xs text-[#868379]">Mã tin #{car.id}</span>
        </nav>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
            {/* Cột trái: Hình ảnh Showroom và thông số xe */}
            <article className="overflow-hidden rounded-[24px] border border-[#E4E2D8] bg-white shadow-sm">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#1F1F1D]">
                  <img src={displayedImage} alt={carName(car)} className="h-full w-full object-cover" />
                  <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#25251F]/85 px-3 py-1 text-xs font-bold text-[#FAF8F2] backdrop-blur-md">
                      {carTypeLabels[car.carType] ?? car.carType}
                    </span>
                    {car.manufactureYear ? (
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#25251F] backdrop-blur-md">
                        Đời {car.manufactureYear}
                      </span>
                    ) : null}
                  </div>
                </div>

                {car.images?.length > 1 ? (
                    <div className="flex gap-2.5 overflow-x-auto border-b border-[#ECEAE2] bg-[#FAF9F5] p-3.5">
                        {car.images.map((image) => {
                            const url = resolveAssetUrl(image.imageUrl);
                            const selected = url === displayedImage;
                            return (
                                <button
                                    key={image.id}
                                    type="button"
                                    onClick={() => setActiveImage(url)}
                                    className={`shrink-0 overflow-hidden rounded-xl border-2 transition ${selected ? "border-[#FC6C26] shadow-sm" : "border-transparent opacity-75 hover:opacity-100"}`}
                                >
                                    <img
                                        src={url}
                                        alt=""
                                        className="h-16 w-24 object-cover"
                                    />
                                </button>
                            );
                        })}
                    </div>
                ) : null}

                <div className="flex flex-col gap-5 p-6 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <span className="editorial-kicker">Thông tin phương tiện</span>
                          <h1 className="mt-1.5 text-2xl font-extrabold text-[#25251F] sm:text-3xl">
                              {car.brand} {car.model} {car.manufactureYear ?? ""}
                          </h1>
                        </div>
                        <SafetyBadgeFor carId={car.id}/>
                    </div>

                    {/* 4-column Spec Bento Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl border border-[#ECEAE2] bg-[#FAF9F5] p-3.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#868379]">Số chỗ</span>
                        <p className="mt-1 text-base font-extrabold text-[#25251F]">{car.seats} chỗ ngồi</p>
                      </div>
                      <div className="rounded-2xl border border-[#ECEAE2] bg-[#FAF9F5] p-3.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#868379]">Truyền động</span>
                        <p className="mt-1 text-base font-extrabold text-[#25251F]">{transmissionLabels[car.transmission] ?? car.transmission}</p>
                      </div>
                      <div className="rounded-2xl border border-[#ECEAE2] bg-[#FAF9F5] p-3.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#868379]">Nhiên liệu</span>
                        <p className="mt-1 text-base font-extrabold text-[#25251F]">{fuelTypeLabels[car.fuelType] ?? car.fuelType}</p>
                      </div>
                      <div className="rounded-2xl border border-[#ECEAE2] bg-[#FAF9F5] p-3.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#868379]">Màu sắc / Loại</span>
                        <p className="mt-1 text-base font-extrabold text-[#25251F]">{car.color || (carTypeLabels[car.carType] ?? car.carType)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-[#ECEAE2] bg-[#F6F5F0] px-4 py-3 text-sm font-medium text-[#25251F]">
                        <Icon name="location_on" className="text-[20px] text-[#FC6C26]"/>
                        <span><b>Khu vực nhận xe:</b> {car.pickupAddress || [car.district, car.city].filter(Boolean).join(", ")}</span>
                    </div>

                    {car.description ? (
                        <div className="border-t border-[#ECEAE2] pt-4">
                            <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wider text-[#25251F]">Mô tả chi tiết</h2>
                            <p className="whitespace-pre-line text-sm leading-relaxed text-[#5C584F]">{car.description}</p>
                        </div>
                    ) : null}

                    {features.length ? (
                        <div className="border-t border-[#ECEAE2] pt-4">
                            <h2 className="mb-2.5 text-sm font-extrabold uppercase tracking-wider text-[#25251F]">Tiện ích trang bị</h2>
                            <ul className="flex flex-wrap gap-2">
                                {features.map((item) => (
                                    <li key={item} className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E2D8] bg-[#FAF9F5] px-3.5 py-1.5 text-xs font-bold text-[#25251F]">
                                        <span className="text-[#FC6C26]">✓</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            </article>

            {/* Cột phải: Sticky Booking Card & Chủ xe */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-24">
              <BookingPanel car={car}/>
              <aside className="rounded-[24px] border border-[#E4E2D8] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[#6C6C61]">Thông tin chủ xe</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#047857]">
                      ✓ Đã xác thực eKYC
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                      {rating?.reviewCount ? <>
                          <span className="flex text-[18px] leading-none text-[#F5A623]" aria-hidden="true">{[1, 2, 3, 4, 5].map(i => <span key={i} className={i <= Math.round(rating.averageRating) ? "" : "text-[#E4E2D8]"}>★</span>)}</span>
                          <span className="text-sm"><b>{rating.averageRating.toLocaleString("vi-VN")}</b><span className="text-[#6C6C61]">/5 · {rating.reviewCount} đánh giá</span></span>
                      </> : <span className="text-sm text-[#6C6C61]">{ownerRating.loading ? "Đang tải đánh giá…" : "Chủ xe chưa có đánh giá"}</span>}
                  </div>
                  {phone || zalo ? <div className="mt-4 grid grid-cols-2 gap-2">
                      {phone ? <a href={`tel:${phone}`} className="flex items-center justify-center gap-1.5 rounded-xl border border-[#D6D3CB] py-2.5 text-sm font-bold text-[#25251F]"><Icon name="call" className="text-[18px]"/>{phone}</a> : null}
                      {zalo ? <a href={`https://zalo.me/${zalo.replace(/\s+/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 rounded-xl border border-[#0068FF] bg-[#F0F6FF] py-2.5 text-sm font-bold text-[#0068FF]">Zalo</a> : null}
                  </div>
                  : <p className="mt-3 rounded-xl border border-[#ECEAE2] bg-[#FAF9F5] px-3.5 py-2.5 text-xs leading-relaxed text-[#5C584F]">Tên và số điện thoại chủ xe sẽ hiển thị trong đơn thuê sau khi bạn thanh toán tiền cọc.</p>}
                  {monthPrice ? <p className="mt-3 text-xs text-[#5C584F]">Thuê theo tháng: giá tham khảo <b>{formatMoney(monthPrice)}/tháng</b>, trao đổi với chủ xe sau khi đặt cọc.</p> : null}
              </aside>
            </div>
        </div>
        <SafetyPanel carId={car.id} />
        <CarReviews carId={car.id} ownerId={car.ownerId} />
        </div>
    );
}

const reviewSchema = z.object({
    rating: z.coerce.number().int().min(1, "Chọn từ 1 đến 5 sao").max(5, "Tối đa 5 sao"),
    comment: z.string().max(2000, "Nhận xét tối đa 2000 ký tự"),
});

function ReviewItem({ review, isCarOwner, onReplied }) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(review.ownerReply ?? "");
    const reply = useApiMutation(() => reviewService.reply(review.id, text), () => {
        setEditing(false);
        onReplied?.();
    });
    return <li className="rounded-2xl border border-[#ECEAE2] bg-[#FAF9F5] p-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-[#25251F]">{review.customerName} <span className="ml-1 rounded-full bg-[#FFF3EB] px-2 py-0.5 text-xs font-extrabold text-[#FC6C26]">★ {review.rating}/5</span></p>
        <span className="text-xs text-[#868379]">{formatDateTime(review.createdAt)}</span>
      </div>
      <p className="mt-2 leading-relaxed text-[#5C584F]">{review.comment || "Không có nhận xét"}</p>
      {review.ownerReply && !editing ? (
        <div className="mt-3 rounded-xl border-l-4 border-[#FC6C26] bg-white px-4 py-3">
          <p className="text-xs font-bold text-[#25251F]">Phản hồi của chủ xe</p>
          <p className="mt-1 text-sm text-[#5C584F]">{review.ownerReply}</p>
          {review.ownerRepliedAt ? <p className="mt-1 text-xs text-[#868379]">{formatDateTime(review.ownerRepliedAt)}</p> : null}
        </div>
      ) : null}
      {isCarOwner && !editing ? (
        <button type="button" onClick={() => setEditing(true)} className="mt-2 text-xs font-bold text-[#FC6C26]">
          {review.ownerReply ? "Sửa phản hồi" : "Phản hồi đánh giá"}
        </button>
      ) : null}
      {isCarOwner && editing ? (
        <form className="mt-2 flex flex-col gap-2" onSubmit={event => { event.preventDefault(); void reply.run(); }}>
          <textarea value={text} onChange={event => setText(event.target.value)} maxLength={1000} rows={3} required
            className="w-full rounded-xl border border-[#D2CFC3] bg-white px-3 py-2 text-sm" placeholder="Cảm ơn khách, giải thích hoặc phản hồi góp ý..."/>
          {reply.error ? <p role="alert" className="text-xs text-[#B91C1C]">{reply.error.message}</p> : null}
          <div className="flex gap-2">
            <button type="submit" disabled={reply.running || !text.trim()} className="rounded-xl bg-[#FC6C26] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">Gửi phản hồi</button>
            <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-[#D2CFC3] px-3 py-1.5 text-xs font-semibold">Huỷ</button>
          </div>
        </form>
      ) : null}
    </li>;
}

function CarReviews({ carId, ownerId }) {
    const { loggedIn, user } = useAuth();
    const summary = useApiQuery(["reviews", "car", carId], () => reviewService.byCar(carId), { requiresAuth: false });
    const myBookings = useApiQuery(["bookings", "my"], tripService.mine, { enabled: Boolean(loggedIn) });
    const create = useApiMutation(reviewService.create, () => {
        summary.reload();
        myBookings.reload();
    });
    const [open, setOpen] = useState(false);
    const [sentPending, setSentPending] = useState(false);
    const form = useForm({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 5, comment: "" } });
    const data = summary.data;

    const completedBooking = (myBookings.data ?? []).find(b => b.carId === Number(carId) && b.status === "COMPLETED");
    const hasCompletedTrip = Boolean(completedBooking);
    const hasReviewed = completedBooking?.reviewed;

    async function submit(values) {
        const created = await create.run({ carId, ...values });
        if (created) {
            setOpen(false);
            setSentPending(true);
            form.reset({ rating: 5, comment: "" });
        }
    }
    return <section id="reviews" className="rounded-[24px] border border-[#E4E2D8] bg-white p-6 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-extrabold text-[#25251F]">Đánh giá từ khách đã thuê {data ? `• ${Number(data.averageRating || 0).toFixed(1)}/5 (${data.totalReviews})` : ""}</h2>
      {!loggedIn ? (
        <Link to={`/login?next=/cars/${carId}`} className="text-sm font-bold text-[#FC6C26]">Đăng nhập để đánh giá</Link>
      ) : hasReviewed ? (
        <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
          ✓ Bạn đã gửi đánh giá cho xe này
        </span>
      ) : hasCompletedTrip ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
        >
          Viết đánh giá
        </button>
      ) : (
        <span className="text-xs text-[#868379]">
          Chỉ khách đã hoàn tất chuyến thuê xe này mới có thể viết đánh giá
        </span>
      )}
    </div>
    {sentPending && (
      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
        ✓ Cảm ơn bạn! Đánh giá đã được gửi và đang chờ Quản trị viên duyệt (tự hiển thị sau tối đa 48 giờ).
      </div>
    )}
    <LiveState loading={summary.loading && !data} error={summary.error} empty={!!data && !data.reviews?.length} label="đánh giá" onRetry={summary.reload}/>
    <ul className="mt-4 flex flex-col gap-3">{(data?.reviews ?? []).map(review => (
      <ReviewItem key={review.id} review={review} isCarOwner={Boolean(user?.id) && user.id === ownerId} onReplied={summary.reload}/>
    ))}</ul>
    <ConfirmDialog open={open} title="Đánh giá xe này" confirmLabel="Gửi đánh giá" busy={create.running} error={create.error?.message} onClose={() => setOpen(false)} onConfirm={form.handleSubmit(submit)}>
      <form className="flex flex-col gap-3" onSubmit={form.handleSubmit(submit)}>
        <label className="text-xs font-semibold text-[#5C584F]">Số sao<select className="mt-1 w-full rounded-xl border border-[#D2CFC3] px-3 py-2 text-sm" {...form.register("rating")}>{[5, 4, 3, 2, 1].map(star => <option key={star} value={star}>{star} sao</option>)}</select></label>
        <label className="text-xs font-semibold text-[#5C584F]">Nhận xét<textarea maxLength={2000} rows={4} className="mt-1 w-full rounded-xl border border-[#D2CFC3] px-3 py-2 text-sm" {...form.register("comment")}/></label>
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
