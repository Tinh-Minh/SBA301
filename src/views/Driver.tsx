import Link from "next/link";

export default function Driver() {
  return (
<main className="w-full pt-20 bg-surface"><div className="flex flex-col w-full">

<section className="w-full bg-surface-container-low py-space-sm">
<div className="max-w-[1240px] mx-auto px-margin flex flex-wrap items-center justify-between gap-space-sm">
<nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md flex-wrap">
<Link className="hover:text-primary transition-colors flex items-center gap-1" data-path="trang-chu" href="/">
<span className="material-symbols-outlined text-[16px]">{"home"}</span>
<span>{"Trang chủ"}</span>
</Link>
<span className="text-outline-variant">{"/"}</span>
<Link className="hover:text-primary transition-colors" data-path="xe-kem-tai-xe" href="/xe-kem-tai-xe">{"Xe kèm tài xế"}</Link>
<span className="text-outline-variant">{"/"}</span>
<span className="text-on-surface-variant">{"Hồ sơ tài xế"}</span>
<span className="text-outline-variant">{"/"}</span>
<span className="text-primary font-semibold">{"Trần Minh Tuấn"}</span>
</nav>
<div className="flex items-center gap-2 text-status-success font-label-md text-label-md bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm">
<span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
<span>{"Đang sẵn sàng nhận chuyến hôm nay"}</span>
</div>
</div>
</section>

<section className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary relative overflow-hidden py-space-xl">
<div className="absolute -right-20 -top-24 w-96 h-96 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>
<div className="absolute right-1/3 bottom-0 w-80 h-80 rounded-full bg-tertiary-fixed/10 blur-2xl pointer-events-none"></div>
<div className="max-w-[1240px] mx-auto px-margin relative z-10">
<div className="flex flex-col md:flex-row items-start md:items-center gap-space-lg">

<div className="relative shrink-0">
<div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-2xl bg-surface-container-high ring-4 ring-on-primary/20">
<img className="w-full h-full object-cover" src="/images/6b173a380710b40f.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
</div>
<span className="absolute -bottom-2 -right-2 bg-status-success text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
<span className="material-symbols-outlined text-[12px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"verified"}</span>{"\n            VERIFIED\n          "}</span>
</div>

<div className="flex flex-col gap-space-xs flex-1 min-w-0">
<div className="flex flex-wrap items-center gap-space-sm">
<span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md px-3 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
<span className="material-symbols-outlined text-[15px] text-tertiary-container" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>{"\n              Kanow Elite VIP\n            "}</span>
<span className="bg-primary-fixed text-on-primary-fixed font-label-md text-label-md px-3 py-0.5 rounded-full font-semibold">{"\n              GPLX Hạng D Quốc Tế\n            "}</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-on-primary font-bold tracking-tight">{"\n            Trần Minh Tuấn "}<span className="text-primary-fixed text-headline-sm font-normal">{"(38 tuổi)"}</span>
</h1>
<p className="font-body-md text-body-md text-surface-variant max-w-2xl">{"\n            Chuyên trách đưa đón đại sứ quán, đối tác thương mại cấp cao & du khách quốc tế. Tác phong ngoại giao, điềm đạm, am hiểu tuyến đường Hà Nội - Miền Bắc và các cung đường di sản.\n          "}</p>
<div className="flex flex-wrap items-center gap-space-md pt-space-xs text-body-sm font-body-sm text-surface-tint">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px] text-on-tertiary-container" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<strong className="text-on-primary font-price-display text-[16px]">{"4.98"}</strong>
<span>{"(642 lượt đánh giá 5★)"}</span>
</div>
<span className="text-primary-fixed/40">{"•"}</span>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px] text-secondary-container">{"workspace_premium"}</span>
<span><strong>{"9 năm"}</strong>{" thâm niên đường dài & VIP"}</span>
</div>
<span className="text-primary-fixed/40">{"•"}</span>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px] text-status-success">{"security"}</span>
<span>{"Lý lịch xác thực Cục Tư Pháp"}</span>
</div>
</div>
</div>

