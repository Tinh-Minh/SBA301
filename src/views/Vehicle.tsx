import Link from "next/link";

export default function Vehicle() {
  return (
<main className="w-full pt-20 bg-surface"><div className="flex flex-col w-full">

<section className="w-full bg-surface-canvas py-space-sm shadow-sm">
</section>

<section className="max-w-[1240px] mx-auto px-margin pt-space-lg pb-space-2xl w-full">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

<div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-space-xl min-w-0">

<div className="flex flex-col gap-space-xs">
<div className="flex flex-wrap items-center gap-space-xs">
<span className="px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-md text-[11px] tracking-wide uppercase font-bold">{"D-SUV 5 Chỗ Điện"}</span>
<span className="px-2.5 py-1 rounded-full bg-status-success/15 text-status-success font-label-md text-[11px] font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">{"bolt"}</span>{"\n              Miễn Phí Sạc V-GREEN\n            "}</span>
<span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-label-md text-[11px] font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">{"verified"}</span>{"\n              Xe Đối Tác Xác Thực\n            "}</span>
</div>
<div className="flex flex-wrap items-baseline justify-between gap-space-sm pt-1">
<h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{"VinFast VF 8 Plus 2024"}</h1>
<div className="flex items-center gap-2">
<div className="flex items-center text-tertiary-container font-label-lg text-label-lg">
<span className="material-symbols-outlined text-[20px] text-on-tertiary-container" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="ml-1 font-bold text-on-surface">{"4.98"}</span>
</div>
<span className="text-text-muted font-body-sm text-body-sm">{"(186 lượt đánh giá • 214 chuyến)"}</span>
</div>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">{"Màu ngoại thất: Xanh Biển Sâu (Deep Ocean Metallic) • Nội thất da nâu Saddle sang trọng"}</p>
</div>

<div className="flex flex-col gap-space-sm">

<div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-surface-container-high shadow-md group">
<img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="/images/ab143452144828d8.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />

<div className="absolute top-4 left-4 flex flex-wrap gap-2">
<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-canvas/90 backdrop-blur-md shadow-sm text-primary font-label-md text-[12px] font-bold">
<span className="material-symbols-outlined text-[16px] text-status-success">{"timer"}</span>{"\n                Sẵn sàng giao 30p\n              "}</div>
<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-canvas/90 backdrop-blur-md shadow-sm text-primary font-label-md text-[12px] font-bold">
<span className="material-symbols-outlined text-[16px] text-secondary">{"sanitizer"}</span>{"\n                100% Khử khuẩn Ozone\n              "}</div>
<div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-canvas/90 backdrop-blur-md shadow-sm text-primary font-label-md text-[12px] font-bold">
<span className="material-symbols-outlined text-[16px] text-tertiary-container">{"shield"}</span>{"\n                Bảo hiểm 2 chiều MIC\n              "}</div>
</div>

<div className="absolute bottom-4 right-4 flex items-center gap-2">
<button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface font-label-md text-label-md hover:bg-inverse-surface transition-all shadow-md" type="button">
<span className="material-symbols-outlined text-[18px]">{"360"}</span>{"\n                Xem toàn cảnh 360°\n              "}</button>
<button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface font-label-md text-label-md hover:bg-inverse-surface transition-all shadow-md" type="button">
<span className="material-symbols-outlined text-[18px]">{"play_circle"}</span>{"\n                Video kiểm định\n              "}</button>
</div>
</div>

<div className="grid grid-cols-4 gap-space-sm">
<div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-high shadow-sm hover:opacity-90 cursor-pointer">
<img className="w-full h-full object-cover" src="/images/672f2b89988bc63c.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-inverse-surface/75 text-inverse-on-surface font-label-md text-[10px]">{"Taplo & Màn hình"}</span>
</div>
<div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-high shadow-sm hover:opacity-90 cursor-pointer">
<img className="w-full h-full object-cover" src="/images/cfa7fc3195424803.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-inverse-surface/75 text-inverse-on-surface font-label-md text-[10px]">{"Hàng ghế sau"}</span>
</div>
<div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-high shadow-sm hover:opacity-90 cursor-pointer">
<img className="w-full h-full object-cover" src="/images/ac44e64de93391ff.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-inverse-surface/75 text-inverse-on-surface font-label-md text-[10px]">{"Khoang hành lý"}</span>
</div>
<div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-high shadow-sm hover:opacity-90 cursor-pointer">
<img className="w-full h-full object-cover" src="/images/378f5d095793f010.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-inverse-surface/75 text-inverse-on-surface font-label-md text-[10px]">{"Mâm 20 inch & Sạc"}</span>
</div>
</div>
</div>

<div className="flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<h2 className="font-headline-sm text-headline-sm text-primary">{"Thông số vận hành nổi bật"}</h2>
<span className="font-label-md text-label-md text-secondary cursor-pointer hover:underline">{"Chi tiết kỹ thuật VinFast VF 8"}</span>
</div>
<div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
<div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-1">
<div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary mb-1">
<span className="material-symbols-outlined text-[24px]">{"ev_station"}</span>
</div>
<span className="font-body-sm text-body-sm text-text-muted">{"Quãng đường / lần sạc"}</span>
<span className="font-headline-sm text-headline-sm text-primary">{"420 km"}</span>
<span className="font-label-md text-[11px] text-status-success font-semibold">{"Miễn phí sạc V-GREEN"}</span>
</div>
<div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-1">
<div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary mb-1">
<span className="material-symbols-outlined text-[24px]">{"speed"}</span>
</div>
<span className="font-body-sm text-body-sm text-text-muted">{"Công suất cực đại"}</span>
<span className="font-headline-sm text-headline-sm text-primary">{"402 HP"}</span>
<span className="font-label-md text-[11px] text-on-surface-variant">{"0-100 km/h: 5.5 giây"}</span>
</div>
<div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-1">
<div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary mb-1">
<span className="material-symbols-outlined text-[24px]">{"all_inclusive"}</span>
</div>
<span className="font-body-sm text-body-sm text-text-muted">{"Hệ dẫn động"}</span>
<span className="font-headline-sm text-headline-sm text-primary">{"2 Cầu AWD"}</span>
<span className="font-label-md text-[11px] text-on-surface-variant">{"Hộp số tự động 1 cấp"}</span>
</div>
<div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-1">
<div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary mb-1">
<span className="material-symbols-outlined text-[24px]">{"smart_toy"}</span>
</div>
<span className="font-body-sm text-body-sm text-text-muted">{"Trợ lái thông minh"}</span>
<span className="font-headline-sm text-headline-sm text-primary">{"ADAS Level 2"}</span>
<span className="font-label-md text-[11px] text-primary font-semibold">{"Tự giữ làn & Ga thích ứng"}</span>
</div>
</div>
</div>

<div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<h2 className="font-headline-sm text-headline-sm text-primary">{"Tiện nghi & Trang bị công nghệ trên xe"}</h2>
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-md">
<div className="flex items-start gap-space-sm">
<div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[20px]">{"tv"}</span>
</div>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg text-on-surface">{"Màn hình 15.6 inch"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Apple CarPlay, Android Auto không dây, trợ lý ảo ViVi"}</span>
</div>
</div>
<div className="flex items-start gap-space-sm">
<div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[20px]">{"roofing"}</span>
</div>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg text-on-surface">{"Cửa sổ trời toàn cảnh"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Kính Panorama chống tia UV 99%, đóng mở điện"}</span>
</div>
</div>
<div className="flex items-start gap-space-sm">
<div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[20px]">{"airline_seat_recline_extra"}</span>
</div>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg text-on-surface">{"Ghế da sưởi & làm mát"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Chỉnh điện 12 hướng, nhớ vị trí ghế lái, thông gió mát mẻ"}</span>
</div>
</div>
<div className="flex items-start gap-space-sm">
<div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[20px]">{"volume_up"}</span>
</div>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg text-on-surface">{"Hệ thống 10 Loa cao cấp"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Âm vòm Subwoofer sống động cho chuyến đi xa"}</span>
</div>
</div>
<div className="flex items-start gap-space-sm">
<div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[20px]">{"battery_charging_full"}</span>
</div>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg text-on-surface">{"Sạc không dây Qi & Type-C"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Hỗ trợ sạc nhanh cho cả hàng ghế trước và sau"}</span>
</div>
</div>
<div className="flex items-start gap-space-sm">
<div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[20px]">{"air"}</span>
</div>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg text-on-surface">{"Điều hòa 2 vùng ion hóa"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Lọc bụi mịn PM2.5, khử mùi kháng khuẩn tự động"}</span>
</div>
</div>
</div>
</div>

