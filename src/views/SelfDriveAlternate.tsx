import Link from "next/link";

export default function SelfDriveAlternate() {
  return (
<main className="w-full pt-20 bg-surface"><div className="flex flex-col w-full">

<section className="relative w-full bg-surface-canvas overflow-hidden py-space-xl">
<div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
<div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-surface-tint/60 blur-2xl pointer-events-none"></div>
<div className="max-w-[1240px] mx-auto px-margin relative z-10">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
<div className="lg:col-span-7 flex flex-col gap-space-md">
<div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-tint w-fit shadow-sm">
<span className="material-symbols-outlined text-[16px] text-secondary">{"verified_user"}</span>
<span className="font-label-md text-label-md text-secondary">{"Dịch vụ xe tự lái ứng dụng eKYC 4.0"}</span>
</div>
<div className="flex flex-col gap-space-xs">
<h1 className="font-display-hero text-display-hero text-primary tracking-tight">{"\n              Tự do lăn bánh, trọn vẹn từng dặm trường\n            "}</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">{"\n              Trải nghiệm hành trình chủ động hoàn toàn cùng Kanow. Giao nhận xe tận cửa nhà hoặc sân bay, định danh trực tuyến không giữ giấy tờ gốc, bảo hiểm vật chất hai chiều trọn gói.\n            "}</p>
</div>
<div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-space-xs">
<div className="flex flex-col p-space-sm rounded-xl bg-surface-container shadow-sm">
<span className="material-symbols-outlined text-primary text-[24px]">{"key"}</span>
<span className="font-label-lg text-label-lg text-on-surface mt-space-xs">{"Giao xe 30p"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"Tận nơi hoặc sân bay"}</span>
</div>
<div className="flex flex-col p-space-sm rounded-xl bg-surface-container shadow-sm">
<span className="material-symbols-outlined text-primary text-[24px]">{"fingerprint"}</span>
<span className="font-label-lg text-label-lg text-on-surface mt-space-xs">{"eKYC an toàn"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"Không giữ CCCD/GPLX gốc"}</span>
</div>
<div className="flex flex-col p-space-sm rounded-xl bg-surface-container shadow-sm">
<span className="material-symbols-outlined text-primary text-[24px]">{"health_and_safety"}</span>
<span className="font-label-lg text-label-lg text-on-surface mt-space-xs">{"Bảo hiểm 2 chiều"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"An tâm trọn hành trình"}</span>
</div>
<div className="flex flex-col p-space-sm rounded-xl bg-surface-container shadow-sm">
<span className="material-symbols-outlined text-primary text-[24px]">{"price_check"}</span>
<span className="font-label-lg text-label-lg text-on-surface mt-space-xs">{"Giá minh bạch"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"0 phụ phí ẩn"}</span>
</div>
</div>
</div>
<div className="lg:col-span-5 relative">
<div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-xl bg-surface-container-high">
<img className="w-full h-full object-cover" src="/images/830ee584ec68e4c2.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
<div className="absolute bottom-space-md left-space-md right-space-md flex items-center justify-between text-on-primary">
<div>
<span className="font-label-md text-label-md uppercase tracking-wider text-secondary-fixed">{"Hạm đội xe 2024 - 2025"}</span>
<p className="font-headline-sm text-headline-sm font-semibold">{"100% xe sạch khuẩn, bảo dưỡng định kỳ"}</p>
</div>
<div className="w-12 h-12 rounded-full bg-surface-canvas/20 backdrop-blur-md flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-on-primary text-[28px]">{"electric_car"}</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="max-w-[1240px] mx-auto px-margin -mt-8 relative z-20 w-full">
<div className="bg-surface-container rounded-2xl p-space-lg shadow-xl shadow-primary/5 flex flex-col gap-space-lg">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">

<div className="flex flex-col gap-space-xs">
<label className="font-label-md text-label-md text-text-muted flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-primary">{"location_on"}</span>{"\n            Địa điểm nhận xe\n          "}</label>
<div className="relative">
<select className="w-full bg-surface-container-low rounded-xl px-space-md py-space-sm font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 pr-space-xl">
<option value="sg-tan-son-nhat">{"TP. Hồ Chí Minh - Sân bay Tân Sơn Nhất"}</option>
<option value="sg-quan-1">{"TP. Hồ Chí Minh - Trung tâm Quận 1"}</option>
<option value="hn-noi-bai">{"Hà Nội - Sân bay Nội Bài"}</option>
<option value="hn-cau-giay">{"Hà Nội - Quận Cầu Giấy / Mỹ Đình"}</option>
<option value="dn-da-nang">{"Đà Nẵng - Sân bay Quốc Tế"}</option>
<option value="nt-cam-ranh">{"Nha Trang - Sân bay Cam Ranh"}</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">{"expand_more"}</span>
</div>
</div>

<div className="flex flex-col gap-space-xs">
<label className="font-label-md text-label-md text-text-muted flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-primary">{"calendar_today"}</span>{"\n            Thời gian nhận xe\n          "}</label>
<div className="flex items-center gap-space-xs bg-surface-container-low rounded-xl px-space-md py-space-sm">
<input className="bg-transparent font-body-md text-body-md text-on-surface focus:outline-none w-full" type="date" defaultValue="2025-04-10" aria-label="Ngày thuê xe" />
<span className="font-label-md text-label-md text-text-muted">{"08:00"}</span>
</div>
</div>

<div className="flex flex-col gap-space-xs">
<label className="font-label-md text-label-md text-text-muted flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-primary">{"event_available"}</span>{"\n            Thời gian trả xe\n          "}</label>
<div className="flex items-center gap-space-xs bg-surface-container-low rounded-xl px-space-md py-space-sm">
<input className="bg-transparent font-body-md text-body-md text-on-surface focus:outline-none w-full" type="date" defaultValue="2025-04-12" aria-label="Ngày thuê xe" />
<span className="font-label-md text-label-md text-text-muted">{"20:00"}</span>
</div>
</div>

<div className="flex flex-col justify-end">
<button className="w-full h-[46px] rounded-full bg-on-tertiary-container text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-md shadow-tertiary-container/30 hover:brightness-105 active:scale-[0.98] transition-all" type="button" data-action="search">
<span className="material-symbols-outlined text-[20px]">{"search"}</span>
<span>{"Tìm 142 Xe Có Sẵn"}</span>
</button>
</div>
</div>

<div className="flex flex-wrap items-center justify-between gap-space-md pt-space-sm">
<div className="flex flex-wrap items-center gap-space-xs">
<span className="font-label-md text-label-md text-text-muted mr-space-xs">{"Dòng xe:"}</span>
<button className="px-space-md py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md transition-all" type="button" data-action="filter">{"Tất cả"}</button>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-tint font-label-md text-label-md transition-all" type="button" data-action="filter">{"Sedan 4-5 chỗ"}</button>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-tint font-label-md text-label-md transition-all" type="button" data-action="filter">{"SUV 7 chỗ gầm cao"}</button>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-tint font-label-md text-label-md transition-all" type="button" data-action="filter">{"Xe Điện VinFast"}</button>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-tint font-label-md text-label-md transition-all" type="button" data-action="filter">{"MPV Gia Đình"}</button>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-tint font-label-md text-label-md transition-all" type="button" data-action="filter">{"Hạng Sang (BMW/Lexus)"}</button>
</div>
<div className="flex items-center gap-space-sm">
<div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-1.5 rounded-full">
<span className="material-symbols-outlined text-[16px] text-text-muted">{"local_gas_station"}</span>
<span className="font-label-md text-label-md text-text-muted">{"Năng lượng:"}</span>
<select className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer">
<option>{"Tất cả nhiên liệu"}</option>
<option>{"Chỉ xe điện"}</option>
<option>{"Xăng / Hybrid"}</option>
<option>{"Dầu tiết kiệm"}</option>
</select>
</div>
<div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-1.5 rounded-full">
<span className="material-symbols-outlined text-[16px] text-text-muted">{"sort"}</span>
<select className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer">
<option>{"Giá tăng dần"}</option>
<option>{"Giá giảm dần"}</option>
<option>{"Đánh giá cao nhất"}</option>
<option>{"Xe mới 2024"}</option>
</select>
</div>
</div>
</div>
</div>
</section>

<section className="max-w-[1240px] mx-auto px-margin py-space-2xl w-full">
<div className="flex flex-col md:flex-row items-baseline justify-between mb-space-lg gap-space-xs">
<div>
<div className="flex items-center gap-space-xs">
<span className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse"></span>
<span className="font-label-lg text-label-lg uppercase tracking-wider text-primary">{"Sẵn sàng giao xe"}</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-primary mt-1">{"Dòng xe tự lái nổi bật dành cho bạn"}</h2>
</div>
<span className="font-body-md text-body-md text-text-muted">{"Hiển thị 6 / 142 phương tiện tại khu vực đã chọn"}</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">

<article className="bg-surface-container rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group" data-vehicle-card="ev" data-vehicle-name="VinFast VF 8 Plus" data-price="1250000">
<div className="relative w-full h-56 bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/6fec9d9bfbc962fe.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-space-sm left-space-sm flex flex-col gap-1 items-start">
<span className="px-space-sm py-1 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-sm">{"Giao nhanh 30p"}</span>
<span className="px-space-sm py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-label-md text-label-md shadow-sm flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">{"bolt"}</span>{"ADAS Level 2\n            "}</span>
</div>
<button aria-label="Lưu xe yêu thích" className="absolute top-space-sm right-space-sm w-9 h-9 rounded-full bg-surface-canvas/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-error transition-colors shadow-sm" type="button" data-action="favorite">
<span className="material-symbols-outlined text-[18px]">{"favorite"}</span>
</button>
</div>
<div className="p-space-lg flex flex-col flex-1 justify-between gap-space-md">
<div className="flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md uppercase text-text-muted">{"SUV Điện • 2024"}</span>
<div className="flex items-center gap-1 text-tertiary-container">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="font-label-md text-label-md font-bold text-on-surface">{"4.95"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"(184 chuyến)"}</span>
</div>
</div>
<h3 className="font-headline-md text-headline-md text-primary font-bold">{"VinFast VF 8 Plus"}</h3>
<p className="font-body-sm text-body-sm text-text-muted">{"Pin sạc đầy 95%, hỗ trợ trạm sạc V-GREEN miễn phí toàn quốc"}</p>
</div>

<div className="grid grid-cols-3 gap-space-xs py-space-sm bg-surface-container-low rounded-xl px-space-sm text-center">
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"airline_seat_recline_normal"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"5 Chỗ"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"settings"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Tự động"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"luggage"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"3 Vali lớn"}</span>
</div>
</div>

<div className="flex items-center justify-between pt-space-xs">
<div>
<span className="font-body-sm text-body-sm text-text-muted">{"Giá thuê tự lái"}</span>
<div className="flex items-baseline gap-1">
<span className="font-price-display text-price-display text-primary">{"1.250.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
</div>
<div className="flex items-center gap-space-xs">
<button className="px-space-md py-space-xs rounded-full bg-surface-container-high text-primary hover:bg-surface-tint font-label-md text-label-md transition-all" type="button" data-action="detail">{"Chi tiết"}</button>
<button className="px-space-md py-space-xs rounded-full bg-on-tertiary-container text-on-primary hover:brightness-105 font-label-md text-label-md shadow-md shadow-tertiary-container/20 transition-all" type="button" data-action="book">{"Đặt xe"}</button>
</div>
</div>
</div>
</article>

<article className="bg-surface-container rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group" data-vehicle-card="suv" data-vehicle-name="Hyundai Santa Fe Premium" data-price="1350000">
<div className="relative w-full h-56 bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/30ef57872a94104c.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-space-sm left-space-sm flex flex-col gap-1 items-start">
<span className="px-space-sm py-1 rounded-full bg-surface-container text-primary font-label-md text-label-md shadow-sm">{"Gia đình ưu chuộng"}</span>
<span className="px-space-sm py-1 rounded-full bg-surface-tint text-primary font-label-md text-label-md shadow-sm">{"Dầu tiết kiệm 6.2L"}</span>
</div>
<button aria-label="Lưu xe yêu thích" className="absolute top-space-sm right-space-sm w-9 h-9 rounded-full bg-surface-canvas/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-error transition-colors shadow-sm" type="button" data-action="favorite">
<span className="material-symbols-outlined text-[18px]">{"favorite"}</span>
</button>
</div>
<div className="p-space-lg flex flex-col flex-1 justify-between gap-space-md">
<div className="flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md uppercase text-text-muted">{"SUV 7 Chỗ • 2023"}</span>
<div className="flex items-center gap-1 text-tertiary-container">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="font-label-md text-label-md font-bold text-on-surface">{"4.92"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"(230 chuyến)"}</span>
</div>
</div>
<h3 className="font-headline-md text-headline-md text-primary font-bold">{"Hyundai Santa Fe Premium"}</h3>
<p className="font-body-sm text-body-sm text-text-muted">{"Trang bị cửa sổ trời toàn cảnh, làm mát ghế & camera 360 độ"}</p>
</div>

<div className="grid grid-cols-3 gap-space-xs py-space-sm bg-surface-container-low rounded-xl px-space-sm text-center">
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"airline_seat_recline_normal"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"7 Chỗ"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"settings"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Tự động 8 cấp"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"local_gas_station"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Dầu Turbo"}</span>
</div>
</div>

<div className="flex items-center justify-between pt-space-xs">
<div>
<span className="font-body-sm text-body-sm text-text-muted">{"Giá thuê tự lái"}</span>
<div className="flex items-baseline gap-1">
<span className="font-price-display text-price-display text-primary">{"1.350.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
</div>
<div className="flex items-center gap-space-xs">
<button className="px-space-md py-space-xs rounded-full bg-surface-container-high text-primary hover:bg-surface-tint font-label-md text-label-md transition-all" type="button" data-action="detail">{"Chi tiết"}</button>
<button className="px-space-md py-space-xs rounded-full bg-on-tertiary-container text-on-primary hover:brightness-105 font-label-md text-label-md shadow-md shadow-tertiary-container/20 transition-all" type="button" data-action="book">{"Đặt xe"}</button>
</div>
</div>
</div>
</article>

<article className="bg-surface-container rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group" data-vehicle-card="sedan" data-vehicle-name="Mazda 3 Sport Luxury" data-price="850000">
<div className="relative w-full h-56 bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/66660b10bd49c738.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-space-sm left-space-sm flex flex-col gap-1 items-start">
<span className="px-space-sm py-1 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-sm">{"Tiết kiệm xăng"}</span>
<span className="px-space-sm py-1 rounded-full bg-surface-tint text-primary font-label-md text-label-md shadow-sm">{"Giao xe tận nơi"}</span>
</div>
<button aria-label="Lưu xe yêu thích" className="absolute top-space-sm right-space-sm w-9 h-9 rounded-full bg-surface-canvas/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-error transition-colors shadow-sm" type="button" data-action="favorite">
<span className="material-symbols-outlined text-[18px]">{"favorite"}</span>
</button>
</div>
<div className="p-space-lg flex flex-col flex-1 justify-between gap-space-md">
<div className="flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md uppercase text-text-muted">{"Sedan C • 2023"}</span>
<div className="flex items-center gap-1 text-tertiary-container">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="font-label-md text-label-md font-bold text-on-surface">{"4.88"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"(96 chuyến)"}</span>
</div>
</div>
<h3 className="font-headline-md text-headline-md text-primary font-bold">{"Mazda 3 Sport Luxury"}</h3>
<p className="font-body-sm text-body-sm text-text-muted">{"Cảm giác lái thanh thoát, hệ thống âm thanh 8 loa cao cấp"}</p>
</div>

<div className="grid grid-cols-3 gap-space-xs py-space-sm bg-surface-container-low rounded-xl px-space-sm text-center">
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"airline_seat_recline_normal"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"5 Chỗ"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"settings"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Tự động 6 cấp"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"speed"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"5.9L / 100km"}</span>
</div>
</div>

<div className="flex items-center justify-between pt-space-xs">
<div>
<span className="font-body-sm text-body-sm text-text-muted">{"Giá thuê tự lái"}</span>
<div className="flex items-baseline gap-1">
<span className="font-price-display text-price-display text-primary">{"850.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
</div>
<div className="flex items-center gap-space-xs">
<button className="px-space-md py-space-xs rounded-full bg-surface-container-high text-primary hover:bg-surface-tint font-label-md text-label-md transition-all" type="button" data-action="detail">{"Chi tiết"}</button>
<button className="px-space-md py-space-xs rounded-full bg-on-tertiary-container text-on-primary hover:brightness-105 font-label-md text-label-md shadow-md shadow-tertiary-container/20 transition-all" type="button" data-action="book">{"Đặt xe"}</button>
</div>
</div>
</div>
</article>

<article className="bg-surface-container rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group" data-vehicle-card="suv" data-vehicle-name="Toyota Fortuner 2.8 4x4" data-price="1450000">
<div className="relative w-full h-56 bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/32af4adf3e334cb5.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-space-sm left-space-sm flex flex-col gap-1 items-start">
<span className="px-space-sm py-1 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-sm">{"Gầm cao việt dã"}</span>
<span className="px-space-sm py-1 rounded-full bg-surface-tint text-primary font-label-md text-label-md shadow-sm">{"2 Cầu 4x4"}</span>
</div>
<button aria-label="Lưu xe yêu thích" className="absolute top-space-sm right-space-sm w-9 h-9 rounded-full bg-surface-canvas/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-error transition-colors shadow-sm" type="button" data-action="favorite">
<span className="material-symbols-outlined text-[18px]">{"favorite"}</span>
</button>
</div>
<div className="p-space-lg flex flex-col flex-1 justify-between gap-space-md">
<div className="flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md uppercase text-text-muted">{"SUV Cỡ Lớn • 2024"}</span>
<div className="flex items-center gap-1 text-tertiary-container">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="font-label-md text-label-md font-bold text-on-surface">{"4.96"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"(142 chuyến)"}</span>
</div>
</div>
<h3 className="font-headline-md text-headline-md text-primary font-bold">{"Toyota Fortuner 2.8 4x4"}</h3>
<p className="font-body-sm text-body-sm text-text-muted">{"Chinh phục mọi cung đường Tây Bắc & Tây Nguyên mạnh mẽ"}</p>
</div>

<div className="grid grid-cols-3 gap-space-xs py-space-sm bg-surface-container-low rounded-xl px-space-sm text-center">
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"airline_seat_recline_normal"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"7 Chỗ rộng"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"swap_driving_apps_wheel"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Dẫn động 4WD"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"terrain"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Gầm 279mm"}</span>
</div>
</div>

<div className="flex items-center justify-between pt-space-xs">
<div>
<span className="font-body-sm text-body-sm text-text-muted">{"Giá thuê tự lái"}</span>
<div className="flex items-baseline gap-1">
<span className="font-price-display text-price-display text-primary">{"1.450.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
</div>
<div className="flex items-center gap-space-xs">
<button className="px-space-md py-space-xs rounded-full bg-surface-container-high text-primary hover:bg-surface-tint font-label-md text-label-md transition-all" type="button" data-action="detail">{"Chi tiết"}</button>
<button className="px-space-md py-space-xs rounded-full bg-on-tertiary-container text-on-primary hover:brightness-105 font-label-md text-label-md shadow-md shadow-tertiary-container/20 transition-all" type="button" data-action="book">{"Đặt xe"}</button>
</div>
</div>
</div>
</article>

<article className="bg-surface-container rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group" data-vehicle-card="luxury" data-vehicle-name="Mercedes C300 AMG" data-price="2600000">
<div className="relative w-full h-56 bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/c0c55296fc1b5b7f.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-space-sm left-space-sm flex flex-col gap-1 items-start">
<span className="px-space-sm py-1 rounded-full bg-inverse-surface text-inverse-on-surface font-label-md text-label-md shadow-sm">{"Hạng Sang Executive"}</span>
<span className="px-space-sm py-1 rounded-full bg-surface-tint text-primary font-label-md text-label-md shadow-sm">{"Burmester 15 loa"}</span>
</div>
<button aria-label="Lưu xe yêu thích" className="absolute top-space-sm right-space-sm w-9 h-9 rounded-full bg-surface-canvas/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-error transition-colors shadow-sm" type="button" data-action="favorite">
<span className="material-symbols-outlined text-[18px]">{"favorite"}</span>
</button>
</div>
<div className="p-space-lg flex flex-col flex-1 justify-between gap-space-md">
<div className="flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md uppercase text-text-muted">{"Luxury Sedan • 2024"}</span>
<div className="flex items-center gap-1 text-tertiary-container">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="font-label-md text-label-md font-bold text-on-surface">{"4.98"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"(77 chuyến)"}</span>
</div>
</div>
<h3 className="font-headline-md text-headline-md text-primary font-bold">{"Mercedes C300 AMG"}</h3>
<p className="font-body-sm text-body-sm text-text-muted">{"Nâng tầm phong thái gặp gỡ đối tác hoặc kỳ nghỉ sang trọng"}</p>
</div>

<div className="grid grid-cols-3 gap-space-xs py-space-sm bg-surface-container-low rounded-xl px-space-sm text-center">
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"airline_seat_recline_normal"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"5 Chỗ da Nappa"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"speed"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"258 Mã lực"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"settings"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"9G-TRONIC"}</span>
</div>
</div>

<div className="flex items-center justify-between pt-space-xs">
<div>
<span className="font-body-sm text-body-sm text-text-muted">{"Giá thuê tự lái"}</span>
<div className="flex items-baseline gap-1">
<span className="font-price-display text-price-display text-primary">{"2.600.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
</div>
<div className="flex items-center gap-space-xs">
<button className="px-space-md py-space-xs rounded-full bg-surface-container-high text-primary hover:bg-surface-tint font-label-md text-label-md transition-all" type="button" data-action="detail">{"Chi tiết"}</button>
<button className="px-space-md py-space-xs rounded-full bg-on-tertiary-container text-on-primary hover:brightness-105 font-label-md text-label-md shadow-md shadow-tertiary-container/20 transition-all" type="button" data-action="book">{"Đặt xe"}</button>
</div>
</div>
</div>
</article>

<article className="bg-surface-container rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group" data-vehicle-card="suv" data-vehicle-name="Kia Carnival 7 Chỗ Signature" data-price="1750000">
<div className="relative w-full h-56 bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/6cbf98d605b60550.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-space-sm left-space-sm flex flex-col gap-1 items-start">
<span className="px-space-sm py-1 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-sm">{"Chuyên cơ mặt đất"}</span>
<span className="px-space-sm py-1 rounded-full bg-surface-tint text-primary font-label-md text-label-md shadow-sm">{"Ghế thương gia VIP"}</span>
</div>
<button aria-label="Lưu xe yêu thích" className="absolute top-space-sm right-space-sm w-9 h-9 rounded-full bg-surface-canvas/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-error transition-colors shadow-sm" type="button" data-action="favorite">
<span className="material-symbols-outlined text-[18px]">{"favorite"}</span>
</button>
</div>
<div className="p-space-lg flex flex-col flex-1 justify-between gap-space-md">
<div className="flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md uppercase text-text-muted">{"MPV Cao Cấp • 2024"}</span>
<div className="flex items-center gap-1 text-tertiary-container">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="font-label-md text-label-md font-bold text-on-surface">{"4.97"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"(189 chuyến)"}</span>
</div>
</div>
<h3 className="font-headline-md text-headline-md text-primary font-bold">{"Kia Carnival 7 Chỗ Signature"}</h3>
<p className="font-body-sm text-body-sm text-text-muted">{"Không gian khoang hành khách rộng rãi bậc nhất, đệm đỡ bắp chân"}</p>
</div>

<div className="grid grid-cols-3 gap-space-xs py-space-sm bg-surface-container-low rounded-xl px-space-sm text-center">
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"airline_seat_recline_normal"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"7 Chỗ độc lập"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"door_sliding"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Cửa điện tự động"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-primary">{"luggage"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Khoang 2.614L"}</span>
</div>
</div>

<div className="flex items-center justify-between pt-space-xs">
<div>
<span className="font-body-sm text-body-sm text-text-muted">{"Giá thuê tự lái"}</span>
<div className="flex items-baseline gap-1">
<span className="font-price-display text-price-display text-primary">{"1.750.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
</div>
<div className="flex items-center gap-space-xs">
<button className="px-space-md py-space-xs rounded-full bg-surface-container-high text-primary hover:bg-surface-tint font-label-md text-label-md transition-all" type="button" data-action="detail">{"Chi tiết"}</button>
<button className="px-space-md py-space-xs rounded-full bg-on-tertiary-container text-on-primary hover:brightness-105 font-label-md text-label-md shadow-md shadow-tertiary-container/20 transition-all" type="button" data-action="book">{"Đặt xe"}</button>
</div>
</div>
</div>
</article>
</div>

<div className="flex items-center justify-center gap-space-sm mt-space-2xl">
<button className="w-10 h-10 rounded-full bg-surface-container shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" type="button">
<span className="material-symbols-outlined text-[20px]">{"chevron_left"}</span>
</button>
<button className="w-10 h-10 rounded-full bg-primary text-on-primary font-label-md text-label-md" type="button">{"1"}</button>
<button className="w-10 h-10 rounded-full bg-surface-container shadow-sm text-on-surface hover:bg-surface-tint font-label-md text-label-md transition-colors" type="button">{"2"}</button>
<button className="w-10 h-10 rounded-full bg-surface-container shadow-sm text-on-surface hover:bg-surface-tint font-label-md text-label-md transition-colors" type="button">{"3"}</button>
<span className="text-text-muted px-1">{"..."}</span>
<button className="w-10 h-10 rounded-full bg-surface-container shadow-sm text-on-surface hover:bg-surface-tint font-label-md text-label-md transition-colors" type="button">{"12"}</button>
<button className="w-10 h-10 rounded-full bg-surface-container shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" type="button">
<span className="material-symbols-outlined text-[20px]">{"chevron_right"}</span>
</button>
</div>
</section>

<section className="w-full bg-surface-container-low py-space-2xl">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-space-xl">
<span className="font-label-lg text-label-lg text-secondary uppercase tracking-wider">{"Tiện lợi & Minh bạch"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary mt-1">{"Quy định & Thủ tục thuê xe tự lái tại Kanow"}</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">{"\n          Ứng dụng quy trình số hóa toàn diện giúp bạn hoàn thành nhận xe chỉ trong 5 phút mà không phải trải qua các thủ tục phức tạp rườm rà.\n        "}</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">

<div className="bg-surface-container rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
<div className="flex flex-col gap-space-sm">
<div className="w-12 h-12 rounded-xl bg-surface-tint text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[26px]">{"badge"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary">{"1. Giấy tờ & eKYC 60 giây"}</h3>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n              Khách hàng chỉ cần chụp ảnh "}<strong>{"CCCD gắn chip"}</strong>{" và "}<strong>{"GPLX (B1/B2)"}</strong>{" còn hiệu lực trên ứng dụng hoặc website Kanow.\n            "}</p>
<div className="p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm text-text-muted flex items-center gap-2">
<span className="material-symbols-outlined text-status-success text-[18px]">{"check_circle"}</span>
<span>{"Kanow tuyệt đối "}<strong>{"không giữ lại"}</strong>{" bản gốc của giấy tờ tuỳ thân."}</span>
</div>
</div>
<span className="font-label-md text-label-md text-secondary font-semibold">{"Bước 1 / 3"}</span>
</div>

<div className="bg-surface-container rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
<div className="flex flex-col gap-space-sm">
<div className="w-12 h-12 rounded-xl bg-surface-tint text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[26px]">{"account_balance_wallet"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary">{"2. Chính sách cọc linh hoạt"}</h3>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n              Tùy chọn đặt cọc tài sản thế chấp thuận tiện: để lại "}<strong>{"1 xe máy chính chủ (kèm cà vẹt gốc)"}</strong>{" hoặc chuyển khoản tạm giữ từ "}<strong>{"5.000.000₫ – 15.000.000₫"}</strong>{" tùy phân khúc xe.\n            "}</p>
<div className="p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm text-text-muted flex items-center gap-2">
<span className="material-symbols-outlined text-status-success text-[18px]">{"check_circle"}</span>
<span>{"Hoàn trả tiền cọc ngay khi làm thủ tục trả xe xong."}</span>
</div>
</div>
<span className="font-label-md text-label-md text-secondary font-semibold">{"Bước 2 / 3"}</span>
</div>

<div className="bg-surface-container rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
<div className="flex flex-col gap-space-sm">
<div className="w-12 h-12 rounded-xl bg-surface-tint text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[26px]">{"videocam"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary">{"3. Bàn giao quay video 360°"}</h3>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n              Chuyên viên giao xe cùng bạn quay clip ngắn 4 mặt vỏ xe, vạch nhiên liệu và phụ kiện. Biên bản số hóa đồng bộ ngay lên hồ sơ thuê xe để đối soát minh bạch.\n            "}</p>
<div className="p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm text-text-muted flex items-center gap-2">
<span className="material-symbols-outlined text-status-success text-[18px]">{"check_circle"}</span>
<span>{"Cam kết nói không với việc tính phí xước sát không rõ ràng."}</span>
</div>
</div>
<span className="font-label-md text-label-md text-secondary font-semibold">{"Bước 3 / 3"}</span>
</div>
</div>

<div className="mt-space-xl bg-primary text-on-primary rounded-2xl p-space-lg flex flex-col lg:flex-row items-center justify-between gap-space-lg shadow-xl">
<div className="flex items-center gap-space-md">
<div className="w-14 h-14 rounded-full bg-surface-container/10 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-secondary-fixed text-[32px]">{"published_with_changes"}</span>
</div>
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm font-bold">{"Cam kết hoàn tiền 100% nếu xe không đúng mô tả"}</span>
<p className="font-body-md text-body-md text-on-primary-container">{"\n              Xe giao tới tay bạn luôn sạch sẽ, thơm mát, đúng dòng xe, đời sản xuất đã chọn trên hệ thống. Hỗ trợ xe thay thế tương đương lập tức nếu có sự cố bất khả kháng.\n            "}</p>
</div>
</div>
<div className="flex items-center gap-space-md shrink-0 w-full lg:w-auto">
<a className="flex-1 lg:flex-initial px-space-xl py-space-sm rounded-full bg-on-tertiary-container text-on-primary font-label-lg text-label-lg text-center shadow-lg hover:brightness-105 transition-all" href="tel:19008888">{"\n            Cứu hộ khẩn cấp 1900 8888\n          "}</a>
</div>
</div>
</div>
</section>

<section className="max-w-[1240px] mx-auto px-margin py-space-2xl w-full">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
<div className="lg:col-span-5 flex flex-col gap-space-md">
<div className="inline-flex items-center gap-space-xs text-secondary font-label-md text-label-md uppercase tracking-wider">
<span className="material-symbols-outlined text-[18px]">{"quiz"}</span>
<span>{"Giải đáp thắc mắc"}</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-primary">{"Các câu hỏi thường gặp khi thuê xe tự lái"}</h2>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n          Bạn chưa từng thuê xe qua Kanow? Đừng lo lắng, chúng tôi luôn có đội ngũ tư vấn viên túc trực hỗ trợ giải đáp 24/7.\n        "}</p>
<div className="p-space-md rounded-2xl bg-surface-container shadow-sm flex items-center gap-space-md mt-space-sm">
<div className="w-12 h-12 rounded-full bg-surface-tint flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[24px]">{"support_agent"}</span>
</div>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg text-on-surface font-bold">{"Cần hỗ trợ trực tiếp?"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"Đội ngũ kỹ thuật viên và chuyên viên giao xe sẵn sàng phục vụ"}</span>
</div>
</div>
</div>
<div className="lg:col-span-7 flex flex-col gap-space-sm" id="self-drive-faqs">

<div className="bg-surface-container rounded-xl p-space-md shadow-sm transition-all">
<button className="faq-toggle w-full flex items-center justify-between text-left font-headline-sm text-headline-sm text-primary" type="button" data-action="faq">
<span>{"Thời gian tính 1 ngày thuê xe được quy định như thế nào?"}</span>
<span className="material-symbols-outlined text-text-muted faq-icon transition-transform">{"expand_more"}</span>
</button>
<div className="faq-content hidden pt-space-sm font-body-md text-body-md text-on-surface-variant">{"\n            Tại Kanow, 1 ngày thuê tiêu chuẩn được tính tròn 24 giờ kể từ thời điểm nhận bàn giao xe (ví dụ: nhận xe 08:00 sáng hôm nay thì trả trước 08:00 sáng hôm sau). Trường hợp trả trễ dưới 2 giờ phụ thu 100.000đ/giờ; trễ trên 4 giờ sẽ tính tròn 1 ngày.\n          "}</div>
</div>

<div className="bg-surface-container rounded-xl p-space-md shadow-sm transition-all">
<button className="faq-toggle w-full flex items-center justify-between text-left font-headline-sm text-headline-sm text-primary" type="button" data-action="faq">
<span>{"Bảo hiểm chuyến đi chi trả những gì khi không may xảy ra va quẹt?"}</span>
<span className="material-symbols-outlined text-text-muted faq-icon transition-transform">{"expand_more"}</span>
</button>
<div className="faq-content hidden pt-space-sm font-body-md text-body-md text-on-surface-variant">{"\n            100% xe trên hệ thống Kanow đều có Bảo hiểm vật chất xe 2 chiều (bảo hiểm thân vỏ). Khi có sự cố xước xát hoặc va quẹt, bạn chỉ cần giữ nguyên hiện trường và liên hệ hotline Kanow để nhân viên giám định hỗ trợ thủ tục bảo hiểm với mức chế tài tối đa chỉ 2.000.000đ/vụ.\n          "}</div>
</div>

<div className="bg-surface-container rounded-xl p-space-md shadow-sm transition-all">
<button className="faq-toggle w-full flex items-center justify-between text-left font-headline-sm text-headline-sm text-primary" type="button" data-action="faq">
<span>{"Tôi có thể nhận xe tại sân bay Tân Sơn Nhất hoặc Nội Bài không?"}</span>
<span className="material-symbols-outlined text-text-muted faq-icon transition-transform">{"expand_more"}</span>
</button>
<div className="faq-content hidden pt-space-sm font-body-md text-body-md text-on-surface-variant">{"\n            Hoàn toàn được. Kanow có điểm đỗ và đối tác giao nhận xe trực tiếp tại sảnh ga đến các sân bay lớn: Tân Sơn Nhất (TP.HCM), Nội Bài (Hà Nội), Đà Nẵng, Cam Ranh, Phú Quốc. Bạn chỉ cần nhập mã chuyến bay khi đặt xe, nhân viên sẽ sẵn sàng đón ngay khi bạn hạ cánh.\n          "}</div>
</div>

<div className="bg-surface-container rounded-xl p-space-md shadow-sm transition-all">
<button className="faq-toggle w-full flex items-center justify-between text-left font-headline-sm text-headline-sm text-primary" type="button" data-action="faq">
<span>{"Thuê xe điện VinFast sạc pin ở đâu và chi phí thế nào?"}</span>
<span className="material-symbols-outlined text-text-muted faq-icon transition-transform">{"expand_more"}</span>
</button>
<div className="faq-content hidden pt-space-sm font-body-md text-body-md text-on-surface-variant">{"\n            Xe điện VinFast trên Kanow được liên kết tự động với toàn bộ hệ thống trạm sạc công cộng V-GREEN và Vincom trên khắp 63 tỉnh thành. Bạn có thể tra cứu trụ sạc ngay trên màn hình trung tâm của xe và sạc dễ dàng không cần thanh toán tiền mặt lúc cắm sạc.\n          "}</div>
</div>
</div>
</div>
</section>


</div></main>
  );
}
