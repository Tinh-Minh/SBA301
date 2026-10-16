import Link from "next/link";

export default function SelfDrive() {
  return (
<main className="w-full pt-20 bg-surface"><div className="flex flex-col w-full">

<section className="relative w-full overflow-hidden bg-primary pb-space-2xl">

<div className="absolute -top-32 right-10 w-96 h-96 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>
<div className="absolute top-1/2 left-4 w-80 h-80 bg-primary-container/40 rounded-full blur-2xl pointer-events-none"></div>
<div className="max-w-[1240px] mx-auto px-margin pt-space-xl relative z-10">
<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg mb-space-xl">
<div className="max-w-2xl text-on-primary">
<div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-canvas/15 backdrop-blur-md mb-space-sm">
<span className="material-symbols-outlined text-secondary-fixed text-[18px]">{"verified_user"}</span>
<span className="font-label-md text-label-md text-secondary-fixed tracking-wide uppercase font-semibold">{"100% Xe Đời Mới 2022 - 2025"}</span>
</div>
<h1 className="font-display-hero text-display-hero tracking-tight leading-tight mb-space-sm text-on-primary">{"\n            Thuê Xe Tự Lái Chuẩn Gu. "}<br className="hidden sm:inline" />{"Tự Do Bứt Phá Hành Trình.\n          "}</h1>
<p className="font-body-lg text-body-lg text-on-primary-container max-w-xl">{"\n            Thủ tục số hoá eKYC phê duyệt trong 5 phút, nhận xe tận nơi tại các thành phố lớn mà không cần thế chấp tài sản giá trị cao.\n          "}</p>
</div>

<div className="bg-surface-container-lowest/10 backdrop-blur-md p-space-lg rounded-xl text-on-primary flex items-center gap-space-lg shadow-lg">
<div>
<div className="font-headline-lg text-headline-lg font-bold text-secondary-fixed">{"8.900+"}</div>
<div className="font-body-sm text-body-sm text-surface-tint">{"Xe sẵn sàng bàn giao"}</div>
</div>
<div className="w-px h-10 bg-on-primary/20"></div>
<div>
<div className="font-headline-lg text-headline-lg font-bold text-tertiary-fixed">{"4.9/5"}</div>
<div className="font-body-sm text-body-sm text-surface-tint">{"Đánh giá hành trình"}</div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-xl p-space-md lg:p-space-lg">

<div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-md">
<div className="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-full">
<button className="px-space-md py-1.5 rounded-full font-label-md text-label-md bg-primary text-on-primary shadow-sm flex items-center gap-1.5 transition-all" type="button">
<span className="material-symbols-outlined text-[16px]">{"directions_car"}</span>
<span>{"Theo ngày"}</span>
</button>
<button className="px-space-md py-1.5 rounded-full font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-1.5" type="button">
<span className="material-symbols-outlined text-[16px]">{"calendar_month"}</span>
<span>{"Theo tháng (Ưu đãi)"}</span>
</button>
</div>
<div className="flex items-center gap-space-md text-text-muted font-label-md text-label-md">
<label className="flex items-center gap-space-xs cursor-pointer select-none">
<input className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary" type="checkbox" defaultChecked={true} aria-label="Chọn tùy chọn" />
<span>{"Giao xe tận nhà / Khách sạn miễn phí"}</span>
</label>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-sm">

<div className="bg-surface-container-low rounded-lg p-space-sm flex items-center gap-space-sm focus-within:bg-surface-container-lowest focus-within:shadow-md transition-all">
<div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary text-[20px]">{"location_on"}</span>
</div>
<div className="min-w-0 flex-1">
<span className="block font-label-md text-label-md text-text-muted">{"Địa điểm nhận xe"}</span>
<input className="w-full bg-transparent font-label-lg text-label-lg text-on-surface focus:outline-none truncate" type="text" defaultValue="Hồ Chí Minh (Quận 1, Tân Bình, TP Thủ Đức...)" aria-label="Thông tin" />
</div>
</div>

<div className="bg-surface-container-low rounded-lg p-space-sm flex items-center gap-space-sm focus-within:bg-surface-container-lowest focus-within:shadow-md transition-all">
<div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary text-[20px]">{"calendar_today"}</span>
</div>
<div className="min-w-0 flex-1">
<span className="block font-label-md text-label-md text-text-muted">{"Ngày nhận"}</span>
<div className="flex items-center justify-between font-label-lg text-label-lg text-on-surface">
<span>{"08:00, 26/04/2025"}</span>
</div>
</div>
</div>

<div className="bg-surface-container-low rounded-lg p-space-sm flex items-center gap-space-sm focus-within:bg-surface-container-lowest focus-within:shadow-md transition-all">
<div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary text-[20px]">{"event_repeat"}</span>
</div>
<div className="min-w-0 flex-1">
<span className="block font-label-md text-label-md text-text-muted">{"Ngày trả"}</span>
<div className="flex items-center justify-between font-label-lg text-label-lg text-on-surface">
<span>{"20:00, 28/04/2025"}</span>
</div>
</div>
</div>

<div className="flex items-center">
<button className="w-full h-full min-h-[52px] bg-tertiary-container hover:bg-tertiary text-on-tertiary rounded-lg font-label-lg text-label-lg shadow-md flex items-center justify-center gap-space-xs transition-all hover:scale-[1.01] active:scale-[0.99]" type="button" data-action="search">
<span className="material-symbols-outlined text-[22px]">{"search"}</span>
<span className="font-bold uppercase tracking-wider">{"Tìm xe ngay"}</span>
</button>
</div>
</div>
</div>
</div>
</section>

<section className="max-w-[1240px] mx-auto px-margin -mt-4 relative z-20 w-full">
<div className="flex items-center gap-space-xs overflow-x-auto py-2 no-scrollbar">
<button className="px-space-md py-space-xs rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1" type="button" data-action="filter">
<span>{"Tất cả dòng xe"}</span>
<span className="bg-primary-container text-on-primary-container px-1.5 py-0.2 rounded-full text-[10px]">{"142"}</span>
</button>
<button className="px-space-md py-space-xs rounded-full bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-md text-label-md shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1 transition-all" type="button" data-action="filter">
<span>{"Sedan 4-5 Chỗ"}</span>
</button>
<button className="px-space-md py-space-xs rounded-full bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-md text-label-md shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1 transition-all" type="button" data-action="filter">
<span>{"Gầm cao SUV / CUV"}</span>
</button>
<button className="px-space-md py-space-xs rounded-full bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-md text-label-md shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1 transition-all" type="button" data-action="filter">
<span>{"MPV 7 Chỗ Gia Đình"}</span>
</button>
<button className="px-space-md py-space-xs rounded-full bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-md text-label-md shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1 transition-all" type="button" data-action="filter">
<span className="material-symbols-outlined text-[16px] text-secondary">{"bolt"}</span>
<span>{"Xe Điện EV"}</span>
</button>
<button className="px-space-md py-space-xs rounded-full bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-md text-label-md shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1 transition-all" type="button" data-action="filter">
<span>{"Hạng Sang Premium"}</span>
</button>
<div className="h-6 w-px bg-outline-variant/40 mx-1 shrink-0"></div>
<button className="px-space-md py-space-xs rounded-full bg-surface-container-low text-primary font-label-md text-label-md shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[16px]">{"tune"}</span>
<span>{"Bộ lọc nâng cao"}</span>
</button>
</div>
</section>

<section className="max-w-[1240px] mx-auto px-margin py-space-xl w-full">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
<div>
<div className="font-label-md text-label-md text-secondary font-bold uppercase tracking-wider mb-space-xs">{"Đội xe chất lượng cao"}</div>
<h2 className="font-headline-lg text-headline-lg text-on-surface">{"Danh Sách Xe Tự Lái Sẵn Sàng"}</h2>
</div>
<div className="flex items-center gap-space-sm text-text-muted font-body-sm text-body-sm">
<span>{"Sắp xếp:"}</span>
<select className="bg-surface-container-lowest text-on-surface font-label-md text-label-md rounded-lg px-3 py-1.5 shadow-sm focus:outline-none cursor-pointer">
<option>{"Giá tốt nhất"}</option>
<option>{"Được đặt nhiều nhất"}</option>
<option>{"Đời xe mới nhất (2024-2025)"}</option>
<option>{"Đánh giá cao nhất"}</option>
</select>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">

<article className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300" data-vehicle-card="suv" data-vehicle-name="Hyundai Tucson 2.0 AT" data-price="950000">
<div className="relative w-full h-52 bg-surface-container overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/9aa3d9bc2c6c3ec1.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-3 left-3 flex flex-wrap gap-1">
<span className="px-2.5 py-1 rounded-full bg-primary/85 text-on-primary backdrop-blur-md font-label-md text-[11px] tracking-wide">{"Đời 2024"}</span>
<span className="px-2.5 py-1 rounded-full bg-status-success text-on-primary font-label-md text-[11px]">{"Giao xe ngay"}</span>
</div>
<button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-canvas/80 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-error transition-colors" type="button" data-action="favorite" aria-label="Lưu xe yêu thích">
<span className="material-symbols-outlined text-[20px]">{"favorite"}</span>
</button>
</div>
<div className="p-space-lg flex-1 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-xs">
<span className="font-label-md text-label-md text-text-muted">{"CUV Cỡ C • Xăng"}</span>
<div className="flex items-center gap-1 text-tertiary-container font-label-md text-label-md font-bold">
<span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span>{"4.95"}</span>
<span className="text-text-muted font-normal text-[12px]">{"(118 chuyến)"}</span>
</div>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">{"\n              Hyundai Tucson 2.0 AT\n            "}</h3>

<div className="grid grid-cols-3 gap-2 py-space-sm my-space-sm bg-surface-container-low rounded-lg p-2 text-center text-on-surface-variant font-body-sm text-body-sm">
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"airline_seat_recline_normal"}</span>
<span>{"5 Chỗ"}</span>
</div>
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"settings"}</span>
<span>{"Tự động"}</span>
</div>
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"local_gas_station"}</span>
<span>{"7.2L/100km"}</span>
</div>
</div>

