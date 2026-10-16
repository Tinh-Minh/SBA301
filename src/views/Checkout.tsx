import Link from "next/link";
import { PaymentActions } from "@/components/payment-actions";

export default function Checkout() {
  return (
<main className="w-full pt-20 bg-surface"><div className="flex flex-col w-full">



<div className="fixed bottom-6 right-6 z-50 transition-opacity duration-300 opacity-0 pointer-events-none bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-full shadow-2xl flex items-center gap-space-xs font-label-md text-label-md" id="copy-toast">
<span className="material-symbols-outlined text-secondary-fixed text-[18px]">{"check_circle"}</span>
<span>{"Đã sao chép nội dung vào khay nhớ tạm!"}</span>
</div>

<section className="w-full bg-surface-container-low py-space-md">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="flex flex-col md:flex-row items-center justify-between gap-space-md">

<div className="flex items-center gap-space-xs text-text-muted font-label-md text-label-md">
<span className="material-symbols-outlined text-primary text-[20px]">{"shield_person"}</span>
<span className="text-on-surface font-semibold">{"Mã đơn: #KNW-8932VF"}</span>
<span className="text-outline-variant">{"•"}</span>
<span>{"Bảo mật giao dịch đa tầng PCI-DSS"}</span>
</div>

<div className="flex items-center gap-space-sm w-full md:w-auto justify-between md:justify-end">

<div className="flex items-center gap-space-xs opacity-75">
<div className="w-7 h-7 rounded-full bg-surface-container-highest text-primary flex items-center justify-center font-label-md text-label-md font-bold">
<span className="material-symbols-outlined text-[16px]">{"check"}</span>
</div>
<span className="font-label-md text-label-md text-on-surface-variant hidden sm:inline">{"1. Chọn xe"}</span>
</div>
<div className="w-8 sm:w-12 h-0.5 bg-secondary/30"></div>

<div className="flex items-center gap-space-xs opacity-75">
<div className="w-7 h-7 rounded-full bg-surface-container-highest text-primary flex items-center justify-center font-label-md text-label-md font-bold">
<span className="material-symbols-outlined text-[16px]">{"check"}</span>
</div>
<span className="font-label-md text-label-md text-on-surface-variant hidden sm:inline">{"2. Hồ sơ lái xe"}</span>
</div>
<div className="w-8 sm:w-12 h-0.5 bg-primary"></div>

<div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-1.5 rounded-full shadow-sm">
<div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">{"\n              3\n            "}</div>
<span className="font-label-md text-label-md text-primary font-bold">{"3. Đặt cọc & Xác nhận"}</span>
</div>
</div>
</div>
</div>
</section>

<div className="w-full py-space-xl">
<div className="max-w-[1240px] mx-auto px-margin">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

<div className="lg:col-span-7 flex flex-col gap-space-xl">

<section className="flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div>
<span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">{"Bước 3.1"}</span>
<h2 className="font-headline-md text-headline-md text-on-surface mt-0.5">{"Chọn hạn mức thanh toán"}</h2>
</div>
<span className="inline-flex items-center gap-1 bg-surface-tint text-primary px-3 py-1 rounded-full font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px] text-status-success">{"verified"}</span>{"\n                Khuyên dùng\n              "}</span>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">

<div className="cursor-pointer bg-surface-tint p-space-lg rounded-xl shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between" id="card-opt-30" data-handler="window.kanowBooking.setMode" data-args="'deposit30'">
<div className="flex items-start justify-between mb-space-sm">
<div className="flex items-center gap-space-xs">
<input className="w-4 h-4 accent-primary cursor-pointer" id="radio-opt-30" name="deposit-choice" type="radio" defaultChecked={true} aria-label="deposit-choice" />
<label className="font-headline-sm text-headline-sm text-on-surface cursor-pointer" htmlFor="radio-opt-30">{"Đặt cọc 30%"}</label>
</div>
<span className="bg-primary text-on-primary font-label-md text-[11px] px-2 py-0.5 rounded-full font-bold">{"GIỮ XE 100%"}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">{"\n                  Chỉ cần thanh toán trước 30% để khóa xe trên hệ thống. 70% còn lại thanh toán khi nhận bàn giao xe.\n                "}</p>
<div className="flex items-baseline justify-between pt-space-xs">
<span className="font-label-md text-label-md text-text-muted">{"Cần trả ngay:"}</span>
<span className="font-price-display text-price-display text-primary">{"1.142.478₫"}</span>
</div>
</div>

<div className="cursor-pointer bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between" id="card-opt-100" data-handler="window.kanowBooking.setMode" data-args="'full100'">
<div className="flex items-start justify-between mb-space-sm">
<div className="flex items-center gap-space-xs">
<input className="w-4 h-4 accent-primary cursor-pointer" id="radio-opt-100" name="deposit-choice" type="radio" aria-label="deposit-choice" />
<label className="font-headline-sm text-headline-sm text-on-surface cursor-pointer" htmlFor="radio-opt-100">{"Toàn bộ 100%"}</label>
</div>
<span className="bg-tertiary-container text-on-tertiary font-label-md text-[11px] px-2 py-0.5 rounded-full font-bold">{"GIẢM 50K"}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">{"\n                  Thanh toán trọn gói toàn bộ hành trình trước khi nhận xe, nhận ngay chiết khấu trực tiếp 50.000₫.\n                "}</p>
<div className="flex items-baseline justify-between pt-space-xs">
<span className="font-label-md text-label-md text-text-muted">{"Cần trả ngay:"}</span>
<span className="font-price-display text-price-display text-tertiary-container">{"3.758.260₫"}</span>
</div>
</div>
</div>
</section>

<section className="flex flex-col gap-space-md">
<div>
<span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">{"Bước 3.2"}</span>
<h2 className="font-headline-md text-headline-md text-on-surface mt-0.5">{"Phương thức thanh toán"}</h2>
<p className="font-body-sm text-body-sm text-text-muted">{"Giao dịch được mã hóa và xác thực tự động trong 30 giây."}</p>
</div>

<div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs p-1.5 bg-surface-container-low rounded-xl">

<button className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-container-high shadow-md transition-all duration-150 text-center" id="method-card-vietqr" type="button" data-handler="window.kanowBooking.setMethod" data-args="'vietqr'">
<span className="material-symbols-outlined text-primary text-[24px] mb-1">{"qr_code_scanner"}</span>
<span className="font-label-md text-label-md text-on-surface font-semibold">{"VietQR Tức thì"}</span>
<span className="font-body-sm text-[10px] text-status-success font-medium">{"Khuyên dùng"}</span>
</button>

<button className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-container-lowest hover:bg-surface-container-high transition-all duration-150 text-center" id="method-card-atm" type="button" data-handler="window.kanowBooking.setMethod" data-args="'atm'">
<span className="material-symbols-outlined text-on-surface-variant text-[24px] mb-1">{"account_balance"}</span>
<span className="font-label-md text-label-md text-on-surface font-semibold">{"ATM / Napas"}</span>
<span className="font-body-sm text-[10px] text-text-muted">{"Internet Banking"}</span>
</button>

<button className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-container-lowest hover:bg-surface-container-high transition-all duration-150 text-center" id="method-card-card" type="button" data-handler="window.kanowBooking.setMethod" data-args="'card'">
<span className="material-symbols-outlined text-on-surface-variant text-[24px] mb-1">{"credit_card"}</span>
<span className="font-label-md text-label-md text-on-surface font-semibold">{"Thẻ Quốc Tế"}</span>
<span className="font-body-sm text-[10px] text-text-muted">{"Visa, Master, JCB"}</span>
</button>

<button className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-container-lowest hover:bg-surface-container-high transition-all duration-150 text-center" id="method-card-wallet" type="button" data-handler="window.kanowBooking.setMethod" data-args="'wallet'">
<span className="material-symbols-outlined text-on-surface-variant text-[24px] mb-1">{"wallet"}</span>
<span className="font-label-md text-label-md text-on-surface font-semibold">{"Ví Điện Tử"}</span>
<span className="font-body-sm text-[10px] text-text-muted">{"MoMo / ZaloPay"}</span>
</button>
</div>


<div className="rounded-xl bg-surface-tint p-6 text-primary leading-relaxed" id="method-details-vietqr">{"Bản xem trước giao diện thanh toán. Chưa kết nối ngân hàng; không chuyển tiền."}</div>

<div className="hidden bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md" id="method-details-atm">
<p className="font-body-md text-body-md text-on-surface-variant">{"Chọn cổng thanh toán Ngân hàng nội địa (Napas 247):"}</p>
<div className="grid grid-cols-3 sm:grid-cols-4 gap-space-sm">
<div className="p-space-sm rounded-lg bg-surface-container-low text-center font-label-md text-label-md text-on-surface font-bold hover:bg-surface-tint cursor-pointer transition-colors">{"Vietcombank"}</div>
<div className="p-space-sm rounded-lg bg-surface-container-low text-center font-label-md text-label-md text-on-surface font-bold hover:bg-surface-tint cursor-pointer transition-colors">{"Techcombank"}</div>
<div className="p-space-sm rounded-lg bg-surface-container-low text-center font-label-md text-label-md text-on-surface font-bold hover:bg-surface-tint cursor-pointer transition-colors">{"BIDV"}</div>
<div className="p-space-sm rounded-lg bg-surface-container-low text-center font-label-md text-label-md text-on-surface font-bold hover:bg-surface-tint cursor-pointer transition-colors">{"VietinBank"}</div>
<div className="p-space-sm rounded-lg bg-surface-container-low text-center font-label-md text-label-md text-on-surface font-bold hover:bg-surface-tint cursor-pointer transition-colors">{"ACB"}</div>
<div className="p-space-sm rounded-lg bg-surface-container-low text-center font-label-md text-label-md text-on-surface font-bold hover:bg-surface-tint cursor-pointer transition-colors">{"VPBank"}</div>
<div className="p-space-sm rounded-lg bg-surface-container-low text-center font-label-md text-label-md text-on-surface font-bold hover:bg-surface-tint cursor-pointer transition-colors">{"TPBank"}</div>
<div className="p-space-sm rounded-lg bg-surface-container-low text-center font-label-md text-label-md text-on-surface font-bold hover:bg-surface-tint cursor-pointer transition-colors">{"Khác (+32)"}</div>
</div>
</div>

<div className="hidden bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md" id="method-details-card">
<div className="flex flex-col gap-space-xs">
<label className="font-label-md text-label-md text-on-surface font-semibold">{"Số thẻ tín dụng / Ghi nợ quốc tế"}</label>
<div className="flex items-center bg-surface-container-low px-space-md py-2.5 rounded-lg">
<span className="material-symbols-outlined text-outline text-[20px] mr-2">{"credit_card"}</span>
<input className="bg-transparent w-full text-on-surface font-mono outline-none text-body-md placeholder:text-outline-variant" placeholder="4111 2222 3333 4444" type="text" aria-label="4111 2222 3333 4444" />
</div>
</div>
<div className="grid grid-cols-2 gap-space-md">
<div className="flex flex-col gap-space-xs">
<label className="font-label-md text-label-md text-on-surface font-semibold">{"Hết hạn (MM/YY)"}</label>
<input className="bg-surface-container-low px-space-md py-2.5 rounded-lg text-on-surface font-mono outline-none text-body-md placeholder:text-outline-variant" placeholder="12/28" type="text" aria-label="12/28" />
</div>
<div className="flex flex-col gap-space-xs">
<label className="font-label-md text-label-md text-on-surface font-semibold">{"Mã bảo mật CVV"}</label>
<input className="bg-surface-container-low px-space-md py-2.5 rounded-lg text-on-surface font-mono outline-none text-body-md placeholder:text-outline-variant" maxLength={4} placeholder="•••" type="password" aria-label="•••" />
</div>
</div>
</div>

<div className="hidden bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md" id="method-details-wallet">
<div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
<div className="flex items-center gap-space-sm p-space-md bg-surface-container-low rounded-lg cursor-pointer hover:bg-surface-tint">
<div className="w-8 h-8 rounded-full bg-[#A50064] text-white flex items-center justify-center font-bold text-[11px]">{"MoMo"}</div>
<span className="font-label-md text-label-md text-on-surface font-semibold">{"Ví MoMo"}</span>
</div>
<div className="flex items-center gap-space-sm p-space-md bg-surface-container-low rounded-lg cursor-pointer hover:bg-surface-tint">
<div className="w-8 h-8 rounded-full bg-[#0068FF] text-white flex items-center justify-center font-bold text-[10px]">{"Zalo"}</div>
<span className="font-label-md text-label-md text-on-surface font-semibold">{"ZaloPay"}</span>
</div>
<div className="flex items-center gap-space-sm p-space-md bg-surface-container-low rounded-lg cursor-pointer hover:bg-surface-tint">
<div className="w-8 h-8 rounded-full bg-[#ED1C24] text-white flex items-center justify-center font-bold text-[10px]">{"VNPay"}</div>
<span className="font-label-md text-label-md text-on-surface font-semibold">{"VNPay-QR"}</span>
</div>
</div>
</div>
</section>

<section className="flex flex-col gap-space-md">
<div>
<span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">{"Bước 3.3"}</span>
<h2 className="font-headline-md text-headline-md text-on-surface mt-0.5">{"Chính sách thế chấp & nhận xe"}</h2>
<p className="font-body-sm text-body-sm text-text-muted">{"Chọn phương án giữ xe thuận tiện nhất cho bạn khi nhận xe thực tế."}</p>
</div>
<div className="flex flex-col gap-space-sm">

<div className="cursor-pointer bg-surface-tint p-space-md rounded-xl shadow-md transition-all flex items-start gap-space-md" id="mortgage-card-a" data-handler="window.kanowBooking.setMortgage" data-args="'a'">
<input className="mt-1 accent-primary" id="mortgage-radio-a" name="mortgage-choice" type="radio" defaultChecked={true} aria-label="mortgage-choice" />
<div className="flex-1">
<div className="flex items-center justify-between flex-wrap gap-2">
<span className="font-headline-sm text-headline-sm text-on-surface">{"Phương án A: 0 VNĐ Tiền mặt"}</span>
<span className="bg-status-success/15 text-status-success px-2.5 py-0.5 rounded-full font-label-md text-label-md font-bold">{"Tiện lợi nhất"}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{"\n                    Để lại xe máy chính chủ (giá trị thị trường > 15 triệu) kèm bản gốc Cà vẹt xe máy khi nhận xe ô tô. Không cần phong tỏa tiền.\n                  "}</p>
</div>
</div>

<div className="cursor-pointer bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all flex items-start gap-space-md" id="mortgage-card-b" data-handler="window.kanowBooking.setMortgage" data-args="'b'">
<input className="mt-1 accent-primary" id="mortgage-radio-b" name="mortgage-choice" type="radio" aria-label="mortgage-choice" />
<div className="flex-1">
<div className="flex items-center justify-between flex-wrap gap-2">
<span className="font-headline-sm text-headline-sm text-on-surface">{"Phương án B: Đặt cọc / Phong tỏa 10.000.000₫"}</span>
<span className="font-label-md text-label-md text-text-muted">{"Thẻ tín dụng / CK"}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{"\n                    Phong tỏa qua thẻ tín dụng Visa/Master hoặc chuyển khoản tiền mặt. Hoàn trả 100% trong vòng 3-5 ngày sau khi hoàn tất bàn giao kiểm tra xe.\n                  "}</p>
</div>
</div>

<div className="cursor-pointer bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all flex items-start gap-space-md" id="mortgage-card-c" data-handler="window.kanowBooking.setMortgage" data-args="'c'">
<input className="mt-1 accent-primary" id="mortgage-radio-c" name="mortgage-choice" type="radio" aria-label="mortgage-choice" />
<div className="flex-1">
<div className="flex items-center justify-between flex-wrap gap-2">
<div className="flex items-center gap-space-xs">
<span className="font-headline-sm text-headline-sm text-on-surface">{"Phương án C: Hội viên VNeID Cấp 2"}</span>
<span className="material-symbols-outlined text-primary text-[18px]">{"verified"}</span>
</div>
<span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-label-md text-label-md font-bold">{"Ưu đãi độc quyền"}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{"\n                    Chỉ cần ký quỹ 5.000.000₫ dành cho thành viên đã xác thực danh tính điện tử Quốc gia qua cổng Kanow FastCheck.\n                  "}</p>
</div>
</div>
</div>
</section>

<div className="bg-surface-container-low p-space-lg rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-space-md">
<div className="flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary text-[22px]">{"event_busy"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface font-semibold">{"Hủy chuyến linh hoạt"}</div>
<div className="font-body-sm text-body-sm text-text-muted mt-0.5">{"Miễn phí hủy và hoàn cọc 100% trước giờ khởi hành 24 tiếng."}</div>
</div>
</div>
<div className="flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary text-[22px]">{"lock"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface font-semibold">{"Bảo mật chuẩn Quốc tế"}</div>
<div className="font-body-sm text-body-sm text-text-muted mt-0.5">{"Mã hóa 256-bit TLS, tuân thủ nghiêm ngặt tiêu chuẩn PCI-DSS Tier 1."}</div>
</div>
</div>
</div>
</div>

<aside className="lg:col-span-5 flex flex-col gap-space-lg sticky top-24">
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-lg flex flex-col gap-space-lg" data-vehicle-card="ev" data-vehicle-name="VinFast VF 8 Plus 2024" data-price="247500">

<div className="flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">{"Thông tin phương tiện"}</span>
<span className="bg-surface-tint text-primary px-2.5 py-0.5 rounded-full font-label-md text-label-md font-bold" id="summary-payment-ratio">{"\n                  Cọc 30% giữ xe\n                "}</span>
</div>
<div className="flex items-center gap-space-md bg-surface-container-low p-space-sm rounded-xl">

<div className="w-24 h-20 rounded-lg overflow-hidden shrink-0 relative">
<img className="w-full h-full object-cover" src="/images/aff3e94335a4d090.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
</div>

<div className="flex-1 min-w-0">
<h3 className="font-headline-sm text-headline-sm text-on-surface truncate">{"VinFast VF 8 Plus 2024"}</h3>
<div className="flex items-center gap-space-xs text-text-muted font-body-sm text-body-sm mt-0.5">
<span className="truncate">{"Điện • 5 chỗ ngồi"}</span>
<span>{"•"}</span>
<span className="font-mono text-primary font-semibold">{"51K-988.22"}</span>
</div>
<div className="inline-flex items-center gap-1 text-[11px] font-label-md text-primary mt-1">
<span className="w-2 h-2 rounded-full bg-secondary"></span>{"\n                    Màu Xanh Deep Ocean\n                  "}</div>
</div>
</div>
</div>

<div className="bg-surface-tint/60 p-space-md rounded-xl flex flex-col gap-space-sm">

<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[20px] mt-0.5">{"flight_land"}</span>
<div className="flex-1">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-primary font-bold">{"NHẬN XE"}</span>
<span className="font-label-md text-label-md text-on-surface font-mono font-semibold">{"08:00 - 28/03/2025"}</span>
</div>
<div className="font-body-sm text-body-sm text-on-surface-variant truncate">{"Sân bay Tân Sơn Nhất (Ga Quốc Nội T1)"}</div>
</div>
</div>
<div className="flex items-center gap-2 px-3">
<div className="h-4 w-px bg-outline-variant/60 ml-2"></div>
<span className="font-body-sm text-[11px] text-text-muted italic">{"Thời lượng: 2.5 ngày (60 giờ trọn vẹn)"}</span>
</div>

<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-tertiary-container text-[20px] mt-0.5">{"flight_takeoff"}</span>
<div className="flex-1">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-tertiary-container font-bold">{"TRẢ XE"}</span>
<span className="font-label-md text-label-md text-on-surface font-mono font-semibold">{"20:00 - 30/03/2025"}</span>
</div>
<div className="font-body-sm text-body-sm text-on-surface-variant truncate">{"Sân bay Tân Sơn Nhất (Ga Quốc Nội T1)"}</div>
</div>
</div>
</div>

<div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-sm rounded-lg">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-status-success text-[18px]">{"verified"}</span>
<span className="font-label-md text-label-md text-on-surface font-medium">{"Bảo hiểm thân vỏ toàn diện MIC"}</span>
</div>
<span className="font-label-md text-label-md text-primary font-bold">{"+247.500₫"}</span>
</div>

<div className="flex flex-col gap-space-xs">
<div className="font-label-md text-label-md text-on-surface font-semibold">{"Mã ưu đãi / Voucher"}</div>
<div className="flex items-center gap-space-xs">
<div className="flex-1 flex items-center bg-surface-container-low px-space-md py-2 rounded-lg">
<span className="material-symbols-outlined text-primary text-[18px] mr-2">{"sell"}</span>
<input className="bg-transparent font-mono font-bold text-primary text-label-lg uppercase outline-none w-full" readOnly={true} type="text" defaultValue="KANOWNEW" aria-label="Thông tin" />
<span className="bg-status-success/20 text-status-success text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{"Áp dụng -15%"}</span>
</div>
<button className="bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md px-space-md py-2 rounded-lg transition-colors" type="button">{"\n                  Thay đổi\n                "}</button>
</div>
</div>

<div className="flex flex-col gap-space-xs pt-space-xs">
<div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
<span>{"Đơn giá thuê xe (2.5 ngày)"}</span>
<span className="font-mono text-on-surface">{"3.900.000₫"}</span>
</div>
<div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
<span>{"Bảo hiểm vật chất xe (+99k/ngày)"}</span>
<span className="font-mono text-on-surface">{"247.500₫"}</span>
</div>
<div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
<span>{"Voucher KANOWNEW (-15% giá thuê)"}</span>
<span className="font-mono text-status-success font-semibold">{"-585.000₫"}</span>
</div>

<div className="hidden flex justify-between font-body-sm text-body-sm text-on-surface-variant" id="row-fullpay-discount">
<span className="text-tertiary-container font-medium">{"Ưu đãi thanh toán sớm 100%"}</span>
<span className="font-mono text-tertiary-container font-semibold">{"-50.000₫"}</span>
</div>
<div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
<span>{"Thuế giá trị gia tăng (VAT 8%)"}</span>
<span className="font-mono text-on-surface">{"245.760₫"}</span>
</div>
<div className="h-px bg-outline-variant/40 my-space-xs"></div>
<div className="flex justify-between items-baseline">
<span className="font-label-lg text-label-lg text-on-surface font-semibold">{"Tổng giá trị đơn xe:"}</span>
<span className="font-headline-sm text-headline-sm text-on-surface font-bold">{"3.808.260₫"}</span>
</div>

<div className="bg-surface-tint p-space-md rounded-xl flex items-center justify-between mt-space-xs">
<div>
<div className="font-label-md text-label-md text-primary font-bold uppercase">{"CẦN THANH TOÁN NGAY"}</div>
<div className="font-body-sm text-[11px] text-text-muted">{"70% còn lại thanh toán lúc nhận xe"}</div>
</div>
<div className="font-price-display text-price-display text-primary" id="val-deposit-due">{"\n                  1.142.478₫\n                "}</div>
</div>
</div>

<PaymentActions />

<div className="flex items-center justify-between pt-space-xs text-text-muted">
<div className="flex items-center gap-space-xs font-body-sm text-body-sm">
<span className="material-symbols-outlined text-tertiary-container text-[18px]">{"support_agent"}</span>
<span>{"Cần trợ giúp đặt xe khẩn cấp?"}</span>
</div>
<a className="font-label-md text-label-md text-primary font-bold hover:underline" href="tel:19008888">{"\n                1900 8888 (24/7)\n              "}</a>
</div>
</div>
</aside>
</div>
</div>
</div>
</div></main>
  );
}
