import Link from "next/link";

export default function Chauffeur() {
  return (
<main className="w-full pt-20 bg-surface"><div className="flex flex-col w-full">

<section className="relative w-full -mt-20 overflow-hidden bg-primary pt-28 pb-36 text-on-primary">

<div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
<div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-primary-container/60 blur-2xl pointer-events-none"></div>
<div className="relative max-w-[1240px] mx-auto px-margin grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
<div className="lg:col-span-7 flex flex-col gap-space-md z-10">
<div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-low/10 text-on-primary font-label-md text-label-md w-fit backdrop-blur-md">
<span className="material-symbols-outlined text-[16px] text-tertiary-fixed">{"verified_user"}</span>
<span className="">{"Dịch Vụ Vận Chuyển VIP & Lái Hộ Văn Minh"}</span>
</div>
<h1 className="font-display-hero text-display-hero text-on-primary tracking-tight">{"\n          Xe Kèm Tài Xế Riêng &"}<br />
<span className="text-secondary-fixed">{"Tài Xế Lái Hộ"}</span>{" Tận Tâm\n        "}</h1>
<p className="font-body-lg text-body-lg text-on-primary-container max-w-xl">{"\n          Thư thái tận hưởng chuyến đi, công tác, đón tiễn sân bay hay đi tỉnh. Không lo mệt mỏi đường dài, áp lực giao thông hay say xỉn sau tiệc với đội ngũ tài xế Kanow tác phong chuẩn mực.\n        "}</p>
<div className="flex flex-wrap items-center gap-space-lg pt-space-xs text-on-primary font-label-md text-label-md">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-secondary-fixed text-[20px]">{"check_circle"}</span>
<span className="">{"Miễn phí chờ sân bay 60 phút"}</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-secondary-fixed text-[20px]">{"check_circle"}</span>
<span className="">{"Bảo hiểm chuyến đi đến 2 tỷ"}</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-secondary-fixed text-[20px]">{"check_circle"}</span>
<span className="">{"Giá trọn gói, không ẩn phí"}</span>
</div>
</div>
</div>
<div className="lg:col-span-5 relative mt-space-lg lg:mt-0">
<div className="relative rounded-2xl overflow-hidden shadow-2xl bg-surface-container">
<img className="w-full h-[380px] object-cover" src="/images/280a0ec223dd1644.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex flex-col justify-end p-space-lg text-inverse-on-surface">
<div className="flex items-center justify-between">
<div>
<p className="font-label-lg text-label-lg text-on-secondary">{"Tiêu chuẩn Kanow Chauffeur"}</p>
<p className="font-body-sm text-body-sm text-surface-variant">{"Lái xe an toàn • Lịch sự • Đúng hẹn tuyệt đối"}</p>
</div>
<div className="flex items-center gap-1 bg-surface-container/20 px-space-sm py-1 rounded-full backdrop-blur-md">
<span className="material-symbols-outlined text-tertiary-fixed text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="font-label-md text-label-md text-on-secondary">{"4.98/5.0"}</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="max-w-[1240px] mx-auto px-margin w-full -mt-16 z-20">
<div className="bg-surface-container rounded-2xl shadow-xl overflow-hidden">

<div className="flex flex-wrap bg-surface-container-high text-on-surface">
<button className="flex-1 py-space-md px-space-lg flex items-center justify-center gap-space-xs font-label-lg text-label-lg bg-surface-container text-primary transition-all" id="tab-rental" type="button" data-handler="switchBookingMode" data-args="'rental'">
<span className="material-symbols-outlined text-[20px]">{"airport_shuttle"}</span>
<span className="">{"Thuê Trọn Gói (Xe + Tài Xế)"}</span>
</button>
<button className="flex-1 py-space-md px-space-lg flex items-center justify-center gap-space-xs font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-all" id="tab-driver-only" type="button" data-handler="switchBookingMode" data-args="'driver-only'">
<span className="material-symbols-outlined text-[20px]">{"sports_motorsports"}</span>
<span className="">{"Đặt Tài Xế Lái Hộ Xe Của Bạn (Say Xỉn / Đi Tỉnh)"}</span>
</button>
</div>

<div className="p-space-lg md:p-space-xl">

<div className="flex flex-wrap items-center gap-space-sm mb-space-lg" id="sub-service-types">
<button className="px-space-md py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md transition-all sub-btn" data-type="airport" type="button">{"Đưa đón sân bay"}</button>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-high text-on-surface-variant hover:text-primary font-label-md text-label-md transition-all sub-btn" data-type="city" type="button">{"Nội thành (Theo giờ 4h / 8h)"}</button>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-high text-on-surface-variant hover:text-primary font-label-md text-label-md transition-all sub-btn" data-type="provincial" type="button">{"Đi liên tỉnh (1 chiều / Khứ hồi)"}</button>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md items-end">

<div className="flex flex-col gap-space-xs">
<label className="font-label-md text-label-md text-text-muted flex items-center gap-1">
<span className="material-symbols-outlined text-primary text-[16px]">{"location_on"}</span>
<span className="">{"Điểm đón khách"}</span>
</label>
<div className="bg-surface-container-low rounded-xl px-space-md py-space-sm flex items-center gap-space-xs">
<input className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none placeholder:text-text-muted" placeholder="Nhập địa chỉ nhà riêng, khách sạn..." type="text" defaultValue="Hà Nội - Quận Hoàn Kiếm" aria-label="Nhập địa chỉ nhà riêng, khách sạn..." />
</div>
</div>

<div className="flex flex-col gap-space-xs">
<label className="font-label-md text-label-md text-text-muted flex items-center gap-1">
<span className="material-symbols-outlined text-primary text-[16px]">{"flag"}</span>
<span id="label-destination" className="">{"Điểm đến"}</span>
</label>
<div className="bg-surface-container-low rounded-xl px-space-md py-space-sm flex items-center gap-space-xs">
<input className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none placeholder:text-text-muted" id="input-destination" placeholder="Sân bay Nội Bài / Khách sạn..." type="text" defaultValue="Sân bay Quốc tế Nội Bài (Ga T1/T2)" aria-label="Sân bay Nội Bài / Khách sạn..." />
</div>
</div>

<div className="flex flex-col gap-space-xs">
<label className="font-label-md text-label-md text-text-muted flex items-center gap-1">
<span className="material-symbols-outlined text-primary text-[16px]">{"schedule"}</span>
<span className="">{"Thời gian khởi hành"}</span>
</label>
<div className="bg-surface-container-low rounded-xl px-space-md py-space-sm flex items-center justify-between">
<span className="font-body-md text-body-md text-on-surface">{"Hôm nay, 08:30 sáng"}</span>
<span className="material-symbols-outlined text-text-muted text-[18px]">{"calendar_month"}</span>
</div>
</div>

<div className="flex flex-col gap-space-xs">
<button className="w-full py-3.5 px-space-lg rounded-full bg-tertiary-container hover:bg-tertiary text-on-tertiary font-label-lg text-label-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-space-xs" type="button" data-action="book">
<span className="material-symbols-outlined text-[20px]">{"search"}</span>
<span className="">{"Báo Giá & Đặt Xe"}</span>
</button>
</div>
</div>

<div className="mt-space-md pt-space-md flex flex-wrap items-center justify-between gap-space-sm text-text-muted font-body-sm text-body-sm">
<div className="flex items-center gap-space-md">
<span className="flex items-center gap-1 text-on-surface">
<span className="material-symbols-outlined text-status-success text-[16px]">{"toll"}</span>{" Phí cầu đường cao tốc: Đã gồm\n            "}</span>
<span className="flex items-center gap-1 text-on-surface">
<span className="material-symbols-outlined text-status-success text-[16px]">{"schedule"}</span>{" Miễn phí huỷ trước 4h\n            "}</span>
<span className="flex items-center gap-1 text-on-surface">
<span className="material-symbols-outlined text-status-success text-[16px]">{"receipt_long"}</span>{" Hỗ trợ xuất VAT điện tử\n            "}</span>
</div>
<div className="font-label-md text-label-md text-primary">{"\n            Cần tư vấn đoàn đông? Gọi "}<a className="underline font-bold" href="tel:19008888">{"1900 8888"}</a>
</div>
</div>
</div>
</div>
</section>

<section className="max-w-[1240px] mx-auto px-margin pt-space-2xl pb-space-xl w-full">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-md">
<div>
<span className="text-secondary font-label-lg text-label-lg uppercase tracking-wider">{"Chuẩn mực dịch vụ"}</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface mt-space-xs">{"Cam Kết Tiêu Chuẩn Tài Xế Kanow"}</h2>
</div>
<p className="font-body-md text-body-md text-text-muted max-w-md">{"\n        Khác biệt hoàn toàn với dịch vụ đặt xe thông thường, mỗi chuyến đi là một trải nghiệm nghỉ ngơi an tĩnh, tôn trọng sự riêng tư và bảo đảm an toàn chuẩn mực.\n      "}</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">

<div className="p-space-lg rounded-2xl bg-surface-container shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-xl bg-surface-tint flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[28px]">{"badge"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">{"100% Xác Minh Lý Lịch"}</h3>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n            Hồ sơ tư pháp trong sạch, giấy phép lái xe hợp lệ từ 5 năm trở lên, trải qua bài kiểm tra sức khoẻ định kỳ và kiểm định ma túy nghiêm ngặt.\n          "}</p>
</div>
<div className="mt-space-md pt-space-md flex items-center text-text-muted font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px] text-status-success mr-1">{"task_alt"}</span>{" An toàn tối đa\n        "}</div>
</div>

<div className="p-space-lg rounded-2xl bg-surface-container shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-xl bg-surface-tint flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[28px]">{"dry_cleaning"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">{"Tác Phong Sơ Mi Lịch Thiệp"}</h3>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n            Đồng phục sơ mi là ủi phẳng phiu, mở cửa xe hỗ trợ hành lý, ứng xử nhã nhặn, tôn trọng tuyệt đối không gian trao đổi công việc của hành khách.\n          "}</p>
</div>
<div className="mt-space-md pt-space-md flex items-center text-text-muted font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px] text-status-success mr-1">{"task_alt"}</span>{" Lịch sự chuẩn VIP\n        "}</div>
</div>

<div className="p-space-lg rounded-2xl bg-surface-container shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-xl bg-surface-tint flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[28px]">{"smoke_free"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">{"Xe Sạch Không Mùi Thuốc"}</h3>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n            Tài xế tuyệt đối không hút thuốc trong và ngoài xe trước khi đón khách. Nội thất luôn được khử khuẩn, thơm tho dịu nhẹ tinh dầu bưởi/quế thiên nhiên.\n          "}</p>
</div>
<div className="mt-space-md pt-space-md flex items-center text-text-muted font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px] text-status-success mr-1">{"task_alt"}</span>{" Thoải mái không say xe\n        "}</div>
</div>

<div className="p-space-lg rounded-2xl bg-surface-container shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-xl bg-surface-tint flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[28px]">{"explore"}</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">{"Am Hiểu Tuyến Điểm Du Lịch"}</h3>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n            Nắm vững cung đường tắt tránh kẹt xe, gợi ý quán ăn địa phương chuẩn vị, kinh nghiệm xử lý đèo dốc mềm mại cho người già và trẻ nhỏ.\n          "}</p>
</div>
<div className="mt-space-md pt-space-md flex items-center text-text-muted font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px] text-status-success mr-1">{"task_alt"}</span>{" Trợ thủ đường trường\n        "}</div>
</div>
</div>
</section>

<section className="w-full bg-surface-container-low py-space-2xl">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="text-center max-w-2xl mx-auto mb-space-2xl"><span className="text-secondary font-label-lg text-label-lg uppercase tracking-wider">{"Đội xe & Bác tài trực tiếp"}</span><h2 className="font-headline-lg text-headline-lg text-on-surface mt-space-xs">{"Xe Kèm Tài Xế Phụ Trách Tiêu Biểu"}</h2><p className="font-body-md text-body-md text-text-muted mt-space-xs">{"Xem trước diện mạo chiếc xe thực tế cùng lý lịch, kinh nghiệm của chính bác tài sẽ đồng hành phục vụ bạn."}</p></div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter"><div className="rounded-2xl bg-surface-container shadow-md overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all border-subtle" data-vehicle-card="sedan" data-vehicle-name="Toyota Camry 2.5Q 2024" data-price="850000"><div className="relative"><div className="relative h-48 overflow-hidden bg-surface-container-high"><img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/7e372aa4abc7ea87.webp" alt="Toyota Camry 2.5Q 2024" loading="lazy" decoding="async" /><div className="absolute top-3 left-3 bg-primary text-on-primary px-space-sm py-0.5 rounded-full font-label-md text-label-md text-[11px]">{"Đen Luxury"}</div></div><div className="absolute -bottom-6 right-3 flex items-center gap-1.5 bg-surface-container p-1 rounded-full shadow-md"><img className="w-10 h-10 rounded-full object-cover border-subtle" src="/images/a5f7a760522f6e6b.webp" alt="Tài xế Trần Minh Tuấn" loading="lazy" decoding="async" /></div></div><div className="p-space-md pt-space-lg flex flex-col gap-space-xs flex-1 justify-between"><div><div className="flex items-center gap-1 text-tertiary-container font-label-md text-label-md"><span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span><span className="">{"4.98"}</span><span className="text-text-muted text-[11px]">{"(640+ chuyến)"}</span></div><h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">{"Toyota Camry 2.5Q 2024"}</h3><div className="mt-space-xs p-2 rounded-xl bg-surface-tint flex flex-col gap-0.5"><div className="flex items-center gap-1 font-label-md text-label-md text-primary"><span className="material-symbols-outlined text-[16px]">{"person_pin"}</span><span className="">{"Tài xế: Trần Minh Tuấn"}</span></div><p className="font-body-sm text-body-sm text-on-surface-variant">{"9 năm kinh nghiệm • Tiếng Anh tốt • Đón sân bay & VIP chuẩn mực"}</p></div></div><div className="pt-space-sm border-b border-subtle pb-space-sm"><div className="flex items-baseline justify-between"><span className="font-body-sm text-body-sm text-text-muted">{"Nửa ngày (4h):"}</span><span className="font-price-display text-price-display text-primary text-[16px]">{"850.000₫"}</span></div><div className="flex items-baseline justify-between mt-1"><span className="font-body-sm text-body-sm text-text-muted">{"Trọn gói cả ngày:"}</span><span className="font-price-display text-price-display text-primary">{"1.400.000₫"}</span></div></div><div className="flex gap-space-xs pt-space-xs"><button className="flex-1 py-2 px-space-xs rounded-full bg-surface-container-high hover:bg-surface-tint text-on-surface font-label-md text-label-md transition-all text-center" type="button" data-action="driver">{"Hồ sơ tài xế"}</button><button className="flex-1 py-2 px-space-xs rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm text-center" type="button" data-action="book">{"Đặt xe ngay"}</button></div></div></div><div className="rounded-2xl bg-surface-container shadow-md overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all border-subtle" data-vehicle-card="suv" data-vehicle-name="Kia Carnival Signature" data-price="1600000"><div className="relative"><div className="relative h-48 overflow-hidden bg-surface-container-high"><img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/b04ee5b0c25b865a.webp" alt="Kia Carnival Signature 2024" loading="lazy" decoding="async" /><div className="absolute top-3 left-3 bg-secondary-container text-on-secondary-fixed px-space-sm py-0.5 rounded-full font-label-md text-label-md text-[11px]">{"Trắng Ngọc Trai"}</div></div><div className="absolute -bottom-6 right-3 flex items-center gap-1.5 bg-surface-container p-1 rounded-full shadow-md"><img className="w-10 h-10 rounded-full object-cover border-subtle" src="/images/26713b016bb4856a.webp" alt="Tài xế Phạm Đức Thắng" loading="lazy" decoding="async" /></div></div><div className="p-space-md pt-space-lg flex flex-col gap-space-xs flex-1 justify-between"><div><div className="flex items-center gap-1 text-tertiary-container font-label-md text-label-md"><span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span><span className="">{"4.97"}</span><span className="text-text-muted text-[11px]">{"(510+ chuyến)"}</span></div><h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">{"Kia Carnival Signature"}</h3><div className="mt-space-xs p-2 rounded-xl bg-surface-tint flex flex-col gap-0.5"><div className="flex items-center gap-1 font-label-md text-label-md text-primary"><span className="material-symbols-outlined text-[16px]">{"person_pin"}</span><span className="">{"Tài xế: Phạm Đức Thắng"}</span></div><p className="font-body-sm text-body-sm text-on-surface-variant">{"6 năm kinh nghiệm • Am hiểu cung đường du lịch & hỗ trợ gia đình"}</p></div></div><div className="pt-space-sm border-b border-subtle pb-space-sm"><div className="flex items-baseline justify-between"><span className="font-body-sm text-body-sm text-text-muted">{"Dòng xe:"}</span><span className="font-body-sm text-body-sm text-on-surface font-medium">{"7 Chỗ Khoang Hạng Nhất"}</span></div><div className="flex items-baseline justify-between mt-1"><span className="font-body-sm text-body-sm text-text-muted">{"Trọn gói 1 ngày:"}</span><span className="font-price-display text-price-display text-primary">{"1.600.000₫"}</span></div></div><div className="flex gap-space-xs pt-space-xs"><button className="flex-1 py-2 px-space-xs rounded-full bg-surface-container-high hover:bg-surface-tint text-on-surface font-label-md text-label-md transition-all text-center" type="button" data-action="driver">{"Hồ sơ tài xế"}</button><button className="flex-1 py-2 px-space-xs rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm text-center" type="button" data-action="book">{"Đặt xe ngay"}</button></div></div></div><div className="rounded-2xl bg-surface-container shadow-md overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all border-subtle" data-vehicle-card="luxury" data-vehicle-name="Mercedes-Benz E300 AMG" data-price="2400000"><div className="relative"><div className="relative h-48 overflow-hidden bg-surface-container-high"><img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/280a0ec223dd1644.webp" alt="Mercedes-Benz E300 AMG 2024" loading="lazy" decoding="async" /><div className="absolute top-3 left-3 bg-inverse-surface text-inverse-on-surface px-space-sm py-0.5 rounded-full font-label-md text-label-md text-[11px]">{"Đen Obsidian"}</div></div><div className="absolute -bottom-6 right-3 flex items-center gap-1.5 bg-surface-container p-1 rounded-full shadow-md"><img className="w-10 h-10 rounded-full object-cover border-subtle" src="/images/5f47319e2e1913c1.webp" alt="Tài xế Nguyễn Văn Hùng" loading="lazy" decoding="async" /></div></div><div className="p-space-md pt-space-lg flex flex-col gap-space-xs flex-1 justify-between"><div><div className="flex items-center gap-1 text-tertiary-container font-label-md text-label-md"><span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span><span className="">{"4.99"}</span><span className="text-text-muted text-[11px]">{"(820+ chuyến)"}</span></div><h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">{"Mercedes-Benz E300 AMG"}</h3><div className="mt-space-xs p-2 rounded-xl bg-surface-tint flex flex-col gap-0.5"><div className="flex items-center gap-1 font-label-md text-label-md text-primary"><span className="material-symbols-outlined text-[16px]">{"person_pin"}</span><span className="">{"Tài xế: Nguyễn Văn Hùng"}</span></div><p className="font-body-sm text-body-sm text-on-surface-variant">{"11 năm kinh nghiệm • Nguyên tài xế đoàn ngoại giao • Chuẩn 5 sao"}</p></div></div><div className="pt-space-sm border-b border-subtle pb-space-sm"><div className="flex items-baseline justify-between"><span className="font-body-sm text-body-sm text-text-muted">{"Dòng xe:"}</span><span className="font-body-sm text-body-sm text-on-surface font-medium">{"Sedan Hạng Sang Đức"}</span></div><div className="flex items-baseline justify-between mt-1"><span className="font-body-sm text-body-sm text-text-muted">{"Trọn gói 1 ngày:"}</span><span className="font-price-display text-price-display text-primary">{"2.400.000₫"}</span></div></div><div className="flex gap-space-xs pt-space-xs"><button className="flex-1 py-2 px-space-xs rounded-full bg-surface-container-high hover:bg-surface-tint text-on-surface font-label-md text-label-md transition-all text-center" type="button" data-action="driver">{"Hồ sơ tài xế"}</button><button className="flex-1 py-2 px-space-xs rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm text-center" type="button" data-action="book">{"Đặt xe ngay"}</button></div></div></div><div className="rounded-2xl bg-surface-container shadow-md overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all border-subtle" data-vehicle-card="ev" data-vehicle-name="VinFast VF 8 Plus 2024" data-price="1250000"><div className="relative"><div className="relative h-48 overflow-hidden bg-surface-container-high"><img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/9e36a391c3d8554d.webp" alt="VinFast VF 8 Plus 2024" loading="lazy" decoding="async" /><div className="absolute top-3 left-3 bg-primary-container text-on-primary px-space-sm py-0.5 rounded-full font-label-md text-label-md text-[11px]">{"Xanh Deep Ocean"}</div></div><div className="absolute -bottom-6 right-3 flex items-center gap-1.5 bg-surface-container p-1 rounded-full shadow-md"><img className="w-10 h-10 rounded-full object-cover border-subtle" src="/images/8d4dea1a9fd79087.webp" alt="Tài xế Lê Quang Hải" loading="lazy" decoding="async" /></div></div><div className="p-space-md pt-space-lg flex flex-col gap-space-xs flex-1 justify-between"><div><div className="flex items-center gap-1 text-tertiary-container font-label-md text-label-md"><span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span><span className="">{"5.0"}</span><span className="text-text-muted text-[11px]">{"(950+ chuyến)"}</span></div><h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">{"VinFast VF 8 Plus 2024"}</h3><div className="mt-space-xs p-2 rounded-xl bg-surface-tint flex flex-col gap-0.5"><div className="flex items-center gap-1 font-label-md text-label-md text-primary"><span className="material-symbols-outlined text-[16px]">{"person_pin"}</span><span className="">{"Tài xế: Lê Quang Hải"}</span></div><p className="font-body-sm text-body-sm text-on-surface-variant">{"12 năm kinh nghiệm • Xe điện êm ái • Đón tiễn Nội Bài/Tân Sơn Nhất"}</p></div></div><div className="pt-space-sm border-b border-subtle pb-space-sm"><div className="flex items-baseline justify-between"><span className="font-body-sm text-body-sm text-text-muted">{"Dòng xe:"}</span><span className="font-body-sm text-body-sm text-on-surface font-medium">{"SUV Điện Thông Minh"}</span></div><div className="flex items-baseline justify-between mt-1"><span className="font-body-sm text-body-sm text-text-muted">{"Trọn gói 1 ngày:"}</span><span className="font-price-display text-price-display text-primary">{"1.250.000₫"}</span></div></div><div className="flex gap-space-xs pt-space-xs"><button className="flex-1 py-2 px-space-xs rounded-full bg-surface-container-high hover:bg-surface-tint text-on-surface font-label-md text-label-md transition-all text-center" type="button" data-action="driver">{"Hồ sơ tài xế"}</button><button className="flex-1 py-2 px-space-xs rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm text-center" type="button" data-action="book">{"Đặt xe ngay"}</button></div></div></div></div>
</div>
</section>

<section className="max-w-[1240px] mx-auto px-margin py-space-2xl w-full">
<div className="bg-primary text-on-primary rounded-3xl p-space-xl md:p-space-2xl relative overflow-hidden">
<div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-secondary-fixed/10 blur-3xl pointer-events-none"></div>
<div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
<div className="lg:col-span-7 flex flex-col gap-space-md">
<div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-label-md text-label-md w-fit">
<span className="material-symbols-outlined text-[16px]">{"no_drinks"}</span>
<span className="">{"Giải pháp An toàn Nghị định 100"}</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-on-primary">{"\n            Dịch Vụ Tài Xế Lái Hộ Xe Riêng:"}<br />{"An Tâm Tuyệt Đối Sau Tiệc & Đường Dài\n          "}</h2>
<p className="font-body-lg text-body-lg text-on-primary-container">{"\n            Bạn đã dùng rượu bia cùng đối tác hoặc quá mệt mỏi sau chuyến công tác? Tài xế Kanow sẽ đến tận nơi trong 30 phút, lái chiếc xe của chính bạn về nhà an toàn nguyên vẹn.\n          "}</p>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-space-xs">
<div className="bg-primary-container/60 p-space-md rounded-xl backdrop-blur-sm">
<span className="material-symbols-outlined text-secondary-fixed text-[24px] mb-1">{"speed"}</span>
<div className="font-label-lg text-label-lg">{"Có mặt sau 30p"}</div>
<div className="font-body-sm text-body-sm text-surface-variant">{"Phủ sóng khắp nội thành"}</div>
</div>
<div className="bg-primary-container/60 p-space-md rounded-xl backdrop-blur-sm">
<span className="material-symbols-outlined text-secondary-fixed text-[24px] mb-1">{"health_and_safety"}</span>
<div className="font-label-lg text-label-lg">{"Bảo hiểm xe 100%"}</div>
<div className="font-body-sm text-body-sm text-surface-variant">{"Cam kết bồi thường mọi va chạm"}</div>
</div>
<div className="bg-primary-container/60 p-space-md rounded-xl backdrop-blur-sm">
<span className="material-symbols-outlined text-secondary-fixed text-[24px] mb-1">{"lock_person"}</span>
<div className="font-label-lg text-label-lg">{"Ghi nhận camera"}</div>
<div className="font-body-sm text-body-sm text-surface-variant">{"Bàn giao tài sản minh bạch"}</div>
</div>
</div>
<div className="pt-space-md flex flex-wrap gap-space-md">
<button className="px-space-xl py-space-sm rounded-full bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary-container hover:text-on-tertiary font-label-lg text-label-lg shadow-md transition-all flex items-center gap-space-xs" type="button">
<span className="material-symbols-outlined text-[20px]">{"hail"}</span>
<span className="">{"Gọi Tài Xế Lái Hộ Ngay"}</span>
</button>
<a className="px-space-lg py-space-sm rounded-full bg-surface-container/10 text-on-primary hover:bg-surface-container/20 font-label-lg text-label-lg backdrop-blur-sm transition-all flex items-center gap-space-xs" href="tel:19008888">
<span className="material-symbols-outlined text-[18px]">{"phone"}</span>
<span className="">{"Tổng Đài Cấp Tốc 1900 8888"}</span>
</a>
</div>
</div>
<div className="lg:col-span-5 flex justify-center">

<div className="bg-surface-container text-on-surface rounded-2xl p-space-lg w-full max-w-sm shadow-xl space-y-space-md">
<div className="font-label-lg text-label-lg text-primary flex items-center justify-between border-b pb-space-sm border-subtle">
<span className="">{"Quy trình 3 bước lái hộ"}</span>
<span className="text-status-success flex items-center text-[12px]"><span className="w-2 h-2 rounded-full bg-status-success inline-block mr-1"></span>{"Sẵn sàng"}</span>
</div>
<div className="flex gap-space-md items-start">
<div className="w-8 h-8 rounded-full bg-surface-tint flex items-center justify-center font-bold text-primary shrink-0">{"1"}</div>
<div>
<h4 className="font-label-md text-label-md font-bold">{"Đặt dịch vụ & Gặp tài xế"}</h4>
<p className="font-body-sm text-body-sm text-text-muted">{"Nhận diện tài xế qua mã OTP và thẻ tên nhân viên Kanow."}</p>
</div>
</div>
<div className="flex gap-space-md items-start">
<div className="w-8 h-8 rounded-full bg-surface-tint flex items-center justify-center font-bold text-primary shrink-0">{"2"}</div>
<div>
<h4 className="font-label-md text-label-md font-bold">{"Biên bản chụp ảnh xe"}</h4>
<p className="font-body-sm text-body-sm text-text-muted">{"Chụp 4 góc xe và đồng hồ xăng trước khi tài xế nổ máy di chuyển."}</p>
</div>
</div>
<div className="flex gap-space-md items-start">
<div className="w-8 h-8 rounded-full bg-surface-tint flex items-center justify-center font-bold text-primary shrink-0">{"3"}</div>
<div>
<h4 className="font-label-md text-label-md font-bold">{"Về nhà & Bàn giao chìa khóa"}</h4>
<p className="font-body-sm text-body-sm text-text-muted">{"Đỗ xe gọn gàng vào bãi/nhà, thanh toán tiện lợi qua thẻ hoặc ví."}</p>
</div>
</div>
<div className="bg-surface-container-high rounded-xl p-space-sm text-center font-body-sm text-body-sm text-text-muted">{"\n              Cước phí chỉ từ "}<span className="font-bold text-primary">{"250.000₫"}</span>{" cho 5km đầu tiên.\n            "}</div>
</div>
</div>
</div>
</div>
</section>

<section className="max-w-[1240px] mx-auto px-margin py-space-xl w-full">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-md">
<div>
<span className="text-secondary font-label-lg text-label-lg uppercase tracking-wider">{"Đội ngũ chất lượng"}</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface mt-space-xs">{"Gặp Gỡ Đội Ngũ Tài Xế Tiêu Biểu"}</h2>
</div>
<p className="font-body-md text-body-md text-text-muted max-w-md">{"\n        Mỗi bác tài là một đại sứ thương hiệu của Kanow: tận tụy, am hiểu luật giao thông và luôn đem lại sự an tĩnh trên mỗi chặng hành trình.\n      "}</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">

<div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
<div className="relative h-60 bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover" src="/images/5f47319e2e1913c1.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-md text-on-primary font-label-md text-label-md px- space-sm py-1 rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">{"star"}</span>
<span className="">{"4.99 (820+ chuyến)"}</span>
</div>
</div>
<div className="p-space-md flex flex-col gap-space-sm">
<div>
<h4 className="font-headline-sm text-headline-sm text-on-surface">{"Nguyễn Văn Hùng"}</h4>
<span className="font-body-sm text-body-sm text-secondary font-medium">{"9 năm kinh nghiệm • Bằng D"}</span>
</div>
<div className="flex flex-wrap gap-1">
<span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-md text-label-md text-[11px]">{"Tiếng Việt"}</span>
<span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-md text-label-md text-[11px]">{"Tiếng Anh giao tiếp"}</span>
<span className="px-2 py-0.5 rounded-md bg-surface-tint text-primary font-label-md text-label-md text-[11px]">{"Chuyên đón sân bay"}</span>
</div>
<p className="font-body-sm text-body-sm text-text-muted italic">{"\"Luôn giữ xe sạch bong kin kít, đúng hẹn đến trước 15 phút là nguyên tắc nghề nghiệp.\""}</p>
</div>
</div>

<div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
<div className="relative h-60 bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover" src="/images/a5f7a760522f6e6b.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-md text-on-primary font-label-md text-label-md px- space-sm py-1 rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">{"star"}</span>
<span className="">{"4.98 (640+ chuyến)"}</span>
</div>
</div>
<div className="p-space-md flex flex-col gap-space-sm">
<div>
<h4 className="font-headline-sm text-headline-sm text-on-surface">{"Trần Minh Tuấn"}</h4>
<span className="font-body-sm text-body-sm text-secondary font-medium">{"7 năm kinh nghiệm • Bằng C"}</span>
</div>
<div className="flex flex-wrap gap-1">
<span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-md text-label-md text-[11px]">{"Tiếng Việt"}</span>
<span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-md text-label-md text-[11px]">{"Tiếng Anh lưu loát"}</span>
<span className="px-2 py-0.5 rounded-md bg-surface-tint text-primary font-label-md text-label-md text-[11px]">{"Chuyên tour ngoại giao"}</span>
</div>
<p className="font-body-sm text-body-sm text-text-muted italic">{"\"Phục vụ nhiều đoàn chuyên gia Nhật & Hàn Quốc, giữ không gian yên tĩnh tuyệt đối.\""}</p>
</div>
</div>

<div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
<div className="relative h-60 bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover" src="/images/8d4dea1a9fd79087.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-md text-on-primary font-label-md text-label-md px- space-sm py-1 rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">{"star"}</span>
<span className="">{"5.0 (950+ chuyến)"}</span>
</div>
</div>
<div className="p-space-md flex flex-col gap-space-sm">
<div>
<h4 className="font-headline-sm text-headline-sm text-on-surface">{"Lê Quang Hải"}</h4>
<span className="font-body-sm text-body-sm text-secondary font-medium">{"12 năm kinh nghiệm • Bằng D"}</span>
</div>
<div className="flex flex-wrap gap-1">
<span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-md text-label-md text-[11px]">{"Tiếng Việt"}</span>
<span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-md text-label-md text-[11px]">{"Am hiểu ẩm thực 3 miền"}</span>
<span className="px-2 py-0.5 rounded-md bg-surface-tint text-primary font-label-md text-label-md text-[11px]">{"Chuyên đi tỉnh"}</span>
</div>
<p className="font-body-sm text-body-sm text-text-muted italic">{"\"Lái xe đằm tính, không phanh gấp, biết các quán ăn ngon sạch sẽ tại các tỉnh miền Tây và Tây Bắc.\""}</p>
</div>
</div>

<div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
<div className="relative h-60 bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover" src="/images/26713b016bb4856a.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-md text-on-primary font-label-md text-label-md px- space-sm py-1 rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">{"star"}</span>
<span className="">{"4.97 (510+ chuyến)"}</span>
</div>
</div>
<div className="p-space-md flex flex-col gap-space-sm">
<div>
<h4 className="font-headline-sm text-headline-sm text-on-surface">{"Phạm Đức Thắng"}</h4>
<span className="font-body-sm text-body-sm text-secondary font-medium">{"6 năm kinh nghiệm • Bằng B2"}</span>
</div>
<div className="flex flex-wrap gap-1">
<span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-md text-label-md text-[11px]">{"Tiếng Việt"}</span>
<span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-md text-label-md text-[11px]">{"Thành thạo xe sang"}</span>
<span className="px-2 py-0.5 rounded-md bg-surface-tint text-primary font-label-md text-label-md text-[11px]">{"Đội lái hộ ban đêm"}</span>
</div>
<p className="font-body-sm text-body-sm text-text-muted italic">{"\"Kinh nghiệm điều khiển Mercedes, BMW, Porsche mượt mà, hỗ trợ khách tận phòng khi say.\""}</p>
</div>
</div>
</div>
</section>

<section className="max-w-[1240px] mx-auto px-margin py-space-xl w-full">
<div className="bg-surface-container rounded-3xl p-space-lg md:p-space-2xl shadow-sm">
<div className="text-center max-w-xl mx-auto mb-space-xl">
<span className="text-secondary font-label-lg text-label-lg uppercase tracking-wider">{"Không phí ẩn"}</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface mt-space-xs">{"Bảng Báo Giá Minh Bạch Trọn Gói"}</h2>
<p className="font-body-md text-body-md text-text-muted mt-space-xs">{"\n          Chi phí công khai rõ ràng, đã bao gồm xăng dầu, công tài xế và vé cao tốc. Quý khách hoàn toàn không phải chi thêm tiền bồi dưỡng (tip) bắt buộc.\n        "}</p>
</div>

<div className="overflow-x-auto">
<div className="table-scroll" tabIndex={0} aria-label="Bảng thông tin, cuộn ngang để xem thêm"><table className="w-full text-left font-body-md text-body-md border-collapse">
<thead>
<tr className="bg-surface-container-high text-on-surface font-label-lg text-label-lg">
<th className="p-space-md rounded-l-xl">{"Tuyến đường / Nhu cầu"}</th>
<th className="p-space-md">{"Dòng xe tiêu biểu"}</th>
<th className="p-space-md">{"Đã bao gồm"}</th>
<th className="p-space-md">{"Thời gian & Km quy định"}</th>
<th className="p-space-md text-right rounded-r-xl">{"Giá trọn gói (VND)"}</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container-low">
<tr className="hover:bg-surface-tint/50 transition-colors">
<td className="p-space-md">
<div className="font-bold text-on-surface">{"Nội thành - Đón tiễn Sân Bay"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Nội Bài ↔ Trung tâm Hà Nội"}</div>
</td>
<td className="p-space-md text-on-surface">{"Sedan 4 chỗ (Vios, City, Accent)"}</td>
<td className="p-space-md">
<span className="inline-flex items-center gap-1 text-status-success font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px]">{"check"}</span>{" Xăng, cầu đường, chờ 60p\n                "}</span>
</td>
<td className="p-space-md text-text-muted">{"1 Chiều (~35km)"}</td>
<td className="p-space-md text-right">
<span className="font-price-display text-price-display text-primary">{"280.000₫"}</span>
</td>
</tr>
<tr className="hover:bg-surface-tint/50 transition-colors">
<td className="p-space-md">
<div className="font-bold text-on-surface">{"Nội thành - Sân Bay (Xe 7 Chỗ VIP)"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Tân Sơn Nhất ↔ Quận 1/2/7 hoặc Nội Bài"}</div>
</td>
<td className="p-space-md text-on-surface">{"SUV / MPV (Carnival, Fortuner, Xpander)"}</td>
<td className="p-space-md">
<span className="inline-flex items-center gap-1 text-status-success font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px]">{"check"}</span>{" Vé đỗ sân bay + Cao tốc\n                "}</span>
</td>
<td className="p-space-md text-text-muted">{"1 Chiều (~35km)"}</td>
<td className="p-space-md text-right">
<span className="font-price-display text-price-display text-primary">{"450.000₫"}</span>
</td>
</tr>
<tr className="hover:bg-surface-tint/50 transition-colors">
<td className="p-space-md">
<div className="font-bold text-on-surface">{"Nội thành Theo Giờ (Nửa ngày)"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Gặp đối tác, họp hành nhiều điểm"}</div>
</td>
<td className="p-space-md text-on-surface">{"Sedan hạng C/D (Camry, Altis, Mazda 6)"}</td>
<td className="p-space-md">
<span className="inline-flex items-center gap-1 text-status-success font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px]">{"check"}</span>{" Tài xế sơ mi, nước suối\n                "}</span>
</td>
<td className="p-space-md text-text-muted">{"4 giờ / Giới hạn 50km"}</td>
<td className="p-space-md text-right">
<span className="font-price-display text-price-display text-primary">{"850.000₫"}</span>
</td>
</tr>
<tr className="hover:bg-surface-tint/50 transition-colors">
<td className="p-space-md">
<div className="font-bold text-on-surface">{"Nội thành Trọn Gói (Cả ngày)"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Khảo sát dự án, đưa đón sếp"}</div>
</td>
<td className="p-space-md text-on-surface">{"Sedan hạng D / SUV 7 chỗ hạng sang"}</td>
<td className="p-space-md">
<span className="inline-flex items-center gap-1 text-status-success font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px]">{"check"}</span>{" Toàn bộ xăng xe + cầu đường\n                "}</span>
</td>
<td className="p-space-md text-text-muted">{"8 giờ / Giới hạn 100km"}</td>
<td className="p-space-md text-right">
<span className="font-price-display text-price-display text-primary">{"1.500.000₫"}</span>
</td>
</tr>
<tr className="hover:bg-surface-tint/50 transition-colors">
<td className="p-space-md">
<div className="font-bold text-on-surface">{"Đi Liên Tỉnh (Hà Nội ↔ Hải Phòng / Hạ Long)"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Du lịch, công tác khứ hồi trong ngày"}</div>
</td>
<td className="p-space-md text-on-surface">{"Sedona / Carnival VIP 7 chỗ"}</td>
<td className="p-space-md">
<span className="inline-flex items-center gap-1 text-status-success font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px]">{"check"}</span>{" Phí cao tốc 5B 2 chiều + Xăng"}</span></td>
<td className="p-space-md text-text-muted">{"1 ngày (~280km khứ hồi)"}</td>
<td className="p-space-md text-right">
<span className="font-price-display text-price-display text-primary">{"2.400.000₫"}</span>
</td>
</tr>
<tr className="hover:bg-surface-tint/50 transition-colors">
<td className="p-space-md">
<div className="font-bold text-on-surface">{"Tài Xế Lái Hộ (Chỉ thuê người lái)"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Sau liên hoan tiệc, về nhà an toàn"}</div>
</td>
<td className="p-space-md text-on-surface">{"Phương tiện của Quý khách (Số sàn/Tự động)"}</td>
<td className="p-space-md">
<span className="inline-flex items-center gap-1 text-status-success font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px]">{"check"}</span>{" Bảo hiểm vật chất xe Kanow Care\n                "}</span>
</td>
<td className="p-space-md text-text-muted">{"1 cuốc / Tối đa 15km nội thành"}</td>
<td className="p-space-md text-right">
<span className="font-price-display text-price-display text-primary">{"350.000₫"}</span>
</td>
</tr>
</tbody>
</table></div>
</div>

<div className="mt-space-xl pt-space-xl grid grid-cols-1 md:grid-cols-2 gap-space-lg">
<div className="p-space-md rounded-2xl bg-surface-container-low">
<div className="font-label-lg text-label-lg text-on-surface flex items-center gap-space-xs mb-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">{"help_outline"}</span>
<span className="">{"Nếu chuyến bay bị delay thì phí chờ tính ra sao?"}</span>
</div>
<p className="font-body-sm text-body-sm text-text-muted">{"\n            Kanow tự động đồng bộ mã hiệu chuyến bay. Tài xế sẽ chỉ có mặt theo giờ hạ cánh thực tế và luôn giữ quyền lợi miễn phí 60 phút chờ đầu tiên kể từ lúc máy bay tiếp đất.\n          "}</p>
</div>
<div className="p-space-md rounded-2xl bg-surface-container-low">
<div className="font-label-lg text-label-lg text-on-surface flex items-center gap-space-xs mb-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">{"help_outline"}</span>
<span className="">{"Tôi có phải lo chỗ ăn nghỉ cho tài xế khi đi tỉnh qua đêm không?"}</span>
</div>
<p className="font-body-sm text-body-sm text-text-muted">{"\n            Trong các gói đi tỉnh qua đêm, tài xế hoàn toàn tự túc ăn ở hoặc khách hàng có thể chọn phụ cấp hỗ trợ 300.000đ/đêm để tài xế tự sắp xếp nhà nghỉ gần điểm lưu trú của quý khách.\n          "}</p>
</div>
</div>
</div>
</section>

<section className="max-w-[1240px] mx-auto px-margin pt-space-lg pb-space-2xl w-full">
<div className="bg-gradient-to-r from-primary to-primary-container rounded-3xl p-space-xl md:p-space-2xl text-on-primary flex flex-col md:flex-row items-center justify-between gap-space-xl shadow-xl">
<div className="max-w-xl">
<h2 className="font-headline-lg text-headline-lg text-on-primary mb-space-xs">{"Cần Xe Gấp Hay Lên Lịch Trình Riêng?"}</h2>
<p className="font-body-md text-body-md text-on-primary-container">{"\n          Đội ngũ tư vấn viên cao cấp của Kanow túc trực 24/7 để sắp xếp xe và chỉ định tài xế theo đúng mong muốn của bạn trong vòng 15 phút.\n        "}</p>
</div>
<div className="flex flex-col sm:flex-row items-center gap-space-md w-full md:w-auto">
<a className="w-full sm:w-auto px-space-xl py-3.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-lg text-label-lg hover:bg-secondary-container transition-all flex items-center justify-center gap-space-xs shadow-md" href="tel:19008888">
<span className="material-symbols-outlined text-[20px]">{"call"}</span>
<span className="">{"Hotline: 1900 8888"}</span>
</a>
<button className="w-full sm:w-auto px-space-lg py-3.5 rounded-full bg-surface-container/15 hover:bg-surface-container/25 text-on-primary font-label-lg text-label-lg backdrop-blur-md transition-all flex items-center justify-center gap-space-xs" type="button" data-handler="window.scrollTo" data-args="{top: 250, behavior: 'smooth'}">
<span className="">{"Tự Đặt Trực Tuyến"}</span>
<span className="material-symbols-outlined text-[18px]">{"arrow_upward"}</span>
</button>
</div>
</div>
</section>
</div>

</main>
  );
}