<div className="hidden lg:flex flex-col items-center justify-center p-4 rounded-xl bg-surface-container-lowest/10 backdrop-blur-md text-center shrink-0 min-w-[130px]">
<span className="font-display-hero text-[36px] leading-tight font-bold text-secondary-container">{"100%"}</span>
<span className="font-label-md text-label-md text-surface-variant">{"Đúng giờ tuyệt đối"}</span>
<span className="text-[11px] text-primary-fixed-dim mt-1">{"Sớm 15 phút tại điểm hẹn"}</span>
</div>
</div>
</div>
</section>

<section className="max-w-[1240px] w-full mx-auto px-margin py-space-xl">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

<div className="lg:col-span-8 flex flex-col gap-space-xl min-w-0">

<div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
<h2 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-secondary">{"translate"}</span>{"\n              Khả năng giao tiếp & Ngoại ngữ\n            "}</h2>
<span className="font-label-md text-label-md text-text-muted">{"Kiểm định chuyên môn 2025"}</span>
</div>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
<div className="p-space-sm rounded-xl bg-surface-container-low flex items-start gap-space-xs">
<div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
<span className="font-label-md text-label-md font-bold">{"VN"}</span>
</div>
<div>
<p className="font-label-lg text-label-lg text-on-surface">{"Tiếng Việt"}</p>
<p className="font-body-sm text-body-sm text-text-muted">{"Bản ngữ (Hà Nội chuẩn)"}</p>
</div>
</div>
<div className="p-space-sm rounded-xl bg-surface-container-low flex items-start gap-space-xs">
<div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
<span className="font-label-md text-label-md font-bold">{"EN"}</span>
</div>
<div>
<p className="font-label-lg text-label-lg text-on-surface">{"Tiếng Anh"}</p>
<p className="font-body-sm text-body-sm text-text-muted">{"Lưu loát (IELTS 6.5 / Tour Guide)"}</p>
</div>
</div>
<div className="p-space-sm rounded-xl bg-surface-container-low flex items-start gap-space-xs">
<div className="w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center shrink-0">
<span className="font-label-md text-label-md font-bold">{"KR"}</span>
</div>
<div>
<p className="font-label-lg text-label-lg text-on-surface">{"Tiếng Hàn"}</p>
<p className="font-body-sm text-body-sm text-text-muted">{"Giao tiếp chào đón cơ bản"}</p>
</div>
</div>
</div>
</div>

<div className="flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div>
<h2 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-secondary">{"garage"}</span>{"\n                Xe phụ trách chính của bác tài Tuấn\n              "}</h2>
<p className="font-body-sm text-body-sm text-text-muted">{"Tất cả xe đều thuộc sở hữu trực tiếp của Kanow Elite, bảo dưỡng chính hãng"}</p>
</div>
<span className="hidden sm:inline-block font-label-md text-label-md bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full font-bold">{"\n              Đời mới 2024\n            "}</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">

<div className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between" data-vehicle-card="sedan" data-vehicle-name="Toyota Camry 2.5Q (2024)" data-price="380000">
<div className="flex flex-col gap-space-sm">
<div className="relative w-full h-44 rounded-xl overflow-hidden bg-surface-container">
<img className="w-full h-full object-cover" src="/images/37120673f3097ee5.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<span className="absolute top-2 left-2 bg-primary/90 backdrop-blur-md text-on-primary font-label-md text-[11px] px-2 py-0.5 rounded-md">{"\n                    Sedan Doanh Nhân 4 chỗ\n                  "}</span>
<span className="absolute bottom-2 right-2 bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-md text-[11px] px-2 py-0.5 rounded-md font-mono">{"\n                    30K - 886.29\n                  "}</span>
</div>
<div className="flex items-start justify-between">
<div>
<h3 className="font-label-lg text-label-lg text-primary font-bold">{"Toyota Camry 2.5Q (2024)"}</h3>
<p className="font-body-sm text-body-sm text-text-muted">{"Ngoại thất Đen Ánh Kim • Nội thất da nâu Cognac"}</p>
</div>
</div>

