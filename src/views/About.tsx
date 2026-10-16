import Link from "next/link";

export default function About() {
  return (
<main className="w-full pt-20 bg-surface"><div className="flex flex-col w-full">

<section className="relative w-full overflow-hidden bg-surface-canvas pt-12 pb-24 md:pt-16 md:pb-32">

<div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
<div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] rounded-full bg-surface-variant/40 blur-3xl pointer-events-none"></div>
<div className="max-w-[1240px] mx-auto px-margin relative z-10">

<div className="flex flex-wrap items-center gap-space-sm mb-space-lg">
<span className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-tint text-primary font-label-md text-label-md uppercase tracking-wider">
<span className="material-symbols-outlined text-[16px] text-primary" style={{"fontVariationSettings": "'FILL' 1"}}>{"verified"}</span>{"\n          Về Kanow Mobility\n        "}</span>
<span className="text-text-muted font-body-sm text-body-sm">{"•"}</span>
<span className="text-text-muted font-body-sm text-body-sm">{"Hành trình kiến tạo chuẩn mực thuê xe thế hệ mới"}</span>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
<div className="lg:col-span-7 flex flex-col gap-space-md">
<h1 className="font-display-hero text-display-hero text-primary tracking-tight font-bold">{"\n            Tái định nghĩa trải nghiệm thuê xe văn minh, tiện lợi và an tâm tuyệt đối.\n          "}</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">{"\n            Kanow ra đời từ khao khát gạt bỏ những rào cản cổ hữu của ngành dịch vụ thuê xe truyền thống. Chúng tôi mang đến nền tảng tự động hóa minh bạch, đội xe chuẩn mực đời mới và quy chuẩn an toàn tối thượng cho hàng triệu chuyến đi của người Việt.\n          "}</p>
<div className="pt-space-md flex flex-wrap items-center gap-space-md">
<a className="inline-flex items-center gap-space-xs px-space-xl py-space-md rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-lg hover:bg-primary-container transition-all" href="#brand-story">
<span className="">{"Khám phá câu chuyện Kanow"}</span>
<span className="material-symbols-outlined text-[18px]">{"south"}</span>
</a>
<div className="flex items-center gap-space-sm py-space-xs px-space-md rounded-full bg-surface-container shadow-sm">
<span className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse"></span>
<span className="font-label-md text-label-md text-on-surface">{"Mạng lưới trực chiến 24/7 toàn quốc"}</span>
</div>
</div>
</div>

<div className="lg:col-span-5 relative">
<div className="relative rounded-2xl overflow-hidden shadow-2xl bg-surface-container">
<img className="w-full h-[440px] object-cover" src="/images/7b273b4e06ed5a87.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>

<div className="absolute bottom-6 left-6 right-6 p-space-md bg-surface-container/95 backdrop-blur-md rounded-xl shadow-lg flex items-center justify-between">
<div>
<p className="font-label-md text-label-md text-text-muted">{"Tiêu chuẩn kiểm định"}</p>
<p className="font-headline-sm text-headline-sm text-primary font-bold">{"120 Điểm kỹ thuật & Khử khuẩn"}</p>
</div>
<div className="w-12 h-12 rounded-full bg-surface-tint flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary text-[26px]">{"car_repair"}</span>
</div>
</div>
</div>

<div className="hidden sm:flex absolute -bottom-6 -left-8 p-space-md bg-surface-container rounded-xl shadow-xl items-center gap-space-md max-w-xs">
<div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[20px]">{"bolt"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface">{"eKYC Phê duyệt 60s"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Không giữ CCCD/Hộ khẩu gốc"}</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface-canvas relative z-20 -mt-8 pb-16">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter bg-surface-container rounded-2xl p-space-xl shadow-xl">
<div className="flex flex-col gap-space-xs text-center lg:text-left">
<div className="flex items-center justify-center lg:justify-start gap-space-xs text-secondary">
<span className="material-symbols-outlined text-[24px]">{"route"}</span>
<span className="font-label-md text-label-md font-bold uppercase tracking-wider">{"Hành trình"}</span>
</div>
<div className="font-display-hero text-display-hero text-primary font-bold tracking-tight" id="stat-trips">{"25,000+"}</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Chuyến đi an toàn tuyệt đối trên khắp dặm dài Tổ quốc"}</p>
</div>
<div className="flex flex-col gap-space-xs text-center lg:text-left">
<div className="flex items-center justify-center lg:justify-start gap-space-xs text-secondary">
<span className="material-symbols-outlined text-[24px]">{"directions_car"}</span>
<span className="font-label-md text-label-md font-bold uppercase tracking-wider">{"Đội xe chất lượng"}</span>
</div>
<div className="font-display-hero text-display-hero text-primary font-bold tracking-tight">{"80+"}</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Xe đời mới 2023 - 2025 đa phân khúc từ Sedan, SUV tới MPV"}</p>
</div>
<div className="flex flex-col gap-space-xs text-center lg:text-left">
<div className="flex items-center justify-center lg:justify-start gap-space-xs text-secondary">
<span className="material-symbols-outlined text-[24px]">{"sentiment_very_satisfied"}</span>
<span className="font-label-md text-label-md font-bold uppercase tracking-wider">{"Sự hài lòng"}</span>
</div>
<div className="font-display-hero text-display-hero text-primary font-bold tracking-tight">{"98.6%"}</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Tỉ lệ khách hàng tiếp tục đặt xe cho kỳ nghỉ hoặc công tác"}</p>
</div>
<div className="flex flex-col gap-space-xs text-center lg:text-left">
<div className="flex items-center justify-center lg:justify-start gap-space-xs text-secondary">
<span className="material-symbols-outlined text-[24px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="font-label-md text-label-md font-bold uppercase tracking-wider">{"Xếp hạng dịch vụ"}</span>
</div>
<div className="font-display-hero text-display-hero text-primary font-bold tracking-tight">{"4.92 / 5"}</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Dựa trên hơn 14.800 đánh giá được xác thực thực tế"}</p>
</div>
</div>
</div>
</section>

<section className="w-full py-space-2xl bg-surface-container-low" id="brand-story">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">

<div className="lg:col-span-5 order-2 lg:order-1 flex flex-col gap-space-md">
<div className="relative rounded-2xl overflow-hidden shadow-md">
<img className="w-full h-[400px] object-cover" src="/images/d394f14c06541685.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute bottom-4 left-4 right-4 bg-primary text-on-primary p-space-md rounded-xl">
<p className="font-label-md text-label-md text-on-primary-container">{"Khởi xướng năm 2022"}</p>
<p className="font-headline-sm text-headline-sm font-semibold">{"Từ sự thấu hiểu nỗi trăn trở của người thuê xe"}</p>
</div>
</div>

<div className="grid grid-cols-2 gap-space-sm">
<div className="p-space-md rounded-xl bg-error-container text-on-error-container flex flex-col gap-space-xs">
<div className="flex items-center gap-space-xs font-label-md text-label-md font-bold">
<span className="material-symbols-outlined text-[18px]">{"close"}</span>{" Thuê xe truyền thống\n              "}</div>
<p className="font-body-sm text-body-sm opacity-90">{"Giữ sổ hộ khẩu/CCCD gốc, xe lưu niên có mùi hôi, phụ phí rửa xe, phụ phí cuối tuần không báo trước."}</p>
</div>
<div className="p-space-md rounded-xl bg-surface-tint text-primary flex flex-col gap-space-xs">
<div className="flex items-center gap-space-xs font-label-md text-label-md font-bold text-secondary">
<span className="material-symbols-outlined text-[18px]">{"check_circle"}</span>{" Chuẩn mực Kanow\n              "}</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Xác thực số eKYC tiện tốc, 100% xe sạch thơm khử khuẩn, báo giá minh bạch trọn gói từng đồng."}</p>
</div>
</div>
</div>

<div className="lg:col-span-7 order-1 lg:order-2 flex flex-col gap-space-md lg:pl-space-lg">
<div className="flex items-center gap-space-xs text-secondary font-label-md text-label-md uppercase tracking-wider">
<span className="w-6 h-0.5 bg-secondary"></span>{"\n            Câu chuyện sáng lập\n          "}</div>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold">{"\n            Chúng tôi xây dựng Kanow vì tin rằng mỗi dặm đường của bạn xứng đáng được trân trọng trọn vẹn.\n          "}</h2>
<div className="space-y-space-md font-body-md text-body-md text-on-surface-variant">
<p className="">{"\n              Trước đây, việc tự lái một chiếc xe để đưa gia đình đi du lịch hoặc tiếp đón đối tác thường khởi đầu bằng một chuỗi phiền toái: phải mang theo cọc tiền mặt lớn, nộp lại giấy tờ tùy thân gốc, mất hàng giờ đồng hồ kiểm tra các vết xước cũ trên một chiếc xe đã bạc màu và không rõ lịch sử bảo trì.\n            "}</p>
<p className="">{"\n              Kanow được tạo dựng bởi những chuyên gia công nghệ và chuyên gia vận hành logistics dày dạn kinh nghiệm tại Việt Nam. Chúng tôi đặt câu hỏi: "}<em>{"\"Tại sao việc thuê một chiếc xe hơi chuẩn mực lại không thể đơn giản, văn minh và tin cậy như khi bạn mở khóa một căn hộ thông minh?\""}</em>
</p>
<p className="">{"\n              Lời giải của Kanow là sự kết hợp giữa "}<strong>{"sức mạnh công nghệ eKYC số hóa"}</strong>{", hợp đồng điện tử pháp lý tức thì và "}<strong>{"đội ngũ phụ trách phương tiện chuyên nghiệp"}</strong>{". Chúng tôi biến chiếc xe thành người bạn đồng hành an toàn, sạch sẽ, thơm tho và luôn sẵn sàng lăn bánh.\n            "}</p>
</div>

<div className="pt-space-sm flex items-center gap-space-lg border-t-0">
<div>
<div className="font-headline-sm text-headline-sm font-bold text-primary">{"Nguyễn Hoàng Long"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Đồng sáng lập & CEO Kanow Mobility"}</div>
</div>
<div className="px-space-md py-space-xs rounded-full bg-surface-container font-label-md text-label-md text-secondary">{"\n              \"Khách hàng là trọng tâm của mọi cải tiến\"\n            "}</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-space-2xl bg-surface-canvas">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-space-2xl gap-space-md">
<div>
<span className="text-secondary font-label-md text-label-md uppercase tracking-wider font-semibold">{"Giá trị cốt lõi"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold mt-space-xs">{"\n            4 Cam kết vàng khẳng định sự an tâm\n          "}</h2>
</div>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md">{"\n          Mỗi dịch vụ tại Kanow được định hình bởi những quy tắc đạo đức kinh doanh bất biến và quy trình phục vụ không thỏa hiệp.\n        "}</p>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">

<div className="bg-surface-container p-space-xl rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
<div>
<div className="w-14 h-14 rounded-xl bg-surface-tint flex items-center justify-center text-primary mb-space-lg group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[32px]">{"balance"}</span>
</div>
<div className="text-text-muted font-label-md text-label-md mb-space-xs">{"01 / TRUNG THỰC"}</div>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-space-sm">{"Minh bạch 100%"}</h3>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n              Ký kết hợp đồng điện tử định danh trong nháy mắt. Giá hiển thị là giá trọn gói cuối cùng: không phí ẩn, không phụ thu bất thường khi trả xe.\n            "}</p>
</div>
<div className="mt-space-lg pt-space-md flex items-center gap-space-xs text-primary font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px]">{"check"}</span>
<span className="">{"Hợp đồng điện tử minh bạch"}</span>
</div>
</div>

<div className="bg-surface-container p-space-xl rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
<div>
<div className="w-14 h-14 rounded-xl bg-surface-tint flex items-center justify-center text-primary mb-space-lg group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[32px]">{"clean_hands"}</span>
</div>
<div className="text-text-muted font-label-md text-label-md mb-space-xs">{"02 / CHẤT LƯỢNG"}</div>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-space-sm">{"Đội xe <3 năm tuổi"}</h3>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n              100% đầu xe được tuyển chọn từ các hãng lớn (VinFast, Hyundai, Toyota, Kia), bảo dưỡng chính hãng, xịt phòng thảo mộc và tiệt trùng ozone trước mỗi chuyến giao.\n            "}</p>
</div>
<div className="mt-space-lg pt-space-md flex items-center gap-space-xs text-primary font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px]">{"check"}</span>
<span className="">{"Khử trùng Ozone chuẩn y tế"}</span>
</div>
</div>

<div className="bg-surface-container p-space-xl rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
<div>
<div className="w-14 h-14 rounded-xl bg-surface-tint flex items-center justify-center text-primary mb-space-lg group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[32px]">{"fingerprint"}</span>
</div>
<div className="text-text-muted font-label-md text-label-md mb-space-xs">{"03 / TỐC ĐỘ"}</div>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-space-sm">{"eKYC Duyệt trong 60s"}</h3>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n              Xác minh danh tính và giấy phép lái xe hoàn toàn số hoá qua AI. Tuyệt đối không giữ giấy tờ gốc, bảo vệ quyền riêng tư và thông tin cá nhân khách hàng.\n            "}</p>
</div>
<div className="mt-space-lg pt-space-md flex items-center gap-space-xs text-primary font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px]">{"check"}</span>
<span className="">{"Không lưu giữ giấy tờ gốc"}</span>
</div>
</div>

<div className="bg-surface-container p-space-xl rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
<div>
<div className="w-14 h-14 rounded-xl bg-surface-tint flex items-center justify-center text-primary mb-space-lg group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[32px]">{"support_agent"}</span>
</div>
<div className="text-text-muted font-label-md text-label-md mb-space-xs">{"04 / ĐỒNG HÀNH"}</div>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-space-sm">{"Tận tâm 24/7 toàn quốc"}</h3>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n              Liên kết với mạng lưới cứu hộ giao thông 63 tỉnh thành. Bất kể ngày hay đêm, đội ngũ chuyên viên Kanow luôn bên cạnh hỗ trợ kỹ thuật và an toàn tức thì.\n            "}</p>
</div>
<div className="mt-space-lg pt-space-md flex items-center gap-space-xs text-primary font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px]">{"check"}</span>
<span className="">{"Cứu hộ khẩn cấp 63 tỉnh thành"}</span>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-space-2xl bg-surface-container-high/40">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="bg-primary text-on-primary rounded-3xl p-space-xl lg:p-space-2xl shadow-2xl relative overflow-hidden">