<div className="flex items-center gap-2 text-text-muted text-[12px] mb-space-sm">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-secondary">{"check_circle"}</span>{" Sunroof"}</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-secondary">{"check_circle"}</span>{" Cam 360"}</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-secondary">{"check_circle"}</span>{" Apple CarPlay"}</span>
</div>
</div>
<div className="pt-space-sm border-t border-transparent flex items-center justify-between">
<div>
<div className="font-price-display text-price-display text-primary font-bold">{"950.000₫ "}<span className="font-body-sm text-body-sm text-text-muted font-normal">{"/ ngày"}</span></div>
<div className="font-body-sm text-[11px] text-secondary">{"Miễn cọc tiền mặt qua eKYC"}</div>
</div>
<button className="px-space-md py-space-xs rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm" type="button" data-action="book">{"\n              Chọn xe\n            "}</button>
</div>
</div>
</article>

<article className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300" data-vehicle-card="ev" data-vehicle-name="VinFast VF 8 Plus" data-price="1250000">
<div className="relative w-full h-52 bg-surface-container overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/3b3ff22222fe39c9.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-3 left-3 flex flex-wrap gap-1">
<span className="px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-label-md text-[11px] tracking-wide flex items-center gap-0.5">
<span className="material-symbols-outlined text-[13px]">{"bolt"}</span>{" Thuần Điện\n            "}</span>
<span className="px-2.5 py-1 rounded-full bg-surface-canvas/90 text-primary font-label-md text-[11px] backdrop-blur-md">{"Đời 2024"}</span>
</div>
<button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-canvas/80 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-error transition-colors" type="button" data-action="favorite" aria-label="Lưu xe yêu thích">
<span className="material-symbols-outlined text-[20px]">{"favorite"}</span>
</button>
</div>
<div className="p-space-lg flex-1 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-xs">
<span className="font-label-md text-label-md text-text-muted">{"D-SUV • Pin 420km"}</span>
<div className="flex items-center gap-1 text-tertiary-container font-label-md text-label-md font-bold">
<span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span>{"4.98"}</span>
<span className="text-text-muted font-normal text-[12px]">{"(204 chuyến)"}</span>
</div>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">{"\n              VinFast VF 8 Plus\n            "}</h3>