<div className="grid grid-cols-2 gap-2 text-body-sm text-on-surface-variant pt-2">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-secondary">{"wifi"}</span>
<span>{"WiFi 5G ổn định"}</span>
</div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-secondary">{"battery_charging_full"}</span>
<span>{"Sạc nhanh không dây"}</span>
</div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-secondary">{"local_drink"}</span>
<span>{"Nước suối khoáng & khăn"}</span>
</div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-secondary">{"umbrella"}</span>
<span>{"Ô che mưa VIP"}</span>
</div>
</div>
</div>
<div className="mt-space-md pt-space-sm border-t border-border-subtle flex items-center justify-between">
<div>
<span className="text-body-sm text-text-muted">{"Ưu đãi chuyến từ"}</span>
<p className="font-price-display text-price-display text-primary">{"380.000₫ "}<span className="text-body-sm text-text-muted font-normal">{"/ lượt"}</span></p>
</div>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary font-label-md text-label-md transition-colors" type="button" data-handler="selectCarModel" data-args="'camry'">{"\n                  Chọn xe này\n                "}</button>
</div>
</div>

<div className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between" data-vehicle-card="suv" data-vehicle-name="Kia Carnival Royal (2024)" data-price="550000">
<div className="flex flex-col gap-space-sm">
<div className="relative w-full h-44 rounded-xl overflow-hidden bg-surface-container">
<img className="w-full h-full object-cover" src="/images/b6f098c09be23fca.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<span className="absolute top-2 left-2 bg-primary/90 backdrop-blur-md text-on-primary font-label-md text-[11px] px-2 py-0.5 rounded-md">{"\n                    Chuyên cơ mặt đất 7 chỗ\n                  "}</span>
<span className="absolute bottom-2 right-2 bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-md text-[11px] px-2 py-0.5 rounded-md font-mono">{"\n                    30L - 192.86\n                  "}</span>
</div>
<div className="flex items-start justify-between">
<div>
<h3 className="font-label-lg text-label-lg text-primary font-bold">{"Kia Carnival Royal (2024)"}</h3>
<p className="font-body-sm text-body-sm text-text-muted">{"Ghế thương gia ngả lưng điện • Màn hình trần"}</p>
</div>
</div>

<div className="grid grid-cols-2 gap-2 text-body-sm text-on-surface-variant pt-2">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-secondary">{"airline_seat_recline_extra"}</span>
<span>{"Ghế massage độc lập"}</span>
</div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-secondary">{"luggage"}</span>
<span>{"Cốp chứa 6 vali lớn"}</span>
</div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-secondary">{"verified_user"}</span>
<span>{"Bảo hiểm 2 chiều tối đa"}</span>
</div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-secondary">{"volume_off"}</span>
<span>{"Khoang cách âm chuẩn VIP"}</span>
</div>
</div>
</div>
<div className="mt-space-md pt-space-sm border-t border-border-subtle flex items-center justify-between">
<div>
<span className="text-body-sm text-text-muted">{"Ưu đãi chuyến từ"}</span>
<p className="font-price-display text-price-display text-primary">{"550.000₫ "}<span className="text-body-sm text-text-muted font-normal">{"/ lượt"}</span></p>
</div>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary font-label-md text-label-md transition-colors" type="button" data-handler="selectCarModel" data-args="'carnival'">{"\n                  Chọn xe này\n                "}</button>
</div>
</div>
</div>
</div>

<div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<h2 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-secondary">{"verified"}</span>{"\n            Tiêu chuẩn phục vụ 5 sao cam kết\n          "}</h2>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
<div className="flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-surface-tint text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined">{"schedule"}</span>
</div>
<div>
<h4 className="font-label-lg text-label-lg text-on-surface">{"Đúng giờ tuyệt đối"}</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Có mặt trước giờ hẹn ít nhất 15 phút, chủ động liên hệ gửi biển số và điểm đón chính xác qua tin nhắn."}</p>
</div>
</div>
<div className="flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-surface-tint text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined">{"smoke_free"}</span>
</div>
<div>
<h4 className="font-label-lg text-label-lg text-on-surface">{"100% Không khói thuốc"}</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Không gian xe luôn thơm tho, tinh dầu tự nhiên dịu nhẹ, cam kết tài xế không hút thuốc trước và trong ca trực."}</p>
</div>
</div>
<div className="flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-surface-tint text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined">{"lock"}</span>
</div>
<div>
<h4 className="font-label-lg text-label-lg text-on-surface">{"Bảo mật & Riêng tư tuyệt đối"}</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Tôn trọng không gian làm việc của khách hàng. Không bắt chuyện khi không được yêu cầu, bảo mật cuộc gọi trao đổi công vụ."}</p>
</div>
</div>
<div className="flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-surface-tint text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined">{"airline_seat_recline_normal"}</span>
</div>
<div>
<h4 className="font-label-lg text-label-lg text-on-surface">{"Lái xe điềm tĩnh & Êm ái"}</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Vào cua mượt, phanh dừng từ tốn, không phanh gấp hay bóp còi dồn dập, đảm bảo trải nghiệm nghỉ ngơi không say xe."}</p>
</div>
</div>
</div>
</div>

