import { Link } from "react-router";
export default function Vehicle() {
    return (<div className="cardb-screen screen-vehicle  text-gray-800 antialiased selection:bg-orange-100 selection:text-orange-900">




    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20">

    <section className="mb-6" data-purpose="vehicle-header">

    <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-gray-900 text-white tracking-wide">{"\n          D-SUV 5 CHỖ\n        "}</span>
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
    <svg className="w-3.5 h-3.5 mr-1 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
    <path clipRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" fillRule="evenodd"></path>
    </svg>{"\n          Miễn Phí Sạc V-GREEN\n        "}</span>
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
    <svg className="w-3.5 h-3.5 mr-1 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
    <path clipRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
    </svg>{"\n          Xe Đối Tác Xác Thực\n        "}</span>
    </div>

    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
    <div className="flex flex-wrap items-baseline gap-3">
    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{"\n            VinFast VF 8 Plus "}<span className="text-orange-600 font-bold">{"2024"}</span>
    </h1>
    <div className="flex items-center gap-1.5 text-sm">
    <span className="flex items-center text-amber-500 font-bold">{"\n              ★ 4.98\n            "}</span>
    <span className="text-gray-500 font-normal">{"(186 lượt đánh giá • 214 chuyến hoàn thành)"}</span>
    </div>
    </div>
    </div>
    <p className="text-sm text-gray-600 mt-1 font-medium">{"\n        Màu ngoại thất: "}<span className="text-gray-900 font-semibold">{"Xanh Biển Sâu (Deep Ocean Metallic)"}</span>{" • Nội thất da nâu Saddle sang trọng\n      "}</p>
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">



    <div className="lg:col-span-8 space-y-8" data-purpose="vehicle-details-main">


    <div className="space-y-3">

    <div className="relative w-full aspect-[16/9] sm:aspect-[16/10] bg-gray-900 rounded-2xl overflow-hidden shadow-md group">
    <img alt="VinFast VF 8 Plus 2024 Xanh Biển Sâu" className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500" src="/images/cardb-418ca04892742654.webp" loading="lazy" decoding="async"/>

    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
    <div className="flex-wrap gap-y-2 flex gap-2 pointer-events-auto">
    <button className="ui-action bg-gray-900/80 hover:bg-gray-900 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 border border-white/20 transition-all shadow-md" type="button" aria-label="Xem toàn cảnh 360°" data-action="media-info">
    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
    </svg>{"\n                  Xem toàn cảnh 360°\n                "}</button>
    <button className="ui-action bg-gray-900/80 hover:bg-gray-900 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 border border-white/20 transition-all shadow-md" type="button" aria-label="Video kiểm định" data-action="media-info">
    <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path>
    </svg>{"\n                  Video kiểm định\n                "}</button>
    </div>
    <span className="hidden sm:inline-flex bg-black/60 backdrop-blur-sm text-white/90 text-[11px] px-2.5 py-1 rounded-md">{"\n                Ảnh thực tế 100% tại CarDB Studio\n              "}</span>
    </div>
    </div>

    <div className="grid grid-cols-4 gap-2.5">
    <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-orange-500 cursor-pointer shadow-xs group">
    <img alt="Taplo & Màn hình" className="w-full h-full object-cover group-hover:scale-105 transition-transform" src="/images/cardb-03df09ed6694c66f.webp" loading="lazy" decoding="async"/>
    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[11px] font-medium p-1.5 text-center truncate">{"Taplo & Màn hình"}</span>
    </div>
    <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 cursor-pointer shadow-xs group">
    <img alt="Hàng ghế sau" className="w-full h-full object-cover group-hover:scale-105 transition-transform" src="/images/cardb-5f9b8924be7195cf.webp" loading="lazy" decoding="async"/>
    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[11px] font-medium p-1.5 text-center truncate">{"Hàng ghế sau"}</span>
    </div>
    <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 cursor-pointer shadow-xs group">
    <img alt="Khoang hành lý" className="w-full h-full object-cover group-hover:scale-105 transition-transform" src="/images/cardb-df335fc74b64d409.webp" loading="lazy" decoding="async"/>
    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[11px] font-medium p-1.5 text-center truncate">{"Khoang hành lý 480L"}</span>
    </div>
    <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 cursor-pointer shadow-xs group">
    <img alt="Mâm 20 inch & Sạc" className="w-full h-full object-cover group-hover:scale-105 transition-transform" src="/images/cardb-96cb0124ffb0b6af.webp" loading="lazy" decoding="async"/>
    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[11px] font-medium p-1.5 text-center truncate">{"Mâm 20 inch & Sạc"}</span>
    </div>
    </div>
    </div>

    <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5" data-purpose="combined-tech-inspection"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div><div><h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">{"Thông số vận hành & Hồ sơ kiểm định"}</h2><p className="text-xs text-gray-500 mt-0.5">{"Kiểm định độc lập bởi CarDB Automotive Lab • Tiêu chuẩn 120 điểm"}</p></div></div><span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-full uppercase tracking-wider shrink-0">{"Kiểm định đạt chuẩn A"}</span></div><div className="space-y-3"><h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>{"Thông số vận hành"}</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1"><div className="p-1"><span className="text-xs text-gray-500 block truncate font-medium">{"Quãng đường / lần sạc"}</span><p className="text-xl font-extrabold text-gray-900 mt-1 truncate">{"420 km"}</p><p className="text-[11px] text-gray-500 mt-0.5 truncate">{"Miễn phí sạc V-GREEN"}</p></div><div className="p-1"><span className="text-xs text-gray-500 block truncate font-medium">{"Công suất cực đại"}</span><p className="text-xl font-extrabold text-gray-900 mt-1 truncate">{"402 HP"}</p><p className="text-[11px] text-gray-500 mt-0.5 truncate">{"0 - 100 km/h: 5.5s"}</p></div><div className="p-1"><span className="text-xs text-gray-500 block truncate font-medium">{"Hệ dẫn động"}</span><p className="text-xl font-extrabold text-gray-900 mt-1 truncate">{"2 Cầu AWD"}</p><p className="text-[11px] text-gray-500 mt-0.5 truncate">{"Hộp số 1 cấp điện tử"}</p></div><div className="p-1"><span className="text-xs text-gray-500 block truncate font-medium">{"Trợ lái thông minh"}</span><p className="text-xl font-extrabold text-gray-900 mt-1 truncate">{"ADAS Level 2"}</p><p className="text-[11px] text-gray-500 mt-0.5 truncate">{"Giữ làn & Ga thích ứng"}</p></div></div></div><div className="space-y-3 pt-3 border-t border-gray-100"><h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{"Hồ sơ kỹ thuật 120 điểm"}</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1"><div className="p-1"><span className="text-xs text-gray-500 block truncate font-medium">{"Hạn đăng kiểm"}</span><p className="text-base font-bold text-gray-900 mt-1 truncate">{"06/2027"}</p><p className="text-[11px] text-gray-500 mt-0.5 truncate">{"Chuẩn Cục ĐKVN"}</p></div><div className="p-1"><span className="text-xs text-gray-500 block truncate font-medium">{"Lịch bảo dưỡng"}</span><p className="text-base font-bold text-gray-900 mt-1 truncate">{"Định kỳ 3S"}</p><p className="text-[11px] text-gray-500 mt-0.5 truncate">{"Tại VinFast 15.000km"}</p></div><div className="p-1"><span className="text-xs text-gray-500 block truncate font-medium">{"Độ mòn lốp xe"}</span><p className="text-base font-bold text-gray-900 mt-1 truncate">{"< 5% (Mới 95%)"}</p><p className="text-[11px] text-gray-500 mt-0.5 truncate">{"Lốp Michelin chuẩn"}</p></div><div className="p-1"><span className="text-xs text-gray-500 block truncate font-medium">{"Tình trạng pin"}</span><p className="text-base font-bold text-gray-900 mt-1 truncate">{"SOH 99.4%"}</p><p className="text-[11px] text-gray-500 mt-0.5 truncate">{"Tối ưu • Đủ bảo hành"}</p></div></div></div></section>

    <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs" data-purpose="features-grid">
    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
    </svg>{"\n            Tiện nghi & Trang bị công nghệ trên xe\n          "}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5"><div className="flex items-start gap-3 p-2.5 rounded-xl transition-colors"><div className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5 text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><rect height="14" rx="2" ry="2" width="20" x="2" y="3"></rect><line x1="8" x2="16" y1="21" y2="21"></line><line x1="12" x2="12" y1="17" y2="21"></line></svg></div><div><h3 className="text-sm font-bold text-gray-900">{"Màn hình giải trí 15.6 inch"}</h3><p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{"Apple CarPlay, Android Auto không dây, trợ lý ảo ViVi điều khiển giọng nói tiếng Việt."}</p></div></div><div className="flex items-start gap-3 p-2.5 rounded-xl transition-colors"><div className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5 text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></div><div><h3 className="text-sm font-bold text-gray-900">{"Cửa sổ trời toàn cảnh Panorama"}</h3><p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{"Kính tráng phủ công nghệ cao chống 99% tia cực tím UV và giảm nhiệt khoang lái."}</p></div></div><div className="flex items-start gap-3 p-2.5 rounded-xl transition-colors"><div className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5 text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg></div><div><h3 className="text-sm font-bold text-gray-900">{"Ghế da sưởi & làm mát đa vùng"}</h3><p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{"Chỉnh điện 12 hướng, nhớ vị trí ghế lái, tích hợp quạt thông gió mát mẻ ngày hè."}</p></div></div><div className="flex items-start gap-3 p-2.5 rounded-xl transition-colors"><div className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5 text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div><div><h3 className="text-sm font-bold text-gray-900">{"Hệ thống 10 Loa cao cấp"}</h3><p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{"Âm vòm Subwoofer sống động mang lại trải nghiệm âm thanh phòng hòa nhạc du lịch."}</p></div></div><div className="flex items-start gap-3 p-2.5 rounded-xl transition-colors"><div className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5 text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div><div><h3 className="text-sm font-bold text-gray-900">{"Sạc không dây Qi & Cổng Type-C"}</h3><p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{"Hỗ trợ sạc nhanh công suất lớn cho cả hàng ghế trước và toàn bộ hành khách phía sau."}</p></div></div><div className="flex items-start gap-3 p-2.5 rounded-xl transition-colors"><div className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5 text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg></div><div><h3 className="text-sm font-bold text-gray-900">{"Điều hòa 2 vùng ion hóa"}</h3><p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{"Bộ lọc hạt bụi mịn PM2.5, màng lọc than hoạt tính khử mùi ẩm mốc tự động 24/7."}</p></div></div></div>
    </section>


    <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs" data-purpose="rental-policies">
    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>{"\n            Thủ Tục Thuê Xe & Cam Kết Minh Bạch\n          "}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

    <div className="space-y-3">
    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs flex items-center justify-center font-bold">{"1"}</span>{"\n                Giấy tờ định danh cần thiết\n              "}</h3>
    <ul className="text-xs text-gray-600 space-y-2 pl-7 list-disc">
    <li className=""><strong className="text-gray-800">{"Căn cước công dân gắn chíp"}</strong>{" hoặc tài khoản "}<strong className="text-gray-800">{"VNeID cấp 2"}</strong>{" (CarDB chỉ quét xác thực không giữ bản gốc)."}</li>
    <li className=""><strong className="text-gray-800">{"Giấy phép lái xe ô tô"}</strong>{" hạng B1/B2 còn thời hạn hiệu lực tối thiểu 03 tháng."}</li>
    <li className="">{"Đối với du khách hoặc người nước ngoài: Hộ chiếu (Passport) & Giấy phép lái xe quốc tế (IDP) hợp lệ."}</li>
    </ul>
    </div>

    <div className="space-y-3">
    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs flex items-center justify-center font-bold">{"2"}</span>{"\n                Quy định đặt cọc (Thế chấp an toàn)\n              "}</h3>
    <ul className="text-xs text-gray-600 space-y-2 pl-7 list-disc">
    <li className=""><strong className="text-emerald-700">{"0 VNĐ Đặt cọc:"}</strong>{" Khách hàng để lại xe máy chính chủ (kèm cà vẹt gốc giá trị trên 15 triệu)."}</li>
    <li className=""><strong className="text-gray-800">{"Cọc tiền mặt / Chuyển khoản:"}</strong>{" 10.000.000 VNĐ. Hoàn trả 100% qua tài khoản tức thì sau khi bàn giao nghiệm thu xe."}</li>
    <li className="">{"Hợp đồng điện tử minh bạch ký trực tiếp qua SMS OTP 3 phút nhanh gọn."}</li>
    </ul>
    </div>
    </div>
    </section>

    <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs" data-purpose="customer-reviews">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-3">
    <div>
    <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>{"\n                Đánh Giá Từ Khách Hàng Thực Tế\n              "}</h2>
    <p className="text-xs text-gray-500">{"Xác minh từ 186 hành trình CarDB gần nhất"}</p>
    </div>

    <div className="flex gap-2">
    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 text-white" type="button" aria-label="Tất cả (186)" data-action="filter">{"Tất cả (186)"}</button>
    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200" type="button" aria-label="Có ảnh (48)" data-action="choice">{"Có ảnh (48)"}</button>
    </div>
    </div>
    <div className="space-y-4">

    <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
    <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">{"TL"}</div>
    <div>
    <h4 className="text-xs font-bold text-gray-900">{"Trần Hoàng Long"}</h4>
    <p className="text-[11px] text-gray-500">{"Thuê đi Đà Lạt 4 ngày 3 đêm • 14/03/2025"}</p>
    </div>
    </div>
    <div className="text-amber-500 text-xs tracking-tighter">{"★★★★★"}</div>
    </div>
    <p className="text-xs text-gray-700 leading-relaxed">{"\n                Xe cực kỳ mới, giao xe tại sân bay Tân Sơn Nhất đúng giờ từng phút. Xe đi đèo Prenn rất khỏe, bám đường chắc chắn. Tính năng tự lái thông minh ADAS trên cao tốc Dầu Giây - Phan Thiết chạy nhàn tênh, sạc trạm VinFast thì miễn phí tiết kiệm cả triệu tiền xăng!\n              "}</p>
    <div className="flex gap-2 mt-2.5">
    <img alt="Ảnh feedback 1" className="w-16 h-12 rounded-lg object-cover border border-gray-200" src="/images/cardb-714a3e30cc3fb9a3.webp" loading="lazy" decoding="async"/>
    <img alt="Ảnh feedback 2" className="w-16 h-12 rounded-lg object-cover border border-gray-200" src="/images/cardb-ea6cebfd3fd2da64.webp" loading="lazy" decoding="async"/>
    </div>
    </div>

    <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
    <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center">{"MP"}</div>
    <div>
    <h4 className="text-xs font-bold text-gray-900">{"Mai Phương Thảo"}</h4>
    <p className="text-[11px] text-gray-500">{"Thuê công tác gia đình • 02/03/2025"}</p>
    </div>
    </div>
    <div className="text-amber-500 text-xs tracking-tighter">{"★★★★★"}</div>
    </div>
    <p className="text-xs text-gray-700 leading-relaxed">{"\n                Thủ tục check-in qua app VNeID chỉ 2 phút là xong, không bị giữ căn cước. Xe sạch bong không hề có mùi hôi như xe thuê truyền thống. Cốp rộng chở được 4 vali của cả nhà. Lần tới nhất định sẽ tiếp tục thuê của CarDB.\n              "}</p>
    </div>
    </div>
    </section>
    </div>




    <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4" data-purpose="booking-sidebar">

    <div className="relative rounded-2xl shadow-lg bg-white overflow-hidden border border-gray-200/80" style={{ "backgroundClip": "padding-box" }}>

    <div className="grid grid-cols-2 bg-gray-100/90 border-b border-gray-200">

    <button type="button" className="ui-action flex items-center justify-center gap-2 py-3 px-4 bg-white text-xs font-bold text-gray-900 border-t-2 border-orange-500 transition-colors relative" aria-label="Theo ngày" data-action="rental-mode">
    <span className="w-2 h-2 rounded-full bg-orange-600"></span>
    <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect height="18" rx="2" ry="2" width="18" x="3" y="4"></rect>
    <line x1="16" x2="16" y1="2" y2="6"></line>
    <line x1="8" x2="8" y1="2" y2="6"></line>
    <line x1="3" x2="21" y1="10" y2="10"></line>
    </svg>
    <span className="">{"Theo ngày"}</span>
    </button>

    <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors border-t-2 border-transparent" aria-label="Theo giờ" data-action="rental-mode">
    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
    <span className="">{"Theo giờ"}</span>
    </button>
    </div>

    <div className="p-5 relative" style={{ "backgroundImage": "linear-gradient(to bottom, rgba(252, 108, 38, 0.04) 0%, transparent 140px)" }}>

    <div className="mb-4 pb-4 border-b border-gray-100 flex items-start justify-between">
    <div>
    <div className="flex items-baseline gap-1.5">
    <span className="ui-money text-2xl font-black text-orange-600 tracking-tight">{"1.250.000 đ"}</span>
    <span className="text-xs font-medium text-gray-500">{"/ ngày"}</span>
    </div>
    <div className="flex items-center gap-2 mt-1">
    <span className="ui-money text-xs text-gray-400 line-through">{"1.550.000 đ"}</span>
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">{"Tiết kiệm 20% tháng này"}</span>
    </div>
    </div>
    <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">{"\n        ⚡ Giữ giá tốt\n      "}</span>
    </div>

    <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 mb-4 flex flex-col gap-2.5">
    <div className="flex items-center gap-3">
    <div className="relative shrink-0">
    <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-xs">{"NĐ"}</div>
    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Đối tác xác thực 5 sao">
    <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
    </svg>
    </div>
    </div>
    <div className="flex-1 min-w-0">
    <div className="flex items-center gap-1.5">
    <h4 className="text-xs font-bold text-gray-900 truncate">{"Nguyễn Minh Đức"}</h4>
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200/60 shrink-0">{"Chủ xe 5★"}</span>
    </div>
    <div className="flex items-center gap-2 mt-0.5 text-[11px] font-medium">
    <span className="flex items-center text-amber-500 font-bold">{"★ 5.0 "}<span className="text-gray-500 font-normal ml-0.5">{"(28 chuyến)"}</span></span>
    <span className="text-gray-300">{"•"}</span>
    <span className="text-gray-500 truncate">{"Phản hồi "}<strong className="text-gray-800">{"100%"}</strong>{" (5p)"}</span>
    </div>
    </div>
    </div>
    <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60">
    <button type="button" className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200/80 hover:bg-orange-600 hover:text-white transition-all" aria-label="Nhắn tin" data-action="contact-owner">
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
    </svg>{"\n          Nhắn tin\n        "}</button>
    <a href="tel:19008899" className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-colors shrink-0" title="Gọi chủ xe">
    <svg className="w-3.5 h-3.5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
    </svg>
    </a>
    </div>
    </div>

    <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200/80 mb-4 space-y-3">
    <div className="grid grid-cols-2 gap-3 text-xs">
    <div className="border-r border-gray-200 pr-2">
    <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-0.5">{"NHẬN XE"}</span>
    <span className="font-bold text-gray-900 block">{"08:00 • 28/03/2025"}</span>
    </div>
    <div className="pl-1">
    <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-0.5">{"TRẢ XE"}</span>
    <span className="font-bold text-gray-900 block">{"20:00 • 30/03/2025"}</span>
    </div>
    </div>
    <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
    <span className="text-gray-500">{"Tổng thời gian thuê:"}</span>
    <span className="font-bold text-gray-900">{"2.5 Ngày (Làm tròn 3 ngày)"}</span>
    </div>
    </div>

    <div className="mb-4">
    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
    <svg className="w-3.5 h-3.5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
    <path clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" fillRule="evenodd"></path>
    </svg>{"\n        Địa điểm giao nhận xe\n      "}</label>
    <div className="relative">
    <select className="w-full text-xs font-medium text-gray-800 bg-gray-50 border border-gray-300 rounded-xl py-2.5 px-3 focus:ring-orange-500 focus:border-orange-500" aria-label="Lựa chọn" defaultValue="Sân bay Tân Sơn Nhất (Ga Quốc Nội/Quốc Tế)">
    <option>{"Sân bay Tân Sơn Nhất (Ga Quốc Nội/Quốc Tế)"}</option>
    <option>{"Quận 1 - Trung tâm TP. Hồ Chí Minh"}</option>
    <option>{"Thủ Đức / Thảo Điền (Giao tận nhà)"}</option>
    <option>{"Nhận trực tiếp tại Showroom CarDB"}</option>
    </select>
    </div>
    </div>

    <div className="space-y-2 mb-4 pt-2 border-t border-gray-100">
    <p className="text-xs font-bold text-gray-800 mb-1.5">{"Dịch vụ bổ sung đề xuất:"}</p>
    <label className="flex items-center justify-between p-2 rounded-lg border border-orange-200 bg-orange-50/40 cursor-pointer">
    <div className="flex items-center gap-2">
    <input className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4" type="checkbox" defaultChecked={true}/>
    <div>
    <span className="text-xs font-bold text-gray-900 block leading-tight">{"Bảo Hiểm Thân Vỏ Toàn Diện VIP"}</span>
    <span className="text-[10px] text-gray-500">{"Miễn hoàn toàn mức khấu trừ rủi ro"}</span>
    </div>
    </div>
    <span className="text-xs font-bold text-orange-600">{"+99k/ngày"}</span>
    </label>
    <label className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
    <div className="flex items-center gap-2">
    <input className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4" type="checkbox"/>
    <div>
    <span className="text-xs font-medium text-gray-800 block leading-tight">{"Thuê kèm tài xế chuyên nghiệp"}</span>
    <span className="text-[10px] text-gray-500">{"Lịch thiệp, thông thạo đường dài, 10h/ngày"}</span>
    </div>
    </div>
    <span className="text-xs font-bold text-gray-700">{"+400k/ngày"}</span>
    </label>
    <label className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
    <div className="flex items-center gap-2">
    <input className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4" type="checkbox"/>
    <div>
    <span className="text-xs font-medium text-gray-800 block leading-tight">{"Ghế an toàn trẻ em ISOFIX"}</span>
    <span className="text-[10px] text-gray-500">{"Tiêu chuẩn châu Âu 1 - 5 tuổi"}</span>
    </div>
    </div>
    <span className="text-xs font-bold text-gray-700">{"+50k/ngày"}</span>
    </label>
    </div>

    <div className="space-y-1.5 text-xs border-t border-gray-100 pt-3 text-gray-600">
    <div className="flex justify-between">
    <span className="">{"Đơn giá thuê (3 ngày x 1.250.000đ):"}</span>
    <span className="ui-money font-medium text-gray-900">{"3.750.000 đ"}</span>
    </div>
    <div className="flex justify-between">
    <span className="">{"Bảo hiểm VIP (3 ngày x 99.000đ):"}</span>
    <span className="ui-money font-medium text-gray-900">{"297.000 đ"}</span>
    </div>
    <div className="flex justify-between">
    <span className="">{"Thuế GTGT (VAT 8%):"}</span>
    <span className="ui-money font-medium text-gray-900">{"323.760 đ"}</span>
    </div>
    <div className="flex justify-between text-emerald-600 font-semibold">
    <span className="flex items-center gap-1">
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
    </svg>{"\n          Voucher CARDBVIP (-15%)\n        "}</span>
    <span className="ui-money ">{"-562.500 đ"}</span>
    </div>
    <div className="border-t border-dashed border-gray-300 pt-2 flex items-baseline justify-between text-gray-900">
    <div>
    <span className="text-sm font-bold block">{"Tổng chi phí dự kiến:"}</span>
    <span className="text-[10px] text-gray-500 font-normal">{"Đã bao gồm năng lượng sạc và VAT"}</span>
    </div>
    <span className="ui-money text-2xl font-black text-orange-600">{"3.808.260 đ"}</span>
    </div>
    </div>

    <Link to="/dat-xe/xac-nhan" className="w-full mt-4 bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 group" aria-label="Tiến hành đặt xe ngay">
    <span className="">{"Đặt xe ngay"}</span>
    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
    </svg>
    </Link>

    <div className="mt-3 text-center space-y-1">
    <p className="text-[11px] text-gray-500 font-medium">{"⚡ Giữ xe 0đ • Hủy miễn phí trước 24 giờ"}</p>
    <p className="text-[11px] text-gray-400">{"Cần tư vấn hỗ trợ lộ trình? "}<a className="text-orange-600 font-bold hover:underline" href="tel:19008899">{"Hotline 1900 8899"}</a></p>
    </div>
    </div>
    </div>

    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs text-gray-600 flex items-start gap-3">
    <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
    </svg>
    <div>
    <h4 className="font-bold text-gray-900">{"Cam Kết Không Phát Sinh Chi Phí Ẩn"}</h4>
    <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">{"\n              Tất cả giá thuê, phí vệ sinh khử trùng và bảo hiểm đều được kê khai minh bạch trước khi thanh toán.\n            "}</p>
    </div>
    </div>
    </aside>

    </div>

    <section className="mt-16 pt-10 border-t border-gray-200" data-purpose="similar-cars">
    <div className="flex items-center justify-between mb-6">
    <div>
    <span className="text-xs uppercase font-extrabold text-orange-600 tracking-wider">{"Đề xuất cùng phân khúc"}</span>
    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-0.5">{"Dòng Xe Tương Tự Phù Hợp Cho Chuyến Đi"}</h2>
    </div>
    <Link className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-orange-600 flex items-center gap-1 group" to="/kham-pha-xe">{"\n          Xem toàn bộ đội xe\n          "}<svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"></path></svg>
    </Link>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between" data-vehicle-card="suv" data-vehicle-name="Mazda CX-5 Premium" data-price="1050000">
    <div>
    <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
    <img alt="Mazda CX-5" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/cardb-73b166040535beb8.webp" data-car-image="true" loading="lazy" decoding="async"/>
    <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md">{"Xăng • 5 Chỗ"}</span>
    </div>
    <div className="p-4">
    <div className="flex justify-between items-baseline">
    <h3 className="font-bold text-gray-900 text-base">{"Mazda CX-5 Premium"}</h3>
    <span className="text-xs font-bold text-amber-500">{"★ 4.95"}</span>
    </div>
    <p className="text-xs text-gray-500 mt-0.5">{"2024 • Đỏ Pha Lê"}</p>
    <div className="flex items-center gap-3 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
    <span className="">{"5 ghế"}</span>{" • "}<span className="">{"3 vali"}</span>{" • "}<span className="">{"6.8L/100km"}</span>
    </div>
    </div>
    </div>
    <div className="px-4 pb-4 pt-1 flex items-center justify-between">
    <div>
    <span className="ui-money text-base font-extrabold text-orange-600">{"1.050.000đ"}</span>
    <span className="text-xs text-gray-400">{"/ngày"}</span>
    </div>
    <Link className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-800 hover:bg-orange-600 hover:text-white transition-colors" to="/xe/vinfast-vf8-plus-2024">{"Xem chi tiết"}</Link>
    </div>
    </div>

    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between" data-vehicle-card="suv" data-vehicle-name="Toyota Fortuner Legender" data-price="1400000">
    <div>
    <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
    <img alt="Toyota Fortuner Legender" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/cardb-6f1d115597012353.webp" data-car-image="true" loading="lazy" decoding="async"/>
    <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md">{"Dầu • 7 Chỗ Gầm Cao"}</span>
    </div>
    <div className="p-4">
    <div className="flex justify-between items-baseline">
    <h3 className="font-bold text-gray-900 text-base">{"Toyota Fortuner Legender"}</h3>
    <span className="text-xs font-bold text-amber-500">{"★ 4.92"}</span>
    </div>
    <p className="text-xs text-gray-500 mt-0.5">{"2024 • Trắng Ngọc Trai"}</p>
    <div className="flex items-center gap-3 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
    <span className="">{"7 ghế"}</span>{" • "}<span className="">{"4 vali"}</span>{" • "}<span className="">{"4x2 Cầu sau"}</span>
    </div>
    </div>
    </div>
    <div className="px-4 pb-4 pt-1 flex items-center justify-between">
    <div>
    <span className="ui-money text-base font-extrabold text-orange-600">{"1.400.000đ"}</span>
    <span className="text-xs text-gray-400">{"/ngày"}</span>
    </div>
    <Link className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-800 hover:bg-orange-600 hover:text-white transition-colors" to="/xe/vinfast-vf8-plus-2024">{"Xem chi tiết"}</Link>
    </div>
    </div>

    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between" data-vehicle-card="suv" data-vehicle-name="Kia Carnival Signature" data-price="1850000">
    <div>
    <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
    <img alt="Kia Carnival Signature" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/cardb-82e98b75b37c32c9.webp" data-car-image="true" loading="lazy" decoding="async"/>
    <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md">{"MPV • 7 Chỗ VIP"}</span>
    </div>
    <div className="p-4">
    <div className="flex justify-between items-baseline">
    <h3 className="font-bold text-gray-900 text-base">{"Kia Carnival Signature"}</h3>
    <span className="text-xs font-bold text-amber-500">{"★ 4.99"}</span>
    </div>
    <p className="text-xs text-gray-500 mt-0.5">{"2024 • Ghế Ottoman • Đen"}</p>
    <div className="flex items-center gap-3 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
    <span className="">{"7 ghế VIP"}</span>{" • "}<span className="">{"5 vali"}</span>{" • "}<span className="">{"Cửa trượt điện"}</span>
    </div>
    </div>
    </div>
    <div className="px-4 pb-4 pt-1 flex items-center justify-between">
    <div>
    <span className="ui-money text-base font-extrabold text-orange-600">{"1.850.000đ"}</span>
    <span className="text-xs text-gray-400">{"/ngày"}</span>
    </div>
    <Link className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-800 hover:bg-orange-600 hover:text-white transition-colors" to="/xe/vinfast-vf8-plus-2024">{"Xem chi tiết"}</Link>
    </div>
    </div>
    </div>
    </section>

    </main>




    </div>);
}
