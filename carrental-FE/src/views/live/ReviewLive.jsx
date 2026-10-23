"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { LivePage, LiveState, Primary, fieldClass } from "@/components/live-ui";
import { useAsyncAction, useAsyncResource } from "@/hooks/use-async-resource";
import { currentUserId } from "@/lib/session";
import { rentalService } from "@/services/order.service";
import { reviewService } from "@/services/customer-extra.service";

export default function ReviewLive() {
    const orderId = useSearchParams().get("orderId");
    return <LivePage width="max-w-xl">
    <RequireAuth title="Đăng nhập để đánh giá">
      {orderId ? <Form orderId={orderId}/> : <p className="text-sm">Chọn đơn đã hoàn thành trong <Link href="/account/history" className="font-bold text-[#FC6C26]">lịch sử chuyến đi</Link>.</p>}
    </RequireAuth>
  </LivePage>;
}

function Form({ orderId }) {
    const router = useRouter();
    const load = useCallback(async () => {
        const [order, reviews] = await Promise.all([rentalService.getById(orderId), reviewService.listByOrder(orderId)]);
        return { order, mine: reviews.find(review => review.reviewerId === currentUserId()) ?? null };
    }, [orderId]);
    const detail = useAsyncResource(load, orderId);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const send = useAsyncAction(async () => {
        await reviewService.create({ orderId, revieweeId: detail.data.order.ownerId, rating, comment });
        router.push(`/orders/${orderId}`);
    });
    if (!detail.data)
        return <LiveState loading={detail.loading} error={detail.error} label="đơn đánh giá" onRetry={detail.reload}/>;
    const { order, mine } = detail.data;
    return <form className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm" onSubmit={event => { event.preventDefault(); void send.run(); }}>
    <Link href={`/orders/${order.id}`} className="text-sm font-bold text-[#FC6C26]">← {order.orderCode}</Link>
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