<div className="p-space-lg rounded-2xl bg-surface-container-low shadow-sm flex flex-col gap-space-md">
<div className="flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm">
<div className="w-11 h-11 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-[26px]">{"task_alt"}</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-primary">{"Hồ Sơ Kỹ Thuật & Báo Cáo Kiểm Định 120 Điểm"}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Kiểm định độc lập bởi Kanow Automotive Lab ngày 22/03/2025"}</p>
</div>
</div>
<span className="px-3 py-1 rounded-full bg-status-success text-on-primary font-label-md text-label-md font-bold">{"ĐẠT LOẠI A+"}</span>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm pt-2">
<div className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col">
<span className="font-body-sm text-body-sm text-text-muted">{"Hạn đăng kiểm:"}</span>
<span className="font-label-lg text-label-lg text-primary">{"Tháng 06/2027"}</span>
<span className="font-label-md text-[11px] text-status-success mt-1">{"Hợp chuẩn bộ GTVT"}</span>
</div>
<div className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col">
<span className="font-body-sm text-body-sm text-text-muted">{"Lịch sử bảo dưỡng:"}</span>
<span className="font-label-lg text-label-lg text-primary">{"VinFast 3S định kỳ"}</span>
<span className="font-label-md text-[11px] text-on-surface-variant mt-1">{"Vừa bảo dưỡng ở 15.000km"}</span>
</div>
<div className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col">
<span className="font-body-sm text-body-sm text-text-muted">{"Độ mới lốp xe:"}</span>
<span className="font-label-lg text-label-lg text-primary">{"Độ mòn < 5% (Mới 95%)"}</span>
<span className="font-label-md text-[11px] text-status-success mt-1">{"Áp suất lốp chuẩn 2.7 bar"}</span>
</div>
<div className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col">
<span className="font-body-sm text-body-sm text-text-muted">{"Tình trạng pin:"}</span>
<span className="font-label-lg text-label-lg text-primary">{"SOH 99.4% (Tối ưu)"}</span>
<span className="font-label-md text-[11px] text-secondary mt-1">{"Được phủ bảo hiểm pin"}</span>
</div>
</div>
</div>

