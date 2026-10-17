"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "./icon";
import { formatPrice, pricingSegments, rentalDiscount } from "@/lib/pricing";

const modes = [{ id: "self", label: "Thuê tự lái", icon: "key" }, { id: "driver", label: "Kèm tài xế", icon: "person" }, { id: "month", label: "Thuê theo tháng", icon: "garage_home" }] as const;

export function PricingExplorer() {
  const [mode, setMode] = useState<"self" | "driver" | "month">("self");
  const [category, setCategory] = useState("all");
  const [segmentId, setSegmentId] = useState("electric");
  const [days, setDays] = useState(3);
  const [delivery, setDelivery] = useState(false);
  const [insurance, setInsurance] = useState(false);
  const segment = pricingSegments.find(item => item.id === segmentId)!;
  const rate = rentalDiscount(days);
  const rental = segment.daily * days;
  const discount = Math.round(rental * rate);
  const driverFee = mode === "driver" ? 350000 * days : 0;
  const insuranceFee = insurance ? 99000 * days : 0;
  const deliveryFee = delivery ? 150000 : 0;
  const subtotal = rental - discount + driverFee + insuranceFee + deliveryFee;
  const tax = Math.round(subtotal * .08);
  function changeMode(value: typeof mode) {
    setMode(value);
    if (value === "month") setDays(30);
  }
  return <>
    <section className="bg-section-bg py-12 md:py-16" aria-labelledby="fleet-title">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div><h2 id="fleet-title" className="text-2xl font-bold tracking-tight md:text-3xl">Một mức giá cho mỗi nhu cầu</h2><p className="mt-2 text-sm text-text-secondary">Chọn cách di chuyển, so sánh mức thuê theo phân khúc.</p></div>
          <div className="flex flex-wrap gap-1 rounded-xl border border-border-light bg-white p-1" role="group" aria-label="Hình thức thuê">{modes.map(item => <button key={item.id} type="button" aria-pressed={mode === item.id} onClick={() => changeMode(item.id)} className={`ui-action flex flex-none sm:flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${mode === item.id ? "bg-text-primary text-white shadow-sm" : "text-text-secondary hover:bg-section-bg"}`}><Icon name={item.icon} className="text-[18px]" />{item.label}</button>)}</div>
        </div>
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Lọc phân khúc">{[{ id: "all", name: "Tất cả" }, ...pricingSegments].map(item => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)} className={`ui-action rounded-full border px-3 py-2 text-xs font-medium transition-colors ${category === item.id ? "border-brand-accent bg-accent-soft text-brand-accent" : "border-border-light bg-white text-text-secondary hover:border-brand-accent/40"}`}>{item.name}</button>)}</div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {pricingSegments.filter(item => category === "all" || category === item.id).map(item => <article key={item.id} data-price-card={item.id} className="group flex flex-col overflow-hidden rounded-xl border border-border-light bg-white transition-shadow hover:shadow-xl">
            <div className="relative aspect-[16/9] overflow-hidden bg-pill-bg"><img src={`/images/${item.image}`} alt={item.imageAlt} width="640" height="360" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold shadow-sm">{item.seats}</span></div>
            <div className="flex flex-1 flex-col p-5"><h3 className="text-lg font-bold">{item.name}</h3><p className="mt-2 min-h-10 text-xs leading-relaxed text-text-secondary">{item.models}</p><div className="my-5 rounded-lg bg-accent-soft p-4"><p className="text-xs text-text-secondary">{mode === "month" ? "30 ngày, đã giảm 25%" : mode === "driver" ? "Đã gồm tài xế 350.000 đ/ngày" : "Giá thuê tham khảo"}</p><div className="mt-2 flex flex-wrap items-baseline gap-1"><strong className="ui-money text-xl text-brand-accent">{formatPrice(mode === "month" ? item.daily * 30 * .75 : item.daily + (mode === "driver" ? 350000 : 0))}</strong><span className="text-xs text-text-secondary">/ {mode === "month" ? "tháng" : "ngày"}</span></div><p className="mt-2 text-[11px] text-text-secondary">Tự lái: {item.range}/ngày</p></div><Link href="/kham-pha-xe" className="mt-auto flex items-center justify-between border-t border-border-light pt-4 text-sm font-semibold hover:text-brand-accent">Khám phá đội xe<Icon name="arrow_forward" className="text-[20px]" /></Link></div>
          </article>)}
          <aside className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-text-primary p-6 text-white md:p-8"><div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-brand-accent/25 blur-3xl" /><div className="relative"><Icon name="loyalty" className="mb-8 text-[32px] text-brand-accent" /><h3 className="text-2xl font-bold leading-tight">Đi lâu hơn.<br />Tiết kiệm nhiều hơn.</h3><p className="mt-4 text-sm leading-relaxed text-white/70">Ưu đãi được tính trên tiền thuê xe, trước các dịch vụ bổ sung và thuế.</p><dl className="mt-8 divide-y divide-white/15"><div className="flex justify-between py-4"><dt className="text-sm">Từ 7 ngày</dt><dd className="text-xl font-bold text-brand-accent">−10%</dd></div><div className="flex justify-between py-4"><dt className="text-sm">Từ 30 ngày</dt><dd className="text-xl font-bold text-brand-accent">−25%</dd></div></dl></div><a href="#du-toan" className="relative mt-8 flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm font-semibold text-text-primary">Tính chi phí chuyến đi<Icon name="expand_more" className="text-[18px]" /></a></aside>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-text-secondary">Mức tham khảo chưa gồm thuế và dịch vụ tùy chọn. Giá cụ thể phụ thuộc dòng xe, thời gian nhận trả và được xác nhận trước khi đặt xe.</p>
      </div>
    </section>
    <section id="du-toan" className="bg-white py-12 md:py-20" aria-labelledby="estimate-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-10 lg:grid-cols-2 lg:gap-16">
        <div><div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-accent-soft text-brand-accent"><Icon name="receipt_long" /></div><h2 id="estimate-title" className="text-3xl font-bold tracking-tight">Biết trước từng khoản.</h2><p className="mt-3 max-w-lg text-sm leading-relaxed text-text-secondary">Tiền thuê xe × thời lượng, trừ ưu đãi, cộng dịch vụ bạn chọn và thuế. Tiền cọc được giữ riêng, không tính vào chi phí chuyến đi.</p>
          <div className="mt-8 space-y-6">
            <div><label className="block text-sm font-semibold" htmlFor="price-segment">Phân khúc xe</label><select id="price-segment" value={segmentId} onChange={event => setSegmentId(event.target.value)} className="mt-2 block w-full rounded-lg border border-border-light bg-section-bg px-4 py-3 text-sm font-medium">{pricingSegments.map(item => <option key={item.id} value={item.id}>{item.name} — {formatPrice(item.daily)}/ngày</option>)}</select></div>
            <div><label htmlFor="rental-days" className="text-sm font-semibold">Số ngày thuê</label><div className="mt-2 flex items-center gap-3"><button type="button" aria-label="Giảm số ngày thuê" disabled={days <= 1} onClick={() => setDays(value => Math.max(1, value - 1))} className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border-light disabled:opacity-30"><span aria-hidden="true" className="text-xl">−</span></button><input id="rental-days" type="number" min="1" max="60" value={days} onChange={event => setDays(Math.min(60, Math.max(1, Number(event.target.value) || 1)))} className="h-11 w-20 rounded-lg bg-section-bg text-center text-lg font-bold" /><button type="button" aria-label="Tăng số ngày thuê" disabled={days >= 60} onClick={() => setDays(value => Math.min(60, value + 1))} className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border-light disabled:opacity-30"><Icon name="add" /></button><span className="text-xs text-text-secondary">1 ngày = 24 giờ<br />Tối đa 60 ngày</span></div></div>
            <div className="space-y-3 border-t border-border-light pt-5"><label className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-3"><input type="checkbox" checked={insurance} onChange={event => setInsurance(event.target.checked)} />Bảo hiểm nâng cao</span><span className="ui-money text-xs text-text-secondary">99.000 đ/ngày</span></label><label className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-3"><input type="checkbox" checked={delivery} onChange={event => setDelivery(event.target.checked)} />Giao xe sân bay</span><span className="ui-money text-xs text-text-secondary">150.000 đ/lượt</span></label></div>
          </div>
        </div>
        <div className="rounded-xl border border-border-light bg-section-bg p-5 md:p-8"><div className="flex items-center justify-between gap-3 border-b border-border-light pb-5"><h3 className="text-lg font-bold">Dự toán chuyến đi</h3><span className="rounded-full bg-white px-3 py-1 text-xs">{days} ngày</span></div><dl className="space-y-4 py-6 text-sm"><PriceRow label={`${formatPrice(segment.daily)} × ${days} ngày`} amount={rental} /><PriceRow label={`Ưu đãi thời lượng (${rate * 100}%)`} amount={-discount} /><PriceRow label="Tài xế riêng" amount={driverFee} /><PriceRow label="Bảo hiểm nâng cao" amount={insuranceFee} /><PriceRow label="Giao xe sân bay" amount={deliveryFee} /><PriceRow label="Thuế minh họa (8%)" amount={tax} /></dl><div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border-light pt-5"><span className="text-sm font-semibold">Tổng tiền dự kiến</span><output id="estimate-total" aria-live="polite" className="ui-money text-2xl font-extrabold text-brand-accent">{formatPrice(subtotal + tax)}</output></div><p className="mt-4 text-xs leading-relaxed text-text-secondary">Bảng tính minh họa dùng thuế suất 8%. Thuế và chính sách áp dụng thực tế được thể hiện tại bước xác nhận đơn.</p><div className="mt-6 flex items-start gap-3 rounded-lg bg-white p-4"><Icon name="account_balance_wallet" className="text-brand-accent" /><p className="text-xs leading-relaxed"><strong className="block text-sm">Cọc thế chấp giữ riêng</strong><span className="ui-money">15.000.000 đ</span> hoàn lại theo biên bản trả xe. Không nằm trong tổng tiền ở trên.</p></div><Link href="/kham-pha-xe" className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-brand-accent px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover">Tìm xe phù hợp<Icon name="arrow_forward" className="text-[18px]" /></Link></div>
      </div>
    </section>
  </>;
}

function PriceRow({ label, amount }: { label: string; amount: number }) {
  return <div className="flex flex-wrap items-baseline justify-between gap-2"><dt className="text-text-secondary">{label}</dt><dd className={`ui-money font-semibold ${amount < 0 ? "text-emerald-700" : ""}`}>{formatPrice(amount)}</dd></div>;
}
