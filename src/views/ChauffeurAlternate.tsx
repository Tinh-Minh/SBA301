import Link from "next/link";

export default function ChauffeurAlternate() {
  return (
<main className="w-full pt-20 bg-surface"><div className="flex flex-col w-full">

<section className="relative w-full bg-gradient-to-b from-surface via-surface-container-low to-surface pt-6 pb-20 overflow-hidden">

<div className="absolute -top-32 right-10 w-96 h-96 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none"></div>
<div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-primary-fixed/40 blur-3xl pointer-events-none"></div>
<div className="max-w-[1240px] mx-auto px-margin relative z-10">

<div className="flex flex-wrap items-center justify-between gap-4 mb-8">
<div className="flex items-center gap-2 font-label-md text-label-md text-text-muted">
<span>{"Trang chủ"}</span>
<span className="material-symbols-outlined text-[14px]">{"chevron_right"}</span>
<span className="text-primary font-semibold">{"Thuê xe kèm tài xế & Đón tiễn sân bay"}</span>
</div>
<div className="inline-flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full text-on-surface">
<span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
<span className="font-label-md text-label-md">{"Đội ngũ hơn 1,200 bác tài 5 sao sẵn sàng phục vụ"}</span>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
<div className="lg:col-span-8 flex flex-col gap-4">
<div className="inline-flex items-center gap-2 text-secondary font-label-lg text-label-lg tracking-wider uppercase font-bold">
<span className="material-symbols-outlined text-[20px]">{"verified_user"}</span>{"\n            Dịch Vụ Vận Chuyển Chuẩn Chuyên Cơ Mặt Đất\n          "}</div>
<h1 className="font-display-hero text-display-hero text-primary tracking-tight">{"\n            Thư thái hành trình, "}<br />
<span className="text-tertiary-container italic font-normal">{"chu toàn từng dặm đón tiễn."}</span>
</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">{"\n            Tận hưởng trọn vẹn sự êm ái với dòng xe đời mới cùng tài xế chuyên nghiệp, đúng giờ tuyệt đối và am hiểu tường tận mọi tuyến lộ trình. Giá trọn gói niêm yết, không phát sinh phụ phí ẩn.\n          "}</p>
</div>
<div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-end">
<div className="p-4 bg-surface-container-lowest rounded-xl shadow-sm flex items-center gap-4 w-full sm:w-auto">
<div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[26px]">{"flight_takeoff"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-primary font-bold">{"Đón tiễn sân bay"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Miễn phí chờ 60p khi delay"}</div>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden">

<div className="grid grid-cols-2 bg-surface-container-low" id="serviceTabContainer">
<button className="py-4 px-6 font-label-lg text-label-lg text-primary bg-surface-container-lowest shadow-sm flex items-center justify-center gap-2 transition-all" id="tabCarDriver" type="button" data-handler="switchChauffeurTab" data-args="'car-driver'">
<span className="material-symbols-outlined text-[22px]">{"directions_car"}</span>
<span>{"Trọn Gói Xe Kèm Bác Tài"}</span>
<span className="ml-2 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-md font-bold">{"Phổ biến"}</span>
</button>
<button className="py-4 px-6 font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface bg-surface-container-low flex items-center justify-center gap-2 transition-all" id="tabDriverOnly" type="button" data-handler="switchChauffeurTab" data-args="'driver-only'">
<span className="material-symbols-outlined text-[22px]">{"person_check"}</span>
<span>{"Thuê Tài Xế Riêng (Lái Xe Của Bạn)"}</span>
</button>
</div>

<div className="p-6 md:p-8">
<form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-center">

<div className="lg:col-span-3 flex flex-col gap-1.5 bg-surface-container-low p-3.5 rounded-lg">
<label className="font-label-md text-label-md text-text-muted flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-primary">{"alt_route"}</span>{"\n                Gói dịch vụ\n              "}</label>
<select className="bg-transparent font-label-lg text-label-lg text-on-surface outline-none cursor-pointer">
<option value="airport">{"Đón / Tiễn Sân Bay (Nội Bài / Tân Sơn Nhất)"}</option>
<option value="city">{"Công tác & Gặp đối tác nội đô"}</option>
<option value="interprovincial">{"Liên tỉnh 1 chiều & khứ hồi"}</option>
<option value="hourly">{"Thuê linh hoạt theo giờ (4h / 8h)"}</option>
</select>
</div>

<div className="lg:col-span-3 flex flex-col gap-1.5 bg-surface-container-low p-3.5 rounded-lg">
<label className="font-label-md text-label-md text-text-muted flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-primary">{"pin_drop"}</span>{"\n                Điểm đón\n              "}</label>
<div className="flex items-center gap-2">
<input className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline outline-none font-medium truncate" placeholder="Nhập địa chỉ đón / Số hiệu chuyến bay..." type="text" defaultValue="Ga T2 - Sân bay Quốc tế Nội Bài" aria-label="Nhập địa chỉ đón / Số hiệu chuyến bay..." />
</div>
</div>

<div className="lg:col-span-3 flex flex-col gap-1.5 bg-surface-container-low p-3.5 rounded-lg">
<label className="font-label-md text-label-md text-text-muted flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-primary">{"flag"}</span>{"\n                Điểm đến\n              "}</label>
<div className="flex items-center gap-2">
<input className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline outline-none font-medium truncate" placeholder="Nhập điểm trả xe..." type="text" defaultValue="Khách sạn Melia, 44 Lý Thường Kiệt, HN" aria-label="Nhập điểm trả xe..." />
</div>
</div>

<div className="lg:col-span-3 flex flex-col gap-1.5 bg-surface-container-low p-3.5 rounded-lg">
<label className="font-label-md text-label-md text-text-muted flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-primary">{"calendar_clock"}</span>{"\n                Thời gian đón\n              "}</label>
<div className="flex items-center justify-between text-on-surface font-label-lg text-label-lg">
<span>{"08:30 • 28/10/2025"}</span>
<span className="material-symbols-outlined text-[18px] text-text-muted">{"expand_more"}</span>
</div>
</div>

<div className="lg:col-span-9 flex flex-wrap items-center gap-3 pt-2">
<span className="font-label-md text-label-md text-text-muted">{"Hạng xe:"}</span>
<button className="px-3.5 py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md" type="button" data-action="filter">{"Sedan 4 Chỗ (Camry/Vios)"}</button>
<button className="px-3.5 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors" type="button" data-action="filter">{"SUV 7 Chỗ (Fortuner/Everest)"}</button>
<button className="px-3.5 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors" type="button">{"VIP Carnival / Limousine"}</button>
<button className="px-3.5 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors" type="button">{"Mercedes E/S-Class"}</button>
</div>

<div className="lg:col-span-3 pt-2">
<button className="w-full py-3.5 px-6 rounded-full bg-tertiary-container hover:bg-tertiary text-on-tertiary font-label-lg text-label-lg tracking-wide uppercase font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all" type="button">
<span className="material-symbols-outlined text-[20px]">{"search"}</span>{"\n                Tra cứu giá ngay\n              "}</button>
</div>
</form>
</div>

<div className="bg-surface-container px-6 py-3 flex flex-wrap items-center justify-around gap-4 text-text-muted font-body-sm text-body-sm">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px] text-status-success">{"check_circle"}</span>{"\n            Giá hiển thị là giá cuối cùng (đã gồm xăng dầu & cầu đường)\n          "}</div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px] text-status-success">{"check_circle"}</span>{"\n            Biển đón tên tại sảnh ga đến theo yêu cầu\n          "}</div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px] text-status-success">{"check_circle"}</span>{"\n            Bảo hiểm hành khách chuyến đi mức đền bù tối đa 500 triệu/người\n          "}</div>
</div>
</div>
</div>
</section>

<section className="w-full py-16 bg-surface-container-lowest">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
<div>
<div className="font-label-md text-label-md text-secondary font-bold uppercase tracking-wider mb-2">{"Tiêu chuẩn Kanow First-Class"}</div>
<h2 className="font-headline-lg text-headline-lg text-primary">{"Cam kết vàng cho từng km di chuyển"}</h2>
</div>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md">{"\n          Không đơn thuần là đưa đón, Kanow kiến tạo không gian di chuyển lịch lãm, riêng tư và chuẩn xác từng phút bấm giờ.\n        "}</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">

<div className="p-6 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between gap-6">
<div className="w-12 h-12 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-[28px]">{"schedule"}</span>
</div>
<div className="flex flex-col gap-2">
<div className="font-headline-sm text-headline-sm text-primary">{"Đúng giờ tuyệt đối"}</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"\n              Tài xế luôn có mặt trước điểm hẹn 15-20 phút. Nếu chậm trễ quá 10 phút không do bất khả kháng, hoàn 50% tiền cước.\n            "}</p>
</div>
<div className="font-label-md text-label-md text-secondary font-bold flex items-center gap-1">{"\n            Chính sách On-Time 100%\n            "}<span className="material-symbols-outlined text-[16px]">{"arrow_forward"}</span>
</div>
</div>