<div className="grid grid-cols-3 gap-2 py-space-sm my-space-sm bg-surface-container-low rounded-lg p-2 text-center text-on-surface-variant font-body-sm text-body-sm">
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"airline_seat_recline_normal"}</span>
<span>{"5 Chỗ"}</span>
</div>
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"electric_meter"}</span>
<span>{"402 Mã Lực"}</span>
</div>
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"ev_station"}</span>
<span>{"Free Sạc Kanow"}</span>
</div>
</div>

<div className="flex items-center gap-2 text-text-muted text-[12px] mb-space-sm">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-secondary">{"check_circle"}</span>{" ADAS Level 2"}</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-secondary">{"check_circle"}</span>{" Ghế Massage"}</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-secondary">{"check_circle"}</span>{" HUD kính lái"}</span>
</div>
</div>
<div className="pt-space-sm flex items-center justify-between">
<div>
<div className="font-price-display text-price-display text-primary font-bold">{"1.250.000₫ "}<span className="font-body-sm text-body-sm text-text-muted font-normal">{"/ ngày"}</span></div>
<div className="font-body-sm text-[11px] text-secondary">{"Tặng kèm trạm sạc miễn phí"}</div>
</div>
<button className="px-space-md py-space-xs rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm" type="button" data-action="book">{"\n              Chọn xe\n            "}</button>
</div>
</div>
</article>

<article className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300" data-vehicle-card="suv" data-vehicle-name="Mitsubishi Xpander Cross" data-price="850000">
<div className="relative w-full h-52 bg-surface-container overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/a650861b016ecf93.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-3 left-3 flex flex-wrap gap-1">
<span className="px-2.5 py-1 rounded-full bg-primary/85 text-on-primary backdrop-blur-md font-label-md text-[11px] tracking-wide">{"Đời 2023 - 2024"}</span>
<span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-[11px]">{"Gia đình ưa chuộng"}</span>
</div>
<button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-canvas/80 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-error transition-colors" type="button" data-action="favorite" aria-label="Lưu xe yêu thích">
<span className="material-symbols-outlined text-[20px]">{"favorite"}</span>
</button>
</div>
<div className="p-space-lg flex-1 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-xs">
<span className="font-label-md text-label-md text-text-muted">{"MPV Đa Dụng • Xăng"}</span>
<div className="flex items-center gap-1 text-tertiary-container font-label-md text-label-md font-bold">
<span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span>{"4.91"}</span>
<span className="text-text-muted font-normal text-[12px]">{"(320 chuyến)"}</span>
</div>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">{"\n              Mitsubishi Xpander Cross\n            "}</h3>

<div className="grid grid-cols-3 gap-2 py-space-sm my-space-sm bg-surface-container-low rounded-lg p-2 text-center text-on-surface-variant font-body-sm text-body-sm">
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"groups"}</span>
<span>{"7 Chỗ Rộng"}</span>
</div>
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"settings"}</span>
<span>{"Tự động"}</span>
</div>
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"luggage"}</span>
<span>{"Cốp 495L"}</span>
</div>
</div>

