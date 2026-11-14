import { useState } from "react";
import { Link } from "react-router";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { reviewService } from "@/services/reviewService.js";
import { tripService } from "@/services/tripService.js";
import { formatDateTime } from "@/utils/datetime.js";

/**
 * Đánh giá 2 chiều: chủ xe xem uy tín của khách (để quyết định nhận đơn) và
 * đánh giá khách sau khi chuyến hoàn tất (Admin kiểm duyệt trước khi hiển thị công khai).
 * Khách xem được đánh giá chủ xe dành cho mình.
 */
export function CustomerReviewPanel({ bookingId, role }) {
    const query = useApiQuery(["trip", bookingId, "customer-review"], () => tripService.customerReview(bookingId));
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const data = query.data;
    if (!data || (role !== "owner" && role !== "customer" && role !== "admin")) return null;
    const summary = data.customer;

    async function submit(event) {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
            await tripService.reviewCustomer(bookingId, rating, comment);
            await query.reload();
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    async function adminApprove(reviewId) {
        setBusy(true);
        setError("");
        try {
            await reviewService.approveCustomerReview(reviewId);
            await query.reload();
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    async function adminRemove(reviewId) {
        setBusy(true);
        setError("");
        try {
            await reviewService.removeCustomerReview(reviewId);
            await query.reload();
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    return <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 text-sm shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-[#25251F]">
          {role === "customer" ? "Đánh giá của chủ xe về bạn" : "Uy tín & Đánh giá khách thuê"}
        </h2>
        {role === "customer" ? (
          <Link to="/reviews" className="text-xs font-bold text-[#FC6C26] hover:underline">
            Xem tất cả →
          </Link>
        ) : role === "admin" ? (
          <Link to="/admin/reviews" className="text-xs font-bold text-[#FC6C26] hover:underline">
            Trang kiểm duyệt →
          </Link>
        ) : null}
      </div>

      <p className="mt-1 text-xs text-[#666666]">
        {summary?.totalReviews > 0 ? (
          <>
            Điểm uy tín: <b className="text-[#FC6C26]">{Number(summary.averageRating).toFixed(1)}/5 ★</b> từ{" "}
            <b>{summary.totalReviews}</b> chủ xe (đã được Admin duyệt)
          </>
        ) : (
          "Khách thuê chưa có đánh giá nào đã duyệt từ các chủ xe"
        )}
      </p>

      {data.review ? (
        <div className="mt-3 rounded-xl border border-[#ECEAE2] bg-[#FAF9F5] p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold text-[#25251F]">
              {data.review.ownerName ?? "Chủ xe"}{" "}
              <span className="text-[#FC6C26]">{data.review.rating}/5 ★</span>
            </p>
            {data.review.approved ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                ✓ Đã duyệt hiển thị
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-[11px] font-semibold text-yellow-700">
                ⏳ Chờ Admin duyệt
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-[#292929]">{data.review.comment || "Không có nhận xét"}</p>
          <p className="mt-1 text-xs text-[#666666]">{formatDateTime(data.review.createdAt)}</p>
          {role === "admin" ? (
            <div className="mt-2.5 flex flex-wrap gap-2 border-t border-[#ECEAE2] pt-2.5">
              {!data.review.approved ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => adminApprove(data.review.id)}
                  className="rounded-lg border border-green-200 bg-white px-3 py-1 text-xs font-bold text-green-700 hover:bg-green-50 disabled:opacity-50"
                >
                  Duyệt đánh giá
                </button>
              ) : null}
              <button
                type="button"
                disabled={busy}
                onClick={() => adminRemove(data.review.id)}
                className="rounded-lg border border-[#F3C5C5] bg-white px-3 py-1 text-xs font-bold text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-50"
              >
                Gỡ đánh giá
              </button>
            </div>
          ) : null}
        </div>
      ) : role === "customer" ? (
        <p className="mt-2 text-xs text-[#666666]">Chưa có đánh giá hiển thị cho chuyến này.</p>
      ) : null}

      {data.canReview ? (
        <form className="mt-3 flex flex-col gap-2" onSubmit={submit}>
          <label className="text-xs font-semibold text-[#666666]">Đánh giá khách thuê cho chuyến này
            <select value={rating} onChange={event => setRating(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-[#E9E9E7] px-3 py-2 text-sm">
              {[5, 4, 3, 2, 1].map(star => <option key={star} value={star}>{star} sao</option>)}
            </select>
          </label>
          <textarea value={comment} onChange={event => setComment(event.target.value)} maxLength={1000} rows={3}
            className="w-full rounded-xl border border-[#E9E9E7] px-3 py-2 text-sm" placeholder="Khách giữ xe cẩn thận, đúng giờ..."/>
          {error ? <p role="alert" className="text-xs text-[#B91C1C]">{error}</p> : null}
          <button type="submit" disabled={busy} className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
            {busy ? "Đang gửi…" : "Gửi đánh giá khách thuê"}
          </button>
          <p className="text-[11px] text-[#868379]">Đánh giá sẽ được Admin kiểm duyệt trước khi hiển thị công khai trên hồ sơ khách thuê.</p>
        </form>
      ) : null}

      {error && !data.canReview ? <p role="alert" className="mt-2 text-xs text-[#B91C1C]">{error}</p> : null}

      {summary?.reviews?.filter(r => r.bookingId !== Number(bookingId)).length ? (
        <div className="mt-3 border-t border-[#F1F1EF] pt-3">
          <p className="mb-1.5 text-xs font-bold text-[#5C584F]">Nhận xét từ các chuyến trước:</p>
          <ul className="flex flex-col gap-2">
            {summary.reviews.filter(r => r.bookingId !== Number(bookingId)).slice(0, 3).map(r => (
              <li key={r.id} className="rounded-xl bg-[#F7F7F5] p-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <b>{r.ownerName ?? "Chủ xe"}</b>
                  <span className="font-bold text-[#FC6C26]">{r.rating}/5 ★</span>
                </div>
                <p className="mt-0.5 text-[#292929]">{r.comment || "Không có nhận xét"}</p>
                {r.carName ? <p className="mt-0.5 text-[11px] text-[#868379]">{r.carName}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>;
}