<div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<h2 className="font-headline-sm text-headline-sm text-primary">{"Thủ Tục Thuê Xe & Cam Kết Minh Bạch"}</h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
<div className="flex flex-col gap-space-sm">
<div className="flex items-center gap-2 text-primary font-label-lg text-label-lg">
<span className="material-symbols-outlined text-[22px] text-secondary">{"badge"}</span>{"\n                1. Giấy tờ định danh cần thiết\n              "}</div>
<ul className="flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant pl-7 list-disc">
<li className="">{"Căn cước công dân gắn chip hoặc tài khoản "}<strong>{"VNeID cấp 2"}</strong>{" (Kanow quét số, không giữ bản gốc)."}</li>
<li className="">{"Giấy phép lái xe hạng B1/B2 còn hạn tối thiểu 03 tháng."}</li>
<li className="">{"Đối với khách ngoại quốc: Hộ chiếu (Passport) + Giấy phép lái xe quốc tế (IDP) hợp lệ."}</li>
</ul>
</div>
<div className="flex flex-col gap-space-sm">
<div className="flex items-center gap-2 text-primary font-label-lg text-label-lg">
<span className="material-symbols-outlined text-[22px] text-secondary">{"security"}</span>{"\n                2. Quy định đặt cọc (Thế chấp)\n              "}</div>
<ul className="flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant pl-7 list-disc">
<li className=""><strong>{"0 VNĐ Đặt cọc:"}</strong>{" Khách hàng để lại xe máy chính chủ (kèm cà vẹt gốc giá trị trên 15 triệu)."}</li>
<li className=""><strong>{"Cọc tiền mặt / Chuyển khoản:"}</strong>{" 10.000.000 VNĐ. Hoàn trả 100% qua tài khoản tức thì sau khi bàn giao nghiệm thu xe."}</li>
<li className="">{"Hợp đồng điện tử minh bạch ký trực tiếp qua SMS OTP 3 phút."}</li>
</ul>
</div>
</div>
</div>

