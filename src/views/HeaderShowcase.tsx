import Link from "next/link";
import type { CSSProperties } from "react";

export default function HeaderShowcase() { return (<main className="pt-20"><div className="cardb-screen screen-headershowcase  p-8 md:p-12 flex flex-col justify-center items-center">
<div className="w-full max-w-6xl space-y-12">

<div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-5">
<div>
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-brand-orange text-xs font-semibold uppercase tracking-wider mb-2">
<span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>{"\n          Thành phần Giao diện Dùng chung (Shared Components)\n        "}</div>
<h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{"Các trạng thái điều hướng CarDB"}</h1>
<p className="text-sm text-gray-500 mt-1">{"Chuẩn thiết kế Modern Automotive Luxury • Header (Khách vãng lai & Đã đăng nhập) & Footer Hệ thống"}</p>
</div>
<div className="mt-4 md:mt-0 flex items-center gap-3">
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
<svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>{"\n          Pixel Accurate 1440px\n        "}</span>
</div>
</div>

<div className="space-y-3">
<div className="flex items-center justify-between px-1">
<div className="flex items-center gap-2">
<span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center">{"1"}</span>
<h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">{"Khách chưa đăng nhập"}</h2>
</div>
<span className="text-xs text-gray-500 font-mono">{"Trạng thái khách chưa đăng nhập"}</span>
</div>

<header className="w-full bg-white rounded-2xl border border-[#E9E9E7] shadow-sm hover:shadow-md transition-shadow px-6 py-3.5 flex items-center justify-between">

<div className="flex items-center gap-6">
<Link href="/lien-he" className="flex items-center gap-1.5 focus:outline-none">
<span className="text-2xl font-black tracking-tight text-[#1E1E1E]">{"Car"}<span className="text-brand-orange">{"DB"}</span></span>
<div className="hidden sm:flex flex-col border-l border-gray-200 pl-3 ml-2">
<span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase leading-none">{"Luxury"}</span>
<span className="text-[9px] font-semibold text-gray-400 tracking-wider uppercase leading-none mt-0.5">{"Mobility"}</span>
</div>
</Link>

<nav className="hidden lg:flex items-center gap-1 ml-4">
<Link href="/kham-pha-xe" className="px-4 py-2 rounded-xl text-sm font-semibold text-brand-orange bg-[#FFF8F5] transition-colors">{"\n              Khám phá xe\n            "}</Link>
<Link href="/chuyen-xe-cua-toi" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">{"\n              Chuyến xe của tôi\n            "}</Link>
<Link href="/cho-thue-xe" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">{"\n              Cho thuê xe\n            "}</Link>
</nav>
</div>

<div className="flex items-center gap-5">

<div className="hidden md:flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-brand-orange">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
</svg>
</div>
<div className="text-left">
<div className="text-[10px] uppercase font-semibold text-gray-400 leading-none">{"Hotline 24/7"}</div>
<div className="text-xs font-bold text-brand-orange leading-tight mt-0.5">{"1900 8899"}</div>
</div>
</div>


<div className="flex items-center gap-2.5">
<Link href="/dang-nhap" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-brand-orange transition-colors">{"\n              Đăng nhập\n            "}</Link>
<Link href="/dang-ky" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-brand-orange hover:bg-brand-orangeHover shadow-sm hover:shadow transition-all">
<span className="">{"Đăng ký"}</span>
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
</svg>
</Link>
</div>
</div>
</header>
</div>

<div className="space-y-3">
<div className="flex items-center justify-between px-1">
<div className="flex items-center gap-2">
<span className="w-6 h-6 rounded-full bg-brand-orange text-white text-xs font-bold flex items-center justify-center">{"2"}</span>
<h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">{"Khách đã đăng nhập"}</h2>
</div>
<span className="text-xs text-brand-orange font-semibold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">{"Active User State"}</span>
</div>

<header className="w-full bg-white rounded-2xl border border-[#E9E9E7] shadow-sm hover:shadow-md transition-shadow px-6 py-3.5 flex items-center justify-between">

<div className="flex items-center gap-6">
<Link href="/lien-he" className="flex items-center gap-1.5 focus:outline-none">
<span className="text-2xl font-black tracking-tight text-[#1E1E1E]">{"Car"}<span className="text-brand-orange">{"DB"}</span></span>
<div className="hidden sm:flex flex-col border-l border-gray-200 pl-3 ml-2">
<span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase leading-none">{"Luxury"}</span>
<span className="text-[9px] font-semibold text-gray-400 tracking-wider uppercase leading-none mt-0.5">{"Mobility"}</span>
</div>
</Link>

<nav className="hidden lg:flex items-center gap-1 ml-4">
<Link href="/kham-pha-xe" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">{"\n              Khám phá xe\n            "}</Link>
<Link href="/chuyen-xe-cua-toi" className="px-4 py-2 rounded-xl text-sm font-semibold text-brand-orange bg-[#FFF8F5] transition-colors relative">{"\n              Chuyến xe của tôi\n              "}<span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-orange"></span>
</Link>
<Link href="/cho-thue-xe" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">{"\n              Cho thuê xe\n            "}</Link>
</nav>
</div>

<div className="flex items-center gap-5">

<div className="hidden md:flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-brand-orange">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
</svg>
</div>
<div className="text-left">
<div className="text-[10px] uppercase font-semibold text-gray-400 leading-none">{"Hotline 24/7"}</div>
<div className="text-xs font-bold text-brand-orange leading-tight mt-0.5">{"1900 8899"}</div>
</div>
</div>


<Link href="/lien-he" className="flex items-center gap-3 pl-5 border-l border-[#E9E9E7] hover:opacity-90 transition-all focus:outline-none">

<div className="relative">
<div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-orange to-[#ff8f59] text-white font-bold text-xs flex items-center justify-center shadow-inner">{"\n      NM\n    "}</div>
<span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
</div>

<div className="text-left hidden sm:block">
<div className="flex items-center gap-1.5">
<span className="text-xs font-bold text-gray-900 leading-none">{"Nguyễn Hoàng Minh"}</span>
<span className="inline-block px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-200 leading-tight">{"VIP"}</span>
</div>
<span className="text-[10px] font-mono text-gray-400 leading-none mt-0.5 block">{"CDB-VN-88492"}</span>
</div>

<svg className="w-4 h-4 text-gray-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
</svg>
</Link>
</div>
</header>
</div>


<div className="space-y-3">
<div className="flex items-center justify-between px-1">
<div className="flex items-center gap-2">
<span className="w-6 h-6 rounded-full bg-brand-orange text-white text-xs font-bold flex items-center justify-center">{"3"}</span>
<h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">{"Chân trang dùng chung"}</h2>
</div>
<span className="text-xs text-brand-orange font-semibold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">{"Shared Component"}</span>
</div>

<div className="w-full rounded-2xl border border-[#E9E9E7] shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-[#F7F7F5]">
<footer className="w-full text-[#1E1E1E] pt-12 pb-8 px-8 md:px-12">

<div className="flex flex-col lg:flex-row justify-between gap-10 pb-10 border-b border-[#E9E9E7]">

<div className="space-y-4 max-w-sm">
<Link href="/lien-he" className="inline-flex items-center gap-1.5 focus:outline-none">
<span className="text-2xl font-black tracking-tight text-[#1E1E1E]">{"Car"}<span className="text-brand-orange">{"DB"}</span></span>
<div className="flex flex-col border-l border-gray-300 pl-3 ml-2">
<span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase leading-none">{"Luxury"}</span>
<span className="text-[9px] font-semibold text-gray-400 tracking-wider uppercase leading-none mt-0.5">{"Mobility"}</span>
</div>
</Link>
<p className="text-sm text-gray-600 leading-relaxed pr-4">{"\n            Nền tảng công nghệ cho thuê xe tự lái và xe có tài xế cao cấp. Minh bạch, an tâm trọn từng hành trình.\n          "}</p>
<div className="pt-2 flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-brand-orange border border-orange-200">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
</svg>
</div>
<div>
<div className="text-[10px] uppercase font-semibold text-gray-400 leading-none">{"Tổng đài CSKH 24/7"}</div>
<a href="tel:19008899" className="text-base font-bold text-brand-orange hover:underline leading-tight mt-0.5 block">{"1900 8899"}</a>
</div>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-16">

<div className="space-y-3">
<h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{"Dịch vụ"}</h3>
<ul className="space-y-2 text-sm text-gray-600">
<li className=""><Link href="/lien-he" className="hover:text-brand-orange transition-colors">{"Thuê xe tự lái"}</Link></li>
<li className=""><Link href="/lien-he" className="hover:text-brand-orange transition-colors">{"Thuê xe có tài xế"}</Link></li>
<li className=""><Link href="/lien-he" className="hover:text-brand-orange transition-colors">{"Bảng giá & Dòng xe"}</Link></li>
<li className=""><Link href="/lien-he" className="hover:text-brand-orange transition-colors">{"Thuê xe theo tháng"}</Link></li>
</ul>
</div>

<div className="space-y-3">
<h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{"Chính sách & Hỗ trợ"}</h3>
<ul className="space-y-2 text-sm text-gray-600">
<li className=""><Link href="/lien-he" className="hover:text-brand-orange transition-colors">{"Bảo hiểm chuyến đi"}</Link></li>
<li className=""><Link href="/lien-he" className="hover:text-brand-orange transition-colors">{"Quy định đặt cọc"}</Link></li>
<li className=""><Link href="/lien-he" className="hover:text-brand-orange transition-colors">{"Chính sách hoàn hủy"}</Link></li>
<li className=""><Link href="/lien-he" className="hover:text-brand-orange transition-colors">{"Câu hỏi thường gặp"}</Link></li>
</ul>
</div>

<div className="space-y-3">
<h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{"Về CarDB"}</h3>
<ul className="space-y-2 text-sm text-gray-600">
<li className=""><Link href="/lien-he" className="hover:text-brand-orange transition-colors">{"Giới thiệu công ty"}</Link></li>
<li className=""><Link href="/lien-he" className="hover:text-brand-orange transition-colors">{"Ưu đãi khách hàng"}</Link></li>
<li className=""><Link href="/lien-he" className="hover:text-brand-orange transition-colors">{"Tuyển dụng tài xế"}</Link></li>
<li className=""><Link href="/lien-he" className="hover:text-brand-orange transition-colors">{"Liên hệ hợp tác"}</Link></li>
</ul>
</div>
</div>
</div>

<div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
<p className="text-center md:text-left">{"\n          © 2025 CarDB Vietnam Mobility Platform. Bảo lưu mọi quyền.\n        "}</p>
<div className="flex flex-wrap items-center gap-6 text-gray-500">
<Link href="/dieu-khoan-su-dung" className="hover:text-brand-orange transition-colors">{"Điều khoản dịch vụ"}</Link>
<Link href="/chinh-sach-bao-mat" className="hover:text-brand-orange transition-colors">{"Chính sách bảo mật"}</Link>
<Link href="/dieu-khoan-su-dung" className="hover:text-brand-orange transition-colors">{"Quy chế hoạt động"}</Link>
</div>
</div>
</footer>
</div>
</div><div className="pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-500">
<div className="space-y-1">
<span className="font-bold text-gray-700">{"Quy chuẩn Thiết kế:"}</span>
<p className="">{"Hệ màu Modern Automotive Luxury (Trắng tuyết "}<code className="text-gray-700 bg-gray-100 px-1 py-0.5 rounded">{"#FFFFFF"}</code>{", Than chì "}<code className="text-gray-700 bg-gray-100 px-1 py-0.5 rounded">{"#1E1E1E"}</code>{", Cam Cháy "}<code className="text-brand-orange bg-orange-50 px-1 py-0.5 rounded">{"#FC6C26"}</code>{")."}</p>
</div>
<div className="space-y-1">
<span className="font-bold text-gray-700">{"Điểm đồng bộ Hệ thống:"}</span>
<p className="">{"Khớp 100% với các trang C01 (Trang chủ), C02 (Khám phá xe), C03 (Chi tiết xe), C05 (Hồ sơ) và C06–C11 (Đặt xe & Thanh toán)."}</p>
</div>
<div className="space-y-1">
<span className="font-bold text-gray-700">{"Khả năng mở rộng (Responsive):"}</span>
<p className="">{"Tối ưu trên Desktop 1440px tiêu chuẩn, tự động căn chỉnh và co giãn linh hoạt khi thu nhỏ khung nhìn."}</p>
</div>
</div>
</div>
</div></main>); }
