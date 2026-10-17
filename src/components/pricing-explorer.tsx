"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Icon } from "./icon";
import { formatPrice, pricingSegments, rentalDiscount } from "@/lib/pricing";

const modes = [{ id: "self", label: "Thuê tự lái", icon: "key" }, { id: "driver", label: "Kèm tài xế", icon: "person" }, { id: "month", label: "Thuê theo tháng", icon: "garage_home" }] as const;

export function PricingExplorer({ intro, benefits, comparison, fees }: { intro: ReactNode; benefits: ReactNode; comparison: ReactNode; fees: ReactNode }) {
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
    <section data-pricing-section="intro" className="relative overflow-hidden bg-gradient-to-br from-accent-soft/50 via-white to-section-bg pt-10 pb-16"><div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-brand-accent/10 blur-3xl" /><div className="relative mx-auto max-w-[1240px] px-5 md:px-8">{intro}
<div className="mb-6 flex max-w-3xl flex-wrap gap-1 rounded-full bg-accent-soft p-1 shadow-inner" role="group" aria-label="Hình thức thuê">{modes.map(item => <button key={item.id} type="button" aria-pressed={mode === item.id} onClick={() => changeMode(item.id)} className={`ui-action flex flex-none sm:flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-colors ${mode === item.id ? "bg-white text-text-primary shadow-sm" : "text-text-secondary hover:bg-section-bg"}`}><Icon name={item.icon} className="text-[18px]" />{item.label}</button>)}</div>
{benefits}</div></section>
    <section data-pricing-section="fleet" className="bg-section-bg py-10" aria-labelledby="fleet-title">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="lg:max-w-sm"><h2 id="fleet-title" className="text-2xl font-bold tracking-tight md:text-3xl">Phân khúc xe & mức giá thực tế</h2><p className="mt-2 text-sm text-text-secondary">Chọn cách di chuyển, so sánh mức thuê theo phân khúc.</p></div>
          <div className="flex max-w-xl flex-wrap gap-2" role="group" aria-label="Lọc phân khúc">{[{ id: "all", name: "Tất cả" }, ...pricingSegments].map(item => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)} className={`ui-action rounded-full border px-3 py-2 text-xs font-medium transition-colors ${category === item.id ? "border-brand-accent bg-accent-soft text-brand-accent" : "border-border-light bg-white text-text-secondary hover:border-brand-accent/40"}`}>{item.name}</button>)}</div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pricingSegments.filter(item => category === "all" || category === item.id).map(item => <article key={item.id} data-price-card={item.id} className="group flex flex-col overflow-hidden rounded-xl border border-border-light bg-white transition-shadow hover:shadow-xl">
            <div className="relative aspect-[16/9] overflow-hidden bg-pill-bg"><img src={`/images/${item.image}`} alt={item.imageAlt} width="640" height="360" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold shadow-sm">{item.seats}</span></div>
            <div className="flex flex-1 flex-col p-6"><h3 className="text-lg font-bold">{item.name}</h3><p className="mt-2 min-h-10 text-xs leading-relaxed text-text-secondary">{item.models}</p><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded bg-section-bg p-2"><span className="block text-text-secondary">Số chỗ</span><strong className="mt-1 block">{item.seats}</strong></div><div className="rounded bg-section-bg p-2"><span className="block text-text-secondary">Hộp số</span><strong className="mt-1 block">Tự động</strong></div></div><div className="my-4 rounded-lg bg-accent-soft p-3"><p className="text-xs text-text-secondary">{mode === "month" ? "30 ngày, đã giảm 25%" : mode === "driver" ? "Đã gồm tài xế 350.000 đ/ngày" : "Giá thuê tham khảo"}</p><div className="mt-2 flex flex-wrap items-baseline gap-1"><strong className="ui-money text-xl text-brand-accent">{formatPrice(mode === "month" ? item.daily * 30 * .75 : item.daily + (mode === "driver" ? 350000 : 0))}</strong><span className="text-xs text-text-secondary">/ {mode === "month" ? "tháng" : "ngày"}</span></div><p className="mt-2 text-[11px] text-text-secondary">Tự lái: {item.range}/ngày</p></div><Link href="/kham-pha-xe" className="mt-auto flex items-center justify-center gap-2 rounded-full bg-text-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-accent">Khám phá đội xe<Icon name="arrow_forward" className="text-[20px]" /></Link></div>
          </article>)}
          <aside className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-text-primary to-text-secondary p-6 text-white md:p-8"><div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-brand-accent/25 blur-3xl" /><div className="relative"><Icon name="loyalty" className="mb-8 text-[32px] text-brand-accent" /><h3 className="text-2xl font-bold leading-tight">Đi lâu hơn.<br />Tiết kiệm nhiều hơn.</h3><p className="mt-4 text-sm leading-relaxed text-white/70">Ưu đãi được tính trên tiền thuê xe, trước các dịch vụ bổ sung và thuế.</p><dl className="mt-8 divide-y divide-white/15"><div className="flex justify-between py-4"><dt className="text-sm">Từ 7 ngày</dt><dd className="text-xl font-bold text-brand-accent">−10%</dd></div><div className="flex justify-between py-4"><dt className="text-sm">Từ 30 ngày</dt><dd className="text-xl font-bold text-brand-accent">−25%</dd></div></dl></div><a href="#du-toan" className="relative mt-8 flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm font-semibold text-text-primary">Tính chi phí chuyến đi<Icon name="expand_more" className="text-[18px]" /></a></aside>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-text-secondary">Mức tham khảo chưa gồm thuế và dịch vụ tùy chọn. Giá cụ thể phụ thuộc dòng xe, thời gian nhận trả và được xác nhận trước khi đặt xe.</p>
      </div>
    </section>
    {comparison}
    <section data-pricing-section="fees" className="bg-section-bg py-12 md:py-16"><div className="mx-auto max-w-[1240px] px-5 md:px-8">{fees}
      <div id="du-toan" className="rounded-xl bg-white p-6 shadow-sm md:p-10" aria-labelledby="estimate-title">
        <div className="flex flex-col justify-between gap-8 xl:flex-row xl:items-center">
          <div className="xl:max-w-sm"><p className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-accent"><Icon name="receipt_long" className="text-[20px]" />Dự toán nhanh chi phí thuê xe</p><h2 id="estimate-title" className="text-xl font-semibold leading-snug">Tính tổng chi phí theo nhu cầu di chuyển</h2><p className="mt-3 text-sm leading-relaxed text-text-secondary">Tiền thuê × số ngày, trừ ưu đãi, cộng dịch vụ bạn chọn và thuế. Tiền cọc được giữ riêng.</p></div>
          <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-[auto_1fr_auto]">
            <div><label htmlFor="rental-days" className="text-xs font-semibold text-text-secondary">Số ngày thuê</label><div className="mt-2 flex items-center rounded-full bg-section-bg p-1"><button type="button" aria-label="Giảm số ngày thuê" disabled={days <= 1} onClick={() => setDays(value => Math.max(1, value - 1))} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-30"><span aria-hidden="true">−</span></button><input id="rental-days" type="number" min="1" max="60" value={days} onChange={event => setDays(Math.min(60, Math.max(1, Number(event.target.value) || 1)))} className="w-14 bg-transparent text-center text-lg font-bold" /><button type="button" aria-label="Tăng số ngày thuê" disabled={days >= 60} onClick={() => setDays(value => Math.min(60, value + 1))} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-30"><Icon name="add" className="text-[18px]" /></button></div></div>
            <div className="min-w-0"><label htmlFor="price-segment" className="text-xs font-semibold text-text-secondary">Phân khúc xe</label><select id="price-segment" value={segmentId} onChange={event => setSegmentId(event.target.value)} className="mt-2 block w-full max-w-full rounded-full bg-section-bg px-4 py-3 text-xs font-medium">{pricingSegments.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
            <div className="rounded-xl bg-accent-soft p-4 sm:col-span-2 lg:col-span-1"><span className="text-xs text-text-secondary">Tổng dự kiến • Giảm {rate * 100}%</span><output id="estimate-total" aria-live="polite" className="ui-money mt-1 block text-xl font-bold text-brand-accent">{formatPrice(subtotal + tax)}</output>{discount > 0 ? <p className="mt-1 text-xs font-medium text-emerald-700">Tiết kiệm {formatPrice(discount)}</p> : null}</div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-border-light pt-5"><label className="flex flex-wrap items-center gap-2 text-xs"><input type="checkbox" checked={insurance} onChange={event => setInsurance(event.target.checked)} />Bảo hiểm nâng cao<span className="text-text-secondary">99.000 đ/ngày</span></label><label className="flex flex-wrap items-center gap-2 text-xs"><input type="checkbox" checked={delivery} onChange={event => setDelivery(event.target.checked)} />Giao xe sân bay<span className="text-text-secondary">150.000 đ/lượt</span></label></div>
        <details className="mt-5 rounded-lg bg-section-bg p-4"><summary className="cursor-pointer text-sm font-semibold">Xem từng khoản trong dự toán</summary><dl className="mt-4 grid gap-x-10 gap-y-3 text-xs sm:grid-cols-2"><PriceRow label={`${formatPrice(segment.daily)} × ${days} ngày`} amount={rental} /><PriceRow label={`Ưu đãi thời lượng (${rate * 100}%)`} amount={-discount} /><PriceRow label="Tài xế riêng" amount={driverFee} /><PriceRow label="Bảo hiểm nâng cao" amount={insuranceFee} /><PriceRow label="Giao xe sân bay" amount={deliveryFee} /><PriceRow label="Thuế minh họa (8%)" amount={tax} /></dl></details>
        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><p className="max-w-2xl text-xs leading-relaxed text-text-secondary"><strong className="text-text-primary">Cọc thế chấp giữ riêng</strong>: <span className="ui-money">15.000.000 đ</span>, không cộng vào tổng. Thuế minh họa 8%; giá và điều kiện cuối cùng được xác nhận trong đơn thuê.</p><Link href="/kham-pha-xe" className="ui-action inline-flex items-center justify-center gap-2 rounded-full bg-text-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-accent">Tìm xe phù hợp<Icon name="arrow_forward" className="text-[16px]" /></Link></div>
      </div>
    </div></section>
  </>;
}

function PriceRow({ label, amount }: { label: string; amount: number }) {
  return <div className="flex flex-wrap items-baseline justify-between gap-2"><dt className="text-text-secondary">{label}</dt><dd className={`ui-money font-semibold ${amount < 0 ? "text-emerald-700" : ""}`}>{formatPrice(amount)}</dd></div>;
}
