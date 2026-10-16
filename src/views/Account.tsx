import Link from "next/link";
import { PaymentActions } from "@/components/payment-actions";

export default function Account() {
  return (
<main className="w-full pt-20 bg-surface"><div className="flex flex-col w-full">

<div className="w-full bg-surface pb-space-2xl">
<div className="max-w-[1240px] mx-auto px-6">

<div className="py-space-md flex flex-col md:flex-row md:items-center md:justify-between gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
<nav className="flex items-center gap-space-xs flex-wrap">
<Link className="hover:text-primary transition-colors flex items-center gap-1" href="/">
<span className="material-symbols-outlined text-[16px]">{"home"}</span>
<span className="">{"Trang chủ"}</span>
</Link>
<span className="material-symbols-outlined text-[14px] text-outline-variant">{"chevron_right"}</span>
<span className="hover:text-primary transition-colors cursor-pointer">{"Tài khoản của tôi"}</span>
<span className="material-symbols-outlined text-[14px] text-outline-variant">{"chevron_right"}</span>
<span className="text-primary font-semibold">{"Thông tin cá nhân & Giấy tờ"}</span>
</nav>
<div className="flex items-center gap-space-sm bg-surface-container-high px-space-md py-1 rounded-full text-on-surface">
<span className="w-2 h-2 rounded-full bg-status-success animate-ping"></span>
<span className="font-label-md text-label-md">{"Định danh eKYC Cấp 2: An toàn tuyệt đối"}</span>
</div>
</div>

<div className="relative bg-surface-container rounded-xl shadow-md p-space-lg md:p-space-xl overflow-hidden mb-space-lg">

<div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-gradient-to-br from-secondary-fixed/30 to-transparent blur-3xl pointer-events-none"></div>
<div className="absolute -left-12 -bottom-12 w-80 h-80 rounded-full bg-primary-fixed/20 blur-2xl pointer-events-none"></div>
<div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">

<div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md">
<div className="relative shrink-0">
<div className="w-24 h-24 rounded-full overflow-hidden shadow-md bg-surface-variant p-0.5">
<img className="w-full h-full object-cover rounded-full" src="/images/6eb3ec27bd3021b3.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
</div>
<button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:bg-primary-container transition-transform hover:scale-105" title="Thay đổi ảnh đại diện" type="button">
<span className="material-symbols-outlined text-[16px]">{"photo_camera"}</span>
</button>
</div>
<div className="flex flex-col gap-1.5">
<div className="flex items-center gap-space-sm flex-wrap">
<h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">{"Nguyễn Văn An"}</h1>
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px] text-tertiary-container" style={{"fontVariationSettings": "'FILL' 1"}}>{"workspace_premium"}</span>
<span className="">{"Kanow Elite (Hạng Vàng)"}</span>
</span>
<span className="font-body-sm text-body-sm text-text-muted px-2 py-0.5 bg-surface-container-low rounded">{"Mã HV: #KNW-89321"}</span>
</div>

<div className="flex items-center gap-space-xs flex-wrap mt-1">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-tint text-primary font-label-md text-label-md shadow-sm">
<span className="material-symbols-outlined text-[15px] text-status-success" style={{"fontVariationSettings": "'FILL' 1"}}>{"verified"}</span>
<span className="">{"Đã xác thực VNeID Cấp 2"}</span>
</span>
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-tint text-primary font-label-md text-label-md shadow-sm">
<span className="material-symbols-outlined text-[15px] text-secondary" style={{"fontVariationSettings": "'FILL' 1"}}>{"badge"}</span>
<span className="">{"GPLX B2 Hợp lệ"}</span>
</span>
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md">
<span className="material-symbols-outlined text-[14px]">{"shield"}</span>
<span className="">{"Bảo hiểm chuyến đi VIP"}</span>
</span>
</div>
</div>
</div>

<div className="flex items-center gap-space-sm self-stretch sm:self-auto justify-end">
<a className="inline-flex items-center justify-center gap-2 px-space-md py-2.5 rounded-full bg-surface-container-low text-primary hover:bg-surface-tint font-label-lg text-label-lg transition-all shadow-sm" href="#hanh-trinh">
<span className="material-symbols-outlined text-[18px]">{"history"}</span>
<span className="">{"Lịch sử cuốc"}</span>
</a>
<Link className="inline-flex items-center justify-center gap-2 px-space-lg py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg transition-all shadow-md hover:shadow-lg" href="/xe/vinfast-vf8-plus-2024">
<span className="material-symbols-outlined text-[18px]">{"electric_car"}</span>
<span className="">{"Đặt xe mới"}</span>
</Link>
</div>
</div>

<div className="grid grid-cols-2 gap-space-md mt-space-lg pt-space-md border-t border-border-subtle md:grid-cols-3 sm:grid-cols-3">

<div className="bg-surface-canvas rounded-lg p-space-md shadow-sm flex items-center gap-space-md">
<div className="w-12 h-12 rounded-full bg-surface-tint text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">{"route"}</span>
</div>
<div className="min-w-0">
<div className="font-body-sm text-body-sm text-text-muted">{"Chuyến hoàn thành"}</div>
<div className="font-headline-sm text-headline-sm text-primary font-bold">{"18 chuyến"}</div>
<div className="font-body-sm text-body-sm text-status-success flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="">{"100% đánh giá 5★"}</span>
</div>
</div>
</div>

<div className="bg-surface-canvas rounded-lg p-space-md shadow-sm flex items-center gap-space-md">
<div className="w-12 h-12 rounded-full bg-secondary-fixed/50 text-secondary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">{"energy_savings_leaf"}</span>
</div>
<div className="min-w-0">
<div className="font-body-sm text-body-sm text-text-muted">{"Dặm Xanh Tích Luỹ"}</div>
<div className="font-headline-sm text-headline-sm text-secondary font-bold">{"2.450 dặm"}</div>
<div className="font-body-sm text-body-sm text-text-muted truncate">{"Quy đổi: "}<span className="text-primary font-semibold">{"245.000₫"}</span></div>
</div>
</div>

<div className="bg-surface-canvas rounded-lg p-space-md shadow-sm flex items-center gap-space-md">
<div className="w-12 h-12 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">{"credit_score"}</span>
</div>
<div className="min-w-0">
<div className="font-body-sm text-body-sm text-text-muted">{"Hạn mức Miễn Cọc"}</div>
<div className="font-headline-sm text-headline-sm text-tertiary-container font-bold">{"30 Triệu"}</div>
<div className="font-body-sm text-body-sm text-status-success">{"Đã mở khóa 100%"}</div>
</div>
</div>

</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">

<aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-space-md">
<div className="bg-surface-container rounded-xl shadow-md p-space-md flex flex-col gap-1"><div className="px-space-sm py-space-xs font-label-md text-label-md text-text-muted uppercase tracking-wider font-semibold">{"\n              Trung tâm quản trị\n            "}</div>

<a className="flex items-center justify-between px-space-md py-3 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm transition-colors" href="#thong-tin-ca-nhan">
<div className="flex items-center gap-space-sm min-w-0">
<span className="material-symbols-outlined text-[20px] w-6 flex items-center justify-center shrink-0">{"person_check"}</span>
<span className="truncate">{"Thông tin cá nhân & eKYC"}</span>
</div>
<span className="material-symbols-outlined text-[18px] ml-auto shrink-0">{"chevron_right"}</span>
</a>

<a className="flex items-center justify-between px-space-md py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-lg text-label-lg transition-colors" href="#hanh-trinh">
<div className="flex items-center gap-space-sm min-w-0">
<span className="material-symbols-outlined text-[20px] w-6 flex items-center justify-center shrink-0">{"calendar_month"}</span>
<span className="truncate">{"Lịch sử đặt xe & Chuyến đi"}</span>
</div>
<span className="px-2 py-0.5 rounded-full bg-surface-tint text-primary font-label-md text-label-md font-bold ml-auto shrink-0">{"3"}</span>
</a>

<Link className="flex items-center justify-between px-space-md py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-lg text-label-lg transition-colors" href="/uu-dai">
<div className="flex items-center gap-space-sm min-w-0">
<span className="material-symbols-outlined text-[20px] w-6 flex items-center justify-center shrink-0">{"loyalty"}</span>
<span className="truncate">{"Ví voucher & Dặm Xanh"}</span>
</div>
<span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md font-bold ml-auto shrink-0">{"4"}</span>
</Link>

<a className="flex items-center justify-between px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-lg text-label-lg transition-colors" href="#phuong-thuc-thanh-toan">
<div className="flex items-start gap-space-sm min-w-0">
<span className="material-symbols-outlined text-[20px] w-6 flex items-center justify-center shrink-0 mt-0.5">{"account_balance_wallet"}</span>
<div className="flex flex-col min-w-0">
<span className="truncate">{"Phương thức thanh toán"}</span>
<span className="font-body-sm text-body-sm text-text-muted font-normal mt-0.5">{"Visa •••• 4219"}</span>
</div>
</div>
<span className="material-symbols-outlined text-[18px] text-text-muted ml-auto shrink-0">{"chevron_right"}</span>
</a>

<Link className="flex items-center justify-between px-space-md py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-lg text-label-lg transition-colors" href="/quen-mat-khau">
<div className="flex items-center gap-space-sm min-w-0">
<span className="material-symbols-outlined text-[20px] w-6 flex items-center justify-center shrink-0">{"security"}</span>
<span className="truncate">{"Bảo mật & Đổi mật khẩu"}</span>
</div>
<span className="material-symbols-outlined text-[18px] text-status-success ml-auto shrink-0">{"lock_open_right"}</span>
</Link>

<Link className="flex items-center justify-between px-space-md py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-lg text-label-lg transition-colors" href="/lien-he">
<div className="flex items-center gap-space-sm min-w-0">
<span className="material-symbols-outlined text-[20px] w-6 flex items-center justify-center shrink-0">{"support_agent"}</span>
<span className="truncate">{"Trợ giúp & Khiếu nại 24/7"}</span>
</div>
<span className="material-symbols-outlined text-[18px] text-text-muted ml-auto shrink-0">{"launch"}</span>
</Link>
<div className="my-space-xs border-t border-border-subtle"></div>

<button className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-error hover:bg-error-container/30 font-label-md text-label-md transition-colors w-full text-left" type="button" data-action="logout">
<span className="material-symbols-outlined text-[18px] w-6 flex items-center justify-center shrink-0">{"logout"}</span>
<span className="truncate">{"Đăng xuất tài khoản"}</span>
</button></div>

<div className="bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl p-space-md shadow-md relative overflow-hidden">
<div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
<div className="flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-secondary-fixed">{"headset_mic"}</span>
</div>
<div className="flex flex-col gap-1">
<span className="font-label-lg text-label-lg font-bold text-white">{"Chuyên viên VIP Kanow"}</span>
<p className="font-body-sm text-body-sm text-on-primary-container leading-relaxed">{"\n                  Đặc quyền hội viên Vàng: Có chuyên viên hỗ trợ kiểm tra xe và xử lý bảo hiểm nhanh chóng 24/7.\n                "}</p>
<a className="inline-flex items-center gap-1.5 mt-2 text-secondary-fixed hover:text-white font-label-md text-label-md font-bold" href="tel:19008888">
<span className="">{"1900 8888 (Nhánh 1)"}</span>
<span className="material-symbols-outlined text-[16px]">{"call"}</span>
</a>
</div>
</div>
</div>

<div className="bg-surface-container rounded-xl shadow-md p-space-md flex flex-col gap-space-sm"><div className="px-space-sm py-space-xs font-label-md text-label-md text-text-muted uppercase tracking-wider font-semibold">{"\n              Trung tâm quản trị\n            "}</div>

<a className="flex items-center justify-between px-space-md py-3 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm transition-colors" href="#thong-tin-ca-nhan">
<div className="flex items-center gap-space-sm min-w-0">
<span className="material-symbols-outlined text-[20px] w-6 flex items-center justify-center shrink-0">{"person_check"}</span>
<span className="truncate">{"Thông tin cá nhân & eKYC"}</span>
</div>
<span className="material-symbols-outlined text-[18px] ml-auto shrink-0">{"chevron_right"}</span>
</a>

<a className="flex items-center justify-between px-space-md py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-lg text-label-lg transition-colors" href="#hanh-trinh">
<div className="flex items-center gap-space-sm min-w-0">
<span className="material-symbols-outlined text-[20px] w-6 flex items-center justify-center shrink-0">{"calendar_month"}</span>
<span className="truncate">{"Lịch sử đặt xe & Chuyến đi"}</span>
</div>
<span className="px-2 py-0.5 rounded-full bg-surface-tint text-primary font-label-md text-label-md font-bold ml-auto shrink-0">{"3"}</span>
</a>

<Link className="flex items-center justify-between px-space-md py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-lg text-label-lg transition-colors" href="/uu-dai">
<div className="flex items-center gap-space-sm min-w-0">
<span className="material-symbols-outlined text-[20px] w-6 flex items-center justify-center shrink-0">{"loyalty"}</span>
<span className="truncate">{"Ví voucher & Dặm Xanh"}</span>
</div>
<span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md font-bold ml-auto shrink-0">{"4"}</span>
</Link>

<a className="flex items-center justify-between px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-lg text-label-lg transition-colors" href="#phuong-thuc-thanh-toan">
<div className="flex items-start gap-space-sm min-w-0">
<span className="material-symbols-outlined text-[20px] w-6 flex items-center justify-center shrink-0 mt-0.5">{"account_balance_wallet"}</span>
<div className="flex flex-col min-w-0">
<span className="truncate">{"Phương thức thanh toán"}</span>
<span className="font-body-sm text-body-sm text-text-muted font-normal mt-0.5">{"Visa •••• 4219"}</span>
</div>
</div>
<span className="material-symbols-outlined text-[18px] text-text-muted ml-auto shrink-0">{"chevron_right"}</span>
</a>

<Link className="flex items-center justify-between px-space-md py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-lg text-label-lg transition-colors" href="/quen-mat-khau">
<div className="flex items-center gap-space-sm min-w-0">
<span className="material-symbols-outlined text-[20px] w-6 flex items-center justify-center shrink-0">{"security"}</span>
<span className="truncate">{"Bảo mật & Đổi mật khẩu"}</span>
</div>
<span className="material-symbols-outlined text-[18px] text-status-success ml-auto shrink-0">{"lock_open_right"}</span>
</Link>

<Link className="flex items-center justify-between px-space-md py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-lg text-label-lg transition-colors" href="/lien-he">
<div className="flex items-center gap-space-sm min-w-0">
<span className="material-symbols-outlined text-[20px] w-6 flex items-center justify-center shrink-0">{"support_agent"}</span>
<span className="truncate">{"Trợ giúp & Khiếu nại 24/7"}</span>
</div>
<span className="material-symbols-outlined text-[18px] text-text-muted ml-auto shrink-0">{"launch"}</span>
</Link>
<div className="my-space-xs border-t border-border-subtle"></div>

<button className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-error hover:bg-error-container/30 font-label-md text-label-md transition-colors w-full text-left" type="button" data-action="logout">
<span className="material-symbols-outlined text-[18px] w-6 flex items-center justify-center shrink-0">{"logout"}</span>
<span className="truncate">{"Đăng xuất tài khoản"}</span>
</button></div>
</aside>

<div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-space-lg">

<div className="bg-surface-container rounded-xl shadow-md p-space-lg relative overflow-hidden">
<div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-sm border-b border-border-subtle gap-2">
<div className="flex items-center gap-space-xs">
<span className="w-3 h-3 rounded-full bg-status-success animate-pulse"></span>
<span className="font-label-lg text-label-lg font-bold text-on-surface uppercase tracking-wide">{"Chuyến xe sắp diễn ra"}</span>
<span className="px-2 py-0.5 rounded-full bg-surface-tint text-primary font-label-md text-label-md font-semibold">{"#KNW-8932VF"}</span>
</div>
<span className="inline-flex items-center gap-1 font-label-md text-label-md text-status-success bg-status-success/10 px-3 py-1 rounded-full">
<span className="material-symbols-outlined text-[16px]">{"check_circle"}</span>
<span className="">{"Đã đặt cọc 30% • Xe đã sẵn sàng"}</span>
</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-12 gap-space-md pt-space-md items-center">

<div className="md:col-span-5 relative rounded-lg overflow-hidden bg-surface-container-low p-2 flex items-center justify-center">
<img className="w-full h-44 object-contain rounded" src="/images/b52c346ad4f8edeb.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<span className="absolute bottom-2 left-2 bg-on-surface/80 backdrop-blur-md text-white font-label-md text-label-md px-2 py-0.5 rounded">{"\n                  Biển số: 51K-988.22\n                "}</span>
</div>

<div className="md:col-span-7 flex flex-col gap-space-xs" id="hanh-trinh">
<div className="flex items-center justify-between">
<h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"VinFast VF 8 Plus (SUV Điện 5 Chỗ)"}</h2>
<span className="font-price-display text-price-display text-primary">{"1.450.000₫"}<span className="font-body-sm text-body-sm text-text-muted font-normal">{"/ngày"}</span></span>
</div>
<div className="grid grid-cols-2 gap-space-sm mt-1 bg-surface-canvas p-space-sm rounded-lg">
<div className="flex flex-col">
<span className="font-body-sm text-body-sm text-text-muted flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-primary">{"login"}</span>{"\n                      Nhận xe\n                    "}</span>
<span className="font-label-lg text-label-lg text-on-surface font-semibold">{"08:00 • 28/03/2025"}</span>
<span className="font-body-sm text-body-sm text-text-muted truncate">{"Cột 12 - Ga Quốc tế Tân Sơn Nhất"}</span>
</div>
<div className="flex flex-col">
<span className="font-body-sm text-body-sm text-text-muted flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-secondary">{"logout"}</span>{"\n                      Trả xe\n                    "}</span>
<span className="font-label-lg text-label-lg text-on-surface font-semibold">{"20:00 • 30/03/2025"}</span>
<span className="font-body-sm text-body-sm text-text-muted truncate">{"Cột 12 - Ga Quốc tế Tân Sơn Nhất"}</span>
</div>
</div>
<div className="flex items-center justify-between flex-wrap gap-2 pt-2">
<div className="flex items-center gap-2">
<span className="inline-flex items-center gap-1 text-text-muted font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-status-success">{"verified_user"}</span>{"\n                      Bảo hiểm vật chất 2 chiều\n                    "}</span>
<span className="text-text-muted">{"•"}</span>
<span className="inline-flex items-center gap-1 text-text-muted font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-secondary">{"ev_station"}</span>{"\n                      Pin 98%\n                    "}</span>
</div>
<div className="flex items-center gap-space-xs">
<button className="px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-tint text-primary font-label-md text-label-md transition-colors flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[16px]">{"call"}</span>
<span className="">{"Bác tài giao xe"}</span>
</button>
<button className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-colors shadow-sm" type="button" data-action="detail">{"\n                      Chi tiết hành trình\n                    "}</button>
</div>
<PaymentActions account /></div>
</div>
</div>
</div>

