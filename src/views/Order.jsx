import { Link } from "react-router";
export default function Order() {
    return (<div className="cardb-screen screen-order bg-[#F7F7F5] font-body-md text-[#292929] antialiased selection:bg-[#fc6c26] selection:text-white"><main className="w-full  bg-[#F7F7F5] min-h-screen pt-20"><div className="flex flex-col w-full">
    <div className="relative w-full px-4 lg:px-12 py-8">
    <div className="max-w-[1440px] mx-auto flex flex-col gap-6 relative z-10">

    <section className="flex flex-col gap-3 pb-1">

    <div className="flex flex-wrap items-center justify-between gap-3">
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#666666]">
    <Link className="hover:text-[#FC6C26] transition-colors flex items-center gap-1 font-medium" data-path="chuyen-xe-cua-toi" to="/chuyen-xe-cua-toi">
    <span>{"Chuyến xe của tôi"}</span>
    </Link>
    <span className="text-[#E9E9E7] font-normal">{"/"}</span>
    <span className="text-[#FC6C26] font-semibold">{"Chi tiết đơn thuê"}</span>
    </nav>
    <Link className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F7F7F5] text-[#292929] hover:border-[#FC6C26] border border-[#E9E9E7] text-sm font-medium transition-all shadow-sm" data-path="chuyen-xe-cua-toi" to="/chuyen-xe-cua-toi">
    <span className="material-symbols-outlined text-[18px]">{"arrow_back"}</span>
    <span>{"← Quay lại Chuyến xe của tôi"}</span>
    </Link>
    </div>

    <div className="p-6 rounded-2xl bg-white border border-[#E9E9E7] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
    <div className="flex flex-col gap-1.5">
    <div className="flex items-center gap-3">
    <h1 className="text-[30px] leading-tight font-bold tracking-tight text-[#292929]">{"Chi tiết đơn thuê"}</h1>
    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0F1EF] text-[#292929] text-xs font-semibold">
    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
    <span>{"Hệ thống trực tuyến"}</span>
    </div>
    </div>

    <div className="flex items-center gap-2 text-sm text-[#666666]">
    <span>{"Mã đơn hàng:"}</span>
    <span className="text-sm font-bold tracking-wider text-[#292929] bg-[#F0F1EF] px-2.5 py-1 rounded-lg select-all" id="orderCodeValue">{"CDB-ORD-20261026-904"}</span>
    <button className="p-1 rounded-lg hover:bg-[#F0F1EF] text-[#666666] hover:text-[#FC6C26] transition-colors flex items-center justify-center border border-transparent hover:border-[#E9E9E7]" id="copyCodeBtn" title="Sao chép mã đơn" type="button" aria-label="Sao chép mã đơn" data-action="copy" data-handler="copyOrderCode" data-args="">
    <span className="material-symbols-outlined text-[18px]" id="copyIcon">{"content_copy"}</span>
    </button>
    <span className="hidden"></span>
    </div>
    </div>

    <div className="flex flex-wrap items-center gap-3">

    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FEF3C7] text-[#F5A623] border border-[#FDE68A] shadow-sm">
    <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623] animate-ping opacity-75"></span>
    <span className="text-sm font-bold">{"Chờ xác nhận"}</span>
    </div>

    <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E9E9E7] text-[#666666] text-sm font-semibold shadow-sm">
    <span className="material-symbols-outlined text-[18px] text-[#666666]">{"hourglass_empty"}</span>
    <span>{"Chưa thanh toán"}</span>
    </div>
    </div>
    </div>
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

    <div className="lg:col-span-8 flex flex-col gap-6">

    <section className="p-6 rounded-2xl bg-white border border-[#E9E9E7] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
    <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-[#FC6C26] text-[22px]">{"timeline"}</span>
    <h2 className="text-xl font-bold text-[#292929]">{"Tiến trình đơn thuê"}</h2>
    </div>
    <span className="text-sm font-medium text-[#666666]">{"Bước 2 / 4"}</span>
    </div>

    <div className="relative pt-3 pb-2">

    <div className="absolute top-7 left-10 right-10 h-1 bg-[#E9E9E7] rounded-full pointer-events-none"></div>

    <div className="absolute top-7 left-10 w-[33%] h-1 bg-gradient-to-r from-[#10B981] to-[#F5A623] rounded-full pointer-events-none"></div>
    <div className="grid grid-cols-4 gap-2 relative z-10 text-center">

    <div className="flex flex-col items-center gap-2">
    <div className="w-11 h-11 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-md">
    <span className="material-symbols-outlined text-[22px] font-bold">{"check"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-sm font-bold text-[#292929]">{"Gửi yêu cầu"}</span>
    <span className="text-xs text-[#10B981] font-semibold">{"Hoàn tất"}</span>
    </div>
    </div>

    <div className="flex flex-col items-center gap-2">
    <div className="w-11 h-11 rounded-full bg-[#FEF3C7] border-2 border-[#F5A623] text-[#F5A623] flex items-center justify-center shadow-md relative">
    <span className="material-symbols-outlined text-[22px] relative z-10">{"hourglass_top"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-sm font-bold text-[#F5A623]">{"Chủ xe xác nhận"}</span>
    <span className="text-xs text-[#F5A623] font-semibold">{"Đang xử lý"}</span>
    </div>
    </div>

    <div className="flex flex-col items-center gap-2 opacity-60">
    <div className="w-11 h-11 rounded-full bg-[#F7F7F5] border border-[#E9E9E7] text-[#666666] flex items-center justify-center">
    <span className="material-symbols-outlined text-[20px]">{"lock"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-sm font-semibold text-[#666666]">{"Thanh toán"}</span>
    <span className="text-xs text-[#666666]">{"Chưa thực hiện"}</span>
    </div>
    </div>

    <div className="flex flex-col items-center gap-2 opacity-60">
    <div className="w-11 h-11 rounded-full bg-[#F7F7F5] border border-[#E9E9E7] text-[#666666] flex items-center justify-center">
    <span className="material-symbols-outlined text-[20px]">{"vpn_key"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-sm font-semibold text-[#666666]">{"Nhận xe"}</span>
    <span className="text-xs text-[#666666]">{"Chưa thực hiện"}</span>
    </div>
    </div>
    </div>
    </div>

    <div className="mt-2 p-4 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-start gap-3">
    <span className="material-symbols-outlined text-[#F5A623] text-[20px] shrink-0 mt-0.5">{"info"}</span>
    <p className="text-sm text-[#292929] leading-relaxed">{"\nYêu cầu thuê đã được gửi đến chủ xe "}<strong className="text-[#292929] font-semibold">{"Trần Đức Nam"}</strong>{". Sau khi chủ xe phê duyệt lịch trình, cổng thanh toán sẽ được kích hoạt để bạn hoàn tất đơn đặt.\n"}</p>
    </div>
    </section>

    <section className="rounded-2xl bg-white border border-[#E9E9E7] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">

    <div className="relative w-full h-80 sm:h-96 overflow-hidden bg-[#F7F7F5]">
    <img className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out" src="/images/cardb-a1579a2d1bde4aa1.webp" alt="Hình ảnh xe CarDB" loading="lazy" decoding="async"/>
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

    <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#292929] border border-white/40 text-xs font-bold tracking-wider uppercase shadow-sm">{"\nEV LUXURY\n"}</span>
    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#292929] border border-white/40 text-xs font-semibold shadow-sm">{"\n7 Chỗ thương gia\n"}</span>
    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#292929] border border-white/40 text-xs font-semibold shadow-sm">{"\nThuần điện AWD\n"}</span>
    </div>

    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
    <div>
    <h3 className="text-2xl font-bold text-white drop-shadow-md">{"\nVinFast VF 9 Plus AWD\n"}</h3>
    <p className="text-sm text-white/90 tracking-wide font-medium">{"Hiệu suất 402 mã lực • Pin lithium thế hệ mới"}</p>
    </div>
    <Link className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F7F7F5] border border-[#E9E9E7] text-[#292929] font-semibold text-sm transition-all shadow-md" data-path="kham-pha-xe" to="/kham-pha-xe">
    <span>{"Xem chi tiết xe ↗"}</span>
    </Link>
    </div>
    </div>

    <div className="p-6 flex flex-col gap-6">

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-white border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26] shrink-0 shadow-sm">
    <span className="material-symbols-outlined text-[20px]">{"airline_seat_recline_extra"}</span>
    </div>
    <div className="flex flex-col min-w-0">
    <span className="text-xs text-[#666666] truncate font-medium">{"Cấu hình ghế"}</span>
    <span className="text-sm font-bold text-[#292929] truncate">{"7 Chỗ Nappa"}</span>
    </div>
    </div>
    <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-white border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26] shrink-0 shadow-sm">
    <span className="material-symbols-outlined text-[20px]">{"bolt"}</span>
    </div>
    <div className="flex flex-col min-w-0">
    <span className="text-xs text-[#666666] truncate font-medium">{"Động cơ"}</span>
    <span className="text-sm font-bold text-[#292929] truncate">{"Dual Motor AWD"}</span>
    </div>
    </div>
    <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-white border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26] shrink-0 shadow-sm">
    <span className="material-symbols-outlined text-[20px]">{"settings_input_component"}</span>
    </div>
    <div className="flex flex-col min-w-0">
    <span className="text-xs text-[#666666] truncate font-medium">{"Hộp số"}</span>
    <span className="text-sm font-bold text-[#292929] truncate">{"Tự động điện tử"}</span>
    </div>
    </div>
    <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-white border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26] shrink-0 shadow-sm">
    <span className="material-symbols-outlined text-[20px]">{"ev_station"}</span>
    </div>
    <div className="flex flex-col min-w-0">
    <span className="text-xs text-[#666666] truncate font-medium">{"Tầm vận hành"}</span>
    <span className="text-sm font-bold text-[#292929] truncate">{"438 km"}</span>
    </div>
    </div>
    </div>

    <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div className="flex items-center gap-3.5">
    <div className="w-12 h-12 rounded-full bg-white border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26] shrink-0 shadow-sm">
    <span className="material-symbols-outlined text-[26px]">{"person"}</span>
    </div>
    <div className="flex flex-col">
    <div className="flex items-center gap-2">
    <span className="text-base font-bold text-[#292929]">{"Chủ xe: Trần Đức Nam"}</span>
    <span className="px-2 py-0.5 rounded bg-white border border-[#E9E9E7] text-[#666666] text-xs font-semibold">{"Chủ xe đối tác"}</span>
    </div>
    <span className="text-xs text-[#666666] mt-0.5">{"Hồ sơ chủ xe cá nhân đã được định danh"}</span>
    </div>
    </div>
    <div className="flex sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0">
    <span className="text-xs text-[#666666] font-medium">{"Địa điểm bàn giao xe"}</span>
    <span className="text-sm font-semibold text-[#292929] text-right">{"128 Thảo Điền, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh"}</span>
    </div>
    </div>
    </div>
    </section>

    <section className="p-6 rounded-2xl bg-white border border-[#E9E9E7] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
    <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-[#FC6C26] text-[22px]">{"calendar_month"}</span>
    <h2 className="text-xl font-bold text-[#292929]">{"Lịch trình & Điều kiện thuê"}</h2>
    </div>

    <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] grid grid-cols-1 md:grid-cols-2 gap-4">

    <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-white border border-[#E9E9E7]">
    <div className="flex items-center gap-2 text-[#FC6C26] text-xs font-bold tracking-wider">
    <span className="w-2.5 h-2.5 rounded-full bg-[#FC6C26]"></span>
    <span>{"NHẬN XE"}</span>
    </div>
    <div className="text-xl font-bold text-[#292929]">{"\n08:00\n"}</div>
    <div className="text-sm font-medium text-[#292929]">{"\nThứ Bảy, 26/10/2026\n"}</div>
    </div>

    <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-white border border-[#E9E9E7]">
    <div className="flex items-center gap-2 text-[#FC6C26] text-xs font-bold tracking-wider">
    <span className="w-2.5 h-2.5 rounded-full bg-[#FC6C26]"></span>
    <span>{"TRẢ XE"}</span>
    </div>
    <div className="text-xl font-bold text-[#292929]">{"\n08:00\n"}</div>
    <div className="text-sm font-medium text-[#292929]">{"\nThứ Hai, 28/10/2026\n"}</div>
    </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2">
    <div className="flex flex-col gap-1">
    <span className="text-xs text-[#666666] uppercase tracking-wider font-semibold">{"Hình thức thuê"}</span>
    <span className="text-sm font-semibold text-[#292929]">{"Thuê tự lái theo ngày"}</span>
    </div>
    <div className="flex flex-col gap-1">
    <span className="text-xs text-[#666666] uppercase tracking-wider font-semibold">{"Thời lượng tính phí"}</span>
    <span className="text-sm font-semibold text-[#292929]">{"2 ngày trọn gói (48 giờ)"}</span>
    </div>
    <div className="flex flex-col gap-1 md:col-span-2">
    <span className="text-xs text-[#666666] uppercase tracking-wider font-semibold">{"Địa điểm giao nhận xe"}</span>
    <div className="flex flex-wrap items-center gap-2 mt-0.5">
    <span className="material-symbols-outlined text-[#FC6C26] text-[18px]">{"location_on"}</span>
    <span className="text-sm font-semibold text-[#292929]">{"\n128 Thảo Điền, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh\n"}</span>
    <span className="px-2.5 py-0.5 rounded-full bg-[#E9E9E7] text-[#292929] text-xs font-medium shrink-0">{"Nhận trực tiếp tại điểm xe"}</span>
    </div>
    </div>
    <div className="flex flex-col gap-1">
    <span className="text-xs text-[#666666] uppercase tracking-wider font-semibold">{"Thông tin người đặt"}</span>
    <div className="flex flex-col">
    <span className="text-sm font-semibold text-[#292929]">{"Người đặt: NGUYỄN HOÀNG MINH"}</span>
    <span className="text-xs text-[#666666]">{"SĐT: 0918 ••• 892"}</span>
    </div>
    </div>
    <div className="flex flex-col gap-1">
    <span className="text-xs text-[#666666] uppercase tracking-wider font-semibold">{"Hồ sơ lái xe CarDB ID"}</span>
    <div className="flex items-center gap-1.5 mt-0.5">
    <span className="material-symbols-outlined text-[#10B981] text-[18px]">{"verified"}</span>
    <span className="text-sm font-semibold text-[#10B981]">{"✓ GPLX B2 đã thẩm định hợp lệ"}</span>
    </div>
    </div>
    <div className="flex flex-col gap-1 md:col-span-2 p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7]">
    <span className="text-xs text-[#666666] uppercase tracking-wider font-semibold">{"Ghi chú gửi chủ xe"}</span>
    <p className="text-sm text-[#292929] italic">{"\n“Nhận xe đúng 08:00 sáng thứ Bảy, giữ gìn xe sạch sẽ.”\n"}</p>
    </div>
    </div>
    </section>

    <section className="p-6 rounded-2xl bg-white border border-[#E9E9E7] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
    <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-[#FC6C26] text-[22px]">{"history"}</span>
    <h2 className="text-xl font-bold text-[#292929]">{"Lịch sử hoạt động đơn thuê"}</h2>
    </div>
    <span className="text-xs text-[#666666] font-medium">{"Thời gian thực"}</span>
    </div>
    <div className="flex flex-col gap-0 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E9E9E7]">
    <div className="relative pb-4 group">
    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#FC6C26] ring-4 ring-white shadow-sm"></div>
    <div className="flex flex-col gap-0.5">
    <div className="flex items-center gap-2">
    <span className="text-xs font-bold text-[#FC6C26] whitespace-nowrap">{"Hôm nay, 10:46"}</span>
    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F7F7F5] border border-[#E9E9E7] text-[#666666]">{"Hệ thống"}</span>
    </div>
    <p className="text-sm text-[#292929]">{"Hệ thống ghi nhận yêu cầu và thông báo đến chủ xe."}</p>
    </div>
    </div>
    <div className="relative group">
    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#10B981] ring-4 ring-white shadow-sm"></div>
    <div className="flex flex-col gap-0.5">
    <div className="flex items-center gap-2">
    <span className="text-xs font-bold text-[#10B981] whitespace-nowrap">{"Hôm nay, 10:45"}</span>
    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F7F7F5] border border-[#E9E9E7] text-[#666666]">{"Khách hàng"}</span>
    </div>
    <p className="text-sm text-[#292929]">{"Yêu cầu thuê xe được tạo (Bởi khách hàng "}<strong className="font-semibold text-[#292929]">{"Nguyễn Hoàng Minh"}</strong>{")."}</p>
    </div>
    </div>
    </div>
    <div className="pt-1 flex items-center gap-2 text-[#666666] text-xs">
    <span className="material-symbols-outlined text-[16px] text-[#FC6C26]">{"sync"}</span>
    <span>{"Lịch sử cập nhật tự động khi có trạng thái mới từ hệ thống."}</span>
    </div>
    </section>

    <section className="p-6 rounded-2xl bg-white border border-[#E9E9E7] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
    <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-[#FC6C26] text-[22px]">{"rule"}</span>
    <h2 className="text-xl font-bold text-[#292929]">{"Quy định hủy yêu cầu & Bảo lưu"}</h2>
    </div>
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7]">
    <div className="flex flex-col gap-1 max-w-xl">
    <span className="text-sm font-bold text-[#292929]">{"Quy định hủy yêu cầu thuê xe"}</span>
    <p className="text-xs text-[#292929] leading-relaxed">{"Khách hàng có thể hủy yêu cầu miễn phí khi đơn còn ở trạng thái Chờ xác nhận theo quy định hệ thống. Khi chủ xe đã phê duyệt hoặc sau thanh toán, chính sách hoàn hủy sẽ áp dụng theo điều khoản hợp đồng."}</p>
    </div>
    <button className="px-4 py-2.5 rounded-xl bg-white border border-[#E9E9E7] hover:bg-red-50 text-[#EF4444] font-semibold text-sm transition-all shadow-sm shrink-0 flex items-center gap-2 whitespace-nowrap" type="button" aria-label="Hủy yêu cầu thuê xe" data-action="cancel-order" data-handler="toggleCancelModal" data-args="true">
    <span className="material-symbols-outlined text-[18px]">{"cancel"}</span>
    <span>{"Hủy yêu cầu thuê xe"}</span>
    </button>
    </div>
    <div className="flex items-center gap-2 text-[#666666] text-xs">
    <span className="material-symbols-outlined text-[16px]">{"info"}</span>
    <span>{"Mọi thao tác hủy yêu cầu được lưu trữ minh bạch trên hệ thống nhật ký đơn hàng."}</span>
    </div>
    </section>
    </div>

    <aside className="lg:col-span-4 flex flex-col gap-6 sticky top-24">

    <div className="p-6 rounded-2xl bg-white border border-[#E9E9E7] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
    <div className="flex items-center justify-between pb-1">
    <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-[#FC6C26] text-[20px]">{"receipt_long"}</span>
    <h3 className="text-xl font-bold text-[#292929]">{"Bảng kê chi phí"}</h3>
    </div>
    </div>

    <div className="flex flex-col gap-3 text-sm">
    <div className="flex items-center justify-between text-[#666666]">
    <span>{"Đơn giá thuê theo ngày"}</span>
    <span className="text-[#292929] font-semibold">{"1.950.000 đ / ngày"}</span>
    </div>
    <div className="flex items-center justify-between text-[#666666]">
    <span>{"Thời lượng tính phí"}</span>
    <span className="text-[#292929] font-semibold">{"2 ngày (48 giờ)"}</span>
    </div>
    <div className="flex items-center justify-between text-[#666666]">
    <span>{"Tiền thuê trước giảm giá"}</span>
    <span className="ui-money text-[#292929] font-semibold">{"3.900.000 đ"}</span>
    </div>

    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#D1FAE5] border border-[#10B981] text-[#10B981]">
    <div className="flex items-center gap-1.5 text-xs font-bold">
    <span className="material-symbols-outlined text-[16px]">{"sell"}</span>
    <span className="tracking-wider">{"CARDBWELCOME"}</span>
    </div>
    <span className="ui-money font-bold text-sm">{"-200.000 đ"}</span>
    </div>

    <div className="pt-3 flex items-center justify-between bg-[#F7F7F5] border border-[#E9E9E7] p-3.5 rounded-xl mt-1">
    <div className="flex flex-col">
    <span className="text-sm font-bold text-[#292929] whitespace-nowrap">{"Tiền thuê xe sau ưu đãi"}</span>
    <span className="text-xs text-[#666666]">{"Đã bao gồm VAT & bảo hiểm"}</span>
    </div>
    <div className="text-right">
    <span className="ui-money text-2xl font-bold text-[#FC6C26] tracking-tight whitespace-nowrap">{"3.700.000 đ"}</span>
    </div>
    </div>
    </div>

    <div className="p-4 rounded-xl bg-[#FFF4D6] border border-[#FDE68A] flex flex-col gap-2">
    <div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-1.5 text-[#292929]">
    <span className="material-symbols-outlined text-[#F5A623] text-[18px]">{"account_balance_wallet"}</span>
    <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">{"TIỀN CỌC THẾ CHẤP"}</span>
    </div>
    <span className="ui-money text-base font-bold text-[#292929] whitespace-nowrap">{"15.000.000 đ"}</span>
    </div>
    <p className="text-xs text-[#292929] leading-relaxed">{"Khoản tiền cọc được hoàn trả đầy đủ khi khách hàng trả xe theo quy trình kiểm tra bàn giao."}</p>
    </div>

    <div className="flex items-center justify-between p-4 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7]">
    <div className="flex flex-col">
    <span className="text-xs font-semibold text-[#292929]">{"Tổng nghĩa vụ tài chính dự kiến"}</span>
    <span className="text-[11px] text-[#666666]">{"(Thuê xe + Cọc thế chấp)"}</span>
    </div>
    <span className="ui-money text-xl font-bold text-[#FC6C26]">{"18.700.000 đ"}</span>
    </div>

    <div className="flex items-center justify-between px-1 pt-1">
    <span className="text-xs text-[#666666]">{"Trạng thái thanh toán:"}</span>
    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#666666]">
    <span className="w-2 h-2 rounded-full bg-[#666666]"></span>
    <span>{"Chưa thanh toán"}</span>
    </div>
    </div>
    </div>

    <div className="p-6 rounded-2xl bg-white border border-[#E9E9E7] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4">

    <div className="p-4 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-start gap-3">
    <span className="material-symbols-outlined text-[#F5A623] text-[22px] shrink-0 mt-0.5">{"schedule"}</span>
    <div className="flex flex-col gap-1">
    <span className="text-sm font-bold text-[#292929]">{"Đang chờ chủ xe xác nhận"}</span>
    <p className="text-xs text-[#292929] leading-snug">{"Bạn chưa cần thanh toán tại bước này. Hệ thống sẽ mở cổng thanh toán an toàn ngay khi chủ xe phê duyệt yêu cầu."}</p>
    </div>
    </div>

    <Link className="w-full py-3.5 px-4 rounded-xl bg-[#FC6C26] hover:bg-[#e05815] text-white font-bold text-center flex items-center justify-center gap-2 shadow-md transition-all text-sm" data-path="chuyen-xe-cua-toi" to="/chuyen-xe-cua-toi">
    <span className="material-symbols-outlined text-[20px]">{"directions_car"}</span>
    <span>{"← Quay lại Chuyến xe của tôi"}</span>
    </Link>

    <Link className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#F7F7F5] border border-[#E9E9E7] text-[#292929] font-semibold text-center flex items-center justify-center gap-2 transition-all text-sm shadow-sm" data-path="kham-pha-xe" to="/kham-pha-xe">
    <span className="material-symbols-outlined text-[18px]">{"search"}</span>
    <span>{"Xem danh sách xe khác"}</span>
    </Link>

    <div className="pt-2 flex items-center justify-between text-xs text-[#666666]">
    <div className="flex items-center gap-1.5">
    <span className="material-symbols-outlined text-[#FC6C26] text-[16px]">{"headset_mic"}</span>
    <span>{"Cần hỗ trợ về đơn thuê này?"}</span>
    </div>
    <a className="font-bold text-[#FC6C26] hover:underline" href="tel:19008899">{"1900 8899 (24/7)"}</a>
    </div>
    </div>
    </aside>
    </div>
    </div>
    </div>

    <div className="hidden"></div>


    </div></main></div>);
}
