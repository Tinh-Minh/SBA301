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
import { carService } from "@/services/vehicleService.js";
import { reviewService } from "@/services/reviewService.js";
import { formatDateTime } from "@/utils/datetime.js";

const schema = z.object({
    carId: z.coerce.number({ error: "Chọn xe đã xem" }).int().positive("Chọn xe đã xem"),
    rating: z.coerce.number({ error: "Chọn số sao" }).int().min(1, "Chọn từ 1 đến 5 sao").max(5, "Tối đa 5 sao"),
    comment: z.string().max(2000, "Nhận xét tối đa 2000 ký tự"),
});

export default function MyReviewsPage() {
    return <RequireAuth title="Đăng nhập để xem đánh giá"><ReviewScreen /></RequireAuth>;
}

function ReviewScreen() {
    const { user } = useAuth();
    const reviews = useApiQuery(["reviews", "mine", user?.id], () => reviewService.mine(user.id), { enabled: Boolean(user?.id) });
    const cars = useApiQuery(["cars", "public", "review"], () => carService.search({ size: 50 }), { requiresAuth: false });
    const create = useApiMutation(reviewService.create, reviews.reload);
    const [open, setOpen] = useState(false);
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { carId: "", rating: 5, comment: "" } });
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
        <p className="mt-1 text-sm text-[#666666]">Đánh giá xe bạn đã xem. Mỗi tài khoản đánh giá một xe một lần.</p>
      </div>
      <button type="button" onClick={() => setOpen(true)} className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white">Viết đánh giá</button>
    </div>
    <LiveState loading={reviews.loading && !reviews.data} error={reviews.error} empty={!!reviews.data && reviews.data.length === 0} label="đánh giá" onRetry={reviews.reload}/>
    <ul className="flex flex-col gap-3">{(reviews.data ?? []).map(review => <li key={review.id} className="rounded-2xl border border-[#E9E9E7] bg-white p-4">
      <p className="font-bold">{review.carName} <span className="text-sm font-semibold text-[#FC6C26]">{review.rating}/5</span></p>
      <p className="mt-1 text-sm text-[#292929]">{review.comment || "Không có nhận xét"}</p>
      <p className="mt-2 text-xs text-[#666666]">{formatDateTime(review.createdAt)}</p>
    </li>)}</ul>
    <ConfirmDialog open={open} title="Viết đánh giá xe" confirmLabel="Gửi đánh giá" busy={create.running} error={create.error?.message} onClose={() => setOpen(false)} onConfirm={form.handleSubmit(submit)}>
      <form className="flex flex-col gap-3" onSubmit={form.handleSubmit(submit)}>
        <label className="text-xs font-semibold text-[#666666]">Xe<select className="mt-1 w-full rounded-xl border border-[#E9E9E7] px-3 py-2 text-sm" {...form.register("carId")}>
          <option value="">Chọn xe</option>
          {(cars.data?.content ?? []).map(car => <option key={car.id} value={car.id}>{car.brand} {car.model} • {car.licensePlate}</option>)}
        </select></label>
        <label className="text-xs font-semibold text-[#666666]">Số sao<select className="mt-1 w-full rounded-xl border border-[#E9E9E7] px-3 py-2 text-sm" {...form.register("rating")}>{[5, 4, 3, 2, 1].map(star => <option key={star} value={star}>{star} sao</option>)}</select></label>
        <label className="text-xs font-semibold text-[#666666]">Nhận xét<textarea maxLength={2000} rows={4} className="mt-1 w-full rounded-xl border border-[#E9E9E7] px-3 py-2 text-sm" {...form.register("comment")}/></label>
        <FormErrors errors={form.formState.errors}/>
      </form>
    </ConfirmDialog>
  </div>;
}