<div className="bg-surface-container rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-sm border-b border-border-subtle" id="thong-tin-ca-nhan">
<div>
<h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Thông tin tài khoản cơ bản"}</h2>
<p className="font-body-sm text-body-sm text-text-muted">{"Dữ liệu được mã hóa để đối soát hợp đồng thuê xe điện tử theo Luật Giao thông."}</p>
</div>
<button className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-tint text-primary hover:bg-primary-fixed-dim/40 font-label-md text-label-md font-semibold transition-all" id="btnToggleEdit" type="button" data-action="edit">
<span className="material-symbols-outlined text-[16px]">{"edit"}</span>
<span className="">{"Chỉnh sửa"}</span>
</button>
</div>

<form className="grid grid-cols-1 md:grid-cols-2 gap-space-md" id="profileForm">

<div className="flex flex-col gap-1">
<label className="font-label-md text-label-md text-on-surface-variant font-semibold">{"Họ và tên (Theo CCCD)"}</label>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-3 text-text-muted text-[18px]">{"person"}</span>
<input className="w-full bg-surface-canvas text-on-surface pl-10 pr-4 py-2.5 rounded-lg font-body-md text-body-md shadow-inner outline-none focus:ring-2 focus:ring-secondary/40 transition-all" type="text" defaultValue="Nguyễn Văn An" aria-label="Thông tin" />
</div>
</div>