<div className="p-6 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between gap-6">
<div className="w-12 h-12 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-[28px]">{"shield"}</span>
</div>
<div className="flex flex-col gap-2">
<div className="font-headline-sm text-headline-sm text-primary">{"Tài xế chuẩn 5 sao"}</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"\n              100% tài xế có trên 5 năm kinh nghiệm lái an toàn, giao tiếp tiếng Anh cơ bản, lịch thiệp, mặc đồng phục sơ mi chỉnh tề.\n            "}</p>
</div>
<div className="font-label-md text-label-md text-secondary font-bold flex items-center gap-1">{"\n            Xác minh tư pháp & hồ sơ\n            "}<span className="material-symbols-outlined text-[16px]">{"arrow_forward"}</span>
</div>
</div>

<div className="p-6 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between gap-6">
<div className="w-12 h-12 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-[28px]">{"receipt_long"}</span>
</div>
<div className="flex flex-col gap-2">
<div className="font-headline-sm text-headline-sm text-primary">{"Giá niêm yết minh bạch"}</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"\n              Giá trọn gói gồm phí cầu đường, nhiên liệu, thời gian chờ sân bay và bảo hiểm. Không tip bắt buộc, xuất hóa đơn VAT trong ngày.\n            "}</p>
</div>
<div className="font-label-md text-label-md text-secondary font-bold flex items-center gap-1">{"\n            Không phụ phí giờ cao điểm\n            "}<span className="material-symbols-outlined text-[16px]">{"arrow_forward"}</span>
</div>
</div>

