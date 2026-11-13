import { useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { tripService } from "@/services/tripService.js";
import { formatDateTime } from "@/utils/datetime.js";

/**
 * Đánh giá 2 chiều: chủ xe xem uy tín của khách (để quyết định nhận đơn) và
 * đánh giá khách sau khi chuyến hoàn tất. Khách xem được đánh giá chủ xe dành cho mình.
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
        try { await tripService.reviewCustomer(bookingId, rating, comment); await query.reload(); }
        catch (e) { setError(e.message); }
        finally { setBusy(false); }
    }

    return <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 text-sm shadow-sm">
      <h2 className="mb-2 font-bold">{role === "customer" ? "Đánh giá của chủ xe về bạn" : "Uy tín khách thuê"}</h2>
      {role !== "customer" ? (
        <p className="text-[#666666]">
          {summary.totalReviews > 0
            ? <><b className="text-[#FC6C26]">{Number(summary.averageRating).toFixed(1)}/5</b> từ {summary.totalReviews} chủ xe đã cho thuê</>
            : "Khách chưa có đánh giá nào từ chủ xe khác"}
        </p>
      ) : null}
      {data.review ? (
        <div className="mt-2 rounded-xl bg-[#F7F7F5] p-3">
          <p className="font-bold">{data.review.ownerName ?? "Chủ xe"} <span className="text-[#FC6C26]">{data.review.rating}/5</span></p>
          <p className="mt-1">{data.review.comment || "Không có nhận xét"}</p>
          <p className="mt-1 text-xs text-[#666666]">{formatDateTime(data.review.createdAt)}</p>
        </div>
      ) : role === "customer" ? <p className="text-[#666666]">Chủ xe chưa đánh giá chuyến này.</p> : null}
      {data.canReview ? (
        <form className="mt-3 flex flex-col gap-2" onSubmit={submit}>
          <label className="text-xs font-semibold text-[#666666]">Đánh giá khách cho chuyến này
            <select value={rating} onChange={event => setRating(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-[#E9E9E7] px-3 py-2 text-sm">
              {[5, 4, 3, 2, 1].map(star => <option key={star} value={star}>{star} sao</option>)}
            </select>
          </label>
          <textarea value={comment} onChange={event => setComment(event.target.value)} maxLength={1000} rows={3}
            className="w-full rounded-xl border border-[#E9E9E7] px-3 py-2 text-sm" placeholder="Khách giữ xe cẩn thận, đúng giờ..."/>
          {error ? <p role="alert" className="text-xs text-[#B91C1C]">{error}</p> : null}
          <button type="submit" disabled={busy} className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">Gửi đánh giá khách</button>
        </form>
      ) : null}
      {role !== "customer" && summary.reviews?.length ? (
        <ul className="mt-3 flex flex-col gap-2">
          {summary.reviews.filter(r => r.bookingId !== Number(bookingId)).slice(0, 3).map(r => (
            <li key={r.id} className="rounded-xl bg-[#F7F7F5] p-2 text-xs">
              <b>{r.ownerName ?? "Chủ xe"}</b> <span className="text-[#FC6C26]">{r.rating}/5</span> — {r.comment || "Không có nhận xét"}
            </li>
          ))}
        </ul>
      ) : null}
    </section>;
}
