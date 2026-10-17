import Link from "next/link";
import type { CSSProperties } from "react";

export default function Explore() { return (<div className="cardb-screen screen-explore bg-[#fcf9f8] font-body-md text-[#1b1c1c] antialiased  flex flex-col justify-between selection:bg-[#fc6c26] selection:text-white">



<main className="w-full flex-1 flex flex-col justify-start pt-20">
<div className="flex flex-col w-full">

<section className="relative w-full overflow-hidden bg-gradient-to-b from-[#f6f3f2] to-[#fcf9f8] py-8 px-6 md:px-10 border-b border-[#E9E9E7]">
<div className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-6">

<div className="flex flex-col gap-2">
<nav className="flex items-center gap-2 font-label-md text-sm text-[#594138]">
<Link className="transition-colors hover:text-[#fc6c26]" href="/">{"Trang chủ"}</Link>
<span className="text-[#8d7166]">{"/"}</span>
<span className="font-semibold text-[#fc6c26]">{"Khám phá xe"}</span>
</nav>
</div>

<div className="relative w-full rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#E9E9E7]">
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">

<div className="relative lg:col-span-4 rounded-xl bg-[#f6f3f2] p-3 transition-colors hover:bg-[#eae7e7] focus-within:ring-2 focus-within:ring-[#fc6c26]/40 border border-[#e1bfb3]/40">
<label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#594138]">
<span className="material-symbols-outlined text-[#fc6c26] text-[16px]">{"location_on"}</span>{"\nĐịa điểm nhận xe\n"}</label>
<div className="mt-1 flex items-center justify-between">
<input className="w-full bg-transparent text-sm font-semibold text-[#1b1c1c] outline-none" readOnly={true} type="text" aria-label="Thông tin" defaultValue="Hà Nội (Tất cả khu vực & Sân bay)" />
<span className="material-symbols-outlined text-[#8d7166] text-[18px]">{"expand_more"}</span>
</div>
</div>

<div className="relative lg:col-span-3 rounded-xl bg-[#f6f3f2] p-3 transition-colors hover:bg-[#eae7e7] focus-within:ring-2 focus-within:ring-[#fc6c26]/40 border border-[#e1bfb3]/40">
<label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#594138]">
<span className="material-symbols-outlined text-[#fc6c26] text-[16px]">{"calendar_today"}</span>{"\nNgày & giờ nhận\n"}</label>
<div className="mt-1 flex items-center justify-between">
<span className="text-sm font-semibold text-[#1b1c1c]">{"08:00, 26/10/2025"}</span>
<span className="material-symbols-outlined text-[#8d7166] text-[18px]">{"schedule"}</span>
</div>
</div>

<div className="relative lg:col-span-3 rounded-xl bg-[#f6f3f2] p-3 transition-colors hover:bg-[#eae7e7] focus-within:ring-2 focus-within:ring-[#fc6c26]/40 border border-[#e1bfb3]/40">
<label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#594138]">
<span className="material-symbols-outlined text-[#fc6c26] text-[16px]">{"event_repeat"}</span>{"\nNgày & giờ trả\n"}</label>
<div className="mt-1 flex items-center justify-between">
<span className="text-sm font-semibold text-[#1b1c1c]">{"20:00, 28/10/2025"}</span>
<span className="material-symbols-outlined text-[#8d7166] text-[18px]">{"schedule"}</span>
</div>
</div>

<div className="lg:col-span-2 flex items-center">
<button className="w-full h-full min-h-[52px] rounded-xl bg-[#fc6c26] font-semibold text-white shadow-md shadow-[#fc6c26]/30 hover:bg-[#e05b1b] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2" type="button" aria-label="Tìm xe ngay" data-action="search">
<span className="material-symbols-outlined text-[20px]">{"search"}</span>
<span>{"Tìm xe ngay"}</span>
</button>
</div>
</div>

<div className="mt-3 pt-3 flex flex-wrap items-center gap-2 border-t border-[#E9E9E7]">
<span className="text-xs text-[#8d7166] uppercase font-bold tracking-wider mr-1">{"Thành phố phổ biến:"}</span>
<button className="rounded-full bg-[#1E1E1E] px-3.5 py-1 text-xs font-semibold text-white shadow-sm" type="button" aria-label="Tất cả" data-action="filter">{"\nTất cả\n"}</button>
<button className="rounded-full bg-[#f6f3f2] border border-[#E9E9E7] px-3.5 py-1 text-xs font-medium text-[#1E1E1E] hover:bg-[#eae7e7] transition-colors" type="button" aria-label="Hà Nội (54)" data-action="choice">{"\nHà Nội (54)\n"}</button>
<button className="rounded-full bg-[#f6f3f2] border border-[#E9E9E7] px-3.5 py-1 text-xs font-medium text-[#594138] hover:text-[#1E1E1E] hover:bg-[#eae7e7] transition-colors" type="button" aria-label="TP. Hồ Chí Minh (68)" data-action="choice">{"\nTP. Hồ Chí Minh (68)\n"}</button>
<button className="rounded-full bg-[#f6f3f2] border border-[#E9E9E7] px-3.5 py-1 text-xs font-medium text-[#594138] hover:text-[#1E1E1E] hover:bg-[#eae7e7] transition-colors" type="button" aria-label="Đà Nẵng (22)" data-action="choice">{"\nĐà Nẵng (22)\n"}</button>
<button className="rounded-full bg-[#f6f3f2] border border-[#E9E9E7] px-3.5 py-1 text-xs font-medium text-[#594138] hover:text-[#1E1E1E] hover:bg-[#eae7e7] transition-colors" type="button" aria-label="Cần Thơ (12)" data-action="choice">{"\nCần Thơ (12)\n"}</button>
</div>
</div>
</div>
</section>

<div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-8 pt-20">
<div className="flex flex-col lg:flex-row gap-8 items-start">

<aside className="w-full lg:w-[310px] shrink-0 sticky top-20 flex flex-col gap-5">
<div className="rounded-2xl bg-white p-6 shadow-sm border border-[#E9E9E7] flex flex-col gap-7">

<div className="flex items-center justify-between pb-4 border-b border-[#E9E9E7]">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[#fc6c26] text-[22px]">{"tune"}</span>
<h2 className="text-lg text-[#1E1E1E] font-bold">{"Bộ lọc tìm kiếm"}</h2>
</div>
<span className="text-xs text-[#fc6c26] font-semibold bg-[#fc6c26]/10 px-2.5 py-0.5 rounded-full border border-[#fc6c26]/20">{"Hà Nội"}</span>
</div>

<div className="flex flex-col gap-3">
<div className="flex items-center justify-between">
<h3 className="text-xs uppercase tracking-wider text-[#666666] font-bold">{"Loại xe & Phân khúc"}</h3>
<span className="text-[11px] text-[#fc6c26] font-semibold cursor-pointer hover:underline">{"Xóa chọn (3)"}</span>
</div>
<div className="relative flex items-center">
<span className="material-symbols-outlined text-[#8d7166] text-[18px] absolute left-3 pointer-events-none">{"search"}</span>
<input className="w-full bg-[#f6f3f2] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1E1E1E] placeholder:text-[#8d7166] outline-none border border-[#E9E9E7] focus:border-[#fc6c26] transition-all" placeholder="Nhập hoặc chọn loại xe..." type="text" aria-label="Nhập hoặc chọn loại xe..." />
</div>
<div className="flex flex-wrap gap-1.5">
<span className="inline-flex items-center gap-1 bg-[#fc6c26]/10 border border-[#fc6c26]/30 text-[#a53c00] px-2.5 py-1 rounded-full text-[12px] font-semibold">{"\nSUV Gầm cao "}<span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-black">{"close"}</span>
</span>
<span className="inline-flex items-center gap-1 bg-[#fc6c26]/10 border border-[#fc6c26]/30 text-[#a53c00] px-2.5 py-1 rounded-full text-[12px] font-semibold">{"\nSedan Đô thị "}<span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-black">{"close"}</span>
</span>
<span className="inline-flex items-center gap-1 bg-[#fc6c26]/10 border border-[#fc6c26]/30 text-[#a53c00] px-2.5 py-1 rounded-full text-[12px] font-semibold">{"\nXe Điện "}<span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-black">{"close"}</span>
</span>
</div>
<div className="flex flex-wrap gap-1.5 pt-1">
<span className="text-[11px] text-[#666666] font-medium self-center mr-0.5">{"Gợi ý:"}</span>
<button className="px-2.5 py-0.5 rounded-full bg-[#f6f3f2] hover:bg-[#eae7e7] border border-[#E9E9E7] text-[#594138] text-[11px] font-medium transition-colors" type="button" aria-label="+ Crossover" data-action="choice">{"+ Crossover"}</button>
<button className="px-2.5 py-0.5 rounded-full bg-[#f6f3f2] hover:bg-[#eae7e7] border border-[#E9E9E7] text-[#594138] text-[11px] font-medium transition-colors" type="button" aria-label="+ Bán tải" data-action="choice">{"+ Bán tải"}</button>
<button className="px-2.5 py-0.5 rounded-full bg-[#f6f3f2] hover:bg-[#eae7e7] border border-[#E9E9E7] text-[#594138] text-[11px] font-medium transition-colors" type="button" aria-label="+ MPV" data-action="choice">{"+ MPV"}</button>
</div>
</div>

<div className="flex flex-col gap-3">
<div className="flex items-center justify-between">
<h3 className="text-xs uppercase tracking-wider text-[#666666] font-bold">{"Khoảng giá thuê"}</h3>
<span className="text-xs text-[#fc6c26] font-bold">{"VNĐ"}</span>
</div>
<div className="grid grid-cols-2 gap-2 p-1 bg-[#f6f3f2] rounded-xl border border-[#E9E9E7]">
<label className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#fc6c26] text-white text-xs font-bold cursor-pointer shadow-sm">
<input className="hidden" name="price_mode" type="radio" defaultChecked={true} />
<span>{"Theo ngày"}</span>
</label>
<label className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[#594138] hover:text-[#1E1E1E] text-xs font-medium cursor-pointer transition-colors">
<input className="hidden" name="price_mode" type="radio" />
<span>{"Theo giờ"}</span>
</label>
</div>
<div className="flex items-center justify-between text-xs font-semibold text-[#1E1E1E] px-1">
<span className="text-[#666666]">{"500.000₫"}</span>
<span className="text-[#fc6c26] font-bold">{"5.000.000₫ / ngày"}</span>
</div>
<div className="relative w-full h-2 rounded-full bg-[#eae7e7] my-1">
<div className="absolute left-0 top-0 h-full w-4/5 rounded-full bg-[#fc6c26]"></div>
<div className="absolute right-[20%] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white shadow-md ring-2 ring-[#fc6c26] cursor-pointer hover:scale-110 transition-transform"></div>
</div>
</div>

<div className="flex flex-col gap-3">
<h3 className="text-xs uppercase tracking-wider text-[#666666] font-bold">{"Số chỗ ngồi"}</h3>
<div className="grid grid-cols-3 gap-2">
<button className="py-2 text-center rounded-xl bg-[#f6f3f2] border border-[#E9E9E7] text-[#1E1E1E] text-xs font-medium hover:border-[#fc6c26]/50 hover:bg-white transition-colors" type="button" aria-label="4 Chỗ" data-action="choice">{"\n4 Chỗ\n"}</button>
<button className="py-2 text-center rounded-xl bg-[#1E1E1E] text-white text-xs font-bold shadow-sm" type="button" aria-label="5 Chỗ" data-action="choice">{"\n5 Chỗ\n"}</button>
<button className="py-2 text-center rounded-xl bg-[#f6f3f2] border border-[#E9E9E7] text-[#1E1E1E] text-xs font-medium hover:border-[#fc6c26]/50 hover:bg-white transition-colors" type="button" aria-label="7 Chỗ" data-action="choice">{"\n7 Chỗ\n"}</button>
</div>
</div>

<div className="flex flex-col gap-3">
<h3 className="text-xs uppercase tracking-wider text-[#666666] font-bold">{"Hộp số & Vận hành"}</h3>
<div className="flex flex-col gap-2.5 text-xs">
<label className="flex items-center gap-2.5 cursor-pointer">
<input className="rounded bg-white text-[#fc6c26] focus:ring-[#fc6c26] border-[#e1bfb3] cursor-pointer w-4 h-4" type="checkbox" defaultChecked={true} />
<span className="text-[#1E1E1E] font-medium">{"Số Tự Động (AT)"}</span>
</label>
<label className="flex items-center gap-2.5 cursor-pointer">
<input className="rounded bg-white text-[#fc6c26] focus:ring-[#fc6c26] border-[#e1bfb3] cursor-pointer w-4 h-4" type="checkbox" />
<span className="text-[#594138]">{"Số Sàn (MT)"}</span>
</label>
<label className="flex items-center gap-2.5 cursor-pointer">
<input className="rounded bg-white text-[#fc6c26] focus:ring-[#fc6c26] border-[#e1bfb3] cursor-pointer w-4 h-4" type="checkbox" defaultChecked={true} />
<span className="text-[#1E1E1E] font-medium">{"Dẫn động 4 bánh (AWD / 4WD)"}</span>
</label>
</div>
</div>

<div className="flex flex-col gap-3">
<h3 className="text-xs uppercase tracking-wider text-[#666666] font-bold">{"Nhiên liệu"}</h3>
<div className="flex flex-col gap-2.5 text-xs">
<label className="flex items-center justify-between cursor-pointer group">
<span className="flex items-center gap-2.5">
<input className="text-[#fc6c26] focus:ring-[#fc6c26] border-[#e1bfb3] cursor-pointer w-4 h-4" name="fuel_type" type="radio" />
<span className="group-hover:text-[#fc6c26] transition-colors text-[#594138]">{"Tất cả nhiên liệu"}</span>
</span>
<span className="text-[#8d7166]">{"54 xe"}</span>
</label>
<label className="flex items-center justify-between cursor-pointer group">
<span className="flex items-center gap-2.5">
<input className="text-[#fc6c26] focus:ring-[#fc6c26] border-[#e1bfb3] cursor-pointer w-4 h-4" name="fuel_type" type="radio" defaultChecked={true} />
<span className="group-hover:text-[#fc6c26] transition-colors text-[#a53c00] font-semibold">{"Thuần Điện (EV)"}</span>
</span>
<span className="text-[#fc6c26] font-bold">{"28 xe"}</span>
</label>
<label className="flex items-center justify-between cursor-pointer group">
<span className="flex items-center gap-2.5">
<input className="text-[#fc6c26] focus:ring-[#fc6c26] border-[#e1bfb3] cursor-pointer w-4 h-4" name="fuel_type" type="radio" />
<span className="group-hover:text-[#fc6c26] transition-colors text-[#594138]">{"Xăng (Gasoline)"}</span>
</span>
<span className="text-[#8d7166]">{"18 xe"}</span>
</label>
<label className="flex items-center justify-between cursor-pointer group">
<span className="flex items-center gap-2.5">
<input className="text-[#fc6c26] focus:ring-[#fc6c26] border-[#e1bfb3] cursor-pointer w-4 h-4" name="fuel_type" type="radio" />
<span className="group-hover:text-[#fc6c26] transition-colors text-[#594138]">{"Dầu Diesel"}</span>
</span>
<span className="text-[#8d7166]">{"5 xe"}</span>
</label>
<label className="flex items-center justify-between cursor-pointer group">
<span className="flex items-center gap-2.5">
<input className="text-[#fc6c26] focus:ring-[#fc6c26] border-[#e1bfb3] cursor-pointer w-4 h-4" name="fuel_type" type="radio" />
<span className="group-hover:text-[#fc6c26] transition-colors text-[#594138]">{"Hybrid (Lai điện)"}</span>
</span>
<span className="text-[#8d7166]">{"3 xe"}</span>
</label>
</div>
</div>

<div className="flex flex-col gap-3">
<h3 className="text-xs uppercase tracking-wider text-[#666666] font-bold">{"Thương hiệu xe"}</h3>
<div className="grid grid-cols-2 gap-2.5 text-xs text-[#1E1E1E]">
<label className="flex items-center gap-2 cursor-pointer font-semibold text-[#fc6c26]">
<input className="rounded bg-white text-[#fc6c26] focus:ring-[#fc6c26] border-[#e1bfb3] cursor-pointer w-4 h-4" type="checkbox" defaultChecked={true} />
<span>{"VinFast"}</span>
</label>
<label className="flex items-center gap-2 cursor-pointer">
<input className="rounded bg-white text-[#fc6c26] focus:ring-[#fc6c26] border-[#e1bfb3] cursor-pointer w-4 h-4" type="checkbox" defaultChecked={true} />
<span>{"BMW"}</span>
</label>
<label className="flex items-center gap-2 cursor-pointer">
<input className="rounded bg-white text-[#fc6c26] focus:ring-[#fc6c26] border-[#e1bfb3] cursor-pointer w-4 h-4" type="checkbox" defaultChecked={true} />
<span>{"Porsche"}</span>
</label>
<label className="flex items-center gap-2 cursor-pointer">
<input className="rounded bg-white text-[#fc6c26] focus:ring-[#fc6c26] border-[#e1bfb3] cursor-pointer w-4 h-4" type="checkbox" defaultChecked={true} />
<span>{"Mercedes"}</span>
</label>
<label className="flex items-center gap-2 cursor-pointer">
<input className="rounded bg-white text-[#fc6c26] focus:ring-[#fc6c26] border-[#e1bfb3] cursor-pointer w-4 h-4" type="checkbox" />
<span className="text-[#594138]">{"Audi"}</span>
</label>
<label className="flex items-center gap-2 cursor-pointer">
<input className="rounded bg-white text-[#fc6c26] focus:ring-[#fc6c26] border-[#e1bfb3] cursor-pointer w-4 h-4" type="checkbox" />
<span className="text-[#594138]">{"Hyundai"}</span>
</label>
</div>
</div>

<div className="flex flex-col gap-2.5 pt-4 border-t border-[#E9E9E7]">
<button className="w-full py-2.5 rounded-xl bg-[#fc6c26] font-bold text-white shadow-md shadow-[#fc6c26]/25 hover:bg-[#e05b1b] transition-all active:scale-98 text-sm" type="button" aria-label="Áp dụng bộ lọc" data-action="apply-filter">{"\nÁp dụng bộ lọc\n"}</button>
<button className="w-full py-2 rounded-xl bg-transparent border border-[#E9E9E7] text-[#594138] font-medium hover:text-[#1E1E1E] hover:border-[#8d7166] hover:bg-[#f6f3f2] transition-all text-sm" type="button" aria-label="Xóa bộ lọc" data-action="clear-filter">{"\nXóa bộ lọc\n"}</button>
</div>
</div>
</aside>

<section className="flex-1 w-full flex flex-col gap-6">

<div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm border border-[#E9E9E7]">
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
<div className="flex flex-wrap items-center gap-2.5">
<div className="flex items-center gap-2">
<span className="text-base font-bold text-[#1E1E1E]">{"12 xe sẵn sàng"}</span>
<span className="text-[#8d7166]">{"•"}</span>
<span className="text-sm text-[#fc6c26] font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">{"location_on"}</span>{" Hà Nội\n"}</span>
</div>
<div className="hidden sm:block h-4 w-px bg-[#E9E9E7]"></div>
<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f6f3f2] border border-[#E9E9E7] text-xs text-[#1E1E1E]">
<span className="material-symbols-outlined text-[#fc6c26] text-[16px]">{"date_range"}</span>
<span className="text-[#666666]">{"Thời gian thuê:"}</span>
<strong className="text-[#1E1E1E] font-semibold">{"08:00, 26/10/2025 — 20:00, 28/10/2025"}</strong>
</div>
</div>

<div className="flex items-center gap-3">
<div className="flex items-center gap-2 rounded-xl bg-[#f6f3f2] px-3.5 py-1.5 border border-[#E9E9E7]">
<span className="text-xs text-[#666666] whitespace-nowrap">{"Sắp xếp:"}</span>
<select className="bg-transparent text-xs font-semibold text-[#1E1E1E] border-none p-0 focus:ring-0 cursor-pointer whitespace-nowrap" aria-label="Lựa chọn">
<option value="recommended">{"Đề xuất tốt nhất"}</option>
<option value="price-asc">{"Giá: Thấp đến Cao"}</option>
<option value="price-desc">{"Giá: Cao đến Thấp"}</option>
<option value="rating">{"Đánh giá cao nhất"}</option>
</select>
</div>
<div className="flex items-center rounded-xl bg-[#f6f3f2] p-1 border border-[#E9E9E7]">
<button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E1E1E] text-white shadow-sm" title="Xem dạng lưới" type="button" aria-label="Xem dạng lưới" data-action="view-layout" data-layout="grid">
<span className="material-symbols-outlined text-[18px]">{"grid_view"}</span>
</button>
<button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#666666] hover:text-[#1E1E1E]" title="Xem dạng danh sách" type="button" aria-label="Xem dạng danh sách" data-action="view-layout" data-layout="list">
<span className="material-symbols-outlined text-[18px]">{"view_list"}</span>
</button>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

<article className="group relative flex flex-col h-full rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[#E9E9E7]" data-vehicle-card="ev" data-vehicle-name="VinFast VF 9 Plus AWD" data-price="38">
<div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
<span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#1E1E1E] uppercase tracking-wider border border-[#E9E9E7] shadow-sm">{"\n      Xe Điện Hạng Sang\n    "}</span>
<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold border border-emerald-200 shadow-sm">
<span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>{"\n      Còn lịch trống\n    "}</span>
</div>
<div className="relative h-52 w-full shrink-0 overflow-hidden bg-[#f6f3f2]">
<img alt="VinFast VF 9 Plus" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src="/images/cardb-02d5cb41aa8f9514.webp" data-car-image="true" loading="lazy" decoding="async" />
<div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
<div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 backdrop-blur-sm border border-[#E9E9E7] shadow-sm">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px]" style={{"fontVariationSettings": "'FILL' 1"} as CSSProperties}>{"star"}</span>
<span className="text-xs font-bold text-[#1E1E1E]">{"5.0"}</span>
<span className="text-xs text-[#666666]">{"(38 đánh giá)"}</span>
</div>
</div>
<div className="flex flex-1 flex-col p-5 justify-between gap-4">
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between text-xs text-[#fc6c26] font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden">
<span className="truncate">{"VinFast"}</span>
<span className="text-[#666666] normal-case flex items-center gap-1 shrink-0 text-xs font-normal">
<span className="material-symbols-outlined text-[14px]">{"location_on"}</span>{" Cầu Giấy, HN\n        "}</span>
</div>
<h3 className="text-[17px] font-bold text-[#1E1E1E] truncate group-hover:text-[#fc6c26] transition-colors leading-snug" title="VinFast VF 9 Plus AWD">{"\n        VinFast VF 9 Plus AWD\n      "}</h3>
</div>

<div className="grid grid-cols-2 gap-2 text-xs">
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"airline_seat_recline_normal"}</span>
<span className="truncate font-medium">{"7 Chỗ ngồi"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"settings"}</span>
<span className="truncate font-medium">{"Số tự động (AT)"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"electric_bolt"}</span>
<span className="truncate font-medium">{"Thuần điện 402 HP"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"all_inclusive"}</span>
<span className="truncate font-medium">{"Dẫn động AWD"}</span>
</div>
</div>

<div className="mt-auto pt-3 border-t border-[#E9E9E7] flex items-center justify-between gap-3">
<div className="flex flex-col min-w-0">
<div className="flex items-baseline gap-1 whitespace-nowrap">
<span className="text-xs text-[#666666] font-normal">{"Ngày:"}</span>
<span className="text-[17px] font-bold text-[#fc6c26] leading-none">{"1.950.000₫"}</span>
<span className="text-[11px] text-[#666666] font-normal">{"/ngày"}</span>
</div>
<div className="flex items-baseline gap-1 whitespace-nowrap mt-1">
<span className="text-xs text-[#666666] font-normal">{"Giờ:"}</span>
<span className="text-[13px] font-semibold text-[#1E1E1E] leading-none">{"195.000₫"}</span>
<span className="text-[10px] text-[#666666] font-normal">{"/giờ"}</span>
</div>
</div>
<Link className="shrink-0 whitespace-nowrap rounded-xl bg-[#fc6c26] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#e05b1b] transition-all active:scale-95 text-center" href="/xe/vinfast-vf8-plus-2024">{"\n        Xem chi tiết\n      "}</Link>
</div>
</div>
</article>

<article className="group relative flex flex-col h-full rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[#E9E9E7]" data-vehicle-card="luxury" data-vehicle-name="BMW 530i M Sport" data-price="52">
<div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
<span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#1E1E1E] uppercase tracking-wider border border-[#E9E9E7] shadow-sm">{"\n      Sedan Thượng Lưu\n    "}</span>
<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold border border-emerald-200 shadow-sm">
<span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>{"\n      Còn lịch trống\n    "}</span>
</div>
<div className="relative h-52 w-full shrink-0 overflow-hidden bg-[#f6f3f2]">
<img alt="BMW 530i M Sport" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src="/images/cardb-c0fae6b830847cd7.webp" data-car-image="true" loading="lazy" decoding="async" />
<div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
<div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 backdrop-blur-sm border border-[#E9E9E7] shadow-sm">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px]" style={{"fontVariationSettings": "'FILL' 1"} as CSSProperties}>{"star"}</span>
<span className="text-xs font-bold text-[#1E1E1E]">{"4.9"}</span>
<span className="text-xs text-[#666666]">{"(52 đánh giá)"}</span>
</div>
</div>
<div className="flex flex-1 flex-col p-5 justify-between gap-4">
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between text-xs text-[#fc6c26] font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden">
<span className="truncate">{"BMW M Series"}</span>
<span className="text-[#666666] normal-case flex items-center gap-1 shrink-0 text-xs font-normal">
<span className="material-symbols-outlined text-[14px]">{"location_on"}</span>{" Ba Đình, HN\n        "}</span>
</div>
<h3 className="text-[17px] font-bold text-[#1E1E1E] truncate group-hover:text-[#fc6c26] transition-colors leading-snug" title="BMW 530i M Sport">{"\n        BMW 530i M Sport\n      "}</h3>
</div>
<div className="grid grid-cols-2 gap-2 text-xs">
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"airline_seat_recline_normal"}</span>
<span className="truncate font-medium">{"5 Chỗ ngồi"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"settings"}</span>
<span className="truncate font-medium">{"Tự động 8 cấp"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"local_gas_station"}</span>
<span className="truncate font-medium">{"Xăng Turbo 252 HP"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"swap_driving_apps_wheel"}</span>
<span className="truncate font-medium">{"Cầu sau (RWD)"}</span>
</div>
</div>
<div className="mt-auto pt-3 border-t border-[#E9E9E7] flex items-center justify-between gap-3">
<div className="flex flex-col min-w-0">
<div className="flex items-baseline gap-1 whitespace-nowrap">
<span className="text-xs text-[#666666] font-normal">{"Ngày:"}</span>
<span className="text-[17px] font-bold text-[#fc6c26] leading-none">{"2.200.000₫"}</span>
<span className="text-[11px] text-[#666666] font-normal">{"/ngày"}</span>
</div>
<div className="flex items-baseline gap-1 whitespace-nowrap mt-1">
<span className="text-xs text-[#666666] font-normal">{"Giờ:"}</span>
<span className="text-[13px] font-semibold text-[#1E1E1E] leading-none">{"220.000₫"}</span>
<span className="text-[10px] text-[#666666] font-normal">{"/giờ"}</span>
</div>
</div>
<Link className="shrink-0 whitespace-nowrap rounded-xl bg-[#fc6c26] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#e05b1b] transition-all active:scale-95 text-center" href="/xe/vinfast-vf8-plus-2024">{"\n        Xem chi tiết\n      "}</Link>
</div>
</div>
</article>

<article className="group relative flex flex-col h-full rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[#E9E9E7]" data-vehicle-card="luxury" data-vehicle-name="Porsche Macan GTS" data-price="31">
<div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
<span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#1E1E1E] uppercase tracking-wider border border-[#E9E9E7] shadow-sm">{"\n      Thể Thao Đẳng Cấp\n    "}</span>
<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold border border-emerald-200 shadow-sm">
<span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>{"\n      Còn lịch trống\n    "}</span>
</div>
<div className="relative h-52 w-full shrink-0 overflow-hidden bg-[#f6f3f2]">
<img alt="Porsche Macan GTS" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src="/images/cardb-346d18fc6de163c0.webp" data-car-image="true" loading="lazy" decoding="async" />
<div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
<div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 backdrop-blur-sm border border-[#E9E9E7] shadow-sm">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px]" style={{"fontVariationSettings": "'FILL' 1"} as CSSProperties}>{"star"}</span>
<span className="text-xs font-bold text-[#1E1E1E]">{"5.0"}</span>
<span className="text-xs text-[#666666]">{"(31 đánh giá)"}</span>
</div>
</div>
<div className="flex flex-1 flex-col p-5 justify-between gap-4">
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between text-xs text-[#fc6c26] font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden">
<span className="truncate">{"Porsche"}</span>
<span className="text-[#666666] normal-case flex items-center gap-1 shrink-0 text-xs font-normal">
<span className="material-symbols-outlined text-[14px]">{"location_on"}</span>{" Tây Hồ, HN\n        "}</span>
</div>
<h3 className="text-[17px] font-bold text-[#1E1E1E] truncate group-hover:text-[#fc6c26] transition-colors leading-snug" title="Porsche Macan GTS">{"\n        Porsche Macan GTS\n      "}</h3>
</div>
<div className="grid grid-cols-2 gap-2 text-xs">
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"airline_seat_recline_normal"}</span>
<span className="truncate font-medium">{"5 Chỗ ngồi"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"settings"}</span>
<span className="truncate font-medium">{"Hộp số PDK 7 cấp"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"local_gas_station"}</span>
<span className="truncate font-medium">{"Xăng 2.9L Twin-Turbo"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"all_inclusive"}</span>
<span className="truncate font-medium">{"Dẫn động AWD"}</span>
</div>
</div>
<div className="mt-auto pt-3 border-t border-[#E9E9E7] flex items-center justify-between gap-3">
<div className="flex flex-col min-w-0">
<div className="flex items-baseline gap-1 whitespace-nowrap">
<span className="text-xs text-[#666666] font-normal">{"Ngày:"}</span>
<span className="text-[17px] font-bold text-[#fc6c26] leading-none">{"3.800.000₫"}</span>
<span className="text-[11px] text-[#666666] font-normal">{"/ngày"}</span>
</div>
<div className="flex items-baseline gap-1 whitespace-nowrap mt-1">
<span className="text-xs text-[#666666] font-normal">{"Giờ:"}</span>
<span className="text-[13px] font-semibold text-[#1E1E1E] leading-none">{"380.000₫"}</span>
<span className="text-[10px] text-[#666666] font-normal">{"/giờ"}</span>
</div>
</div>
<Link className="shrink-0 whitespace-nowrap rounded-xl bg-[#fc6c26] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#e05b1b] transition-all active:scale-95 text-center" href="/xe/vinfast-vf8-plus-2024">{"\n        Xem chi tiết\n      "}</Link>
</div>
</div>
</article>

<article className="group relative flex flex-col h-full rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[#E9E9E7]" data-vehicle-card="suv" data-vehicle-name="Mercedes GLC 300 4MATIC" data-price="68">
<div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
<span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#1E1E1E] uppercase tracking-wider border border-[#E9E9E7] shadow-sm">{"\n      SUV Sang Trọng\n    "}</span>
<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold border border-emerald-200 shadow-sm">
<span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>{"\n      Còn lịch trống\n    "}</span>
</div>
<div className="relative h-52 w-full shrink-0 overflow-hidden bg-[#f6f3f2]">
<img alt="Mercedes GLC 300 4MATIC" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src="/images/cardb-1ec43e930558b9f7.webp" data-car-image="true" loading="lazy" decoding="async" />
<div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
<div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 backdrop-blur-sm border border-[#E9E9E7] shadow-sm">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px]" style={{"fontVariationSettings": "'FILL' 1"} as CSSProperties}>{"star"}</span>
<span className="text-xs font-bold text-[#1E1E1E]">{"5.0"}</span>
<span className="text-xs text-[#666666]">{"(68 đánh giá)"}</span>
</div>
</div>
<div className="flex flex-1 flex-col p-5 justify-between gap-4">
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between text-xs text-[#fc6c26] font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden">
<span className="truncate">{"Mercedes-Benz"}</span>
<span className="text-[#666666] normal-case flex items-center gap-1 shrink-0 text-xs font-normal">
<span className="material-symbols-outlined text-[14px]">{"location_on"}</span>{" Hoàn Kiếm, HN\n        "}</span>
</div>
<h3 className="text-[17px] font-bold text-[#1E1E1E] truncate group-hover:text-[#fc6c26] transition-colors leading-snug" title="Mercedes GLC 300 4MATIC">{"\n        Mercedes GLC 300 4MATIC\n      "}</h3>
</div>
<div className="grid grid-cols-2 gap-2 text-xs">
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"airline_seat_recline_normal"}</span>
<span className="truncate font-medium">{"5 Chỗ ngồi"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"settings"}</span>
<span className="truncate font-medium">{"Tự động 9G-TRONIC"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"local_gas_station"}</span>
<span className="truncate font-medium">{"Xăng Mild-Hybrid"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"all_inclusive"}</span>
<span className="truncate font-medium">{"Dẫn động 4MATIC"}</span>
</div>
</div>
<div className="mt-auto pt-3 border-t border-[#E9E9E7] flex items-center justify-between gap-3">
<div className="flex flex-col min-w-0">
<div className="flex items-baseline gap-1 whitespace-nowrap">
<span className="text-xs text-[#666666] font-normal">{"Ngày:"}</span>
<span className="text-[17px] font-bold text-[#fc6c26] leading-none">{"2.450.000₫"}</span>
<span className="text-[11px] text-[#666666] font-normal">{"/ngày"}</span>
</div>
<div className="flex items-baseline gap-1 whitespace-nowrap mt-1">
<span className="text-xs text-[#666666] font-normal">{"Giờ:"}</span>
<span className="text-[13px] font-semibold text-[#1E1E1E] leading-none">{"245.000₫"}</span>
<span className="text-[10px] text-[#666666] font-normal">{"/giờ"}</span>
</div>
</div>
<Link className="shrink-0 whitespace-nowrap rounded-xl bg-[#fc6c26] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#e05b1b] transition-all active:scale-95 text-center" href="/xe/vinfast-vf8-plus-2024">{"\n        Xem chi tiết\n      "}</Link>
</div>
</div>
</article>

<article className="group relative flex flex-col h-full rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[#E9E9E7]" data-vehicle-card="ev" data-vehicle-name="VinFast VF 8 Plus" data-price="42">
<div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
<span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#1E1E1E] uppercase tracking-wider border border-[#E9E9E7] shadow-sm">{"\n      Xe Điện Thông Minh\n    "}</span>
<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold border border-emerald-200 shadow-sm">
<span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>{"\n      Còn lịch trống\n    "}</span>
</div>
<div className="relative h-52 w-full shrink-0 overflow-hidden bg-[#f6f3f2]">
<img alt="VinFast VF 8 Plus" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src="/images/cardb-e5cfa07014e754d6.webp" data-car-image="true" loading="lazy" decoding="async" />
<div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
<div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 backdrop-blur-sm border border-[#E9E9E7] shadow-sm">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px]" style={{"fontVariationSettings": "'FILL' 1"} as CSSProperties}>{"star"}</span>
<span className="text-xs font-bold text-[#1E1E1E]">{"4.9"}</span>
<span className="text-xs text-[#666666]">{"(42 đánh giá)"}</span>
</div>
</div>
<div className="flex flex-1 flex-col p-5 justify-between gap-4">
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between text-xs text-[#fc6c26] font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden">
<span className="truncate">{"VinFast EV"}</span>
<span className="text-[#666666] normal-case flex items-center gap-1 shrink-0 text-xs font-normal">
<span className="material-symbols-outlined text-[14px]">{"location_on"}</span>{" Đống Đa, HN\n        "}</span>
</div>
<h3 className="text-[17px] font-bold text-[#1E1E1E] truncate group-hover:text-[#fc6c26] transition-colors leading-snug" title="VinFast VF 8 Plus">{"\n        VinFast VF 8 Plus\n      "}</h3>
</div>
<div className="grid grid-cols-2 gap-2 text-xs">
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"airline_seat_recline_normal"}</span>
<span className="truncate font-medium">{"5 Chỗ ngồi"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"settings"}</span>
<span className="truncate font-medium">{"Số tự động (AT)"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"electric_bolt"}</span>
<span className="truncate font-medium">{"Thuần điện 402 HP"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"all_inclusive"}</span>
<span className="truncate font-medium">{"Dẫn động AWD"}</span>
</div>
</div>
<div className="mt-auto pt-3 border-t border-[#E9E9E7] flex items-center justify-between gap-3">
<div className="flex flex-col min-w-0">
<div className="flex items-baseline gap-1 whitespace-nowrap">
<span className="text-xs text-[#666666] font-normal">{"Ngày:"}</span>
<span className="text-[17px] font-bold text-[#fc6c26] leading-none">{"1.250.000₫"}</span>
<span className="text-[11px] text-[#666666] font-normal">{"/ngày"}</span>
</div>
<div className="flex items-baseline gap-1 whitespace-nowrap mt-1">
<span className="text-xs text-[#666666] font-normal">{"Giờ:"}</span>
<span className="text-[13px] font-semibold text-[#1E1E1E] leading-none">{"125.000₫"}</span>
<span className="text-[10px] text-[#666666] font-normal">{"/giờ"}</span>
</div>
</div>
<Link className="shrink-0 whitespace-nowrap rounded-xl bg-[#fc6c26] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#e05b1b] transition-all active:scale-95 text-center" href="/xe/vinfast-vf8-plus-2024">{"\n        Xem chi tiết\n      "}</Link>
</div>
</div>
</article>

<article className="group relative flex flex-col h-full rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[#E9E9E7]" data-vehicle-card="suv" data-vehicle-name="Audi Q8 55 TFSI" data-price="3100000">
<div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
<span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#1E1E1E] uppercase tracking-wider border border-[#E9E9E7] shadow-sm">{"\n      Crossover Thượng Hạng\n    "}</span>
<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold border border-emerald-200 shadow-sm">
<span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>{"\n      Còn lịch trống\n    "}</span>
</div>
<div className="relative h-52 w-full shrink-0 overflow-hidden bg-[#f6f3f2]">
<img alt="Audi Q8 Quattro" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src="/images/cardb-2a59ad741f503d9c.webp" data-car-image="true" loading="lazy" decoding="async" />
<div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
<div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 backdrop-blur-sm border border-[#E9E9E7] shadow-sm">
<span className="material-symbols-outlined text-[#8d7166] text-[15px]">{"grade"}</span>
<span className="text-xs text-[#666666] font-medium">{"Chưa có đánh giá"}</span>
</div>
</div>
<div className="flex flex-1 flex-col p-5 justify-between gap-4">
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between text-xs text-[#fc6c26] font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden">
<span className="truncate">{"Audi Ingolstadt"}</span>
<span className="text-[#666666] normal-case flex items-center gap-1 shrink-0 text-xs font-normal">
<span className="material-symbols-outlined text-[14px]">{"location_on"}</span>{" Nam Từ Liêm, HN\n        "}</span>
</div>
<h3 className="text-[17px] font-bold text-[#1E1E1E] truncate group-hover:text-[#fc6c26] transition-colors leading-snug" title="Audi Q8 55 TFSI">{"\n        Audi Q8 55 TFSI\n      "}</h3>
</div>
<div className="grid grid-cols-2 gap-2 text-xs">
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"airline_seat_recline_normal"}</span>
<span className="truncate font-medium">{"5 Chỗ ngồi"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"settings"}</span>
<span className="truncate font-medium">{"Tự động Tiptronic"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"local_gas_station"}</span>
<span className="truncate font-medium">{"V6 Turbo 340 HP"}</span>
</div>
<div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] text-[#292929] whitespace-nowrap overflow-hidden text-ellipsis">
<span className="material-symbols-outlined text-[#fc6c26] text-[15px] shrink-0">{"all_inclusive"}</span>
<span className="truncate font-medium">{"Dẫn động Quattro"}</span>
</div>
</div>
<div className="mt-auto pt-3 border-t border-[#E9E9E7] flex items-center justify-between gap-3">
<div className="flex flex-col min-w-0">
<div className="flex items-baseline gap-1 whitespace-nowrap">
<span className="text-xs text-[#666666] font-normal">{"Ngày:"}</span>
<span className="text-[17px] font-bold text-[#fc6c26] leading-none">{"3.100.000₫"}</span>
<span className="text-[11px] text-[#666666] font-normal">{"/ngày"}</span>
</div>
<div className="flex items-baseline gap-1 whitespace-nowrap mt-1">
<span className="text-xs text-[#666666] font-normal">{"Giờ:"}</span>
<span className="text-[13px] font-semibold text-[#1E1E1E] leading-none">{"310.000₫"}</span>
<span className="text-[10px] text-[#666666] font-normal">{"/giờ"}</span>
</div>
</div>
<Link className="shrink-0 whitespace-nowrap rounded-xl bg-[#fc6c26] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#e05b1b] transition-all active:scale-95 text-center" href="/xe/vinfast-vf8-plus-2024">{"\n        Xem chi tiết\n      "}</Link>
</div>
</div>
</article>
</div>

<div className="rounded-2xl bg-white border border-[#E9E9E7] p-5 mt-2 transition-all shadow-sm">
<details className="group cursor-pointer">
<summary className="flex items-center justify-between text-xs font-semibold text-[#594138] hover:text-[#fc6c26] list-none">
<span className="flex items-center gap-2">
<span className="material-symbols-outlined text-[#8d7166] text-[18px]">{"info"}</span>
<span>{"Xem tình huống: Không tìm thấy xe trống lịch trình"}</span>
</span>
<span className="material-symbols-outlined text-[#8d7166] text-[20px] transition-transform group-open:rotate-180">{"expand_more"}</span>
</summary>
<div className="pt-6 pb-3 flex flex-col items-center justify-center text-center max-w-md mx-auto">
<div className="w-16 h-16 rounded-full bg-[#f6f3f2] flex items-center justify-center text-[#8d7166] mb-3 border border-[#E9E9E7]">
<span className="material-symbols-outlined text-[32px] text-[#fc6c26]">{"event_busy"}</span>
</div>
<h4 className="text-base font-bold text-[#1E1E1E]">{"Không tìm thấy xe phù hợp với thời gian đã chọn"}</h4>
<p className="text-xs text-[#666666] mt-1.5 mb-4 leading-relaxed">{"\n        Các xe trong phân khúc đã kín lịch từ 08:00, 26/10/2025 đến 20:00, 28/10/2025 tại Hà Nội. Quý khách vui lòng điều chỉnh khoảng thời gian thuê để xem thêm xe trống.\n      "}</p>
<button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#fc6c26] text-white text-xs font-bold shadow-sm hover:bg-[#e05b1b] transition-all" type="button" aria-label="Thay đổi thời gian tìm kiếm" data-action="edit-search">
<span className="material-symbols-outlined text-[16px]">{"schedule"}</span>{"\n        Thay đổi thời gian tìm kiếm\n      "}</button>
</div>
</details>
</div>

<div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-[#E9E9E7] shadow-sm">
<div className="text-xs text-[#666666]">{"\nHiển thị "}<span className="font-bold text-[#1E1E1E]">{"1 - 6"}</span>{" trên "}<span className="font-bold text-[#1E1E1E]">{"54"}</span>{" xe tại Hà Nội\n"}</div>
<div className="flex items-center gap-1.5">
<button className="flex h-9 px-3 items-center gap-1 rounded-xl bg-[#f6f3f2] text-xs font-semibold text-[#8d7166] opacity-50 cursor-not-allowed border border-[#E9E9E7]" disabled={true} type="button" aria-label="Trước" data-action="page">
<span className="material-symbols-outlined text-[16px]">{"arrow_back"}</span>
<span><span className="hidden sm:inline">{"Trước"}</span></span>
</button>
<button className="h-9 w-9 rounded-xl bg-[#1E1E1E] text-xs font-bold text-white shadow-sm" type="button" aria-label="1" data-action="page">{"\n1\n"}</button>
<button className="h-9 w-9 rounded-xl bg-[#f6f3f2] border border-[#E9E9E7] text-xs font-semibold text-[#1E1E1E] hover:bg-[#eae7e7] transition-colors" type="button" aria-label="2" data-action="page">{"\n2\n"}</button>
<button className="h-9 w-9 rounded-xl bg-[#f6f3f2] border border-[#E9E9E7] text-xs font-semibold text-[#1E1E1E] hover:bg-[#eae7e7] transition-colors" type="button" aria-label="3" data-action="page">{"\n3\n"}</button>
<span className="px-1 text-[#8d7166]">{"..."}</span>
<button className="h-9 w-9 rounded-xl bg-[#f6f3f2] border border-[#E9E9E7] text-xs font-semibold text-[#1E1E1E] hover:bg-[#eae7e7] transition-colors" type="button" aria-label="5" data-action="page">{"\n5\n"}</button>
<button className="flex h-9 px-3 items-center gap-1 rounded-xl bg-[#f6f3f2] border border-[#E9E9E7] text-xs font-semibold text-[#1E1E1E] hover:bg-[#eae7e7] transition-colors" type="button" aria-label="Tiếp" data-action="page">
<span><span className="hidden sm:inline">{"Tiếp"}</span></span>
<span className="material-symbols-outlined text-[16px]">{"arrow_forward"}</span>
</button>
</div>
</div>
</section>
</div>
</div>
</div>
</main>


</div>); }
