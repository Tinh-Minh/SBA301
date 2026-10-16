import Link from "next/link";

export default function PricingAlternate() {
  return (
<main className="w-full pt-20 bg-surface"><div className="flex flex-col w-full">

<section className="relative w-full bg-surface-canvas overflow-hidden pt-space-xl pb-space-lg">
<div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
<div className="absolute top-10 right-0 w-[500px] h-[500px] rounded-full bg-primary-fixed/25 blur-3xl pointer-events-none"></div>
<div className="max-w-[1240px] mx-auto px-margin relative z-10">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
<div className="flex flex-col gap-space-xs max-w-2xl">
<div className="flex items-center gap-space-xs">
<span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-secondary"></span>
<span className="font-label-md text-label-md uppercase tracking-wider text-secondary">{"Biểu Phí Niêm Yết Minh Bạch 2025"}</span>
</div>
<h1 className="font-display-hero text-display-hero text-primary tracking-tight">{"Hệ Thống Đội Xe & Bảng Giá"}</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant">{"\n            Chính sách giá công khai trọn gói, cam kết không phụ phí ẩn. Tiết kiệm hơn tới 25% khi đặt theo tuần hoặc theo tháng.\n          "}</p>
</div>
<div className="flex items-center gap-space-sm self-start md:self-auto">
<button className="flex items-center gap-space-xs px-space-md py-space-sm rounded-full bg-surface-container text-primary font-label-md text-label-md shadow-sm hover:shadow-md transition-all active:scale-95" id="downloadPdfBtn" type="button">
<span className="material-symbols-outlined text-[18px] text-secondary">{"picture_as_pdf"}</span>
<span>{"Tải Bảng Giá PDF"}</span>
</button>
<a className="flex items-center gap-space-xs px-space-md py-space-sm rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container shadow-sm transition-all" href="#enterpriseConsult">
<span className="material-symbols-outlined text-[18px]">{"business_center"}</span>
<span>{"Tư Vấn Doanh Nghiệp"}</span>
</a>
</div>
</div>

<div className="bg-surface-tint/70 p-space-xs rounded-full flex flex-wrap items-center max-w-3xl shadow-inner mb-space-lg">
<button className="mode-tab flex-1 min-w-[160px] py-space-sm px-space-md rounded-full font-label-lg text-label-lg text-center transition-all bg-surface-container text-primary shadow-sm flex items-center justify-center gap-space-xs" id="tab-self-drive" type="button" data-handler="switchRentalMode" data-args="'self-drive'">
<span className="material-symbols-outlined text-[18px]">{"key"}</span>
<span>{"Thuê Tự Lái"}</span>
</button>
<button className="mode-tab flex-1 min-w-[160px] py-space-sm px-space-md rounded-full font-label-lg text-label-lg text-center transition-all text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-space-xs" id="tab-with-driver" type="button" data-handler="switchRentalMode" data-args="'with-driver'">
<span className="material-symbols-outlined text-[18px]">{"person_pin_circle"}</span>
<span>{"Xe Kèm Tài Xế"}</span>
</button>
<button className="mode-tab flex-1 min-w-[160px] py-space-sm px-space-md rounded-full font-label-lg text-label-lg text-center transition-all text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-space-xs" id="tab-corporate-monthly" type="button" data-handler="switchRentalMode" data-args="'corporate-monthly'">
<span className="material-symbols-outlined text-[18px]">{"corporate_fare"}</span>
<span>{"Theo Tháng & Doanh Nghiệp"}</span>
</button>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-space-2xl">
<div className="bg-surface-container p-space-md rounded-xl shadow-sm flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[20px]">{"verified"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface">{"Đời Xe 2022 - 2025"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Kiểm định kỹ thuật 45 điểm định kỳ trước khi giao xe"}</div>
</div>
</div>
<div className="bg-surface-container p-space-md rounded-xl shadow-sm flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-full bg-primary-fixed/40 flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[20px]">{"shield"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface">{"Bảo Hiểm Vật Chất 2 Chiều"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Đã bao gồm trong giá niêm yết, an tâm trải nghiệm"}</div>
</div>
</div>
<div className="bg-surface-container p-space-md rounded-xl shadow-sm flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary-container shrink-0">
<span className="material-symbols-outlined text-[20px]">{"percent"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface">{"Giảm Tới 25% Khi Thuê Tháng"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Thuê từ 7 ngày giảm ngay 10%, thủ tục tinh gọn 5 phút"}</div>
</div>
</div>
<div className="bg-surface-container p-space-md rounded-xl shadow-sm flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[20px]">{"home_pin"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface">{"Giao Xe Tận Nhà Linh Hoạt"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Miễn phí bán kính 5km trong nội thành TP.HCM & Hà Nội"}</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface py-space-xl">
<div className="max-w-[1240px] mx-auto px-margin flex flex-col gap-space-2xl">

<div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div>
<span className="font-label-md text-label-md text-text-muted uppercase">{"Danh Mục Đa Dạng"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary">{"Phân Khúc Xe & Mức Giá Thực Tế"}</h2>
</div>

<div className="flex flex-wrap items-center gap-space-xs" id="categoryFilterContainer">
<button className="cat-pill px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all bg-primary text-on-primary" type="button" data-handler="filterCategory" data-args="'all'">{"Tất Cả (5 Phân Khúc)"}</button>
<button className="cat-pill px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all bg-surface-container-high text-on-surface-variant hover:text-on-surface" type="button" data-handler="filterCategory" data-args="'sedan'">{"Sedan & Đô Thị"}</button>
<button className="cat-pill px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all bg-surface-container-high text-on-surface-variant hover:text-on-surface" type="button" data-handler="filterCategory" data-args="'crossover'">{"Crossover / SUV 5 Chỗ"}</button>
<button className="cat-pill px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all bg-surface-container-high text-on-surface-variant hover:text-on-surface" type="button" data-handler="filterCategory" data-args="'mpv'">{"7 Chỗ Gia Đình"}</button>
<button className="cat-pill px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all bg-surface-container-high text-on-surface-variant hover:text-on-surface" type="button" data-handler="filterCategory" data-args="'electric'">{"Xe Điện VinFast"}</button>
<button className="cat-pill px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all bg-surface-container-high text-on-surface-variant hover:text-on-surface" type="button" data-handler="filterCategory" data-args="'luxury'">{"Hạng Sang"}</button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter" id="fleetGrid">

<div className="fleet-card bg-surface-container rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between" data-category="sedan">
<div>
<div className="relative w-full h-56 bg-surface-container-low overflow-hidden">
<img className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" src="/images/57a960d257e91f51.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-space-sm left-space-sm flex gap-space-xs">
<span className="px-space-sm py-0.5 rounded-full bg-surface-canvas/90 backdrop-blur-md font-label-md text-label-md text-primary">{"4-5 Chỗ"}</span>
<span className="px-space-sm py-0.5 rounded-full bg-surface-container-lowest/90 font-label-md text-label-md text-secondary">{"Số Tự Động"}</span>
</div>
<div className="absolute bottom-space-sm right-space-sm">
<span className="px-space-sm py-1 rounded-full bg-primary/80 backdrop-blur-md text-on-primary font-label-md text-label-md">{"Đô Thị Linh Hoạt"}</span>
</div>
</div>
<div className="p-space-lg flex flex-col gap-space-sm">
<div className="flex items-baseline justify-between">
<h3 className="font-headline-sm text-headline-sm text-on-surface">{"Sedan & Hatchback Đô Thị"}</h3>
<span className="font-label-md text-label-md text-text-muted">{"4 Dòng xe"}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"\n                Hyundai Accent, Toyota Vios, Mazda 3, Kia K3. Tối ưu tiêu hao nhiên liệu (5.2L/100km), dễ luồn lách nội đô.\n              "}</p>
<div className="grid grid-cols-2 gap-space-xs pt-space-xs">
<div className="p-space-xs bg-surface-container-low rounded">
<div className="font-label-md text-label-md text-text-muted">{"Khoang hành lý"}</div>
<div className="font-label-lg text-label-lg text-on-surface">{"390L - 480L"}</div>
</div>
<div className="p-space-xs bg-surface-container-low rounded">
<div className="font-label-md text-label-md text-text-muted">{"Đời xe bàn giao"}</div>
<div className="font-label-lg text-label-lg text-on-surface">{"2023 - 2025"}</div>
</div>
</div>

<div className="mt-space-sm p-space-sm rounded-lg bg-surface-tint">
<div className="flex items-center justify-between">
<span className="price-mode-label font-label-md text-label-md text-secondary">{"Giá thuê tự lái"}</span>
<div className="text-right">
<span className="font-price-display text-price-display text-primary price-val" data-base="750.000" data-driver="1.100.000" data-month="15.800.000">{"750.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted rate-period">{"/ ngày"}</span>
</div>
</div>
<div className="font-body-sm text-body-sm text-text-muted flex items-center justify-between mt-1">
<span>{"Khung giá dao động:"}</span>
<span className="font-label-md text-label-md text-primary font-medium">{"700k - 900k / ngày"}</span>
</div>
</div>
</div>
</div>
<div className="p-space-lg pt-0">
<button className="w-full py-space-sm rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all flex items-center justify-center gap-space-xs" type="button">
<span>{"Xem Dòng Xe & Đặt Chỗ"}</span>
<span className="material-symbols-outlined text-[16px]">{"arrow_forward"}</span>
</button>
</div>
</div>

<div className="fleet-card bg-surface-container rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between" data-category="crossover">
<div>
<div className="relative w-full h-56 bg-surface-container-low overflow-hidden">
<img className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" src="/images/d09782c2df4588c5.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-space-sm left-space-sm flex gap-space-xs">
<span className="px-space-sm py-0.5 rounded-full bg-surface-canvas/90 backdrop-blur-md font-label-md text-label-md text-primary">{"5 Chỗ Gầm Cao"}</span>
<span className="px-space-sm py-0.5 rounded-full bg-surface-container-lowest/90 font-label-md text-label-md text-secondary">{"Số Tự Động"}</span>
</div>
<div className="absolute bottom-space-sm right-space-sm">
<span className="px-space-sm py-1 rounded-full bg-secondary text-on-secondary font-label-md text-label-md">{"Đa Dụng & Phổ Biến"}</span>
</div>
</div>
<div className="p-space-lg flex flex-col gap-space-sm">
<div className="flex items-baseline justify-between">
<h3 className="font-headline-sm text-headline-sm text-on-surface">{"Crossover & SUV 5 Chỗ"}</h3>
<span className="font-label-md text-label-md text-text-muted">{"3 Dòng xe"}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"\n                Toyota Corolla Cross, Hyundai Creta, Mazda CX-5. Tầm nhìn thoáng, cách âm vượt trội, êm ái trên cung đường xa.\n              "}</p>
<div className="grid grid-cols-2 gap-space-xs pt-space-xs">
<div className="p-space-xs bg-surface-container-low rounded">
<div className="font-label-md text-label-md text-text-muted">{"Khoảng sáng gầm"}</div>
<div className="font-label-lg text-label-lg text-on-surface">{"200mm"}</div>
</div>
<div className="p-space-xs bg-surface-container-low rounded">
<div className="font-label-md text-label-md text-text-muted">{"Tiện ích thông minh"}</div>
<div className="font-label-lg text-label-lg text-on-surface">{"Apple CarPlay / ADAS"}</div>
</div>
</div>

<div className="mt-space-sm p-space-sm rounded-lg bg-surface-tint">
<div className="flex items-center justify-between">
<span className="price-mode-label font-label-md text-label-md text-secondary">{"Giá thuê tự lái"}</span>
<div className="text-right">
<span className="font-price-display text-price-display text-primary price-val" data-base="1.050.000" data-driver="1.400.000" data-month="22.500.000">{"1.050.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted rate-period">{"/ ngày"}</span>
</div>
</div>
<div className="font-body-sm text-body-sm text-text-muted flex items-center justify-between mt-1">
<span>{"Khung giá dao động:"}</span>
<span className="font-label-md text-label-md text-primary font-medium">{"950k - 1.200k / ngày"}</span>
</div>
</div>
</div>
</div>
<div className="p-space-lg pt-0">
<button className="w-full py-space-sm rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all flex items-center justify-center gap-space-xs" type="button">
<span>{"Xem Dòng Xe & Đặt Chỗ"}</span>
<span className="material-symbols-outlined text-[16px]">{"arrow_forward"}</span>
</button>
</div>
</div>

<div className="fleet-card bg-surface-container rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between" data-category="mpv">
<div>
<div className="relative w-full h-56 bg-surface-container-low overflow-hidden">
<img className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" src="/images/38640edac8b0f73a.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-space-sm left-space-sm flex gap-space-xs">
<span className="px-space-sm py-0.5 rounded-full bg-surface-canvas/90 backdrop-blur-md font-label-md text-label-md text-primary">{"7 Chỗ Rộng"}</span>
<span className="px-space-sm py-0.5 rounded-full bg-surface-container-lowest/90 font-label-md text-label-md text-secondary">{"Ghế Cơ Động"}</span>
</div>
<div className="absolute bottom-space-sm right-space-sm">
<span className="px-space-sm py-1 rounded-full bg-tertiary-container text-on-tertiary font-label-md text-label-md">{"Gia Đình & Đoàn Khách"}</span>
</div>
</div>
<div className="p-space-lg flex flex-col gap-space-sm">
<div className="flex items-baseline justify-between">
<h3 className="font-headline-sm text-headline-sm text-on-surface">{"SUV & MPV 7 Chỗ Gia Đình"}</h3>
<span className="font-label-md text-label-md text-text-muted">{"4 Dòng xe"}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"\n                Kia Carnival, Hyundai Santa Fe, Mitsubishi Xpander, Toyota Fortuner. Khoang hành khách cực rộng, ghế ngả sâu thư thái.\n              "}</p>
<div className="grid grid-cols-2 gap-space-xs pt-space-xs">
<div className="p-space-xs bg-surface-container-low rounded">
<div className="font-label-md text-label-md text-text-muted">{"Sức chứa vali"}</div>
<div className="font-label-lg text-label-lg text-on-surface">{"4 - 6 Vali lớn"}</div>
</div>
<div className="p-space-xs bg-surface-container-low rounded">
<div className="font-label-md text-label-md text-text-muted">{"Cửa lùa điện tử"}</div>
<div className="font-label-lg text-label-lg text-on-surface">{"Tùy phiên bản"}</div>
</div>
</div>

<div className="mt-space-sm p-space-sm rounded-lg bg-surface-tint">
<div className="flex items-center justify-between">
<span className="price-mode-label font-label-md text-label-md text-secondary">{"Giá thuê tự lái"}</span>
<div className="text-right">
<span className="font-price-display text-price-display text-primary price-val" data-base="1.350.000" data-driver="1.700.000" data-month="28.000.000">{"1.350.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted rate-period">{"/ ngày"}</span>
</div>
</div>
<div className="font-body-sm text-body-sm text-text-muted flex items-center justify-between mt-1">
<span>{"Khung giá dao động:"}</span>
<span className="font-label-md text-label-md text-primary font-medium">{"1.000k - 1.800k / ngày"}</span>
</div>
</div>
</div>
</div>
<div className="p-space-lg pt-0">
<button className="w-full py-space-sm rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all flex items-center justify-center gap-space-xs" type="button">
<span>{"Xem Dòng Xe & Đặt Chỗ"}</span>
<span className="material-symbols-outlined text-[16px]">{"arrow_forward"}</span>
</button>
</div>
</div>

<div className="fleet-card bg-surface-container rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between" data-category="electric" data-vehicle-card="ev" data-vehicle-name="Đội Xe Điện VinFast" data-price="920000">
<div>
<div className="relative w-full h-56 bg-surface-container-low overflow-hidden">
<img className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" src="/images/e4ba6c3fda12ab2e.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-space-sm left-space-sm flex gap-space-xs">
<span className="px-space-sm py-0.5 rounded-full bg-status-success/20 text-on-background font-label-md text-label-md flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-status-success">{"bolt"}</span>{" 100% Điện Xanh\n                "}</span>
<span className="px-space-sm py-0.5 rounded-full bg-surface-container-lowest/90 font-label-md text-label-md text-primary">{"5 - 7 Chỗ"}</span>
</div>
<div className="absolute bottom-space-sm right-space-sm">
<span className="px-space-sm py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-label-md text-label-md">{"Tiết Kiệm 60% Nhiên Liệu"}</span>
</div>
</div>
<div className="p-space-lg flex flex-col gap-space-sm">
<div className="flex items-baseline justify-between">
<h3 className="font-headline-sm text-headline-sm text-on-surface">{"Đội Xe Điện VinFast"}</h3>
<span className="font-label-md text-label-md text-text-muted">{"5 Dòng xe"}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"\n                VF 5, VF e34, VF 6, VF 8 Plus, VF 9. Miễn phí sạc pin theo chương trình hợp tác, gia tốc mượt mà, công nghệ trợ lái thông minh.\n              "}</p>
<div className="grid grid-cols-2 gap-space-xs pt-space-xs">
<div className="p-space-xs bg-surface-container-low rounded">
<div className="font-label-md text-label-md text-text-muted">{"Quãng đường / sạc"}</div>
<div className="font-label-lg text-label-lg text-on-surface">{"300 - 450 km"}</div>
</div>
<div className="p-space-xs bg-surface-container-low rounded">
<div className="font-label-md text-label-md text-text-muted">{"Hỗ trợ trạm sạc"}</div>
<div className="font-label-lg text-label-lg text-on-surface">{"Toàn quốc 24/7"}</div>
</div>
</div>

<div className="mt-space-sm p-space-sm rounded-lg bg-surface-tint">
<div className="flex items-center justify-between">
<span className="price-mode-label font-label-md text-label-md text-secondary">{"Giá thuê tự lái"}</span>
<div className="text-right">
<span className="font-price-display text-price-display text-primary price-val" data-base="920.000" data-driver="1.270.000" data-month="18.500.000">{"920.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted rate-period">{"/ ngày"}</span>
</div>
</div>
<div className="font-body-sm text-body-sm text-text-muted flex items-center justify-between mt-1">
<span>{"Khung giá dao động:"}</span>
<span className="font-label-md text-label-md text-primary font-medium">{"750k - 1.400k / ngày"}</span>
</div>
</div>
</div>
</div>
<div className="p-space-lg pt-0">
<button className="w-full py-space-sm rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all flex items-center justify-center gap-space-xs" type="button">
<span>{"Xem Dòng Xe & Đặt Chỗ"}</span>
<span className="material-symbols-outlined text-[16px]">{"arrow_forward"}</span>
</button>
</div>
</div>

<div className="fleet-card bg-surface-container rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between" data-category="luxury">
<div>
<div className="relative w-full h-56 bg-surface-container-low overflow-hidden">
<img className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" src="/images/e999b32d1c40b292.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-space-sm left-space-sm flex gap-space-xs">
<span className="px-space-sm py-0.5 rounded-full bg-inverse-surface text-inverse-on-surface font-label-md text-label-md">{"Hạng Thương Gia"}</span>
<span className="px-space-sm py-0.5 rounded-full bg-surface-container-lowest/90 font-label-md text-label-md text-secondary">{"Đẳng Cấp"}</span>
</div>
<div className="absolute bottom-space-sm right-space-sm">
<span className="px-space-sm py-1 rounded-full bg-primary text-on-primary font-label-md text-label-md">{"Đón Tiếp VIP"}</span>
</div>
</div>
<div className="p-space-lg flex flex-col gap-space-sm">
<div className="flex items-baseline justify-between">
<h3 className="font-headline-sm text-headline-sm text-on-surface">{"Sedan Hạng Sang & Executive"}</h3>
<span className="font-label-md text-label-md text-text-muted">{"3 Dòng xe"}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"\n                Mercedes-Benz C200 / E300, BMW 5-Series. Nội thất bọc da cao cấp, hệ thống âm thanh vòm Burmester, đón tiếp đối tác trang trọng.\n              "}</p>
<div className="grid grid-cols-2 gap-space-xs pt-space-xs">
<div className="p-space-xs bg-surface-container-low rounded">
<div className="font-label-md text-label-md text-text-muted">{"Tiện ích khoang sau"}</div>
<div className="font-label-lg text-label-lg text-on-surface">{"Rèm điện & massage"}</div>
</div>
<div className="p-space-xs bg-surface-container-low rounded">
<div className="font-label-md text-label-md text-text-muted">{"Tài xế chuyên nghiệp"}</div>
<div className="font-label-lg text-label-lg text-on-surface">{"Giao tiếp tiếng Anh"}</div>
</div>
</div>

<div className="mt-space-sm p-space-sm rounded-lg bg-surface-tint">
<div className="flex items-center justify-between">
<span className="price-mode-label font-label-md text-label-md text-secondary">{"Giá thuê tự lái"}</span>
<div className="text-right">
<span className="font-price-display text-price-display text-primary price-val" data-base="2.400.000" data-driver="2.750.000" data-month="48.000.000">{"2.400.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted rate-period">{"/ ngày"}</span>
</div>
</div>
<div className="font-body-sm text-body-sm text-text-muted flex items-center justify-between mt-1">
<span>{"Khung giá niêm yết:"}</span>
<span className="font-label-md text-label-md text-primary font-medium">{"Từ 2.200k / ngày"}</span>
</div>
</div>
</div>
</div>
<div className="p-space-lg pt-0">
<button className="w-full py-space-sm rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all flex items-center justify-center gap-space-xs" type="button">
<span>{"Xem Dòng Xe & Đặt Chỗ"}</span>
<span className="material-symbols-outlined text-[16px]">{"arrow_forward"}</span>
</button>
</div>
</div>

<div className="fleet-card bg-gradient-to-br from-primary-container to-primary rounded-xl p-space-lg text-on-primary shadow-sm flex flex-col justify-between" data-category="all">
<div className="flex flex-col gap-space-md">
<div className="w-12 h-12 rounded-full bg-surface-container/20 flex items-center justify-center text-on-primary">
<span className="material-symbols-outlined text-[26px]">{"loyalty"}</span>
</div>
<div>
<span className="font-label-md text-label-md text-on-primary-container uppercase tracking-wider">{"Chính Sách Ưu Đãi Độc Quyền"}</span>
<h3 className="font-headline-md text-headline-md text-on-primary mt-1">{"Thuê Càng Dài, Giá Càng Hời"}</h3>
</div>
<p className="font-body-md text-body-md text-inverse-on-surface">{"\n              Giảm ngay 10% cho chuyến đi từ 7 ngày trở lên. Giảm trực tiếp 25% kèm hợp đồng xuất hóa đơn VAT đầy đủ cho doanh nghiệp khi thuê trọn tháng.\n            "}</p>
<div className="space-y-space-xs bg-surface-container/10 p-space-md rounded-lg backdrop-blur-sm">
<div className="flex items-center justify-between text-body-sm">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-secondary-fixed">{"check_circle"}</span>{" Thuê từ 7 ngày:"}</span>
<span className="font-label-lg text-label-lg text-secondary-fixed">{"Giảm 10%"}</span>
</div>
<div className="flex items-center justify-between text-body-sm">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-secondary-fixed">{"check_circle"}</span>{" Thuê từ 30 ngày:"}</span>
<span className="font-label-lg text-label-lg text-secondary-fixed">{"Giảm 25%"}</span>
</div>
<div className="flex items-center justify-between text-body-sm">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-secondary-fixed">{"check_circle"}</span>{" Miễn thế chấp xe máy:"}</span>
<span className="font-label-lg text-label-lg text-on-primary">{"Thẩm định qua VNeID"}</span>
</div>
</div>
</div>
<div className="pt-space-md">
<a className="w-full py-space-sm rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md hover:bg-secondary transition-all flex items-center justify-center gap-space-xs" href="#enterpriseConsult">
<span className="material-symbols-outlined text-[18px]">{"contact_support"}</span>
<span>{"Đăng Ký Tư Vấn Doanh Nghiệp"}</span>
</a>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface-canvas py-space-2xl">
<div className="max-w-[1240px] mx-auto px-margin flex flex-col gap-space-xl">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
<div>
<span className="font-label-md text-label-md text-secondary uppercase font-semibold">{"So Sánh Nhanh Thông Số"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary">{"Bảng Đối Chiếu Mức Giá Chi Tiết Theo Phân Khúc"}</h2>
</div>
<div className="font-body-sm text-body-sm text-text-muted">{"\n          * Đã bao gồm bảo hiểm thân vỏ xe cơ bản & hỗ trợ kỹ thuật 24/7.\n        "}</div>
</div>

<div className="w-full overflow-x-auto bg-surface-container rounded-xl shadow-sm">
<div className="table-scroll" tabIndex={0} aria-label="Bảng thông tin, cuộn ngang để xem thêm"><table className="w-full text-left border-collapse min-w-[760px]">
<thead>
<tr className="bg-surface-tint text-primary font-label-lg text-label-lg">
<th className="p-space-md">{"Phân Khúc & Dòng Xe Đại Diện"}</th>
<th className="p-space-md">{"Số Chỗ & Động Cơ"}</th>
<th className="p-space-md">{"Thuê Tự Lái (Ngày)"}</th>
<th className="p-space-md">{"Kèm Tài Xế (Ngày)"}</th>
<th className="p-space-md">{"Gói Tháng (30 Ngày)"}</th>
<th className="p-space-md text-center">{"Tác Vụ"}</th>
</tr>
</thead>
<tbody className="divide-y-0 text-on-surface">

<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="p-space-md">
<div className="font-label-lg text-label-lg text-primary">{"Sedan Đô Thị"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Accent, Vios, Mazda 3, K3"}</div>
</td>
<td className="p-space-md">
<div className="font-body-md text-body-md">{"4 - 5 Chỗ"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Xăng (1.4L - 1.5L)"}</div>
</td>
<td className="p-space-md font-label-lg text-label-lg text-primary">{"700.000₫ - 900.000₫"}</td>
<td className="p-space-md font-label-lg text-label-lg text-secondary">{"1.050.000₫ - 1.250.000₫"}</td>
<td className="p-space-md font-label-lg text-label-lg text-on-surface">{"14.500.000₫ - 17.500.000₫"}</td>
<td className="p-space-md text-center">
<button className="px-space-md py-1 rounded-full bg-surface-variant hover:bg-primary hover:text-on-primary font-label-md text-label-md text-primary transition-all" type="button" data-action="book">{"Chọn Xe"}</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors bg-surface-container-lowest">
<td className="p-space-md">
<div className="font-label-lg text-label-lg text-primary">{"Crossover / SUV 5 Chỗ Gầm Cao"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Corolla Cross, Creta, CX-5"}</div>
</td>
<td className="p-space-md">
<div className="font-body-md text-body-md">{"5 Chỗ Gầm Cao"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Xăng / Tự Động"}</div>
</td>
<td className="p-space-md font-label-lg text-label-lg text-primary">{"950.000₫ - 1.200.000₫"}</td>
<td className="p-space-md font-label-lg text-label-lg text-secondary">{"1.300.000₫ - 1.550.000₫"}</td>
<td className="p-space-md font-label-lg text-label-lg text-on-surface">{"20.500.000₫ - 24.500.000₫"}</td>
<td className="p-space-md text-center">
<button className="px-space-md py-1 rounded-full bg-surface-variant hover:bg-primary hover:text-on-primary font-label-md text-label-md text-primary transition-all" type="button" data-action="book">{"Chọn Xe"}</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="p-space-md">
<div className="font-label-lg text-label-lg text-primary">{"SUV & MPV 7 Chỗ Gia Đình"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Carnival, Santa Fe, Xpander, Fortuner"}</div>
</td>
<td className="p-space-md">
<div className="font-body-md text-body-md">{"7 Chỗ Rộng Rãi"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Dầu / Xăng (Turbo)"}</div>
</td>
<td className="p-space-md font-label-lg text-label-lg text-primary">{"1.000.000₫ - 1.800.000₫"}</td>
<td className="p-space-md font-label-lg text-label-lg text-secondary">{"1.350.000₫ - 2.150.000₫"}</td>
<td className="p-space-md font-label-lg text-label-lg text-on-surface">{"22.000.000₫ - 35.000.000₫"}</td>
<td className="p-space-md text-center">
<button className="px-space-md py-1 rounded-full bg-surface-variant hover:bg-primary hover:text-on-primary font-label-md text-label-md text-primary transition-all" type="button" data-action="book">{"Chọn Xe"}</button>
</td>
</tr>

<tr className="hover:bg-surface-tint/60 transition-colors bg-surface-tint/30">
<td className="p-space-md">
<div className="flex items-center gap-1 font-label-lg text-label-lg text-primary">
<span>{"VinFast Xe Điện Xanh"}</span>
<span className="material-symbols-outlined text-[16px] text-status-success">{"eco"}</span>
</div>
<div className="font-body-sm text-body-sm text-text-muted">{"VF 5, VF e34, VF 6, VF 8, VF 9"}</div>
</td>
<td className="p-space-md">
<div className="font-body-md text-body-md">{"5 - 7 Chỗ"}</div>
<div className="font-body-sm text-body-sm text-status-success font-medium">{"100% Điện Pin"}</div>
</td>
<td className="p-space-md font-label-lg text-label-lg text-primary">{"750.000₫ - 1.400.000₫"}</td>
<td className="p-space-md font-label-lg text-label-lg text-secondary">{"1.100.000₫ - 1.750.000₫"}</td>
<td className="p-space-md font-label-lg text-label-lg text-on-surface">{"16.000.000₫ - 29.000.000₫"}</td>
<td className="p-space-md text-center">
<button className="px-space-md py-1 rounded-full bg-primary text-on-primary font-label-md text-label-md transition-all shadow-sm" type="button" data-action="book">{"Đặt Xe Xanh"}</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="p-space-md">
<div className="font-label-lg text-label-lg text-primary">{"Sedan Hạng Sang Doanh Nhân"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Mercedes C200/E300, BMW 5-Series"}</div>
</td>
<td className="p-space-md">
<div className="font-body-md text-body-md">{"4 - 5 Chỗ Luxury"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Ghế da Nappa / Massage"}</div>
</td>
<td className="p-space-md font-label-lg text-label-lg text-primary">{"Từ 2.200.000₫"}</td>
<td className="p-space-md font-label-lg text-label-lg text-secondary">{"Từ 2.650.000₫"}</td>
<td className="p-space-md font-label-lg text-label-lg text-on-surface">{"Từ 44.000.000₫"}</td>
<td className="p-space-md text-center">
<button className="px-space-md py-1 rounded-full bg-surface-variant hover:bg-primary hover:text-on-primary font-label-md text-label-md text-primary transition-all" type="button" data-action="book">{"Chọn Xe"}</button>
</td>
</tr>
</tbody>
</table></div>
</div>
</div>
</section>

<section className="w-full bg-surface py-space-2xl">
<div className="max-w-[1240px] mx-auto px-margin flex flex-col gap-space-xl">
<div className="max-w-2xl">
<span className="font-label-md text-label-md text-secondary uppercase font-semibold">{"Không Ẩn Phí - Không Bất Ngờ"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary">{"Bảng Phụ Phí Niêm Yết Minh Bạch"}</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant mt-space-xs">{"\n          Mọi khoản phí phát sinh trong hành trình đều được hiển thị minh bạch trong ứng dụng và hợp đồng thuê xe trước khi quý khách nhận xe.\n        "}</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">

<div className="bg-surface-container p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-full bg-surface-tint flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[24px]">{"airline_seat_recline_normal"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">{"Phụ Thu Tài Xế Riêng"}</h3>
<div className="font-price-display text-price-display text-primary mt-space-xs">{"350.000₫ "}<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span></div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">{"\n              Tài xế chuyên nghiệp 5+ năm kinh nghiệm, lịch sự, đúng giờ. Khung làm việc tiêu chuẩn 10 tiếng/ngày (VD: 07:00 - 17:00).\n            "}</p>
</div>
<div className="mt-space-md pt-space-xs bg-surface-container-low p-space-xs rounded font-label-md text-label-md text-text-muted">{"\n            Qua đêm tỉnh: +300.000₫/đêm\n          "}</div>
</div>

<div className="bg-surface-container p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-full bg-surface-tint flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[24px]">{"speed"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">{"Phụ Trội Kilomet (Km)"}</h3>
<div className="font-price-display text-price-display text-primary mt-space-xs">{"3.000₫ - 5.000₫ "}<span className="font-body-sm text-body-sm text-text-muted">{"/ km"}</span></div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">{"\n              Hạn mức tiêu chuẩn tự lái là 300km/ngày hoặc 400km/ngày tùy phân khúc. Chỉ tính phí khi vượt quá hạn mức cam kết.\n            "}</p>
</div>
<div className="mt-space-md pt-space-xs bg-surface-container-low p-space-xs rounded font-label-md text-label-md text-text-muted">{"\n            Theo dõi km chuẩn xác qua ODO xe\n          "}</div>
</div>

<div className="bg-surface-container p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-full bg-surface-tint flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[24px]">{"more_time"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">{"Phụ Trội Giờ Trả Xe"}</h3>
<div className="font-price-display text-price-display text-primary mt-space-xs">{"80.000₫ - 120.000₫ "}<span className="font-body-sm text-body-sm text-text-muted">{"/ giờ"}</span></div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">{"\n              Miễn phí trễ 30 phút đầu tiên. Trả trễ trên 5 tiếng sẽ tự động tính thành 1 ngày thuê mới để đảm bảo lịch trình khách kế tiếp.\n            "}</p>
</div>
<div className="mt-space-md pt-space-xs bg-surface-container-low p-space-xs rounded font-label-md text-label-md text-text-muted">{"\n            Miễn phí 30 phút ân hạn ban đầu\n          "}</div>
</div>

<div className="bg-surface-container p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-full bg-surface-tint flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[24px]">{"local_shipping"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">{"Giao Xe Tận Nhà Theo Cự Ly"}</h3>
<div className="font-price-display text-price-display text-primary mt-space-xs">{"15.000₫ "}<span className="font-body-sm text-body-sm text-text-muted">{"/ km phát sinh"}</span></div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">{"\n              Miễn phí trong bán kính 5km tính từ kho bãi Kanow gần nhất. Giao nhận sân bay Tân Sơn Nhất / Nội Bài trọn gói 150.000₫/lượt.\n            "}</p>
</div>
<div className="mt-space-md pt-space-xs bg-surface-container-low p-space-xs rounded font-label-md text-label-md text-text-muted">{"\n            Bán kính < 5km: Hoàn toàn 0đ\n          "}</div>
</div>
</div>

<div className="bg-surface-container p-space-lg md:p-space-xl rounded-xl shadow-sm flex flex-col lg:flex-row items-center justify-between gap-space-lg">
<div className="flex flex-col gap-space-xs max-w-xl">
<div className="flex items-center gap-space-xs text-primary font-label-lg text-label-lg">
<span className="material-symbols-outlined text-secondary">{"calculate"}</span>
<span>{"Dự Toán Nhanh Chi Phí Thuê Xe"}</span>
</div>
<h4 className="font-headline-md text-headline-md text-on-surface">{"Tính tổng chi phí ước tính theo nhu cầu di chuyển"}</h4>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n            Chọn số ngày bạn muốn thuê để xem mức chiết khấu áp dụng tự động cho hành trình của bạn.\n          "}</p>
</div>
<div className="flex flex-wrap items-center gap-space-md w-full lg:w-auto">
<div className="flex flex-col gap-1">
<label className="font-label-md text-label-md text-text-muted">{"Số ngày thuê:"}</label>
<div className="flex items-center bg-surface-container-low rounded-full p-1 shadow-inner">
<button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary shadow-sm hover:bg-surface-container-high" type="button" data-handler="adjustCalcDays" data-args="-1">{"-"}</button>
<span className="px-space-md font-price-display text-price-display text-primary" id="calcDaysDisplay">{"7"}</span>
<button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary shadow-sm hover:bg-surface-container-high" type="button" data-handler="adjustCalcDays" data-args="1">{"+"}</button>
</div>
</div>
<div className="flex flex-col gap-1">
<label className="font-label-md text-label-md text-text-muted">{"Phân khúc xe mẫu:"}</label>
<select className="px-space-md py-space-xs rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md focus:outline-none" id="calcSegmentSelect" defaultValue="1100000">
<option value="800000">{"Sedan 4-5 Chỗ (~800k/ngày)"}</option>
<option value="1100000">{"SUV 5 Chỗ Gầm Cao (~1.1tr/ngày)"}</option>
<option value="1400000">{"7 Chỗ Gia Đình (~1.4tr/ngày)"}</option>
<option value="950000">{"VinFast Xe Điện (~950k/ngày)"}</option>
<option value="2300000">{"Hạng Sang VIP (~2.3tr/ngày)"}</option>
</select>
</div>
<div className="p-space-md bg-surface-tint rounded-xl flex flex-col justify-center min-w-[200px]">
<span className="font-body-sm text-body-sm text-text-muted" id="discountNote">{"Ưu đãi tuần (-10%):"}</span>
<div className="font-price-display text-price-display text-primary" id="estimatedTotal">{"6.930.000₫"}</div>
<span className="font-label-md text-label-md text-status-success font-medium" id="savedAmount">{"Tiết kiệm: 770.000₫"}</span>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface-canvas py-space-2xl" id="enterpriseConsult">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">

<div className="lg:col-span-7 flex flex-col gap-space-lg">
<div className="flex flex-col gap-space-xs">
<span className="font-label-md text-label-md text-secondary uppercase font-semibold">{"Dành Riêng Cho Khách Hàng Doanh Nghiệp"}</span>
<h2 className="font-display-hero text-headline-lg lg:text-display-hero text-primary">{"Giải Pháp Quản Trị Đội Xe Dài Hạn"}</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">{"\n              Tối ưu hóa bảng cân đối kế toán, không lo chi phí khấu hao, bảo dưỡng xe định kỳ hay chi phí nhân sự lái xe. Kanow cung cấp hợp đồng theo quý, năm linh động cùng đầy đủ hóa đơn chứng từ hợp lệ.\n            "}</p>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
<div className="flex items-start gap-space-sm p-space-md bg-surface-container rounded-xl shadow-sm">
<span className="material-symbols-outlined text-secondary text-[24px]">{"receipt_long"}</span>
<div>
<h4 className="font-label-lg text-label-lg text-on-surface">{"Xuất Hóa Đơn VAT Đầy Đủ"}</h4>
<p className="font-body-sm text-body-sm text-text-muted">{"Hóa đơn điện tử hợp lệ 100% trong vòng 24 giờ sau ký kết."}</p>
</div>
</div>
<div className="flex items-start gap-space-sm p-space-md bg-surface-container rounded-xl shadow-sm">
<span className="material-symbols-outlined text-secondary text-[24px]">{"car_repair"}</span>
<div>
<h4 className="font-label-lg text-label-lg text-on-surface">{"Xe Thay Thế Tức Thì"}</h4>
<p className="font-body-sm text-body-sm text-text-muted">{"Đổi xe tương đương trong 2 giờ nếu phát sinh bảo dưỡng định kỳ."}</p>
</div>
</div>
<div className="flex items-start gap-space-sm p-space-md bg-surface-container rounded-xl shadow-sm">
<span className="material-symbols-outlined text-secondary text-[24px]">{"badge"}</span>
<div>
<h4 className="font-label-lg text-label-lg text-on-surface">{"Đội Tài Xế Doanh Nhân"}</h4>
<p className="font-body-sm text-body-sm text-text-muted">{"Tài xế mặc suit chỉnh tề, bảo mật thông tin chuyến đi tuyệt đối."}</p>
</div>
</div>
<div className="flex items-start gap-space-sm p-space-md bg-surface-container rounded-xl shadow-sm">
<span className="material-symbols-outlined text-secondary text-[24px]">{"price_change"}</span>
<div>
<h4 className="font-label-lg text-label-lg text-on-surface">{"Công Nợ Linh Hoạt 30 Ngày"}</h4>
<p className="font-body-sm text-body-sm text-text-muted">{"Thanh toán chuyển khoản cuối tháng cho các hợp đồng khung."}</p>
</div>
</div>
</div>
<div className="flex flex-wrap items-center gap-space-md pt-space-xs">
<button className="flex items-center gap-space-xs px-space-xl py-space-sm rounded-full bg-secondary text-on-secondary font-label-lg text-label-lg hover:bg-on-secondary-container shadow-md transition-all active:scale-95" type="button" data-handler="downloadPdfSimulate" data-args="">
<span className="material-symbols-outlined text-[20px]">{"download"}</span>
<span>{"Tải Bảng Báo Giá Chi Tiết (PDF)"}</span>
</button>
<span className="font-body-sm text-body-sm text-text-muted">{"Bản cập nhật quý 1/2025 • Dung lượng 2.4 MB"}</span>
</div>
</div>

<div className="lg:col-span-5 bg-surface-container p-space-xl rounded-2xl shadow-lg relative">
<div className="flex items-center gap-space-xs mb-space-sm">
<span className="material-symbols-outlined text-secondary">{"mark_email_read"}</span>
<span className="font-label-lg text-label-lg text-primary">{"Liên Hệ Báo Giá Doanh Nghiệp"}</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-space-sm">{"Nhận Tư Vấn Trong 15 Phút"}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">{"\n            Để lại thông tin để chuyên viên Kanow Enterprise gửi phương án xe và biểu giá ưu đãi nhất cho doanh nghiệp của bạn.\n          "}</p>
<form className="flex flex-col gap-space-md" id="enterpriseForm">
<div>
<label className="font-label-md text-label-md text-on-surface block mb-1">{"Tên Doanh Nghiệp / Tổ Chức *"}</label>
<input className="w-full px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-tint transition-all" placeholder="VD: Tập đoàn Sunshine Việt Nam" required={true} type="text" aria-label="VD: Tập đoàn Sunshine Việt Nam" />
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
<div>
<label className="font-label-md text-label-md text-on-surface block mb-1">{"Người Liên Hệ *"}</label>
<input className="w-full px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-tint transition-all" placeholder="Nguyễn Văn A" required={true} type="text" aria-label="Nguyễn Văn A" />
</div>
<div>
<label className="font-label-md text-label-md text-on-surface block mb-1">{"Số Điện Thoại *"}</label>
<input className="w-full px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-tint transition-all" placeholder="0901 234 567" required={true} type="tel" aria-label="0901 234 567" />
</div>
</div>
<div>
<label className="font-label-md text-label-md text-on-surface block mb-1">{"Nhu Cầu Số Lượng & Loại Xe"}</label>
<select className="w-full px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none">
<option>{"Từ 1 - 3 xe (Theo tháng / năm)"}</option>
<option>{"Từ 4 - 10 xe (Đội xe cho chuyên gia)"}</option>
<option>{"Trên 10 xe (Dự án doanh nghiệp quy mô lớn)"}</option>
<option>{"Thuê trọn gói xe kèm tài xế VIP"}</option>
</select>
</div>
<button className="w-full py-space-md rounded-full bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-space-xs mt-space-xs" type="submit">
<span className="material-symbols-outlined text-[20px]">{"send"}</span>
<span>{"Gửi Yêu Cầu Báo Giá Nhanh"}</span>
</button>
<div className="hidden p-space-sm rounded-lg bg-status-success/20 text-on-background font-body-sm text-body-sm text-center" id="submitSuccessAlert">{"\n              ✓ Yêu cầu đã được gửi. Chuyên viên Kanow sẽ liên hệ với bạn trong 15 phút!\n            "}</div>
</form>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface py-space-2xl">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="text-center max-w-xl mx-auto mb-space-xl">
<span className="font-label-md text-label-md text-secondary uppercase font-semibold">{"Giải Đáp Thắc Mắc"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary">{"Các Câu Hỏi Về Bảng Giá & Thủ Tục Thuê"}</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md max-w-4xl mx-auto">
<div className="bg-surface-container p-space-lg rounded-xl shadow-sm">
<h4 className="font-label-lg text-label-lg text-primary mb-space-xs flex items-center gap-space-xs">
<span className="material-symbols-outlined text-secondary">{"help"}</span>
<span>{"Giá trên web đã bao gồm VAT chưa?"}</span>
</h4>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n            Giá hiển thị cho thuê tự lái và xe kèm tài xế là giá niêm yết cho khách hàng cá nhân. Nếu quý khách là doanh nghiệp cần xuất hóa đơn tài chính VAT, mức thuế suất hiện hành (8% hoặc 10%) sẽ được cộng thêm trên hóa đơn.\n          "}</p>
</div>
<div className="bg-surface-container p-space-lg rounded-xl shadow-sm">
<h4 className="font-label-lg text-label-lg text-primary mb-space-xs flex items-center gap-space-xs">
<span className="material-symbols-outlined text-secondary">{"help"}</span>
<span>{"Thủ tục đặt cọc xe tự lái gồm những gì?"}</span>
</h4>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n            Kanow áp dụng quy trình xác thực số hiện đại qua VNeID. Khách hàng chỉ cần CCCD gắn chip và Giấy phép lái xe B2 hợp lệ. Bạn có thể chọn thế chấp xe máy chính chủ hoặc cọc tiền mặt linh hoạt (từ 10.000.000đ - hoàn lại khi trả xe).\n          "}</p>
</div>
<div className="bg-surface-container p-space-lg rounded-xl shadow-sm">
<h4 className="font-label-lg text-label-lg text-primary mb-space-xs flex items-center gap-space-xs">
<span className="material-symbols-outlined text-secondary">{"help"}</span>
<span>{"Thuê xe điện VinFast sạc pin như thế nào?"}</span>
</h4>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n            Toàn bộ xe điện Kanow bàn giao đều có dung lượng pin tối thiểu 80%. Bạn có thể sạc tiện lợi tại hàng nghìn trạm sạc V-GREEN trên toàn quốc hoặc cắm sạc dự phòng dân dụng 220V do Kanow trang bị sẵn trong cốp xe.\n          "}</p>
</div>
<div className="bg-surface-container p-space-lg rounded-xl shadow-sm">
<h4 className="font-label-lg text-label-lg text-primary mb-space-xs flex items-center gap-space-xs">
<span className="material-symbols-outlined text-secondary">{"help"}</span>
<span>{"Nếu huỷ chuyến đi thì hoàn tiền ra sao?"}</span>
</h4>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n            Miễn phí 100% khi thông báo hủy trước giờ nhận xe tối thiểu 24 tiếng. Hủy trong vòng 12 - 24 tiếng được hoàn 70% giá trị cọc. Quy trình hoàn tiền tự động qua chuyển khoản trong 24 giờ làm việc.\n          "}</p>
</div>
</div>
</div>
</section>


</div></main>
  );
}
