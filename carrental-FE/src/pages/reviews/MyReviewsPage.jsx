import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { RequireAuth } from "@/components/RequireAuth.jsx";
import { FormErrors } from "@/components/FormErrors.jsx";
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
    const { user } = useAuth();
    const reviews = useApiQuery(["reviews", "mine", user?.id], () => reviewService.mine(user.id), { enabled: Boolean(user?.id) });
    const myTrips = useApiQuery(["bookings", "my"], tripService.mine);
    const create = useApiMutation(reviewService.create, () => {
        reviews.reload();
        myTrips.reload();
    });
    const [open, setOpen] = useState(false);
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { carId: "", rating: 5, comment: "" } });

    // Lọc các xe từ những chuyến đi đã hoàn tất (COMPLETED)
    const completedTrips = (myTrips.data ?? []).filter(b => b.status === "COMPLETED");
    const reviewedCarIds = new Set((reviews.data ?? []).map(r => r.carId));
    // Danh sách xe đã thuê hoàn tất
    const eligibleCars = Array.from(
        new Map(
            completedTrips.map(b => [b.carId, { id: b.carId, name: b.carName, licensePlate: b.carLicensePlate }])
        ).values()
    );
    const unreviewedCars = eligibleCars.filter(c => !reviewedCarIds.has(c.id));

    async function submit(values) {
        const created = await create.run(values);
        if (created) {
            setOpen(false);
            form.reset({ carId: "", rating: 5, comment: "" });
        }
    }
    return <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">Đánh giá của tôi</h1>
        <p className="mt-1 text-sm text-[#666666]">Đánh giá xe bạn đã thuê và hoàn tất chuyến đi. Mỗi xe được đánh giá một lần.</p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
      >
        Viết đánh giá
      </button>
    </div>
    <LiveState loading={reviews.loading && !reviews.data} error={reviews.error} empty={!!reviews.data && reviews.data.length === 0} label="đánh giá" onRetry={reviews.reload}/>
    <ul className="flex flex-col gap-3">{(reviews.data ?? []).map(review => <li key={review.id} className="rounded-2xl border border-[#E9E9E7] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold">{review.carName} <span className="font-mono text-xs font-normal text-[#666666]">{review.carLicensePlate ? `• ${review.carLicensePlate}` : ""}</span> <span className="text-sm font-semibold text-[#FC6C26]">{review.rating}/5</span></p>
        {review.approved
          ? <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">✓ Đã duyệt hiển thị</span>
          : <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">⏳ Đang chờ Admin duyệt</span>
        }
      </div>
      <p className="mt-1 text-sm text-[#292929]">{review.comment || "Không có nhận xét"}</p>
      <p className="mt-2 text-xs text-[#666666]">{formatDateTime(review.createdAt)}</p>
    </li>)}</ul>
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