<div className="flex items-center gap-2 text-text-muted text-[12px] mb-space-sm">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-secondary">{"check_circle"}</span>{" Phanh tay điện tử"}</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-secondary">{"check_circle"}</span>{" Khoang rộng"}</span>
</div>
</div>
<div className="pt-space-sm flex items-center justify-between">
<div>
<div className="font-price-display text-price-display text-primary font-bold">{"850.000₫ "}<span className="font-body-sm text-body-sm text-text-muted font-normal">{"/ ngày"}</span></div>
<div className="font-body-sm text-[11px] text-secondary">{"Bảo hiểm vật chất đã bao gồm"}</div>
</div>
<button className="px-space-md py-space-xs rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm" type="button" data-action="book">{"\n              Chọn xe\n            "}</button>
</div>
</div>
</article>

<article className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300" data-vehicle-card="sedan" data-vehicle-name="Mazda 3 1.5 Premium" data-price="790000">
<div className="relative w-full h-52 bg-surface-container overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/785fd4ada907eea8.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-3 left-3 flex flex-wrap gap-1">
<span className="px-2.5 py-1 rounded-full bg-primary/85 text-on-primary backdrop-blur-md font-label-md text-[11px] tracking-wide">{"Đời 2024"}</span>
</div>
<button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-canvas/80 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-error transition-colors" type="button" data-action="favorite" aria-label="Lưu xe yêu thích">
<span className="material-symbols-outlined text-[20px]">{"favorite"}</span>
</button>
</div>
<div className="p-space-lg flex-1 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-xs">
<span className="font-label-md text-label-md text-text-muted">{"Sedan C • Tiết kiệm xăng"}</span>
<div className="flex items-center gap-1 text-tertiary-container font-label-md text-label-md font-bold">
<span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span>{"4.94"}</span>
<span className="text-text-muted font-normal text-[12px]">{"(175 chuyến)"}</span>
</div>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">{"\n              Mazda 3 1.5 Premium\n            "}</h3>
<div className="grid grid-cols-3 gap-2 py-space-sm my-space-sm bg-surface-container-low rounded-lg p-2 text-center text-on-surface-variant font-body-sm text-body-sm">
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"airline_seat_recline_normal"}</span>
<span>{"5 Chỗ"}</span>
</div>
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"volume_up"}</span>
<span>{"Loa Bose"}</span>
</div>
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"local_gas_station"}</span>
<span>{"6.1L/100km"}</span>
</div>
</div>
<div className="flex items-center gap-2 text-text-muted text-[12px] mb-space-sm">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-secondary">{"check_circle"}</span>{" Cửa sổ trời"}</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-secondary">{"check_circle"}</span>{" Cảnh báo điểm mù"}</span>
</div>
</div>
<div className="pt-space-sm flex items-center justify-between">
<div>
<div className="font-price-display text-price-display text-primary font-bold">{"790.000₫ "}<span className="font-body-sm text-body-sm text-text-muted font-normal">{"/ ngày"}</span></div>
<div className="font-body-sm text-[11px] text-secondary">{"Khử khuẩn & Rửa xe sạch bóng"}</div>
</div>
<button className="px-space-md py-space-xs rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm" type="button" data-action="book">{"\n              Chọn xe\n            "}</button>
</div>
</div>
</article>

<article className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300" data-vehicle-card="suv" data-vehicle-name="Toyota Fortuner 2.8 Legender" data-price="1350000">
<div className="relative w-full h-52 bg-surface-container overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/c2c0a7199351daa2.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-3 left-3 flex flex-wrap gap-1">
<span className="px-2.5 py-1 rounded-full bg-primary/85 text-on-primary backdrop-blur-md font-label-md text-[11px] tracking-wide">{"Đời 2024"}</span>
<span className="px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-[11px]">{"Máy dầu khỏe"}</span>
</div>
<button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-canvas/80 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-error transition-colors" type="button" data-action="favorite" aria-label="Lưu xe yêu thích">
<span className="material-symbols-outlined text-[20px]">{"favorite"}</span>
</button>
</div>
<div className="p-space-lg flex-1 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-xs">
<span className="font-label-md text-label-md text-text-muted">{"SUV Cỡ Lớn • Dầu Diesel"}</span>
<div className="flex items-center gap-1 text-tertiary-container font-label-md text-label-md font-bold">
<span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span>{"4.97"}</span>
<span className="text-text-muted font-normal text-[12px]">{"(142 chuyến)"}</span>
</div>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">{"\n              Toyota Fortuner 2.8 Legender\n            "}</h3>
<div className="grid grid-cols-3 gap-2 py-space-sm my-space-sm bg-surface-container-low rounded-lg p-2 text-center text-on-surface-variant font-body-sm text-body-sm">
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"groups"}</span>
<span>{"7 Chỗ"}</span>
</div>
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"alt_route"}</span>
<span>{"Dẫn động 4x4"}</span>
</div>
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"speed"}</span>
<span>{"201 HP"}</span>
</div>
</div>
<div className="flex items-center gap-2 text-text-muted text-[12px] mb-space-sm">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-secondary">{"check_circle"}</span>{" Camera 360"}</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-secondary">{"check_circle"}</span>{" Cốp điện rảnh tay"}</span>
</div>
</div>
<div className="pt-space-sm flex items-center justify-between">
<div>
<div className="font-price-display text-price-display text-primary font-bold">{"1.350.000₫ "}<span className="font-body-sm text-body-sm text-text-muted font-normal">{"/ ngày"}</span></div>
<div className="font-body-sm text-[11px] text-secondary">{"Thích hợp đường dài đèo dốc"}</div>
</div>
<button className="px-space-md py-space-xs rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm" type="button" data-action="book">{"\n              Chọn xe\n            "}</button>
</div>
</div>
</article>