<div className="flex flex-col gap-1">
<div className="flex items-center justify-between">
<label className="font-label-md text-label-md text-on-surface-variant font-semibold">{"Số điện thoại chính"}</label>
<span className="font-body-sm text-body-sm text-status-success flex items-center gap-1 font-medium">
<span className="material-symbols-outlined text-[14px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"check_circle"}</span>{"\n                    Đã xác thực OTP\n                  "}</span>
</div>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-3 text-text-muted text-[18px]">{"phone"}</span>
<input className="w-full bg-surface-canvas text-on-surface pl-10 pr-4 py-2.5 rounded-lg font-body-md text-body-md shadow-inner outline-none focus:ring-2 focus:ring-secondary/40 transition-all" type="text" defaultValue="0912 345 678" aria-label="Thông tin" />
</div>
</div>

<div className="flex flex-col gap-1">
<div className="flex items-center justify-between">
<label className="font-label-md text-label-md text-on-surface-variant font-semibold">{"Địa chỉ Email liên hệ"}</label>
<span className="font-body-sm text-body-sm text-status-success flex items-center gap-1 font-medium">
<span className="material-symbols-outlined text-[14px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"check_circle"}</span>{"\n                    Đã nhận hóa đơn VAT\n                  "}</span>
</div>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-3 text-text-muted text-[18px]">{"mail"}</span>
<input className="w-full bg-surface-canvas text-on-surface pl-10 pr-4 py-2.5 rounded-lg font-body-md text-body-md shadow-inner outline-none focus:ring-2 focus:ring-secondary/40 transition-all" type="email" defaultValue="an.nguyen@company.com" aria-label="Thông tin" />
</div>
</div>

