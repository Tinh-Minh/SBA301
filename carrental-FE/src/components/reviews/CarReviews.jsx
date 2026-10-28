import { Link, useLocation } from "react-router";
import { useOwnerReviews } from "@/hooks/useReviews.js";
import { useAuth } from "@/hooks/useAuth.js";
import { LiveState } from "@/components/LiveUi.jsx";
import { formatDateTime } from "@/utils/datetime.js";

export function CarReviews({ ownerId, ownerName }) {
    const { loggedIn } = useAuth();
    const location = useLocation();
    const reviews = useOwnerReviews(loggedIn ? ownerId : null);
    const rows = reviews.data?.content ?? [];
    const total = reviews.data?.totalElements ?? rows.length;
    const average = rows.length ? rows.reduce((sum, review) => sum + Number(review.rating || 0), 0) / rows.length : 0;
    const next = `${location.pathname}${location.search}`;
    return <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-lg font-bold text-[#292929]">Đánh giá chủ xe{ownerName ? ` ${ownerName}` : ""}</h2>
        <p className="mt-1 text-sm text-[#666666]">Nhận xét của khách sau những chuyến đã hoàn thành.</p>
      </div>
      {rows.length ? <p className="text-sm font-bold text-[#FC6C26]">{average.toFixed(1)}/5 • {total} đánh giá</p> : null}
    </div>
    {!loggedIn ? <p className="mt-4 text-sm text-[#666666]">
      <Link to={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-[#FC6C26]">Đăng nhập</Link> để đọc đánh giá.
    </p> : null}
    {loggedIn && !reviews.data ? <div className="mt-4"><LiveState loading={reviews.loading} error={reviews.error} label="đánh giá" onRetry={reviews.reload}/></div> : null}
    {loggedIn && reviews.data && !rows.length ? <p className="mt-4 text-sm text-[#666666]">Chủ xe này chưa có đánh giá.</p> : null}
    {rows.length ? <ul className="mt-4 flex flex-col gap-3">
      {rows.map(review => <li key={review.id} className="rounded-xl border border-[#E9E9E7] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-[#292929]">{review.reviewerName || "Khách thuê"}</p>
          <p className="text-xs text-[#666666]">{formatDateTime(review.createdAt)}</p>
        </div>
        <p className="mt-1 text-sm font-bold text-[#FC6C26]" aria-label={`${review.rating} trên 5 sao`}>{"★".repeat(Number(review.rating) || 0)}{"☆".repeat(Math.max(0, 5 - Number(review.rating || 0)))}</p>
        {review.comment ? <p className="mt-1 whitespace-pre-line text-sm text-[#292929]">{review.comment}</p> : <p className="mt-1 text-sm text-[#666666]">Không có nhận xét.</p>}
        {review.orderCode ? <p className="mt-1 font-mono text-xs text-[#666666]">{review.orderCode}</p> : null}
      </li>)}
    </ul> : null}
    {total > rows.length ? <p className="mt-3 text-xs text-[#666666]">Đang hiện {rows.length} đánh giá mới nhất trong tổng số {total}.</p> : null}
  </section>;
}
