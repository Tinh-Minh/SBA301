import Link from "next/link";

export default function Offers() {
  return (
<main className="w-full pt-20 bg-surface"><div className="flex flex-col w-full">

<div className="fixed bottom-8 right-8 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-space-sm bg-primary text-on-primary px-space-lg py-space-sm rounded-full shadow-2xl" id="copy-toast">
<span className="material-symbols-outlined text-[20px] text-secondary-container">{"check_circle"}</span>
<span className="font-label-lg text-label-lg" id="toast-text">{"Đã sao chép mã thành công!"}</span>
</div>

<section className="relative w-full pt-space-xl pb-space-2xl overflow-hidden bg-gradient-to-b from-surface-tint via-surface to-surface">

<div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-secondary-fixed opacity-30 blur-3xl pointer-events-none"></div>
<div className="absolute top-1/2 -right-32 w-[480px] h-[480px] rounded-full bg-tertiary-fixed opacity-30 blur-3xl pointer-events-none"></div>
<div className="max-w-[1240px] mx-auto px-margin relative z-10">

<div className="flex items-center gap-space-xs text-text-muted mb-space-md font-body-sm text-body-sm">
<Link className="hover:text-primary transition-colors flex items-center gap-1" href="/lien-he">
<span className="material-symbols-outlined text-[16px]">{"home"}</span>{"\n          Trang chủ\n        "}</Link>
<span className="material-symbols-outlined text-[14px]">{"chevron_right"}</span>
<span className="text-primary font-medium">{"Kho ưu đãi độc quyền"}</span>
</div>

<div className="w-full bg-surface-container rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative">

<div className="absolute top-6 left-6 z-20 flex items-center gap-space-xs bg-tertiary-container text-on-tertiary px-space-md py-1.5 rounded-full shadow-md">
<span className="material-symbols-outlined text-[18px] text-tertiary-fixed">{"local_fire_department"}</span>
<span className="font-label-md text-label-md tracking-wider uppercase font-bold text-tertiary-fixed">{"Ưu Đãi Độc Quyền Tháng Này"}</span>
</div>

<div className="lg:col-span-7 p-space-xl lg:p-space-2xl flex flex-col justify-between pt-16">
<div className="flex flex-col gap-space-md">
<div className="flex items-center gap-space-xs text-secondary font-label-md text-label-md font-semibold tracking-wide uppercase">
<span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>{"\n              Chào mừng bạn mới đến với Kanow Mobility\n            "}</div>
<h1 className="font-display-hero text-display-hero text-on-surface font-bold tracking-tight">{"\n              Mở Màn Hành Trình, "}<span className="text-primary">{"Giảm Ngay 15%"}</span>
</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">{"\n              Tận hưởng cung đường tự do với mức tiết kiệm tối đa lên đến "}<strong className="text-on-surface font-semibold">{"300.000₫"}</strong>{" cho đơn đặt xe đầu tiên. Xe đời mới 2023 - 2025, giao tận nơi, thủ tục CCCD gắn chip siêu tốc.\n            "}</p>
</div>

<div className="mt-space-xl p-space-md lg:p-space-lg rounded-2xl bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md w-full sm:w-auto">
<div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-md">
<span className="material-symbols-outlined text-on-primary text-[28px]">{"confirmation_number"}</span>
</div>
<div>
<span className="font-label-md text-label-md text-text-muted uppercase tracking-wider block">{"Mã giảm giá trực tiếp"}</span>
<span className="font-price-display text-price-display text-primary tracking-widest font-black" id="spotlight-code">{"KANOWNEW"}</span>
</div>
</div>
<div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
<button className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-full bg-tertiary-container hover:bg-tertiary text-on-tertiary font-label-lg text-label-lg transition-all shadow-md active:scale-95" type="button" data-handler="copyCode" data-args="'KANOWNEW'">
<span className="material-symbols-outlined text-[18px]">{"content_copy"}</span>
<span>{"Sao chép mã"}</span>
</button>
<Link className="cursor-pointer hidden sm:flex items-center justify-center w-11 h-11 rounded-full bg-surface-container hover:bg-surface-tint text-primary transition-colors" href="/lien-he">
<span className="material-symbols-outlined text-[20px]">{"arrow_forward"}</span>
</Link>
</div>
</div>

<div className="flex flex-wrap items-center gap-y-2 gap-x-space-lg mt-space-md pt-space-sm text-text-muted font-body-sm text-body-sm">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-status-success">{"verified"}</span>
<span>{"Áp dụng tất cả dòng xe 4 - 7 chỗ"}</span>
</div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-primary">{"schedule"}</span>
<span>{"Hết hạn: 31/12/2025"}</span>
</div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-tertiary-container">{"inventory_2"}</span>
<span>{"Còn lại: "}<strong className="text-on-surface">{"148 lượt"}</strong></span>
</div>
</div>
</div>

<div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full flex items-center justify-center bg-gradient-to-tr from-surface-tint to-surface-container-high overflow-hidden">
<div className="absolute inset-0 bg-cover bg-center opacity-90 transition-transform duration-700 hover:scale-105" data-alt="A sleek modern white electric SUV driving gracefully through a coastal highway during sun-drenched golden hour, sharp sunlight reflection, soft ocean teal waters in background, photorealistic 8k commercial photography style." style={{"backgroundImage": "url('/images/52582d1e57bac2d3.webp')"}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden"></div>

<div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:bottom-6 bg-surface-container/95 backdrop-blur-md p-space-md rounded-2xl shadow-xl flex items-center justify-between gap-space-md max-w-sm">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-fixed">
<span className="material-symbols-outlined text-[20px]">{"electric_car"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface">{"VinFast & Hybrid"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Đầy pin, sẵn sàng lăn bánh"}</div>
</div>
</div>
<div className="text-right">
<div className="font-label-md text-label-md text-status-success font-bold">{"100% Sạch"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Kiểm định 30 bước"}</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-space-xl bg-surface">
<div className="max-w-[1240px] mx-auto px-margin flex flex-col gap-space-xl">

<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
<div>
<span className="font-label-md text-label-md text-secondary font-bold tracking-widest uppercase block mb-1">{"Bộ Sưu Tập Khuyến Mãi"}</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">{"Voucher Ưu Đãi Đang Kích Hoạt"}</h2>
</div>

<div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 no-scrollbar" id="coupon-tabs">
<button className="tab-btn active cursor-pointer px-space-md py-2.5 rounded-full font-label-md text-label-md transition-all whitespace-nowrap bg-primary text-on-primary shadow-sm" type="button" data-handler="filterCoupons" data-args="'all', this">{"\n            Tất cả ưu đãi (6)\n          "}</button>
<button className="tab-btn cursor-pointer px-space-md py-2.5 rounded-full font-label-md text-label-md transition-all whitespace-nowrap bg-surface-container text-on-surface-variant hover:text-on-surface shadow-sm" type="button" data-handler="filterCoupons" data-args="'newbie', this">{"\n            Khách hàng mới\n          "}</button>
<button className="tab-btn cursor-pointer px-space-md py-2.5 rounded-full font-label-md text-label-md transition-all whitespace-nowrap bg-surface-container text-on-surface-variant hover:text-on-surface shadow-sm" type="button" data-handler="filterCoupons" data-args="'weekend', this">{"\n            Thuê xe cuối tuần & Lễ\n          "}</button>
<button className="tab-btn cursor-pointer px-space-md py-2.5 rounded-full font-label-md text-label-md transition-all whitespace-nowrap bg-surface-container text-on-surface-variant hover:text-on-surface shadow-sm" type="button" data-handler="filterCoupons" data-args="'corporate', this">{"\n            Đồng hành doanh nghiệp\n          "}</button>
<button className="tab-btn cursor-pointer px-space-md py-2.5 rounded-full font-label-md text-label-md transition-all whitespace-nowrap bg-surface-container text-on-surface-variant hover:text-on-surface shadow-sm" type="button" data-handler="filterCoupons" data-args="'ev', this">{"\n            Xe điện xanh VinFast\n          "}</button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-gutter" id="voucher-grid">

<div className="voucher-card flex flex-col sm:flex-row bg-surface-container rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative" data-category="all newbie corporate">

<div className="sm:w-48 bg-gradient-to-br from-primary to-primary-container p-space-lg flex flex-col justify-between text-on-primary relative overflow-hidden">
<div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-on-primary opacity-10 pointer-events-none"></div>
<div>
<span className="inline-block bg-secondary-container text-on-secondary-fixed text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">{"Thanh toán"}</span>
<div className="font-display-hero text-[36px] font-black leading-tight text-secondary-container">{"10%"}</div>
<div className="font-label-md text-label-md text-on-primary-container uppercase font-semibold">{"Giảm tự động"}</div>
</div>
<div className="mt-4 sm:mt-0 flex items-center gap-1.5 text-on-primary/80 font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px]">{"qr_code_scanner"}</span>
<span>{"VietQR Pro 24/7"}</span>
</div>
</div>

<div className="hidden sm:block absolute left-48 -top-3 w-6 h-6 rounded-full bg-surface z-10 -ml-3"></div>
<div className="hidden sm:block absolute left-48 -bottom-3 w-6 h-6 rounded-full bg-surface z-10 -ml-3"></div>

<div className="flex-1 p-space-lg flex flex-col justify-between">
<div>
<div className="flex items-start justify-between gap-2 mb-space-xs">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Giảm 10% khi chuyển khoản VietQR"}</h3>
<span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-semibold">{"Tối đa 150.000₫"}</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-space-md">{"\n                Áp dụng cho mọi đơn đặt cọc và thanh toán tiền thuê xe thành công thông qua mã quét tĩnh hoặc động của cổng VietQR Napas247.\n              "}</p>
</div>
<div className="flex flex-col gap-space-sm pt-space-sm bg-surface-container-low/50 rounded-2xl p-space-sm">
<div className="flex items-center justify-between">
<div>
<span className="font-body-sm text-body-sm text-text-muted block">{"Mã voucher"}</span>
<span className="font-label-lg text-label-lg font-bold text-primary tracking-wider">{"VIETQR10"}</span>
</div>
<button className="cursor-pointer px-space-md py-1.5 rounded-full bg-surface-container hover:bg-surface-tint text-primary font-label-md text-label-md shadow-sm transition-all active:scale-95 flex items-center gap-1" type="button" data-handler="copyCode" data-args="'VIETQR10'">
<span className="material-symbols-outlined text-[16px]">{"content_copy"}</span>
<span>{"Sao chép"}</span>
</button>
</div>

<div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
<span>{"Hạn: 30/11/2025"}</span>
<span>{"•"}</span>
<span>{"Số lượt còn: "}<strong>{"320 lượt"}</strong></span>
<span>{"•"}</span>
<span className="text-status-success font-medium">{"Áp dụng tức thì"}</span>
</div>
</div>
</div>
</div>

<div className="voucher-card flex flex-col sm:flex-row bg-surface-container rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative" data-category="all ev" data-vehicle-card="ev" data-vehicle-name="Giảm 100.000₫ trải nghiệm VinFast VF 8 / VF 9" data-price="100000">

<div className="sm:w-48 bg-gradient-to-br from-secondary to-on-secondary-container p-space-lg flex flex-col justify-between text-on-primary relative overflow-hidden">
<div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-secondary-fixed opacity-20 pointer-events-none"></div>
<div>
<span className="inline-block bg-tertiary-fixed text-tertiary font-bold text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">{"VinFast EV"}</span>
<div className="font-display-hero text-[34px] font-black leading-tight text-white">{"100K"}</div>
<div className="font-label-md text-label-md text-secondary-container uppercase font-semibold">{"Trừ thẳng cước"}</div>
</div>
<div className="mt-4 sm:mt-0 flex items-center gap-1.5 text-white/90 font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px]">{"bolt"}</span>
<span>{"Xe Xanh 0 Khí Thải"}</span>
</div>
</div>

<div className="hidden sm:block absolute left-48 -top-3 w-6 h-6 rounded-full bg-surface z-10 -ml-3"></div>
<div className="hidden sm:block absolute left-48 -bottom-3 w-6 h-6 rounded-full bg-surface z-10 -ml-3"></div>

<div className="flex-1 p-space-lg flex flex-col justify-between">
<div>
<div className="flex items-start justify-between gap-2 mb-space-xs">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Giảm 100.000₫ trải nghiệm VinFast VF 8 / VF 9"}</h3>
<span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-semibold">{"Tối thiểu 1 ngày"}</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-space-md">{"\n                Khám phá công nghệ hỗ trợ lái ADAS cấp 2, nội thất bọc da cao cấp và mạng lưới sạc phủ sóng toàn quốc tiện lợi vượt trội.\n              "}</p>
</div>
<div className="flex flex-col gap-space-sm pt-space-sm bg-surface-container-low/50 rounded-2xl p-space-sm">
<div className="flex items-center justify-between">
<div>
<span className="font-body-sm text-body-sm text-text-muted block">{"Mã voucher"}</span>
<span className="font-label-lg text-label-lg font-bold text-secondary tracking-wider">{"GREENDRIVE"}</span>
</div>
<button className="cursor-pointer px-space-md py-1.5 rounded-full bg-surface-container hover:bg-surface-tint text-secondary font-label-md text-label-md shadow-sm transition-all active:scale-95 flex items-center gap-1" type="button" data-handler="copyCode" data-args="'GREENDRIVE'">
<span className="material-symbols-outlined text-[16px]">{"content_copy"}</span>
<span>{"Sao chép"}</span>
</button>
</div>
<div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
<span>{"Hạn: 15/10/2025"}</span>
<span>{"•"}</span>
<span>{"Số lượt còn: "}<strong>{"85 xe"}</strong></span>
<span>{"•"}</span>
<span className="text-status-success font-medium">{"Tặng cáp sạc 2.2kW"}</span>
</div>
</div>
</div>
</div>

<div className="voucher-card flex flex-col sm:flex-row bg-surface-container rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative" data-category="all weekend">

<div className="sm:w-48 bg-gradient-to-br from-tertiary-container to-tertiary p-space-lg flex flex-col justify-between text-on-tertiary relative overflow-hidden">
<div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-on-tertiary opacity-10 pointer-events-none"></div>
<div>
<span className="inline-block bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">{"Weekend Chill"}</span>
<div className="font-display-hero text-[34px] font-black leading-tight text-tertiary-fixed">{"+4 GIỜ"}</div>
<div className="font-label-md text-label-md text-on-tertiary uppercase font-semibold">{"Sử dụng xe miễn phí"}</div>
</div>
<div className="mt-4 sm:mt-0 flex items-center gap-1.5 text-on-tertiary/90 font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px]">{"more_time"}</span>
<span>{"Trả xe linh hoạt"}</span>
</div>
</div>

<div className="hidden sm:block absolute left-48 -top-3 w-6 h-6 rounded-full bg-surface z-10 -ml-3"></div>
<div className="hidden sm:block absolute left-48 -bottom-3 w-6 h-6 rounded-full bg-surface z-10 -ml-3"></div>

<div className="flex-1 p-space-lg flex flex-col justify-between">
<div>
<div className="flex items-start justify-between gap-2 mb-space-xs">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Tặng thêm 4 tiếng chạy xe cuối tuần"}</h3>
<span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[11px] font-semibold">{"Thuê từ 3 ngày"}</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-space-md">{"\n                Tự tin vi vu cuối tuần về quê hoặc du lịch không lo trễ giờ trả xe. Không tính phụ phí phát sinh thêm 4 giờ tính từ mốc kết thúc hợp đồng.\n              "}</p>
</div>
<div className="flex flex-col gap-space-sm pt-space-sm bg-surface-container-low/50 rounded-2xl p-space-sm">
<div className="flex items-center justify-between">
<div>
<span className="font-body-sm text-body-sm text-text-muted block">{"Mã voucher"}</span>
<span className="font-label-lg text-label-lg font-bold text-tertiary-container tracking-wider">{"WEEKENDTRIP"}</span>
</div>
<button className="cursor-pointer px-space-md py-1.5 rounded-full bg-surface-container hover:bg-surface-tint text-tertiary-container font-label-md text-label-md shadow-sm transition-all active:scale-95 flex items-center gap-1" type="button" data-handler="copyCode" data-args="'WEEKENDTRIP'">
<span className="material-symbols-outlined text-[16px]">{"content_copy"}</span>
<span>{"Sao chép"}</span>
</button>
</div>
<div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
<span>{"Hạn: 28/12/2025"}</span>
<span>{"•"}</span>
<span>{"Số lượt còn: "}<strong>{"60 lượt"}</strong></span>
<span>{"•"}</span>
<span className="text-status-success font-medium">{"Thứ 6 đến Chủ Nhật"}</span>
</div>
</div>
</div>
</div>

<div className="voucher-card flex flex-col sm:flex-row bg-surface-container rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative" data-category="all corporate">

<div className="sm:w-48 bg-gradient-to-br from-primary-container to-inverse-surface p-space-lg flex flex-col justify-between text-on-primary relative overflow-hidden">
<div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-on-primary opacity-10 pointer-events-none"></div>
<div>
<span className="inline-block bg-primary-fixed text-on-primary-fixed font-bold text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">{"Tài xế riêng"}</span>
<div className="font-display-hero text-[34px] font-black leading-tight text-primary-fixed">{"50K"}</div>
<div className="font-label-md text-label-md text-on-primary-container uppercase font-semibold">{"Hỗ trợ đưa đón"}</div>
</div>
<div className="mt-4 sm:mt-0 flex items-center gap-1.5 text-on-primary/80 font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px]">{"airline_seat_recline_normal"}</span>
<span>{"Đón sân bay chuẩn giờ"}</span>
</div>
</div>

<div className="hidden sm:block absolute left-48 -top-3 w-6 h-6 rounded-full bg-surface z-10 -ml-3"></div>
<div className="hidden sm:block absolute left-48 -bottom-3 w-6 h-6 rounded-full bg-surface z-10 -ml-3"></div>

<div className="flex-1 p-space-lg flex flex-col justify-between">
<div>
<div className="flex items-start justify-between gap-2 mb-space-xs">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Giảm 50.000₫ phí dịch vụ tài xế đưa đón"}</h3>
<span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-semibold">{"Tuyến sân bay"}</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-space-md">{"\n                Tài xế giàu kinh nghiệm, lịch sự, hỗ trợ hành lý chu đáo tại các sân bay Tân Sơn Nhất, Nội Bài, Đà Nẵng, Cam Ranh và Phú Quốc.\n              "}</p>
</div>
<div className="flex flex-col gap-space-sm pt-space-sm bg-surface-container-low/50 rounded-2xl p-space-sm">
<div className="flex items-center justify-between">
<div>
<span className="font-body-sm text-body-sm text-text-muted block">{"Mã voucher"}</span>
<span className="font-label-lg text-label-lg font-bold text-primary tracking-wider">{"CHAUFFEUR50"}</span>
</div>
<button className="cursor-pointer px-space-md py-1.5 rounded-full bg-surface-container hover:bg-surface-tint text-primary font-label-md text-label-md shadow-sm transition-all active:scale-95 flex items-center gap-1" type="button" data-handler="copyCode" data-args="'CHAUFFEUR50'">
<span className="material-symbols-outlined text-[16px]">{"content_copy"}</span>
<span>{"Sao chép"}</span>
</button>
</div>
<div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
<span>{"Hạn: 31/12/2025"}</span>
<span>{"•"}</span>
<span>{"Số lượt còn: "}<strong>{"214 lượt"}</strong></span>
<span>{"•"}</span>
<span className="text-status-success font-medium">{"Bao gồm đón sảnh VIP"}</span>
</div>
</div>
</div>
</div>

<div className="voucher-card flex flex-col sm:flex-row bg-surface-container rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative" data-category="all corporate">

<div className="sm:w-48 bg-gradient-to-br from-primary to-inverse-surface p-space-lg flex flex-col justify-between text-on-primary relative overflow-hidden">
<div>
<span className="inline-block bg-secondary-fixed text-on-secondary-fixed font-bold text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">{"Doanh nghiệp"}</span>
<div className="font-display-hero text-[34px] font-black leading-tight text-secondary-fixed">{"20%"}</div>
<div className="font-label-md text-label-md text-on-primary-container uppercase font-semibold">{"Hợp đồng tháng"}</div>
</div>
<div className="mt-4 sm:mt-0 flex items-center gap-1.5 text-on-primary/80 font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px]">{"badge"}</span>
<span>{"Hóa đơn VAT tức thì"}</span>
</div>
</div>

<div className="hidden sm:block absolute left-48 -top-3 w-6 h-6 rounded-full bg-surface z-10 -ml-3"></div>
<div className="hidden sm:block absolute left-48 -bottom-3 w-6 h-6 rounded-full bg-surface z-10 -ml-3"></div>

<div className="flex-1 p-space-lg flex flex-col justify-between">
<div>
<div className="flex items-start justify-between gap-2 mb-space-xs">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Chiết khấu 20% cho hợp đồng dài hạn"}</h3>
<span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-semibold">{"Ký từ 3 tháng"}</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-space-md">{"\n                Giải pháp xe công vụ thông minh dành cho doanh nghiệp và chuyên gia nước ngoài với chính sách bảo dưỡng tận nơi trọn gói.\n              "}</p>
</div>
<div className="flex flex-col gap-space-sm pt-space-sm bg-surface-container-low/50 rounded-2xl p-space-sm">
<div className="flex items-center justify-between">
<div>
<span className="font-body-sm text-body-sm text-text-muted block">{"Mã voucher"}</span>
<span className="font-label-lg text-label-lg font-bold text-primary tracking-wider">{"KANOWBIZ"}</span>
</div>
<button className="cursor-pointer px-space-md py-1.5 rounded-full bg-surface-container hover:bg-surface-tint text-primary font-label-md text-label-md shadow-sm transition-all active:scale-95 flex items-center gap-1" type="button" data-handler="copyCode" data-args="'KANOWBIZ'">
<span className="material-symbols-outlined text-[16px]">{"content_copy"}</span>
<span>{"Sao chép"}</span>
</button>
</div>
<div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
<span>{"Hạn: Không thời hạn"}</span>
<span>{"•"}</span>
<span>{"Hỗ trợ: "}<strong>{"1:1 Account Manager"}</strong></span>
</div>
</div>
</div>
</div>

<div className="voucher-card flex flex-col sm:flex-row bg-surface-container rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative" data-category="all weekend newbie">

<div className="sm:w-48 bg-gradient-to-br from-tertiary to-tertiary-container p-space-lg flex flex-col justify-between text-on-tertiary relative overflow-hidden">
<div>
<span className="inline-block bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">{"Xuyên Việt"}</span>
<div className="font-display-hero text-[34px] font-black leading-tight text-white">{"200K"}</div>
<div className="font-label-md text-label-md text-tertiary-fixed uppercase font-semibold">{"Hành trình xa"}</div>
</div>
<div className="mt-4 sm:mt-0 flex items-center gap-1.5 text-white/90 font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px]">{"map"}</span>
<span>{"Không giới hạn km"}</span>
</div>
</div>

<div className="hidden sm:block absolute left-48 -top-3 w-6 h-6 rounded-full bg-surface z-10 -ml-3"></div>
<div className="hidden sm:block absolute left-48 -bottom-3 w-6 h-6 rounded-full bg-surface z-10 -ml-3"></div>

<div className="flex-1 p-space-lg flex flex-col justify-between">
<div>
<div className="flex items-start justify-between gap-2 mb-space-xs">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{"Giảm 200.000₫ cho chuyến đi từ 5 ngày"}</h3>
<span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[11px] font-semibold">{"Tất cả xe 7 chỗ"}</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-space-md">{"\n                Tự do khám phá cung đường Tây Bắc, Duyên hải Nam Trung Bộ hoặc miền Tây trù phú với các dòng SUV tiện nghi (Everest, Carnival, SantaFe).\n              "}</p>
</div>
<div className="flex flex-col gap-space-sm pt-space-sm bg-surface-container-low/50 rounded-2xl p-space-sm">
<div className="flex items-center justify-between">
<div>
<span className="font-body-sm text-body-sm text-text-muted block">{"Mã voucher"}</span>
<span className="font-label-lg text-label-lg font-bold text-tertiary-container tracking-wider">{"ROADTRIP200"}</span>
</div>
<button className="cursor-pointer px-space-md py-1.5 rounded-full bg-surface-container hover:bg-surface-tint text-tertiary-container font-label-md text-label-md shadow-sm transition-all active:scale-95 flex items-center gap-1" type="button" data-handler="copyCode" data-args="'ROADTRIP200'">
<span className="material-symbols-outlined text-[16px]">{"content_copy"}</span>
<span>{"Sao chép"}</span>
</button>
</div>
<div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
<span>{"Hạn: 30/12/2025"}</span>
<span>{"•"}</span>
<span>{"Số lượt còn: "}<strong>{"42 chuyến"}</strong></span>
<span>{"•"}</span>
<span className="text-status-success font-medium">{"Bảo hiểm 2 chiều đi kèm"}</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-space-xl bg-surface-container-lowest">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="text-center max-w-2xl mx-auto mb-space-xl">
<span className="font-label-md text-label-md text-secondary font-bold tracking-widest uppercase block mb-1">{"Quy Trình Siêu Tốc"}</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">{"Chỉ 3 Bước Kích Hoạt Mã Ưu Đãi"}</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">{"Hệ thống Kanow tự động nhận diện điều kiện ưu đãi tốt nhất cho chuyến xe của bạn."}</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">

<div className="bg-surface-container-low p-space-xl rounded-3xl flex flex-col items-start gap-space-md relative overflow-hidden transition-all hover:bg-surface-tint">
<div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-headline-sm">{"01"}</div>
<div className="flex flex-col gap-1">
<h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{"Chọn và Sao Chép Mã"}</h4>
<p className="font-body-md text-body-md text-on-surface-variant">{"Lựa chọn mã coupon phù hợp nhu cầu (thuê tự lái, xe điện hay tài xế riêng) rồi nhấn nút \"Sao chép\"."}</p>
</div>
<span className="material-symbols-outlined text-border-subtle absolute -bottom-6 -right-6 text-[100px] select-none pointer-events-none">{"content_copy"}</span>
</div>

<div className="bg-surface-container-low p-space-xl rounded-3xl flex flex-col items-start gap-space-md relative overflow-hidden transition-all hover:bg-surface-tint">
<div className="w-12 h-12 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center font-bold text-headline-sm">{"02"}</div>
<div className="flex flex-col gap-1">
<h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{"Tìm Xe & Ngày Giờ Thuê"}</h4>
<p className="font-body-md text-body-md text-on-surface-variant">{"Chọn mẫu xe yêu thích cùng thời gian giao nhận thuận tiện tại hơn 50+ điểm trả xe khắp thành phố."}</p>
</div>
<span className="material-symbols-outlined text-border-subtle absolute -bottom-6 -right-6 text-[100px] select-none pointer-events-none">{"directions_car"}</span>
</div>

<div className="bg-surface-container-low p-space-xl rounded-3xl flex flex-col items-start gap-space-md relative overflow-hidden transition-all hover:bg-surface-tint">
<div className="w-12 h-12 rounded-2xl bg-tertiary-container text-on-tertiary flex items-center justify-center font-bold text-headline-sm">{"03"}</div>
<div className="flex flex-col gap-1">
<h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{"Dán Mã & Nhận Giảm Trừ"}</h4>
<p className="font-body-md text-body-md text-on-surface-variant">{"Nhập mã vào ô \"Mã khuyến mại\" tại màn hình thanh toán. Tổng cước sẽ được trừ lập tức vào hóa đơn."}</p>
</div>
<span className="material-symbols-outlined text-border-subtle absolute -bottom-6 -right-6 text-[100px] select-none pointer-events-none">{"savings"}</span>
</div>
</div>
</div>
</section>

<section className="w-full py-space-2xl bg-gradient-to-b from-surface-container-lowest to-surface">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="bg-primary rounded-3xl p-space-xl lg:p-space-2xl text-on-primary relative overflow-hidden shadow-2xl">

<div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-secondary opacity-30 blur-2xl pointer-events-none"></div>
<div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-tertiary-container opacity-25 blur-2xl pointer-events-none"></div>
<div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">

<div className="lg:col-span-7 flex flex-col gap-space-md">
<div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-on-primary/10 text-secondary-container font-label-md text-label-md w-fit">
<span className="material-symbols-outlined text-[16px]">{"notifications_active"}</span>
<span>{"Thông báo chớp nhoáng"}</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-on-primary font-bold">{"\n              Đừng Bỏ Lỡ Voucher Giảm Đến 50% Vào Dịp Lễ & Tết\n            "}</h2>
<p className="font-body-lg text-body-lg text-on-primary-container max-w-xl">{"\n              Đăng ký nhận bảng tin độc quyền qua Zalo OA hoặc Email. Kanow cam kết không spam và chỉ gửi mã giảm thực sự giá trị cho các chặng hành trình của bạn.\n            "}</p>
</div>

<div className="lg:col-span-5 bg-surface-container p-space-lg rounded-2xl shadow-lg text-on-surface">
<form className="flex flex-col gap-space-md" id="subscribe-form">
<div className="flex items-center justify-between pb-2 border-b border-surface-container-highest">
<span className="font-label-lg text-label-lg text-on-surface font-semibold">{"Nhận mã ưu đãi riêng"}</span>
<span className="font-body-sm text-body-sm text-secondary font-medium">{"Miễn phí 100%"}</span>
</div>
<div className="flex flex-col gap-space-xs">
<label className="font-label-md text-label-md text-on-surface-variant font-medium" htmlFor="contact-input">{"Số điện thoại Zalo hoặc Email"}</label>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-3.5 text-text-muted text-[20px]">{"contact_phone"}</span>
<input className="w-full pl-11 pr-4 py-3 bg-surface-container-low rounded-xl text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-text-muted/60" id="contact-input" placeholder="0912 345 678 hoặc email@domain.com" required={true} type="text" aria-label="0912 345 678 hoặc email@domain.com" />
</div>
</div>

<div className="grid grid-cols-2 gap-space-sm">
<label className="cursor-pointer flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-tint transition-colors">
<input className="accent-primary w-4 h-4" name="channel" type="radio" defaultValue="zalo" defaultChecked={true} aria-label="channel" />
<span className="font-label-md text-label-md text-on-surface">{"Nhận qua Zalo"}</span>
</label>
<label className="cursor-pointer flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-tint transition-colors">
<input className="accent-primary w-4 h-4" name="channel" type="radio" defaultValue="email" aria-label="channel" />
<span className="font-label-md text-label-md text-on-surface">{"Nhận qua Email"}</span>
</label>
</div>

<button className="cursor-pointer w-full py-3.5 rounded-full bg-tertiary-container hover:bg-tertiary text-on-tertiary font-label-lg text-label-lg font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-2" type="submit">
<span>{"Nhận Vé Ưu Đãi VIP Ngay"}</span>
<span className="material-symbols-outlined text-[18px]">{"send"}</span>
</button>
<p className="font-body-sm text-body-sm text-text-muted text-center">{"\n                Bằng việc nhấn đăng ký, bạn đồng ý với "}<Link className="underline text-primary" href="/lien-he">{"Chính sách bảo mật"}</Link>{" của Kanow.\n              "}</p>
</form>
</div>
</div>
</div>
</div>
</section>


</div></main>
  );
}