<div className="flex flex-col gap-1">
<label className="font-label-md text-label-md text-on-surface-variant font-semibold">{"Ngày sinh"}</label>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-3 text-text-muted text-[18px]">{"calendar_today"}</span>
<input className="w-full bg-surface-canvas text-on-surface pl-10 pr-4 py-2.5 rounded-lg font-body-md text-body-md shadow-inner outline-none focus:ring-2 focus:ring-secondary/40 transition-all" type="text" defaultValue="15/08/1990" aria-label="Thông tin" />
</div>
</div>

<div className="md:col-span-2 flex flex-col gap-1">
<label className="font-label-md text-label-md text-on-surface-variant font-semibold">{"Địa chỉ thường trú / Nhận bàn giao xe tận nơi"}</label>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-3 text-text-muted text-[18px]">{"home_pin"}</span>
<input className="w-full bg-surface-canvas text-on-surface pl-10 pr-4 py-2.5 rounded-lg font-body-md text-body-md shadow-inner outline-none focus:ring-2 focus:ring-secondary/40 transition-all" type="text" defaultValue="Số 45 Đường số 7, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh" aria-label="Thông tin" />
</div>
</div>

<div className="md:col-span-2 flex items-center justify-end gap-space-sm pt-space-xs">
<button className="px-space-md py-2 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" type="button" data-action="reset">{"\n                  Hủy thao tác\n                "}</button>
<button className="px-space-lg py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all shadow-md flex items-center gap-2" type="submit">
<span className="material-symbols-outlined text-[16px]">{"save"}</span>
<span className="">{"Lưu thay đổi"}</span>
</button>
</div>
</form>
</div>