<div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-lg">
<div className="flex flex-wrap items-center justify-between gap-space-sm">
<div>
<h2 className="font-headline-sm text-headline-sm text-primary">{"Đánh Giá Từ Khách Hàng Thực Tế"}</h2>
<p className="font-body-sm text-body-sm text-text-muted">{"Được xác minh từ 186 hành trình Kanow gần nhất"}</p>
</div>
<div className="flex items-center gap-2">
<span className="px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-label-md font-bold">{"Tất cả (186)"}</span>
<span className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-md cursor-pointer transition-colors">{"Có ảnh (48)"}</span>
</div>
</div>

<div className="flex flex-col gap-space-sm pb-space-md border-b-0">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-[14px]">{"\n                  TL\n                "}</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface">{"Trần Hoàng Long"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Thuê đi Đà Lạt 4 ngày 3 đêm • 14/03/2025"}</div>
</div>
</div>
<div className="flex text-on-tertiary-container">
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
</div>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n              Xe cực kỳ mới, giao xe tại sân bay Tân Sơn Nhất đúng giờ từng phút. Xe đi đèo Prenn rất khỏe, bám đường chắc chắn. Tính năng tự lái thích ứng ADAS trên cao tốc Dầu Giây - Phan Thiết chạy nhàn tênh, sạc trạm VinFast thì miễn phí tiết kiệm cả triệu tiền xăng!\n            "}</p>
<div className="flex gap-2">
<div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover" src="/images/1a7824132bcc50ca.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
</div>
<div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover" src="/images/e220ce87b16db70f.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
</div>
</div>
</div>

<div className="flex flex-col gap-space-sm pt-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-[14px]">{"\n                  MP\n                "}</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface">{"Mai Phương Thảo"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Thuê công tác gia đình • 02/03/2025"}</div>
</div>
</div>
<div className="flex text-on-tertiary-container">
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
</div>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n              Thủ tục check-in qua app VNeID chỉ 2 phút là xong, không bị giữ căn cước. Xe sạch bong không hề có mùi hôi như xe thuê truyền thống. Cốp rộng chở được 4 vali của cả nhà. Lần tới nhất định sẽ tiếp tục thuê của Kanow.\n            "}</p>
</div>
</div>
</div>

<div className="lg:col-span-5 xl:col-span-4 sticky top-24 flex flex-col gap-space-md">
<div className="w-full p-space-lg rounded-2xl bg-surface-container-lowest shadow-xl flex flex-col gap-space-md">

<div className="flex flex-col gap-2 pb-space-sm border-b border-border-subtle"><div className="flex items-center justify-between"><span className="font-body-sm text-body-sm text-text-muted">{"Giá thuê ưu đãi"}</span></div><div className="flex flex-col gap-1"><div className="flex items-baseline justify-center gap-1.5"><span className="font-price-display text-[28px] text-primary font-bold tracking-tight">{"1.250.000₫"}</span><span className="font-body-md text-body-md text-text-muted whitespace-nowrap">{"/ ngày"}</span></div><div className="flex items-center justify-center gap-2 pt-1"><span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-[11px] font-bold whitespace-nowrap">{"Cuối tuần: 1.450.000₫"}</span><span className="font-label-md text-label-md text-status-success font-medium whitespace-nowrap">{"Tiết kiệm 20% tháng này"}</span></div></div></div>