<div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<h2 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-secondary">{"receipt_long"}</span>{"\n              Bảng giá niêm yết theo tài xế & xe\n            "}</h2>
<span className="font-label-md text-label-md text-text-muted">{"Đã gồm lương tài xế & xăng xe"}</span>
</div>
<div className="overflow-x-auto">
<div className="table-scroll" tabIndex={0} aria-label="Bảng thông tin, cuộn ngang để xem thêm"><table className="w-full text-left font-body-sm text-body-sm">
<thead>
<tr className="bg-surface-container-low text-primary font-label-md text-label-md rounded-lg">
<th className="py-3 px-4 rounded-l-lg">{"Gói dịch vụ"}</th>
<th className="py-3 px-4">{"Định mức sử dụng"}</th>
<th className="py-3 px-4">{"Camry 2.5Q"}</th>
<th className="py-3 px-4 rounded-r-lg">{"Kia Carnival"}</th>
</tr>
</thead>
<tbody className="divide-y divide-border-subtle">
<tr>
<td className="py-3.5 px-4 font-semibold text-on-surface">{"Đón/Tiễn Sân Bay Nội Bài"}</td>
<td className="py-3.5 px-4 text-on-surface-variant">{"1 Chiều (Bao vé vào sân)"}</td>
<td className="py-3.5 px-4 text-primary font-bold">{"380.000₫"}</td>
<td className="py-3.5 px-4 text-primary font-bold">{"550.000₫"}</td>
</tr>
<tr>
<td className="py-3.5 px-4 font-semibold text-on-surface">{"Nội Thành Theo Ngày (Half-Day)"}</td>
<td className="py-3.5 px-4 text-on-surface-variant">{"4 tiếng / 50 km"}</td>
<td className="py-3.5 px-4 text-primary font-bold">{"850.000₫"}</td>
<td className="py-3.5 px-4 text-primary font-bold">{"1.100.000₫"}</td>
</tr>
<tr>
<td className="py-3.5 px-4 font-semibold text-on-surface">{"Nội Thành Theo Ngày (Full-Day)"}</td>
<td className="py-3.5 px-4 text-on-surface-variant">{"8 tiếng / 100 km"}</td>
<td className="py-3.5 px-4 text-primary font-bold">{"1.400.000₫"}</td>
<td className="py-3.5 px-4 text-primary font-bold">{"1.850.000₫"}</td>
</tr>
<tr>
<td className="py-3.5 px-4 font-semibold text-on-surface">{"Đường Dài Liên Tỉnh (Hạ Long, Ninh Bình, Sapa)"}</td>
<td className="py-3.5 px-4 text-on-surface-variant">{"Theo km thực tế"}</td>
<td className="py-3.5 px-4 text-primary font-bold">{"11.500₫ / km"}</td>
<td className="py-3.5 px-4 text-primary font-bold">{"14.500₫ / km"}</td>
</tr>
</tbody>
</table></div>
</div>
<div className="flex items-center gap-2 p-3 bg-surface-container-low rounded-xl text-text-muted text-body-sm">
<span className="material-symbols-outlined text-[18px] text-secondary">{"info"}</span>
<span>{"Giá đã bao gồm bảo hiểm hành khách 2 tỷ đồng/vụ. Phụ phí ngoài giờ: 90.000₫/giờ sau 21h00. Không phát sinh tip bắt buộc."}</span>
</div>
</div>