<div className="bg-surface-container rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-sm border-b border-border-subtle gap-2">
<div>
<div className="flex items-center gap-2">
<h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Hồ sơ pháp lý & Giấy phép lái xe (eKYC)"}</h2>
<span className="px-2.5 py-0.5 rounded-full bg-status-success/15 text-status-success font-label-md text-label-md font-bold">{"\n                    Chuẩn Cục CSGT\n                  "}</span>
</div>
<p className="font-body-sm text-body-sm text-text-muted">{"Được đối soát tự động qua định danh VNeID Cấp 2. Không cần giữ lại giấy tờ gốc khi nhận xe."}</p>
</div>
<button className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-secondary text-on-secondary hover:bg-on-secondary-container font-label-md text-label-md font-semibold transition-all shadow-sm" type="button">
<span className="material-symbols-outlined text-[16px]">{"upload_file"}</span>
<span className="">{"Cập nhật bản quét mới"}</span>
</button>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">

<div className="bg-surface-canvas rounded-lg p-space-md shadow-sm flex flex-col justify-between gap-space-md border border-border-subtle relative overflow-hidden">
<div className="flex items-start justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-tint text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[22px]">{"fingerprint"}</span>
</div>
<div>
<h3 className="font-label-lg text-label-lg text-on-surface font-bold">{"Căn cước công dân gắn Chip"}</h3>
<div className="font-body-sm text-body-sm text-text-muted">{"Số: "}<span className="text-on-surface font-mono font-semibold">{"079090••••88"}</span></div>
</div>
</div>
<span className="material-symbols-outlined text-status-success text-[20px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"verified"}</span>
</div>