<article className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300" data-vehicle-card="suv" data-vehicle-name="Kia Carnival 2.2D Signature" data-price="1750000">
<div className="relative w-full h-52 bg-surface-container overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/064cc7e873b63634.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-3 left-3 flex flex-wrap gap-1">
<span className="px-2.5 py-1 rounded-full bg-primary/85 text-on-primary backdrop-blur-md font-label-md text-[11px] tracking-wide">{"Đời 2024"}</span>
<span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-[11px]">{"Chuyên cơ mặt đất"}</span>
</div>
<button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-canvas/80 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-error transition-colors" type="button" data-action="favorite" aria-label="Lưu xe yêu thích">
<span className="material-symbols-outlined text-[20px]">{"favorite"}</span>
</button>
</div>
<div className="p-space-lg flex-1 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-xs">
<span className="font-label-md text-label-md text-text-muted">{"Chuyên cơ 7 chỗ • Dầu cao cấp"}</span>
<div className="flex items-center gap-1 text-tertiary-container font-label-md text-label-md font-bold">
<span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span>{"4.99"}</span>
<span className="text-text-muted font-normal text-[12px]">{"(280 chuyến)"}</span>
</div>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">{"\n              Kia Carnival 2.2D Signature\n            "}</h3>
<div className="grid grid-cols-3 gap-2 py-space-sm my-space-sm bg-surface-container-low rounded-lg p-2 text-center text-on-surface-variant font-body-sm text-body-sm">
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"airline_seat_individual_suite"}</span>
<span>{"Ghế Thương Gia"}</span>
</div>
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"sensor_door"}</span>
<span>{"Cửa lùa điện"}</span>
</div>
<div className="flex flex-col items-center gap-0.5">
<span className="material-symbols-outlined text-[18px] text-primary">{"ac_unit"}</span>
<span>{"Điều hòa 3 vùng"}</span>
</div>
</div>
<div className="flex items-center gap-2 text-text-muted text-[12px] mb-space-sm">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-secondary">{"check_circle"}</span>{" Sưởi & Làm mát ghế"}</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-secondary">{"check_circle"}</span>{" Màn hình kép"}</span>
</div>
</div>
<div className="pt-space-sm flex items-center justify-between">
<div>
<div className="font-price-display text-price-display text-primary font-bold">{"1.750.000₫ "}<span className="font-body-sm text-body-sm text-text-muted font-normal">{"/ ngày"}</span></div>
<div className="font-body-sm text-[11px] text-secondary">{"Nội thất da Nappa sang trọng"}</div>
</div>
<button className="px-space-md py-space-xs rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm" type="button" data-action="book">{"\n              Chọn xe\n            "}</button>
</div>
</div>
</article>
</div>

<div className="mt-space-xl flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-lg">
<div className="font-body-md text-body-md text-text-muted">{"\n        Hiển thị "}<span className="font-semibold text-on-surface">{"6"}</span>{" trên tổng số "}<span className="font-semibold text-on-surface">{"142"}</span>{" xe tự lái đang trống\n      "}</div>
<p className="mt-8 text-center text-sm text-text-muted">{"Bạn đã xem tất cả dòng xe nổi bật."}</p>
</div>
</section>

<section className="w-full bg-surface-container-low py-space-2xl">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="text-center max-w-2xl mx-auto mb-space-xl">
<div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container text-primary font-label-md text-label-md mb-space-xs font-semibold">
<span className="material-symbols-outlined text-[16px]">{"touch_app"}</span>
<span>{"Trải nghiệm không giấy tờ rườm rà"}</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs">{"\n          3 Bước Thuê Xe Số Hoá 100% Qua eKYC\n        "}</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">{"\n          Không cần giữ hộ khẩu gốc, không giữ xe máy thế chấp. Xác thực công nghệ AI nhanh gọn trong 5 phút trên ứng dụng.\n        "}</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter relative">