<div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<h2 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-secondary">{"health_and_safety"}</span>{"\n            Hồ sơ kiểm tra tư pháp & Y tế định kỳ\n          "}</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
<div className="p-space-sm rounded-xl bg-surface-tint border-none flex flex-col gap-1">
<div className="flex items-center gap-1.5 text-primary font-label-md text-label-md font-bold">
<span className="material-symbols-outlined text-status-success text-[18px]">{"verified"}</span>{"\n                Lý Lịch Tư Pháp Số 2\n              "}</div>
<p className="font-body-sm text-body-sm text-text-muted">{"Được cấp bởi Sở Tư Pháp TP. Hà Nội, xác minh hoàn toàn không tiền án tiền sự."}</p>
<span className="text-[11px] font-semibold text-secondary mt-1">{"Cập nhật: Tháng 01/2025"}</span>
</div>
<div className="p-space-sm rounded-xl bg-surface-tint border-none flex flex-col gap-1">
<div className="flex items-center gap-1.5 text-primary font-label-md text-label-md font-bold">
<span className="material-symbols-outlined text-status-success text-[18px]">{"favorite"}</span>{"\n                Khám Sức Khỏe Lái Xe\n              "}</div>
<p className="font-body-sm text-body-sm text-text-muted">{"Bệnh viện Giao Thông Vận Tải TW chứng nhận thị lực 10/10, tim mạch ổn định."}</p>
<span className="text-[11px] font-semibold text-secondary mt-1">{"Định kỳ: 6 tháng / lần"}</span>
</div>
<div className="p-space-sm rounded-xl bg-surface-tint border-none flex flex-col gap-1">
<div className="flex items-center gap-1.5 text-primary font-label-md text-label-md font-bold">
<span className="material-symbols-outlined text-status-success text-[18px]">{"science"}</span>{"\n                Xét Nghiệm Cồn & Độc Chất\n              "}</div>
<p className="font-body-sm text-body-sm text-text-muted">{"Kiểm tra hơi thở ngẫu nhiên qua thiết bị đo chuyên dụng trước khi nhận xe phục vụ."}</p>
<span className="text-[11px] font-semibold text-status-success mt-1">{"Chỉ số: 0.00 mg/L"}</span>
</div>
</div>
</div>

<div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div>
<h2 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-secondary">{"reviews"}</span>{"\n                Đánh giá gần đây từ khách hàng\n              "}</h2>
<p className="font-body-sm text-body-sm text-text-muted">{"Tổng cộng 642 lượt xếp hạng trên hệ thống Kanow"}</p>
</div>
<div className="flex items-center gap-1 text-on-tertiary-container">
<span className="material-symbols-outlined text-[20px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="font-price-display text-price-display text-primary">{"4.98"}</span>
<span className="text-body-sm text-text-muted">{"/ 5.0"}</span>
</div>
</div>
<div className="flex flex-col divide-y divide-border-subtle">

<div className="py-space-md flex flex-col gap-2">
<div className="flex items-center justify-between flex-wrap gap-2">
<div className="flex items-center gap-2">
<div className="w-9 h-9 rounded-full bg-secondary-fixed text-primary font-bold flex items-center justify-center font-label-md">{"\n                    TT\n                  "}</div>
<div>
<h4 className="font-label-lg text-label-lg text-on-surface">{"Ông Trần Thái Bình"}</h4>
<p className="font-body-sm text-body-sm text-text-muted">{"Giám đốc Điều hành Công ty LogiTech • Chuyến đi: 28/02/2025"}</p>
</div>
</div>
<div className="flex items-center text-on-tertiary-container">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
</div>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n                \"Tôi đặt anh Tuấn để đưa đón phái đoàn chuyên gia từ Nhật Bản trong 3 ngày làm việc tại các KCN Bắc Ninh và Hải Phòng trên chiếc Carnival. Anh Tuấn giao tiếp tiếng Anh rất lịch thiệp, phong thái đĩnh đạc, lái xe cực êm. Phía đối tác khen ngợi sự chu đáo không ngớt.\"\n              "}</p>
<div className="flex items-center gap-2 text-body-sm text-secondary">
<span className="material-symbols-outlined text-[16px]">{"directions_car"}</span>
<span>{"Xe thuê: Kia Carnival Royal 2024 (Gói 3 ngày liên tỉnh)"}</span>
</div>
</div>