<div className="relative h-28 w-full rounded-md bg-surface-container-high/80 overflow-hidden flex items-center p-3 gap-3">
<div className="w-16 h-20 bg-surface-container rounded shrink-0 flex items-center justify-center shadow-inner">
<span className="material-symbols-outlined text-outline-variant text-[32px]">{"account_circle"}</span>
</div>
<div className="flex flex-col gap-1.5 flex-1 min-w-0">
<div className="h-2.5 bg-outline-variant/30 rounded w-3/4"></div>
<div className="h-2 bg-outline-variant/20 rounded w-1/2"></div>
<div className="h-2 bg-outline-variant/20 rounded w-5/6"></div>
<div className="flex items-center gap-2 mt-1">
<span className="text-[10px] font-label-md text-primary font-semibold bg-surface-tint px-2 py-0.5 rounded">{"VNeID Level 2 MATCH"}</span>
</div>
</div>
<div className="absolute inset-0 backdrop-blur-[2px] bg-primary/5 flex items-center justify-center">
<span className="px-3 py-1 bg-surface-container/90 text-primary rounded-full font-label-md text-label-md shadow-sm font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">{"lock"}</span>{"\n                      Bảo mật thông tin\n                    "}</span>
</div>
</div>
<div className="flex items-center justify-between font-body-sm text-body-sm pt-2 border-t border-border-subtle">
<span className="text-text-muted">{"Thời hạn sử dụng:"}</span>
<span className="text-on-surface font-semibold">{"15/08/2035 (Còn 10 năm)"}</span>
</div>
</div>

