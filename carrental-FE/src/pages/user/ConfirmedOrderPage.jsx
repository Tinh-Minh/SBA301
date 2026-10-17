import { Link } from "react-router";
export default function ConfirmedOrderPage() {
    return (<div className="cardb-screen screen-confirmedorder bg-[#F7F7F5] font-body text-charcoal antialiased selection:bg-[#FC6C26] selection:text-white"><main className="w-full  bg-[#F7F7F5] min-h-screen pb-16 pt-20"><div className="max-w-[1440px] mx-auto px-5 lg:px-12 py-8 flex flex-col gap-6">

    <section className="flex flex-col gap-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#666666]">
    <Link className="hover:text-[#FC6C26] transition-colors flex items-center gap-1" to="/chuyen-xe-cua-toi">{"Chuyến xe của tôi"}</Link>
    <span className="text-[#E9E9E7]">{"/"}</span>
    <span className="text-[#FC6C26] font-semibold">{"Chi tiết đơn thuê"}</span>
    </nav>
    <Link className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E9E9E7] text-[#292929] hover:bg-gray-50 text-sm font-medium transition-all shadow-xs" to="/chuyen-xe-cua-toi">
    <span className="material-symbols-outlined text-[18px]">{"arrow_back"}</span>
    <span>{"Quay lại Chuyến xe của tôi"}</span>
    </Link>
    </div>

    <div className="p-6 rounded-2xl bg-white border border-[#E9E9E7] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
    <div className="flex flex-col gap-2">
    <div className="flex items-center gap-3">
    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#292929]">{"Chi tiết đơn thuê"}</h1>
    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
    <span>{"Hệ thống trực tuyến"}</span>
    </div>
    </div>

    <div className="flex items-center gap-2 text-sm text-[#666666]">
    <span>{"Mã đơn hàng:"}</span>
    <span className="font-semibold tracking-wider text-[#292929] bg-[#F0F1EF] px-3 py-1 rounded-lg text-sm select-all" id="orderCodeValue">{"CDB-ORD-20261026-904"}</span>
    <button className="p-1 rounded-lg hover:bg-gray-100 text-[#666666] hover:text-[#FC6C26] transition-colors flex items-center justify-center" id="copyCodeBtn" title="Sao chép mã đơn" type="button" aria-label="Sao chép mã đơn" data-action="copy" data-handler="copyOrderCode" data-args="">
    <span className="material-symbols-outlined text-[18px]" id="copyIcon">{"content_copy"}</span>
    </button>
    <span className="hidden"></span>
    </div>
    </div>

    <div className="flex flex-wrap items-center gap-3">
    <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#DBEAFE] text-[#2563EB] font-semibold text-xs border border-blue-200">
    <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
    <span>{"Đã xác nhận"}</span>
    </div>
    <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FEF3C7] text-[#D97706] font-semibold text-xs border border-amber-200">
    <span className="material-symbols-outlined text-[16px] text-[#D97706]">{"hourglass_top"}</span>
    <span>{"Chờ thanh toán"}</span>
    </div>
    </div>
    </div>
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

    <div className="lg:col-span-7 flex flex-col gap-6">

    <section className="p-6 rounded-2xl bg-white border border-[#E9E9E7] shadow-sm flex flex-col gap-5">
    <div className="flex items-center justify-between border-b border-[#E9E9E7] pb-4">
    <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-lg bg-[#FC6C26]/10 flex items-center justify-center text-[#FC6C26]">
    <span className="material-symbols-outlined text-[20px]">{"timeline"}</span>
    </div>
    <h2 className="text-lg font-bold text-[#292929]">{"Tiến trình đơn thuê"}</h2>
    </div>
    <span className="text-xs font-semibold text-[#FC6C26] bg-[#FC6C26]/10 px-2.5 py-1 rounded-full">{"Bước 3 / 4"}</span>
    </div>
    <div className="relative pt-4 pb-2">

    <div className="absolute top-10 left-10 right-10 h-1 bg-[#E9E9E7] rounded-full pointer-events-none"></div>
    <div className="absolute top-10 left-10 w-[66%] h-1 bg-emerald-500 rounded-full pointer-events-none"></div>
    <div className="grid grid-cols-4 gap-2 relative z-10 text-center">

    <div className="flex flex-col items-center gap-2">
    <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
    <span className="material-symbols-outlined text-[22px] font-bold">{"check"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-xs font-bold text-[#292929]">{"Gửi yêu cầu"}</span>
    <span className="text-[11px] text-emerald-600 font-semibold">{"Hoàn tất"}</span>
    </div>
    </div>

    <div className="flex flex-col items-center gap-2">
    <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
    <span className="material-symbols-outlined text-[22px] font-bold">{"check"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-xs font-bold text-[#292929]">{"Chủ xe xác nhận"}</span>
    <span className="text-[11px] text-emerald-600 font-semibold">{"Đã duyệt"}</span>
    </div>
    </div>

    <div className="flex flex-col items-center gap-2">
    <div className="w-11 h-11 rounded-full bg-[#FC6C26] text-white flex items-center justify-center shadow-lg relative ring-4 ring-[#FC6C26]/20">
    <span className="material-symbols-outlined text-[22px] animate-pulse">{"payment"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-xs font-bold text-[#FC6C26]">{"Thanh toán"}</span>
    <span className="text-[11px] text-[#D97706] font-semibold">{"Đang chờ thanh toán"}</span>
    </div>
    </div>

    <div className="flex flex-col items-center gap-2 opacity-60">
    <div className="w-11 h-11 rounded-full bg-[#F7F7F5] border border-[#E9E9E7] text-[#666666] flex items-center justify-center">
    <span className="material-symbols-outlined text-[20px]">{"vpn_key"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-xs font-semibold text-[#666666]">{"Nhận xe"}</span>
    <span className="text-[11px] text-[#666666]">{"Chưa thực hiện"}</span>
    </div>
    </div>
    </div>
    </div>

    <div className="p-4 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-start gap-3">
    <span className="material-symbols-outlined text-[#FC6C26] text-[22px] shrink-0 mt-0.5">{"info"}</span>
    <p className="text-sm text-[#292929] leading-relaxed">{"\nChủ xe "}<strong className="text-[#FC6C26] font-bold">{"Trần Đức Nam"}</strong>{" đã xác nhận đồng ý cho thuê xe! Lịch hẹn xe của bạn được tạm giữ đến "}<strong className="text-[#292929] font-bold">{"23:59 hôm nay"}</strong>{". Vui lòng hoàn tất thanh toán tiền thuê "}<strong className="ui-money text-[#FC6C26] font-bold">{"3.700.000 đ"}</strong>{" để kích hoạt mã bàn giao và hợp đồng điện tử.\n"}</p>
    </div>
    </section>

    <section className="rounded-2xl bg-white border border-[#E9E9E7] shadow-sm overflow-hidden flex flex-col">
    <div className="relative w-full h-80 sm:h-96 overflow-hidden bg-gray-100">
    <img alt="VinFast VF 9 Plus AWD" className="w-full h-full object-cover object-center" src="/images/cardb-a1579a2d1bde4aa1.webp" loading="lazy" decoding="async"/>
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

    <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#292929] text-xs font-bold tracking-wider uppercase shadow-xs">{"\nEV LUXURY\n"}</span>
    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#292929] text-xs font-medium shadow-xs">{"\n7 Chỗ thương gia\n"}</span>
    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#292929] text-xs font-semibold shadow-xs">{"\nThuần điện AWD\n"}</span>
    </div>

    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
    <div>
    <h3 className="text-2xl lg:text-3xl font-bold text-white drop-shadow-sm">{"\nVinFast VF 9 Plus AWD\n"}</h3>
    <p className="text-sm text-gray-200 mt-1">{"Hiệu suất 402 mã lực • Pin lithium thế hệ mới"}</p>
    </div>
    <Link className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#292929] hover:bg-gray-100 text-xs font-semibold transition-all shadow-md" to="/xe/vinfast-vf8-plus-2024">
    <span>{"Xem chi tiết xe"}</span>
    <span className="material-symbols-outlined text-[16px]">{"north_east"}</span>
    </Link>
    </div>
    </div>
    <div className="p-6 flex flex-col gap-6">

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-white border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26] shrink-0">
    <span className="material-symbols-outlined text-[20px]">{"airline_seat_recline_extra"}</span>
    </div>
    <div className="flex flex-col min-w-0">
    <span className="text-xs text-[#666666] truncate">{"Cấu hình ghế"}</span>
    <span className="text-sm font-bold text-[#292929] truncate">{"7 Chỗ Nappa"}</span>
    </div>
    </div>
    <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-white border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26] shrink-0">
    <span className="material-symbols-outlined text-[20px]">{"bolt"}</span>
    </div>
    <div className="flex flex-col min-w-0">
    <span className="text-xs text-[#666666] truncate">{"Động cơ"}</span>
    <span className="text-sm font-bold text-[#292929] truncate">{"Dual Motor AWD"}</span>
    </div>
    </div>
    <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-white border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26] shrink-0">
    <span className="material-symbols-outlined text-[20px]">{"settings_input_component"}</span>
    </div>
    <div className="flex flex-col min-w-0">
    <span className="text-xs text-[#666666] truncate">{"Hộp số"}</span>
    <span className="text-sm font-bold text-[#292929] truncate">{"Tự động điện tử"}</span>
    </div>
    </div>
    <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-white border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26] shrink-0">
    <span className="material-symbols-outlined text-[20px]">{"ev_station"}</span>
    </div>
    <div className="flex flex-col min-w-0">
    <span className="text-xs text-[#666666] truncate">{"Tầm vận hành"}</span>
    <span className="text-sm font-bold text-[#292929] truncate">{"438 km"}</span>
    </div>
    </div>
    </div>

    <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div className="flex items-center gap-3.5">
    <div className="w-12 h-12 rounded-full bg-white border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26] shrink-0 font-bold shadow-xs">
    <span className="material-symbols-outlined text-[26px]">{"person"}</span>
    </div>
    <div className="flex flex-col">
    <div className="flex items-center gap-2">
    <span className="text-sm font-bold text-[#292929]">{"Chủ xe đối tác: Trần Đức Nam"}</span>
    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold">{"★ 5.0"}</span>
    </div>
    <span className="text-xs text-[#666666] mt-0.5">{"Hồ sơ chủ xe cá nhân đã được định danh"}</span>
    </div>
    </div>
    <div className="text-left sm:text-right">
    <span className="text-xs text-[#666666] block">{"Địa điểm bàn giao:"}</span>
    <span className="text-xs font-semibold text-[#292929]">{"128 Thảo Điền, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh"}</span>
    </div>
    </div>
    </div>
    </section>

    <section className="p-6 rounded-2xl bg-white border border-[#E9E9E7] shadow-sm flex flex-col gap-5">
    <div className="flex items-center gap-2.5 border-b border-[#E9E9E7] pb-4">
    <div className="w-8 h-8 rounded-lg bg-[#FC6C26]/10 flex items-center justify-center text-[#FC6C26]">
    <span className="material-symbols-outlined text-[20px]">{"calendar_month"}</span>
    </div>
    <h2 className="text-lg font-bold text-[#292929]">{"Lịch trình & Điều kiện thuê"}</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7]">
    <div className="flex items-center gap-2 text-xs font-bold text-[#FC6C26] uppercase">
    <span className="w-2.5 h-2.5 rounded-full bg-[#FC6C26]"></span>
    <span>{"NHẬN XE"}</span>
    </div>
    <div className="text-xl font-bold text-[#292929]">{"08:00"}</div>
    <div className="text-xs text-[#666666]">{"Thứ Bảy, ngày 26 tháng 10 năm 2026"}</div>
    </div>
    <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7]">
    <div className="flex items-center gap-2 text-xs font-bold text-[#FC6C26] uppercase">
    <span className="w-2.5 h-2.5 rounded-full bg-[#FC6C26]"></span>
    <span>{"TRẢ XE"}</span>
    </div>
    <div className="text-xl font-bold text-[#292929]">{"08:00"}</div>
    <div className="text-xs text-[#666666]">{"Thứ Hai, ngày 28 tháng 10 năm 2026"}</div>
    </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-1">
    <div className="flex flex-col gap-0.5">
    <span className="text-xs text-[#666666] uppercase tracking-wider font-medium">{"Hình thức thuê"}</span>
    <span className="text-sm font-semibold text-[#292929]">{"Thuê tự lái theo ngày"}</span>
    </div>
    <div className="flex flex-col gap-0.5">
    <span className="text-xs text-[#666666] uppercase tracking-wider font-medium">{"Thời lượng tính phí"}</span>
    <span className="text-sm font-semibold text-[#292929]">{"2 ngày trọn gói (48 giờ)"}</span>
    </div>
    <div className="flex flex-col gap-1 md:col-span-2">
    <span className="text-xs text-[#666666] uppercase tracking-wider font-medium">{"Địa điểm giao nhận xe"}</span>
    <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-[#FC6C26] text-[18px]">{"location_on"}</span>
    <span className="text-sm font-semibold text-[#292929]">{"128 Thảo Điền, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh"}</span>
    <span className="px-2 py-0.5 rounded-md bg-[#F0F1EF] text-[#292929] text-[11px] font-medium">{"Nhận trực tiếp tại điểm xe"}</span>
    </div>
    </div>
    <div className="flex flex-col gap-0.5">
    <span className="text-xs text-[#666666] uppercase tracking-wider font-medium">{"Thông tin người đặt"}</span>
    <div className="flex flex-col">
    <span className="text-sm font-semibold text-[#292929]">{"NGUYỄN HOÀNG MINH"}</span>
    <span className="text-xs text-[#666666]">{"SĐT: 0918 ••• 892"}</span>
    </div>
    </div>
    <div className="flex flex-col gap-0.5">
    <span className="text-xs text-[#666666] uppercase tracking-wider font-medium">{"Hồ sơ lái xe CarDB ID"}</span>
    <div className="flex items-center gap-1.5 mt-0.5">
    <span className="material-symbols-outlined text-[#10B981] text-[18px]">{"verified"}</span>
    <span className="text-xs font-semibold text-[#10B981]">{"GPLX B2 đã thẩm định hợp lệ"}</span>
    </div>
    </div>
    <div className="flex flex-col gap-1 md:col-span-2 p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7]">
    <span className="text-xs text-[#666666] uppercase tracking-wider font-medium">{"Ghi chú gửi chủ xe"}</span>
    <p className="text-xs text-[#292929] italic">{"\n“Nhận xe đúng 08:00 sáng thứ Bảy, giữ gìn xe sạch sẽ.”\n"}</p>
    </div>
    </div>
    </section>

    <section className="p-6 rounded-2xl bg-white border border-[#E9E9E7] shadow-sm flex flex-col gap-5">
    <div className="flex items-center justify-between border-b border-[#E9E9E7] pb-4">
    <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-lg bg-[#FC6C26]/10 flex items-center justify-center text-[#FC6C26]">
    <span className="material-symbols-outlined text-[20px]">{"history"}</span>
    </div>
    <h2 className="text-lg font-bold text-[#292929]">{"Lịch sử hoạt động đơn thuê"}</h2>
    </div>
    <span className="text-xs text-[#666666]">{"Thời gian thực"}</span>
    </div>
    <div className="flex flex-col gap-0 relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E9E9E7]">

    <div className="relative pb-5">
    <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#10B981] ring-4 ring-white shadow-xs"></div>
    <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
    <span className="text-xs font-bold text-[#10B981]">{"11:15 hôm nay"}</span>
    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{"Chủ xe"}</span>
    </div>
    <p className="text-xs text-[#292929] leading-relaxed">{"Chủ xe "}<strong className="font-bold text-[#292929]">{"Trần Đức Nam"}</strong>{" đã phê duyệt yêu cầu thuê xe. Cổng thanh toán được mở."}</p>
    </div>
    </div>

    <div className="relative pb-5">
    <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#666666] ring-4 ring-white"></div>
    <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
    <span className="text-xs font-semibold text-[#666666]">{"10:46 hôm nay"}</span>
    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F0F1EF] text-[#666666]">{"Hệ thống"}</span>
    </div>
    <p className="text-xs text-[#292929] leading-relaxed">{"Hệ thống ghi nhận yêu cầu và gửi thông báo đến chủ xe."}</p>
    </div>
    </div>

    <div className="relative">
    <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#666666] ring-4 ring-white"></div>
    <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
    <span className="text-xs font-semibold text-[#666666]">{"10:45 hôm nay"}</span>
    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F0F1EF] text-[#666666]">{"Khách hàng"}</span>
    </div>
    <p className="text-xs text-[#292929] leading-relaxed">{"Yêu cầu thuê xe được tạo bởi "}<strong className="font-bold text-[#292929]">{"Nguyễn Hoàng Minh"}</strong>{"."}</p>
    </div>
    </div>
    </div>
    </section>

    <section className="p-6 rounded-2xl bg-white border border-[#E9E9E7] shadow-sm flex flex-col gap-4">
    <div className="flex items-center gap-2.5 border-b border-[#E9E9E7] pb-4">
    <div className="w-8 h-8 rounded-lg bg-[#FC6C26]/10 flex items-center justify-center text-[#FC6C26]">
    <span className="material-symbols-outlined text-[20px]">{"rule"}</span>
    </div>
    <h2 className="text-lg font-bold text-[#292929]">{"Quy định thanh toán & Hủy yêu cầu"}</h2>
    </div>
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7]">
    <p className="text-xs text-[#666666] leading-relaxed max-w-lg">{"\nĐơn thuê đã được chủ xe xác nhận. Việc hủy đơn sau khi đã xác nhận sẽ được xử lý theo quy định bảo lưu và chính sách thời điểm của hệ thống CarDB.\n"}</p>
    <button className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors whitespace-nowrap shrink-0" type="button" aria-label="Hủy yêu cầu đơn thuê" data-action="cancel-order" data-handler="toggleCancelModal" data-args="true">
    <span className="material-symbols-outlined text-[16px]">{"cancel"}</span>
    <span>{"Hủy yêu cầu đơn thuê"}</span>
    </button>
    </div>
    </section>
    </div>

    <aside className="lg:col-span-5 flex flex-col gap-6 sticky top-24">

    <div className="p-6 rounded-2xl bg-white border border-[#E9E9E7] shadow-sm flex flex-col gap-5">
    <div className="flex items-center justify-between border-b border-[#E9E9E7] pb-4">
    <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-[#FC6C26] text-[22px]">{"receipt_long"}</span>
    <h3 className="text-xl font-bold text-[#292929]">{"Bảng kê chi phí"}</h3>
    </div>
    <span className="text-xs font-semibold text-[#D97706] px-2.5 py-1 rounded-full bg-[#FEF3C7] border border-amber-200">{"\nChưa thanh toán\n"}</span>
    </div>

    <div className="flex flex-col gap-3 text-sm">
    <div className="flex items-baseline justify-between gap-4 text-[#666666]">
    <span>{"Đơn giá thuê theo ngày"}</span>
    <span className="text-[#292929] font-semibold">{"1.950.000 đ / ngày"}</span>
    </div>
    <div className="flex items-baseline justify-between gap-4 text-[#666666]">
    <span>{"Thời lượng tính phí"}</span>
    <span className="text-[#292929] font-semibold">{"2 ngày (48 giờ)"}</span>
    </div>
    <div className="flex items-baseline justify-between gap-4 text-[#666666]">
    <span>{"Tiền thuê trước giảm giá"}</span>
    <span className="ui-money text-[#292929] font-semibold">{"3.900.000 đ"}</span>
    </div>

    <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-[#DCFCE7] text-[#16A34A] border border-emerald-200">
    <div className="flex items-center gap-1.5 text-xs font-semibold">
    <span className="material-symbols-outlined text-[16px]">{"sell"}</span>
    <span>{"Voucher (CARDBWELCOME)"}</span>
    </div>
    <span className="ui-money font-bold text-sm">{"-200.000 đ"}</span>
    </div>

    <div className="p-4 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-between gap-4">
    <div className="flex flex-col">
    <span className="text-xs font-bold text-[#292929]">{"Tiền thuê xe sau ưu đãi"}</span>
    <span className="text-[11px] text-[#666666]">{"Đã bao gồm VAT & bảo hiểm"}</span>
    </div>
    <span className="ui-money text-2xl font-bold text-[#FC6C26]">{"3.700.000 đ"}</span>
    </div>
    </div>

    <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex flex-col gap-2">
    <div className="flex items-baseline justify-between gap-4 text-[#292929]">
    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D97706]">
    <span className="material-symbols-outlined text-[18px]">{"account_balance_wallet"}</span>
    <span>{"Tiền cọc thế chấp"}</span>
    </div>
    <span className="ui-money text-lg font-bold text-[#D97706]">{"15.000.000 đ"}</span>
    </div>
    <p className="text-xs text-[#666666] leading-relaxed">{"\nKhoản tiền cọc được hoàn trả đầy đủ khi khách hàng trả xe theo quy trình kiểm tra bàn giao. Thu trực tiếp tại bãi xe.\n"}</p>
    </div>

    <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex flex-col gap-2">
    <div className="flex items-baseline justify-between gap-4">
    <div className="flex flex-col">
    <span className="text-xs font-bold text-[#292929]">{"Tổng nghĩa vụ tài chính dự kiến"}</span>
    <span className="text-[11px] text-[#666666]">{"(Thuê xe + Cọc thế chấp)"}</span>
    </div>
    <span className="ui-money text-xl font-bold text-[#FC6C26]">{"18.700.000 đ"}</span>
    </div>
    <span className="text-[11px] text-[#666666] italic">{"* Khoản tiền cọc thu riêng khi bàn giao thực tế xe, không phải thanh toán ngay lúc này."}</span>
    </div>
    <div className="text-xs text-[#666666]">{"\nTrạng thái thanh toán: "}<strong className="text-[#D97706] font-semibold">{"Chưa thanh toán (Chờ khách thanh toán)"}</strong>
    </div>
    </div>

    <div className="p-6 rounded-2xl bg-white border border-[#E9E9E7] shadow-sm flex flex-col gap-4">

    <div className="p-3.5 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs flex items-center gap-2">
    <span className="material-symbols-outlined text-[18px] shrink-0">{"timer"}</span>
    <span>{"Thời hạn thanh toán còn lại: "}<strong>{"11 giờ 24 phút"}</strong>{". Vui lòng thanh toán để xác nhận giữ xe thành công."}</span>
    </div>

    <Link className="w-full py-4 px-6 rounded-xl bg-[#FC6C26] hover:bg-[#e05a18] text-white font-bold text-base text-center flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all" to="/thanh-toan">
    <span className="material-symbols-outlined text-[20px]">{"payment"}</span>
    <span>{"Thanh toán ngay 3.700.000 đ ➔"}</span>
    </Link>

    <Link className="w-full py-3 px-6 rounded-xl bg-white hover:bg-gray-50 border border-[#E9E9E7] text-[#292929] font-medium text-sm text-center flex items-center justify-center gap-2 transition-all shadow-xs" to="/chuyen-xe-cua-toi">
    <span className="material-symbols-outlined text-[18px]">{"arrow_back"}</span>
    <span>{"← Quay lại Chuyến xe của tôi"}</span>
    </Link>
    <div className="text-center">
    <Link className="text-xs text-[#666666] hover:text-[#FC6C26] underline font-medium" to="/kham-pha-xe">{"Xem danh sách xe khác"}</Link>
    </div>

    <div className="pt-3 border-t border-[#E9E9E7] flex items-center justify-between text-xs">
    <div className="flex items-center gap-1.5 text-[#666666]">
    <span className="material-symbols-outlined text-[#FC6C26] text-[16px]">{"headset_mic"}</span>
    <span>{"Cần hỗ trợ về đơn thuê này?"}</span>
    </div>
    <a className="font-bold text-[#FC6C26] hover:underline" href="tel:19008899">{"Hotline 1900 8899 (24/7)"}</a>
    </div>
    </div>
    </aside>
    </div>
    </div>

    <div className="hidden"></div>
    </main>



    </div>);
}
