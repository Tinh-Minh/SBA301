import { ProfileLayout } from "@/layouts/ProfileLayout.jsx";
import { Link } from "react-router";
export default function BanksAlternativePage() {
    return (<div className="cardb-screen screen-banksalternative bg-background font-body-md text-body-md text-on-surface antialiased"><ProfileLayout active="banks" title="Tài khoản ngân hàng">



    <div className="flex items-center justify-between px-1">
    <div className="flex items-center gap-3">
    <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">{"Tài khoản đã liên kết"}</span>
    <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium">{"\n              2 tài khoản\n            "}</span>
    </div>
    <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm bg-surface-container-low px-3 py-1.5 rounded-full">
    <span className="material-symbols-outlined text-emerald-600 text-[18px]">{"verified_user"}</span>
    <span>{"Chuẩn mã hóa thông tin tài khoản PCI-DSS"}</span>
    </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgb(var(--color-cinematic)_/_0.03)] flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-[0_8px_24px_rgb(var(--color-brand-accent)_/_0.08)]">

    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-primary-container to-emerald-500"></div>
    <div className="flex flex-col gap-6">

    <div className="flex items-start justify-between gap-3 pt-1">
    <div className="flex items-center gap-3.5">

    <div className="w-13 h-13 px-3 py-2 rounded-lg bg-teal-900 text-teal-100 flex flex-col items-center justify-center leading-none shadow-xs shrink-0">
    <span className="font-headline-sm font-black tracking-tight text-[15px]">{"VCB"}</span>
    <span className="font-technical-data text-[10px] text-teal-300 mt-0.5">{"1963"}</span>
    </div>
    <div className="flex flex-col">
    <span className="font-headline-sm text-headline-sm font-bold text-on-surface leading-snug">{"Vietcombank (VCB)"}</span>
    <span className="font-body-sm text-body-sm text-on-surface-variant leading-tight">{"TMCP Ngoại thương Việt Nam"}</span>
    </div>
    </div>

    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[12px] font-label-md font-semibold tracking-tight shrink-0 shadow-2xs">
    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>{"\n                  Mặc định nhận thanh toán\n                "}</div>
    </div>

    <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-3">
    <div className="flex flex-col">
    <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">{"Số tài khoản"}</span>
    <div className="flex items-center justify-between mt-1">
    <span className="font-headline-md text-headline-md font-bold tracking-widest text-on-surface">{"••• 982"}</span>
    <span className="material-symbols-outlined text-outline-variant text-[22px]" title="Được bảo vệ mã hóa">{"lock"}</span>
    </div>
    </div>
    <div className="h-[1px] w-full bg-surface-container-high"></div>
    <div className="grid grid-cols-2 gap-4">
    <div className="flex flex-col">
    <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider">{"Chủ tài khoản"}</span>
    <span className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-1 mt-0.5">
    <span className="text-emerald-600">{"✓"}</span>{" NGUYỄN HOÀNG MINH\n                    "}</span>
    </div>
    <div className="flex flex-col text-right">
    <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider">{"Ngày liên kết"}</span>
    <span className="font-technical-data text-technical-data text-on-surface-variant mt-0.5">{"15/01/2024"}</span>
    </div>
    </div>
    </div>
    </div>

    <div className="mt-6 pt-4 flex items-center justify-between">
    <div className="flex items-center gap-2 text-emerald-700 font-label-md text-label-md font-semibold">
    <span className="material-symbols-outlined text-[20px] text-emerald-600" style={{ "fontVariationSettings": "'FILL' 1" }}>{"check_circle"}</span>
    <span>{"Tài khoản mặc định hiện tại"}</span>
    </div>
    <span className="font-label-sm text-label-sm text-outline-variant">{"Tự động nhận chuyển khoản"}</span>
    </div>
    </div>

    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgb(var(--color-cinematic)_/_0.03)] flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-[0_8px_24px_rgb(var(--color-cinematic)_/_0.06)]">
    <div className="flex flex-col gap-6">

    <div className="flex items-start justify-between gap-3 pt-1">
    <div className="flex items-center gap-3.5">

    <div className="w-13 h-13 px-3 py-2 rounded-lg bg-red-900 text-red-100 flex flex-col items-center justify-center leading-none shadow-xs shrink-0">
    <span className="font-headline-sm font-black tracking-tight text-[15px]">{"TCB"}</span>
    <span className="font-technical-data text-[10px] text-red-300 mt-0.5">{"1993"}</span>
    </div>
    <div className="flex flex-col">
    <span className="font-headline-sm text-headline-sm font-bold text-on-surface leading-snug">{"Techcombank (TCB)"}</span>
    <span className="font-body-sm text-body-sm text-on-surface-variant leading-tight">{"TMCP Kỹ thương Việt Nam"}</span>
    </div>
    </div>

    <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-[12px] font-label-md font-semibold tracking-tight shrink-0">{"\n                  Tài khoản phụ\n                "}</div>
    </div>

    <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-3">
    <div className="flex flex-col">
    <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">{"Số tài khoản"}</span>
    <div className="flex items-center justify-between mt-1">
    <span className="font-headline-md text-headline-md font-bold tracking-widest text-on-surface">{"••• 456"}</span>
    <span className="material-symbols-outlined text-outline-variant text-[22px]" title="Được bảo vệ mã hóa">{"lock"}</span>
    </div>
    </div>
    <div className="h-[1px] w-full bg-surface-container-high"></div>
    <div className="grid grid-cols-2 gap-4">
    <div className="flex flex-col">
    <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider">{"Chủ tài khoản"}</span>
    <span className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-1 mt-0.5">
    <span className="text-emerald-600">{"✓"}</span>{" NGUYỄN HOÀNG MINH\n                    "}</span>
    </div>
    <div className="flex flex-col text-right">
    <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider">{"Ngày liên kết"}</span>
    <span className="font-technical-data text-technical-data text-on-surface-variant mt-0.5">{"20/02/2024"}</span>
    </div>
    </div>
    </div>
    </div>

    <div className="flex-wrap gap-y-2 mt-6 pt-4 flex items-center justify-between">
    <span className="font-body-sm text-body-sm text-on-surface-variant">{"Sẵn sàng nhận thanh toán"}</span>
    <button className="ui-action inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-label-md font-label-md font-semibold transition-all duration-200 active:scale-95" type="button" aria-label="Đặt làm mặc định" data-action="default-bank">
    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{"check_circle_outline"}</span>
    <span>{"Đặt làm mặc định"}</span>
    </button>
    </div>
    </div>
    </div>

    <div data-purpose="add-bank-action" className="flex justify-start"><button className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-semibold tracking-wide hover:bg-primary transition-all duration-200 active:scale-95 shadow-md shrink-0" type="button" aria-label="Thêm tài khoản ngân hàng" data-route="/tai-khoan/ngan-hang/them">
        <span className="material-symbols-outlined text-[20px]">{"add"}</span>
        <span>{"Thêm tài khoản ngân hàng"}</span>
        </button></div>

    <div className="w-full bg-surface-container-lowest rounded-xl p-6 shadow-[0_2px_12px_rgb(var(--color-cinematic)_/_0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
    <div className="flex items-start gap-4">
    <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary-container shrink-0">
    <span className="material-symbols-outlined text-[28px]" style={{ "fontVariationSettings": "'FILL' 1" }}>{"account_balance_wallet"}</span>
    </div>
    <div className="flex flex-col">
    <h3 className="font-title text-title font-bold text-on-surface">{"Quy định nhận chi trả doanh thu"}</h3>
    <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-relaxed max-w-3xl">{"\n                Tài khoản ngân hàng được sử dụng để nhận các khoản chi trả khi bạn cho thuê xe trên CarDB. Hệ thống tự động chuyển khoản tới tài khoản có đánh dấu mặc định theo chu kỳ thanh toán vào ngày 05 và ngày 20 hàng tháng.\n              "}</p>
    </div>
    </div>
    <Link className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md font-semibold whitespace-nowrap transition-colors shrink-0" to="/tai-khoan/don-thue">
    <span>{"Xem doanh thu cho thuê xe"}</span>
    <span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
    </Link>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
    <div className="p-4 rounded-xl bg-surface-container-low/60 flex items-center gap-3.5">
    <span className="material-symbols-outlined text-outline text-[24px]">{"verified"}</span>
    <div className="flex flex-col">
    <span className="font-label-md text-label-md font-semibold text-on-surface">{"Khớp định danh CCCD/eKYC"}</span>
    <span className="font-body-sm text-[12px] text-on-surface-variant">{"Tên tài khoản trùng khớp chủ xe 100%"}</span>
    </div>
    </div>
    <div className="p-4 rounded-xl bg-surface-container-low/60 flex items-center gap-3.5">
    <span className="material-symbols-outlined text-outline text-[24px]">{"speed"}</span>
    <div className="flex flex-col">
    <span className="font-label-md text-label-md font-semibold text-on-surface">{"Thanh toán NAPAS 247"}</span>
    <span className="font-body-sm text-[12px] text-on-surface-variant">{"Nhận tiền sau 15 phút đối soát hợp đồng"}</span>
    </div>
    </div>
    <div className="p-4 rounded-xl bg-surface-container-low/60 flex items-center gap-3.5">
    <span className="material-symbols-outlined text-outline text-[24px]">{"security"}</span>
    <div className="flex flex-col">
    <span className="font-label-md text-label-md font-semibold text-on-surface">{"Bảo mật giao dịch"}</span>
    <span className="font-body-sm text-[12px] text-on-surface-variant">{"Tự động khóa chi trả khi đổi STK lạ"}</span>
    </div>
    </div>
    </div>

    </ProfileLayout></div>);
}