<div className="bg-surface-canvas rounded-lg p-space-md shadow-sm flex flex-col justify-between gap-space-md border border-border-subtle relative overflow-hidden">
<div className="flex items-start justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-tint text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[22px]">{"directions_car"}</span>
</div>
<div>
<h3 className="font-label-lg text-label-lg text-on-surface font-bold">{"Giấy phép lái xe (GPLX)"}</h3>
<div className="font-body-sm text-body-sm text-text-muted">{"Hạng B2 • Số: "}<span className="text-on-surface font-mono font-semibold">{"790123••••91"}</span></div>
</div>
</div>
<span className="material-symbols-outlined text-status-success text-[20px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"verified"}</span>
</div>

<div className="relative h-28 w-full rounded-md bg-surface-container-high/80 overflow-hidden flex items-center p-3 gap-3">
<div className="w-16 h-20 bg-surface-container rounded shrink-0 flex items-center justify-center shadow-inner">
<span className="material-symbols-outlined text-outline-variant text-[32px]">{"directions_car"}</span>
</div>
<div className="flex flex-col gap-1.5 flex-1 min-w-0">
<div className="h-2.5 bg-outline-variant/30 rounded w-2/3"></div>
<div className="h-2 bg-outline-variant/20 rounded w-4/5"></div>
<div className="h-2 bg-outline-variant/20 rounded w-1/2"></div>
<div className="flex items-center gap-2 mt-1">
<span className="text-[10px] font-label-md text-status-success font-semibold bg-status-success/10 px-2 py-0.5 rounded">{"Đối soát CSGT: HỢP LỆ"}</span>
</div>
</div>
<div className="absolute inset-0 backdrop-blur-[2px] bg-primary/5 flex items-center justify-center">
<span className="px-3 py-1 bg-surface-container/90 text-primary rounded-full font-label-md text-label-md shadow-sm font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">{"visibility"}</span>{"\n                      Bấm để xem lại ảnh quét\n                    "}</span>
</div>
</div>
<div className="flex items-center justify-between font-body-sm text-body-sm pt-2 border-t border-border-subtle">
<span className="text-text-muted">{"Hiệu lực đến:"}</span>
<span className="text-on-surface font-semibold">{"24/12/2028 (Hạng B2 không thời hạn phạt)"}</span>
</div>
</div>
</div>
</div>

<div className="bg-surface-container rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-sm border-b border-border-subtle">
<div>
<h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Ưu đãi & Mã giảm giá dành riêng cho An"}</h2>
<p className="font-body-sm text-body-sm text-text-muted">{"Tự động áp dụng ở bước thanh toán đặt cọc hoặc khấu trừ trực tiếp."}</p>
</div>
<Link className="font-label-md text-label-md text-primary hover:underline font-bold flex items-center gap-1" href="/uu-dai">
<span className="">{"Xem tất cả 4 voucher"}</span>
<span className="material-symbols-outlined text-[16px]">{"arrow_forward"}</span>
</Link>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">

<div className="relative bg-gradient-to-r from-surface-tint to-surface-canvas rounded-lg p-space-md shadow-sm flex items-center justify-between gap-space-sm overflow-hidden">
<div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-secondary/10 pointer-events-none"></div>
<div className="flex items-start gap-space-sm">
<div className="w-12 h-12 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">{"percent"}</span>
</div>
<div>
<div className="flex items-center gap-2">
<span className="font-label-lg text-label-lg font-bold text-primary font-mono tracking-wider">{"KANOWVIP"}</span>
<span className="text-[10px] bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded font-bold">{"Hạng Vàng"}</span>
</div>
<div className="font-body-md text-body-md font-semibold text-on-surface mt-0.5">{"Giảm 20% đơn thuê (tối đa 300.000₫)"}</div>
<div className="font-body-sm text-body-sm text-text-muted mt-1">{"Áp dụng cho dòng SUV điện VF 8 / VF 9 • HSD: 15/04/2025"}</div>
</div>
</div>
<button className="shrink-0 px-3 py-1.5 rounded-full bg-primary text-on-primary hover:bg-primary-container text-label-md font-label-md font-semibold transition-colors shadow-sm" type="button" data-action="voucher">{"\n                  Sử dụng\n                "}</button>
</div>

