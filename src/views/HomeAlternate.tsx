import Link from "next/link";

export default function HomeAlternate() {
  return (
<main className="w-full pt-20 bg-surface-canvas min-h-screen"><div className="flex flex-col w-full">

<section className="relative w-full max-w-[1240px] mx-auto px-margin pt-space-md pb-space-2xl">

<div className="relative w-full rounded-[2.5rem] bg-gradient-to-b from-surface-tint via-surface to-surface-canvas p-space-md sm:p-space-lg shadow-sm border border-border-subtle overflow-hidden">

<div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none"></div>
<div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-primary-fixed/25 blur-2xl pointer-events-none"></div>

<div className="relative z-10 pt-space-lg sm:pt-space-xl px-space-md sm:px-space-xl max-w-3xl">
<div className="inline-flex items-center gap-space-xs bg-surface-container/80 backdrop-blur-md px-space-md py-space-xs rounded-full shadow-sm mb-space-md">
<span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
<span className="font-label-md text-label-md text-primary font-semibold tracking-wide uppercase">{"Nền tảng thuê xe công nghệ số 1"}</span>
</div>
<h1 className="font-display-hero text-display-hero text-primary tracking-tight font-bold">{"\n          KANOW – Đồng Hành Mọi Chuyến Đi Của Bạn\n        "}</h1>
<p className="mt-space-md font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">{"\n          Dịch vụ thuê xe tự lái hoặc kèm tài xế chuyên nghiệp, thủ tục nhanh chóng, giao xe tận nơi chỉ trong 30 phút. Trải nghiệm xe đời mới, an tâm tuyệt đối.\n        "}</p>
</div>

<div className="relative w-full mt-space-lg min-h-[260px] sm:min-h-[340px] flex items-end justify-center overflow-hidden rounded-2xl">
<div className="absolute inset-0 bg-cover bg-center rounded-2xl opacity-90" data-alt="A luxurious modern fleet of electric and hybrid cars parked on an architectural coastal pavilion under soft daylight, clean oceanic teal ambiance, immaculate styling and contemporary premium atmosphere" style={{"backgroundImage": "url('/images/ba1cb2d9f0f24b11.webp')"}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>

<div className="relative z-10 mb-space-md flex items-center gap-space-xs bg-surface-container/60 backdrop-blur-md px-space-md py-space-xs rounded-full">
<button aria-label="Slide 1" className="w-6 h-2 rounded-full bg-primary transition-all" type="button"></button>
<button aria-label="Slide 2" className="w-2 h-2 rounded-full bg-outline-variant hover:bg-primary transition-all" type="button"></button>
<button aria-label="Slide 3" className="w-2 h-2 rounded-full bg-outline-variant hover:bg-primary transition-all" type="button"></button>
</div>
</div>
</div>

<div className="relative z-20 -mt-16 sm:-mt-20 max-w-[1080px] mx-auto px-space-xs sm:px-0">

<div className="flex items-center gap-1.5 pl-4 sm:pl-6 overflow-x-auto no-scrollbar">
<button className="px-space-lg py-space-sm rounded-t-xl bg-surface-container text-primary font-label-lg text-label-lg font-bold shadow-[0_-2px_10px_rgba(0,0,0,0.03)] border-t border-x border-border-subtle flex items-center gap-space-xs transition-colors" id="tab-self-drive" type="button">
<span className="material-symbols-outlined text-[18px]">{"directions_car"}</span>{"\n          Xe tự lái\n        "}</button>
<button className="px-space-lg py-space-sm rounded-t-xl bg-surface-tint/90 hover:bg-surface-tint text-secondary font-label-lg text-label-lg font-semibold flex items-center gap-space-xs transition-colors" id="tab-with-driver" type="button">
<span className="material-symbols-outlined text-[18px]">{"person"}</span>{"\n          Xe có tài xế\n        "}</button>
<button className="px-space-lg py-space-sm rounded-t-xl bg-surface-tint/90 hover:bg-surface-tint text-secondary font-label-lg text-label-lg font-semibold flex items-center gap-space-xs transition-colors" id="tab-chauffeur-only" type="button">
<span className="material-symbols-outlined text-[18px]">{"badge"}</span>{"\n          Tìm tài xế lái hộ\n        "}</button>
</div>

<div className="bg-surface-container rounded-3xl p-space-md sm:p-space-lg shadow-[0_16px_40px_-6px_rgba(20,85,91,0.14)] border border-border-subtle">
<form className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-center">

<div className="lg:col-span-4 flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-text-muted flex items-center gap-1" htmlFor="pickup-loc">
<span className="">{"Địa điểm nhận xe"}</span>
<span className="text-tertiary-container">{"*"}</span>
</label>
<div className="flex items-center gap-space-sm bg-surface-tint/40 hover:bg-surface-tint/70 focus-within:bg-surface-container focus-within:ring-2 focus-within:ring-secondary px-space-md py-3 rounded-2xl transition-all border border-border-subtle">
<span className="material-symbols-outlined text-secondary text-[22px]">{"location_on"}</span>
<input className="w-full bg-transparent font-label-lg text-label-lg text-on-surface focus:outline-none placeholder:text-text-muted" id="pickup-loc" placeholder="Chọn thành phố, sân bay..." type="text" defaultValue="Hà Nội (hoặc sân bay Nội Bài)" aria-label="Chọn thành phố, sân bay..." />
</div>
</div>

<div className="lg:col-span-5 flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-text-muted flex items-center justify-between" htmlFor="pickup-time">
<span className="">{"Thời gian thuê xe"}</span>
<span className="font-body-sm text-body-sm text-secondary font-medium">{"1 ngày 5 giờ"}</span>
</label>
<div className="flex items-center gap-space-sm bg-surface-tint/40 hover:bg-surface-tint/70 focus-within:bg-surface-container focus-within:ring-2 focus-within:ring-secondary px-space-md py-3 rounded-2xl transition-all border border-border-subtle cursor-pointer">
<span className="material-symbols-outlined text-secondary text-[22px]">{"calendar_month"}</span>
<div className="flex items-center gap-2 w-full text-on-surface font-label-lg text-label-lg truncate">
<span className="font-semibold text-primary">{"03:00"}</span>
<span className="text-text-muted">{"14/10/2026"}</span>
<span className="text-text-muted">{"—"}</span>
<span className="font-semibold text-primary">{"08:00"}</span>
<span className="text-text-muted">{"15/10/2026"}</span>
</div>
</div>
</div>

<div className="lg:col-span-3 flex flex-col justify-end">
<div className="hidden lg:block h-5"></div>
<button className="w-full h-[50px] inline-flex items-center justify-center gap-space-xs bg-[#FF9900] hover:bg-[#E68A00] active:scale-[0.99] text-on-primary font-label-lg text-label-lg uppercase tracking-wider font-bold rounded-2xl shadow-[0_6px_20px_rgba(255,153,0,0.35)] transition-all" type="submit" data-action="search">
<span className="material-symbols-outlined text-[20px]">{"search"}</span>
<span className="">{"Tìm Xe Ngay"}</span>
</button>
</div>

<div className="lg:col-span-12 pt-space-xs border-t border-border-subtle/50 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
<label className="inline-flex items-center gap-space-sm cursor-pointer select-none">
<input className="w-4 h-4 rounded text-secondary focus:ring-secondary border-border-subtle" id="toggle-driver" type="checkbox" aria-label="Chọn tùy chọn" />
<span className="font-label-lg text-label-lg text-on-surface">{"Cần thêm tài xế lái hộ"}</span>
<span className="font-body-sm text-body-sm bg-surface-tint text-primary font-semibold px-2 py-0.5 rounded-full">{"+350.000₫/ngày (Lịch thiệp, chuẩn giờ)"}</span>
</label>
<div className="flex items-center gap-space-md text-text-muted font-body-sm text-body-sm">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-status-success text-[16px]">{"check_circle"}</span>{"Giao nhận tại nhà"}</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-status-success text-[16px]">{"check_circle"}</span>{"Hỗ trợ giữ xe máy"}</span>
</div>
</div>
</form>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mt-space-md">
<div className="flex items-center gap-space-sm bg-surface-container/70 backdrop-blur-sm p-space-sm px-space-md rounded-2xl border border-border-subtle">
<div className="w-9 h-9 rounded-xl bg-surface-tint flex items-center justify-center text-primary flex-shrink-0">
<span className="material-symbols-outlined text-[20px]">{"verified_user"}</span>
</div>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg text-primary font-semibold">{"Không thế chấp lớn"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"Chỉ cần CCCD & GPLX hợp lệ"}</span>
</div>
</div>
<div className="flex items-center gap-space-sm bg-surface-container/70 backdrop-blur-sm p-space-sm px-space-md rounded-2xl border border-border-subtle">
<div className="w-9 h-9 rounded-xl bg-surface-tint flex items-center justify-center text-primary flex-shrink-0">
<span className="material-symbols-outlined text-[20px]">{"shield"}</span>
</div>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg text-primary font-semibold">{"Bảo hiểm 2 chiều toàn diện"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"An tâm trọn vẹn hành trình"}</span>
</div>
</div>
<div className="flex items-center gap-space-sm bg-surface-container/70 backdrop-blur-sm p-space-sm px-space-md rounded-2xl border border-border-subtle">
<div className="w-9 h-9 rounded-xl bg-surface-tint flex items-center justify-center text-primary flex-shrink-0">
<span className="material-symbols-outlined text-[20px]">{"event_busy"}</span>
</div>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg text-primary font-semibold">{"Miễn phí hủy chuyến"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"Hoàn tiền 100% trước 24 giờ"}</span>
</div>
</div>
</div>
</div>
</section>

<section className="w-full max-w-[1240px] mx-auto px-margin py-space-xl">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2 text-secondary">
<span className="material-symbols-outlined text-[18px]">{"commute"}</span>
<span className="font-label-md text-label-md uppercase tracking-wider font-semibold">{"Đội xe chất lượng cao"}</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">{"\n          Dòng Xe Đa Dạng & Bảng Giá Minh Bạch\n        "}</h2>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n          100% xe kiểm định định kỳ, khử khuẩn và giao xe sạch sẽ trước mỗi chuyến đi.\n        "}</p>
</div>

<div className="flex items-center gap-space-xs overflow-x-auto pb-1 no-scrollbar">
<button className="px-space-md py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm transition-all whitespace-nowrap" type="button" data-action="filter">{"Tất cả"}</button>
<button className="px-space-md py-1.5 rounded-full bg-surface-tint text-primary hover:bg-surface-tint/80 font-label-md text-label-md font-semibold transition-all whitespace-nowrap" type="button" data-action="filter">{"Sedan 4-5 chỗ"}</button>
<button className="px-space-md py-1.5 rounded-full bg-surface-tint text-primary hover:bg-surface-tint/80 font-label-md text-label-md font-semibold transition-all whitespace-nowrap" type="button" data-action="filter">{"SUV 7 chỗ"}</button>
<button className="px-space-md py-1.5 rounded-full bg-surface-tint text-primary hover:bg-surface-tint/80 font-label-md text-label-md font-semibold transition-all whitespace-nowrap" type="button" data-action="filter">{"Xe điện (VinFast)"}</button>
<button className="px-space-md py-1.5 rounded-full bg-surface-tint text-primary hover:bg-surface-tint/80 font-label-md text-label-md font-semibold transition-all whitespace-nowrap" type="button" data-action="filter">{"Xe Hạng Sang"}</button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">

<div className="group bg-surface-container rounded-3xl p-space-md border border-border-subtle shadow-sm hover:shadow-[0_12px_32px_rgba(20,85,91,0.12)] transition-all flex flex-col justify-between" data-vehicle-card="ev" data-vehicle-name="VinFast VF 8 Plus" data-price="1100000">
<div>

<div className="relative w-full h-48 rounded-2xl bg-surface-tint/60 overflow-hidden flex items-center justify-center">
<span className="absolute top-3 left-3 bg-secondary text-on-secondary font-label-md text-label-md px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
<span className="material-symbols-outlined text-[14px]">{"bolt"}</span>{" Điện thông minh\n            "}</span>
<span className="absolute top-3 right-3 bg-surface-container/90 backdrop-blur-sm text-primary font-label-md text-label-md px-2.5 py-1 rounded-full font-semibold">{"\n              Đời 2024\n            "}</span>
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/4d4b59997c2a3d07.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
</div>

<div className="mt-space-md flex items-start justify-between gap-space-xs">
<div>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold">{"VinFast VF 8 Plus"}</h3>
<p className="font-body-sm text-body-sm text-text-muted">{"SUV Điện · Tự hành ADAS · Cửa sổ trời toàn cảnh"}</p>
</div>
<div className="flex items-center gap-1 bg-surface-tint px-2 py-1 rounded-lg text-primary font-semibold text-body-sm">
<span className="material-symbols-outlined text-amber-500 text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="">{"4.9"}</span>
</div>
</div>

<div className="grid grid-cols-3 gap-2 mt-space-md p-space-sm rounded-xl bg-surface-tint/30 text-center font-body-sm text-body-sm text-on-surface-variant">
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-secondary">{"airline_seat_recline_normal"}</span>
<span className="">{"5 Chỗ"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-secondary">{"settings"}</span>
<span className="">{"Số tự động"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-secondary">{"battery_charging_full"}</span>
<span className="">{"420 km / sạc"}</span>
</div>
</div>
</div>

<div className="mt-space-md pt-space-sm border-t border-border-subtle">
<div className="flex items-baseline justify-between mb-space-sm">
<div>
<span className="font-body-sm text-body-sm text-text-muted">{"Giá tự lái từ:"}</span>
<div className="flex items-baseline gap-1">
<span className="font-price-display text-price-display text-primary">{"1.100.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
</div>
<span className="font-label-md text-label-md text-secondary bg-surface-tint px-2 py-0.5 rounded-full font-medium">{"+350k có tài xế"}</span>
</div>
<div className="grid grid-cols-2 gap-space-xs">
<button className="w-full py-2.5 rounded-xl border border-secondary text-secondary hover:bg-surface-tint font-label-lg text-label-lg font-semibold transition-colors flex items-center justify-center gap-1" type="button" data-action="detail">{"\n              Chi tiết\n            "}</button>
<button className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold transition-colors shadow-sm flex items-center justify-center gap-1" type="button" data-action="book">{"\n              Đặt xe ngay\n            "}</button>
</div>
</div>
</div>

<div className="group bg-surface-container rounded-3xl p-space-md border border-border-subtle shadow-sm hover:shadow-[0_12px_32px_rgba(20,85,91,0.12)] transition-all flex flex-col justify-between" data-vehicle-card="sedan" data-vehicle-name="Toyota Corolla Cross" data-price="950000">
<div>

<div className="relative w-full h-48 rounded-2xl bg-surface-tint/60 overflow-hidden flex items-center justify-center">
<span className="absolute top-3 left-3 bg-primary text-on-primary font-label-md text-label-md px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
<span className="material-symbols-outlined text-[14px]">{"eco"}</span>{" Tiết kiệm xăng\n            "}</span>
<span className="absolute top-3 right-3 bg-surface-container/90 backdrop-blur-sm text-primary font-label-md text-label-md px-2.5 py-1 rounded-full font-semibold">{"\n              Đời 2023\n            "}</span>
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/4965262edfd12b31.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
</div>

<div className="mt-space-md flex items-start justify-between gap-space-xs">
<div>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold">{"Toyota Corolla Cross"}</h3>
<p className="font-body-sm text-body-sm text-text-muted">{"Crossover · Xăng lai Điện Hybrid · Tiện nghi"}</p>
</div>
<div className="flex items-center gap-1 bg-surface-tint px-2 py-1 rounded-lg text-primary font-semibold text-body-sm">
<span className="material-symbols-outlined text-amber-500 text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="">{"4.8"}</span>
</div>
</div>

<div className="grid grid-cols-3 gap-2 mt-space-md p-space-sm rounded-xl bg-surface-tint/30 text-center font-body-sm text-body-sm text-on-surface-variant">
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-secondary">{"airline_seat_recline_normal"}</span>
<span className="">{"5 Chỗ"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-secondary">{"settings"}</span>
<span className="">{"CVT Tự động"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-secondary">{"local_gas_station"}</span>
<span className="">{"4.2L / 100km"}</span>
</div>
</div>
</div>

<div className="mt-space-md pt-space-sm border-t border-border-subtle">
<div className="flex items-baseline justify-between mb-space-sm">
<div>
<span className="font-body-sm text-body-sm text-text-muted">{"Giá tự lái từ:"}</span>
<div className="flex items-baseline gap-1">
<span className="font-price-display text-price-display text-primary">{"950.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
</div>
<span className="font-label-md text-label-md text-secondary bg-surface-tint px-2 py-0.5 rounded-full font-medium">{"+350k có tài xế"}</span>
</div>
<div className="grid grid-cols-2 gap-space-xs">
<button className="w-full py-2.5 rounded-xl border border-secondary text-secondary hover:bg-surface-tint font-label-lg text-label-lg font-semibold transition-colors flex items-center justify-center gap-1" type="button" data-action="detail">{"\n              Chi tiết\n            "}</button>
<button className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold transition-colors shadow-sm flex items-center justify-center gap-1" type="button" data-action="book">{"\n              Đặt xe ngay\n            "}</button>
</div>
</div>
</div>

<div className="group bg-surface-container rounded-3xl p-space-md border border-border-subtle shadow-sm hover:shadow-[0_12px_32px_rgba(20,85,91,0.12)] transition-all flex flex-col justify-between" data-vehicle-card="suv" data-vehicle-name="Hyundai Santa Fe" data-price="1350000">
<div>

<div className="relative w-full h-48 rounded-2xl bg-surface-tint/60 overflow-hidden flex items-center justify-center">
<span className="absolute top-3 left-3 bg-secondary text-on-secondary font-label-md text-label-md px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
<span className="material-symbols-outlined text-[14px]">{"family_restroom"}</span>{" Rộng rãi cho cả nhà\n            "}</span>
<span className="absolute top-3 right-3 bg-surface-container/90 backdrop-blur-sm text-primary font-label-md text-label-md px-2.5 py-1 rounded-full font-semibold">{"\n              Đời 2024\n            "}</span>
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/3aa1b8ca8925659e.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
</div>

<div className="mt-space-md flex items-start justify-between gap-space-xs">
<div>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold">{"Hyundai Santa Fe"}</h3>
<p className="font-body-sm text-body-sm text-text-muted">{"SUV 7 Chỗ · Dẫn động 4 bánh HTRAC · Cao cấp"}</p>
</div>
<div className="flex items-center gap-1 bg-surface-tint px-2 py-1 rounded-lg text-primary font-semibold text-body-sm">
<span className="material-symbols-outlined text-amber-500 text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="">{"4.9"}</span>
</div>
</div>

<div className="grid grid-cols-3 gap-2 mt-space-md p-space-sm rounded-xl bg-surface-tint/30 text-center font-body-sm text-body-sm text-on-surface-variant">
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-secondary">{"airline_seat_recline_normal"}</span>
<span className="">{"7 Chỗ ngồi"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-secondary">{"settings"}</span>
<span className="">{"Số tự động 8 cấp"}</span>
</div>
<div className="flex flex-col items-center">
<span className="material-symbols-outlined text-[18px] text-secondary">{"luggage"}</span>
<span className="">{"Cốp cực rộng"}</span>
</div>
</div>
</div>

<div className="mt-space-md pt-space-sm border-t border-border-subtle">
<div className="flex items-baseline justify-between mb-space-sm">
<div>
<span className="font-body-sm text-body-sm text-text-muted">{"Giá tự lái từ:"}</span>
<div className="flex items-baseline gap-1">
<span className="font-price-display text-price-display text-primary">{"1.350.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
</div>
<span className="font-label-md text-label-md text-secondary bg-surface-tint px-2 py-0.5 rounded-full font-medium">{"+350k có tài xế"}</span>
</div>
<div className="grid grid-cols-2 gap-space-xs">
<button className="w-full py-2.5 rounded-xl border border-secondary text-secondary hover:bg-surface-tint font-label-lg text-label-lg font-semibold transition-colors flex items-center justify-center gap-1" type="button" data-action="detail">{"\n              Chi tiết\n            "}</button>
<button className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold transition-colors shadow-sm flex items-center justify-center gap-1" type="button" data-action="book">{"\n              Đặt xe ngay\n            "}</button>
</div>
</div>
</div>
</div>

<div className="mt-space-lg text-center">
<Link className="inline-flex items-center gap-space-xs px-space-xl py-space-sm rounded-full bg-surface-tint text-primary hover:bg-surface-tint/70 font-label-lg text-label-lg font-semibold transition-colors border border-border-subtle" href="/lien-he">
<span className="">{"Xem toàn bộ 80+ dòng xe sẵn sàng giao ngay"}</span>
<span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
</Link>
</div>
</section>

<section className="w-full bg-surface-container py-space-2xl border-y border-border-subtle">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="text-center max-w-2xl mx-auto mb-space-xl">
<span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-semibold">{"Giá trị cốt lõi"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight mt-1">{"\n          Tại Sao Khách Hàng Luôn Tin Chọn Kanow?\n        "}</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">{"\n          Mang đến chuẩn mực mới cho ngành dịch vụ di chuyển cá nhân và gia đình tại Việt Nam.\n        "}</p>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">

<div className="bg-surface-canvas p-space-lg rounded-3xl border border-border-subtle/80 flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-2xl bg-surface-tint flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[26px]">{"swap_driving_apps_wheel"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold">{"Linh Hoạt Lựa Chọn"}</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">{"\n              Tự do làm chủ tay lái để tận hưởng chuyến đi riêng tư, hoặc chọn tài xế kinh nghiệm lái xe an toàn, thư thái.\n            "}</p>
</div>
<span className="mt-space-md text-secondary font-label-md text-label-md font-semibold flex items-center gap-1">{"01 / Trải nghiệm cá nhân"}</span>
</div>

<div className="bg-surface-canvas p-space-lg rounded-3xl border border-border-subtle/80 flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-2xl bg-surface-tint flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[26px]">{"receipt_long"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold">{"Minh Bạch Tuyệt Đối"}</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">{"\n              Không phí ẩn phát sinh. Mọi chi phí thuê xe, phụ phí vượt giờ hay số km đều được hiển thị rõ ràng trên hợp đồng điện tử.\n            "}</p>
</div>
<span className="mt-space-md text-secondary font-label-md text-label-md font-semibold flex items-center gap-1">{"02 / Không phụ phí ẩn"}</span>
</div>

<div className="bg-surface-canvas p-space-lg rounded-3xl border border-border-subtle/80 flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-2xl bg-surface-tint flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[26px]">{"verified"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold">{"100% Xe Đời Mới"}</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">{"\n              Đội ngũ xe phục vụ có tuổi đời dưới 3 năm, bảo dưỡng chính hãng liên tục, khoang nội thất luôn sạch khuẩn và thơm mát.\n            "}</p>
</div>
<span className="mt-space-md text-secondary font-label-md text-label-md font-semibold flex items-center gap-1">{"03 / Tiêu chuẩn an toàn"}</span>
</div>

<div className="bg-surface-canvas p-space-lg rounded-3xl border border-border-subtle/80 flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-2xl bg-surface-tint flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[26px]">{"headset_mic"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold">{"Hỗ Trợ Toàn Quốc 24/7"}</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">{"\n              Tổng đài viên tận tâm luôn thường trực cùng mạng lưới đối tác cứu hộ khẩn cấp trên 63 tỉnh thành, bất kể ngày đêm.\n            "}</p>
</div>
<span className="mt-space-md text-secondary font-label-md text-label-md font-semibold flex items-center gap-1">{"04 / Cứu hộ nhanh chóng"}</span>
</div>
</div>
</div>
</section>

<section className="w-full max-w-[1240px] mx-auto px-margin py-space-2xl">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">

<div className="lg:col-span-5 flex flex-col gap-space-md">
<span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-semibold">{"Quy trình đơn giản"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">{"\n          Đặt Xe Nhanh Chóng Chỉ Trong 3 Bước\n        "}</h2>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{"\n          Ứng dụng công nghệ eKYC xác thực căn cước công dân trong 60 giây. Không cần giữ lại giấy tờ tùy thân gốc của khách hàng.\n        "}</p>

<div className="flex flex-col gap-space-md mt-space-sm">
<div className="flex items-start gap-space-md p-space-md rounded-2xl bg-surface-container border border-border-subtle shadow-sm">
<div className="w-9 h-9 rounded-full bg-primary text-on-primary font-bold text-headline-sm flex items-center justify-center flex-shrink-0">{"\n              1\n            "}</div>
<div className="flex flex-col">
<h4 className="font-headline-sm text-headline-sm text-primary font-semibold">{"Chọn Mẫu Xe & Thời Gian"}</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{"Tìm kiếm chiếc xe phù hợp từ phân khúc sedan, SUV 7 chỗ gia đình đến xe điện cao cấp."}</p>
</div>
</div>
<div className="flex items-start gap-space-md p-space-md rounded-2xl bg-surface-container border border-border-subtle shadow-sm">
<div className="w-9 h-9 rounded-full bg-secondary text-on-secondary font-bold text-headline-sm flex items-center justify-center flex-shrink-0">{"\n              2\n            "}</div>
<div className="flex flex-col">
<h4 className="font-headline-sm text-headline-sm text-primary font-semibold">{"Lựa Chọn Tự Lái / Kèm Tài Xế"}</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{"Tùy biến hành trình chỉ với một nút gạt: cầm lái tự do hoặc để tài xế Kanow phục vụ."}</p>
</div>
</div>
<div className="flex items-start gap-space-md p-space-md rounded-2xl bg-surface-container border border-border-subtle shadow-sm">
<div className="w-9 h-9 rounded-full bg-[#FF9900] text-on-primary font-bold text-headline-sm flex items-center justify-center flex-shrink-0">{"\n              3\n            "}</div>
<div className="flex flex-col">
<h4 className="font-headline-sm text-headline-sm text-primary font-semibold">{"Nhận Xe Tận Nơi Trong 30 Phút"}</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{"Giao xe tận nhà hoặc sân bay. Kiểm tra biên bản bàn giao điện tử và khởi hành thuận lợi."}</p>
</div>
</div>
</div>
</div>

<div className="lg:col-span-7">
<div className="relative rounded-3xl overflow-hidden p-space-lg bg-gradient-to-br from-surface-tint via-surface to-surface-canvas border border-border-subtle shadow-md">
<div className="relative w-full h-[380px] rounded-2xl overflow-hidden bg-cover bg-center" data-alt="A smiling young Vietnamese driver handover car keys to a satisfied customer in front of an upscale residence, professional rental handover, sunny peaceful morning" style={{"backgroundImage": "url('/images/e7ebb90bcf8473fa.webp')"}}>

<div className="absolute bottom-4 left-4 right-4 bg-surface-container/90 backdrop-blur-md p-space-md rounded-2xl border border-border-subtle flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-status-success/20 text-status-success flex items-center justify-center">
<span className="material-symbols-outlined">{"schedule"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-primary font-bold">{"Cam kết đúng giờ 100%"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Bồi thường 200.000₫ nếu giao chậm quá 15 phút"}</div>
</div>
</div>
<span className="font-label-md text-label-md text-primary bg-surface-tint px-3 py-1.5 rounded-full font-bold">{"Chuẩn 5 Sao"}</span>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full max-w-[1240px] mx-auto px-margin pb-space-2xl">
<div className="relative rounded-3xl bg-primary text-on-primary p-space-xl overflow-hidden shadow-xl">

<div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-secondary-container/15 blur-3xl pointer-events-none"></div>
<div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full bg-[#FF9900]/20 blur-2xl pointer-events-none"></div>
<div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
<div className="lg:col-span-8 flex flex-col gap-2">
<div className="inline-flex items-center gap-1.5 bg-[#FF9900] text-on-primary text-label-md font-bold px-3 py-1 rounded-full uppercase tracking-wider w-max">
<span className="material-symbols-outlined text-[14px]">{"local_activity"}</span>{"\n            Ưu đãi mở màn hành trình\n          "}</div>
<h2 className="font-display-hero text-headline-lg sm:text-display-hero font-bold tracking-tight text-on-primary">{"\n            Giảm Ngay 15% Cho Chuyến Đi Đầu Tiên\n          "}</h2>
<p className="font-body-lg text-body-lg text-on-primary-container max-w-xl">{"\n            Nhập mã "}<strong className="text-white font-mono bg-white/20 px-2 py-0.5 rounded">{"KANOWNEW"}</strong>{" khi thanh toán để nhận ngay chiết khấu tối đa 300.000₫. Áp dụng cho cả tự lái và có tài xế.\n          "}</p>
</div>
<div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
<Link className="px-space-xl py-space-md rounded-full bg-[#FF9900] hover:bg-[#E68A00] text-on-primary font-label-lg text-label-lg font-bold uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 inline-flex items-center gap-2" href="/lien-he">
<span className="">{"Nhận Mã Ngay"}</span>
<span className="material-symbols-outlined text-[20px]">{"arrow_forward"}</span>
</Link>
<span className="font-body-sm text-body-sm text-on-primary-container mt-2">{"Hạn ưu đãi đến 31/12/2026 · Số lượng có hạn"}</span>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface-container-low py-space-2xl">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
<div>
<span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-semibold">{"Khách hàng đánh giá"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight mt-1">{"\n            Hơn 25.000+ Hành Trình Trọn Vẹn Cùng Kanow\n          "}</h2>
</div>
<div className="flex items-center gap-space-xs text-primary font-label-lg text-label-lg">
<div className="flex text-amber-500">
<span className="material-symbols-outlined text-[20px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[20px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[20px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[20px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[20px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
</div>
<span className="font-bold">{"4.92 / 5"}</span>
<span className="text-text-muted">{"(Dựa trên 3.420 đánh giá thực tế)"}</span>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">

<div className="bg-surface-container rounded-3xl p-space-lg border border-border-subtle shadow-sm flex flex-col justify-between">
<p className="font-body-md text-body-md text-on-surface italic leading-relaxed">{"\n            \"Gia đình mình thuê chiếc Hyundai Santa Fe đi Hạ Long 3 ngày. Xe sạch bong không mùi thuốc lá, bạn tài xế lái rất điềm đạm và am hiểu đường xá, chỉ cho cả nhà nhiều quán ăn ngon. Rất hài lòng!\"\n          "}</p>
<div className="mt-space-md pt-space-md border-t border-border-subtle flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center text-primary font-bold">{"\n              AT\n            "}</div>
<div>
<div className="font-label-lg text-label-lg text-primary font-bold">{"Anh Tuấn Minh"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Doanh nhân · Hà Nội (Thuê có tài xế)"}</div>
</div>
</div>
</div>

<div className="bg-surface-container rounded-3xl p-space-lg border border-border-subtle shadow-sm flex flex-col justify-between">
<p className="font-body-md text-body-md text-on-surface italic leading-relaxed">{"\n            \"Trải nghiệm tự lái VinFast VF 8 qua Kanow thực sự mượt mà. Đặt xe trên web chỉ 2 phút là xong, nhân viên giao xe tận chung cư, pin sạc sẵn 95%. Lại không cần giữ cọc tiền mặt lớn, dịch vụ chuẩn quốc tế.\"\n          "}</p>
<div className="mt-space-md pt-space-md border-t border-border-subtle flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center text-primary font-bold">{"\n              HL\n            "}</div>
<div>
<div className="font-label-lg text-label-lg text-primary font-bold">{"Chị Hoàng Linh"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Marketing Director · TP. Hồ Chí Minh"}</div>
</div>
</div>
</div>

<div className="bg-surface-container rounded-3xl p-space-lg border border-border-subtle shadow-sm flex flex-col justify-between">
<p className="font-body-md text-body-md text-on-surface italic leading-relaxed">{"\n            \"Hôm đi tiếp khách tại Hải Phòng có uống chút bia nên dùng dịch vụ Tài xế lái hộ của Kanow. Bác tài đến đúng giờ, mặc sơ mi lịch thiệp, giữ xe cẩn thận. Cực kỳ an tâm và chuyên nghiệp.\"\n          "}</p>
<div className="mt-space-md pt-space-md border-t border-border-subtle flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center text-primary font-bold">{"\n              ĐQ\n            "}</div>
<div>
<div className="font-label-lg text-label-lg text-primary font-bold">{"Anh Đặng Quốc Khánh"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Khách hàng thường xuyên"}</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full max-w-[1240px] mx-auto px-margin py-space-2xl">
<div className="text-center max-w-2xl mx-auto mb-space-xl">
<span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-semibold">{"Giải đáp thắc mắc"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight mt-1">{"\n        Câu Hỏi Thường Gặp\n      "}</h2>
</div>
<div className="max-w-3xl mx-auto flex flex-col gap-space-sm">
<div className="bg-surface-container p-space-md rounded-2xl border border-border-subtle">
<h4 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center justify-between">
<span className="">{"Thủ tục thuê xe tự lái tại Kanow cần những giấy tờ gì?"}</span>
<span className="material-symbols-outlined text-secondary">{"expand_more"}</span>
</h4>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">{"\n          Bạn chỉ cần CCCD gắn chip (hoặc Hộ chiếu) còn hạn và Giấy phép lái xe hạng B1/B2 trở lên. Hệ thống Kanow hỗ trợ chụp định danh trực tuyến eKYC, không giữ lại bản gốc của bạn.\n        "}</p>
</div>
<div className="bg-surface-container p-space-md rounded-2xl border border-border-subtle">
<h4 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center justify-between">
<span className="">{"Nếu có nhu cầu thuê thêm tài xế lái xe thì chi phí như thế nào?"}</span>
<span className="material-symbols-outlined text-secondary">{"expand_more"}</span>
</h4>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">{"\n          Chỉ cần cộng thêm từ 350.000₫/ngày cho tài xế phục vụ 10 tiếng/ngày trong nội thành. Tài xế đã được xác minh lý lịch tư pháp, có chứng chỉ hành nghề và am hiểu địa phương.\n        "}</p>
</div>
<div className="bg-surface-container p-space-md rounded-2xl border border-border-subtle">
<h4 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center justify-between">
<span className="">{"Hình thức thanh toán và chính sách cọc xe ra sao?"}</span>
<span className="material-symbols-outlined text-secondary">{"expand_more"}</span>
</h4>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">{"\n          Kanow hỗ trợ đa dạng: Chuyển khoản VietQR, Thẻ tín dụng hoặc Ví điện tử. Với các dòng xe phổ thông, bạn chỉ cần cọc giữ chỗ nhẹ nhàng hoặc xe máy chính chủ kèm cà vẹt xe.\n        "}</p>
</div>
</div>
</section>
</div>
</main>
  );
}