<div className="p-6 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between gap-6">
<div className="w-12 h-12 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-[28px]">{"airline_seat_recline_extra"}</span>
</div>
<div className="flex flex-col gap-2">
<div className="font-headline-sm text-headline-sm text-primary">{"Xe mới, sạch & thơm"}</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"\n              Dàn xe đời 2022 - 2025 được vệ sinh khử khuẩn trước mỗi chuyến đi. Trang bị sẵn nước suối mát, khăn lạnh và cổng sạc nhanh.\n            "}</p>
</div>
<div className="font-label-md text-label-md text-secondary font-bold flex items-center gap-1">{"\n            Tiêu chuẩn cabin VIP\n            "}<span className="material-symbols-outlined text-[16px]">{"arrow_forward"}</span>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-20 bg-surface">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
<div>
<div className="font-label-md text-label-md text-secondary font-bold uppercase tracking-wider mb-2">{"Đa dạng hành trình"}</div>
<h2 className="font-headline-lg text-headline-lg text-primary">{"Các gói thuê xe kèm tài xế thịnh hành"}</h2>
</div>

<div className="flex flex-wrap items-center gap-2">
<button className="px-4 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md" type="button" data-action="filter">{"Tất cả gói"}</button>
<button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors" type="button">{"Sân bay"}</button>
<button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors" type="button">{"Nội đô City Tour"}</button>
<button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors" type="button">{"Liên tỉnh đường dài"}</button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">

<div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div>
<div className="relative h-56 w-full overflow-hidden bg-surface-container">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/a5aa178a06f38e44.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-4 left-4 bg-primary text-on-primary font-label-md text-label-md px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">{"flight"}</span>{"\n                Đón Tiễn Sân Bay\n              "}</div>
<div className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full font-label-md text-label-md text-primary font-bold">{"\n                Nội Bài / TSN\n              "}</div>
</div>
<div className="p-6 flex flex-col gap-4">
<div>
<h3 className="font-headline-sm text-headline-sm text-primary mb-1">{"Đón tiễn sân bay VIP trọn gói"}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Phục vụ các chặng đón từ sân bay về trung tâm thành phố hoặc ngược lại. Đón tại sảnh với bảng tên riêng."}</p>
</div>