<div className="relative bg-gradient-to-r from-surface-tint to-surface-canvas rounded-lg p-space-md shadow-sm flex items-center justify-between gap-space-sm overflow-hidden">
<div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-tertiary/10 pointer-events-none"></div>
<div className="flex items-start gap-space-sm">
<div className="w-12 h-12 rounded-lg bg-secondary text-on-secondary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">{"local_shipping"}</span>
</div>
<div>
<div className="flex items-center gap-2">
<span className="font-label-lg text-label-lg font-bold text-secondary font-mono tracking-wider">{"FREESHIP5KM"}</span>
<span className="text-[10px] bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded font-bold">{"Miễn phí giao"}</span>
</div>
<div className="font-body-md text-body-md font-semibold text-on-surface mt-0.5">{"Miễn phí giao xe tận nhà bán kính 5km"}</div>
<div className="font-body-sm text-body-sm text-text-muted mt-1">{"Áp dụng cho mọi hợp đồng từ 2 ngày • HSD: 30/05/2025"}</div>
</div>
</div>
<button className="shrink-0 px-3 py-1.5 rounded-full bg-secondary text-on-secondary hover:bg-on-secondary-container text-label-md font-label-md font-semibold transition-colors shadow-sm" type="button" data-action="voucher">{"\n                  Sử dụng\n                "}</button>
</div>
</div>
</div>

<div className="bg-surface-container rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-sm border-b border-border-subtle" id="phuong-thuc-thanh-toan">
<div>
<h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Thẻ & Ví thanh toán bảo lãnh"}</h2>
<p className="font-body-sm text-body-sm text-text-muted">{"Quản lý thẻ tín dụng dùng để khấu trừ phí thuê tự động và hoàn trả cọc tức thì."}</p>
</div>
<button className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-tint text-primary hover:bg-primary-fixed font-label-md text-label-md font-semibold transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]">{"add_card"}</span>
<span className="">{"Thêm thẻ mới"}</span>
</button>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">

<div className="p-space-md rounded-lg bg-surface-canvas shadow-sm flex items-center justify-between border border-border-subtle">
<div className="flex items-center gap-space-md">
<div className="w-12 h-8 rounded bg-primary-container text-white flex items-center justify-center font-bold text-[12px] tracking-wider shrink-0 shadow-sm">{"\n                    VISA\n                  "}</div>
<div>
<div className="font-label-lg text-label-lg font-bold text-on-surface">{"Techcombank Visa Signature"}</div>
<div className="font-body-sm text-body-sm text-text-muted font-mono">{"•••• •••• •••• 4219 • Hết hạn 09/27"}</div>
</div>
</div>
<span className="px-2 py-0.5 rounded-full bg-surface-tint text-primary font-label-md text-label-md font-semibold">{"Mặc định"}</span>
</div>

<div className="p-space-md rounded-lg bg-surface-canvas shadow-sm flex items-center justify-between border border-border-subtle">
<div className="flex items-center gap-space-md">
<div className="w-12 h-8 rounded bg-gradient-to-r from-pink-600 to-purple-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm">{"\n                    MoMo\n                  "}</div>
<div>
<div className="font-label-lg text-label-lg font-bold text-on-surface">{"Ví Điện Tử MoMo VIP"}</div>
<div className="font-body-sm text-body-sm text-text-muted font-mono">{"0912••••78 • Tự động thanh toán"}</div>
</div>
</div>
<button className="text-text-muted hover:text-error transition-colors p-1" title="Xóa phương thức" type="button">
<span className="material-symbols-outlined text-[20px]">{"delete"}</span>
</button>
</div>
</div>

<div className="p-space-md rounded-lg bg-surface-container-low flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-primary text-[22px] shrink-0">{"verified"}</span>
<span className=""><strong>{"Cam kết hoàn cọc tự động 100%:"}</strong>{" Toàn bộ tiền giữ chân thế chấp sẽ được hoàn trả tự động về thẻ của bạn trong vòng tối đa 24 giờ sau khi kỹ thuật viên Kanow ký biên bản hoàn trả xe nguyên vẹn."}</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
  );
}
