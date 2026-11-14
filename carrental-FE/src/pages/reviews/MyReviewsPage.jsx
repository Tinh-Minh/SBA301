import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { RequireAuth } from "@/components/RequireAuth.jsx";
import { FormErrors } from "@/components/FormErrors.jsx";
import { Icon } from "@/components/Icon.jsx";
import { LiveState } from "@/components/LiveUi.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useAuth } from "@/hooks/useAuth.js";
import { tripService } from "@/services/tripService.js";
import { reviewService } from "@/services/reviewService.js";
import { formatDateTime } from "@/utils/datetime.js";

const schema = z.object({
    carId: z.coerce.number({ error: "Chọn xe đã thuê" }).int().positive("Chọn xe đã thuê"),
    rating: z.coerce.number({ error: "Chọn số sao" }).int().min(1, "Chọn từ 1 đến 5 sao").max(5, "Tối đa 5 sao"),
    comment: z.string().max(2000, "Nhận xét tối đa 2000 ký tự"),
});

export default function MyReviewsPage() {
    return <RequireAuth title="Đăng nhập để xem đánh giá"><ReviewScreen /></RequireAuth>;
}

function ReviewScreen() {
    const { user, isOwner } = useAuth();
    const [tab, setTab] = useState("received"); // "received" | "car" | "given"

    const reviews = useApiQuery(
        ["reviews", "mine", user?.id],
        () => reviewService.mine(user.id),
        { enabled: Boolean(user?.id) }
    );
    const reputation = useApiQuery(
        ["reviews", "customer-reputation", user?.id],
        () => reviewService.customerReputation(user.id),
        { enabled: Boolean(user?.id) }
    );
    const givenToCustomers = useApiQuery(
        ["reviews", "given-to-customers", user?.id],
        () => reviewService.myGivenCustomerReviews(),
        { enabled: Boolean(user?.id && isOwner) }
    );
    const myTrips = useApiQuery(["bookings", "my"], tripService.mine);

    const create = useApiMutation(reviewService.create, () => {
        reviews.reload();
        myTrips.reload();
    });
    const [open, setOpen] = useState(false);
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { carId: "", rating: 5, comment: "" } });

    const completedTrips = (myTrips.data ?? []).filter(b => b.status === "COMPLETED");
    const reviewedCarIds = new Set((reviews.data ?? []).map(r => r.carId));
    const eligibleCars = Array.from(
        new Map(
            completedTrips.map(b => [b.carId, { id: b.carId, name: b.carName, licensePlate: b.carLicensePlate }])
        ).values()
    );
    const unreviewedCars = eligibleCars.filter(c => !reviewedCarIds.has(c.id));

    const repSummary = reputation.data;
    const receivedReviews = repSummary?.reviews ?? [];
    const myCarReviews = reviews.data ?? [];
    const myGivenCustReviews = givenToCustomers.data ?? [];

    async function submit(values) {
        const created = await create.run(values);
        if (created) {
            setOpen(false);
            form.reset({ carId: "", rating: 5, comment: "" });
        }
    }

    return <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#25251F]">Đánh giá & Uy tín của tôi</h1>
          <p className="mt-1 text-sm text-[#666666]">
            Theo dõi đánh giá từ các chủ xe dành cho bạn và các đánh giá bạn đã gửi sau chuyến đi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl bg-[#FC6C26] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#E15517]"
        >
          Viết đánh giá xe
        </button>
      </div>

      {/* Thẻ tổng quan điểm uy tín khách thuê */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E4E2D8] bg-[#FAF9F5] p-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#FFF3EB] text-[#FC6C26]">
            <Icon name="verified" className="text-[24px]"/>
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#868379]">
              Điểm uy tín người thuê
            </p>
            <p className="mt-0.5 text-lg font-extrabold text-[#25251F]">
              {repSummary?.totalReviews > 0 ? (
                <>
                  <span className="text-[#FC6C26]">{Number(repSummary.averageRating).toFixed(1)} / 5 ★</span>
                  <span className="ml-2 text-sm font-semibold text-[#5C584F]">
                    ({repSummary.totalReviews} đánh giá đã duyệt từ chủ xe)
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold text-[#6C6C61]">
                  Chưa có đánh giá nào từ chủ xe
                </span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Tabs chuyển đổi */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("received")}
          className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
            tab === "received"
              ? "bg-[#25251F] text-[#FAF8F2]"
              : "border border-[#E4E2D8] bg-white text-[#5C584F] hover:border-[#25251F]"
          }`}
        >
          Chủ xe đánh giá tôi ({receivedReviews.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("car")}
          className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
            tab === "car"
              ? "bg-[#25251F] text-[#FAF8F2]"
              : "border border-[#E4E2D8] bg-white text-[#5C584F] hover:border-[#25251F]"
          }`}
        >
          Đánh giá xe tôi đã gửi ({myCarReviews.length})
        </button>
        {isOwner ? (
          <button
            type="button"
            onClick={() => setTab("given")}
            className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
              tab === "given"
                ? "bg-[#25251F] text-[#FAF8F2]"
                : "border border-[#E4E2D8] bg-white text-[#5C584F] hover:border-[#25251F]"
            }`}
          >
            Đánh giá khách thuê tôi đã gửi ({myGivenCustReviews.length})
          </button>
        ) : null}
      </div>

      {tab === "received" ? (
        <>
          <LiveState
            loading={reputation.loading && !reputation.data}
            error={reputation.error}
            empty={!!reputation.data && receivedReviews.length === 0}
            label="đánh giá từ chủ xe"
            onRetry={reputation.reload}
          />
          <ul className="flex flex-col gap-3">
            {receivedReviews.map(r => (
              <li key={r.id} className="rounded-2xl border border-[#E4E2D8] bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-[#25251F]">
                      {r.ownerName ? `Chủ xe ${r.ownerName}` : "Chủ xe"}{" "}
                      <span className="ml-1 text-sm font-extrabold text-[#FC6C26]">{r.rating}/5 ★</span>
                    </p>
                    <p className="mt-0.5 text-xs text-[#666666]">
                      {r.carName ? `${r.carName} • ` : ""}
                      <Link to={`/trips/${r.bookingId}`} className="font-mono font-semibold text-[#FC6C26] hover:underline">
                        {r.bookingCode || `Đơn #${r.bookingId}`}
                      </Link>
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    ✓ Đã xác thực chuyến đi
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#292929]">{r.comment || "Khách thuê uy tín, giữ xe cẩn thận."}</p>
                <p className="mt-2 text-xs text-[#666666]">{formatDateTime(r.createdAt)}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {tab === "car" ? (
        <>
          <LiveState
            loading={reviews.loading && !reviews.data}
            error={reviews.error}
            empty={!!reviews.data && myCarReviews.length === 0}
            label="đánh giá xe đã gửi"
            onRetry={reviews.reload}
          />
          <ul className="flex flex-col gap-3">
            {myCarReviews.map(review => (
              <li key={review.id} className="rounded-2xl border border-[#E4E2D8] bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-[#25251F]">
                    {review.carName}{" "}
                    <span className="font-mono text-xs font-normal text-[#666666]">
                      {review.carLicensePlate ? `• ${review.carLicensePlate}` : ""}
                    </span>{" "}
                    <span className="text-sm font-semibold text-[#FC6C26]">{review.rating}/5 ★</span>
                  </p>
                  {review.approved ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      ✓ Đã duyệt hiển thị
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
                      ⏳ Đang chờ Admin duyệt
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-[#292929]">{review.comment || "Không có nhận xét"}</p>
                <p className="mt-2 text-xs text-[#666666]">{formatDateTime(review.createdAt)}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {tab === "given" && isOwner ? (
        <>
          <LiveState
            loading={givenToCustomers.loading && !givenToCustomers.data}
            error={givenToCustomers.error}
            empty={!!givenToCustomers.data && myGivenCustReviews.length === 0}
            label="đánh giá khách thuê đã gửi"
            onRetry={givenToCustomers.reload}
          />
          <ul className="flex flex-col gap-3">
            {myGivenCustReviews.map(r => (
              <li key={r.id} className="rounded-2xl border border-[#E4E2D8] bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-[#25251F]">
                      Khách thuê: {r.customerName || `#${r.customerId}`}{" "}
                      <span className="ml-1 text-sm font-extrabold text-[#FC6C26]">{r.rating}/5 ★</span>
                    </p>
                    <p className="mt-0.5 text-xs text-[#666666]">
                      {r.carName ? `${r.carName} • ` : ""}
                      <Link to={`/trips/${r.bookingId}`} className="font-mono font-semibold text-[#FC6C26] hover:underline">
                        {r.bookingCode || `Đơn #${r.bookingId}`}
                      </Link>
                    </p>
                  </div>
                  {r.approved ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      ✓ Đã duyệt hiển thị
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
                      ⏳ Đang chờ Admin duyệt
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-[#292929]">{r.comment || "Không có nhận xét"}</p>
                <p className="mt-2 text-xs text-[#666666]">{formatDateTime(r.createdAt)}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <ConfirmDialog
        open={open}
        title="Viết đánh giá xe"
        confirmLabel={unreviewedCars.length === 0 ? "Đóng" : "Gửi đánh giá"}
        busy={create.running}
        error={create.error?.message}
        onClose={() => setOpen(false)}
        onConfirm={unreviewedCars.length === 0 ? () => setOpen(false) : form.handleSubmit(submit)}
      >
        {eligibleCars.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm font-medium text-[#292929]">Bạn chưa có chuyến thuê xe nào đã hoàn tất để đánh giá.</p>
            <p className="mt-1 text-xs text-[#666666]">Chỉ những xe bạn đã thuê và hoàn thành chuyến đi mới có thể gửi đánh giá.</p>
          </div>
        ) : unreviewedCars.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm font-medium text-[#292929]">Bạn đã đánh giá tất cả các xe đã thuê hoàn tất.</p>
            <p className="mt-1 text-xs text-[#666666]">Mỗi chiếc xe chỉ được gửi đánh giá một lần.</p>
          </div>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={form.handleSubmit(submit)}>
            <label className="text-xs font-semibold text-[#666666]">Xe đã thuê
              <select className="mt-1 w-full rounded-xl border border-[#E9E9E7] px-3 py-2 text-sm" {...form.register("carId")}>
                <option value="">-- Chọn xe đã hoàn tất chuyến đi --</option>
                {eligibleCars.map(car => (
                  <option key={car.id} value={car.id} disabled={reviewedCarIds.has(car.id)}>
                    {car.name} {car.licensePlate ? `• ${car.licensePlate}` : ""} {reviewedCarIds.has(car.id) ? "(Đã đánh giá)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-[#666666]">Số sao
              <select className="mt-1 w-full rounded-xl border border-[#E9E9E7] px-3 py-2 text-sm" {...form.register("rating")}>
                {[5, 4, 3, 2, 1].map(star => <option key={star} value={star}>{star} sao</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-[#666666]">Nhận xét
              <textarea maxLength={2000} rows={4} placeholder="Chia sẻ cảm nhận về chuyến đi, chất lượng xe..." className="mt-1 w-full rounded-xl border border-[#E9E9E7] px-3 py-2 text-sm" {...form.register("comment")}/>
            </label>
            <FormErrors errors={form.formState.errors}/>
          </form>
        )}
      </ConfirmDialog>
    </div>;
}