<div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-space-sm">
<div className="grid grid-cols-2 gap-2">
<div className="flex flex-col p-2 bg-surface-container-lowest rounded-lg shadow-sm">
<label className="font-label-md text-[11px] text-text-muted flex items-center gap-1 font-semibold">
<span className="material-symbols-outlined text-[14px] text-primary">{"calendar_today"}</span>{"\n                  NHẬN XE\n                "}</label>
<input className="bg-transparent font-label-md text-label-md text-primary font-bold focus:outline-none pt-0.5" type="text" defaultValue="08:00 • 28/03/2025" aria-label="Thông tin" />
</div>
<div className="flex flex-col p-2 bg-surface-container-lowest rounded-lg shadow-sm">
<label className="font-label-md text-[11px] text-text-muted flex items-center gap-1 font-semibold">
<span className="material-symbols-outlined text-[14px] text-primary">{"event_available"}</span>{"\n                  TRẢ XE\n                "}</label>
<input className="bg-transparent font-label-md text-label-md text-primary font-bold focus:outline-none pt-0.5" type="text" defaultValue="20:00 • 30/03/2025" aria-label="Thông tin" />
</div>
</div>

<div className="flex items-center justify-between px-2 pt-1">
<span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-secondary">{"schedule"}</span>{"\n                Tổng thời gian thuê:\n              "}</span>
<span className="font-label-md text-label-md text-primary font-bold">{"2.5 Ngày (Làm tròn 3 ngày)"}</span>
</div>
</div>

<div className="flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[18px] text-primary">{"near_me"}</span>{"\n              Địa điểm giao nhận xe\n            "}</label>
<div className="relative">
<select className="w-full py-2.5 px-3 rounded-xl bg-surface-container-low font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-secondary/40" defaultValue="Sân bay Tân Sơn Nhất (Ga Quốc Nội/Quốc Tế)">
<option>{"Sân bay Tân Sơn Nhất (Ga Quốc Nội/Quốc Tế)"}</option>
<option>{"Giao tận nơi tại nhà (Nội thành TP.HCM)"}</option>
<option>{"Văn phòng Kanow Quận 1 (Bến Nghé)"}</option>
<option>{"Khu đô thị Vinhomes Grand Park (TP. Thủ Đức)"}</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-text-muted text-[20px]">{"expand_more"}</span>
</div>
</div>

<div className="flex flex-col gap-2 pt-1">
<span className="font-label-md text-label-md text-on-surface font-semibold">{"Dịch vụ bổ sung đề xuất:"}</span>
<label className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer">
<div className="flex items-center gap-2.5">
<input className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary" id="addon-insurance" type="checkbox" defaultChecked={true} aria-label="Chọn tùy chọn" />
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">{"Bảo Hiểm Thân Vỏ Toàn Diện VIP"}</span>
<span className="font-body-sm text-[11px] text-text-muted">{"Miễn hoàn toàn mức khấu trừ rủi ro"}</span>
</div>
</div>
<span className="font-label-md text-label-md text-primary font-bold">{"+99k/ngày"}</span>
</label>
<label className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer">
<div className="flex items-center gap-2.5">
<input className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary" id="addon-driver" type="checkbox" aria-label="Chọn tùy chọn" />
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">{"Thuê kèm tài xế chuyên nghiệp"}</span>
<span className="font-body-sm text-[11px] text-text-muted">{"Lịch thiệp, thông thạo đường dài, 10h/ngày"}</span>
</div>
</div>
<span className="font-label-md text-label-md text-primary font-bold">{"+400k/ngày"}</span>
</label>
<label className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer">
<div className="flex items-center gap-2.5">
<input className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary" id="addon-seat" type="checkbox" aria-label="Chọn tùy chọn" />
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">{"Ghế an toàn trẻ em ISOFIX"}</span>
<span className="font-body-sm text-[11px] text-text-muted">{"Cho bé từ 1 - 5 tuổi"}</span>
</div>
</div>
<span className="font-label-md text-label-md text-primary font-bold">{"+50k/ngày"}</span>
</label>
</div>

