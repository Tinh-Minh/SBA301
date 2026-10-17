import { ProfileLayout } from "@/components/profile-layout";
import { Link } from "react-router";
export default function History() {
    return (<div className="cardb-screen screen-history bg-background font-body-md text-body-md text-on-surface antialiased"><ProfileLayout active="history" title="Lịch sử chuyến đi" description="Tra cứu lịch sử các chuyến thuê đã hoàn tất, xuất hóa đơn VAT điện tử và quản lý biên bản bàn giao xe chính xác theo chuẩn C10-B." actions={<><div className="flex-wrap gap-y-2 flex items-center gap-space-sm self-start xl:self-end">
        <button className="ui-action px-space-md py-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-2 shadow-sm transition-all active:scale-[0.99]" type="button" aria-label="Xuất báo cáo PDF / Excel" data-action="download-report">
        <span className="material-symbols-outlined text-[18px]">{"download"}</span>
        <span className="">{"Xuất báo cáo PDF / Excel"}</span>
        </button>
        </div></>}>


    <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">

    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
    <div className="flex items-center justify-between text-on-surface-variant mb-space-sm">
    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">{"Tổng chuyến đã đi"}</span>
    <div className="w-8 h-8 rounded-lg bg-primary-fixed/40 flex items-center justify-center text-primary">
    <span className="material-symbols-outlined text-[18px]">{"directions_car"}</span>
    </div>
    </div>
    <div>
    <div className="flex items-baseline gap-space-xs">
    <span className="font-headline-lg text-headline-lg text-on-surface font-bold leading-none">{"09"}</span>
    <span className="font-label-md text-label-md text-on-surface-variant">{"chuyến"}</span>
    </div>
    <div className="flex items-center gap-1.5 mt-2 text-emerald-700">
    <span className="material-symbols-outlined text-[16px]">{"check_circle"}</span>
    <span className="font-technical-data text-body-sm font-semibold">{"100% đúng hạn & hoàn hảo"}</span>
    </div>
    </div>
    </div>

    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
    <div className="flex items-center justify-between text-on-surface-variant mb-space-sm">
    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">{"Tổng chi phí đã thuê"}</span>
    <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
    <span className="material-symbols-outlined text-[18px]">{"payments"}</span>
    </div>
    </div>
    <div>
    <div className="flex items-baseline gap-space-xs">
    <span className="font-headline-lg text-headline-lg text-primary font-bold leading-none">{"28.650.000"}</span>
    <span className="font-label-md text-label-md text-on-surface-variant">{"đ"}</span>
    </div>
    <div className="flex items-center gap-1.5 mt-2 text-on-surface-variant">
    <span className="font-technical-data text-body-sm">{"Bao gồm bảo hiểm 2 chiều"}</span>
    </div>
    </div>
    </div>

    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
    <div className="flex items-center justify-between text-on-surface-variant mb-space-sm">
    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">{"Hoàn cọc thế chấp"}</span>
    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
    <span className="material-symbols-outlined text-[18px]">{"verified_user"}</span>
    </div>
    </div>
    <div>
    <div className="flex items-baseline gap-space-xs">
    <span className="font-headline-lg text-headline-lg text-emerald-700 font-bold leading-none">{"100%"}</span>
    <span className="font-label-md text-label-md text-emerald-800 font-semibold">{"hoàn tất"}</span>
    </div>
    <div className="flex items-center gap-1.5 mt-2 text-on-surface-variant">
    <span className="material-symbols-outlined text-[16px] text-emerald-600">{"done_all"}</span>
    <span className="font-technical-data text-body-sm">{"Không phát sinh tranh chấp"}</span>
    </div>
    </div>
    </div>
    </div>

    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-md">
    <div className="flex flex-col md:flex-row items-center justify-between gap-space-md">

    <div className="relative w-full md:w-80">
    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">{"search"}</span>
    <input className="w-full h-11 pl-10 pr-4 bg-surface-container-low rounded-lg text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary-container transition-all" placeholder="Tìm theo tên xe hoặc mã đơn hàng..." type="text" aria-label="Tìm theo tên xe hoặc mã đơn hàng..."/>
    </div>

    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
    <button className="px-3.5 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold whitespace-nowrap transition-colors hover:bg-surface-container-high" type="button" aria-label="Tất cả (10)" data-action="trip-filter" data-status-filter="all">{"\n                  Tất cả "}<span className="ml-1 text-on-surface-variant font-technical-data font-normal">{"(10)"}</span>
    </button>
    <button className="px-3.5 py-1.5 rounded-lg bg-primary-fixed/40 text-primary font-label-md text-label-md font-bold whitespace-nowrap shadow-sm" type="button" aria-label="Đã hoàn thành (9)" data-action="trip-filter" data-status-filter="completed">{"\n                  Đã hoàn thành "}<span className="ml-1 text-primary-container font-technical-data">{"(9)"}</span>
    </button>
    <button className="px-3.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md hover:text-on-surface whitespace-nowrap transition-colors" type="button" aria-label="Đã hủy (1)" data-action="trip-filter" data-status-filter="cancelled">{"\n                  Đã hủy "}<span className="ml-1 text-outline font-technical-data font-normal">{"(1)"}</span>
    </button>
    </div>

    <div className="flex items-center gap-space-xs self-end md:self-auto">
    <div className="relative inline-block">
    <select className="appearance-none bg-surface-container-low text-on-surface font-label-md text-label-md py-2 pl-3.5 pr-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-container cursor-pointer" aria-label="Lựa chọn" defaultValue="Năm 2026">
    <option>{"Năm 2026"}</option>
    <option>{"Năm 2025"}</option>
    <option>{"Năm 2024"}</option>
    </select>
    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[18px]">{"expand_more"}</span>
    </div>
    </div>
    </div>
    </div>

    <div className="space-y-space-md">

    <div className="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden relative" data-trip-card="true" data-trip-status="completed">
    <div className="p-space-lg">

    <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-md mb-space-md bg-surface-container-low/40 -mx-space-lg -mt-space-lg px-space-lg pt-space-md">
    <div className="flex flex-wrap items-center gap-space-sm">
    <span className="font-label-sm text-[11px] text-primary-container font-bold uppercase tracking-wider bg-primary-fixed/30 px-2 py-0.5 rounded">{"Gần nhất"}</span>
    <span className="font-technical-data text-technical-data text-on-surface font-bold">{"Mã đơn: CDB-ORD-20261015-883"}</span>
    <span className="w-1 h-1 rounded-full bg-outline-variant hidden sm:inline-block"></span>
    <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
    <span className="material-symbols-outlined text-[16px] text-outline">{"calendar_today"}</span>{"\n                      15/10/2026 – 17/10/2026 (2 ngày)\n                    "}</span>
    </div>
    <div className="flex items-center gap-space-xs">
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-label-sm text-[11px] font-bold">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>{"\n                      Đã hoàn thành\n                    "}</span>
    </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">

    <div className="md:col-span-4 lg:col-span-3">
    <div className="aspect-[16/10] rounded-lg overflow-hidden bg-surface-container relative group">
    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/cardb-127ef324766d6c09.webp" alt="Hình ảnh xe CarDB" loading="lazy" decoding="async"/>
    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur text-white font-technical-data text-[10px] rounded font-mono">{"\n                        51K-682.19\n                      "}</span>
    </div>
    </div>

    <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between gap-space-md">
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
    <div>
    <div className="flex items-center gap-2 mb-0.5">
    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">{"VinFast Mobility"}</span>
    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
    <span className="font-label-sm text-[11px] text-tertiary font-semibold flex items-center gap-0.5">
    <span className="material-symbols-outlined text-[14px]">{"bolt"}</span>{" Thuần điện thông minh\n                          "}</span>
    </div>
    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"VF 8 Plus (402 HP)"}</h2>
    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{"Nhận xe tại Showroom CarDB Thảo Điền, TP. Thủ Đức • Giao trả đúng hạn 18:30"}</p>
    </div>
    <div className="text-left sm:text-right">
    <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline block">{"Tổng chi phí thuê"}</span>
    <div className="flex items-baseline sm:justify-end gap-1">
    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{"2.500.000"}</span>
    <span className="font-label-md text-label-md text-on-surface-variant font-medium">{"đ"}</span>
    </div>
    <span className="font-body-sm text-[12px] text-emerald-700 flex items-center sm:justify-end gap-1">
    <span className="material-symbols-outlined text-[14px]">{"check"}</span>{" Đã thanh toán 100%\n                        "}</span>
    </div>
    </div>

    <div className="p-space-sm bg-surface-container-low rounded-lg flex flex-wrap items-center justify-between gap-space-xs text-body-sm">
    <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-emerald-600 text-[18px]">{"account_balance_wallet"}</span>
    <span className="text-on-surface font-medium">{"Tiền cọc thế chấp (10.000.000 đ):"}</span>
    <span className="text-emerald-800 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded text-[12px]">{"Đã hoàn tiền vào Vietcombank ****982"}</span>
    </div>
    <span className="font-technical-data text-[11px] text-outline">{"GD: CDB-REF-992144"}</span>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
    <div className="flex flex-wrap items-center gap-2">
    <button className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors" type="button" aria-label="Xem đánh giá 5.0" data-route="/danh-gia">
    <span className="material-symbols-outlined text-amber-500 text-[18px]" style={{ "fontVariationSettings": "'FILL' 1" }}>{"star"}</span>
    <span className="">{"Xem đánh giá 5.0"}</span>
    </button>
    <button className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors" type="button" aria-label="Tải hóa đơn VAT" data-action="receipt">
    <span className="material-symbols-outlined text-outline text-[18px]">{"receipt"}</span>
    <span className="">{"Tải hóa đơn VAT"}</span>
    </button>
    <button className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors" type="button" aria-label="Biên bản trả xe C10-B" data-route="/ban-giao/tra-xe">
    <span className="material-symbols-outlined text-outline text-[18px]">{"description"}</span>
    <span className="">{"Biên bản trả xe C10-B"}</span>
    </button>
    </div>
    <button className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary-container/90 text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.99]" type="button" aria-label="Đặt lại xe này" data-route="/xe/vinfast-vf8-plus-2024">
    <span className="material-symbols-outlined text-[18px]">{"replay"}</span>
    <span className="">{"Đặt lại xe này"}</span>
    </button>
    </div>
    </div>
    </div>
    </div>
    </div>

    <div className="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden relative" data-trip-card="true" data-trip-status="completed">
    <div className="p-space-lg">

    <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-md mb-space-md bg-surface-container-low/40 -mx-space-lg -mt-space-lg px-space-lg pt-space-md">
    <div className="flex flex-wrap items-center gap-space-sm">
    <span className="font-technical-data text-technical-data text-on-surface font-bold">{"Mã đơn: CDB-ORD-20260910-671"}</span>
    <span className="w-1 h-1 rounded-full bg-outline-variant hidden sm:inline-block"></span>
    <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
    <span className="material-symbols-outlined text-[16px] text-outline">{"calendar_today"}</span>{"\n                      10/09/2026 – 12/09/2026 (2 ngày)\n                    "}</span>
    </div>
    <div className="flex items-center gap-space-xs">
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-label-sm text-[11px] font-bold">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>{"\n                      Đã hoàn thành\n                    "}</span>
    </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">

    <div className="md:col-span-4 lg:col-span-3">
    <div className="aspect-[16/10] rounded-lg overflow-hidden bg-surface-container relative group">
    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/cardb-44142b04ee3bc0d1.webp" alt="Hình ảnh xe CarDB" loading="lazy" decoding="async"/>
    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur text-white font-technical-data text-[10px] rounded font-mono">{"\n                        51H-992.45\n                      "}</span>
    </div>
    </div>

    <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between gap-space-md">
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
    <div>
    <div className="flex items-center gap-2 mb-0.5">
    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">{"Mercedes-Benz"}</span>
    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
    <span className="font-label-sm text-[11px] text-secondary font-semibold">{"Crossover Sang Trọng"}</span>
    </div>
    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"GLC 300 4MATIC"}</h2>
    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{"Bàn giao tại Sân bay Quốc tế Tân Sơn Nhất (Ga Quốc tế) • Dịch vụ Concierge VIP"}</p>
    </div>
    <div className="text-left sm:text-right">
    <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline block">{"Tổng chi phí thuê"}</span>
    <div className="flex items-baseline sm:justify-end gap-1">
    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{"4.900.000"}</span>
    <span className="font-label-md text-label-md text-on-surface-variant font-medium">{"đ"}</span>
    </div>
    <span className="font-body-sm text-[12px] text-emerald-700 flex items-center sm:justify-end gap-1">
    <span className="material-symbols-outlined text-[14px]">{"check"}</span>{" Đã thanh toán 100%\n                        "}</span>
    </div>
    </div>

    <div className="p-space-sm bg-surface-container-low rounded-lg flex flex-wrap items-center justify-between gap-space-xs text-body-sm">
    <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-emerald-600 text-[18px]">{"account_balance_wallet"}</span>
    <span className="text-on-surface font-medium">{"Tiền cọc thế chấp (15.000.000 đ):"}</span>
    <span className="text-emerald-800 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded text-[12px]">{"Đã hoàn tiền 100%"}</span>
    </div>
    <span className="font-technical-data text-[11px] text-outline">{"GD: CDB-REF-884102"}</span>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
    <div className="flex flex-wrap items-center gap-2">
    <button className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100/80 text-amber-900 font-label-md text-label-md flex items-center gap-1.5 transition-colors font-semibold" type="button" aria-label="★ Viết đánh giá" data-route="/danh-gia">
    <span className="material-symbols-outlined text-amber-600 text-[18px]">{"rate_review"}</span>
    <span className="">{"★ Viết đánh giá"}</span>
    </button>
    <button className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors" type="button" aria-label="Tải hóa đơn VAT" data-action="receipt">
    <span className="material-symbols-outlined text-outline text-[18px]">{"receipt"}</span>
    <span className="">{"Tải hóa đơn VAT"}</span>
    </button>
    </div>
    <button className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary-container/90 text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.99]" type="button" aria-label="Đặt lại xe này" data-route="/xe/vinfast-vf8-plus-2024">
    <span className="material-symbols-outlined text-[18px]">{"replay"}</span>
    <span className="">{"Đặt lại xe này"}</span>
    </button>
    </div>
    </div>
    </div>
    </div>
    </div>

    <div className="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden relative opacity-90" data-trip-card="true" data-trip-status="cancelled">
    <div className="p-space-lg">

    <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-md mb-space-md bg-surface-container-low/40 -mx-space-lg -mt-space-lg px-space-lg pt-space-md">
    <div className="flex flex-wrap items-center gap-space-sm">
    <span className="font-technical-data text-technical-data text-on-surface font-bold">{"Mã đơn: CDB-ORD-20260928-095"}</span>
    <span className="w-1 h-1 rounded-full bg-outline-variant hidden sm:inline-block"></span>
    <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
    <span className="material-symbols-outlined text-[16px] text-outline">{"event_busy"}</span>{"\n                      Ngày hủy: 28/09/2026\n                    "}</span>
    </div>
    <div className="flex items-center gap-space-xs">
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-[11px] font-bold">
    <span className="w-1.5 h-1.5 rounded-full bg-error"></span>{"\n                      Đã hủy bởi khách\n                    "}</span>
    </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">

    <div className="md:col-span-4 lg:col-span-3">
    <div className="aspect-[16/10] rounded-lg overflow-hidden bg-surface-container relative grayscale-[30%]">
    <img className="w-full h-full object-cover" src="/images/cardb-16da0a3fc924a0e7.webp" alt="Hình ảnh xe CarDB" loading="lazy" decoding="async"/>
    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur text-white font-label-sm text-[10px] rounded">{"\n                        Đã hủy miễn phí\n                      "}</span>
    </div>
    </div>

    <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between gap-space-md">
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
    <div>
    <div className="flex items-center gap-2 mb-0.5">
    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">{"Porsche"}</span>
    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
    <span className="font-label-sm text-[11px] text-primary-container font-semibold">{"Hiệu Suất Cao (GTS)"}</span>
    </div>
    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Porsche Macan GTS 2024"}</h2>
    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{"Khách hàng chủ động thay đổi lịch trình công tác • Hoàn cọc 100% không phát sinh phí"}</p>
    </div>
    <div className="text-left sm:text-right">
    <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline block">{"Phí phạt phát sinh"}</span>
    <div className="flex items-baseline sm:justify-end gap-1">
    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{"0"}</span>
    <span className="font-label-md text-label-md text-on-surface-variant font-medium">{"đ"}</span>
    </div>
    <span className="font-body-sm text-[12px] text-on-surface-variant">{"Miễn phí hủy trước 24h"}</span>
    </div>
    </div>

    <div className="p-space-sm bg-surface-container-low rounded-lg flex flex-wrap items-center justify-between gap-space-xs text-body-sm">
    <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-outline text-[18px]">{"info"}</span>
    <span className="text-on-surface-variant">{"Lý do hủy: Kế hoạch thay đổi đột xuất. Đã giải tỏa cọc ví ngân hàng ngay lập tức."}</span>
    </div>
    <span className="font-technical-data text-[11px] text-outline">{"MÃ HỦY: CDB-CAN-0021"}</span>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
    <button className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors" type="button" aria-label="Chính sách hoàn tiền" data-route="/chinh-sach-huy-chuyen">
    <span className="material-symbols-outlined text-outline text-[18px]">{"policy"}</span>
    <span className="">{"Chính sách hoàn tiền"}</span>
    </button>
    <button className="px-4 py-2 rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center gap-1.5 transition-all" type="button" aria-label="Tìm xe khác tương đương" data-action="search">
    <span className="material-symbols-outlined text-[18px]">{"search"}</span>
    <span className="">{"Tìm xe khác tương đương"}</span>
    </button>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>

    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md mt-space-sm">
    <div className="font-body-sm text-body-sm text-on-surface-variant text-center sm:text-left">{"\n              Hiển thị "}<span className="font-technical-data text-on-surface font-bold">{"1 - 3"}</span>{" của "}<span className="font-technical-data text-on-surface font-bold">{"10"}</span>{" chuyến xe đã thực hiện\n            "}</div>
    <div className="flex-wrap gap-y-2 flex items-center gap-space-xs">
    <button className="pagination-arrow px-3.5 py-1.5 rounded-lg bg-surface-container-low text-outline hover:text-on-surface font-label-md text-label-md flex items-center gap-1 cursor-not-allowed opacity-50" disabled={true} type="button" aria-label="Trước" data-action="page">
    <span className="material-symbols-outlined text-[18px]">{"chevron_left"}</span>
    <span className="hidden sm:inline">{"Trước"}</span>
    </button>
    <div className="flex items-center gap-1 px-1">
    <button className="w-8 h-8 rounded-lg bg-primary-container text-on-primary font-technical-data text-technical-data font-bold shadow-sm" type="button" aria-label="1" data-action="page">{"1"}</button>
    <button className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-technical-data text-technical-data font-semibold" type="button" aria-label="2" data-action="page">{"2"}</button>
    <button className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-technical-data text-technical-data font-semibold" type="button" aria-label="3" data-action="page">{"3"}</button>
    <span className="px-1 text-outline">{"..."}</span>
    <button className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-technical-data text-technical-data font-semibold" type="button" aria-label="4" data-action="page">{"4"}</button>
    </div>
    <button className="pagination-arrow ui-action px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1 transition-colors" type="button" aria-label="Tiếp theo" data-action="page">
    <span className="hidden sm:inline">{"Tiếp theo"}</span>
    <span className="material-symbols-outlined text-[18px]">{"chevron_right"}</span>
    </button>
    </div>
    </div>

    </ProfileLayout>
    </div>);
}
