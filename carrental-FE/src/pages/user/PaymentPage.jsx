import { Link } from "react-router";
import { PaymentActions } from "@/components/PaymentActions.jsx";
export default function PaymentPage() {
    return (<div className="cardb-screen screen-payment bg-surface-bg font-sans text-charcoal antialiased"><main className="w-full  bg-surface-bg min-h-[calc(100vh-140px)] pt-20"><div className="flex flex-col w-full">

    <div className="hidden"></div>

    <div className="w-full max-w-[1360px] mx-auto px-6 py-8">

    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-light mb-6">
    <div className="flex flex-col gap-1.5">
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-muted-gray">
    <Link className="hover:text-primary transition-colors" to="/tai-khoan/don-thue">{"Chuyến xe của tôi"}</Link>
    <span className="text-muted-gray/50">{"/"}</span>
    <Link className="hover:text-primary transition-colors" to="/xe/vinfast-vf8-plus-2024">{"Chi tiết đơn thuê"}</Link>
    <span className="text-muted-gray/50">{"/"}</span>
    <span className="text-primary font-semibold">{"Thanh toán"}</span>
    </nav>
    <div className="flex items-baseline gap-3 mt-1">
    <h1 className="text-[28px] font-bold text-charcoal tracking-tight">{"Thanh toán tiền thuê xe"}</h1>
    </div>
    <p className="text-sm text-muted-gray">{"\n          Kiểm tra thông tin đơn thuê và chọn phương thức thanh toán phù hợp.\n        "}</p>
    </div>

    <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-success-green text-xs font-semibold">
    <span className="w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
    <span>{"Trạng thái đơn: Đã xác nhận"}</span>
    </div>
    <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
    <span className="material-symbols-outlined text-[15px]">{"hourglass_top"}</span>
    <span>{"Thanh toán đơn: Chưa thanh toán"}</span>
    </div>
    </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

    <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6">

    <div className="rounded-2xl bg-white border border-border-light p-6 shadow-sm relative">
    <div className="flex items-center justify-between pb-5 border-b border-border-light mb-5">
    <div className="flex items-center gap-2.5">
    <span className="material-symbols-outlined text-primary text-[22px]">{"receipt_long"}</span>
    <h2 className="text-lg font-bold text-charcoal">{"Thông tin đơn thuê"}</h2>
    </div>
    <Link className="flex items-center gap-1 text-xs font-medium text-muted-gray hover:text-primary transition-colors" to="/xe/vinfast-vf8-plus-2024">
    <span>{"Xem chi tiết đơn thuê ↗"}</span>
    </Link>
    </div>

    <div className="flex flex-col sm:flex-row gap-5 p-4 rounded-xl bg-surface-bg border border-border-light mb-5">
    <div className="w-full sm:w-44 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-border-light relative">
    <img alt="VinFast VF 9 Plus AWD" className="w-full h-full object-cover" src="/images/cardb-0845f5702a0623be.webp" loading="lazy" decoding="async"/>
    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/95 text-charcoal text-[10px] font-bold border border-border-light shadow-xs">{"\n                AWD 402 HP\n              "}</span>
    </div>
    <div className="flex flex-col justify-between flex-grow min-w-0">
    <div className="flex flex-col">
    <div className="flex items-center gap-2 flex-wrap mb-1.5">
    <h3 className="text-base font-bold text-charcoal truncate">{"VinFast VF 9 Plus AWD"}</h3>
    <span className="px-2.5 py-0.5 rounded-full bg-pill-bg text-charcoal text-[11px] font-semibold tracking-wider uppercase border border-border-light">{"\n                    EV LUXURY • 7 CHỖ\n                  "}</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-muted-gray">
    <span>{"Mã đơn hàng:"}</span>
    <span className="font-mono text-charcoal font-semibold bg-pill-bg border border-border-light px-2 py-0.5 rounded" id="order-code">{"CDB-ORD-20261026-904"}</span>
    <button className="text-primary hover:text-primary-hover transition-colors" title="Sao chép mã" type="button" aria-label="Sao chép mã" data-action="copy" data-handler="copyOrderCode" data-args="">
    <span className="material-symbols-outlined text-[16px]">{"content_copy"}</span>
    </button>
    </div>
    </div>
    <div className="flex items-center gap-4 pt-3 border-t border-border-light mt-2 text-xs font-medium text-charcoal">
    <div className="flex items-center gap-1.5">
    <span className="material-symbols-outlined text-[16px] text-primary">{"airline_seat_recline_extra"}</span>
    <span>{"7 Ghế cơ trưởng"}</span>
    </div>
    <div className="flex items-center gap-1.5">
    <span className="material-symbols-outlined text-[16px] text-primary">{"ev_station"}</span>
    <span>{"Pin 123 kWh (626km)"}</span>
    </div>
    </div>
    </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="p-4 rounded-xl bg-surface-bg border border-border-light flex flex-col gap-2">
    <span className="text-xs font-bold text-charcoal flex items-center gap-1.5 uppercase tracking-wider">
    <span className="material-symbols-outlined text-[17px] text-primary">{"calendar_today"}</span>{"\n                Thời gian giao & nhận xe\n              "}</span>
    <div className="mt-1 flex flex-col gap-1.5 text-xs">
    <div className="flex items-baseline justify-between">
    <span className="text-muted-gray">{"Nhận xe:"}</span>
    <span className="font-bold text-charcoal">{"08:00, T7, 26/10/2026"}</span>
    </div>
    <div className="flex items-baseline justify-between">
    <span className="text-muted-gray">{"Trả xe:"}</span>
    <span className="font-bold text-charcoal">{"08:00, T2, 28/10/2026"}</span>
    </div>
    <div className="text-xs font-semibold text-primary pt-1.5 border-t border-border-light flex items-center gap-1">
    <span className="material-symbols-outlined text-[14px]">{"timelapse"}</span>
    <span>{"Thời lượng: 2 ngày trọn gói (48 giờ)"}</span>
    </div>
    </div>
    </div>
    <div className="p-4 rounded-xl bg-surface-bg border border-border-light flex flex-col gap-2">
    <span className="text-xs font-bold text-charcoal flex items-center gap-1.5 uppercase tracking-wider">
    <span className="material-symbols-outlined text-[17px] text-primary">{"location_on"}</span>{"\n                Địa điểm & Nhân sự\n              "}</span>
    <div className="mt-1 flex flex-col gap-1.5 text-xs">
    <div className="flex items-start gap-1">
    <span className="text-muted-gray whitespace-nowrap">{"Địa chỉ:"}</span>
    <span className="font-medium text-charcoal text-right flex-grow">{"128 Thảo Điền, P. Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh"}</span>
    </div>
    <div className="flex items-center justify-between pt-1 border-t border-border-light">
    <span className="text-muted-gray">{"Chủ xe:"}</span>
    <span className="font-bold text-charcoal">{"Trần Đức Nam (5★)"}</span>
    </div>
    <div className="flex items-center justify-between">
    <span className="text-muted-gray">{"Khách thuê:"}</span>
    <span className="font-bold text-charcoal">{"Nguyễn Hoàng Minh"}</span>
    </div>
    </div>
    </div>
    </div>
    </div>

    <div className="rounded-2xl bg-white border border-border-light p-6 shadow-sm flex flex-col gap-4">
    <div className="flex items-center gap-2 pb-3 border-b border-border-light">
    <span className="material-symbols-outlined text-primary text-[22px]">{"tune"}</span>
    <h2 className="text-base font-bold text-charcoal">{"Chi tiết giao dịch thanh toán"}</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="p-3 bg-surface-bg rounded-xl border border-border-light flex flex-col gap-0.5">
    <span className="text-[11px] font-semibold text-muted-gray uppercase">{"Mã đơn thuê"}</span>
    <span className="text-xs font-mono font-bold text-charcoal">{"CDB-ORD-20261026-904"}</span>
    </div>
    <div className="p-3 bg-surface-bg rounded-xl border border-border-light flex flex-col gap-0.5">
    <span className="text-[11px] font-semibold text-muted-gray uppercase">{"Khoản thanh toán"}</span>
    <span className="text-xs font-semibold text-charcoal">{"Tiền thuê xe (2 ngày)"}</span>
    </div>
    <div className="p-3 bg-surface-bg rounded-xl border border-border-light flex flex-col gap-0.5">
    <span className="text-[11px] font-semibold text-muted-gray uppercase">{"Mã giao dịch"}</span>
    <span className="text-xs font-medium text-muted-gray">{"Chưa có (Chờ khởi tạo)"}</span>
    </div>
    <div className="p-3 bg-surface-bg rounded-xl border border-border-light flex flex-col gap-0.5">
    <span className="text-[11px] font-semibold text-muted-gray uppercase">{"Trạng thái giao dịch"}</span>
    <span className="text-xs font-medium text-amber-700 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>{"Chờ thanh toán"}</span>
    </div>
    </div>
    <div className="p-3 bg-surface-bg border border-border-light rounded-xl flex items-start gap-2.5 text-xs text-muted-gray">
    <span className="material-symbols-outlined text-[17px] text-primary flex-shrink-0 mt-0.5">{"info"}</span>
    <p className="leading-relaxed">{"Trạng thái thanh toán của đơn thuê sẽ được hệ thống cập nhật tức thì sau khi đối tác ngân hàng/cổng thanh toán phản hồi thành công."}</p>
    </div>
    </div>

    <div className="rounded-2xl bg-white border border-border-light p-5 shadow-sm">
    <label className="flex items-start gap-3 cursor-pointer select-none">
    <input className="mt-0.5 w-4 h-4 rounded border-border-light text-primary focus:ring-primary accent-primary cursor-pointer" id="terms-agree" type="checkbox" defaultChecked={true}/>
    <span className="text-xs text-charcoal leading-relaxed">{"Tôi đã kiểm tra kỹ thông tin lịch trình, địa điểm nhận xe và đồng ý thực hiện thanh toán số tiền thuê xe hiển thị theo chính sách CarDB."}</span>
    </label>
    </div>
    </div>

    <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6">

    <div className="rounded-2xl bg-white border border-border-light p-6 shadow-sm flex flex-col gap-5">
    <div className="flex items-center justify-between pb-4 border-b border-border-light">
    <div className="flex flex-col">
    <h2 className="text-lg font-bold text-charcoal">{"Phương thức thanh toán"}</h2>
    <p className="text-xs text-muted-gray mt-0.5">{"Chọn kênh thanh toán thuận tiện nhất"}</p>
    </div>
    <div className="text-right">
    <span className="text-[11px] text-muted-gray font-medium block">{"Tổng tiền:"}</span>
    <span className="ui-money text-xl font-bold text-primary">{"3.700.000 đ"}</span>
    </div>
    </div>

    <div className="flex flex-col gap-3" id="payment-methods">

    <div className="p-4 rounded-xl border-2 border-primary bg-surface-accent-faint transition-all cursor-pointer" data-handler="selectPaymentMethod" data-args="'qr'">
    <div className="flex items-start justify-between gap-3">
    <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
    <span className="material-symbols-outlined text-[22px]">{"qr_code_scanner"}</span>
    </div>
    <div className="flex flex-col">
    <div className="flex items-center gap-2">
    <span className="text-sm font-bold text-charcoal">{"Chuyển khoản QR Code (VNPAY / VietQR)"}</span>
    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary uppercase">{"Khuyên dùng"}</span>
    </div>
    <span className="text-xs text-muted-gray">{"Quét mã bằng app ngân hàng bất kỳ, xác nhận tức thì 24/7"}</span>
    </div>
    </div>
    <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
    <span className="material-symbols-outlined text-[14px] font-bold">{"check"}</span>
    </div>
    </div>

    <div className="mt-4 pt-4 border-t border-primary/20 flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-primary/20">

    <div className="w-36 h-36 bg-white border border-border-light rounded-xl p-2 flex flex-col items-center justify-center shadow-xs flex-shrink-0">
    <div className="w-full h-full bg-surface-bg rounded border border-dashed border-border-light flex flex-col items-center justify-center relative overflow-hidden">

    <div className="grid grid-cols-6 gap-1 w-24 h-24 p-1">
    <div className="bg-charcoal col-span-2 row-span-2 rounded-xs"></div>
    <div className="bg-charcoal"></div>
    <div className="bg-charcoal"></div>
    <div className="bg-charcoal col-span-2 row-span-2 rounded-xs"></div>
    <div className="bg-charcoal"></div>
    <div className="bg-primary"></div>
    <div className="bg-charcoal"></div>
    <div className="bg-charcoal"></div>
    <div className="bg-charcoal"></div>
    <div className="bg-charcoal"></div>
    <div className="bg-primary"></div>
    <div className="bg-charcoal col-span-2 row-span-2 rounded-xs"></div>
    <div className="bg-charcoal"></div>
    <div className="bg-charcoal"></div>
    <div className="bg-charcoal"></div>
    <div className="bg-charcoal"></div>
    </div>
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <span className="px-1.5 py-0.5 rounded bg-white text-[9px] font-bold text-primary border border-primary/30 shadow-xs">{"VietQR"}</span>
    </div>
    </div>
    </div>

    <div className="flex flex-col gap-1.5 text-xs flex-grow w-full">
    <div className="flex items-center justify-between pb-1 border-b border-border-light">
    <span className="text-muted-gray">{"Ngân hàng:"}</span>
    <span className="font-bold text-charcoal">{"Vietcombank (VCB)"}</span>
    </div>
    <div className="flex items-center justify-between pb-1 border-b border-border-light">
    <span className="text-muted-gray">{"Chủ tài khoản:"}</span>
    <span className="font-bold text-charcoal uppercase">{"CARDB VIETNAM JSC"}</span>
    </div>
    <div className="flex items-center justify-between pb-1 border-b border-border-light">
    <span className="text-muted-gray">{"Số tài khoản:"}</span>
    <div className="flex items-center gap-1.5">
    <span className="font-mono font-bold text-charcoal">{"0071000989982"}</span>
    <button className="text-primary hover:text-primary-hover" title="Sao chép STK" type="button" aria-label="Sao chép STK" data-action="copy" data-handler="navigator.clipboard.writeText" data-args="'0071000989982'"><span className="material-symbols-outlined text-[14px]">{"content_copy"}</span></button>
    </div>
    </div>
    <div className="flex items-center justify-between pb-1 border-b border-border-light">
    <span className="text-muted-gray">{"Số tiền:"}</span>
    <span className="ui-money font-bold text-primary">{"3.700.000 đ"}</span>
    </div>
    <div className="flex items-center justify-between">
    <span className="text-muted-gray">{"Nội dung CK:"}</span>
    <div className="flex items-center gap-1.5">
    <span className="font-mono font-bold text-charcoal bg-pill-bg px-1.5 py-0.5 rounded">{"CDB-ORD-20261026-904"}</span>
    <button className="text-primary hover:text-primary-hover" title="Sao chép" type="button" aria-label="Sao chép" data-action="copy" data-handler="navigator.clipboard.writeText" data-args="'CDB-ORD-20261026-904'"><span className="material-symbols-outlined text-[14px]">{"content_copy"}</span></button>
    </div>
    </div>
    </div>
    </div>
    </div>

    <div className="p-4 rounded-xl border border-border-light bg-surface-bg hover:border-muted-gray/40 transition-all cursor-pointer flex items-center justify-between" data-handler="selectPaymentMethod" data-args="'napas'">
    <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-white border border-border-light text-charcoal flex items-center justify-center font-bold flex-shrink-0">
    <span className="material-symbols-outlined text-[22px] text-muted-gray">{"credit_card"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-sm font-bold text-charcoal">{"Thẻ ATM / Thẻ nội địa (NAPAS)"}</span>
    <span className="text-xs text-muted-gray">{"Hỗ trợ hơn 42 ngân hàng Việt Nam phát hành"}</span>
    </div>
    </div>
    <div className="flex items-center gap-2">
    <span className="px-2 py-0.5 rounded bg-white border border-border-light text-[10px] font-bold text-muted-gray font-mono">{"NAPAS"}</span>
    <div className="w-4 h-4 rounded-full border border-border-light bg-white"></div>
    </div>
    </div>

    <div className="p-4 rounded-xl border border-border-light bg-surface-bg hover:border-muted-gray/40 transition-all cursor-pointer flex items-center justify-between" data-handler="selectPaymentMethod" data-args="'card'">
    <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-white border border-border-light text-charcoal flex items-center justify-center font-bold flex-shrink-0">
    <span className="material-symbols-outlined text-[22px] text-muted-gray">{"credit_card_heart"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-sm font-bold text-charcoal">{"Thẻ quốc tế (Visa / Mastercard / JCB)"}</span>
    <span className="text-xs text-muted-gray">{"Bảo mật xác thực 3D-Secure 2.0 toàn cầu"}</span>
    </div>
    </div>
    <div className="flex items-center gap-1.5">
    <span className="px-1.5 py-0.5 rounded bg-white border border-border-light text-[10px] font-bold text-info-blue font-mono">{"VISA"}</span>
    <span className="px-1.5 py-0.5 rounded bg-white border border-border-light text-[10px] font-bold text-amber-600 font-mono">{"MC"}</span>
    <div className="w-4 h-4 rounded-full border border-border-light bg-white"></div>
    </div>
    </div>

    <div className="p-4 rounded-xl border border-border-light bg-surface-bg hover:border-muted-gray/40 transition-all cursor-pointer flex items-center justify-between" data-handler="selectPaymentMethod" data-args="'wallet'">
    <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-white border border-border-light text-charcoal flex items-center justify-center font-bold flex-shrink-0">
    <span className="material-symbols-outlined text-[22px] text-muted-gray">{"account_balance_wallet"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-sm font-bold text-charcoal">{"Ví điện tử (MoMo / ZaloPay / VNPay)"}</span>
    <span className="text-xs text-muted-gray">{"Liên kết thanh toán một chạm"}</span>
    </div>
    </div>
    <div className="flex items-center gap-1.5">
    <span className="px-1.5 py-0.5 rounded bg-white border border-border-light text-[10px] font-bold text-pink-600 font-mono">{"MoMo"}</span>
    <div className="w-4 h-4 rounded-full border border-border-light bg-white"></div>
    </div>
    </div>
    </div>

    <div className="mt-2 p-5 rounded-xl bg-surface-bg border border-border-light flex flex-col gap-3">
    <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">{"Tóm tắt chi phí thanh toán"}</h3>
    <div className="flex justify-between items-center text-xs text-muted-gray">
    <span>{"Tiền thuê trước ưu đãi (2 ngày):"}</span>
    <span className="ui-money font-semibold text-charcoal">{"3.900.000 đ"}</span>
    </div>
    <div className="flex justify-between items-center text-xs text-success-green font-medium">
    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">{"sell"}</span>{"Mã ưu đãi (CARDBWELCOME):"}</span>
    <span className="ui-money font-bold">{"-200.000 đ"}</span>
    </div>
    <div className="flex justify-between items-center text-xs text-muted-gray">
    <span>{"Phí dịch vụ CarDB Concierge:"}</span>
    <span className="font-semibold text-emerald-600">{"Miễn phí (Ưu đãi)"}</span>
    </div>
    <div className="pt-3 border-t border-border-light flex items-baseline justify-between">
    <div>
    <span className="text-xs font-bold text-charcoal uppercase block">{"Tổng thanh toán ngay:"}</span>
    <span className="text-[11px] text-muted-gray">{"Đã bao gồm VAT & bảo hiểm vật chất"}</span>
    </div>
    <span className="ui-money text-2xl font-bold text-primary">{"3.700.000 đ"}</span>
    </div>

    <div className="mt-2 p-3 rounded-lg bg-white border border-border-light flex items-start gap-2 text-xs text-muted-gray">
    <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0 mt-0.5">{"lock_reset"}</span>
    <p className="leading-relaxed"><strong className="text-charcoal font-semibold">{"Lưu ý cọc thế chấp:"}</strong>{" Khoản tiền cọc 15.000.000 đ sẽ được xử lý riêng theo thỏa thuận khi nhận xe thực tế tại bãi, không thu trong giao dịch thanh toán tiền thuê này."}</p>
    </div>
    </div>

    <div className="p-3.5 rounded-xl bg-surface-bg border border-border-light flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-success-green flex items-center justify-center flex-shrink-0 border border-emerald-200">
    <span className="material-symbols-outlined text-[18px]">{"verified_user"}</span>
    </div>
    <p className="text-xs text-muted-gray leading-normal">{"\n          Mọi giao dịch thanh toán đều được mã hóa bảo mật 256-bit SSL chuẩn PCI-DSS Level 1.\n        "}</p>
    </div>

    <PaymentActions />

    <div className="flex items-center justify-between text-xs font-medium text-muted-gray pt-1">
    <Link className="flex items-center gap-1 hover:text-charcoal transition-colors" to="/tai-khoan/don-thue">
    <span className="material-symbols-outlined text-[15px]">{"arrow_back"}</span>
    <span>{"Quay lại chi tiết đơn thuê"}</span>
    </Link>
    <Link className="hover:text-primary transition-colors" to="/tai-khoan/don-thue">{"Chuyến xe của tôi"}</Link>
    </div>
    </div>

    <div className="rounded-xl p-4 bg-white border border-border-light flex items-center justify-between shadow-xs">
    <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
    <span className="material-symbols-outlined text-[20px]">{"headset_mic"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-xs font-bold text-charcoal">{"Cần trợ giúp thanh toán?"}</span>
    <span className="text-xs text-muted-gray">{"Hotline "}<strong className="text-primary font-bold">{"1900 8899"}</strong>{" phục vụ 24/7"}</span>
    </div>
    </div>
    <a className="px-3.5 py-1.5 rounded-lg bg-surface-bg border border-border-light hover:border-primary text-primary font-semibold text-xs transition-colors" href="tel:19008899">{"\n        Gọi ngay\n      "}</a>
    </div>
    </div>
    </div>
    </div>

    </div></main></div>);
}