<div className="space-y-2 bg-surface-container-low p-3.5 rounded-lg text-body-sm font-body-sm text-on-surface">
<div className="flex items-center justify-between">
<span className="text-text-muted flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"timer"}</span>{" Chờ đợi miễn phí:"}</span>
<span className="font-semibold">{"60 phút sau hạ cánh"}</span>
</div>
<div className="flex items-center justify-between">
<span className="text-text-muted flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"toll"}</span>{" Vé cầu đường bến bãi:"}</span>
<span className="font-semibold text-status-success">{"Đã bao gồm 100%"}</span>
</div>
<div className="flex items-center justify-between">
<span className="text-text-muted flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"luggage"}</span>{" Hành lý hỗ trợ:"}</span>
<span className="font-semibold">{"Tài xế khuân vác tận xe"}</span>
</div>
</div>
</div>
</div>
<div className="p-6 pt-0">
<div className="flex items-baseline justify-between mb-4">
<div>
<span className="font-body-sm text-body-sm text-text-muted">{"Chỉ từ"}</span>
<div className="font-price-display text-price-display text-primary">{"280.000₫ "}<span className="font-body-sm text-body-sm font-normal text-text-muted">{"/ chuyến"}</span></div>
</div>
<span className="font-label-md text-label-md text-secondary">{"Sedan 4-7 chỗ"}</span>
</div>
<button className="w-full py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-colors flex items-center justify-center gap-2" type="button">
<span>{"Đặt chuyến bay này"}</span>
<span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
</button>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div>
<div className="relative h-56 w-full overflow-hidden bg-surface-container">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/40b1ae5ce3115c13.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-4 left-4 bg-tertiary-container text-on-tertiary font-label-md text-label-md px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">{"business_center"}</span>{"\n                Gặp Đối Tác / City Tour\n              "}</div>
<div className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full font-label-md text-label-md text-primary font-bold">{"\n                Ngoại giao & Doanh nghiệp\n              "}</div>
</div>
<div className="p-6 flex flex-col gap-4">
<div>
<h3 className="font-headline-sm text-headline-sm text-primary mb-1">{"Thuê nội đô theo ngày (8 Giờ / 100km)"}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Lý tưởng cho lịch trình công tác nhiều điểm đến trong ngày, đưa đón đối tác, chuyên gia cấp cao."}</p>
</div>

<div className="space-y-2 bg-surface-container-low p-3.5 rounded-lg text-body-sm font-body-sm text-on-surface">
<div className="flex items-center justify-between">
<span className="text-text-muted flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"av_timer"}</span>{" Thời gian & Quãng đường:"}</span>
<span className="font-semibold">{"8 Tiếng / Giới hạn 100km"}</span>
</div>
<div className="flex items-center justify-between">
<span className="text-text-muted flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"car_rental"}</span>{" Dòng xe tiêu biểu:"}</span>
<span className="font-semibold">{"Camry 2.5Q / Carnival Royal"}</span>
</div>
<div className="flex items-center justify-between">
<span className="text-text-muted flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"badge"}</span>{" Tiêu chuẩn tài xế:"}</span>
<span className="font-semibold">{"Giao tiếp tiếng Anh tốt"}</span>
</div>
</div>
</div>
</div>
<div className="p-6 pt-0">
<div className="flex items-baseline justify-between mb-4">
<div>
<span className="font-body-sm text-body-sm text-text-muted">{"Chỉ từ"}</span>
<div className="font-price-display text-price-display text-primary">{"1.250.000₫ "}<span className="font-body-sm text-body-sm font-normal text-text-muted">{"/ ngày"}</span></div>
</div>
<span className="font-label-md text-label-md text-secondary">{"Trọn gói xăng xe"}</span>
</div>
<button className="w-full py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-colors flex items-center justify-center gap-2" type="button">
<span>{"Chọn gói theo ngày"}</span>
<span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
</button>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div>
<div className="relative h-56 w-full overflow-hidden bg-surface-container">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/5259804cdaa2b811.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute top-4 left-4 bg-secondary text-on-secondary font-label-md text-label-md px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">{"travel_explore"}</span>{"\n                Liên Tỉnh Đường Dài\n              "}</div>
<div className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full font-label-md text-label-md text-primary font-bold">{"\n                1 Chiều & Khứ hồi\n              "}</div>
</div>
<div className="p-6 flex flex-col gap-4">
<div>
<h3 className="font-headline-sm text-headline-sm text-primary mb-1">{"Hành trình liên tỉnh & Du lịch gia đình"}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Chuyến đi xa êm ái, chủ động dừng đỗ ngắm cảnh hoặc nghỉ ngơi theo nhu cầu của riêng bạn."}</p>
</div>

