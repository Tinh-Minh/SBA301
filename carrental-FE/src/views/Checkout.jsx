import Link from "next/link";
export default function Checkout() {
    return (<div className="cardb-screen screen-checkout bg-background font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container  flex flex-col justify-between"><main className="w-full  bg-[#F7F7F5] flex-1 pt-20">
    <div className="flex flex-col w-full">
    <div className="relative w-full py-space-xl px-gutter md:px-margin bg-[#F7F7F5]">
    <div className="relative max-w-[1360px] mx-auto flex flex-col gap-space-lg">

    <div className="flex flex-col gap-space-xs">
    <nav aria-label="Breadcrumb" className="flex items-center gap-2">
    <Link className="font-label-sm text-label-sm text-[#666666] hover:text-[#FC6C26] transition-colors font-medium" href="/explore">{"Khám phá xe"}</Link>
    <span className="font-label-sm text-label-sm text-[#666666]">{"/"}</span>
    <Link className="font-label-sm text-label-sm text-[#666666] hover:text-[#FC6C26] transition-colors font-medium" href="/cars/vinfast-vf8-plus-2024">{"VinFast VF 9 Plus AWD"}</Link>
    <span className="font-label-sm text-label-sm text-[#666666]">{"/"}</span>
    <span className="font-label-sm text-label-sm text-[#FC6C26] font-semibold">{"Xác nhận yêu cầu thuê xe"}</span>
    </nav>
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm pt-space-xs">
    <div>
    <h1 className="text-[28px] leading-[36px] text-[#292929] tracking-tight font-bold">{"Xác nhận yêu cầu thuê xe"}</h1>
    <p className="font-body-md text-body-md text-[#666666] mt-1 max-w-2xl">{"\n                Kiểm tra kỹ thông tin hành trình và chi phí trước khi gửi yêu cầu đến chủ xe. Đơn thuê sẽ ở trạng thái "}<span className="text-[#FC6C26] font-semibold">{"Chờ xác nhận"}</span>{".\n              "}</p>
    </div>
    <div className="flex items-center gap-2 px-space-md py-space-xs rounded-full bg-[#FFFFFF] border border-[#E9E9E7] shadow-sm">
    <span className="material-symbols-outlined text-[#10B981] text-[16px]">{"lock"}</span>
    <span className="font-label-sm text-label-sm text-[#292929] font-medium tracking-wider uppercase">{"Bảo mật thông tin đơn thuê"}</span>
    </div>
    </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">

    <div className="lg:col-span-8 flex flex-col gap-space-lg">

    <section className="rounded-2xl bg-[#FFFFFF] p-space-lg shadow-sm border border-[#E9E9E7] relative overflow-hidden">
    <div className="flex flex-col md:flex-row gap-space-lg items-center md:items-start pb-space-lg border-b border-[#E9E9E7]">

    <div className="relative w-full md:w-56 h-36 rounded-xl overflow-hidden bg-[#F7F7F5] shrink-0 border border-[#E9E9E7] group">
    <img alt="VinFast VF 9 Plus AWD Luxury Electric SUV" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="/images/cardb-02d5cb41aa8f9514.webp" loading="lazy" decoding="async"/>
    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/95 border border-[#E9E9E7] shadow-sm">
    <span className="font-label-sm text-label-sm text-[#292929] font-bold">{"EV LUXURY"}</span>
    </div>
    </div>

    <div className="flex flex-col justify-between flex-1 w-full">
    <div className="flex flex-col gap-1">
    <div className="flex flex-wrap items-center gap-2">
    <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-[#F7F7F5] border border-[#E9E9E7] text-[#292929] font-semibold">{"Thuần điện • 402 HP • 7 Chỗ thương gia"}</span>
    <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-[#F7F7F5] text-[#666666]">{"Thảo Điền, TP. Thủ Đức, TP.HCM"}</span>
    </div>
    <h2 className="text-[24px] leading-[32px] text-[#292929] font-bold tracking-tight mt-1">{"VinFast VF 9 Plus AWD"}</h2>
    </div>
    <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 bg-[#F7F7F5] p-3 rounded-xl border border-[#E9E9E7]">
    <div className="flex items-center gap-2.5">
    <div className="w-9 h-9 rounded-full bg-[#E9E9E7] text-[#292929] flex items-center justify-center font-bold text-xs border border-white shadow-sm">{"\n                        TĐ\n                      "}</div>
    <div className="flex flex-col">
    <span className="font-label-sm text-label-sm text-[#666666]">{"Chủ xe đối tác"}</span>
    <div className="flex items-center gap-1.5">
    <span className="font-label-md text-label-md text-[#292929] font-bold">{"Trần Đức Nam"}</span>
    <span className="px-1.5 py-0.2 rounded text-[11px] bg-[#FEF3C7] text-[#92400E] font-bold flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px]">{"star"}</span>{" 5.0"}</span>
    </div>
    </div>
    </div>
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#E9E9E7] text-[#666666]">
    <span className="material-symbols-outlined text-[15px] text-[#FC6C26]">{"hourglass_top"}</span>
    <span className="font-label-sm text-label-sm font-medium">{"Chủ xe sẽ xem xét yêu cầu thuê của bạn"}</span>
    </div>
    </div>
    </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-space-md rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] mt-space-md">
    <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-[#666666] font-label-sm text-label-sm">
    <span className="material-symbols-outlined text-[#FC6C26] text-[16px]">{"calendar_today"}</span>
    <span>{"Nhận xe (Dự kiến)"}</span>
    </div>
    <span className="font-label-lg text-label-lg text-[#292929] font-bold">{"08:00 • Thứ Bảy, 26/10/2026"}</span>
    <span className="font-body-sm text-body-sm text-[#666666]">{"Thảo Điền, TP. Thủ Đức, TP.HCM"}</span>
    </div>
    <div className="flex flex-col gap-1 md:border-l md:border-[#E9E9E7] md:pl-3">
    <div className="flex items-center gap-1.5 text-[#666666] font-label-sm text-label-sm">
    <span className="material-symbols-outlined text-[#FC6C26] text-[16px]">{"event_repeat"}</span>
    <span>{"Trả xe (Dự kiến)"}</span>
    </div>
    <span className="font-label-lg text-label-lg text-[#292929] font-bold">{"08:00 • Thứ Hai, 28/10/2026"}</span>
    <span className="font-body-sm text-body-sm text-[#666666]">{"Thảo Điền, TP. Thủ Đức, TP.HCM"}</span>
    </div>
    <div className="flex flex-col justify-center gap-1 md:border-l md:border-[#E9E9E7] md:pl-3">
    <span className="font-label-sm text-label-sm text-[#666666]">{"Thời lượng hành trình"}</span>
    <div className="flex items-baseline gap-1.5">
    <span className="font-headline-sm text-headline-sm text-[#FC6C26] font-bold whitespace-nowrap">{"2 ngày"}</span>
    <span className="font-label-sm text-label-sm text-[#666666] whitespace-nowrap">{"(48 giờ trọn vẹn)"}</span>
    </div>
    <span className="font-label-sm text-label-sm text-[#292929] font-medium">{"Hình thức: Thuê theo ngày"}</span>
    </div>
    </div>

    <div className="mt-space-md flex items-start gap-3 p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#292929]">
    <span className="material-symbols-outlined text-[#D97706] text-[20px] shrink-0 mt-0.5">{"info"}</span>
    <p className="font-body-sm text-body-sm leading-relaxed text-[#292929]">
    <strong className="font-semibold text-[#B45309]">{"Lưu ý quan trọng:"}</strong>{" Yêu cầu thuê sẽ được gửi trực tiếp đến chủ xe để kiểm tra và xác nhận tính khả dụng của xe trước khi phát sinh bất kỳ khoản thanh toán nào.\n                "}</p>
    </div>
    </section>

    <section className="rounded-2xl bg-[#FFFFFF] p-space-lg shadow-sm border border-[#E9E9E7]">
    <div className="flex items-center justify-between pb-space-md border-b border-[#E9E9E7]">
    <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26]">
    <span className="material-symbols-outlined text-[18px]">{"location_on"}</span>
    </div>
    <h3 className="font-headline-sm text-headline-sm text-[#292929] font-bold">{"Địa điểm & Thông tin khách hàng"}</h3>
    </div>
    <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-[#F0F1EF] text-[#292929] uppercase font-bold tracking-wider">{"Tự lái • Nhận tại bãi"}</span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-md">

    <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7]">
    <div className="flex items-center gap-2 text-[#666666] font-label-sm text-label-sm">
    <span className="material-symbols-outlined text-[#FC6C26] text-[16px]">{"pin_drop"}</span>
    <span className="font-semibold">{"Điểm nhận & Trả xe cố định"}</span>
    </div>
    <p className="font-label-lg text-label-lg text-[#292929] font-bold leading-snug">{"128 Thảo Điền, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh"}</p>
    <div className="flex items-center gap-1.5 text-[#666666] font-body-sm text-body-sm">
    <span className="material-symbols-outlined text-[14px] text-[#FC6C26]">{"garage_home"}</span>
    <span>{"Giao nhận an toàn tại bãi xe riêng của chủ xe"}</span>
    </div>
    </div>

    <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7]">
    <div className="flex items-center justify-between">
    <span className="text-[#666666] font-label-sm text-label-sm font-semibold">{"Người thuê xe đại diện"}</span>
    <span className="px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#10B981] font-label-sm text-label-sm font-bold flex items-center gap-1 border border-[#10B981]/30">
    <span className="material-symbols-outlined text-[12px]">{"verified"}</span>{" eKYC Đã duyệt\n                    "}</span>
    </div>
    <p className="font-label-lg text-label-lg text-[#292929] font-bold tracking-wide">{"\n                    NGUYỄN HOÀNG MINH\n                  "}</p>
    <div className="flex items-center justify-between font-body-sm text-body-sm text-[#666666]">
    <span>{"Số điện thoại: "}<strong className="text-[#292929] font-semibold">{"0908 ••• 492"}</strong></span>
    <span className="text-[#10B981] font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">{"check_circle"}</span>{" GPLX B2 • Đã duyệt"}</span>
    </div>
    </div>
    </div>

    <div className="mt-space-md flex flex-col gap-2">
    <label className="font-label-md text-label-md text-[#292929] font-semibold flex items-center justify-between" htmlFor="booking-note">
    <span>{"Lời nhắn gửi chủ xe (Tùy chọn)"}</span>
    <span className="text-[#666666] text-xs font-normal">{"Tối đa 300 ký tự"}</span>
    </label>
    <textarea className="w-full rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] p-3.5 font-body-sm text-body-sm text-[#292929] placeholder:text-[#666666] focus:outline-none focus:ring-2 focus:ring-[#FC6C26] transition-all resize-none" id="booking-note" placeholder="Ví dụ: Xin chào chủ xe, tôi cần giao xe trước 15 phút tại bãi đỗ để kiểm tra xe kỹ càng, mong được hỗ trợ kết nối sạc pin 100% trước khi nhận..." rows={3}></textarea>
    </div>
    </section>

    <section className="rounded-2xl bg-[#FFFFFF] p-space-lg shadow-sm border border-[#E9E9E7]">
    <div className="flex items-center gap-2 pb-space-sm border-b border-[#E9E9E7]">
    <div className="w-8 h-8 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26]">
    <span className="material-symbols-outlined text-[18px]">{"sell"}</span>
    </div>
    <h3 className="font-headline-sm text-headline-sm text-[#292929] font-bold">{"Mã ưu đãi & Phiếu giảm giá"}</h3>
    </div>
    <div className="flex flex-col sm:flex-row gap-3 mt-space-md">
    <div className="relative flex-1">
    <input className="w-full rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] pl-3.5 pr-32 py-3 font-label-lg text-label-lg text-[#292929] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#FC6C26]" id="voucher-input" placeholder="Nhập mã ưu đãi (ví dụ: CARDBWELCOME)" type="text" aria-label="Nhập mã ưu đãi (ví dụ: CARDBWELCOME)" defaultValue="CARDBWELCOME"/>
    <button className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-[#D1FAE5] text-[#10B981] font-label-md text-label-md font-bold transition-all border border-[#10B981]/30" id="btn-apply-voucher" type="button" aria-label="Đã áp dụng" data-action="apply-voucher">{"\n                    Đã áp dụng\n                  "}</button>
    </div>
    </div>

    <div className="mt-3 flex items-center justify-between p-3.5 rounded-xl bg-[#D1FAE5] border border-[#10B981] text-[#292929]" id="voucher-status-box">
    <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-[#10B981] text-[20px]">{"check_circle"}</span>
    <span className="font-body-sm text-body-sm text-[#065F46]">{"\n                    Mã "}<strong className="text-[#047857] font-bold">{"CARDBWELCOME"}</strong>{" (-200.000 đ) đã được áp dụng thành công cho đơn đặt xe đầu tiên!\n                  "}</span>
    </div>
    <button className="text-[#666666] hover:text-[#DC2626] transition-colors p-1" title="Hủy mã" type="button" aria-label="Hủy mã" data-action="remove-voucher">
    <span className="material-symbols-outlined text-[16px]">{"close"}</span>
    </button>
    </div>
    </section>

    <section className="rounded-2xl bg-[#FFFFFF] p-space-lg shadow-sm border border-[#E9E9E7]">
    <div className="flex items-center gap-2 pb-space-md border-b border-[#E9E9E7]">
    <div className="w-8 h-8 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26]">
    <span className="material-symbols-outlined text-[18px]">{"verified_user"}</span>
    </div>
    <h3 className="font-headline-sm text-headline-sm text-[#292929] font-bold">{"Chính sách & Thủ tục cần biết"}</h3>
    </div>
    <div className="space-y-3 pt-space-md">
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7]">
    <div className="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26] font-bold text-xs shrink-0 mt-0.5">{"1"}</div>
    <div className="flex flex-col gap-0.5">
    <span className="font-label-lg text-label-lg text-[#292929] font-bold">{"Giấy tờ xuất trình khi nhận xe"}</span>
    <p className="font-body-sm text-body-sm text-[#666666]">{"Bắt buộc xuất trình bản gốc CCCD gắn chip và Giấy phép lái xe hợp lệ để đối soát trực tiếp cùng chủ xe tại thời điểm bàn giao."}</p>
    </div>
    </div>
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7]">
    <div className="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26] font-bold text-xs shrink-0 mt-0.5">{"2"}</div>
    <div className="flex flex-col gap-0.5">
    <span className="font-label-lg text-label-lg text-[#292929] font-bold">{"Tiền cọc thế chấp (Đặt cọc xe): 15.000.000 đ"}</span>
    <p className="font-body-sm text-body-sm text-[#666666]">{"Tiền cọc được thu riêng theo quy trình bàn giao xe (không gộp vào tiền thuê). Khoản tiền được xử lý và hoàn trả sau khi hoàn tất trả xe và đối soát các khoản phát sinh (nếu có)."}</p>
    </div>
    </div>
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7]">
    <div className="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26] font-bold text-xs shrink-0 mt-0.5">{"3"}</div>
    <div className="flex flex-col gap-0.5">
    <span className="font-label-lg text-label-lg text-[#292929] font-bold">{"Chính sách hủy chuyến"}</span>
    <p className="font-body-sm text-body-sm text-[#666666]">{"Áp dụng theo quy định của đơn thuê và thỏa thuận thống nhất giữa hai bên trước khi chuyến đi bắt đầu."}</p>
    </div>
    </div>
    </div>
    </section>
    </div>

    <aside className="lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-24">

    <div className="rounded-2xl bg-[#FFFFFF] p-space-lg shadow-sm border border-[#E9E9E7] relative overflow-hidden flex flex-col gap-space-md">
    <div className="flex items-center justify-between border-b border-[#E9E9E7] pb-3">
    <h3 className="font-headline-sm text-headline-sm text-[#292929] font-bold">{"Chi tiết giá thuê"}</h3>
    <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-[#F0F1EF] text-[#666666] font-semibold">{"Báo giá minh bạch"}</span>
    </div>

    <div className="space-y-3 font-body-sm text-body-sm">
    <div className="flex items-center justify-between gap-2 text-[#666666]">
    <span>{"Đơn giá thuê (1.950.000 đ × 2 ngày)"}</span>
    <span className="ui-money text-[#292929] font-semibold shrink-0 text-right whitespace-nowrap">{"3.900.000 đ"}</span>
    </div>
    <div className="flex items-center justify-between gap-2 text-[#666666]">
    <span>{"Thời lượng tính phí"}</span>
    <span className="text-[#292929] font-semibold shrink-0 text-right whitespace-nowrap">{"2 ngày (48 giờ)"}</span>
    </div>
    <div className="flex items-center justify-between gap-2 text-[#666666]">
    <span>{"Phí dịch vụ CarDB Concierge"}</span>
    <span className="text-[#10B981] font-semibold shrink-0 text-right whitespace-nowrap">{"Miễn phí (Ưu đãi)"}</span>
    </div>
    <div className="flex items-center justify-between gap-2 text-[#666666]">
    <span>{"Mã ưu đãi (CARDBWELCOME)"}</span>
    <span data-voucher-discount="true" className="ui-money text-[#10B981] font-bold shrink-0 text-right whitespace-nowrap">{"-200.000 đ"}</span>
    </div>
    <div className="pt-3 border-t border-[#E9E9E7] flex items-center justify-between gap-2">
    <span className="font-label-lg text-label-lg text-[#292929] font-bold">{"Tổng tiền thuê xe (2 ngày)"}</span>
    <span data-checkout-total="currency" className="ui-money text-[22px] text-[#FC6C26] font-bold shrink-0 text-right whitespace-nowrap">{"3.700.000 đ"}</span>
    </div>
    </div>

    <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex flex-col gap-1.5">
    <div className="flex items-center justify-between gap-2">
    <span className="font-label-md text-label-md text-[#92400E] font-bold">{"Tiền cọc thế chấp:"}</span>
    <span className="ui-money font-label-lg text-label-lg text-[#FC6C26] font-extrabold shrink-0 text-right whitespace-nowrap">{"15.000.000 đ"}</span>
    </div>
    <span className="font-label-sm text-label-sm text-[#78350F] leading-relaxed">{"(Chưa thu - Khách bàn giao trực tiếp tại bãi nhận xe. Hoàn trả 100% sau khi đối soát xe)."}</span>
    </div>

    <div className="rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] p-space-md flex flex-col gap-2">
    <div className="flex items-center justify-between">
    <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#666666] font-semibold">{"Tổng tiền thuê cần thanh toán"}</span>
    <span className="font-label-sm text-label-sm text-[#FC6C26] font-bold">{"(khi được duyệt)"}</span>
    </div>
    <div className="flex items-baseline justify-between">
    <span data-checkout-total="number" className="text-[32px] text-[#292929] font-extrabold tracking-tight whitespace-nowrap">{"3.700.000"}</span>
    <span className="text-[20px] text-[#FC6C26] font-bold whitespace-nowrap">{"VNĐ"}</span>
    </div>
    <div className="pt-2 border-t border-[#E9E9E7] text-[#666666] font-label-sm text-label-sm flex items-start gap-2">
    <span className="material-symbols-outlined text-[#FC6C26] text-[16px] shrink-0 mt-0.5">{"info"}</span>
    <span>{"Bạn chưa cần thanh toán tại bước gửi yêu cầu. Chờ chủ xe xác nhận trước khi tiếp tục. Đơn thuê sẽ ở trạng thái "}<strong className="text-[#FC6C26] font-bold">{"Chờ xác nhận (PENDING)"}</strong>{"."}</span>
    </div>
    </div>

    <div className="flex flex-col gap-2.5 pt-1">
    <button className="w-full py-3.5 px-4 rounded-xl bg-[#FC6C26] hover:bg-[#e05b19] text-white font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-all duration-300 transform active:scale-[0.98] cursor-pointer" id="btn-submit-booking" type="button" aria-label="Gửi yêu cầu thuê xe" data-route="/booking/success">
    <span>{"Gửi yêu cầu thuê xe"}</span>
    <span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
    </button>
    <Link className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#E9E9E7] hover:bg-[#F7F7F5] text-[#292929] font-label-md text-label-md font-bold text-center transition-colors flex items-center justify-center gap-1.5" href="/my-trips">
    <span className="material-symbols-outlined text-[16px]">{"arrow_back"}</span>
    <span>{"Quay lại chi tiết xe"}</span>
    </Link>
    </div>
    <div className="flex items-center justify-center gap-3 pt-2 text-[#666666] text-center">
    <span className="flex items-center gap-1 font-label-sm text-label-sm font-medium"><span className="material-symbols-outlined text-[14px] text-[#10B981]">{"assignment"}</span>{" Thỏa thuận minh bạch"}</span>
    <span className="text-[#E9E9E7]">{"•"}</span>
    <span className="flex items-center gap-1 font-label-sm text-label-sm font-medium"><span className="material-symbols-outlined text-[14px] text-[#10B981]">{"security"}</span>{" Bảo mật thông tin"}</span>
    </div>
    </div>

    <div className="rounded-2xl bg-[#F7F7F5] border border-[#E9E9E7] p-5">
    <h4 className="font-label-lg text-label-lg text-[#292929] font-bold mb-4 flex items-center gap-1.5">
    <span className="material-symbols-outlined text-[#FC6C26] text-[18px]">{"timeline"}</span>
    <span>{"Tiến trình xử lý đơn thuê"}</span>
    </h4>
    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E9E9E7]">
    <div className="relative">
    <span className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center">
    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FC6C26]"></span>
    </span>
    <div className="flex flex-col">
    <span className="font-label-md text-label-md text-[#FC6C26] font-bold">{"1. Gửi yêu cầu"}</span>
    <span className="font-body-sm text-body-sm text-[#292929] font-medium">{"Gửi thông tin chuyến đi đến chủ xe (Hiện tại)"}</span>
    </div>
    </div>
    <div className="relative">
    <span className="absolute -left-6 top-1 inline-flex rounded-full h-2.5 w-2.5 bg-[#CCCCCC]"></span>
    <div className="flex flex-col">
    <span className="font-label-md text-label-md text-[#666666] font-medium">{"2. Chủ xe xác nhận"}</span>
    <span className="font-body-sm text-body-sm text-[#666666]">{"Chủ xe phản hồi duyệt lịch hẹn"}</span>
    </div>
    </div>
    <div className="relative">
    <span className="absolute -left-6 top-1 inline-flex rounded-full h-2.5 w-2.5 bg-[#CCCCCC]"></span>
    <div className="flex flex-col">
    <span className="font-label-md text-label-md text-[#666666] font-medium">{"3. Thanh toán"}</span>
    <span className="font-body-sm text-body-sm text-[#666666]">{"Thanh toán tiền thuê sau khi được duyệt"}</span>
    </div>
    </div>
    <div className="relative">
    <span className="absolute -left-6 top-1 inline-flex rounded-full h-2.5 w-2.5 bg-[#CCCCCC]"></span>
    <div className="flex flex-col">
    <span className="font-label-md text-label-md text-[#666666] font-medium">{"4. Nhận xe"}</span>
    <span className="font-body-sm text-body-sm text-[#666666]">{"Ký biên bản & nhận chìa khóa tại điểm hẹn"}</span>
    </div>
    </div>
    </div>
    </div>
    </aside>
    </div>
    </div>
    </div>

    <div className="hidden"></div>
    </div>
    </main>
    </div>);
}