<svg className="absolute -right-10 -bottom-10 w-96 h-96 opacity-10 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 400">
<circle cx="200" cy="200" r="180" strokeDasharray="8 8" strokeWidth="2"></circle>
<circle cx="200" cy="200" r="120" strokeWidth="2"></circle>
<circle cx="200" cy="200" r="60" strokeWidth="3"></circle>
<path d="M 20 200 L 380 200 M 200 20 L 200 380" strokeWidth="1.5"></path>
</svg>
<div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
<div className="lg:col-span-6 flex flex-col gap-space-md">
<span className="font-label-md text-label-md uppercase tracking-wider text-secondary-container">{"Chuẩn quy trình bàn giao"}</span>
<h2 className="font-headline-lg text-headline-lg font-bold text-on-primary">{"\n              120 Điểm kiểm định chất lượng trước mỗi lượt lăn bánh\n            "}</h2>
<p className="font-body-md text-body-md text-on-primary-container">{"\n              Mỗi chiếc xe trước khi đến tay bạn đều vượt qua quy trình giám sát khắt khe gồm hệ thống phanh ABS, lốp xe, mức dầu động cơ, hệ thống làm mát lọc gió điều hòa và kết nối định vị hành trình chuẩn xác.\n            "}</p>
<div className="grid grid-cols-2 gap-space-md pt-space-sm">
<div className="bg-primary-container/80 p-space-md rounded-xl backdrop-blur-sm">
<div className="font-price-display text-price-display text-secondary-container">{"100%"}</div>
<div className="font-body-sm text-body-sm text-on-primary-container">{"Kiểm tra cảm biến áp suất lốp"}</div>
</div>
<div className="bg-primary-container/80 p-space-md rounded-xl backdrop-blur-sm">
<div className="font-price-display text-price-display text-secondary-container">{"Ozone"}</div>
<div className="font-body-sm text-body-sm text-on-primary-container">{"Khử khuẩn và xịt tinh dầu vỏ cam"}</div>
</div>
</div>
</div>
<div className="lg:col-span-6">
<div className="bg-surface-canvas text-on-surface p-space-lg rounded-2xl shadow-xl flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<span className="font-label-lg text-label-lg text-primary font-bold">{"Quy trình giao nhận 3 bước tối giản"}</span>
<span className="material-symbols-outlined text-secondary">{"verified_user"}</span>
</div>

