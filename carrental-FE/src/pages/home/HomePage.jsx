import "@/components/home/components/home.css";
import { Link } from "react-router";
import { InteractiveGrid } from "@/components/InteractiveGrid.jsx";
import { HeroCarScene } from "@/components/home/components/HeroCarScene.jsx";
export default function Home() {
    return (<div className="cardb-screen screen-home bg-page-bg font-sans text-text-primary antialiased selection:bg-brand-accent selection:text-white  flex flex-col justify-between">



    <main className="w-full flex-1 flex flex-col">

    <InteractiveGrid>
    <div className="home-entry-grid" aria-hidden="true"/>
    <div className="home-entry-light" aria-hidden="true"/>
    <section className="relative z-10 w-full pt-8 pb-4" id="hero-section">
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col items-center">

    <div className="text-center max-w-3xl space-y-2 mb-4">
    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">{"\n            Mở lối mọi "}<span className="text-brand-accent">{"hành trình"}</span>
    </h1>
    <p className="text-xs md:text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">{"\n            Trải nghiệm các dòng xe tự lái cao cấp tiện lợi, minh bạch từng chi phí. Nhận xe linh hoạt theo giờ hoặc theo ngày tại TP. Hồ Chí Minh và toàn quốc.\n          "}</p>
    </div>

    <div className="hero-car-card relative w-full max-w-5xl overflow-hidden">
    <HeroCarScene />
    </div>
    </div>
    </section>

    <section className="relative z-10 w-full px-6 pt-8 pb-12 md:px-10" id="home-search">
    <div className="relative z-10 w-full max-w-5xl mx-auto">
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-border-light hover:border-brand-accent/40 transition-colors">

    <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-light flex-wrap gap-3">
    <div className="flex-wrap gap-y-2 flex items-center gap-2">
    <button className="ui-action inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-accent text-white shadow-sm" type="button" aria-label="Theo ngày" data-action="rental-mode">
    <span className="material-symbols-outlined text-[16px]">{"calendar_today"}</span>{"\n                Theo ngày\n              "}</button>
    <button className="ui-action inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-pill-bg transition-colors" type="button" aria-label="Theo giờ (Linh hoạt)" data-action="rental-mode">
    <span className="material-symbols-outlined text-[16px]">{"schedule"}</span>{"\n                Theo giờ"}<span className="hidden sm:inline">{"(Linh hoạt)"}</span></button>
    </div>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary">
    <span className="flex items-center gap-1 text-emerald-600 font-medium">
    <span className="material-symbols-outlined text-[16px]">{"check_circle"}</span>{" Miễn phí hủy trước 24h\n              "}</span>
    <span className="flex items-center gap-1 text-brand-accent font-medium">
    <span className="material-symbols-outlined text-[16px]">{"verified"}</span>{" Đặt cọc minh bạch, hoàn 100%\n              "}</span>
    </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">

    <div className="space-y-1">
    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
    <span className="material-symbols-outlined text-[14px] text-brand-accent">{"location_on"}</span>{"\n                Địa điểm nhận xe\n              "}</label>
    <select className="w-full h-11 px-3 bg-pill-bg text-text-primary text-xs font-semibold rounded-xl border border-transparent focus:border-brand-accent focus:bg-white outline-none" aria-label="Lựa chọn" defaultValue="TP. Hồ Chí Minh (Trung tâm & Sân bay)">
    <option>{"TP. Hồ Chí Minh (Trung tâm & Sân bay)"}</option>
    <option>{"Hà Nội (Tất cả khu vực & Nội Bài)"}</option>
    <option>{"Đà Nẵng (Sân bay & Ven biển)"}</option>
    <option>{"Bình Dương & Đồng Nai"}</option>
    </select>
    </div>

    <div className="space-y-1">
    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
    <span className="material-symbols-outlined text-[14px] text-brand-accent">{"calendar_month"}</span>{"\n                Bắt đầu nhận xe\n              "}</label>
    <input type="text" className="w-full h-11 px-3 bg-pill-bg text-text-primary text-xs font-semibold rounded-xl border border-transparent focus:border-brand-accent focus:bg-white outline-none" aria-label="Thời gian nhận xe" defaultValue="08:00, 25/10/2026"/>
    </div>

    <div className="space-y-1">
    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
    <span className="material-symbols-outlined text-[14px] text-brand-accent">{"event_available"}</span>{"\n                Bàn giao trả xe\n              "}</label>
    <input type="text" className="w-full h-11 px-3 bg-pill-bg text-text-primary text-xs font-semibold rounded-xl border border-transparent focus:border-brand-accent focus:bg-white outline-none" aria-label="Thời gian trả xe" defaultValue="20:00, 27/10/2026"/>
    </div>

    <div>
    <button className="w-full h-11 bg-brand-accent hover:bg-[#e05b19] active:scale-95 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2" type="button" aria-label="Tìm xe ngay" data-action="search">
    <span className="material-symbols-outlined text-[18px]">{"search"}</span>{"\n                Tìm xe ngay\n              "}</button>
    </div>
    </div>
    </div>
    </div>
    </section>
    </InteractiveGrid>

    <section className="w-full py-12 px-6 md:px-10 bg-white">
    <div className="w-full max-w-[1440px] mx-auto">

    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
    <div>
    <span className="text-xs font-bold text-brand-accent uppercase tracking-wider flex items-center gap-1.5">
    <span className="w-2 h-2 rounded-full bg-brand-accent"></span>{" Tuyển chọn hàng đầu\n            "}</span>
    <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary mt-1">{"Những mẫu xe nổi bật"}</h2>
    </div>

    <div className="flex items-center gap-2 overflow-x-auto pb-1">
    <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-brand-accent text-white shadow-sm whitespace-nowrap" type="button" aria-label="Tất cả" data-action="filter">{"Tất cả"}</button>
    <button className="px-4 py-1.5 rounded-full text-xs font-medium text-text-secondary bg-pill-bg hover:bg-border-light whitespace-nowrap" type="button" aria-label="Xe điện EV" data-action="filter">{"Xe điện EV"}</button>
    <button className="px-4 py-1.5 rounded-full text-xs font-medium text-text-secondary bg-pill-bg hover:bg-border-light whitespace-nowrap" type="button" aria-label="Gầm cao SUV" data-action="filter">{"Gầm cao SUV"}</button>
    <button className="px-4 py-1.5 rounded-full text-xs font-medium text-text-secondary bg-pill-bg hover:bg-border-light whitespace-nowrap" type="button" aria-label="Sedan Hạng sang" data-action="filter">{"Sedan Hạng sang"}</button>
    </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

    <div className="bg-card-bg rounded-2xl border border-border-light overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between" data-vehicle-card="ev" data-vehicle-name="VinFast VF 8 Plus" data-price="1250000">
    <div>
    <div className="relative w-full aspect-[16/10] bg-pill-bg overflow-hidden">
    <span className="absolute top-3 left-3 z-10 text-[10px] font-bold bg-black/60 text-white backdrop-blur-md px-2.5 py-1 rounded-full">{"Quận 7, TP.HCM"}</span>
    <button className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-text-secondary hover:text-red-500 shadow-sm transition-colors" type="button" aria-label="Lưu xe yêu thích" data-action="favorite">
    <span className="material-symbols-outlined text-[16px]">{"favorite"}</span>
    </button>
    <img src="/images/cardb-e5cfa07014e754d6.webp" alt="VinFast VF 8 Plus" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-car-image="true" loading="lazy" decoding="async"/>
    </div>
    <div className="p-4 space-y-2">
    <div className="flex items-center justify-between text-xs">
    <span className="text-text-secondary">{"Xe điện SUV 5 chỗ"}</span>
    <span className="font-bold text-amber-500 flex items-center gap-0.5">{"★ 4.9 "}<span className="text-text-secondary font-normal">{"(42)"}</span></span>
    </div>
    <h3 className="text-base font-bold text-text-primary group-hover:text-brand-accent transition-colors">{"VinFast VF 8 Plus"}</h3>
    <div className="flex items-center gap-3 text-[11px] text-text-secondary">
    <span className="">{"⚡ Thuần điện"}</span>
    <span className="">{"•"}</span>
    <span className="">{"5 Ghế da"}</span>
    <span className="">{"•"}</span>
    <span className="">{"AWD"}</span>
    </div>
    </div>
    </div>
    <div className="flex-wrap gap-y-2 p-4 pt-2 border-t border-border-light flex items-center justify-between mt-2">
    <div>
    <p className="text-xs text-text-secondary">{"Giá chỉ từ"}</p>
    <p className="text-sm font-extrabold text-brand-accent">{"1.250.000 đ"}<span className="text-[10px] text-text-secondary font-normal">{"/ngày"}</span></p>
    </div>
    <button className="ui-action px-3.5 py-1.5 rounded-xl bg-pill-bg hover:bg-brand-accent hover:text-white text-xs font-bold text-text-primary transition-colors" type="button" aria-label="Xem chi tiết" data-route="/explore">{"\n                Xem chi tiết\n              "}</button>
    </div>
    </div>

    <div className="bg-card-bg rounded-2xl border border-border-light overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between" data-vehicle-card="suv" data-vehicle-name="Mercedes GLC 300" data-price="2450000">
    <div>
    <div className="relative w-full aspect-[16/10] bg-pill-bg overflow-hidden">
    <span className="absolute top-3 left-3 z-10 text-[10px] font-bold bg-black/60 text-white backdrop-blur-md px-2.5 py-1 rounded-full">{"Bình Thạnh, TP.HCM"}</span>
    <button className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-text-secondary hover:text-red-500 shadow-sm transition-colors" type="button" aria-label="Lưu xe yêu thích" data-action="favorite">
    <span className="material-symbols-outlined text-[16px]">{"favorite"}</span>
    </button>
    <img src="/images/cardb-1ec43e930558b9f7.webp" alt="Mercedes GLC 300" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-car-image="true" loading="lazy" decoding="async"/>
    </div>
    <div className="p-4 space-y-2">
    <div className="flex items-center justify-between text-xs">
    <span className="text-text-secondary">{"SUV Hạng sang 5 chỗ"}</span>
    <span className="font-bold text-amber-500 flex items-center gap-0.5">{"★ 5.0 "}<span className="text-text-secondary font-normal">{"(68)"}</span></span>
    </div>
    <h3 className="text-base font-bold text-text-primary group-hover:text-brand-accent transition-colors">{"Mercedes GLC 300"}</h3>
    <div className="flex items-center gap-3 text-[11px] text-text-secondary">
    <span className="">{"⛽ Xăng 95"}</span>
    <span className="">{"•"}</span>
    <span className="">{"Burmester 3D"}</span>
    <span className="">{"•"}</span>
    <span className="">{"Tự động 9G"}</span>
    </div>
    </div>
    </div>
    <div className="flex-wrap gap-y-2 p-4 pt-2 border-t border-border-light flex items-center justify-between mt-2">
    <div>
    <p className="text-xs text-text-secondary">{"Giá chỉ từ"}</p>
    <p className="text-sm font-extrabold text-brand-accent">{"2.450.000 đ"}<span className="text-[10px] text-text-secondary font-normal">{"/ngày"}</span></p>
    </div>
    <button className="ui-action px-3.5 py-1.5 rounded-xl bg-pill-bg hover:bg-brand-accent hover:text-white text-xs font-bold text-text-primary transition-colors" type="button" aria-label="Xem chi tiết" data-route="/explore">{"\n                Xem chi tiết\n              "}</button>
    </div>
    </div>

    <div className="bg-card-bg rounded-2xl border border-border-light overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between" data-vehicle-card="suv" data-vehicle-name="Hyundai Santa Fe" data-price="1400000">
    <div>
    <div className="relative w-full aspect-[16/10] bg-pill-bg overflow-hidden">
    <span className="absolute top-3 left-3 z-10 text-[10px] font-bold bg-black/60 text-white backdrop-blur-md px-2.5 py-1 rounded-full">{"Tân Bình, TP.HCM"}</span>
    <button className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-text-secondary hover:text-red-500 shadow-sm transition-colors" type="button" aria-label="Lưu xe yêu thích" data-action="favorite">
    <span className="material-symbols-outlined text-[16px]">{"favorite"}</span>
    </button>
    <img src="/images/9aa3d9bc2c6c3ec1.webp" alt="Hyundai Santa Fe" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-car-image="true" loading="lazy" decoding="async"/>
    </div>
    <div className="p-4 space-y-2">
    <div className="flex items-center justify-between text-xs">
    <span className="text-text-secondary">{"SUV Gia đình 7 chỗ"}</span>
    <span className="font-bold text-amber-500 flex items-center gap-0.5">{"★ 4.8 "}<span className="text-text-secondary font-normal">{"(53)"}</span></span>
    </div>
    <h3 className="text-base font-bold text-text-primary group-hover:text-brand-accent transition-colors">{"Hyundai Santa Fe"}</h3>
    <div className="flex items-center gap-3 text-[11px] text-text-secondary">
    <span className="">{"⛽ Xăng Turbo"}</span>
    <span className="">{"•"}</span>
    <span className="">{"7 Chỗ rộng"}</span>
    <span className="">{"•"}</span>
    <span className="">{"HTRAC"}</span>
    </div>
    </div>
    </div>
    <div className="flex-wrap gap-y-2 p-4 pt-2 border-t border-border-light flex items-center justify-between mt-2">
    <div>
    <p className="text-xs text-text-secondary">{"Giá chỉ từ"}</p>
    <p className="text-sm font-extrabold text-brand-accent">{"1.400.000 đ"}<span className="text-[10px] text-text-secondary font-normal">{"/ngày"}</span></p>
    </div>
    <button className="ui-action px-3.5 py-1.5 rounded-xl bg-pill-bg hover:bg-brand-accent hover:text-white text-xs font-bold text-text-primary transition-colors" type="button" aria-label="Xem chi tiết" data-route="/explore">{"\n                Xem chi tiết\n              "}</button>
    </div>
    </div>

    <div className="bg-card-bg rounded-2xl border border-border-light overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between" data-vehicle-card="luxury" data-vehicle-name="Porsche Macan GTS" data-price="3800000">
    <div>
    <div className="relative w-full aspect-[16/10] bg-pill-bg overflow-hidden">
    <span className="absolute top-3 left-3 z-10 text-[10px] font-bold bg-black/60 text-white backdrop-blur-md px-2.5 py-1 rounded-full">{"Thủ Đức, TP.HCM"}</span>
    <button className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-text-secondary hover:text-red-500 shadow-sm transition-colors" type="button" aria-label="Lưu xe yêu thích" data-action="favorite">
    <span className="material-symbols-outlined text-[16px]">{"favorite"}</span>
    </button>
    <img src="/images/cardb-346d18fc6de163c0.webp" alt="Porsche Macan GTS" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-car-image="true" loading="lazy" decoding="async"/>
    </div>
    <div className="p-4 space-y-2">
    <div className="flex items-center justify-between text-xs">
    <span className="text-text-secondary">{"Thể thao Thượng lưu"}</span>
    <span className="font-bold text-amber-500 flex items-center gap-0.5">{"★ 5.0 "}<span className="text-text-secondary font-normal">{"(31)"}</span></span>
    </div>
    <h3 className="text-base font-bold text-text-primary group-hover:text-brand-accent transition-colors">{"Porsche Macan GTS"}</h3>
    <div className="flex items-center gap-3 text-[11px] text-text-secondary">
    <span className="">{"🏎️ 434 HP"}</span>
    <span className="">{"•"}</span>
    <span className="">{"5 Ghế da"}</span>
    <span className="">{"•"}</span>
    <span className="">{"PDK 7 cấp"}</span>
    </div>
    </div>
    </div>
    <div className="flex-wrap gap-y-2 p-4 pt-2 border-t border-border-light flex items-center justify-between mt-2">
    <div>
    <p className="text-xs text-text-secondary">{"Giá chỉ từ"}</p>
    <p className="text-sm font-extrabold text-brand-accent">{"3.800.000 đ"}<span className="text-[10px] text-text-secondary font-normal">{"/ngày"}</span></p>
    </div>
    <button className="ui-action px-3.5 py-1.5 rounded-xl bg-pill-bg hover:bg-brand-accent hover:text-white text-xs font-bold text-text-primary transition-colors" type="button" aria-label="Xem chi tiết" data-route="/explore">{"\n                Xem chi tiết\n              "}</button>
    </div>
    </div>
    </div>
    </div>
    </section>

    <section className="w-full px-4 md:px-8 bg-section-bg border-t border-border-light py-8" id="instructions-section">
    <div className="w-full max-w-[1440px] mx-auto">

    <div className="text-center max-w-2xl mx-auto mb-6">
    <span className="text-[11px] font-bold text-brand-accent uppercase tracking-wider bg-white px-3 py-0.5 rounded-full border border-border-light shadow-sm inline-block mb-1.5">{"Quy trình 4 bước đơn giản"}</span>
    <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">{"Hướng dẫn thuê xe nhanh tại CarDB"}</h2>
    <p className="text-xs md:text-sm text-text-secondary mt-1 leading-relaxed">{"Khởi hành thuận lợi chỉ trong vài bước thao tác số hóa hoàn toàn minh bạch, chuẩn chỉnh và an tâm tối đa."}</p>
    </div>

    <div className="max-w-5xl mx-auto flex flex-col space-y-0 border-y border-border-light bg-border-light overflow-hidden rounded-xl shadow-md">
    <div className="group relative bg-white overflow-hidden border-b border-border-light transition-all hover:bg-white/95">
    <div className="grid grid-cols-1 md:grid-cols-12 items-center">

    <div className="p-4 md:px-8 md:py-4 md:col-span-7 flex flex-col justify-center space-y-1.5">
    <div className="flex items-center gap-2.5">
    <span className="inline-flex items-center gap-1.5 bg-pill-bg px-2.5 py-0.5 rounded-full border border-border-light text-[10px] font-bold text-brand-accent uppercase tracking-wider">
    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>{" BƯỚC 01\n              "}</span>
    <h3 className="text-base md:text-lg font-bold text-text-primary group-hover:text-brand-accent transition-colors">{"Tìm & Chọn xe lý tưởng"}</h3>
    </div>
    <p className="text-xs text-text-secondary leading-snug line-clamp-2 md:line-clamp-none">{"\n              Dễ dàng tìm kiếm xe theo lịch trình nhận - trả linh hoạt theo giờ hoặc theo ngày. Bộ lọc thông minh theo thương hiệu, dòng xe điện EV hoặc SUV cho cả gia đình.\n            "}</p>
    <div className="flex flex-wrap gap-1.5 pt-0.5">
    <span className="text-[10px] font-medium bg-pill-bg text-text-primary px-2 py-0.5 rounded border border-border-light flex items-center gap-1">
    <span className="material-symbols-outlined text-[13px] text-brand-accent">{"tune"}</span>{" Lọc ngày / giờ\n              "}</span>
    <span className="text-[10px] font-medium bg-pill-bg text-text-primary px-2 py-0.5 rounded border border-border-light flex items-center gap-1">
    <span className="material-symbols-outlined text-[13px] text-brand-accent">{"electric_car"}</span>{" Xe EV & SUV\n              "}</span>
    <span className="text-[10px] font-medium bg-pill-bg text-text-primary px-2 py-0.5 rounded border border-border-light flex items-center gap-1">
    <span className="material-symbols-outlined text-[13px] text-brand-accent">{"verified"}</span>{" Đúng đời xe 100%\n              "}</span>
    </div>
    </div>

    <div className="relative h-[160px] w-full md:col-span-5 overflow-hidden md:[clip-path:polygon(10%_0%,100%_0%,100%_100%,0%_100%)]">
    <img src="/images/cardb-2c794680dab278af.webp" alt="Tìm & Chọn xe CarDB" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async"/>
    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20 pointer-events-none"></div>
    <div className="absolute bottom-2.5 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-white text-[10px] font-medium flex items-center gap-1.5 border border-white/10">
    <span className="material-symbols-outlined text-[13px] text-brand-accent">{"filter_alt"}</span>{"\n              Hơn 150+ xe sẵn sàng\n            "}</div>
    </div>
    </div>
    </div>

    <div className="group relative bg-[#FAFAF8] overflow-hidden border-b border-border-light transition-all hover:bg-white/95">
    <div className="grid grid-cols-1 md:grid-cols-12 items-center">

    <div className="relative h-[160px] w-full md:col-span-5 order-2 md:order-1 overflow-hidden md:[clip-path:polygon(0%_0%,100%_0%,90%_100%,0%_100%)]">
    <img src="/images/cardb-c32fcc6aef4fa1c7.webp" alt="eKYC và Đặt lịch số hóa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async"/>
    <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-black/20 pointer-events-none"></div>
    <div className="absolute bottom-2.5 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-white text-[10px] font-medium flex items-center gap-1.5 border border-white/10">
    <span className="material-symbols-outlined text-[13px] text-emerald-400">{"encrypted"}</span>{"\n              CCCD & GPLX bảo mật AI\n            "}</div>
    </div>

    <div className="p-4 md:px-8 md:py-4 md:col-span-7 order-1 md:order-2 flex flex-col justify-center space-y-1.5">
    <div className="flex items-center gap-2.5">
    <span className="inline-flex items-center gap-1.5 bg-pill-bg px-2.5 py-0.5 rounded-full border border-border-light text-[10px] font-bold text-brand-accent uppercase tracking-wider">
    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>{" BƯỚC 02\n              "}</span>
    <h3 className="text-base md:text-lg font-bold text-text-primary group-hover:text-brand-accent transition-colors">{"Xác thực eKYC & Đặt lịch"}</h3>
    </div>
    <p className="text-xs text-text-secondary leading-snug line-clamp-2 md:line-clamp-none">{"\n              Thực hiện quét CCCD gắn chip và Giấy phép lái xe tự động trong vòng 2 phút qua công nghệ AI. Không giữ lại giấy tờ gốc, ký hợp đồng điện tử an toàn.\n            "}</p>
    <div className="flex flex-wrap gap-1.5 pt-0.5">
    <span className="text-[10px] font-medium bg-pill-bg text-text-primary px-2 py-0.5 rounded border border-border-light flex items-center gap-1">
    <span className="material-symbols-outlined text-[13px] text-brand-accent">{"badge"}</span>{" Quét CCCD online\n              "}</span>
    <span className="text-[10px] font-medium bg-pill-bg text-text-primary px-2 py-0.5 rounded border border-border-light flex items-center gap-1">
    <span className="material-symbols-outlined text-[13px] text-brand-accent">{"schedule"}</span>{" Duyệt tự động < 2 phút\n              "}</span>
    <span className="text-[10px] font-medium bg-pill-bg text-text-primary px-2 py-0.5 rounded border border-border-light flex items-center gap-1">
    <span className="material-symbols-outlined text-[13px] text-brand-accent">{"lock"}</span>{" Chuẩn bảo mật ngân hàng\n              "}</span>
    </div>
    </div>
    </div>
    </div>

    <div className="group relative bg-white overflow-hidden border-b border-border-light transition-all hover:bg-white/95">
    <div className="grid grid-cols-1 md:grid-cols-12 items-center">

    <div className="p-4 md:px-8 md:py-4 md:col-span-7 flex flex-col justify-center space-y-1.5">
    <div className="flex items-center gap-2.5">
    <span className="inline-flex items-center gap-1.5 bg-pill-bg px-2.5 py-0.5 rounded-full border border-border-light text-[10px] font-bold text-brand-accent uppercase tracking-wider">
    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>{" BƯỚC 03\n              "}</span>
    <h3 className="text-base md:text-lg font-bold text-text-primary group-hover:text-brand-accent transition-colors">{"Nhận xe & Kiểm định đối soát"}</h3>
    </div>
    <p className="text-xs text-text-secondary leading-snug line-clamp-2 md:line-clamp-none">{"\n              Giao xe tận nơi tại nhà riêng, sân bay hoặc văn phòng. Hai bên đồng kiểm số ODO, nhiên liệu/pin và tình trạng thân vỏ bằng hình ảnh số hóa trên biên bản C10-A.\n            "}</p>
    <div className="flex flex-wrap gap-1.5 pt-0.5">
    <span className="text-[10px] font-medium bg-pill-bg text-text-primary px-2 py-0.5 rounded border border-border-light flex items-center gap-1">
    <span className="material-symbols-outlined text-[13px] text-brand-accent">{"local_shipping"}</span>{" Giao xe tận nơi hẹn\n              "}</span>
    <span className="text-[10px] font-medium bg-pill-bg text-text-primary px-2 py-0.5 rounded border border-border-light flex items-center gap-1">
    <span className="material-symbols-outlined text-[13px] text-brand-accent">{"photo_camera"}</span>{" Đối soát ảnh số C10-A\n              "}</span>
    <span className="text-[10px] font-medium bg-pill-bg text-text-primary px-2 py-0.5 rounded border border-border-light flex items-center gap-1">
    <span className="material-symbols-outlined text-[13px] text-brand-accent">{"clean_hands"}</span>{" Rửa sạch, khử trùng 100%\n              "}</span>
    </div>
    </div>

    <div className="relative h-[160px] w-full md:col-span-5 overflow-hidden md:[clip-path:polygon(10%_0%,100%_0%,100%_100%,0%_100%)]">
    <img src="/images/cardb-3710fd24d2f19a90.webp" alt="Kiểm định và nhận xe" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async"/>
    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20 pointer-events-none"></div>
    <div className="absolute bottom-2.5 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-white text-[10px] font-medium flex items-center gap-1.5 border border-white/10">
    <span className="material-symbols-outlined text-[13px] text-brand-accent">{"checklist"}</span>{"\n              Kiểm định 36 điểm kỹ thuật\n            "}</div>
    </div>
    </div>
    </div>

    <div className="group relative bg-[#FAFAF8] overflow-hidden transition-all hover:bg-white/95">
    <div className="grid grid-cols-1 md:grid-cols-12 items-center">

    <div className="relative h-[160px] w-full md:col-span-5 order-2 md:order-1 overflow-hidden md:[clip-path:polygon(0%_0%,100%_0%,90%_100%,0%_100%)]">
    <img src="/images/cardb-5126ce65c93cba31.webp" alt="Trải nghiệm hành trình và hoàn cọc" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async"/>
    <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-black/20 pointer-events-none"></div>
    <div className="absolute bottom-2.5 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-white text-[10px] font-medium flex items-center gap-1.5 border border-white/10">
    <span className="material-symbols-outlined text-[13px] text-emerald-400">{"payments"}</span>{"\n              Hoàn 100% cọc trong 15 phút\n            "}</div>
    </div>

    <div className="p-4 md:px-8 md:py-4 md:col-span-7 order-1 md:order-2 flex flex-col justify-center space-y-1.5">
    <div className="flex items-center gap-2.5">
    <span className="inline-flex items-center gap-1.5 bg-pill-bg px-2.5 py-0.5 rounded-full border border-border-light text-[10px] font-bold text-brand-accent uppercase tracking-wider">
    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>{" BƯỚC 04\n              "}</span>
    <h3 className="text-base md:text-lg font-bold text-text-primary group-hover:text-brand-accent transition-colors">{"Trải nghiệm & Hoàn cọc tức thì"}</h3>
    </div>
    <p className="text-xs text-text-secondary leading-snug line-clamp-2 md:line-clamp-none">{"\n              Tận hưởng chuyến đi với gói bảo hiểm 2 chiều và cứu hộ 24/7. Hoàn tất trả xe, toàn bộ tiền cọc được chuyển khoản hoàn trả 100% nhanh chóng trong 15 phút.\n            "}</p>
    <div className="flex flex-wrap gap-1.5 pt-0.5">
    <span className="text-[10px] font-medium bg-pill-bg text-text-primary px-2 py-0.5 rounded border border-border-light flex items-center gap-1">
    <span className="material-symbols-outlined text-[13px] text-brand-accent">{"shield"}</span>{" Bảo hiểm 2 chiều\n              "}</span>
    <span className="text-[10px] font-medium bg-pill-bg text-text-primary px-2 py-0.5 rounded border border-border-light flex items-center gap-1">
    <span className="material-symbols-outlined text-[13px] text-brand-accent">{"support_agent"}</span>{" Cứu hộ 24/7\n              "}</span>
    <span className="text-[10px] font-medium bg-pill-bg text-text-primary px-2 py-0.5 rounded border border-border-light flex items-center gap-1">
    <span className="material-symbols-outlined text-[13px] text-brand-accent">{"currency_exchange"}</span>{" Hoàn 100% tiền cọc\n              "}</span>
    </div>
    </div>
    </div>
    </div></div>
    </div>
    </section>

    <section className="w-full py-14 px-6 md:px-10 bg-white border-t border-border-light">
    <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"><div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24"><span className="text-xs font-bold text-brand-accent uppercase tracking-wider block">{"Hỗ trợ khách hàng"}</span><h2 className="text-2xl md:text-3xl font-extrabold text-text-primary mt-1 tracking-tight">{"Câu hỏi thường gặp (FAQ)"}</h2><p className="text-xs md:text-sm text-text-secondary leading-relaxed">{"Giải đáp nhanh các thắc mắc phổ biến về thuê xe tự lái tại CarDB. Nếu bạn cần giải đáp thêm, đừng ngần ngại liên hệ với chuyên viên CSKH 24/7 của chúng tôi."}</p><div className="pt-2"><Link to="/contact" className="inline-flex items-center gap-2 text-xs font-bold text-brand-accent hover:underline"><span className="material-symbols-outlined text-[16px]">{"support_agent"}</span>{" Liên hệ tư vấn trực tiếp"}</Link></div></div><div className="lg:col-span-8 space-y-3.5"><details className="group bg-card-bg rounded-2xl border border-border-light p-4 transition-all hover:border-brand-accent/50 open:border-brand-accent/60 open:shadow-sm"><summary className="flex items-center justify-between font-bold text-sm text-text-primary cursor-pointer list-none select-none"><span className="">{"Thủ tục thuê xe tự lái tại CarDB cần những giấy tờ gì?"}</span><span className="material-symbols-outlined text-text-secondary faq-icon transition-transform duration-300">{"expand_more"}</span></summary><div className="mt-3 text-xs text-text-secondary leading-relaxed pt-2 border-t border-border-light">{"Bạn chỉ cần có Căn cước công dân gắn chip (CCCD) và Giấy phép lái xe ô tô hạng B2 trở lên còn hiệu lực. Hệ thống sẽ xác thực eKYC số hóa bảo mật trong vòng 2 phút, không cần giữ lại hộ khẩu gốc hay giấy tờ tùy thân bản cứng."}</div></details><details className="group bg-card-bg rounded-2xl border border-border-light p-4 transition-all hover:border-brand-accent/50 open:border-brand-accent/60 open:shadow-sm"><summary className="flex items-center justify-between font-bold text-sm text-text-primary cursor-pointer list-none select-none"><span className="">{"Tiền cọc thế chấp được tính và hoàn lại như thế nào?"}</span><span className="material-symbols-outlined text-text-secondary faq-icon transition-transform duration-300">{"expand_more"}</span></summary><div className="mt-3 text-xs text-text-secondary leading-relaxed pt-2 border-t border-border-light">{"Tiền cọc thế chấp được hiển thị minh bạch cho từng dòng xe (từ 15.000.000 đ hoặc xe máy chính chủ). Khoản cọc được giữ an toàn và hoàn trả 100% về tài khoản ngân hàng của bạn ngay khi hoàn tất biên bản bàn giao trả xe (C10-B)."}</div></details><details className="group bg-card-bg rounded-2xl border border-border-light p-4 transition-all hover:border-brand-accent/50 open:border-brand-accent/60 open:shadow-sm"><summary className="flex items-center justify-between font-bold text-sm text-text-primary cursor-pointer list-none select-none"><span className="">{"Tôi có thể yêu cầu giao nhận xe tại sân bay hoặc khách sạn không?"}</span><span className="material-symbols-outlined text-text-secondary faq-icon transition-transform duration-300">{"expand_more"}</span></summary><div className="mt-3 text-xs text-text-secondary leading-relaxed pt-2 border-t border-border-light">{"Có. CarDB hỗ trợ giao xe linh hoạt tận nơi tại Sân bay Tân Sơn Nhất, Sân bay Nội Bài, các khách sạn trung tâm và các quận nội thành TP.HCM, Hà Nội, Đà Nẵng theo yêu cầu hẹn trước."}</div></details><details className="group bg-card-bg rounded-2xl border border-border-light p-4 transition-all hover:border-brand-accent/50 open:border-brand-accent/60 open:shadow-sm"><summary className="flex items-center justify-between font-bold text-sm text-text-primary cursor-pointer list-none select-none"><span className="">{"Chính sách bảo hiểm và sự cố trên đường được xử lý thế nào?"}</span><span className="material-symbols-outlined text-text-secondary faq-icon transition-transform duration-300">{"expand_more"}</span></summary><div className="mt-3 text-xs text-text-secondary leading-relaxed pt-2 border-t border-border-light">{"Tất cả phương tiện trên CarDB đều được trang bị gói Bảo hiểm vật chất 2 chiều toàn diện. Nếu phát sinh sự cố hoặc va chạm trên hành trình, đội ngũ Concierge và cứu hộ kỹ thuật 24/7 toàn quốc luôn sẵn sàng hỗ trợ qua hotline 1900 8899."}</div></details></div></div>
    </section>
    </main>




    </div>);
}