<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-2 font-body-sm text-body-sm">
<div className="flex justify-between text-on-surface-variant">
<span className="">{"Đơn giá thuê (3 ngày x 1.250.000₫):"}</span>
<span className="font-medium text-on-surface">{"3.750.000₫"}</span>
</div>
<div className="flex justify-between text-on-surface-variant">
<span className="">{"Bảo hiểm VIP (3 ngày x 99.000₫):"}</span>
<span className="font-medium text-on-surface">{"297.000₫"}</span>
</div>
<div className="flex justify-between text-on-surface-variant">
<span className="">{"Thuế GTGT (VAT 8%):"}</span>
<span className="font-medium text-on-surface">{"323.760₫"}</span>
</div>
<div className="flex justify-between text-status-success font-medium">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">{"loyalty"}</span>{"\n                Voucher KANOWNEW (-15%):\n              "}</span>
<span className="">{"- 562.500₫"}</span>
</div>
<div className="w-full h-px bg-outline-variant/30 my-1"></div>
<div className="flex items-baseline justify-between pt-1">
<span className="font-label-lg text-label-lg text-primary font-bold">{"Tổng chi phí dự kiến:"}</span>
<span className="font-price-display text-2xl text-primary font-bold">{"3.808.260₫"}</span>
</div>
<div className="font-body-sm text-[11px] text-text-muted text-right">{"Đã bao gồm năng lượng sạc và VAT"}</div>
</div>

<div className="flex flex-col gap-2.5">
<button className="w-full py-3.5 px-6 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2" type="button" data-action="book">
<span className="material-symbols-outlined text-[20px]">{"electric_bolt"}</span>{"\n              TIẾN HÀNH ĐẶT XE NGAY\n            "}</button>
<div className="flex items-center justify-center gap-1.5 font-label-md text-label-md text-on-surface-variant">
<span className="material-symbols-outlined text-[16px] text-status-success">{"check_circle"}</span>
<span className="">{"Giữ xe 0đ • Hủy miễn phí trước 24 giờ"}</span>
</div>
</div>

<div className="flex items-center justify-center gap-2 pt-2 border-t-0">
<span className="font-body-sm text-body-sm text-text-muted">{"Cần tư vấn hỗ trợ lộ trình?"}</span>
<a className="font-label-md text-label-md text-secondary hover:underline font-bold flex items-center gap-1" href="tel:19008888">
<span className="material-symbols-outlined text-[16px]">{"call"}</span>{"\n              Hotline 1900 8888\n            "}</a>
</div>
</div>

<div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[22px]">{"verified_user"}</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface font-bold">{"Cam Kết Không Phát Sinh Chi Phí Ẩn"}</span>
<span className="font-body-sm text-[11px] text-text-muted">{"Tất cả chi phí đã được hiển thị minh bạch trong hợp đồng"}</span>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface-canvas py-space-2xl">
<div className="max-w-[1240px] mx-auto px-margin flex flex-col gap-space-lg">
<div className="flex flex-wrap items-end justify-between gap-space-sm">
<div>
<span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-bold">{"Đề Xuất Cùng Phân Khúc"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">{"Dòng Xe Tương Tự Phù Hợp Cho Chuyến Đi"}</h2>
</div>
<Link className="inline-flex items-center gap-1 font-label-lg text-label-lg text-primary hover:text-secondary transition-colors" href="/lien-he">{"\n          Xem toàn bộ đội xe\n          "}<span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
</Link>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">