<div className="py-space-md flex flex-col gap-2">
<div className="flex items-center justify-between flex-wrap gap-2">
<div className="flex items-center gap-2">
<div className="w-9 h-9 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center font-label-md">{"\n                    MN\n                  "}</div>
<div>
<h4 className="font-label-lg text-label-lg text-on-surface">{"Bà Mai Ngọc Linh"}</h4>
<p className="font-body-sm text-body-sm text-text-muted">{"Đón tiễn Sân bay Nội Bài • Chuyến đi: 15/02/2025"}</p>
</div>
</div>
<div className="flex items-center text-on-tertiary-container">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
</div>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n                \"Máy bay đáp muộn 40 phút lúc nửa đêm nhưng anh Tuấn vẫn kiên nhẫn đợi ở ga quốc tế, cầm bảng đón tên trang nhã, nhanh chóng phụ tôi mang 3 kiện hành lý nặng. Xe Camry thơm phức, không hề có mùi thuốc lá hay mùi khó chịu.\"\n              "}</p>
<div className="flex items-center gap-2 text-body-sm text-secondary">
<span className="material-symbols-outlined text-[16px]">{"directions_car"}</span>
<span>{"Xe thuê: Toyota Camry 2.5Q 2024"}</span>
</div>
</div>
</div>
</div>
</div>

<div className="lg:col-span-4 sticky top-24 flex flex-col gap-space-md">
<div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-xl ring-1 ring-border-subtle flex flex-col gap-space-md">

<div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
<div>
<span className="font-label-md text-label-md uppercase tracking-wider text-secondary font-bold">{"Đặt dịch vụ riêng"}</span>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold">{"Bác tài Trần Minh Tuấn"}</h3>
</div>
<div className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center text-primary">
<span className="material-symbols-outlined">{"person_pin"}</span>
</div>
</div>

<div className="flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-on-surface font-semibold">{"Loại hình chuyến đi"}</label>
<div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-low rounded-xl text-center">
<button className="py-2 px-1 rounded-lg font-label-md text-[12px] bg-primary text-on-primary font-bold shadow-sm transition-all" id="tab-airport" type="button" data-handler="setTripType" data-args="'airport'">{"\n                Sân bay\n              "}</button>
<button className="py-2 px-1 rounded-lg font-label-md text-[12px] text-on-surface-variant hover:text-on-surface transition-all" id="tab-city" type="button" data-handler="setTripType" data-args="'city'">{"\n                Theo ngày\n              "}</button>
<button className="py-2 px-1 rounded-lg font-label-md text-[12px] text-on-surface-variant hover:text-on-surface transition-all" id="tab-province" type="button" data-handler="setTripType" data-args="'province'">{"\n                Liên tỉnh\n              "}</button>
</div>
</div>

<div className="flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-on-surface font-semibold">{"Chọn xe đi cùng bác tài"}</label>
<div className="grid grid-cols-2 gap-2">
<label className="cursor-pointer border-2 border-primary bg-surface-tint p-2 rounded-xl flex flex-col gap-1 relative" id="card-car-camry">
<input className="absolute top-2 right-2 text-primary focus:ring-0" name="selected_car" type="radio" defaultValue="camry" defaultChecked={true} aria-label="selected_car" />
<span className="font-label-md text-label-md font-bold text-primary">{"Camry 2.5Q"}</span>
<span className="text-[11px] text-text-muted">{"Sedan 4 chỗ VIP"}</span>
<span className="font-label-md text-[12px] font-bold text-secondary mt-1">{"Từ 380k"}</span>
</label>
<label className="cursor-pointer border-2 border-transparent bg-surface-container-low p-2 rounded-xl flex flex-col gap-1 relative hover:bg-surface-tint transition-all" id="card-car-carnival">
<input className="absolute top-2 right-2 text-primary focus:ring-0" name="selected_car" type="radio" defaultValue="carnival" aria-label="selected_car" />
<span className="font-label-md text-label-md font-bold text-on-surface">{"Kia Carnival"}</span>
<span className="text-[11px] text-text-muted">{"7 chỗ Hoàng Gia"}</span>
<span className="font-label-md text-[12px] font-bold text-secondary mt-1">{"Từ 550k"}</span>
</label>
</div>
</div>

