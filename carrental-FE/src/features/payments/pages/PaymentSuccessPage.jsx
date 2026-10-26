import { Link } from "react-router";
export default function PaymentSuccess() {
    return (<div className="cardb-screen screen-paymentsuccess bg-soft-bg font-sans text-charcoal antialiased"><main className="w-full  bg-soft-bg min-h-[calc(100vh-140px)] pt-20"><div className="flex flex-col w-full"><div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6 relative z-10 w-full">

    <nav aria-label="Đường dẫn trang" className="flex items-center gap-1.5 text-subtext text-xs md:text-sm">
    <Link className="hover:text-orange-brand transition-colors flex items-center gap-1" data-path="my-trips" to="/my-trips">
    <span className="material-symbols-outlined text-[16px]">{"directions_car"}</span>
    <span>{"Chuyến xe của tôi"}</span>
    </Link>
    <span className="material-symbols-outlined text-[14px] text-gray-400">{"chevron_right"}</span>
    <Link className="hover:text-orange-brand transition-colors" data-path="chi-tiet-don-thue" to="/orders/CDB-ORD-20261026-904">{"\n          Chi tiết đơn thuê\n        "}</Link>
    <span className="material-symbols-outlined text-[14px] text-gray-400">{"chevron_right"}</span>
    <span className="text-subtext">{"Thanh toán"}</span>
    <span className="material-symbols-outlined text-[14px] text-gray-400">{"chevron_right"}</span>
    <span className="text-orange-brand font-semibold">{"Thành công"}</span>
    </nav>

    <section className="flex flex-col items-center text-center pt-2 pb-2">
    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-light border-2 border-emerald-border flex items-center justify-center text-emerald-accent shadow-sm mx-auto">
    <span className="material-symbols-outlined text-[36px] md:text-[44px]" style={{ "fontVariationSettings": "'FILL' 1, 'wght' 700" }}>{"check_circle"}</span>
    </div>
    <h1 className="text-2xl md:text-[32px] text-charcoal font-bold tracking-tight mt-4">{"\n          Thanh toán thành công!\n        "}</h1>
    <p className="text-sm md:text-base text-subtext max-w-xl text-center mt-2 leading-relaxed">{"\n          CarDB đã ghi nhận thanh toán tiền thuê xe của bạn. Bạn có thể theo dõi lịch nhận xe trong chi tiết đơn thuê.\n        "}</p>

    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
    <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-blue-light text-blue-accent font-medium text-sm">
    <span className="w-2 h-2 rounded-full bg-blue-accent inline-block"></span>
    <span>{"Trạng thái đơn: "}<strong className="font-semibold text-charcoal">{"Đã xác nhận"}</strong></span>
    </div>
    <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-light text-emerald-accent font-medium text-sm">
    <span className="material-symbols-outlined text-[16px] text-emerald-accent" style={{ "fontVariationSettings": "'FILL' 1" }}>{"verified"}</span>
    <span>{"Thanh toán: "}<strong className="font-bold text-emerald-accent">{"Đã thanh toán"}</strong></span>
    </div>
    </div>
    </section>

    <section aria-label="Tiến trình đơn đặt xe" className="w-full bg-[#FFFFFF] border border-card-border rounded-[16px] p-6 shadow-sm flex flex-col gap-5">
    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-card-border">
    <div className="flex items-center gap-2 text-charcoal font-bold text-base md:text-lg">
    <span className="material-symbols-outlined text-emerald-accent text-[22px]">{"timeline"}</span>
    <span>{"Tiến trình đơn thuê"}</span>
    </div>
    <div className="flex items-center gap-1.5 text-subtext text-xs md:text-sm font-medium">
    <span>{"Bước 3 / 4 hoàn tất"}</span>
    </div>
    </div>
    <div className="relative py-2">
    <div className="absolute top-5 left-[12%] right-[12%] h-[2px] -translate-y-1/2 z-0 hidden md:block">
    <div className="w-full h-full bg-gray-200 relative">
    <div className="absolute left-0 top-0 h-full bg-emerald-accent w-[66.6%]"></div>
    </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-2 relative z-10">
    <div className="flex flex-col items-center text-center">
    <div className="w-10 h-10 rounded-full bg-emerald-accent text-white flex items-center justify-center font-bold shadow-sm">
    <span className="material-symbols-outlined text-[20px] font-bold">{"done"}</span>
    </div>
    <div className="mt-2.5 flex flex-col items-center">
    <span className="text-sm text-charcoal font-semibold">{"Gửi yêu cầu"}</span>
    <span className="text-xs text-emerald-accent font-medium mt-0.5">{"Hoàn tất"}</span>
    </div>
    </div>
    <div className="flex flex-col items-center text-center">
    <div className="w-10 h-10 rounded-full bg-emerald-accent text-white flex items-center justify-center font-bold shadow-sm">
    <span className="material-symbols-outlined text-[20px] font-bold">{"done"}</span>
    </div>
    <div className="mt-2.5 flex flex-col items-center">
    <span className="text-sm text-charcoal font-semibold">{"Chủ xe xác nhận"}</span>
    <span className="text-xs text-emerald-accent font-medium mt-0.5">{"Hoàn tất"}</span>
    </div>
    </div>
    <div className="flex flex-col items-center text-center">
    <div className="w-10 h-10 rounded-full bg-emerald-accent text-white border-2 border-emerald-light flex items-center justify-center font-bold shadow-sm">
    <span className="material-symbols-outlined text-[20px] font-bold">{"done_all"}</span>
    </div>
    <div className="mt-2.5 flex flex-col items-center">
    <span className="text-sm text-emerald-accent font-bold">{"Thanh toán"}</span>
    <span className="text-xs text-emerald-accent font-medium mt-0.5">{"Hoàn tất"}</span>
    </div>
    </div>
    <div className="flex flex-col items-center text-center">
    <div className="w-10 h-10 rounded-full bg-[#E9E9E7] text-subtext flex items-center justify-center font-medium">
    <span className="material-symbols-outlined text-[18px]">{"vpn_key"}</span>
    </div>
    <div className="mt-2.5 flex flex-col items-center">
    <span className="text-sm text-subtext font-medium">{"Nhận xe"}</span>
    <span className="text-xs text-subtext mt-0.5">{"Chưa thực hiện"}</span>
    </div>
    </div>
    </div>
    </div>
    <div className="rounded-xl bg-emerald-light border border-emerald-border p-4 flex items-center gap-3">
    <span className="text-emerald-accent font-bold text-lg leading-none shrink-0">{"✓"}</span>
    <p className="text-sm text-charcoal leading-snug">{"\n      Giao dịch thanh toán tiền thuê xe đã được ghi nhận. Chủ xe sẽ liên hệ bàn giao xe theo lịch hẹn ngày "}<strong className="text-charcoal font-semibold">{"26/10/2026"}</strong>{".\n    "}</p>
    </div>
    </section>

    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

    <div className="lg:col-span-7 flex flex-col gap-6">
    <div className="bg-[#FFFFFF] border border-card-border rounded-[16px] p-6 shadow-sm relative">
    <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-card-border">
    <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-[#FFF0E8] text-orange-brand flex items-center justify-center">
    <span className="material-symbols-outlined text-[24px]">{"receipt_long"}</span>
    </div>
    <div className="flex flex-col">
    <h2 className="text-xl text-charcoal font-bold">{"Biên lai giao dịch"}</h2>
    <span className="text-xs text-subtext">{"Thanh toán trực tuyến nội bộ CarDB"}</span>
    </div>
    </div>
    <span className="px-3 py-1 rounded-full bg-[#F0F1EF] text-charcoal font-mono text-xs font-semibold">{"\n  TXN-20261026-904-SIM\n"}</span>
    </div>

    <div className="flex flex-col gap-1 py-3 text-sm">
    <div className="flex items-center justify-between py-2 border-b border-card-border">
    <span className="text-subtext">{"Mã đơn thuê"}</span>
    <span className="font-mono text-charcoal font-bold">{"CDB-ORD-20261026-904"}</span>
    </div>
    <div className="flex items-center justify-between py-2 border-b border-card-border">
    <span className="text-subtext">{"Phương thức thanh toán"}</span>
    <span className="text-charcoal flex items-center gap-1.5 font-medium">
    <span className="material-symbols-outlined text-[16px] text-orange-brand">{"account_balance_wallet"}</span>
    <span>{"Thanh toán mô phỏng (CarDB Internal)"}</span>
    </span>
    </div>
    <div className="flex items-center justify-between py-2 border-b border-card-border">
    <span className="text-subtext">{"Thời gian thanh toán"}</span>
    <span className="text-subtext font-medium">{"11:25, 26/10/2026 (minh họa)"}</span>
    </div>
    <div className="flex items-center justify-between py-2 border-b border-card-border">
    <span className="text-subtext">{"Kết quả giao dịch"}</span>
    <span className="text-emerald-accent font-semibold flex items-center gap-1">
    <span>{"✓"}</span>
    <span>{"Thành công (Đã xác thực)"}</span>
    </span>
    </div>
    <div className="flex items-center justify-between py-2 border-b border-card-border">
    <span className="text-subtext">{"Nội dung thanh toán"}</span>
    <span className="text-charcoal font-medium">{"Tiền thuê xe tự lái 2 ngày trọn gói"}</span>
    </div>
    <div className="flex items-center justify-between py-2 border-b border-card-border">
    <span className="text-subtext">{"Tiền thuê gốc (2 ngày)"}</span>
    <span className="ui-money text-charcoal font-medium font-mono">{"3.900.000 đ"}</span>
    </div>
    <div className="flex items-center justify-between py-2 text-emerald-accent font-semibold">
    <span className="flex items-center gap-1.5">
    <span className="material-symbols-outlined text-[16px]">{"loyalty"}</span>
    <span>{"Voucher ưu đãi (CARDBWELCOME)"}</span>
    </span>
    <span className="ui-money font-mono">{"-200.000 đ"}</span>
    </div>
    </div>

    <div className="mt-2 rounded-xl p-4 bg-[#FFF8F5] border border-[#FFE0D1] flex flex-col gap-2 sm:flex-row sm:items-baseline justify-between">
    <div className="flex flex-col">
    <span className="text-xs text-charcoal font-bold uppercase tracking-wider">{"SỐ TIỀN ĐÃ THANH TOÁN"}</span>
    <span className="text-xs text-subtext mt-0.5">{"Đã bao gồm VAT & bảo hiểm cơ bản"}</span>
    </div>
    <div className="text-right">
    <span className="ui-money text-2xl md:text-3xl text-orange-brand font-bold tracking-tight">{"3.700.000 đ"}</span>
    </div>
    </div>

    <div className="mt-4 rounded-xl p-4 bg-[#FFFBEB] border border-[#FDE68A] flex flex-col gap-2">
    <div className="flex items-center justify-between flex-wrap gap-2">
    <span className="text-sm font-bold text-charcoal uppercase tracking-wide">{"\n  TIỀN CỌC HOÀN LẠI: 15.000.000 Đ\n"}</span>
    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">{"\n  Thực hiện tại bãi nhận xe\n"}</span>
    </div>
    <p className="text-sm text-charcoal leading-relaxed">
    <strong>{"Lưu ý:"}</strong>{" Khoản cọc thế chấp được thực hiện riêng khi giao nhận xe tại bãi xe theo thỏa thuận trong kịch bản minh họa. Khoản cọc "}<strong>{"CHƯA thu"}</strong>{" và "}<strong>{"KHÔNG"}</strong>{" nằm trong số tiền 3.700.000 đ đã thanh toán trực tuyến này.\n"}</p>
    </div>

    <div className="flex-wrap gap-y-2 mt-4 pt-3 border-t border-card-border flex items-center justify-between text-subtext text-xs">
    <div className="flex items-center gap-1.5">
    <span className="text-emerald-accent font-bold">{"✓"}</span>
    <span>{"Chứng từ điện tử hợp lệ theo luật GĐĐT Việt Nam"}</span>
    </div>
    <button className="ui-action border border-card-border text-charcoal hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors" type="button" aria-label="In biên lai" data-action="receipt" data-handler="window.print" data-args="">
    <span className="material-symbols-outlined text-[15px]">{"print"}</span>
    <span>{"In biên lai"}</span>
    </button>
    </div>
    </div>
    </div>

    <div className="lg:col-span-5 flex flex-col gap-6">

    <div className="bg-[#FFFFFF] border border-card-border rounded-[16px] p-6 shadow-sm flex flex-col">
    <div className="relative w-full h-44 rounded-lg overflow-hidden bg-gray-100">
    <img className="w-full h-full object-cover" src="/images/cardb-2e3a36134e5d812f.webp" alt="Hình ảnh xe CarDB" loading="lazy" decoding="async"/>
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
    <div className="absolute top-3 left-3">
    <span className="px-2.5 py-1 rounded bg-white/90 backdrop-blur-md text-charcoal text-[11px] font-bold uppercase tracking-wider shadow-xs">{"\n  EV LUXURY • 7 CHỖ\n"}</span>
    </div>
    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
    <span className="text-[11px] text-charcoal font-medium bg-white/90 backdrop-blur-md px-2 py-0.5 rounded shadow-xs">{"\n  Dual Motor AWD • 402 HP\n"}</span>
    <span className="text-[11px] text-emerald-700 font-semibold bg-white/90 backdrop-blur-md px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
    <span className="material-symbols-outlined text-[13px]">{"battery_charging_full"}</span>
    <span>{"Pin 123 kWh"}</span>
    </span>
    </div>
    </div>
    <div className="flex flex-col gap-1 mt-4">
    <h3 className="text-xl text-charcoal font-bold">{"\n  VinFast VF 9 Plus AWD\n"}</h3>
    <p className="text-xs text-subtext">{"\n  Biển số đăng ký minh họa: 51K-889.92 • Màu Xám Titan\n"}</p>
    </div>

    <div className="bg-soft-bg border border-card-border rounded-xl p-3.5 mt-4 flex flex-col gap-2.5 text-xs">
    <div className="flex items-start gap-2.5">
    <span className="material-symbols-outlined text-[18px] text-orange-brand shrink-0 mt-0.5">{"calendar_month"}</span>
    <div className="flex flex-col">
    <span className="text-[11px] text-subtext uppercase font-semibold">{"Thời gian thuê xe"}</span>
    <span className="text-charcoal font-bold text-sm">{"08:00, T7, 26/10/2026 ➔ 08:00, T2, 28/10/2026"}</span>
    <span className="text-subtext font-medium">{"(2 ngày trọn gói)"}</span>
    </div>
    </div>
    <div className="h-[1px] bg-card-border"></div>
    <div className="flex items-start gap-2.5">
    <span className="material-symbols-outlined text-[18px] text-orange-brand shrink-0 mt-0.5">{"pin_drop"}</span>
    <div className="flex flex-col">
    <span className="text-[11px] text-subtext uppercase font-semibold">{"Địa điểm nhận xe"}</span>
    <span className="text-charcoal font-medium text-sm leading-snug">{"128 Thảo Điền, P. Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh"}</span>
    </div>
    </div>
    <div className="h-[1px] bg-card-border"></div>
    <div className="grid grid-cols-2 gap-2 pt-0.5">
    <div className="flex flex-col">
    <span className="text-[11px] text-subtext uppercase font-semibold">{"Chủ xe"}</span>
    <span className="text-charcoal font-medium text-sm flex items-center gap-1 mt-0.5">{"\n  Trần Đức Nam\n  "}<span className="text-amber-500 font-semibold text-xs">{"★ 5.0"}</span>
    </span>
    </div>
    <div className="flex flex-col">
    <span className="text-[11px] text-subtext uppercase font-semibold">{"Khách thuê"}</span>
    <span className="text-charcoal font-medium text-sm truncate mt-0.5">{"Nguyễn Hoàng Minh"}</span>
    </div>
    </div>
    </div>
    </div>

    <div className="bg-soft-bg border border-card-border rounded-xl p-5 flex flex-col">
    <div className="flex items-center gap-2 text-charcoal font-bold text-sm tracking-wide">
    <span className="material-symbols-outlined text-[20px] text-orange-brand">{"assignment"}</span>
    <span>{"HƯỚNG DẪN NHẬN XE TIẾP THEO"}</span>
    </div>
    <p className="text-sm text-charcoal leading-relaxed mt-2">{"\n  Vui lòng theo dõi lịch nhận xe và chuẩn bị đầy đủ giấy tờ tùy thân ("}<strong>{"CCCD gắn chip"}</strong>{" & "}<strong>{"GPLX ô tô hạng B2 trở lên"}</strong>{" đã qua thẩm định) để hoàn tất thủ tục giao xe trực tiếp cùng chủ xe "}<strong>{"Trần Đức Nam"}</strong>{" đúng "}<strong>{"08:00 ngày 26/10/2026"}</strong>{".\n"}</p>
    <div className="rounded-lg bg-emerald-light border border-emerald-border p-3 mt-3 text-emerald-800 text-xs flex items-center gap-2 font-medium">
    <span className="font-bold">{"✓"}</span>
    <span>{"Xe sẽ được sạc đầy 100% pin và vệ sinh diệt khuẩn nội thất trước giờ giao hẹn."}</span>
    </div>
    </div>
    </div>
    </section>

    <section className="mt-2 flex flex-col items-center gap-3 pb-8">
    <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4">

    <Link className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-orange-brand hover:bg-orange-hover text-white font-semibold text-sm shadow-md transition-all cursor-pointer text-center" data-path="chi-tiet-don-thue" to="/orders/CDB-ORD-20261026-904">
    <span>{"Xem chi tiết đơn thuê"}</span>
    <span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
    </Link>

    <Link className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FFFFFF] border border-card-border text-charcoal hover:bg-gray-50 font-medium text-sm shadow-xs transition-all cursor-pointer text-center" data-path="my-trips" to="/my-trips">
    <span className="material-symbols-outlined text-[18px] text-subtext">{"calendar_month"}</span>
    <span>{"Chuyến xe của tôi"}</span>
    </Link>
    </div>

    <Link className="inline-flex items-center gap-1.5 text-subtext hover:text-orange-brand transition-colors text-sm text-center mt-3 font-medium" data-path="explore" to="/explore">
    <span className="material-symbols-outlined text-[16px]">{"arrow_back"}</span>
    <span>{"Tiếp tục khám phá xe khác"}</span>
    </Link>

    <div className="text-center text-sm text-subtext mt-6 flex items-center justify-center gap-1.5">
    <span className="material-symbols-outlined text-[18px] text-orange-brand">{"support_agent"}</span>
    <span>{"Cần hỗ trợ về giao dịch này? Hotline Concierge 24/7: "}<a className="text-orange-brand font-bold hover:underline" href="tel:19008899">{"1900 8899"}</a>{" (Miễn cước kết nối)"}</span>
    </div>
    </section>
    </div>
    </div></main></div>);
}
