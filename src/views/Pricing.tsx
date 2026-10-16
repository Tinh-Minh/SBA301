import Link from "next/link";

export default function Pricing() {
  return (
<main className="w-full pt-20 bg-surface"><div className="flex flex-col w-full">

<section className="w-full bg-surface-canvas relative overflow-hidden pb-12 pt-6">
<div className="absolute -top-32 right-10 w-96 h-96 rounded-full bg-secondary-fixed/20 blur-3xl pointer-events-none"></div>
<div className="absolute top-1/2 left-4 w-72 h-72 rounded-full bg-primary-fixed/30 blur-2xl pointer-events-none"></div>
<div className="max-w-[1240px] mx-auto px-margin relative z-10">
<div className="flex flex-wrap items-center gap-2 mb-4 text-on-surface-variant font-label-md text-label-md">
<Link className="hover:text-primary transition-colors flex items-center gap-1" href="/lien-he">
<span className="material-symbols-outlined text-[16px]">{"home"}</span>{" Trang chủ\n        "}</Link>
<span className="text-outline-variant">{"/"}</span>
<span className="text-primary font-semibold">{"Bảng giá & Dòng xe chi tiết"}</span>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-end">
<div className="lg:col-span-8 flex flex-col gap-3">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-label-md w-fit">
<span className="material-symbols-outlined text-[16px] text-tertiary">{"verified"}</span>{"\n            Cam kết 100% minh bạch - Không chi phí ẩn\n          "}</div>
<h1 className="font-display-hero text-display-hero text-primary tracking-tight">{"\n            Bảng giá thuê xe tiêu chuẩn toàn diện\n          "}</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">{"\n            Tất cả mức giá niêm yết đã bao gồm bảo hiểm thân vỏ cơ bản, VAT và dịch vụ hỗ trợ cứu hộ khẩn cấp 24/7 trên 63 tỉnh thành.\n          "}</p>
</div>
<div className="lg:col-span-4 flex lg:justify-end gap-3">
<div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center gap-4 w-full sm:w-auto">
<div className="w-12 h-12 rounded-full bg-surface-tint flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary text-[24px]">{"price_check"}</span>
</div>
<div>
<div className="font-label-md text-label-md text-text-muted">{"Cập nhật kỳ giá"}</div>
<div className="font-headline-sm text-headline-sm text-primary font-bold">{"Tháng 04 / 2025"}</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface py-space-xl">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
<div>
<span className="font-label-md text-label-md text-tertiary uppercase tracking-wider font-bold">{"Phân khúc xe"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary mt-1">{"Dòng xe tự lái sẵn sàng bàn giao"}</h2>
</div>

<div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-full overflow-x-auto self-start">
<button className="px-4 py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-sm transition-all" type="button" data-action="filter">{"Tất cả (48+ xe)"}</button>
<button className="px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all" type="button" data-action="filter">{"Sedan 4-5 chỗ"}</button>
<button className="px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all" type="button" data-action="filter">{"SUV & Crossover"}</button>
<button className="px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all" type="button" data-action="filter">{"MPV 7 chỗ"}</button>
<button className="px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all" type="button" data-action="filter">{"Xe Điện EV"}</button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">

<div className="bg-surface-container-lowest rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group" data-vehicle-card="sedan" data-vehicle-name="Hyundai Accent / Vios" data-price="650000">
<div>
<div className="flex items-center justify-between mb-3">
<span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-md text-[11px] font-bold">{"Hạng A - B Compact"}</span>
<span className="inline-flex items-center gap-1 text-tertiary-container font-label-md text-label-md">
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>{" 4.9\n              "}</span>
</div>
<div className="w-full h-44 rounded-lg overflow-hidden bg-surface-container-low mb-4 relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/f9b359f63b075fc7.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-inverse-surface/80 text-inverse-on-surface font-label-md text-[10px] backdrop-blur-sm">{"\n                Đời xe 2023 - 2024\n              "}</div>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Hyundai Accent / Vios"}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 mb-3">{"Tiết kiệm xăng, linh hoạt phố đông"}</p>
<div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-surface-tint mb-4 text-on-surface-variant font-label-md text-[12px]">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-primary">{"airline_seat_recline_normal"}</span>{" 5 chỗ"}</span>
<span className="w-1 h-1 rounded-full bg-outline-variant"></span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-primary">{"settings"}</span>{" Số tự động"}</span>
<span className="w-1 h-1 rounded-full bg-outline-variant"></span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-primary">{"local_gas_station"}</span>{" 5.6L/100km"}</span>
</div>
</div>
<div>
<div className="mb-3 pt-2">
<div className="font-body-sm text-[11px] text-text-muted">{"Giá thuê ngày thường"}</div>
<div className="flex items-baseline gap-1">
<span className="font-price-display text-price-display text-primary font-bold">{"650.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
<div className="font-body-sm text-[11px] text-on-surface-variant">{"Cuối tuần: 750.000₫ • Cọc xe: 5.000.000₫"}</div>
</div>
<button className="w-full py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-colors flex items-center justify-center gap-1" type="button" data-action="book">{"\n              Đặt xe nhanh "}<span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
</button>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group" data-vehicle-card="sedan" data-vehicle-name="Mazda 3 / Cerato K3" data-price="900000">
<div>
<div className="flex items-center justify-between mb-3">
<span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-md text-[11px] font-bold">{"Hạng C - Sedan Cao Cấp"}</span>
<span className="inline-flex items-center gap-1 text-tertiary-container font-label-md text-label-md">
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>{" 5.0\n              "}</span>
</div>
<div className="w-full h-44 rounded-lg overflow-hidden bg-surface-container-low mb-4 relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/bf56c33de8b5d43a.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-inverse-surface/80 text-inverse-on-surface font-label-md text-[10px] backdrop-blur-sm">{"\n                Đời xe 2024 Mới 100%\n              "}</div>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Mazda 3 / Cerato K3"}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 mb-3">{"Thiết kế thời thượng, cách âm chuẩn"}</p>
<div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-surface-tint mb-4 text-on-surface-variant font-label-md text-[12px]">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-primary">{"airline_seat_recline_normal"}</span>{" 5 chỗ"}</span>
<span className="w-1 h-1 rounded-full bg-outline-variant"></span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-primary">{"settings"}</span>{" Số tự động"}</span>
<span className="w-1 h-1 rounded-full bg-outline-variant"></span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-primary">{"local_gas_station"}</span>{" 6.2L/100km"}</span>
</div>
</div>
<div>
<div className="mb-3 pt-2">
<div className="font-body-sm text-[11px] text-text-muted">{"Giá thuê ngày thường"}</div>
<div className="flex items-baseline gap-1">
<span className="font-price-display text-price-display text-primary font-bold">{"900.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
<div className="font-body-sm text-[11px] text-on-surface-variant">{"Cuối tuần: 1.050.000₫ • Cọc xe: 8.000.000₫"}</div>
</div>
<button className="w-full py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-colors flex items-center justify-center gap-1" type="button" data-action="book">{"\n              Đặt xe nhanh "}<span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
</button>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative group">
<div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-tertiary-container text-on-tertiary font-label-md text-[10px] uppercase font-bold tracking-wider shadow-sm">{"\n            Thuê Nhiều Nhất\n          "}</div>
<div>
<div className="flex items-center justify-between mb-3">
<span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-md text-[11px] font-bold">{"SUV 7 Chỗ Đa Dụng"}</span>
<span className="inline-flex items-center gap-1 text-tertiary-container font-label-md text-label-md">
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>{" 4.95\n              "}</span>
</div>
<div className="w-full h-44 rounded-lg overflow-hidden bg-surface-container-low mb-4 relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/edd6ab648265ded8.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-inverse-surface/80 text-inverse-on-surface font-label-md text-[10px] backdrop-blur-sm">{"\n                Đời xe 2023 - 2024\n              "}</div>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Xpander / Veloz Cross"}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 mb-3">{"Khoang rộng, gầm cao cho gia đình"}</p>
<div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-surface-tint mb-4 text-on-surface-variant font-label-md text-[12px]">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-primary">{"airline_seat_recline_normal"}</span>{" 7 chỗ"}</span>
<span className="w-1 h-1 rounded-full bg-outline-variant"></span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-primary">{"settings"}</span>{" Tự động CVT"}</span>
<span className="w-1 h-1 rounded-full bg-outline-variant"></span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-primary">{"local_gas_station"}</span>{" 6.8L/100km"}</span>
</div>
</div>
<div>
<div className="mb-3 pt-2">
<div className="font-body-sm text-[11px] text-text-muted">{"Giá thuê ngày thường"}</div>
<div className="flex items-baseline gap-1">
<span className="font-price-display text-price-display text-primary font-bold">{"950.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
<div className="font-body-sm text-[11px] text-on-surface-variant">{"Cuối tuần: 1.150.000₫ • Cọc xe: 8.000.000₫"}</div>
</div>
<button className="w-full py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-colors flex items-center justify-center gap-1" type="button" data-action="book">{"\n              Đặt xe nhanh "}<span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
</button>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group" data-vehicle-card="ev" data-vehicle-name="VinFast VF8 Plus" data-price="1450000">
<div>
<div className="flex items-center justify-between mb-3">
<span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-[11px] font-bold">{"EV Thuần Điện Xanh"}</span>
<span className="inline-flex items-center gap-1 text-tertiary-container font-label-md text-label-md">
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>{" 4.98\n              "}</span>
</div>
<div className="w-full h-44 rounded-lg overflow-hidden bg-surface-container-low mb-4 relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/a3ea4b82276f5812.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-inverse-surface/80 text-inverse-on-surface font-label-md text-[10px] backdrop-blur-sm">{"\n                Miễn phí sạc pin\n              "}</div>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"VinFast VF8 Plus"}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 mb-3">{"Tăng tốc vượt trội, full tính năng ADAS"}</p>
<div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-surface-tint mb-4 text-on-surface-variant font-label-md text-[12px]">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-primary">{"airline_seat_recline_normal"}</span>{" 5 chỗ"}</span>
<span className="w-1 h-1 rounded-full bg-outline-variant"></span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-primary">{"bolt"}</span>{" 420km/sạc"}</span>
<span className="w-1 h-1 rounded-full bg-outline-variant"></span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-primary">{"speed"}</span>{" 402 HP"}</span>
</div>
</div>
<div>
<div className="mb-3 pt-2">
<div className="font-body-sm text-[11px] text-text-muted">{"Giá thuê ngày thường"}</div>
<div className="flex items-baseline gap-1">
<span className="font-price-display text-price-display text-primary font-bold">{"1.450.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
<div className="font-body-sm text-[11px] text-on-surface-variant">{"Cuối tuần: 1.650.000₫ • Cọc xe: 10.000.000₫"}</div>
</div>
<button className="w-full py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-colors flex items-center justify-center gap-1" type="button" data-action="book">{"\n              Đặt xe nhanh "}<span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
</button>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface-canvas py-space-2xl relative">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-10 shadow-lg">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">

<div className="lg:col-span-7 flex flex-col gap-6">
<div>
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-tint text-primary font-label-md text-label-md mb-2">
<span className="material-symbols-outlined text-[16px]">{"calculate"}</span>{"\n                Công cụ dự toán chi phí thông minh\n              "}</div>
<h2 className="font-headline-lg text-headline-lg text-primary">{"Tính toán chi phí thuê xe ước tính"}</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">{"\n                Kéo chỉnh số ngày dự kiến và chọn loại xe phù hợp để nhận ngay bảng hạch toán tổng chi phí chi tiết.\n              "}</p>
</div>

<div className="flex flex-col gap-2">
<label className="font-label-lg text-label-lg text-on-surface font-semibold">{"Chọn phân khúc xe mong muốn"}</label>
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
<button className="vehicle-select-btn p-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md flex flex-col items-center gap-1 transition-all" data-name="Compact 4-5 Chỗ" data-rate="650000" type="button">
<span className="material-symbols-outlined text-[20px]">{"directions_car"}</span>
<span>{"Compact A-B"}</span>
<span className="text-[11px] opacity-80">{"650k / ngày"}</span>
</button>
<button className="vehicle-select-btn p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex flex-col items-center gap-1 transition-all" data-name="Sedan C Cao Cấp" data-rate="900000" type="button" data-action="filter">
<span className="material-symbols-outlined text-[20px]">{"airport_shuttle"}</span>
<span>{"Sedan C"}</span>
<span className="text-[11px] text-text-muted">{"900k / ngày"}</span>
</button>
<button className="vehicle-select-btn p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex flex-col items-center gap-1 transition-all" data-name="SUV 7 Chỗ Đa Dụng" data-rate="950000" type="button" data-action="filter">
<span className="material-symbols-outlined text-[20px]">{"rv_hookup"}</span>
<span>{"SUV 7 Chỗ"}</span>
<span className="text-[11px] text-text-muted">{"950k / ngày"}</span>
</button>
<button className="vehicle-select-btn p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex flex-col items-center gap-1 transition-all" data-name="Xe Điện VinFast VF8" data-rate="1450000" type="button">
<span className="material-symbols-outlined text-[20px]">{"electric_car"}</span>
<span>{"Điện Xanh EV"}</span>
<span className="text-[11px] text-text-muted">{"1.450k / ngày"}</span>
</button>
</div>
</div>

<div className="flex flex-col gap-3">
<div className="flex justify-between items-center">
<label className="font-label-lg text-label-lg text-on-surface font-semibold" htmlFor="rental-days-range">{"Thời gian thuê"}</label>
<span className="font-headline-sm text-headline-sm text-primary font-bold"><span id="days-display">{"3"}</span>{" ngày"}</span>
</div>
<input className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary" id="rental-days-range" max="30" min="1" type="range" defaultValue="3" aria-label="Thông tin" />
<div className="flex justify-between font-body-sm text-[11px] text-text-muted">
<span>{"1 ngày"}</span>
<span>{"Thuê > 3 ngày: -5%"}</span>
<span>{"Thuê > 7 ngày: -12%"}</span>
<span>{"30 ngày (-25%)"}</span>
</div>
</div>

<div className="flex flex-col gap-2">
<label className="font-label-lg text-label-lg text-on-surface font-semibold">{"Dịch vụ bổ trợ (Tùy chọn)"}</label>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
<label className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
<input className="w-4 h-4 text-primary rounded focus:ring-0 cursor-pointer" id="addon-delivery" type="checkbox" aria-label="Chọn tùy chọn" />
<div className="text-left">
<div className="font-label-md text-label-md text-on-surface">{"Giao xe tận nơi"}</div>
<div className="font-body-sm text-[11px] text-text-muted">{"+ 150.000₫ / lượt"}</div>
</div>
</label>
<label className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
<input className="w-4 h-4 text-primary rounded focus:ring-0 cursor-pointer" id="addon-insurance" type="checkbox" defaultChecked={true} aria-label="Chọn tùy chọn" />
<div className="text-left">
<div className="font-label-md text-label-md text-on-surface">{"Gói Bảo Hiểm Toàn Diện VIP"}</div>
<div className="font-body-sm text-[11px] text-text-muted">{"+ 99.000₫ / ngày (Miễn khấu trừ)"}</div>
</div>
</label>
</div>
</div>
</div>

<div className="lg:col-span-5">
<div className="bg-surface-tint rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between pb-4 border-b border-border-subtle">
<div className="font-headline-sm text-headline-sm text-primary font-bold">{"Hạch Toán Chi Phí"}</div>
<span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-md text-[11px] font-bold">{"Ước tính ngay"}</span>
</div>
<div className="flex flex-col gap-3 py-4 text-body-md font-body-md">
<div className="flex justify-between items-center">
<span className="text-on-surface-variant" id="receipt-car-name">{"Compact 4-5 Chỗ ("}<span id="receipt-days">{"3"}</span>{" ngày)"}</span>
<span className="font-semibold text-on-surface" id="receipt-base-price">{"1.950.000₫"}</span>
</div>
<div className="flex justify-between items-center text-status-success font-medium">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">{"loyalty"}</span>{"\n                      Chiết khấu thời gian dài ("}<span id="receipt-discount-percent">{"5%"}</span>{")\n                    "}</span>
<span id="receipt-discount-amount">{"-97.500₫"}</span>
</div>
<div className="flex justify-between items-center">
<span className="text-on-surface-variant">{"Bảo hiểm toàn diện VIP"}</span>
<span className="font-semibold text-on-surface" id="receipt-insurance-price">{"297.000₫"}</span>
</div>
<div className="flex justify-between items-center">
<span className="text-on-surface-variant">{"Phí giao nhận xe"}</span>
<span className="font-semibold text-on-surface" id="receipt-delivery-price">{"0₫"}</span>
</div>
<div className="flex justify-between items-center text-text-muted text-[12px] pt-1">
<span>{"Thuế GTGT (VAT 8%)"}</span>
<span id="receipt-vat">{"171.960₫"}</span>
</div>
</div>
</div>
<div className="pt-4 border-t border-border-subtle">
<div className="flex justify-between items-end mb-4">
<div>
<div className="font-label-md text-label-md text-text-muted">{"Tổng dự kiến thanh toán"}</div>
<div className="font-price-display text-[26px] leading-8 text-primary font-bold" id="receipt-grand-total">{"\n                      2.321.460₫\n                    "}</div>
</div>
<div className="text-right">
<div className="font-body-sm text-[11px] text-text-muted">{"Tiền đặt cọc giữ xe"}</div>
<div className="font-label-lg text-label-lg text-on-surface font-semibold" id="receipt-deposit">{"5.000.000₫"}</div>
</div>
</div>
<button className="w-full py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-all shadow-md flex items-center justify-center gap-2" type="button" data-action="book">
<span className="material-symbols-outlined text-[20px]">{"calendar_month"}</span>{"\n                  Tiến hành giữ xe với mức giá này\n                "}</button>
<p className="text-center font-body-sm text-[11px] text-text-muted mt-2.5">{"\n                  Không trừ tiền trước • Miễn phí hủy trước 24 giờ nhận xe\n                "}</p>
</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface py-space-2xl">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="text-center max-w-2xl mx-auto mb-10">
<span className="font-label-md text-label-md text-tertiary uppercase tracking-wider font-bold">{"So sánh chi tiết"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary mt-1">{"Bảng so sánh thông số & quyền lợi thuê xe"}</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">{"\n          Chi tiết quyền lợi, hạn mức di chuyển và định mức tiêu hao minh bạch cho từng nhóm xe.\n        "}</p>
</div>

<div className="overflow-x-auto rounded-2xl shadow-sm bg-surface-container-lowest">
<div className="table-scroll" tabIndex={0} aria-label="Bảng thông tin, cuộn ngang để xem thêm"><table className="w-full text-left border-collapse min-w-[760px]">
<thead>
<tr className="bg-surface-container-high text-primary font-label-lg text-label-lg">
<th className="p-4 pl-6">{"Hạng xe & Đại diện tiêu biểu"}</th>
<th className="p-4">{"Ngày thường"}</th>
<th className="p-4">{"T7 & Chủ Nhật"}</th>
<th className="p-4">{"Hạn mức Km / ngày"}</th>
<th className="p-4">{"Mức cọc thế chấp"}</th>
<th className="p-4 pr-6 text-center">{"Bảo hiểm đi kèm"}</th>
</tr>
</thead>
<tbody className="divide-y divide-border-subtle font-body-md text-body-md text-on-surface">

<tr className="hover:bg-surface-tint/50 transition-colors">
<td className="p-4 pl-6">
<div className="font-semibold text-primary">{"Hạng A - Đô thị cỡ nhỏ"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Kia Morning, Hyundai Grand i10, VinFast VF3"}</div>
</td>
<td className="p-4 font-semibold">{"550.000₫"}</td>
<td className="p-4">{"650.000₫"}</td>
<td className="p-4">{"350 km / ngày"}</td>
<td className="p-4">{"5.000.000₫ / Xe máy"}</td>
<td className="p-4 pr-6 text-center">
<span className="inline-flex items-center gap-1 text-primary font-label-md text-[12px] bg-surface-tint px-2 py-0.5 rounded-full">
<span className="material-symbols-outlined text-[15px]">{"shield"}</span>{" Thân vỏ cơ bản\n                "}</span>
</td>
</tr>

<tr className="hover:bg-surface-tint/50 transition-colors">
<td className="p-4 pl-6">
<div className="font-semibold text-primary">{"Hạng B - Sedan thông dụng"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Toyota Vios, Honda City, Hyundai Accent"}</div>
</td>
<td className="p-4 font-semibold">{"650.000₫"}</td>
<td className="p-4">{"750.000₫"}</td>
<td className="p-4">{"350 km / ngày"}</td>
<td className="p-4">{"5.000.000₫ / Xe máy"}</td>
<td className="p-4 pr-6 text-center">
<span className="inline-flex items-center gap-1 text-primary font-label-md text-[12px] bg-surface-tint px-2 py-0.5 rounded-full">
<span className="material-symbols-outlined text-[15px]">{"shield"}</span>{" Thân vỏ cơ bản\n                "}</span>
</td>
</tr>

<tr className="hover:bg-surface-tint/50 transition-colors">
<td className="p-4 pl-6">
<div className="font-semibold text-primary">{"Hạng C - Sedan trung cấp"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Mazda 3, Kia K3, Hyundai Elantra"}</div>
</td>
<td className="p-4 font-semibold">{"900.000₫"}</td>
<td className="p-4">{"1.050.000₫"}</td>
<td className="p-4">{"400 km / ngày"}</td>
<td className="p-4">{"8.000.000₫ / Xe máy HQ"}</td>
<td className="p-4 pr-6 text-center">
<span className="inline-flex items-center gap-1 text-primary font-label-md text-[12px] bg-surface-tint px-2 py-0.5 rounded-full">
<span className="material-symbols-outlined text-[15px]">{"shield"}</span>{" Thân vỏ cơ bản\n                "}</span>
</td>
</tr>

<tr className="hover:bg-surface-tint/50 transition-colors">
<td className="p-4 pl-6">
<div className="font-semibold text-primary">{"SUV & Crossover 5 chỗ"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Mazda CX-5, Hyundai Tucson, Kia Seltos"}</div>
</td>
<td className="p-4 font-semibold">{"1.100.000₫"}</td>
<td className="p-4">{"1.300.000₫"}</td>
<td className="p-4">{"400 km / ngày"}</td>
<td className="p-4">{"10.000.000₫"}</td>
<td className="p-4 pr-6 text-center">
<span className="inline-flex items-center gap-1 text-primary font-label-md text-[12px] bg-surface-tint px-2 py-0.5 rounded-full">
<span className="material-symbols-outlined text-[15px]">{"shield"}</span>{" Thân vỏ cơ bản\n                "}</span>
</td>
</tr>

<tr className="hover:bg-surface-tint/50 transition-colors">
<td className="p-4 pl-6">
<div className="font-semibold text-primary">{"MPV 7 Chỗ Đa dụng"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Mitsubishi Xpander, Toyota Veloz, Suzuki XL7"}</div>
</td>
<td className="p-4 font-semibold">{"950.000₫"}</td>
<td className="p-4">{"1.150.000₫"}</td>
<td className="p-4">{"400 km / ngày"}</td>
<td className="p-4">{"8.000.000₫"}</td>
<td className="p-4 pr-6 text-center">
<span className="inline-flex items-center gap-1 text-primary font-label-md text-[12px] bg-surface-tint px-2 py-0.5 rounded-full">
<span className="material-symbols-outlined text-[15px]">{"shield"}</span>{" Thân vỏ cơ bản\n                "}</span>
</td>
</tr>

<tr className="hover:bg-surface-tint/50 transition-colors">
<td className="p-4 pl-6">
<div className="font-semibold text-primary">{"SUV 7 Chỗ Khung gầm rời cỡ lớn"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Ford Everest Titanium, Toyota Fortuner"}</div>
</td>
<td className="p-4 font-semibold">{"1.500.000₫"}</td>
<td className="p-4">{"1.750.000₫"}</td>
<td className="p-4">{"400 km / ngày"}</td>
<td className="p-4">{"15.000.000₫"}</td>
<td className="p-4 pr-6 text-center">
<span className="inline-flex items-center gap-1 text-status-success font-label-md text-[12px] bg-surface-tint px-2 py-0.5 rounded-full">
<span className="material-symbols-outlined text-[15px]">{"verified_user"}</span>{" Bảo hiểm 2 chiều VIP\n                "}</span>
</td>
</tr>

<tr className="hover:bg-surface-tint/50 transition-colors bg-surface-container/30">
<td className="p-4 pl-6">
<div className="font-semibold text-primary">{"Xe thuần điện thông minh (EV)"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"VinFast VF6, VF7, VF8 (Miễn phí tiền trạm sạc)"}</div>
</td>
<td className="p-4 font-semibold">{"1.450.000₫"}</td>
<td className="p-4">{"1.650.000₫"}</td>
<td className="p-4">{"450 km / ngày"}</td>
<td className="p-4">{"10.000.000₫"}</td>
<td className="p-4 pr-6 text-center">
<span className="inline-flex items-center gap-1 text-status-success font-label-md text-[12px] bg-surface-tint px-2 py-0.5 rounded-full">
<span className="material-symbols-outlined text-[15px]">{"verified_user"}</span>{" Bảo hiểm 2 chiều VIP\n                "}</span>
</td>
</tr>
</tbody>
</table></div>
</div>
</div>
</section>

<section className="w-full bg-surface-canvas py-space-xl">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="flex flex-col lg:flex-row justify-between items-start gap-gutter mb-10">
<div className="max-w-xl">
<span className="font-label-md text-label-md text-tertiary uppercase tracking-wider font-bold">{"Chính sách phụ phí rõ ràng"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary mt-1">{"Các khoản phụ phí phát sinh (nếu có)"}</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">{"\n            Kanow nói không với chi phí ẩn. Mọi khoản tính phát sinh ngoài gói thuê ban đầu đều được quy định minh bạch và áp dụng theo định mức niêm yết dưới đây.\n          "}</p>
</div>
<div className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-high text-primary max-w-md">
<span className="material-symbols-outlined text-[32px] text-tertiary shrink-0">{"info"}</span>
<div className="font-body-sm text-body-sm">
<span className="font-bold text-on-surface">{"Lưu ý ngày Lễ / Tết:"}</span>{" Giá ngày nghỉ Tết Nguyên Đán, Lễ 30/4 - 1/5 và 2/9 phụ thu tối đa từ 30% - 45% theo thông báo công khai trước 30 ngày.\n          "}</div>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">

<div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center text-primary mb-4">
<span className="material-symbols-outlined text-[20px]">{"add_road"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Phụ trội km di chuyển"}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-4">{"\n              Áp dụng khi tổng quãng đường di chuyển vượt định mức theo ngày đã đăng ký.\n            "}</p>
</div>
<div className="pt-4 border-t border-border-subtle">
<div className="font-price-display text-price-display text-primary">{"3.000₫ – 4.000₫"}</div>
<div className="font-body-sm text-[12px] text-text-muted">{"trên mỗi 1 km vượt mức"}</div>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center text-primary mb-4">
<span className="material-symbols-outlined text-[20px]">{"schedule"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Phụ trội giờ hoàn trả xe"}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-4">{"\n              Gia hạn linh hoạt khi chưa kịp trả xe đúng giờ hợp đồng hẹn trước.\n            "}</p>
</div>
<div className="pt-4 border-t border-border-subtle">
<div className="font-price-display text-price-display text-primary">{"70.000₫ – 100.000₫"}</div>
<div className="font-body-sm text-[12px] text-text-muted">{"trên mỗi giờ phát sinh (< 5h)"}</div>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center text-primary mb-4">
<span className="material-symbols-outlined text-[20px]">{"cleaning_services"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Phí vệ sinh khoang xe"}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-4">{"\n              Chỉ áp dụng khi nội thất xe bị vấy bẩn nặng, dính mùi thuốc lá, hải sản hoặc bùn đất.\n            "}</p>
</div>
<div className="pt-4 border-t border-border-subtle">
<div className="font-price-display text-price-display text-primary">{"100.000₫ – 250.000₫"}</div>
<div className="font-body-sm text-[12px] text-text-muted">{"cho dịch vụ khử khuẩn xông tinh dầu"}</div>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center text-primary mb-4">
<span className="material-symbols-outlined text-[20px]">{"local_shipping"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Giao xe tận nơi & Sân bay"}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-4">{"\n              Miễn phí giao xe trong bán kính 5km từ các trạm Kanow Hub trung tâm.\n            "}</p>
</div>
<div className="pt-4 border-t border-border-subtle">
<div className="font-price-display text-price-display text-primary">{"15.000₫ / km"}</div>
<div className="font-body-sm text-[12px] text-text-muted">{"cho quãng đường vượt bán kính 5km"}</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface py-space-2xl">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="bg-primary-container text-on-primary rounded-3xl p-8 sm:p-12 relative overflow-hidden">
<div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-secondary-fixed/10 blur-3xl pointer-events-none"></div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
<div className="lg:col-span-7 flex flex-col gap-4">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/10 text-on-primary font-label-md text-label-md w-fit">
<span className="material-symbols-outlined text-[16px]">{"business_center"}</span>{"\n              Giải pháp Doanh nghiệp B2B & Thuê tháng\n            "}</div>
<h2 className="font-headline-lg text-headline-lg text-on-primary tracking-tight">{"\n              Tối ưu chi phí vận hành với gói thuê xe dài hạn Kanow Fleet\n            "}</h2>
<p className="font-body-lg text-body-lg text-on-primary-container max-w-xl">{"\n              Dịch vụ thuê xe hợp đồng từ 1 tháng đến 3 năm dành cho chuyên gia, lãnh đạo cấp cao và doanh nghiệp lữ hành. Tiết kiệm tới 35% chi phí sở hữu tài sản.\n            "}</p>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
<div className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-secondary-fixed text-[20px] shrink-0">{"check_circle"}</span>
<span className="font-body-md text-body-md text-on-primary">{"Xuất hóa đơn VAT đầu vào đầy đủ hợp lệ"}</span>
</div>
<div className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-secondary-fixed text-[20px] shrink-0">{"check_circle"}</span>
<span className="font-body-md text-body-md text-on-primary">{"Miễn phí bảo dưỡng định kỳ & thay thế xe"}</span>
</div>
<div className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-secondary-fixed text-[20px] shrink-0">{"check_circle"}</span>
<span className="font-body-md text-body-md text-on-primary">{"Tùy chọn kèm lái xe chuyên nghiệp tiếng Anh"}</span>
</div>
<div className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-secondary-fixed text-[20px] shrink-0">{"check_circle"}</span>
<span className="font-body-md text-body-md text-on-primary">{"Bảo lãnh hạn mức & công nợ 30 ngày linh hoạt"}</span>
</div>
</div>
<div className="flex flex-wrap items-center gap-4 pt-2">
<Link className="px-6 py-3 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-lg text-label-lg font-bold hover:bg-secondary-fixed-dim transition-all shadow-md" href="/lien-he">{"\n                Tải Báo Giá Doanh Nghiệp (PDF)\n              "}</Link>
<a className="px-6 py-3 rounded-full bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary font-label-lg text-label-lg transition-colors flex items-center gap-2" href="tel:19008888">
<span className="material-symbols-outlined text-[18px]">{"call"}</span>{"\n                Gặp chuyên viên tư vấn Fleet\n              "}</a>
</div>
</div>
<div className="lg:col-span-5">
<div className="bg-surface-container-lowest text-on-surface p-6 sm:p-7 rounded-2xl shadow-xl flex flex-col gap-4">
<div className="flex items-center justify-between">
<span className="font-label-lg text-label-lg text-primary font-bold">{"Gói Tháng Tiết Kiệm Tiêu Biểu"}</span>
<span className="px-2 py-0.5 rounded bg-surface-tint text-primary font-label-md text-[11px] font-bold">{"30 Ngày"}</span>
</div>
<div className="flex items-baseline gap-2">
<span className="font-headline-lg text-[32px] text-primary font-bold">{"14.500.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ tháng"}</span>
</div>
<div className="font-body-sm text-body-sm text-on-surface-variant">{"\n                Áp dụng cho dòng xe Sedan Hạng B (Vios, Accent đời 2023+). Giới hạn 3.000 km/tháng, bao gồm bảo hiểm 2 chiều toàn diện.\n              "}</div>
<div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between text-body-sm font-body-sm">
<span>{"So với thuê theo ngày:"}</span>
<span className="font-semibold text-status-success">{"Tiết kiệm 5.000.000₫"}</span>
</div>
<button className="w-full py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-colors" type="button">{"\n                Yêu cầu báo giá theo đội xe riêng\n              "}</button>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface-canvas py-space-2xl">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="text-center max-w-2xl mx-auto mb-10">
<span className="font-label-md text-label-md text-tertiary uppercase tracking-wider font-bold">{"Giải đáp thắc mắc"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary mt-1">{"Câu hỏi thường gặp về giá & thủ tục"}</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">{"\n          Mọi điều bạn cần nắm rõ trước khi đặt cọc và nhận bàn giao xe tự lái tại Kanow.\n        "}</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

<div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-2">
<div className="flex items-center gap-3 text-primary">
<span className="material-symbols-outlined text-[22px]">{"help"}</span>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{"Giá niêm yết đã bao gồm thuế VAT chưa?"}</h3>
</div>
<p className="font-body-md text-body-md text-on-surface-variant pl-8">{"\n            Giá hiển thị trên website dành cho khách hàng cá nhân đã bao gồm bảo hiểm vật chất cơ bản. Khi khách hàng có nhu cầu xuất hóa đơn điện tử GTGT cho công ty, thuế suất VAT 8% hoặc 10% sẽ được tính bổ sung theo quy định pháp luật.\n          "}</p>
</div>

<div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-2">
<div className="flex items-center gap-3 text-primary">
<span className="material-symbols-outlined text-[22px]">{"help"}</span>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{"Thủ tục đặt cọc và hoàn cọc diễn ra thế nào?"}</h3>
</div>
<p className="font-body-md text-body-md text-on-surface-variant pl-8">{"\n            Bạn có thể cọc bằng tiền mặt (5 - 15 triệu tùy hạng xe) hoặc để lại xe máy chính chủ có cavet gốc. Tiền cọc sẽ được hoàn trả 100% ngay khi khách hàng trả xe và hoàn tất biên bản kiểm tra ngoại quan.\n          "}</p>
</div>

<div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-2">
<div className="flex items-center gap-3 text-primary">
<span className="material-symbols-outlined text-[22px]">{"help"}</span>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{"Xử lý thế nào nếu gặp sự cố va quẹt trên đường?"}</h3>
</div>
<p className="font-body-md text-body-md text-on-surface-variant pl-8">{"\n            Tất cả xe tại Kanow đều có bảo hiểm vật chất 2 chiều. Khách hàng chỉ cần giữ nguyên hiện trường và gọi ngay tổng đài cứu hộ 1900 8888. Mức miễn thường tối đa là 500.000₫ - 1.000.000₫/vụ nếu đã mua gói bảo hiểm nâng cao.\n          "}</p>
</div>

<div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-2">
<div className="flex items-center gap-3 text-primary">
<span className="material-symbols-outlined text-[22px]">{"help"}</span>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{"Chính sách hoàn tiền khi hủy chuyến đột xuất?"}</h3>
</div>
<p className="font-body-md text-body-md text-on-surface-variant pl-8">{"\n            Khách hàng được hoàn trả 100% tiền giữ chỗ nếu báo hủy trước 24 giờ so với thời điểm nhận xe. Nếu hủy trong vòng 24 giờ, phí hủy là 30% giá trị hợp đồng ngày đầu tiên.\n          "}</p>
</div>
</div>

<div className="mt-12 p-6 rounded-2xl bg-surface-container-low max-w-4xl mx-auto flex flex-wrap items-center justify-around gap-6 text-on-surface">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-[28px]">{"lock"}</span>
<div>
<div className="font-label-lg text-label-lg font-bold">{"Bảo Mật Hợp Đồng"}</div>
<div className="font-body-sm text-[12px] text-text-muted">{"Ký số điện tử tiện lợi"}</div>
</div>
</div>
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-[28px]">{"credit_card"}</span>
<div>
<div className="font-label-lg text-label-lg font-bold">{"Thanh Toán Linh Hoạt"}</div>
<div className="font-body-sm text-[12px] text-text-muted">{"Chuyển khoản, Visa/Mastercard, QR"}</div>
</div>
</div>
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-[28px]">{"headset_mic"}</span>
<div>
<div className="font-label-lg text-label-lg font-bold">{"Cứu Hộ Toàn Quốc"}</div>
<div className="font-body-sm text-[12px] text-text-muted">{"Hỗ trợ 24/7 không gián đoạn"}</div>
</div>
</div>
</div>
</div>
</section>


</div></main>
  );
}