<div className="space-y-2 bg-surface-container-low p-3.5 rounded-lg text-body-sm font-body-sm text-on-surface">
<div className="flex items-center justify-between">
<span className="text-text-muted flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"route"}</span>{" Lộ trình phổ biến:"}</span>
<span className="font-semibold">{"Hà Nội ⇄ Hạ Long / Ninh Bình"}</span>
</div>
<div className="flex items-center justify-between">
<span className="text-text-muted flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"hotel"}</span>{" Phí lưu đêm bác tài:"}</span>
<span className="font-semibold">{"Hỗ trợ minh bạch, linh hoạt"}</span>
</div>
<div className="flex items-center justify-between">
<span className="text-text-muted flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{"percent"}</span>{" Chuyến khứ hồi:"}</span>
<span className="font-semibold text-status-success">{"Giảm tới 40% chiều về"}</span>
</div>
</div>
</div>
</div>
<div className="p-6 pt-0">
<div className="flex items-baseline justify-between mb-4">
<div>
<span className="font-body-sm text-body-sm text-text-muted">{"Chỉ từ"}</span>
<div className="font-price-display text-price-display text-primary">{"1.600.000₫ "}<span className="font-body-sm text-body-sm font-normal text-text-muted">{"/ chuyến"}</span></div>
</div>
<span className="font-label-md text-label-md text-secondary">{"Đã gồm cao tốc"}</span>
</div>
<button className="w-full py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-colors flex items-center justify-center gap-2" type="button">
<span>{"Báo giá lộ trình riêng"}</span>
<span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
</button>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-20 bg-surface-container-lowest">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="max-w-2xl mb-12">
<div className="font-label-md text-label-md text-secondary font-bold uppercase tracking-wider mb-2">{"Bảng cước tham chiếu"}</div>
<h2 className="font-headline-lg text-headline-lg text-primary">{"Biểu phí cố định các chặng trọng điểm"}</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">{"Cam kết không đội giá ngày lễ tết khi đã xác nhận đặt cọc trước. Bao gồm xăng dầu, tài xế và bảo hiểm hành khách toàn diện."}</p>
</div>

