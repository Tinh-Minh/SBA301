import { Link } from "react-router";
export default function Handover() {
    return (<div className="cardb-screen screen-handover bg-[#F7F7F5] font-body text-charcoal antialiased"><main className="w-full  bg-[#F7F7F5] min-h-[calc(100vh-140px)] pt-20"><div className="flex flex-col w-full">

    <div className="w-full bg-surface border-b border-border-light py-6 px-margin">
    <div className="max-w-[1440px] mx-auto flex flex-col gap-5">

    <div className="flex flex-wrap items-center justify-between gap-4">
    <nav className="flex items-center gap-2 text-xs text-muted font-medium">
    <Link className="hover:text-primary transition-colors" to="/chuyen-xe-cua-toi">{"Chuyến xe của tôi"}</Link>
    <span className="text-border-light">{"/"}</span>
    <Link className="hover:text-primary transition-colors" to="/xe/vinfast-vf8-plus-2024">{"Chi tiết đơn thuê"}</Link>
    <span className="text-border-light">{"/"}</span>
    <span className="text-primary font-semibold">{"Bàn giao nhận xe"}</span>
    </nav>

    <div className="flex flex-wrap items-center gap-2.5">
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-blue-bg text-status-blue border border-blue-200 text-xs font-semibold">
    <span className="w-2 h-2 rounded-full bg-status-blue animate-pulse"></span>{"\n            Đơn đã xác nhận\n          "}</span>
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-green-bg text-status-green border border-green-200 text-xs font-semibold">
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>{"\n            Đã thanh toán tiền thuê\n          "}</span>
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-amber-bg text-status-amber-dark border border-amber-200 text-xs font-semibold">
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>{"\n            Chờ bàn giao\n          "}</span>
    </div>
    </div>

    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
    <div>
    <h1 className="text-[28px] leading-9 font-bold text-charcoal tracking-tight">{"\n            Biên bản bàn giao nhận xe\n          "}</h1>
    <p className="text-sm text-muted mt-1 max-w-2xl">{"\n            Kiểm tra tình trạng xe, đối chiếu tiền cọc và xác nhận bàn giao cùng chủ xe trước khi khởi hành.\n          "}</p>
    </div>
    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-alt border border-border-light text-xs text-muted font-medium w-fit">
    <span className="w-2 h-2 rounded-full bg-primary shadow-xs"></span>
    <span className="text-charcoal font-semibold">{"Bước 4 / 4 đang thực hiện"}</span>
    </div>
    </div>

    <div className="bg-surface rounded-xl border border-border-light p-5 shadow-sm mt-1">
    <div className="relative flex items-center justify-between w-full">

    <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-surface-alt rounded-full z-0"></div>
    <div className="absolute left-8 w-[75%] top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-status-green via-status-green to-primary rounded-full z-0"></div>

    <div className="relative z-10 flex flex-col items-center gap-2 group bg-surface px-2">
    <div className="w-9 h-9 rounded-full bg-status-green text-white flex items-center justify-center shadow-sm">
    <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="3" viewBox="0 0 24 24">
    <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
    </div>
    <span className="text-xs font-semibold text-charcoal">{"Gửi yêu cầu"}</span>
    </div>

    <div className="relative z-10 flex flex-col items-center gap-2 group bg-surface px-2">
    <div className="w-9 h-9 rounded-full bg-status-green text-white flex items-center justify-center shadow-sm">
    <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="3" viewBox="0 0 24 24">
    <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
    </div>
    <span className="text-xs font-semibold text-charcoal">{"Chủ xe xác nhận"}</span>
    </div>

    <div className="relative z-10 flex flex-col items-center gap-2 group bg-surface px-2">
    <div className="w-9 h-9 rounded-full bg-status-green text-white flex items-center justify-center shadow-sm">
    <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="3" viewBox="0 0 24 24">
    <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
    </div>
    <span className="text-xs font-semibold text-charcoal">{"Thanh toán"}</span>
    </div>

    <div className="relative z-10 flex flex-col items-center gap-2 group bg-surface px-2">
    <div className="w-10 h-10 rounded-full bg-[#FFF8F5] border-2 border-primary text-primary flex items-center justify-center shadow-md animate-pulse">
    <span className="w-3 h-3 rounded-full bg-primary"></span>
    </div>
    <div className="flex flex-col items-center">
    <span className="text-xs font-bold text-primary">{"Nhận xe (Đang thực hiện)"}</span>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>

    <div className="w-full px-margin py-8 max-w-[1440px] mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

    <div className="lg:col-span-8 flex flex-col gap-6">

    <div className="relative overflow-hidden rounded-2xl bg-surface border border-border-light p-5 shadow-sm">
    <div className="flex flex-col sm:flex-row items-center gap-5">

    <div className="relative w-full sm:w-56 h-36 rounded-xl overflow-hidden bg-surface-alt shrink-0 group border border-border-light">
    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/cardb-fde140dc3cdda903.webp" alt="Hình ảnh xe CarDB" loading="lazy" decoding="async"/>
    <span className="absolute top-2 left-2 bg-surface/90 backdrop-blur-md text-primary text-[11px] font-bold px-2 py-0.5 rounded border border-primary/20 shadow-xs">{"\n                AWD Điện\n              "}</span>
    </div>

    <div className="flex-1 w-full flex flex-col justify-between h-full gap-3">
    <div className="flex flex-wrap items-start justify-between gap-2">
    <div>
    <h3 className="text-lg font-bold text-charcoal tracking-tight">{"\n                    VinFast VF 9 Plus AWD\n                  "}</h3>
    <div className="flex items-center gap-2 mt-1">
    <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-alt border border-border-light text-charcoal font-bold">{"51K-889.92"}</span>
    <span className="text-muted text-xs">{"• SUV 7 Chỗ Thương Gia"}</span>
    </div>
    </div>
    <Link className="inline-flex items-center gap-1 text-muted hover:text-primary text-xs font-semibold transition-colors" to="/xe/vinfast-vf8-plus-2024">
    <span className="">{"Xem chi tiết đơn thuê ↗"}</span>
    </Link>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border-light text-xs">
    <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-full bg-[#FFF8F5] text-primary flex items-center justify-center shrink-0 border border-primary/20">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>
    </div>
    <div className="truncate">
    <span className="text-muted text-[11px] block">{"Khách thuê"}</span>
    <span className="text-charcoal font-semibold truncate">{"Nguyễn Hoàng Minh"}</span>
    </div>
    </div>
    <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-full bg-status-amber-bg text-status-amber-dark flex items-center justify-center shrink-0 border border-amber-200">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>
    </div>
    <div className="truncate">
    <span className="text-muted text-[11px] block">{"Chủ xe đối tác"}</span>
    <span className="text-charcoal font-semibold flex items-center gap-1">{"\n                      Trần Đức Nam\n                      "}<span className="text-status-amber-dark text-[11px] flex items-center font-bold">{"\n                        ★ 5.0\n                      "}</span>
    </span>
    </div>
    </div>
    <div className="sm:col-span-2 flex items-start gap-2.5 pt-2 border-t border-border-light"><div className="w-7 h-7 rounded-lg bg-surface-alt text-muted flex items-center justify-center shrink-0 mt-0.5 border border-border-light"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg></div><div className="flex flex-col gap-0.5"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="text-muted">{"Lịch hẹn: "}<strong className="text-charcoal">{"08:00, 26/10/2026"}</strong></span><span className="text-muted text-[11px] bg-badge-gray px-2 py-0.5 rounded border border-border-light">{"Thời điểm kiểm tra thực tế: Chưa ghi nhận (đối chiếu tại bãi)"}</span></div><span className="text-charcoal text-[13px] mt-0.5">{"Địa điểm bàn giao: 128 Thảo Điền, P. Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh"}</span></div></div>
    </div>
    </div>
    </div>
    </div>

    <div className="rounded-2xl bg-surface border border-border-light p-5 sm:p-6 shadow-sm flex flex-col gap-5">
    <div className="flex items-center justify-between border-b border-border-light pb-4">
    <div className="flex items-center gap-2.5">
    <div className="w-9 h-9 rounded-xl bg-[#FFF8F5] text-primary border border-primary/20 flex items-center justify-center">
    <svg className="w-5 h-5 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
    </div>
    <h2 className="text-base sm:text-lg font-bold text-charcoal">{"\n                Kiểm tra tình trạng xe khi nhận\n              "}</h2>
    </div>
    <span className="text-xs font-semibold uppercase tracking-wider text-muted bg-badge-gray px-2.5 py-1 rounded-full border border-border-light">{"QUY CHUẨN 32 MỤC"}</span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="p-4 rounded-xl bg-surface-alt border border-border-light flex flex-col gap-2"><label className="text-xs text-muted font-medium flex items-center justify-between"><span className="text-charcoal font-semibold">{"Số km trên đồng hồ (ODO)"}</span><span className="text-status-amber-dark font-medium text-[11px]">{"Chờ xác minh thực tế khi giao nhận"}</span></label><div className="relative flex items-center"><input className="w-full bg-surface border border-border-light rounded-lg px-4 py-2 text-charcoal font-mono font-bold text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs" type="text" aria-label="Thông tin" defaultValue="12.450"/><span className="absolute right-4 text-muted font-semibold text-sm">{"km"}</span></div><p className="text-[11px] text-muted leading-tight">{"Thông tin mẫu chờ đối soát thực tế tại bãi xe. Khách thuê có quyền rà soát và yêu cầu điều chỉnh nếu có chênh lệch."}</p></div><div className="p-4 rounded-xl bg-surface-alt border border-border-light flex flex-col gap-2"><label className="text-xs text-muted font-medium flex items-center justify-between"><span className="flex items-center gap-1.5 text-charcoal font-semibold"><svg className="w-4 h-4 text-primary stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" strokeLinecap="round" strokeLinejoin="round"></path></svg>{"Mức pin hiện tại (EV Battery)"}</span><span className="text-primary font-mono font-bold text-lg">{"88%"}</span></label><div className="w-full bg-white h-3 rounded-full overflow-hidden p-0.5 border border-border-light"><div className="bg-primary h-full rounded-full transition-all duration-700 shadow-xs" style={{ "width": "88%" }}></div></div><div className="flex items-center justify-between text-[11px] text-muted"><span className="">{"Ước tính di chuyển: ~420 km"}</span><span className="text-status-amber-dark font-medium">{"Chờ đối soát thực tế"}</span></div></div></div>

    <div className="flex flex-col gap-2.5">
    <span className="text-xs font-bold text-charcoal uppercase tracking-wider">{"Tình trạng ngoại thất xe"}</span>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <label className="cursor-pointer relative flex items-center gap-3 p-3.5 rounded-xl bg-[#FFF8F5] border-2 border-primary text-charcoal shadow-xs">
    <input className="text-primary focus:ring-0 w-4 h-4 accent-primary" name="exterior" type="radio" defaultChecked={true}/>
    <div className="flex flex-col">
    <span className="text-xs font-bold text-charcoal">{"Tốt / Không trầy xước"}</span>
    <span className="text-[11px] text-muted">{"Sơn bóng nguyên bản"}</span>
    </div>
    </label>
    <label className="cursor-pointer relative flex items-center gap-3 p-3.5 rounded-xl bg-surface border border-border-light hover:border-primary/40 text-muted transition-all">
    <input className="text-primary focus:ring-0 w-4 h-4 accent-primary" name="exterior" type="radio"/>
    <div className="flex flex-col">
    <span className="text-xs font-bold text-charcoal">{"Trầy xước nhẹ đã lưu"}</span>
    <span className="text-[11px] text-muted">{"Có chụp ảnh đối chiếu"}</span>
    </div>
    </label>
    <label className="cursor-pointer relative flex items-center gap-3 p-3.5 rounded-xl bg-surface border border-border-light hover:border-primary/40 text-muted transition-all">
    <input className="text-primary focus:ring-0 w-4 h-4 accent-primary" name="exterior" type="radio"/>
    <div className="flex flex-col">
    <span className="text-xs font-bold text-charcoal">{"Hiện trạng khác"}</span>
    <span className="text-[11px] text-muted">{"Cần ghi chú rõ"}</span>
    </div>
    </label>
    </div>
    </div>

    <div className="flex flex-col gap-2.5">
    <span className="text-xs font-bold text-charcoal uppercase tracking-wider">{"Tình trạng nội thất & Vệ sinh"}</span>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <label className="cursor-pointer relative flex items-center gap-3 p-3.5 rounded-xl bg-[#FFF8F5] border-2 border-primary text-charcoal shadow-xs">
    <input className="text-primary focus:ring-0 w-4 h-4 accent-primary" name="interior" type="radio" defaultChecked={true}/>
    <div className="flex flex-col">
    <span className="text-xs font-bold text-charcoal">{"Sạch sẽ & Đạt chuẩn"}</span>
    <span className="text-[11px] text-muted">{"Khử khuẩn mùi mới"}</span>
    </div>
    </label>
    <label className="cursor-pointer relative flex items-center gap-3 p-3.5 rounded-xl bg-surface border border-border-light hover:border-primary/40 text-muted transition-all">
    <input className="text-primary focus:ring-0 w-4 h-4 accent-primary" name="interior" type="radio"/>
    <div className="flex flex-col">
    <span className="text-xs font-bold text-charcoal">{"Bình thường"}</span>
    <span className="text-[11px] text-muted">{"Không rách / ố bẩn"}</span>
    </div>
    </label>
    <label className="cursor-pointer relative flex items-center gap-3 p-3.5 rounded-xl bg-surface border border-border-light hover:border-primary/40 text-muted transition-all">
    <input className="text-primary focus:ring-0 w-4 h-4 accent-primary" name="interior" type="radio"/>
    <div className="flex flex-col">
    <span className="text-xs font-bold text-charcoal">{"Cần vệ sinh thêm"}</span>
    <span className="text-[11px] text-muted">{"Yêu cầu xử lý nhanh"}</span>
    </div>
    </label>
    </div>
    </div>

    <div className="flex flex-col gap-2.5 pt-2"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1"><span className="text-xs font-bold text-charcoal uppercase tracking-wider">{"Phụ kiện & Giấy tờ pháp lý bàn giao"}</span><span className="text-status-amber-dark text-xs font-semibold">{"0/6 mục đã kiểm tra"}</span></div><p className="text-xs text-muted">{"Vui lòng chỉ tích chọn sau khi đã tận mắt kiểm tra thực tế phụ kiện trên xe."}</p><div className="grid grid-cols-1 md:grid-cols-2 gap-2.5"><label className="flex items-center gap-3 p-3 rounded-xl bg-surface-alt hover:bg-[#FFF8F5] border border-border-light hover:border-primary/30 transition-colors cursor-pointer"><input className="w-4 h-4 rounded text-primary border-border-light focus:ring-0 accent-primary" type="checkbox"/><span className="text-xs text-charcoal font-medium">{"Giấy đăng ký xe (Bản sao công chứng hợp lệ)"}</span></label><label className="flex items-center gap-3 p-3 rounded-xl bg-surface-alt hover:bg-[#FFF8F5] border border-border-light hover:border-primary/30 transition-colors cursor-pointer"><input className="w-4 h-4 rounded text-primary border-border-light focus:ring-0 accent-primary" type="checkbox"/><span className="text-xs text-charcoal font-medium">{"Giấy chứng nhận kiểm định an toàn còn hạn"}</span></label><label className="flex items-center gap-3 p-3 rounded-xl bg-surface-alt hover:bg-[#FFF8F5] border border-border-light hover:border-primary/30 transition-colors cursor-pointer"><input className="w-4 h-4 rounded text-primary border-border-light focus:ring-0 accent-primary" type="checkbox"/><span className="text-xs text-charcoal font-medium">{"Bảo hiểm TNDS & Bảo hiểm vật chất xe 2 chiều"}</span></label><label className="flex items-center gap-3 p-3 rounded-xl bg-surface-alt hover:bg-[#FFF8F5] border border-border-light hover:border-primary/30 transition-colors cursor-pointer"><input className="w-4 h-4 rounded text-primary border-border-light focus:ring-0 accent-primary" type="checkbox"/><span className="text-xs text-charcoal font-medium">{"Bộ cáp sạc di động chính hãng & Adapter sạc"}</span></label><label className="flex items-center gap-3 p-3 rounded-xl bg-surface-alt hover:bg-[#FFF8F5] border border-border-light hover:border-primary/30 transition-colors cursor-pointer"><input className="w-4 h-4 rounded text-primary border-border-light focus:ring-0 accent-primary" type="checkbox"/><span className="text-xs text-charcoal font-medium">{"Chìa khóa thông minh Smartkey (01 chiếc)"}</span></label><label className="flex items-center gap-3 p-3 rounded-xl bg-surface-alt hover:bg-[#FFF8F5] border border-border-light hover:border-primary/30 transition-colors cursor-pointer"><input className="w-4 h-4 rounded text-primary border-border-light focus:ring-0 accent-primary" type="checkbox"/><span className="text-xs text-charcoal font-medium">{"Bộ vá lốp khẩn cấp, bơm điện & tam giác phản quang"}</span></label></div></div>
    </div>

    <div className="rounded-2xl bg-surface border border-border-light p-5 sm:p-6 shadow-sm flex flex-col gap-5">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-light pb-4">
    <div>
    <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-lg bg-[#FFF8F5] text-primary border border-primary/20 flex items-center justify-center">
    <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" strokeLinecap="round" strokeLinejoin="round"></path>
    <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
    </div>
    <h2 className="text-base sm:text-lg font-bold text-charcoal">{"\n                  Hình ảnh hiện trạng xe\n                "}</h2>
    </div>
    <p className="text-xs text-muted mt-1 leading-relaxed">{"Ảnh hiện trạng được tải lên thực tế tại thời điểm giao nhận và kiểm tra tính hợp lệ theo quy định hệ thống (Chụp trực tiếp 6 góc xe để làm căn cứ đối chiếu khi hoàn trả)."}</p>
    </div>
    <span className="text-xs font-semibold text-muted px-3 py-1 bg-badge-gray rounded-full border border-border-light shrink-0 whitespace-nowrap inline-flex items-center">{"0 / 6 ảnh đã tải"}</span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">

    <div className="group flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-border-light hover:border-primary bg-surface-alt hover:bg-[#FFF8F5] transition-all cursor-pointer min-h-[160px] text-center">
    <div className="w-9 h-9 rounded-full bg-white border border-border-light text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
    <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
    </div>
    <span className="text-xs font-bold text-charcoal">{"1. Phía trước xe"}</span>
    <span className="text-[11px] text-red-500 font-medium mt-0.5">{"Yêu cầu bắt buộc"}</span>
    <span className="text-[11px] text-muted mt-1.5 px-2 py-0.5 rounded bg-white border border-border-light">{"Chưa tải lên"}</span>
    </div>

    <div className="group flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-border-light hover:border-primary bg-surface-alt hover:bg-[#FFF8F5] transition-all cursor-pointer min-h-[160px] text-center">
    <div className="w-9 h-9 rounded-full bg-white border border-border-light text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
    <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
    </div>
    <span className="text-xs font-bold text-charcoal">{"2. Phía sau xe"}</span>
    <span className="text-[11px] text-red-500 font-medium mt-0.5">{"Yêu cầu bắt buộc"}</span>
    <span className="text-[11px] text-muted mt-1.5 px-2 py-0.5 rounded bg-white border border-border-light">{"Chưa tải lên"}</span>
    </div>

    <div className="group flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-border-light hover:border-primary bg-surface-alt hover:bg-[#FFF8F5] transition-all cursor-pointer min-h-[160px] text-center">
    <div className="w-9 h-9 rounded-full bg-white border border-border-light text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
    <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
    </div>
    <span className="text-xs font-bold text-charcoal">{"3. Thân xe bên trái"}</span>
    <span className="text-[11px] text-red-500 font-medium mt-0.5">{"Yêu cầu bắt buộc"}</span>
    <span className="text-[11px] text-muted mt-1.5 px-2 py-0.5 rounded bg-white border border-border-light">{"Chưa tải lên"}</span>
    </div>

    <div className="group flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-border-light hover:border-primary bg-surface-alt hover:bg-[#FFF8F5] transition-all cursor-pointer min-h-[160px] text-center">
    <div className="w-9 h-9 rounded-full bg-white border border-border-light text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
    <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
    </div>
    <span className="text-xs font-bold text-charcoal">{"4. Thân xe bên phải"}</span>
    <span className="text-[11px] text-red-500 font-medium mt-0.5">{"Yêu cầu bắt buộc"}</span>
    <span className="text-[11px] text-muted mt-1.5 px-2 py-0.5 rounded bg-white border border-border-light">{"Chưa tải lên"}</span>
    </div>

    <div className="group flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-border-light hover:border-primary bg-surface-alt hover:bg-[#FFF8F5] transition-all cursor-pointer min-h-[160px] text-center">
    <div className="w-9 h-9 rounded-full bg-white border border-border-light text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
    <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
    </div>
    <span className="text-xs font-bold text-charcoal">{"5. Nội thất & Ghế ngồi"}</span>
    <span className="text-[11px] text-primary font-medium mt-0.5">{"Khuyến khích"}</span>
    <span className="text-[11px] text-muted mt-1.5 px-2 py-0.5 rounded bg-white border border-border-light">{"Chưa tải lên"}</span>
    </div>

    <div className="group flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-border-light hover:border-primary bg-surface-alt hover:bg-[#FFF8F5] transition-all cursor-pointer min-h-[160px] text-center">
    <div className="w-9 h-9 rounded-full bg-white border border-border-light text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
    <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
    </div>
    <span className="text-xs font-bold text-charcoal">{"6. Taplo ODO & Pin EV"}</span>
    <span className="text-[11px] text-red-500 font-medium mt-0.5">{"Yêu cầu bắt buộc"}</span>
    <span className="text-[11px] text-muted mt-1.5 px-2 py-0.5 rounded bg-white border border-border-light">{"Chưa tải lên"}</span>
    </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted pt-2 border-t border-border-light">
    <span className="">{"Hỗ trợ định dạng: JPG, PNG, HEIC (Tối đa 15MB/ảnh)"}</span>
    <button className="px-3.5 py-1.5 rounded-lg border border-border-light bg-surface hover:bg-surface-alt text-charcoal font-semibold text-xs inline-flex items-center gap-1.5 transition-colors shadow-xs" type="button" aria-label="Tải lên toàn bộ ảnh" data-action="upload">
    <svg className="w-4 h-4 stroke-current text-charcoal" fill="none" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>{"\n              Tải lên toàn bộ ảnh\n            "}</button>
    </div>
    </div>

    <div className="rounded-2xl bg-surface border border-border-light p-5 sm:p-6 shadow-sm flex flex-col gap-3.5">
    <label className="text-sm sm:text-base font-bold text-charcoal flex items-center gap-2" htmlFor="conditionNotes">
    <span className="">{"Ghi chú hiện trạng và các vấn đề cần lưu ý"}</span>
    </label>
    <textarea className="w-full bg-surface-alt rounded-xl p-3.5 text-charcoal text-xs sm:text-sm border border-border-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted/60 min-h-[100px]" id="conditionNotes" placeholder="Ghi chú chi tiết về các vết xước nhỏ có sẵn, phụ kiện đặc biệt, hoặc thỏa thuận riêng giữa chủ xe và khách thuê tại thời điểm nhận xe..." rows={3}></textarea>
    <div className="p-3 rounded-xl bg-surface-alt border border-border-light flex items-start gap-2.5">
    <svg className="w-4 h-4 text-muted shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>
    <p className="text-xs text-muted">
    <strong className="text-charcoal font-semibold">{"Bảo vệ quyền lợi:"}</strong>{" Thông tin và hình ảnh sẽ được niêm phong vào biên bản điện tử để làm căn cứ đối soát minh bạch khi khách hàng hoàn trả xe.\n            "}</p>
    </div>
    </div>

    <div className="rounded-2xl bg-surface border border-border-light p-5 sm:p-6 shadow-sm flex flex-col gap-5"><div className="flex items-center gap-2.5 border-b border-border-light pb-4"><div className="w-9 h-9 rounded-xl bg-[#FFF8F5] text-primary border border-primary/20 flex items-center justify-center"><svg className="w-5 h-5 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round"></path></svg></div><h2 className="text-base sm:text-lg font-bold text-charcoal">{"Xác nhận bàn giao giữa hai bên"}</h2></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"><div className="p-3.5 rounded-xl bg-surface-alt border border-border-light flex items-center justify-between"><div className="flex flex-col"><span className="text-[10px] text-muted uppercase tracking-wider font-semibold">{"Chủ xe đối tác"}</span><span className="text-xs font-bold text-charcoal mt-0.5">{"Trần Đức Nam"}</span></div><span className="inline-flex items-center px-2.5 py-1 rounded-full bg-status-amber-bg text-status-amber-dark border border-amber-200 text-xs font-semibold">{"Chưa xác nhận"}</span></div><div className="p-3.5 rounded-xl bg-surface-alt border border-border-light flex items-center justify-between"><div className="flex flex-col"><span className="text-[10px] text-muted uppercase tracking-wider font-semibold">{"Khách thuê"}</span><span className="text-xs font-bold text-charcoal mt-0.5">{"Nguyễn Hoàng Minh"}</span></div><span className="inline-flex items-center px-2.5 py-1 rounded-full bg-status-amber-bg text-status-amber-dark border border-amber-200 text-xs font-semibold">{"Chưa xác nhận"}</span></div></div><p className="text-xs text-muted leading-relaxed bg-surface-alt p-3.5 rounded-xl border border-border-light">{"Biên bản chỉ có hiệu lực chính thức và chuyển đi khi cả Chủ xe và Khách thuê cùng hoàn tất xác nhận độc lập trên hệ thống ứng dụng CarDB. Khách thuê không xác nhận thay cho Chủ xe và ngược lại."}</p><label className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-alt hover:bg-[#FFF8F5] transition-colors cursor-pointer border border-border-light"><input className="w-4 h-4 rounded text-primary border-border-light focus:ring-0 accent-primary mt-0.5" type="checkbox"/><span className="text-xs text-charcoal font-medium leading-relaxed">{"Tôi (Nguyễn Hoàng Minh) xác nhận thông tin hiện trạng thực tế và đồng ý gửi phần xác nhận của tôi."}</span></label><div className="flex flex-col gap-2 pt-1"><div className="flex-wrap gap-y-2 flex flex-col sm:flex-row items-center justify-end gap-3"><button className="ui-action w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-surface-alt text-charcoal font-semibold text-xs sm:text-sm border border-border-light transition-all text-center shadow-xs" type="button" aria-label="Lưu bản nháp biên bản">{"Lưu bản nháp biên bản"}</button><button className="w-full sm:w-auto px-7 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group" type="button" aria-label="Xác nhận của tôi ➔"><span className="">{"Xác nhận của tôi ➔"}</span></button></div><p className="text-right text-[11px] text-muted">{"Đang chờ bên còn lại xác nhận (nếu một bên hoàn tất trước). Bàn giao chỉ hoàn tất sau khi hệ thống xác nhận đủ điều kiện và xác nhận của hai bên."}</p></div></div>
    </div>

    <div className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-24">

    <div className="rounded-2xl bg-surface border border-border-light p-5 shadow-sm flex flex-col gap-4">
    <div className="flex items-center justify-between border-b border-border-light pb-3">
    <h3 className="text-sm font-bold text-charcoal">{"\n              Thông tin đơn thuê\n            "}</h3>
    <span className="text-[11px] font-mono text-muted bg-badge-gray px-2 py-0.5 rounded border border-border-light">{"CDB-ORD-20261026-904"}</span>
    </div>
    <div className="flex flex-col gap-3 text-xs">
    <div className="flex items-center justify-between">
    <span className="text-muted">{"Dòng xe"}</span>
    <span className="text-charcoal font-bold text-right">{"VinFast VF 9 Plus"}</span>
    </div>
    <div className="flex items-start justify-between">
    <span className="text-muted">{"Thời gian nhận"}</span>
    <span className="text-charcoal font-medium text-right">{"08:00, 26/10/2026"}</span>
    </div>
    <div className="flex items-start justify-between">
    <span className="text-muted">{"Thời gian trả"}</span>
    <span className="text-charcoal font-medium text-right">{"08:00, 28/10/2026"}</span>
    </div>
    <div className="flex items-center justify-between">
    <span className="text-muted">{"Thời lượng"}</span>
    <span className="text-charcoal font-medium">{"2 ngày trọn gói"}</span>
    </div>
    <div className="pt-3 border-t border-border-light flex items-center justify-between">
    <div>
    <span className="text-muted block text-[11px]">{"Tổng tiền thuê xe"}</span>
    <span className="ui-money text-base font-bold text-charcoal">{"3.700.000 đ"}</span>
    </div>
    <div className="text-right flex items-center gap-1.5 text-status-green text-xs font-semibold bg-status-green-bg px-2.5 py-1 rounded-full border border-green-200">
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>{"\n                Đã thanh toán\n              "}</div>
    </div>
    </div>
    </div>

    <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-5 shadow-sm flex flex-col gap-3.5 relative overflow-hidden">
    <div className="flex items-center justify-between gap-3 w-full"><h3 className="text-xs font-bold text-charcoal flex items-center gap-1.5"><svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span className="whitespace-nowrap">{"Tiền cọc thế chấp:"}</span></h3><span className="ui-money font-mono text-primary font-bold text-sm whitespace-nowrap shrink-0 text-right">{"15.000.000 đ"}</span></div>

    <div className="p-3 rounded-xl bg-white/80 border border-[#FDE68A] flex items-start gap-2.5">
    <svg className="w-4 h-4 text-status-amber-dark shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>
    <div className="flex flex-col">
    <span className="text-xs font-bold text-status-amber-dark">{"Chưa ghi nhận thu cọc"}</span>
    <p className="text-[11px] text-charcoal mt-1 leading-relaxed">{"Tiền cọc thế chấp được chủ xe kiểm tra và xác thực độc lập tại thời điểm giao xe. Hệ thống chỉ ghi nhận 'Đã thu cọc' khi có xác nhận giao dịch từ backend hoặc xác nhận từ phía Chủ xe. Khách thuê không tự ý xác nhận thu cọc thay."}</p>
    </div>
    </div>
    </div>

    <div className="rounded-2xl bg-surface-alt border border-border-light p-5 shadow-sm flex flex-col gap-3.5">
    <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">{"\n            TIẾN ĐỘ HOÀN TẤT BIÊN BẢN\n          "}</h3>
    <div className="flex flex-col gap-2.5 text-xs"><div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-border-light"><span className="flex items-center gap-2 text-charcoal font-medium"><svg className="w-4 h-4 text-status-green stroke-current" fill="none" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>{"Tiền thuê xe"}</span><span className="text-status-green font-semibold text-[11px]">{"Đã thanh toán (3.7M)"}</span></div><div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-border-light"><span className="flex items-center gap-2 text-charcoal font-medium"><svg className="w-4 h-4 text-status-amber-dark stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path></svg>{"Số km & Mức pin EV"}</span><span className="text-status-amber font-semibold text-[11px]">{"Chờ đối soát"}</span></div><div className="flex items-center justify-between gap-2 w-full p-2.5 rounded-lg bg-white border border-border-light"><span className="flex items-center gap-2 text-charcoal font-medium"><svg className="w-4 h-4 text-muted stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path></svg>{"Hình ảnh hiện trạng (6 góc)"}</span><span className="text-muted font-semibold text-[11px] text-right shrink-0 ml-auto whitespace-nowrap">{"Chưa hoàn tất (0/6)"}</span></div><div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-border-light"><span className="flex items-center gap-2 text-charcoal font-medium"><svg className="w-4 h-4 text-status-amber-dark stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path></svg>{"Tiền cọc thế chấp"}</span><span className="text-status-amber-dark font-semibold text-[11px]">{"Chưa ghi nhận"}</span></div><div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-border-light"><span className="flex items-center gap-2 text-muted"><svg className="w-4 h-4 text-muted stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round"></path></svg>{"Xác nhận hai bên"}</span><span className="text-muted font-medium text-[11px]">{"Chưa hoàn tất"}</span></div></div>

    <div className="mt-1 p-3 rounded-xl bg-white border border-border-light flex items-center justify-between shadow-xs">
    <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-lg bg-[#FFF8F5] text-primary flex items-center justify-center border border-primary/20">
    <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
    </div>
    <div>
    <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">{"Thanh tra & Bàn giao"}</span>
    <span className="text-xs font-bold text-primary">{"1900 8899"}</span>
    </div>
    </div>
    <span className="text-[10px] text-muted font-semibold px-2 py-0.5 rounded bg-badge-gray border border-border-light">{"Miễn cước 24/7"}</span>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div></main></div>);
}