<div className="flex gap-space-md items-start">
<div className="w-8 h-8 rounded-full bg-surface-tint text-primary flex items-center justify-center font-bold shrink-0">{"1"}</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface">{"Đăng ký & Quét eKYC"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Chụp ảnh GPLX và CCCD mặt trước qua camera điện thoại để hệ thống phê duyệt tự động."}</div>
</div>
</div>

<div className="flex gap-space-md items-start">
<div className="w-8 h-8 rounded-full bg-surface-tint text-primary flex items-center justify-center font-bold shrink-0">{"2"}</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface">{"Nhận xe tận nơi hoặc tại trạm"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Kỹ thuật viên giao xe sạch thơm, đối chiếu checklist điện tử trong 3 phút và bàn giao chìa khóa."}</div>
</div>
</div>

<div className="flex gap-space-md items-start">
<div className="w-8 h-8 rounded-full bg-surface-tint text-primary flex items-center justify-center font-bold shrink-0">{"3"}</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface">{"An tâm tận hưởng & Trả xe linh hoạt"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Bảo hiểm trọn gói bảo vệ toàn trình, hoàn trả cọc điện tử tự động minh bạch."}</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-space-2xl bg-surface-canvas">
<div className="max-w-[1240px] mx-auto px-margin">

<div className="text-center max-w-2xl mx-auto mb-space-2xl">
<span className="text-secondary font-label-md text-label-md uppercase tracking-wider font-semibold">{"Đội ngũ & Hạ tầng"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold mt-space-xs">{"\n          Những con người điều hành & Mạng lưới trạm xe Kanow\n        "}</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">{"\n          Sự kết hợp giữa tư duy công nghệ đột phá và lòng hiếu khách chân thành từ đội ngũ kỹ sư và nhân sự vận hành phương tiện.\n        "}</p>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-space-2xl">

<div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
<img className="w-full h-72 object-cover object-top" src="/images/6720bd3e4eb31dc8.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="p-space-lg">
<h3 className="font-headline-sm text-headline-sm text-primary font-bold">{"Nguyễn Hoàng Long"}</h3>
<p className="font-label-md text-label-md text-secondary mb-space-sm">{"Tổng Giám Đốc (CEO & Co-founder)"}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Hơn 12 năm dẫn dắt các dự án công nghệ di chuyển (Mobility Tech) và logistics hàng đầu Đông Nam Á."}</p>
</div>
</div>

<div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
<img className="w-full h-72 object-cover object-top" src="/images/eebd65c41c714e4c.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="p-space-lg">
<h3 className="font-headline-sm text-headline-sm text-primary font-bold">{"Trần Mai Phương"}</h3>
<p className="font-label-md text-label-md text-secondary mb-space-sm">{"Giám Đốc Vận Hành (COO)"}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Nguyên Giám đốc dịch vụ khách hàng ngành hàng không, chuyên gia kiến tạo quy chuẩn trải nghiệm cao cấp."}</p>
</div>
</div>

<div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
<img className="w-full h-72 object-cover object-top" src="/images/7fcee293a1fa0f7d.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="p-space-lg">
<h3 className="font-headline-sm text-headline-sm text-primary font-bold">{"Lê Quốc Tuấn"}</h3>
<p className="font-label-md text-label-md text-secondary mb-space-sm">{"Giám Đốc Công Nghệ (CTO)"}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">{"Kiến trúc sư hệ thống eKYC và dữ liệu định vị IoT xe thông minh, cựu chuyên gia an ninh mạng."}</p>
</div>
</div>
</div>

<div className="bg-surface-container-low p-space-xl rounded-2xl shadow-sm">
<div className="flex items-center gap-space-sm mb-space-lg">
<span className="material-symbols-outlined text-primary text-[24px]">{"hub"}</span>
<h3 className="font-headline-md text-headline-md text-primary font-bold">{"4 Hub giao xe trọng điểm - Nhận xe trong 30 phút"}</h3>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
<div className="bg-surface-container p-space-md rounded-xl shadow-sm">
<div className="flex items-center justify-between mb-space-xs">
<span className="font-label-lg text-label-lg text-primary font-bold">{"Hà Nội (Trụ sở chính)"}</span>
<span className="px-space-xs py-0.5 rounded-full bg-surface-tint font-label-md text-label-md text-primary text-[11px]">{"32 Xe"}</span>
</div>
<p className="font-body-sm text-body-sm text-text-muted mb-space-xs">{"Tầng 8, Tòa nhà Apex Tower, Đường Phạm Hùng, Q. Nam Từ Liêm"}</p>
<span className="font-label-md text-label-md text-secondary">{"Giao xe: Nội thành & Sân bay Nội Bài"}</span>
</div>
<div className="bg-surface-container p-space-md rounded-xl shadow-sm">
<div className="flex items-center justify-between mb-space-xs">
<span className="font-label-lg text-label-lg text-primary font-bold">{"TP. Hồ Chí Minh"}</span>
<span className="px-space-xs py-0.5 rounded-full bg-surface-tint font-label-md text-label-md text-primary text-[11px]">{"30 Xe"}</span>
</div>
<p className="font-body-sm text-body-sm text-text-muted mb-space-xs">{"Số 42 Đường Trần Não, P. An Khánh, TP. Thủ Đức"}</p>
<span className="font-label-md text-label-md text-secondary">{"Giao xe: Trung tâm & Sân bay Tân Sơn Nhất"}</span>
</div>
<div className="bg-surface-container p-space-md rounded-xl shadow-sm">
<div className="flex items-center justify-between mb-space-xs">
<span className="font-label-lg text-label-lg text-primary font-bold">{"Đà Nẵng"}</span>
<span className="px-space-xs py-0.5 rounded-full bg-surface-tint font-label-md text-label-md text-primary text-[11px]">{"12 Xe"}</span>
</div>
<p className="font-body-sm text-body-sm text-text-muted mb-space-xs">{"Số 128 Đường Nguyễn Văn Linh, P. Vĩnh Trung, Q. Thanh Khê"}</p>
<span className="font-label-md text-label-md text-secondary">{"Giao xe: Sân bay Quốc tế Đà Nẵng"}</span>
</div>
<div className="bg-surface-container p-space-md rounded-xl shadow-sm">
<div className="flex items-center justify-between mb-space-xs">
<span className="font-label-lg text-label-lg text-primary font-bold">{"Hải Phòng"}</span>
<span className="px-space-xs py-0.5 rounded-full bg-surface-tint font-label-md text-label-md text-primary text-[11px]">{"8 Xe"}</span>
</div>
<p className="font-body-sm text-body-sm text-text-muted mb-space-xs">{"Số 56 Đường Lê Hồng Phong, P. Đông Khê, Q. Ngô Quyền"}</p>
<span className="font-label-md text-label-md text-secondary">{"Giao xe: Trung tâm & Sân bay Cát Bi"}</span>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-space-xl bg-surface-container">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="flex flex-col md:flex-row items-center justify-between gap-space-lg py-space-md">
<div className="max-w-md">
<span className="text-secondary font-label-md text-label-md uppercase tracking-wider font-semibold">{"Đối tác bảo hiểm & Hạ tầng"}</span>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold mt-space-xs">{"\n            Bảo vệ trọn gói cho bạn trên mọi cây số\n          "}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">{"\n            Mọi hành trình của Kanow đều được tích hợp gói bảo hiểm vật chất và trách nhiệm dân sự tối đa từ các định chế tài chính uy tín nhất Việt Nam.\n          "}</p>
</div>

<div className="flex flex-wrap items-center gap-space-md justify-center">

<div className="flex items-center gap-space-sm px-space-lg py-space-md rounded-2xl bg-surface-container-low shadow-sm hover:shadow-md transition-shadow">
<div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-label-lg">{"\n              MIC\n            "}</div>
<div>
<div className="font-label-lg text-label-lg text-primary">{"Bảo hiểm Quân Đội MIC"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Bảo lãnh viện phí & thân vỏ 100%"}</div>
</div>
</div>

<div className="flex items-center gap-space-sm px-space-lg py-space-md rounded-2xl bg-surface-container-low shadow-sm hover:shadow-md transition-shadow">
<div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-label-lg">{"\n              BV\n            "}</div>
<div>
<div className="font-label-lg text-label-lg text-primary">{"Bảo hiểm Bảo Việt"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Giám định bồi thường siêu tốc"}</div>
</div>
</div>

<div className="flex items-center gap-space-sm px-space-lg py-space-md rounded-2xl bg-surface-container-low shadow-sm hover:shadow-md transition-shadow">
<div className="w-10 h-10 rounded-full bg-surface-tint text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">{"ev_station"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-primary">{"Hạ tầng Trạm sạc đối tác"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Sẵn sàng phủ khắp 63 tỉnh thành"}</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-space-2xl bg-surface-canvas">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
<div className="lg:col-span-4 flex flex-col gap-space-md">
<span className="text-secondary font-label-md text-label-md uppercase tracking-wider font-semibold">{"Giải đáp băn khoăn"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold">{"\n            Tại sao người lái xe chọn Kanow thay vì cách thuê cũ?\n          "}</h2>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n            Khám phá những câu hỏi thường gặp nhất khi bạn chuẩn bị đồng hành cùng Kanow trong chuyến hành trình sắp tới.\n          "}</p>
<div className="pt-space-sm">
<a className="inline-flex items-center gap-space-xs text-primary font-label-lg text-label-lg hover:text-secondary transition-colors" href="tel:19008888">
<span className="material-symbols-outlined text-[20px]">{"phone_in_talk"}</span>
<span className="">{"Tổng đài giải đáp tức thì: 1900 8888"}</span>
</a>
</div>
</div>
<div className="lg:col-span-8 space-y-space-md" id="faq-accordion">

<div className="bg-surface-container rounded-2xl p-space-lg shadow-sm">
<button className="faq-toggle w-full flex items-center justify-between text-left font-headline-sm text-headline-sm text-primary font-bold focus:outline-none" type="button" data-action="faq">
<span className="">{"Thủ tục eKYC diễn ra thế nào và có thực sự an toàn?"}</span>
<span className="material-symbols-outlined text-secondary transform transition-transform duration-200">{"expand_more"}</span>
</button>
<div className="faq-content mt-space-sm font-body-md text-body-md text-on-surface-variant hidden">{"\n              Toàn bộ dữ liệu căn cước công dân và bằng lái xe của bạn được mã hóa 256-bit theo chuẩn an toàn thanh toán ngân hàng. Kanow không lưu trữ bản gốc giấy tờ vật lý của bạn và tuyệt đối không chia sẻ cho bên thứ ba ngoại trừ mục đích ký kết hợp đồng bảo hiểm bắt buộc theo luật pháp.\n            "}</div>
</div>

<div className="bg-surface-container rounded-2xl p-space-lg shadow-sm">
<button className="faq-toggle w-full flex items-center justify-between text-left font-headline-sm text-headline-sm text-primary font-bold focus:outline-none" type="button" data-action="faq">
<span className="">{"Nếu không may xe gặp sự cố trên đường cao tốc, Kanow xử lý ra sao?"}</span>
<span className="material-symbols-outlined text-secondary transform transition-transform duration-200">{"expand_more"}</span>
</button>
<div className="faq-content mt-space-sm font-body-md text-body-md text-on-surface-variant hidden">{"\n              Đội ngũ trực ban cứu hộ 24/7 của chúng tôi sẽ liên hệ đơn vị cứu hộ địa phương gần bạn nhất (trong vòng 15-30 phút). Nếu sự cố mất nhiều thời gian sửa chữa, Kanow cung cấp phương án xe thay thế tương đương hoặc hỗ trợ chi phí di chuyển tiếp tục cho quý khách.\n            "}</div>
</div>

<div className="bg-surface-container rounded-2xl p-space-lg shadow-sm">
<button className="faq-toggle w-full flex items-center justify-between text-left font-headline-sm text-headline-sm text-primary font-bold focus:outline-none" type="button" data-action="faq">
<span className="">{"Kanow có thu phụ phí ẩn khi giao trả xe vào ban đêm hoặc ngày lễ không?"}</span>
<span className="material-symbols-outlined text-secondary transform transition-transform duration-200">{"expand_more"}</span>
</button>
<div className="faq-content mt-space-sm font-body-md text-body-md text-on-surface-variant hidden">{"\n              Không bao giờ. Bảng báo giá hiển thị trên ứng dụng/website Kanow là mức giá trọn gói cuối cùng, đã gồm thuế VAT, bảo hiểm cơ bản và phí rửa xe cơ bản thông thường. Bất kỳ chi phí phát sinh nếu có (như giao xe ngoài bán kính 15km) đều được thông báo rõ ràng trước khi bạn nhấn nút thanh toán.\n            "}</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-space-2xl bg-surface-container-high/50">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="bg-surface-container rounded-3xl p-space-xl lg:p-space-2xl shadow-xl flex flex-col lg:flex-row items-center justify-between gap-space-xl">
<div className="max-w-xl flex flex-col gap-space-sm">
<span className="text-secondary font-label-md text-label-md uppercase tracking-wider font-semibold">{"Kết nối cùng Kanow"}</span>
<h2 className="font-headline-lg text-headline-lg text-primary font-bold">{"\n            Sẵn sàng cho chuyến đi tuyệt vời tiếp theo của bạn?\n          "}</h2>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n            Hãy để Kanow chuẩn bị chiếc xe hoàn hảo nhất cho kỳ nghỉ gia đình, chuyến công tác trọng đại hay hành trình khám phá những cung đường tuyệt mỹ.\n          "}</p>
<div className="pt-space-sm flex flex-col sm:flex-row items-start sm:items-center gap-space-md text-on-surface">
<div className="flex items-center gap-space-xs font-label-md text-label-md">
<span className="material-symbols-outlined text-secondary text-[20px]">{"mail"}</span>
<span className="">{"hotro@kanow.vn"}</span>
</div>
<div className="flex items-center gap-space-xs font-label-md text-label-md">
<span className="material-symbols-outlined text-secondary text-[20px]">{"call"}</span>
<span className="">{"1900 8888 (24/7)"}</span>
</div>
<div className="flex items-center gap-space-xs font-label-md text-label-md">
<span className="material-symbols-outlined text-secondary text-[20px]">{"location_on"}</span>
<span className="">{"Apex Tower, Hà Nội"}</span>
</div>
</div>
</div>
<div className="flex flex-col sm:flex-row items-center gap-space-md w-full lg:w-auto shrink-0">
<Link className="w-full sm:w-auto text-center px-space-xl py-space-md rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-lg hover:bg-primary-container transition-all" data-path="thue-xe-tu-lai" href="/thue-xe-tu-lai">{"\n            Tìm xe tự lái ngay\n          "}</Link>
<Link className="w-full sm:w-auto text-center px-space-xl py-space-md rounded-full bg-surface-container-high text-primary font-label-lg text-label-lg hover:bg-surface-variant transition-colors" data-path="lien-he" href="/lien-he">{"\n            Liên hệ hợp tác\n          "}</Link>
</div>
</div>
</div>
</section>
</div>

</main>
  );
}