<div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm relative flex flex-col justify-between group hover:shadow-md transition-all">
<div className="mb-space-md">
<div className="flex items-center justify-between mb-space-lg">
<div className="w-14 h-14 rounded-xl bg-surface-tint flex items-center justify-center text-primary shadow-inner">
<span className="material-symbols-outlined text-[30px]">{"badge"}</span>
</div>
<span className="font-display-hero text-display-hero text-surface-container-highest/60 font-bold">{"01"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">{"\n              Chụp ảnh CCCD & GPLX\n            "}</h3>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n              Tải lên ảnh 2 mặt CCCD gắn chip và Giấy phép lái xe hạng B1/B2 còn hạn. Hệ thống AI tự động đối soát thông tin bảo mật tuyệt đối.\n            "}</p>
</div>
<div className="flex items-center gap-2 text-status-success font-label-md text-label-md">
<span className="material-symbols-outlined text-[18px]">{"verified"}</span>
<span>{"Quét chip CCCD bảo mật"}</span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm relative flex flex-col justify-between group hover:shadow-md transition-all">
<div className="mb-space-md">
<div className="flex items-center justify-between mb-space-lg">
<div className="w-14 h-14 rounded-xl bg-surface-tint flex items-center justify-center text-primary shadow-inner">
<span className="material-symbols-outlined text-[30px]">{"face"}</span>
</div>
<span className="font-display-hero text-display-hero text-surface-container-highest/60 font-bold">{"02"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">{"\n              Quét Khuôn Mặt (Liveness)\n            "}</h3>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n              Nhận diện sinh trắc học trực tiếp qua camera điện thoại trong 10 giây để ký hợp đồng điện tử tự động và bảo đảm danh tính tài xế.\n            "}</p>
</div>
<div className="flex items-center gap-2 text-status-success font-label-md text-label-md">
<span className="material-symbols-outlined text-[18px]">{"security"}</span>
<span>{"Hợp đồng điện tử có hiệu lực pháp lý"}</span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm relative flex flex-col justify-between group hover:shadow-md transition-all">
<div className="mb-space-md">
<div className="flex items-center justify-between mb-space-lg">
<div className="w-14 h-14 rounded-xl bg-surface-tint flex items-center justify-center text-primary shadow-inner">
<span className="material-symbols-outlined text-[30px]">{"key"}</span>
</div>
<span className="font-display-hero text-display-hero text-surface-container-highest/60 font-bold">{"03"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">{"\n              Nhận Xe & Mở Khóa Thông Minh\n            "}</h3>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n              Nhận xe tại trạm đối tác hoặc được giao tận nhà. Kiểm tra tình trạng xe bằng biên bản kỹ thuật số trên app và khởi hành ngay.\n            "}</p>
</div>
<div className="flex items-center gap-2 text-primary font-label-md text-label-md font-semibold">
<span className="material-symbols-outlined text-[18px]">{"car_rental"}</span>
<span>{"Kiểm tra ngoại quan trực quan 360°"}</span>
</div>
</div>
</div>

<div className="mt-space-xl bg-surface-container rounded-xl p-space-md flex flex-wrap items-center justify-around gap-space-md text-center">
<div className="flex items-center gap-space-xs text-on-surface font-label-lg text-label-lg">
<span className="material-symbols-outlined text-secondary text-[22px]">{"lock_reset"}</span>
<span>{"Bảo mật thông tin người dùng ISO 27001"}</span>
</div>
<div className="flex items-center gap-space-xs text-on-surface font-label-lg text-label-lg">
<span className="material-symbols-outlined text-secondary text-[22px]">{"credit_card_off"}</span>
<span>{"Không tạm giữ tài sản thế chấp"}</span>
</div>
<div className="flex items-center gap-space-xs text-on-surface font-label-lg text-label-lg">
<span className="material-symbols-outlined text-secondary text-[22px]">{"timer"}</span>
<span>{"Phê duyệt hợp đồng chưa tới 5 phút"}</span>
</div>
</div>
</div>
</section>

<section className="max-w-[1240px] mx-auto px-margin py-space-xl w-full">
<div className="relative rounded-2xl overflow-hidden bg-primary text-on-primary shadow-xl p-space-xl lg:p-space-2xl">