<div className="overflow-x-auto rounded-xl bg-surface-container-low shadow-sm">
<div className="table-scroll" tabIndex={0} aria-label="Bảng thông tin, cuộn ngang để xem thêm"><table className="w-full text-left border-collapse min-w-[700px]">
<thead>
<tr className="bg-surface-container text-primary font-label-lg text-label-lg">
<th className="py-4 px-6">{"Tuyến hành trình"}</th>
<th className="py-4 px-4">{"Khoảng cách"}</th>
<th className="py-4 px-4">{"Sedan 4 Chỗ (Vios/City)"}</th>
<th className="py-4 px-4">{"Sedan VIP (Camry)"}</th>
<th className="py-4 px-4">{"SUV 7 Chỗ (Fortuner)"}</th>
<th className="py-4 px-6 text-right">{"Limousine VIP 9 Chỗ"}</th>
</tr>
</thead>
<tbody className="divide-y-0 font-body-md text-body-md text-on-surface">
<tr className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
<td className="py-4 px-6">
<div className="font-semibold text-primary">{"Trung tâm Hà Nội ⇄ Sân bay Nội Bài"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Đón hoặc tiễn 1 chiều (gồm vé trạm ga)"}</div>
</td>
<td className="py-4 px-4 text-text-muted">{"~30 km"}</td>
<td className="py-4 px-4 font-semibold text-primary">{"280.000₫"}</td>
<td className="py-4 px-4 font-semibold text-primary">{"450.000₫"}</td>
<td className="py-4 px-4 font-semibold text-primary">{"350.000₫"}</td>
<td className="py-4 px-6 text-right font-semibold text-tertiary-container">{"650.000₫"}</td>
</tr>
<tr className="bg-surface-container-low/60 hover:bg-surface-container transition-colors">
<td className="py-4 px-6">
<div className="font-semibold text-primary">{"Trung tâm Q1, HCM ⇄ Sân bay Tân Sơn Nhất"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Đón tiễn 1 chiều giờ thấp điểm/cao điểm"}</div>
</td>
<td className="py-4 px-4 text-text-muted">{"~10 km"}</td>
<td className="py-4 px-4 font-semibold text-primary">{"220.000₫"}</td>
<td className="py-4 px-4 font-semibold text-primary">{"380.000₫"}</td>
<td className="py-4 px-4 font-semibold text-primary">{"290.000₫"}</td>
<td className="py-4 px-6 text-right font-semibold text-tertiary-container">{"550.000₫"}</td>
</tr>
<tr className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
<td className="py-4 px-6">
<div className="font-semibold text-primary">{"Hà Nội ⇄ Hạ Long (Quảng Ninh)"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Cao tốc 5B - Đã bao gồm trọn gói vé BOT cao tốc"}</div>
</td>
<td className="py-4 px-4 text-text-muted">{"~155 km"}</td>
<td className="py-4 px-4 font-semibold text-primary">{"1.350.000₫"}</td>
<td className="py-4 px-4 font-semibold text-primary">{"1.850.000₫"}</td>
<td className="py-4 px-4 font-semibold text-primary">{"1.550.000₫"}</td>
<td className="py-4 px-6 text-right font-semibold text-tertiary-container">{"2.300.000₫"}</td>
</tr>
<tr className="bg-surface-container-low/60 hover:bg-surface-container transition-colors">
<td className="py-4 px-6">
<div className="font-semibold text-primary">{"Hà Nội ⇄ Tràng An / Tam Chúc (Ninh Bình)"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Đi về trong ngày (thời gian phục vụ tối đa 10h)"}</div>
</td>
<td className="py-4 px-4 text-text-muted">{"~100 km"}</td>
<td className="py-4 px-4 font-semibold text-primary">{"1.400.000₫"}</td>
<td className="py-4 px-4 font-semibold text-primary">{"1.900.000₫"}</td>
<td className="py-4 px-4 font-semibold text-primary">{"1.600.000₫"}</td>
<td className="py-4 px-6 text-right font-semibold text-tertiary-container">{"2.400.000₫"}</td>
</tr>
<tr className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
<td className="py-4 px-6">
<div className="font-semibold text-primary">{"TP. Hồ Chí Minh ⇄ Vũng Tàu"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Tuyến cao tốc Long Thành - Dầu Giây 1 chiều"}</div>
</td>
<td className="py-4 px-4 text-text-muted">{"~105 km"}</td>
<td className="py-4 px-4 font-semibold text-primary">{"1.100.000₫"}</td>
<td className="py-4 px-4 font-semibold text-primary">{"1.600.000₫"}</td>
<td className="py-4 px-4 font-semibold text-primary">{"1.250.000₫"}</td>
<td className="py-4 px-6 text-right font-semibold text-tertiary-container">{"1.950.000₫"}</td>
</tr>
</tbody>
</table></div>
</div>
<div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-text-muted font-body-sm text-body-sm gap-2">
<div>{"* Mức giá mang tính tham khảo ở thời điểm tiêu chuẩn. Vào các dịp Lễ Tết cao điểm có thể áp dụng phụ thu 15-20%."}</div>
<Link className="text-primary font-semibold hover:underline flex items-center gap-1" href="/xe/vinfast-vf8-plus-2024">{"Tải bảng cước chi tiết PDF "}<span className="material-symbols-outlined text-[16px]">{"download"}</span></Link>
</div>
</div>
</section>

<section className="w-full py-20 bg-surface">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

<div className="lg:col-span-5 flex flex-col gap-6">
<div>
<div className="font-label-md text-label-md text-secondary font-bold uppercase tracking-wider mb-2">{"Đội Ngũ Tài Xế Kanow"}</div>
<h2 className="font-headline-lg text-headline-lg text-primary">{"Người bạn đồng hành chuẩn mực trên mọi cung đường"}</h2>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n            Tất cả tài xế trực thuộc mạng lưới Kanow đều trải qua quy trình tuyển chọn gắt gao gồm 4 vòng thẩm định: lý lịch tư pháp trong sạch, kiểm tra phản xạ lái xe an toàn, đào tạo văn hóa ứng xử dịch vụ cao cấp và khả năng ngoại ngữ cơ bản phục vụ khách quốc tế.\n          "}</p>

<div className="grid grid-cols-2 gap-4">
<div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
<div className="font-display-hero text-[36px] text-primary font-bold">{"99.4%"}</div>
<div className="font-label-md text-label-md text-text-muted mt-1">{"Chuyến đi đánh giá 5 sao tuyệt đối"}</div>
</div>
<div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
<div className="font-display-hero text-[36px] text-primary font-bold">{"> 7 năm"}</div>
<div className="font-label-md text-label-md text-text-muted mt-1">{"Kinh nghiệm trung bình mỗi tài xế"}</div>
</div>
</div>

<div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4">
<div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
<svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
<path className="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
<path className="text-status-success" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="98, 100" strokeLinecap="round" strokeWidth="3.5"></path>
</svg>
<span className="absolute font-label-lg text-label-lg font-bold text-primary">{"98%"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-primary font-bold">{"Chỉ số an toàn tuyệt đối"}</div>
<div className="font-body-sm text-body-sm text-on-surface-variant">{"Hệ thống giám sát hành trình AI cảnh báo tốc độ theo thời gian thực"}</div>
</div>
</div>
</div>

<div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between gap-6">
<div className="flex items-center gap-4">
<div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-surface-container">
<img className="w-full h-full object-cover" src="/images/ce5429a6d0be3de8.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
</div>
<div>
<div className="flex items-center gap-1.5">
<h4 className="font-headline-sm text-headline-sm text-primary">{"Nguyễn Văn Bình"}</h4>
<span className="material-symbols-outlined text-primary text-[18px]">{"verified"}</span>
</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Đội xe VIP Hà Nội • 8 năm KN"}</div>
<div className="flex items-center gap-1 text-tertiary-container mt-1">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="font-label-md text-label-md font-bold">{"4.98"}</span>
<span className="text-text-muted text-body-sm font-normal">{"(1,420 chuyến)"}</span>
</div>
</div>
</div>
<div className="bg-surface-container-low p-3 rounded-lg text-body-sm font-body-sm text-on-surface-variant italic">{"\n              \"Thói quen của tôi là luôn kiểm tra áp suất lốp và vệ sinh điều hòa trước mỗi chuyến đón khách tại sân bay. Đúng giờ và bảo mật câu chuyện của khách là danh dự của nghề.\"\n            "}</div>
<div className="flex items-center justify-between font-label-md text-label-md">
<span className="px-2.5 py-1 rounded bg-surface-container text-primary">{"Tiếng Anh Giao Tiếp Tốt"}</span>
<span className="text-status-success flex items-center gap-1">
<span className="w-2 h-2 rounded-full bg-status-success"></span>{"\n                Đang sẵn sàng\n              "}</span>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between gap-6">
<div className="flex items-center gap-4">
<div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-surface-container">
<img className="w-full h-full object-cover" src="/images/5b878f28396575a9.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
</div>
<div>
<div className="flex items-center gap-1.5">
<h4 className="font-headline-sm text-headline-sm text-primary">{"Trần Hoàng Long"}</h4>
<span className="material-symbols-outlined text-primary text-[18px]">{"verified"}</span>
</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Đội xe Ngoại giao TSN • 11 năm KN"}</div>
<div className="flex items-center gap-1 text-tertiary-container mt-1">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="font-label-md text-label-md font-bold">{"5.0"}</span>
<span className="text-text-muted text-body-sm font-normal">{"(2,110 chuyến)"}</span>
</div>
</div>
</div>
<div className="bg-surface-container-low p-3 rounded-lg text-body-sm font-body-sm text-on-surface-variant italic">{"\n              \"Từng nhiều năm đưa đón đoàn chuyên gia Nhật Bản và Hàn Quốc. Tôi am hiểu mọi ngóc ngách các tuyến đường trung tâm Sài Gòn để chọn đường thông thoáng nhất.\"\n            "}</div>
<div className="flex items-center justify-between font-label-md text-label-md">
<span className="px-2.5 py-1 rounded bg-surface-container text-primary">{"Chứng chỉ Lái xe VIP"}</span>
<span className="text-status-success flex items-center gap-1">
<span className="w-2 h-2 rounded-full bg-status-success"></span>{"\n                Đang sẵn sàng\n              "}</span>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-20 bg-surface-container-lowest">
<div className="max-w-[860px] mx-auto px-margin">
<div className="text-center mb-12">
<div className="font-label-md text-label-md text-secondary font-bold uppercase tracking-wider mb-2">{"Giải đáp thắc mắc"}</div>
<h2 className="font-headline-lg text-headline-lg text-primary">{"Những câu hỏi thường gặp khi thuê tài xế Kanow"}</h2>
</div>
<div className="space-y-4" id="faqAccordion">

<div className="rounded-xl bg-surface-container-low overflow-hidden transition-all">
<button className="w-full p-6 text-left flex items-center justify-between gap-4 font-headline-sm text-headline-sm text-primary" type="button" data-handler="toggleFaq" data-args="'faq1'">
<span>{"Nếu chuyến bay bị Delay (trễ giờ) thì tài xế có tính thêm phí chờ không?"}</span>
<span className="material-symbols-outlined text-primary text-[24px] transform transition-transform" id="faq1-icon">{"expand_more"}</span>
</button>
<div className="px-6 pb-6 pt-0 font-body-md text-body-md text-on-surface-variant hidden" id="faq1-content">{"\n            Kanow tự động đồng bộ mã số hiệu chuyến bay của quý khách trên hệ thống radar hàng không. Khi máy bay bị hoãn (delay), tài xế sẽ chủ động căn giờ hạ cánh thực tế mới tới đón. Quý khách hoàn toàn được miễn phí thời gian chờ lên tới 60 phút tính từ thời điểm bánh máy bay chạm đường băng.\n          "}</div>
</div>

<div className="rounded-xl bg-surface-container-low overflow-hidden transition-all">
<button className="w-full p-6 text-left flex items-center justify-between gap-4 font-headline-sm text-headline-sm text-primary" type="button" data-handler="toggleFaq" data-args="'faq2'">
<span>{"Giá dịch vụ đã bao gồm vé BOT qua trạm thu phí và vé sân bay chưa?"}</span>
<span className="material-symbols-outlined text-primary text-[24px] transform transition-transform" id="faq2-icon">{"expand_more"}</span>
</button>
<div className="px-6 pb-6 pt-0 font-body-md text-body-md text-on-surface-variant hidden" id="faq2-content">{"\n            Có! Mọi mức giá báo trên bảng biểu hay trên hợp đồng đặt xe đều là giá trọn gói (All-inclusive). Đã gồm tiền nhiên liệu xe, công tài xế, phí vào cửa sân bay và toàn bộ các trạm BOT cao tốc trên lộ trình cam kết. Quý khách không cần trả thêm bất kỳ khoản tiền lẻ nào cho lái xe.\n          "}</div>
</div>

<div className="rounded-xl bg-surface-container-low overflow-hidden transition-all">
<button className="w-full p-6 text-left flex items-center justify-between gap-4 font-headline-sm text-headline-sm text-primary" type="button" data-handler="toggleFaq" data-args="'faq3'">
<span>{"Dịch vụ \"Thuê tài xế lái xe của bạn\" hoạt động như thế nào?"}</span>
<span className="material-symbols-outlined text-primary text-[24px] transform transition-transform" id="faq3-icon">{"expand_more"}</span>
</button>
<div className="px-6 pb-6 pt-0 font-body-md text-body-md text-on-surface-variant hidden" id="faq3-content">{"\n            Nếu quý khách đã có sẵn phương tiện cá nhân nhưng cần tài xế đưa đi tiếp khách, dự tiệc có uống rượu bia, hoặc đi công tác xa, Kanow sẽ điều động tài xế chuyên nghiệp tới tận nơi nhận xe và lái thay bạn. Tài xế được kiểm tra tay lái trên đa dạng dòng xe số tự động từ phổ thông đến siêu sang (Mercedes, Porsche, BMW...).\n          "}</div>
</div>

<div className="rounded-xl bg-surface-container-low overflow-hidden transition-all">
<button className="w-full p-6 text-left flex items-center justify-between gap-4 font-headline-sm text-headline-sm text-primary" type="button" data-handler="toggleFaq" data-args="'faq4'">
<span>{"Tôi có thể yêu cầu xuất hóa đơn giá trị gia tăng (VAT) cho doanh nghiệp không?"}</span>
<span className="material-symbols-outlined text-primary text-[24px] transform transition-transform" id="faq4-icon">{"expand_more"}</span>
</button>
<div className="px-6 pb-6 pt-0 font-body-md text-body-md text-on-surface-variant hidden" id="faq4-content">{"\n            Hoàn toàn được. Kanow hỗ trợ xuất hóa đơn điện tử VAT đầy đủ và gửi qua email doanh nghiệp ngay trong ngày sau khi chuyến đi hoàn tất. Vui lòng cung cấp mã số thuế và thông tin công ty khi thực hiện đặt xe.\n          "}</div>
</div>
</div>
</div>
</section>

<section className="w-full py-16 bg-primary-container text-on-primary relative overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container opacity-90"></div>
<div className="max-w-[1240px] mx-auto px-margin relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
<div className="max-w-xl">
<h3 className="font-headline-lg text-headline-lg text-on-primary mb-3">{"Cần chuyến xe gấp trong 30 phút tới?"}</h3>
<p className="font-body-lg text-body-lg text-on-primary-container">{"\n          Tổng đài điều phối xe khẩn cấp của Kanow hoạt động 24/7. Chỉ cần một cuộc gọi, chiếc xe phù hợp nhất sẽ có mặt ngay tại sảnh của bạn.\n        "}</p>
</div>
<div className="flex flex-wrap items-center gap-4 shrink-0">
<a className="px-8 py-4 rounded-full bg-tertiary-container hover:bg-tertiary text-on-tertiary font-label-lg text-label-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all" href="tel:19008888">
<span className="material-symbols-outlined text-[22px]">{"phone_in_talk"}</span>
<span>{"Gọi Hotline 1900 8888"}</span>
</a>
<button className="px-8 py-4 rounded-full bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary font-label-lg text-label-lg font-bold transition-all backdrop-blur-sm" type="button" data-action="contact">{"\n          Đăng ký đối tác doanh nghiệp\n        "}</button>
</div>
</div>
</section>


</div></main>
  );
}
