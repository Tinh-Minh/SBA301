import { reviewService } from "@/services/reviewService.js";
import { useOrderReview } from "@/hooks/useReviews.js";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { LiveState, Primary, fieldClass } from "@/components/LiveUi.jsx";

import { useApiMutation } from "@/hooks/useApiMutation.js";

export function OwnerReviewForm({ orderId }) {
    const navigate = useNavigate();
    const detail = useOrderReview(orderId);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const send = useApiMutation(async () => {
        await reviewService.create({ orderId, revieweeId: detail.data.order.ownerId, rating, comment });
        navigate(`/orders/${orderId}`);
    });
    if (!detail.data)
        return <LiveState loading={detail.loading} error={detail.error} label="đơn đánh giá" onRetry={detail.reload}/>;
    const { order, mine } = detail.data;
    return <form className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm" onSubmit={event => { event.preventDefault(); void send.run(); }}>
    <Link to={`/orders/${order.id}`} className="text-sm font-bold text-[#FC6C26]">← {order.orderCode}</Link>
    <h1 className="text-xl font-bold">Đánh giá chủ xe {order.ownerName}</h1>
    <p className="text-sm text-[#666666]">{order.carName}</p>
    {mine ? <p className="rounded-xl bg-[#ECFDF5] p-3 text-sm text-[#047857]">Bạn đã đánh giá {mine.rating}/5. {mine.comment}</p> : order.status !== "COMPLETED" ? <p className="text-sm text-[#B45309]">Chỉ đánh giá được khi chuyến đã hoàn thành.</p> : <>
      <div className="flex gap-2">{[1, 2, 3, 4, 5].map(star => <button key={star} type="button" onClick={() => setRating(star)} className={`size-10 rounded-full text-sm font-bold ${star <= rating ? "bg-[#FC6C26] text-white" : "border border-[#E9E9E7]"}`}>{star}</button>)}</div>
      <textarea value={comment} onChange={event => setComment(event.target.value)} rows={4} placeholder="Chia sẻ trải nghiệm" className={fieldClass}/>
      {send.error ? <p className="text-sm text-[#B91C1C]">{send.error.message}</p> : null}
      <Primary type="submit" disabled={send.running}>{send.running ? "Đang gửi…" : `Gửi ${rating} sao`}</Primary>
    </>}
  </form>;
}