<div className="absolute inset-0 opacity-10 pointer-events-none">
<svg className="w-full h-full" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
<defs>
<pattern height="40" id="grid-pattern" patternUnits="userSpaceOnUse" width="40">
<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"></path>
</pattern>
</defs>
<rect fill="url(#grid-pattern)" height="100%" width="100%"></rect>
</svg>
</div>
<div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
<div className="lg:col-span-7 flex flex-col gap-space-md">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/20 text-secondary-fixed text-label-md font-label-md w-fit">
<span className="material-symbols-outlined text-[16px]">{"health_and_safety"}</span>
<span>{"Cam Kết Bảo Vệ Toàn Diện & Trách Nhiệm Tối Đa"}</span>
</div>
<h2 className="font-headline-lg text-headline-lg font-bold text-on-primary leading-snug">{"\n            Gói An Tâm Tuyệt Đối Kanow Shield™ "}<br />{"Đi Kèm Cho Từng Chuyến Đi\n          "}</h2>
<p className="font-body-lg text-body-lg text-on-primary-container">{"\n            Mỗi km lăn bánh cùng Kanow đều được bọc lót bởi gói bảo hiểm vật chất 2 chiều của MIC/Bảo Việt cùng dịch vụ cứu hộ khẩn cấp 24/7 trên toàn bộ 63 tỉnh thành.\n          "}</p>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary-fixed text-[22px] shrink-0">{"check_circle"}</span>
<div>
<div className="font-label-lg text-label-lg font-semibold text-on-primary">{"Bảo Hiểm Thân Vỏ 2 Chiều"}</div>
<div className="font-body-sm text-body-sm text-surface-tint">{"Mức khấu trừ tối thiểu, thủ tục giám định online siêu tốc"}</div>
</div>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary-fixed text-[22px] shrink-0">{"check_circle"}</span>
<div>
<div className="font-label-lg text-label-lg font-semibold text-on-primary">{"Cứu Hộ Miễn Phí 24/7"}</div>
<div className="font-body-sm text-body-sm text-surface-tint">{"Có mặt nhanh chóng xử lý sự cố lốp, kích bình, kéo xe"}</div>
</div>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary-fixed text-[22px] shrink-0">{"check_circle"}</span>
<div>
<div className="font-label-lg text-label-lg font-semibold text-on-primary">{"Cam Kết Đổi Xe Tương Đương"}</div>
<div className="font-body-sm text-body-sm text-surface-tint">{"Đổi ngay xe cùng phân khúc nếu xe gặp lỗi kỹ thuật trên đường"}</div>
</div>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary-fixed text-[22px] shrink-0">{"check_circle"}</span>
<div>
<div className="font-label-lg text-label-lg font-semibold text-on-primary">{"Minh Bạch Phạt Nguội"}</div>
<div className="font-body-sm text-body-sm text-surface-tint">{"Gửi kèm hình ảnh tra cứu minh bạch từ hệ thống Cục CSGT"}</div>
</div>
</div>
</div>
</div>
<div className="lg:col-span-5 flex flex-col gap-space-md bg-surface-container-lowest/10 backdrop-blur-xl p-space-lg rounded-xl">
<div className="flex items-center justify-between pb-space-sm border-b border-on-primary/15">
<div className="font-label-lg text-label-lg font-bold text-on-primary">{"Hotline Khẩn Cấp & SOS"}</div>
<span className="px-2 py-0.5 rounded-full bg-status-success text-on-primary text-[10px] font-bold">{"24/7 SẴN SÀNG"}</span>
</div>
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">{"phone_in_talk"}</span>
</div>
<div>
<div className="font-body-sm text-body-sm text-surface-tint">{"Tổng đài tiếp nhận sự cố kỹ thuật"}</div>
<div className="font-headline-md text-headline-md font-bold text-secondary-fixed">{"1900 8888 (Nhánh 1)"}</div>
</div>
</div>
<div className="p-space-sm rounded-lg bg-on-primary/5 text-body-sm text-body-sm text-surface-tint">{"\n            \"Chúng tôi bảo chứng cho từng cây số di chuyển. Xe luôn được bảo dưỡng định kỳ tại đại lý chính hãng trước mỗi chuyến giao nhận.\"\n          "}</div>
<button className="w-full py-space-sm rounded-full bg-surface-container-lowest text-primary font-label-md text-label-md font-bold hover:bg-surface-tint transition-all shadow-md" type="button" data-action="detail">{"\n            Xem Chi Tiết Quy Trình Bồi Thường & Cứu Hộ\n          "}</button>
</div>
</div>
</div>
</section>

<section className="max-w-[1240px] mx-auto px-margin py-space-xl w-full">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
<div className="lg:col-span-4 flex flex-col gap-space-sm">
<div className="inline-flex items-center gap-space-xs text-secondary font-label-md text-label-md font-bold uppercase tracking-wider">
<span className="material-symbols-outlined text-[16px]">{"help"}</span>
<span>{"Giải đáp thắc mắc"}</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">{"\n          Câu Hỏi Thường Gặp Về Thuê Xe Tự Lái\n        "}</h2>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n          Tổng hợp những câu hỏi phổ biến nhất của khách hàng khi thuê xe tự lái tại Kanow để chuyến đi của bạn thêm phần thảnh thơi.\n        "}</p>
<div className="mt-space-md p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
<div className="font-label-lg text-label-lg text-on-surface font-semibold">{"Chưa tìm thấy câu trả lời?"}</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Đội ngũ chuyên viên tư vấn luôn sẵn sàng phản hồi tức thì."}</p>
<Link className="mt-space-xs text-primary font-label-md text-label-md font-bold flex items-center gap-1 hover:underline" href="/lien-he">
<span>{"Trò chuyện trực tuyến ngay"}</span>
<span className="material-symbols-outlined text-[16px]">{"arrow_forward"}</span>
</Link>
</div>
</div>
<div className="lg:col-span-8 flex flex-col gap-space-sm" id="faq-accordion">

