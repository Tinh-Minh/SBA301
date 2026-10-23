"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { LivePage, LiveState, Primary, fieldClass } from "@/components/live-ui";
import { useAsyncAction, useAsyncResource } from "@/hooks/use-async-resource";
import { formatDateTime } from "@/lib/datetime";
import { carName, formatMoney, rentalTypeLabels } from "@/lib/labels";
import { carService } from "@/services/car.service";
import { rentalService } from "@/services/order.service";
import { slotService } from "@/services/slot.service";

export default function Checkout() {
    return <LivePage width="max-w-3xl">
    <RequireAuth title="Đăng nhập để gửi yêu cầu thuê">
      <Confirm/>
    </RequireAuth>
  </LivePage>;
}

function Confirm() {
    const params = useSearchParams();
    const router = useRouter();
    const slotId = params.get("slotId");
    const start = params.get("start");
    const end = params.get("end");
    const type = params.get("type") || "DAILY";
    const [voucher, setVoucher] = useState(params.get("voucher") || "");
    const [note, setNote] = useState("");
    const [voucherQuery, setVoucherQuery] = useState(voucher);
    const load = useCallback(async () => {
        if (!slotId || !start || !end)
            throw new Error("Thiếu khung giờ hoặc thời gian thuê. Hãy chọn lại xe.");
        const slot = await slotService.getById(slotId);
        const [car, quote] = await Promise.all([
            carService.getPublic(slot.carId),
            rentalService.quote({ carSlotId: slot.id, rentalType: type, startTime: new Date(start), endTime: new Date(end), voucherCode: voucherQuery }),
        ]);
        return { slot, car, quote };
    }, [slotId, start, end, type, voucherQuery]);
    const detail = useAsyncResource(load, `${slotId}|${start}|${end}|${type}|${voucherQuery}`);
    const create = useAsyncAction(async () => {
        const order = await rentalService.create({ carSlotId: slotId, rentalType: type, startTime: new Date(start), endTime: new Date(end), voucherCode: voucherQuery, note });
        router.push(`/don-thue/${order.id}?created=1`);
    });
    return <div className="flex flex-col gap-5">
    <div>
      <Link href={slotId ? `/xe/${detail.data?.car.id ?? ""}?slotId=${slotId}` : "/kham-pha-xe"} className="text-sm font-bold text-[#FC6C26]">← Quay lại xe</Link>
      <h1 className="mt-2 text-2xl font-bold text-[#292929]">Xác nhận yêu cầu thuê xe</h1>
      <p className="mt-1 text-sm text-[#666666]">Đơn ở trạng thái chờ chủ xe xác nhận trong 24 giờ. Tiền thuê thanh toán sau khi được duyệt.</p>
    </div>
    <LiveState loading={detail.loading && !detail.data} error={detail.error} label="báo giá" onRetry={detail.reload}/>
    {detail.data ? <section className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">{carName(detail.data.car)}</h2>
      <p className="text-sm text-[#666666]">{formatDateTime(start)} → {formatDateTime(end)} • {rentalTypeLabels[type] ?? type}</p>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <Item term="Đơn giá" value={formatMoney(detail.data.quote.unitPrice)}/>
        <Item term="Số lượng" value={detail.data.quote.quantity}/>
        <Item term="Tiền thuê" value={formatMoney(detail.data.quote.rentalAmount)}/>
        <Item term="Giảm giá" value={formatMoney(detail.data.quote.discountAmount)}/>
        <Item term="Tổng thanh toán" value={formatMoney(detail.data.quote.totalAmount)}/>
        <Item term="Tiền cọc (thu khi nhận xe)" value={formatMoney(detail.data.quote.depositAmount)}/>
      </dl>
      <form className="grid gap-3" onSubmit={event => { event.preventDefault(); setVoucherQuery(voucher.trim()); }}>
        <label className="text-xs font-semibold text-[#666666]">Mã voucher
          <span className="mt-1 flex gap-2"><input value={voucher} onChange={event => setVoucher(event.target.value.toUpperCase())} className={fieldClass} placeholder="Để trống nếu không dùng"/><button type="submit" className="rounded-xl border border-[#E9E9E7] px-4 text-sm font-bold">Áp dụng</button></span>
        </label>
      </form>
      <label className="text-xs font-semibold text-[#666666]">Ghi chú cho chủ xe
        <textarea value={note} onChange={event => setNote(event.target.value)} rows={3} className={`${fieldClass} mt-1`} placeholder="Điểm đón, số người..."/>
      </label>
      {create.error ? <p className="text-sm text-[#B91C1C]">{create.error.message}</p> : null}
      <Primary disabled={create.running} onClick={() => void create.run()}>{create.running ? "Đang gửi…" : "Gửi yêu cầu thuê"}</Primary>
    </section> : null}
  </div>;
}

function Item({ term, value }) {
    return <div><dt className="text-[11px] uppercase text-[#666666]">{term}</dt><dd className="font-semibold text-[#292929]">{value}</dd></div>;
}
