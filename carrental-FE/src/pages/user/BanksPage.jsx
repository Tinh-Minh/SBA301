import { ProfileLayout } from "@/layouts/ProfileLayout.jsx";
import { Link } from "react-router";
export default function BanksPage() {
    return (<div className="cardb-screen screen-banks bg-background font-body-md text-body-md text-on-surface antialiased">




    <ProfileLayout active="banks" title="Tài khoản ngân hàng" description="Quản lý tài khoản ngân hàng để nhận các khoản chi trả từ hoạt động cho thuê xe an toàn, bảo mật và đúng định danh." actions={<><button className="inline-flex items-center justify-center space-x-2 bg-[#FC6C26] hover:bg-[#e05a18] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-[#FC6C26]/20 transition-all flex-shrink-0 cursor-pointer" type="button" aria-label="+ Thêm tài khoản ngân hàng" data-route="/tai-khoan/ngan-hang/them">
        <svg className="w-4 h-4 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
        </svg>
        <span>{"+ Thêm tài khoản ngân hàng"}</span>
        </button></>}>


    <div className="flex items-center justify-between pt-2 border-t border-[#E9E9E7]">
    <div className="flex items-center space-x-2.5">
    <h2 className="text-base font-bold text-[#292929]">{"Tài khoản đã liên kết"}</h2>
    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F0F1EF] text-[#292929] border border-[#E9E9E7]">{"2 tài khoản"}</span>
    </div>
    <div className="flex items-center space-x-1.5 text-[11px] text-[#666666]">
    <svg className="w-3.5 h-3.5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>
    <span>{"Chuẩn mã hóa thông tin tài khoản PCI-DSS"}</span>
    </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-purpose="bank-cards-list">

    <article className="bg-white border-2 border-[#FC6C26] rounded-2xl p-5 flex flex-col justify-between relative shadow-sm" data-purpose="bank-card-primary">
    <div>

    <div className="flex items-start justify-between">
    <div className="flex items-start space-x-3">

    <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex flex-col items-center justify-center text-center">
    <span className="text-[9px] font-black text-[#292929] leading-none">{"VCB"}</span>
    <span className="text-[7px] text-[#FC6C26] font-bold mt-0.5 leading-none">{"1963"}</span>
    </div>
    <div>
    <h3 className="text-sm font-bold text-[#292929] leading-snug">{"Vietcombank (VCB)"}</h3>
    <p className="text-[10px] text-[#666666] leading-tight mt-0.5">{"TMCP Ngoại thương Việt Nam"}</p>
    </div>
    </div>

    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]">
    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
    <span>{"Mặc định"}</span>
    </span>
    </div>

    <div className="mt-6 space-y-3">
    <div className="flex items-baseline justify-between border-b border-[#E9E9E7] pb-2">
    <span className="text-[11px] text-[#666666] uppercase font-medium">{"SỐ TÀI KHOẢN"}</span>
    <span className="text-base sm:text-lg font-mono font-bold tracking-wider text-[#292929]">{"007100••••982"}</span>
    </div>
    <div className="flex items-center justify-between text-xs">
    <span className="text-[#666666] text-[11px]">{"CHỦ TÀI KHOẢN"}</span>
    <span className="font-bold text-[#292929] flex items-center">
    <svg className="w-3.5 h-3.5 text-[#10B981] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>{"\nNGUYỄN HOÀNG MINH\n"}</span>
    </div>
    <div className="flex items-center justify-between text-xs">
    <span className="text-[#666666] text-[11px]">{"Ngày liên kết"}</span>
    <span className="text-[#666666] font-mono">{"15/01/2024"}</span>
    </div>
    </div>
    </div>

    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E9E9E7] pt-4">
    <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#10B981]">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
    </svg>
    <span>{"Tài khoản mặc định hiện tại"}</span>
    </div>
    <div className="flex-wrap gap-y-2 flex items-center space-x-2">
    <button className="ui-action px-2.5 py-1 text-xs font-medium text-[#666666] hover:text-[#FC6C26] transition-colors cursor-pointer" type="button" aria-label="Xem chi tiết" data-action="bank-details">{"Xem chi tiết"}</button>
    <button className="ui-action px-3 py-1 text-xs font-medium rounded-lg bg-white hover:border-[#FC6C26] text-[#292929] border border-[#E9E9E7] transition-colors cursor-pointer" type="button" aria-label="Chỉnh sửa" data-route="/tai-khoan/ngan-hang/them?edit=1">{"Chỉnh sửa"}</button>
    </div>
    </div>
    </article>


    <article className="bg-white border border-[#E9E9E7] rounded-2xl p-5 flex flex-col justify-between relative shadow-sm" data-purpose="bank-card-secondary">
    <div>

    <div className="flex items-start justify-between">
    <div className="flex items-start space-x-3">

    <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex flex-col items-center justify-center text-center">
    <span className="text-[9px] font-black text-[#292929] leading-none">{"TCB"}</span>
    <span className="text-[7px] text-[#666666] font-medium mt-0.5 leading-none">{"1993"}</span>
    </div>
    <div>
    <h3 className="text-sm font-bold text-[#292929] leading-snug">{"Techcombank (TCB)"}</h3>
    <p className="text-[10px] text-[#666666] leading-tight mt-0.5">{"TMCP Kỹ thương Việt Nam"}</p>
    </div>
    </div>

    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#F0F1EF] text-[#666666] border border-[#E9E9E7]">{"\nTài khoản phụ\n"}</span>
    </div>

    <div className="mt-6 space-y-3">
    <div className="flex items-baseline justify-between border-b border-[#E9E9E7] pb-2">
    <span className="text-[11px] text-[#666666] uppercase font-medium">{"SỐ TÀI KHOẢN"}</span>
    <span className="text-base sm:text-lg font-mono font-bold tracking-wider text-[#292929]">{"190368••••456"}</span>
    </div>
    <div className="flex items-center justify-between text-xs">
    <span className="text-[#666666] text-[11px]">{"CHỦ TÀI KHOẢN"}</span>
    <span className="font-bold text-[#292929] flex items-center">
    <svg className="w-3.5 h-3.5 text-[#10B981] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>{"\nNGUYỄN HOÀNG MINH\n"}</span>
    </div>
    <div className="flex items-center justify-between text-xs">
    <span className="text-[#666666] text-[11px]">{"Ngày liên kết"}</span>
    <span className="text-[#666666] font-mono">{"20/02/2024"}</span>
    </div>
    </div>
    </div>

    <div className="flex-wrap gap-y-2 mt-6 pt-4 border-t border-[#E9E9E7] flex items-center justify-between">
    <button className="ui-action inline-flex items-center space-x-1.5 text-xs font-medium text-[#FC6C26] hover:bg-[#FFF5EE] px-2.5 py-1 rounded-lg border border-[#FC6C26] transition-colors cursor-pointer" type="button" aria-label="Đặt làm mặc định" data-action="default-bank">
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>
    <span>{"Đặt làm mặc định"}</span>
    </button>
    <div className="flex-wrap gap-y-2 flex items-center space-x-2">
    <button className="ui-action px-2.5 py-1 text-xs font-medium text-[#666666] hover:text-[#FC6C26] transition-colors cursor-pointer" type="button" aria-label="Xem chi tiết" data-action="bank-details">{"Xem chi tiết"}</button>
    <button className="ui-action px-3 py-1 text-xs font-medium rounded-lg bg-white hover:border-[#FC6C26] text-[#292929] border border-[#E9E9E7] transition-colors cursor-pointer" type="button" aria-label="Chỉnh sửa" data-route="/tai-khoan/ngan-hang/them?edit=1">{"Chỉnh sửa"}</button>
    </div>
    </div>
    </article>

    </div>

    <div className="bg-[#F7F7F5] border border-[#E9E9E7] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" data-purpose="payout-policy-banner">
    <div className="flex items-start space-x-3.5">
    <div className="w-10 h-10 rounded-xl bg-[#FC6C26]/10 border border-[#FC6C26]/20 flex items-center justify-center text-[#FC6C26] flex-shrink-0 mt-0.5">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
    </svg>
    </div>
    <div>
    <h4 className="text-sm font-bold text-[#292929]">{"Quy định nhận chi trả doanh thu"}</h4>
    <p className="text-xs text-[#666666] mt-1 leading-relaxed max-w-2xl">{"\nTài khoản ngân hàng được sử dụng để nhận các khoản chi trả khi bạn cho thuê xe trên CarDB. Hệ thống tự động chuyển khoản tới tài khoản có đánh dấu mặc định theo chu kỳ thanh toán.\n"}</p>
    </div>
    </div>
    <Link className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#292929] hover:text-[#FC6C26] bg-white hover:border-[#FC6C26] border border-[#E9E9E7] px-4 py-2.5 rounded-xl transition-all shadow-sm whitespace-nowrap" to="/tai-khoan/don-thue">
    <span>{"Xem doanh thu cho thuê xe"}</span>
    <span className="text-sm text-[#FC6C26]">{"→"}</span>
    </Link>
    </div>

    </ProfileLayout>




    </div>);
}