<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm transition-all duration-200">
<button className="w-full flex items-center justify-between text-left font-headline-sm text-headline-sm font-semibold text-on-surface" type="button" data-handler="toggleFaq" data-args="this">
<span>{"Thủ tục thuê xe tự lái tại Kanow yêu cầu những giấy tờ gì?"}</span>
<span className="material-symbols-outlined text-primary text-[24px] transform transition-transform duration-200">{"expand_more"}</span>
</button>
<div className="mt-space-sm text-on-surface-variant font-body-md text-body-md leading-relaxed">{"\n            Bạn chỉ cần có: "}<strong>{"1) CCCD gắn chip"}</strong>{" hoặc Hộ chiếu còn hạn; "}<strong>{"2) Giấy phép lái xe hạng B1/B2"}</strong>{" hợp lệ. Toàn bộ quá trình đối chiếu thực hiện online qua hệ thống eKYC của Kanow, không yêu cầu giữ tài sản gốc hay ký quỹ tiền mặt lớn nếu điểm tín nhiệm hồ sơ đạt chuẩn.\n          "}</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm transition-all duration-200">
<button className="w-full flex items-center justify-between text-left font-headline-sm text-headline-sm font-semibold text-on-surface" type="button" data-handler="toggleFaq" data-args="this">
<span>{"Quy định về thời gian tính ngày và giới hạn số kilomet (Km)?"}</span>
<span className="material-symbols-outlined text-primary text-[24px] transform transition-transform duration-200">{"expand_more"}</span>
</button>
<div className="mt-space-sm text-on-surface-variant font-body-md text-body-md leading-relaxed hidden">{"\n            Một ngày thuê được tính trọn vẹn 24 giờ kể từ thời điểm nhận xe. Gói thuê tiêu chuẩn áp dụng hạn mức 350km/ngày (đủ cho hầu hết lộ trình du lịch/công tác). Số km phụ trội được tính minh bạch từ 3.000₫ – 5.000₫/km tuỳ dòng xe và hiển thị rõ ràng trên hợp đồng trước khi bạn bấm xác nhận.\n          "}</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm transition-all duration-200">
<button className="w-full flex items-center justify-between text-left font-headline-sm text-headline-sm font-semibold text-on-surface" type="button" data-handler="toggleFaq" data-args="this">
<span>{"Nếu chẳng may xảy ra va chạm hoặc trầy xước xe thì giải quyết thế nào?"}</span>
<span className="material-symbols-outlined text-primary text-[24px] transform transition-transform duration-200">{"expand_more"}</span>
</button>
<div className="mt-space-sm text-on-surface-variant font-body-md text-body-md leading-relaxed hidden">{"\n            Tất cả xe trên hệ thống đều có bảo hiểm thân vỏ 2 chiều. Khi phát sinh sự cố, bạn chỉ cần giữ nguyên hiện trường, gọi hotline 1900 8888 và gửi hình ảnh qua ứng dụng. Đội ngũ bồi thường của Kanow sẽ phối hợp với giám định viên bảo hiểm để hoàn tất thủ tục, bạn chỉ chi trả mức miễn thường tối thiểu theo quy định hợp đồng.\n          "}</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm transition-all duration-200">
<button className="w-full flex items-center justify-between text-left font-headline-sm text-headline-sm font-semibold text-on-surface" type="button" data-handler="toggleFaq" data-args="this">
<span>{"Kanow xử lý khoản cọc phạt nguội (Giao thông) như thế nào?"}</span>
<span className="material-symbols-outlined text-primary text-[24px] transform transition-transform duration-200">{"expand_more"}</span>
</button>
<div className="mt-space-sm text-on-surface-variant font-body-md text-body-md leading-relaxed hidden">{"\n            Để bảo vệ cả hai bên, Kanow áp dụng cơ chế khoá tạm thời hạn mức bảo lưu phạt nguội (khoảng 2.000.000₫) trên thẻ tín dụng hoặc ví điện tử. Sau 15 - 20 ngày kể từ khi kết thúc hành trình, hệ thống tra cứu cơ sở dữ liệu quốc gia: nếu không có biên bản phạt, hạn mức này tự động hoàn trả 100% về tài khoản của bạn ngay tức thì.\n          "}</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm transition-all duration-200">
<button className="w-full flex items-center justify-between text-left font-headline-sm text-headline-sm font-semibold text-on-surface" type="button" data-handler="toggleFaq" data-args="this">
<span>{"Tôi có thể nhận và trả xe tại hai địa điểm khác nhau (Một chiều) không?"}</span>
<span className="material-symbols-outlined text-primary text-[24px] transform transition-transform duration-200">{"expand_more"}</span>
</button>
<div className="mt-space-sm text-on-surface-variant font-body-md text-body-md leading-relaxed hidden">{"\n            Hoàn toàn được! Kanow hỗ trợ dịch vụ thuê xe một chiều liên tỉnh giữa các trung tâm lớn như Hà Nội - Hải Phòng - Quảng Ninh, hoặc TP.HCM - Vũng Tàu - Phan Thiết - Cần Thơ. Phí trả xe khác điểm sẽ được báo chi tiết khi bạn chọn tuyến đường trong màn hình đặt xe.\n          "}</div>
</div>
</div>
</div>
</section>

<aside className="lg:hidden fixed bottom-4 inset-x-4 z-40 bg-surface-canvas/95 backdrop-blur-xl p-space-sm rounded-xl shadow-2xl flex items-center justify-between border-subtle">
<div>
<span className="block font-body-sm text-body-sm text-text-muted">{"Ưu đãi hôm nay"}</span>
<span className="font-price-display text-price-display text-primary font-bold">{"Chỉ từ 790k/ngày"}</span>
</div>
<button className="px-space-lg py-space-xs rounded-full bg-tertiary-container text-on-tertiary font-label-lg text-label-lg font-bold shadow-md flex items-center gap-1" type="button" data-action="book">
<span className="material-symbols-outlined text-[18px]">{"electric_car"}</span>
<span>{"Đặt Xe Nhanh"}</span>
</button>
</aside>
</div>
</main>
  );
}