<div className="flex flex-col gap-3">
<div>
<label className="font-label-md text-[12px] text-text-muted block mb-1">{"Điểm đón khách"}</label>
<div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm">
<span className="material-symbols-outlined text-secondary text-[18px]">{"pin_drop"}</span>
<input className="bg-transparent border-none w-full focus:outline-none text-on-surface font-body-sm" placeholder="Nhập địa chỉ đón..." type="text" defaultValue="Khách sạn Lotte Hotel Hanoi, Liễu Giai" aria-label="Nhập địa chỉ đón..." />
</div>
</div>
<div>
<label className="font-label-md text-[12px] text-text-muted block mb-1">{"Điểm đến"}</label>
<div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm">
<span className="material-symbols-outlined text-tertiary-container text-[18px]">{"location_on"}</span>
<input className="bg-transparent border-none w-full focus:outline-none text-on-surface font-body-sm" id="destination-input" placeholder="Nhập điểm đến..." type="text" defaultValue="Sân bay Quốc tế Nội Bài (Nhà ga T2)" aria-label="Nhập điểm đến..." />
</div>
</div>
<div className="grid grid-cols-2 gap-2">
<div>
<label className="font-label-md text-[12px] text-text-muted block mb-1">{"Ngày đón"}</label>
<div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm">
<span className="material-symbols-outlined text-secondary text-[18px]">{"calendar_today"}</span>
<input className="bg-transparent border-none w-full focus:outline-none text-[12px] text-on-surface" type="date" defaultValue="2025-03-05" aria-label="Ngày thuê xe" />
</div>
</div>
<div>
<label className="font-label-md text-[12px] text-text-muted block mb-1">{"Giờ đón"}</label>
<div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm">
<span className="material-symbols-outlined text-secondary text-[18px]">{"schedule"}</span>
<input className="bg-transparent border-none w-full focus:outline-none text-[12px] text-on-surface" type="time" defaultValue="08:30" aria-label="Thông tin" />
</div>
</div>
</div>
</div>

<div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-2">
<div className="flex items-center justify-between text-body-sm">
<span className="text-text-muted">{"Cước phí trọn gói"}</span>
<span className="font-semibold text-on-surface" id="base-price-display">{"380.000₫"}</span>
</div>
<div className="flex items-center justify-between text-body-sm">
<span className="text-text-muted">{"Vé cầu đường & Sân bay"}</span>
<span className="text-status-success font-semibold">{"Đã bao gồm"}</span>
</div>
<div className="flex items-center justify-between text-body-sm">
<span className="text-text-muted">{"Bảo hiểm VIP 2 tỷ"}</span>
<span className="text-status-success font-semibold">{"Miễn phí"}</span>
</div>
<div className="pt-2 border-t border-border-subtle flex items-center justify-between">
<span className="font-label-lg text-label-lg text-on-surface font-bold">{"Tổng thanh toán:"}</span>
<span className="font-headline-sm text-headline-sm text-primary font-bold" id="total-price-display">{"380.000₫"}</span>
</div>
</div>

<button className="w-full py-3.5 px-4 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2" type="button" data-handler="confirmBooking" data-args="">
<span className="material-symbols-outlined text-[20px]">{"calendar_month"}</span>
<span>{"ĐẶT BÁC TÀI TRẦN MINH TUẤN"}</span>
</button>

<div className="flex items-center justify-between pt-2 text-body-sm">
<span className="text-text-muted">{"Cần sắp xếp lịch trình riêng?"}</span>
<a className="text-primary hover:underline font-bold flex items-center gap-1" href="tel:19008888">
<span className="material-symbols-outlined text-[16px] text-tertiary-container">{"phone_in_talk"}</span>
<span>{"1900 8888 (Nhánh 2)"}</span>
</a>
</div>

<div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-text-muted border-t border-border-subtle">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-status-success">{"lock"}</span>
<span>{"Giữ xe tức thì"}</span>
</div>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-status-success">{"credit_score"}</span>
<span>{"Hủy miễn phí trước 2h"}</span>
</div>
</div>
</div>

<div className="rounded-xl bg-surface-container p-space-md text-on-surface-variant text-body-sm flex items-start gap-space-sm">
<span className="material-symbols-outlined text-secondary text-[24px] shrink-0">{"shield_with_heart"}</span>
<div>
<h4 className="font-label-md text-label-md text-primary font-bold">{"Cam kết Kanow Elite Chuyến Đi"}</h4>
<p className="text-[12px] leading-relaxed text-text-muted mt-0.5">{"Nếu tài xế trễ hẹn quá 15 phút mà không báo trước, quý khách được hoàn 100% chi phí chuyến đi và miễn phí cước cho hành trình tiếp theo."}</p>
</div>
</div>
</div>
</div>
</section>


</div></main>
  );
}