<div className="rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group" data-vehicle-card="sedan" data-vehicle-name="Mazda CX-5 Premium 2024" data-price="1050000">
<div className="relative w-full aspect-[16/10] bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="/images/970382a25d330c99.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-on-surface font-label-md text-[11px] font-semibold">{"\n              Xăng • 5 Chỗ\n            "}</span>
</div>
<div className="p-space-md flex flex-col gap-space-sm">
<div className="flex items-start justify-between">
<div>
<h3 className="font-headline-sm text-headline-sm text-primary">{"Mazda CX-5 Premium 2024"}</h3>
<span className="font-body-sm text-body-sm text-text-muted">{"Số tự động • Đỏ Pha Lê"}</span>
</div>
<div className="flex items-center text-tertiary-container font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px] text-on-tertiary-container" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="ml-0.5 font-bold text-on-surface">{"4.95"}</span>
</div>
</div>
<div className="flex items-center gap-3 py-1 font-body-sm text-body-sm text-on-surface-variant">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"airline_seat_recline_normal"}</span>{" 5 ghế"}</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"luggage"}</span>{" 3 vali"}</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"local_gas_station"}</span>{" 6.8L/100km"}</span>
</div>
<div className="flex items-center justify-between pt-2 border-t-0">
<div>
<span className="font-price-display text-price-display text-primary font-bold">{"1.050.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
<button className="px-4 py-2 rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary font-label-md text-label-md font-bold transition-all" type="button" data-action="detail">{"\n                Xem chi tiết\n              "}</button>
</div>
</div>
</div>

<div className="rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group" data-vehicle-card="suv" data-vehicle-name="Toyota Fortuner Legender 2024" data-price="1400000">
<div className="relative w-full aspect-[16/10] bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="/images/63d3ce540e6ce05e.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-on-surface font-label-md text-[11px] font-semibold">{"\n              Dầu • 7 Chỗ Gầm Cao\n            "}</span>
</div>
<div className="p-space-md flex flex-col gap-space-sm">
<div className="flex items-start justify-between">
<div>
<h3 className="font-headline-sm text-headline-sm text-primary">{"Toyota Fortuner Legender 2024"}</h3>
<span className="font-body-sm text-body-sm text-text-muted">{"Máy dầu • Trắng Ngọc Trai"}</span>
</div>
<div className="flex items-center text-tertiary-container font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px] text-on-tertiary-container" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="ml-0.5 font-bold text-on-surface">{"4.92"}</span>
</div>
</div>
<div className="flex items-center gap-3 py-1 font-body-sm text-body-sm text-on-surface-variant">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"airline_seat_recline_normal"}</span>{" 7 ghế"}</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"luggage"}</span>{" 4 vali"}</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"terrain"}</span>{" 4x2 Cầu sau"}</span>
</div>
<div className="flex items-center justify-between pt-2 border-t-0">
<div>
<span className="font-price-display text-price-display text-primary font-bold">{"1.400.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
<button className="px-4 py-2 rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary font-label-md text-label-md font-bold transition-all" type="button" data-action="detail">{"\n                Xem chi tiết\n              "}</button>
</div>
</div>
</div>

<div className="rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group" data-vehicle-card="suv" data-vehicle-name="Kia Carnival Signature 2024" data-price="1850000">
<div className="relative w-full aspect-[16/10] bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="/images/499e2b90f7165550.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-on-surface font-label-md text-[11px] font-semibold">{"\n              MPV • 7 Chỗ VIP\n            "}</span>
</div>
<div className="p-space-md flex flex-col gap-space-sm">
<div className="flex items-start justify-between">
<div>
<h3 className="font-headline-sm text-headline-sm text-primary">{"Kia Carnival Signature 2024"}</h3>
<span className="font-body-sm text-body-sm text-text-muted">{"Ghế thương gia Ottoman • Đen"}</span>
</div>
<div className="flex items-center text-tertiary-container font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px] text-on-tertiary-container" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="ml-0.5 font-bold text-on-surface">{"4.99"}</span>
</div>
</div>
<div className="flex items-center gap-3 py-1 font-body-sm text-body-sm text-on-surface-variant">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"airline_seat_recline_normal"}</span>{" 7 ghế VIP"}</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"luggage"}</span>{" 5 vali"}</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"sensor_door"}</span>{" Cửa trượt điện"}</span>
</div>
<div className="flex items-center justify-between pt-2 border-t-0">
<div>
<span className="font-price-display text-price-display text-primary font-bold">{"1.850.000₫"}</span>
<span className="font-body-sm text-body-sm text-text-muted">{"/ ngày"}</span>
</div>
<button className="px-4 py-2 rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary font-label-md text-label-md font-bold transition-all" type="button" data-action="detail">{"\n                Xem chi tiết\n              "}</button>
</div>
</div>
</div>
</div>
</div>
</section>
</div></main>
  );
}
