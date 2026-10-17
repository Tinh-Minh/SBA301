import { ProfileLayout } from "@/layouts/ProfileLayout.jsx";
import { Link } from "react-router";
export default function BanksPage() {
    return (<div className="cardb-screen screen-banks bg-background font-body-md text-body-md text-on-surface antialiased">




    <ProfileLayout active="banks" title="Tài khoản ngân hàng">


    <div className="flex items-center justify-between pt-2 border-t border-border-light">
    <div className="flex items-center space-x-2.5">
    <h2 className="text-base font-bold text-text-primary">{"Tài khoản đã liên kết"}</h2>
    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pill-bg text-text-primary border border-border-light">{"2 tài khoản"}</span>
    </div>
    <div className="flex items-center space-x-1.5 text-[11px] text-text-secondary">
    <svg className="w-3.5 h-3.5 text-success-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>
    <span>{"Chuẩn mã hóa thông tin tài khoản PCI-DSS"}</span>
    </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-purpose="bank-cards-list">

    <article className="bg-white border-2 border-brand-accent rounded-2xl p-5 flex flex-col justify-between relative shadow-sm" data-purpose="bank-card-primary">
    <div>

    <div className="flex items-start justify-between">
    <div className="flex items-start space-x-3">

    <div className="w-10 h-10 rounded-xl bg-section-bg border border-border-light flex flex-col items-center justify-center text-center">
    <span className="text-[9px] font-black text-text-primary leading-none">{"VCB"}</span>
    <span className="text-[7px] text-brand-accent font-bold mt-0.5 leading-none">{"1963"}</span>
    </div>
    <div>
    <h3 className="text-sm font-bold text-text-primary leading-snug">{"Vietcombank (VCB)"}</h3>
    <p className="text-[10px] text-text-secondary leading-tight mt-0.5">{"TMCP Ngoại thương Việt Nam"}</p>
    </div>
    </div>

    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-light text-status-success-strong border border-emerald-border">
    <span className="w-1.5 h-1.5 rounded-full bg-success-green"></span>
    <span>{"Mặc định"}</span>
    </span>
    </div>

    <div className="mt-6 space-y-3">
    <div className="flex items-baseline justify-between border-b border-border-light pb-2">
    <span className="text-[11px] text-text-secondary uppercase font-medium">{"SỐ TÀI KHOẢN"}</span>
    <span className="text-base sm:text-lg font-mono font-bold tracking-wider text-text-primary">{"••• 982"}</span>
    </div>
    <div className="flex items-center justify-between text-xs">
    <span className="text-text-secondary text-[11px]">{"CHỦ TÀI KHOẢN"}</span>
    <span className="font-bold text-text-primary flex items-center">
    <svg className="w-3.5 h-3.5 text-success-green mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>{"\nNGUYỄN HOÀNG MINH\n"}</span>
    </div>
    <div className="flex items-center justify-between text-xs">
    <span className="text-text-secondary text-[11px]">{"Ngày liên kết"}</span>
    <span className="text-text-secondary font-mono">{"15/01/2024"}</span>
    </div>
    </div>
    </div>

    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-light pt-4">
    <div className="flex items-center space-x-1.5 text-xs font-semibold text-success-green">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
    </svg>
    <span>{"Tài khoản mặc định hiện tại"}</span>
    </div>
    <div className="flex-wrap gap-y-2 flex items-center space-x-2">


    </div>
    </div>
    </article>


    <article className="bg-white border border-border-light rounded-2xl p-5 flex flex-col justify-between relative shadow-sm" data-purpose="bank-card-secondary">
    <div>

    <div className="flex items-start justify-between">
    <div className="flex items-start space-x-3">

    <div className="w-10 h-10 rounded-xl bg-section-bg border border-border-light flex flex-col items-center justify-center text-center">
    <span className="text-[9px] font-black text-text-primary leading-none">{"TCB"}</span>
    <span className="text-[7px] text-text-secondary font-medium mt-0.5 leading-none">{"1993"}</span>
    </div>
    <div>
    <h3 className="text-sm font-bold text-text-primary leading-snug">{"Techcombank (TCB)"}</h3>
    <p className="text-[10px] text-text-secondary leading-tight mt-0.5">{"TMCP Kỹ thương Việt Nam"}</p>
    </div>
    </div>

    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-pill-bg text-text-secondary border border-border-light">{"\nTài khoản phụ\n"}</span>
    </div>

    <div className="mt-6 space-y-3">
    <div className="flex items-baseline justify-between border-b border-border-light pb-2">
    <span className="text-[11px] text-text-secondary uppercase font-medium">{"SỐ TÀI KHOẢN"}</span>
    <span className="text-base sm:text-lg font-mono font-bold tracking-wider text-text-primary">{"••• 456"}</span>
    </div>
    <div className="flex items-center justify-between text-xs">
    <span className="text-text-secondary text-[11px]">{"CHỦ TÀI KHOẢN"}</span>
    <span className="font-bold text-text-primary flex items-center">
    <svg className="w-3.5 h-3.5 text-success-green mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>{"\nNGUYỄN HOÀNG MINH\n"}</span>
    </div>
    <div className="flex items-center justify-between text-xs">
    <span className="text-text-secondary text-[11px]">{"Ngày liên kết"}</span>
    <span className="text-text-secondary font-mono">{"20/02/2024"}</span>
    </div>
    </div>
    </div>

    <div className="flex-wrap gap-y-2 mt-6 pt-4 border-t border-border-light flex items-center justify-between">
    <button className="ui-action inline-flex items-center space-x-1.5 text-xs font-medium text-brand-accent hover:bg-surface-orange-faint px-2.5 py-1 rounded-lg border border-brand-accent transition-colors cursor-pointer" type="button" aria-label="Đặt làm mặc định" data-action="default-bank">
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>
    <span>{"Đặt làm mặc định"}</span>
    </button>
    <div className="flex-wrap gap-y-2 flex items-center space-x-2">


    </div>
    </div>
    </article>

    </div>

    <div data-purpose="add-bank-action" className="flex justify-start"><button className="inline-flex items-center justify-center space-x-2 bg-brand-accent hover:bg-primary-hover text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-brand-accent/20 transition-all flex-shrink-0 cursor-pointer" type="button" aria-label="+ Thêm tài khoản ngân hàng" data-route="/tai-khoan/ngan-hang/them">
        <svg className="w-4 h-4 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
        </svg>
        <span>{"+ Thêm tài khoản ngân hàng"}</span>
        </button></div>

    <div className="bg-section-bg border border-border-light rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" data-purpose="payout-policy-banner">
    <div className="flex items-start space-x-3.5">
    <div className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent flex-shrink-0 mt-0.5">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
    </svg>
    </div>
    <div>
    <h4 className="text-sm font-bold text-text-primary">{"Quy định nhận chi trả doanh thu"}</h4>
    <p className="text-xs text-text-secondary mt-1 leading-relaxed max-w-2xl">{"\nTài khoản ngân hàng được sử dụng để nhận các khoản chi trả khi bạn cho thuê xe trên CarDB. Hệ thống tự động chuyển khoản tới tài khoản có đánh dấu mặc định theo chu kỳ thanh toán.\n"}</p>
    </div>
    </div>
    <Link className="inline-flex items-center space-x-1.5 text-xs font-semibold text-text-primary hover:text-brand-accent bg-white hover:border-brand-accent border border-border-light px-4 py-2.5 rounded-xl transition-all shadow-sm whitespace-nowrap" to="/tai-khoan/don-thue">
    <span>{"Xem doanh thu cho thuê xe"}</span>
    <span className="text-sm text-brand-accent">{"→"}</span>
    </Link>
    </div>

    </ProfileLayout>




    </div>);
}
