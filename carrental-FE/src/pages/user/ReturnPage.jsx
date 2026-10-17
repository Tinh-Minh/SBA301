import { Link } from "react-router";
export default function ReturnPage() {
    return (<div className="cardb-screen screen-return bg-section-bg font-['Be_Vietnam_Pro'] text-text-primary antialiased selection:bg-brand-accent selection:text-white"><main className="w-full  bg-section-bg min-h-[calc(100vh-80px)] pt-20"><div className="flex flex-col w-full pb-16">

    <div className="w-full px-margin-sm md:px-margin py-space-lg flex flex-col gap-space-lg">

    <div className="flex flex-col gap-space-xs">
    <nav className="flex items-center gap-space-xs text-text-secondary text-sm">
    <Link className="hover:text-brand-accent transition-colors" to="/chuyen-xe-cua-toi">{"Chuyến xe của tôi"}</Link>
    <span className="material-symbols-outlined text-[14px]">{"chevron_right"}</span>
    <Link className="hover:text-brand-accent transition-colors" to="/xe/vinfast-vf8-plus-2024">{"Chi tiết đơn thuê"}</Link>
    <span className="material-symbols-outlined text-[14px]">{"chevron_right"}</span>
    <span className="text-brand-accent font-medium">{"Bàn giao trả xe"}</span>
    </nav>
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mt-space-xs">
    <div className="flex flex-col gap-1">
    <div className="flex items-center gap-space-sm">
    <h1 className="text-2xl md:text-[28px] font-bold text-text-primary tracking-tight">{"Biên bản bàn giao trả xe"}</h1>
    <span className="px-2.5 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent font-mono text-xs font-bold border border-brand-accent/20">{"C10-B"}</span>
    </div>
    <p className="text-sm md:text-base text-text-secondary">{"\n            Đối chiếu hiện trạng xe, kiểm tra các khoản phát sinh và xác nhận hoàn tất bàn giao.\n          "}</p>
    </div>

    <div className="flex flex-wrap items-center gap-space-sm">
    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-light text-info-blue text-xs font-semibold">
    <span className="w-2 h-2 rounded-full bg-info-blue"></span>{"\n            Đang thuê\n          "}</div>
    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-light text-success-green text-xs font-semibold">
    <span className="material-symbols-outlined text-[16px]">{"check_circle"}</span>{"\n            Tiền thuê đã thanh toán\n          "}</div>
    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-status-amber-bg text-status-amber text-xs font-semibold">
    <span className="w-2 h-2 rounded-full bg-status-amber animate-pulse"></span>{"\n            Đang kiểm tra trả xe\n          "}</div>
    </div>
    </div>
    </div>

    <div className="w-full bg-page-bg rounded-2xl p-space-md border border-border-light shadow-sm">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">

    <div className="flex items-center gap-space-sm">
    <div className="w-8 h-8 rounded-full bg-emerald-light text-success-green flex items-center justify-center font-bold">
    <span className="material-symbols-outlined text-[18px]">{"check"}</span>
    </div>
    <div className="flex flex-col min-w-0">
    <span className="text-[11px] text-text-secondary uppercase font-semibold">{"Bước 1"}</span>
    <span className="text-sm font-semibold text-text-primary truncate">{"Gửi yêu cầu"}</span>
    </div>
    </div>

    <div className="flex items-center gap-space-sm">
    <div className="w-8 h-8 rounded-full bg-emerald-light text-success-green flex items-center justify-center font-bold">
    <span className="material-symbols-outlined text-[18px]">{"check"}</span>
    </div>
    <div className="flex flex-col min-w-0">
    <span className="text-[11px] text-text-secondary uppercase font-semibold">{"Bước 2"}</span>
    <span className="text-sm font-semibold text-text-primary truncate">{"Chủ xe xác nhận"}</span>
    </div>
    </div>

    <div className="flex items-center gap-space-sm">
    <div className="w-8 h-8 rounded-full bg-emerald-light text-success-green flex items-center justify-center font-bold">
    <span className="material-symbols-outlined text-[18px]">{"check"}</span>
    </div>
    <div className="flex flex-col min-w-0">
    <span className="text-[11px] text-text-secondary uppercase font-semibold">{"Bước 3"}</span>
    <span className="text-sm font-semibold text-text-primary truncate">{"Thanh toán & Nhận xe"}</span>
    </div>
    </div>

    <div className="flex items-center gap-space-sm p-1.5 rounded-xl bg-brand-accent/10 border border-brand-accent/30">
    <div className="w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center font-bold shadow-sm animate-pulse">
    <span className="material-symbols-outlined text-[18px]">{"assignment_turned_in"}</span>
    </div>
    <div className="flex flex-col min-w-0">
    <span className="text-[11px] text-brand-accent font-bold uppercase">{"Bước 4 • Đang thực hiện"}</span>
    <span className="text-sm font-bold text-text-primary truncate">{"Trả xe & Hoàn cọc"}</span>
    </div>
    </div>
    </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

    <div className="lg:col-span-8 flex flex-col gap-space-lg">

    <div className="bg-page-bg rounded-2xl p-space-lg border border-border-light shadow-sm flex flex-col md:flex-row gap-space-lg items-center">
    <div className="w-full md:w-56 h-36 rounded-xl overflow-hidden bg-section-bg shrink-0 relative border border-border-light">
    <img className="w-full h-full object-cover" src="/images/cardb-acb4c1d1593467b1.webp" alt="Hình ảnh xe CarDB" loading="lazy" decoding="async"/>
    <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded bg-white/95 text-text-primary font-mono text-xs font-bold shadow-sm border border-border-light">{"51K-889.92"}</span>
    </div>
    <div className="flex flex-col justify-between w-full h-full gap-space-sm">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-xs">
    <div>
    <span className="text-xs text-brand-accent uppercase font-bold tracking-wider">{"SUV 7 Chỗ Thương Gia"}</span>
    <h2 className="text-xl md:text-2xl font-bold text-text-primary">{"VinFast VF 9 Plus AWD"}</h2>
    </div>
    <Link className="text-sm font-semibold text-brand-accent hover:underline flex items-center gap-1" to="/xe/vinfast-vf8-plus-2024">{"\n                Xem chi tiết đơn thuê\n                "}<span className="material-symbols-outlined text-[16px]">{"arrow_forward"}</span>
    </Link>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm pt-space-xs">
    <div className="flex items-center gap-space-xs text-text-secondary text-sm">
    <span className="material-symbols-outlined text-brand-accent text-[18px]">{"person"}</span>
    <span>{"Khách thuê: "}<strong className="text-text-primary">{"Nguyễn Hoàng Minh"}</strong></span>
    </div>
    <div className="flex items-center gap-space-xs text-text-secondary text-sm">
    <span className="material-symbols-outlined text-status-amber text-[18px]">{"verified"}</span>
    <span>{"Chủ xe: "}<strong className="text-text-primary">{"Trần Đức Nam ★ 5.0"}</strong></span>
    </div>
    <div className="flex items-center gap-space-xs text-text-secondary text-sm">
    <span className="material-symbols-outlined text-brand-accent text-[18px]">{"schedule"}</span>
    <span>{"Lịch trình: "}<strong className="text-text-primary">{"08:00, 26/10/2026 ➔ 08:00, 28/10/2026"}</strong></span>
    </div>
    <div className="flex items-center gap-space-xs text-text-secondary text-sm">
    <span className="material-symbols-outlined text-success-green text-[18px]">{"location_on"}</span>
    <span className="truncate">{"128 Thảo Điền, P. Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh"}</span>
    </div>
    </div>
    <div className="p-2.5 rounded-xl bg-section-bg border border-border-light flex items-center gap-space-sm text-sm text-text-primary">
    <span className="w-2.5 h-2.5 rounded-full bg-success-green animate-ping"></span>
    <span>{"Thời điểm kiểm tra thực tế: "}<strong className="text-brand-accent font-semibold">{"Đang tiến hành đối chiếu tại bãi xe"}</strong></span>
    </div>
    </div>
    </div>

    <div className="bg-page-bg rounded-2xl p-space-lg border border-border-light shadow-sm flex flex-col gap-space-md">
    <div className="flex items-center justify-between pb-1 border-b border-border-light">
    <div className="flex items-center gap-space-sm">
    <span className="material-symbols-outlined text-brand-accent text-[24px]">{"compare_arrows"}</span>
    <h2 className="text-lg md:text-xl font-bold text-text-primary">{"Đối chiếu tình trạng xe"}</h2>
    </div>
    <span className="text-xs text-text-secondary font-medium">{"Căn cứ biên bản giao xe C10-A"}</span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">

    <div className="bg-section-bg rounded-xl p-space-md border border-border-light flex flex-col gap-space-md">
    <div className="flex items-center justify-between pb-space-xs border-b border-border-light">
    <span className="text-xs uppercase tracking-wider font-bold text-text-secondary flex items-center gap-1.5">
    <span className="material-symbols-outlined text-[18px] text-text-secondary">{"lock"}</span>{"\n                  Khi nhận xe (C10-A)\n                "}</span>
    <span className="px-2 py-0.5 rounded bg-white text-text-secondary text-xs font-semibold border border-border-light whitespace-nowrap">{"Đã khóa"}</span>
    </div>
    <div className="flex flex-col gap-1">
    <span className="text-xs text-text-secondary">{"Số km lúc nhận"}</span>
    <div className="text-text-primary font-mono text-lg font-bold bg-white px-space-md py-2 rounded-lg border border-border-light flex items-center justify-between">
    <span>{"12.450 km"}</span>
    <span className="text-xs text-text-secondary font-sans font-normal">{"Đã xác thực"}</span>
    </div>
    </div>
    <div className="flex flex-col gap-1">
    <span className="text-xs text-text-secondary">{"Mức pin lúc nhận"}</span>
    <div className="flex items-center justify-between bg-white px-space-md py-2 rounded-lg border border-border-light">
    <span className="text-text-primary font-mono text-lg font-bold">{"88%"}</span>
    <span className="text-xs text-text-secondary font-medium">{"Pin lúc nhận: 88%"}</span>
    </div>
    </div>
    <div className="flex flex-col gap-1">
    <span className="text-xs text-text-secondary">{"Ngoại thất lúc nhận"}</span>
    <div className="text-text-primary text-sm bg-white px-space-md py-2.5 rounded-lg border border-border-light flex items-center gap-2">
    <span className="material-symbols-outlined text-success-green text-[18px]">{"verified"}</span>
    <span className="truncate font-medium">{"Tốt / Không trầy xước (Sơn bóng nguyên bản)"}</span>
    </div>
    </div>
    <div className="flex flex-col gap-1">
    <span className="text-xs text-text-secondary">{"Nội thất lúc nhận"}</span>
    <div className="text-text-primary text-sm bg-white px-space-md py-2.5 rounded-lg border border-border-light flex items-center gap-2">
    <span className="material-symbols-outlined text-success-green text-[18px]">{"clean_hands"}</span>
    <span className="truncate font-medium">{"Sạch sẽ & Đạt chuẩn (Khử khuẩn mùi mới)"}</span>
    </div>
    </div>
    </div>

    <div className="bg-white rounded-xl p-space-md border-2 border-brand-accent shadow-sm flex flex-col gap-space-md">
    <div className="flex items-center justify-between pb-space-xs border-b border-brand-accent/20">
    <span className="text-xs uppercase tracking-wider font-bold text-brand-accent flex items-center gap-1.5">
    <span className="material-symbols-outlined text-[18px]">{"edit_square"}</span>{"\n                  Khi trả xe (Hiện tại)\n                "}</span>
    <span className="px-2.5 py-0.5 rounded-full bg-status-amber-bg text-status-amber text-xs font-semibold whitespace-nowrap">{"Chờ đối chiếu"}</span>
    </div>
    <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between">
    <span className="text-xs text-text-secondary">{"Số km lúc trả"}</span>
    <span className="text-brand-accent font-mono text-xs font-bold whitespace-nowrap">{"Quãng đường: 245 km"}</span>
    </div>
    <div className="relative">
    <input className="w-full bg-section-bg text-text-primary font-mono text-lg font-bold px-space-md py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-accent" type="text" aria-label="Thông tin" defaultValue="12.695 km"/>
    <span className="absolute right-3 top-2.5 text-text-secondary text-xs">{"ODO hiện tại"}</span>
    </div>
    </div>
    <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between">
    <span className="text-xs text-text-secondary">{"Mức pin lúc trả"}</span>
    <span className="text-text-secondary font-mono text-xs font-medium whitespace-nowrap">{"Pin tiêu thụ: 43%"}</span>
    </div>
    <div className="flex items-center gap-space-sm">
    <input className="w-24 bg-section-bg text-text-primary font-mono text-lg font-bold px-space-md py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-accent" type="text" aria-label="Thông tin" defaultValue="45%"/>
    <div className="flex-1 bg-emerald-light px-space-md py-2.5 rounded-lg text-success-green text-xs font-bold flex items-center justify-between">
    <span>{"Mức pin hợp lệ"}</span>
    <span className="text-sm">{"✓ Đạt yêu cầu"}</span>
    </div>
    </div>
    </div>
    <div className="flex flex-col gap-1">
    <span className="text-xs text-text-secondary">{"Đánh giá ngoại thất khi trả"}</span>
    <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-space-sm p-2 rounded-lg bg-section-bg border border-border-light cursor-pointer hover:bg-orange-50/50 transition-colors">
    <input className="accent-brand-accent w-4 h-4" name="exterior" type="radio" defaultChecked={true}/>
    <span className="text-sm font-medium text-text-primary">{"Không phát sinh trầy xước mới"}</span>
    </label>
    <label className="flex items-center gap-space-sm p-2 rounded-lg bg-white border border-border-light cursor-pointer hover:bg-section-bg transition-colors">
    <input className="accent-brand-accent w-4 h-4" name="exterior" type="radio"/>
    <span className="text-sm text-text-secondary">{"Trầy xước mới (cần ảnh đối chiếu)"}</span>
    </label>
    </div>
    </div>
    <div className="flex flex-col gap-1">
    <span className="text-xs text-text-secondary">{"Vệ sinh & Nội thất khi trả"}</span>
    <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-space-sm p-2 rounded-lg bg-section-bg border border-border-light cursor-pointer hover:bg-orange-50/50 transition-colors">
    <input className="accent-brand-accent w-4 h-4" name="interior" type="radio" defaultChecked={true}/>
    <span className="text-sm font-medium text-text-primary">{"Sạch sẽ nguyên vẹn"}</span>
    </label>
    <label className="flex items-center gap-space-sm p-2 rounded-lg bg-white border border-border-light cursor-pointer hover:bg-section-bg transition-colors">
    <input className="accent-brand-accent w-4 h-4" name="interior" type="radio"/>
    <span className="text-sm text-text-secondary">{"Bụi bẩn nhẹ thông thường (Miễn phí)"}</span>
    </label>
    </div>
    </div>
    </div>
    </div>
    </div>

    <div className="bg-page-bg rounded-2xl p-space-lg border border-border-light shadow-sm flex flex-col gap-space-md">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-1 border-b border-border-light">
    <div className="flex items-center gap-space-sm">
    <span className="material-symbols-outlined text-brand-accent text-[24px]">{"inventory_2"}</span>
    <h2 className="text-lg md:text-xl font-bold text-text-primary">{"Đối chiếu phụ kiện và giấy tờ hoàn trả"}</h2>
    </div>
    <span className="px-space-md py-1 rounded-full bg-emerald-light text-success-green text-xs font-bold whitespace-nowrap">{"\n            6 / 6 mục đã kiểm tra đủ\n          "}</span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">

    <div className="p-space-md rounded-xl bg-section-bg border border-border-light flex items-center justify-between gap-space-sm">
    <div className="flex items-center gap-space-sm min-w-0">
    <input className="w-4 h-4 accent-success-green rounded" type="checkbox" defaultChecked={true}/>
    <span className="text-sm text-text-primary font-medium truncate">{"Giấy đăng ký xe (Bản sao công chứng)"}</span>
    </div>
    <span className="px-2 py-0.5 rounded bg-emerald-light text-success-green text-xs font-bold whitespace-nowrap">{"Đã nhận đủ"}</span>
    </div>

    <div className="p-space-md rounded-xl bg-section-bg border border-border-light flex items-center justify-between gap-space-sm">
    <div className="flex items-center gap-space-sm min-w-0">
    <input className="w-4 h-4 accent-success-green rounded" type="checkbox" defaultChecked={true}/>
    <span className="text-sm text-text-primary font-medium truncate">{"Giấy chứng nhận kiểm định an toàn"}</span>
    </div>
    <span className="px-2 py-0.5 rounded bg-emerald-light text-success-green text-xs font-bold whitespace-nowrap">{"Đã nhận đủ"}</span>
    </div>

    <div className="p-space-md rounded-xl bg-section-bg border border-border-light flex items-center justify-between gap-space-sm">
    <div className="flex items-center gap-space-sm min-w-0">
    <input className="w-4 h-4 accent-success-green rounded" type="checkbox" defaultChecked={true}/>
    <span className="text-sm text-text-primary font-medium truncate">{"Bảo hiểm TNDS & Vật chất 2 chiều"}</span>
    </div>
    <span className="px-2 py-0.5 rounded bg-emerald-light text-success-green text-xs font-bold whitespace-nowrap">{"Đã nhận đủ"}</span>
    </div>

    <div className="p-space-md rounded-xl bg-section-bg border border-border-light flex items-center justify-between gap-space-sm">
    <div className="flex items-center gap-space-sm min-w-0">
    <input className="w-4 h-4 accent-success-green rounded" type="checkbox" defaultChecked={true}/>
    <span className="text-sm text-text-primary font-medium truncate">{"Bộ cáp sạc di động & Adapter VinFast"}</span>
    </div>
    <span className="px-2 py-0.5 rounded bg-emerald-light text-success-green text-xs font-bold whitespace-nowrap">{"Đã nhận đủ"}</span>
    </div>

    <div className="p-space-md rounded-xl bg-section-bg border border-border-light flex items-center justify-between gap-space-sm">
    <div className="flex items-center gap-space-sm min-w-0">
    <input className="w-4 h-4 accent-success-green rounded" type="checkbox" defaultChecked={true}/>
    <span className="text-sm text-text-primary font-medium truncate">{"Chìa khóa thông minh Smartkey (01 chiếc)"}</span>
    </div>
    <span className="px-2 py-0.5 rounded bg-emerald-light text-success-green text-xs font-bold whitespace-nowrap">{"Đã nhận đủ"}</span>
    </div>

    <div className="p-space-md rounded-xl bg-section-bg border border-border-light flex items-center justify-between gap-space-sm">
    <div className="flex items-center gap-space-sm min-w-0">
    <input className="w-4 h-4 accent-success-green rounded" type="checkbox" defaultChecked={true}/>
    <span className="text-sm text-text-primary font-medium truncate">{"Bộ lốp khẩn cấp, bơm điện & Tam giác"}</span>
    </div>
    <span className="px-2 py-0.5 rounded bg-emerald-light text-success-green text-xs font-bold whitespace-nowrap">{"Đã nhận đủ"}</span>
    </div>
    </div>
    </div>

    <div className="bg-page-bg rounded-2xl p-space-lg border border-border-light shadow-sm flex flex-col gap-space-md">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-1 border-b border-border-light">
    <div className="flex items-center gap-space-sm">
    <span className="material-symbols-outlined text-brand-accent text-[24px]">{"photo_camera"}</span>
    <h2 className="text-lg md:text-xl font-bold text-text-primary">{"Hình ảnh hiện trạng khi trả xe"}</h2>
    </div>
    <span className="px-space-md py-1 rounded-full bg-emerald-light text-success-green text-xs font-bold whitespace-nowrap">{"\n            6 / 6 ảnh đã tải lên\n          "}</span>
    </div>
    <p className="text-sm text-text-secondary">{"\n          Tải lên 6 góc chụp đối chứng thực tế khi hoàn trả để đối chiếu với ảnh biên bản nhận xe C10-A.\n        "}</p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">

    <div className="bg-section-bg rounded-xl p-space-md flex flex-col items-center justify-center text-center gap-space-sm group hover:border-brand-accent border border-border-light transition-all min-h-[170px]">
    <div className="w-12 h-12 rounded-full bg-white border border-border-light flex items-center justify-center text-success-green shadow-sm">
    <span className="material-symbols-outlined text-[24px]">{"check_circle"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-sm text-text-primary font-bold">{"1. Phía trước xe"}</span>
    <span className="text-xs text-success-green font-semibold mt-0.5">{"Đã tải lên"}</span>
    </div>
    <button className="mt-1 text-xs text-text-secondary hover:text-brand-accent underline" type="button" aria-label="Xem ảnh bàn giao cũ" data-action="preview-image">{"Xem ảnh bàn giao cũ"}</button>
    </div>

    <div className="bg-section-bg rounded-xl p-space-md flex flex-col items-center justify-center text-center gap-space-sm group hover:border-brand-accent border border-border-light transition-all min-h-[170px]">
    <div className="w-12 h-12 rounded-full bg-white border border-border-light flex items-center justify-center text-success-green shadow-sm">
    <span className="material-symbols-outlined text-[24px]">{"check_circle"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-sm text-text-primary font-bold">{"2. Phía sau xe"}</span>
    <span className="text-xs text-success-green font-semibold mt-0.5">{"Đã tải lên"}</span>
    </div>
    <button className="mt-1 text-xs text-text-secondary hover:text-brand-accent underline" type="button" aria-label="Xem ảnh bàn giao cũ" data-action="preview-image">{"Xem ảnh bàn giao cũ"}</button>
    </div>

    <div className="bg-section-bg rounded-xl p-space-md flex flex-col items-center justify-center text-center gap-space-sm group hover:border-brand-accent border border-border-light transition-all min-h-[170px]">
    <div className="w-12 h-12 rounded-full bg-white border border-border-light flex items-center justify-center text-success-green shadow-sm">
    <span className="material-symbols-outlined text-[24px]">{"check_circle"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-sm text-text-primary font-bold">{"3. Thân xe bên trái"}</span>
    <span className="text-xs text-success-green font-semibold mt-0.5">{"Đã tải lên"}</span>
    </div>
    <button className="mt-1 text-xs text-text-secondary hover:text-brand-accent underline" type="button" aria-label="Xem ảnh bàn giao cũ" data-action="preview-image">{"Xem ảnh bàn giao cũ"}</button>
    </div>

    <div className="bg-section-bg rounded-xl p-space-md flex flex-col items-center justify-center text-center gap-space-sm group hover:border-brand-accent border border-border-light transition-all min-h-[170px]">
    <div className="w-12 h-12 rounded-full bg-white border border-border-light flex items-center justify-center text-success-green shadow-sm">
    <span className="material-symbols-outlined text-[24px]">{"check_circle"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-sm text-text-primary font-bold">{"4. Thân xe bên phải"}</span>
    <span className="text-xs text-success-green font-semibold mt-0.5">{"Đã tải lên"}</span>
    </div>
    <button className="mt-1 text-xs text-text-secondary hover:text-brand-accent underline" type="button" aria-label="Xem ảnh bàn giao cũ" data-action="preview-image">{"Xem ảnh bàn giao cũ"}</button>
    </div>

    <div className="bg-section-bg rounded-xl p-space-md flex flex-col items-center justify-center text-center gap-space-sm group hover:border-brand-accent border border-border-light transition-all min-h-[170px]">
    <div className="w-12 h-12 rounded-full bg-white border border-border-light flex items-center justify-center text-success-green shadow-sm">
    <span className="material-symbols-outlined text-[24px]">{"check_circle"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-sm text-text-primary font-bold">{"5. Nội thất & Ghế ngồi"}</span>
    <span className="text-xs text-success-green font-semibold mt-0.5">{"Đã tải lên"}</span>
    </div>
    <button className="mt-1 text-xs text-text-secondary hover:text-brand-accent underline" type="button" aria-label="Xem ảnh bàn giao cũ" data-action="preview-image">{"Xem ảnh bàn giao cũ"}</button>
    </div>

    <div className="bg-section-bg rounded-xl p-space-md flex flex-col items-center justify-center text-center gap-space-sm group hover:border-brand-accent border border-border-light transition-all min-h-[170px]">
    <div className="w-12 h-12 rounded-full bg-white border border-border-light flex items-center justify-center text-success-green shadow-sm">
    <span className="material-symbols-outlined text-[24px]">{"check_circle"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-sm text-text-primary font-bold">{"6. Taplo ODO & Pin EV"}</span>
    <span className="text-xs text-success-green font-semibold mt-0.5">{"Đã tải lên"}</span>
    </div>
    <button className="mt-1 text-xs text-text-secondary hover:text-brand-accent underline" type="button" aria-label="Xem ảnh bàn giao cũ" data-action="preview-image">{"Xem ảnh bàn giao cũ"}</button>
    </div>
    </div>
    </div>

    <div className="bg-page-bg rounded-2xl p-space-lg border border-border-light shadow-sm flex flex-col gap-space-md">
    <div className="flex-wrap gap-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-1 border-b border-border-light">
    <div className="flex items-center gap-space-sm">
    <span className="material-symbols-outlined text-brand-accent text-[24px]">{"receipt_long"}</span>
    <h2 className="text-lg md:text-xl font-bold text-text-primary">{"Phí phát sinh và đối soát"}</h2>
    </div>
    <button className="ui-action px-space-md py-1.5 rounded-lg bg-section-bg hover:bg-border-light text-text-primary text-xs font-semibold border border-border-light transition-colors flex items-center gap-1.5 self-start sm:self-auto" type="button" aria-label="Yêu cầu xem xét khoản phí" data-route="/tranh-chap">
    <span className="material-symbols-outlined text-status-amber text-[18px]">{"gavel"}</span>{"\n            Yêu cầu xem xét khoản phí\n          "}</button>
    </div>

    <div className="overflow-x-auto bg-section-bg rounded-xl border border-border-light">
    <div className="p-space-lg flex flex-col items-center justify-center gap-space-xs py-space-md text-center">
    <div className="w-12 h-12 rounded-full bg-emerald-light text-success-green flex items-center justify-center mb-1">
    <span className="material-symbols-outlined text-[30px]">{"check_circle"}</span>
    </div>
    <span className="text-lg font-bold text-success-green">{"✓ Chưa ghi nhận phí phát sinh"}</span>
    <div className="flex flex-wrap justify-center gap-space-md text-text-secondary text-sm mt-1">
    <span>{"Biểu phí quá giờ: "}<strong className="ui-money text-text-primary">{"0 đ"}</strong></span>
    <span>{"•"}</span>
    <span>{"Phụ trội km: "}<strong className="ui-money text-text-primary">{"0 đ"}</strong></span>
    <span>{"•"}</span>
    <span>{"Phí vệ sinh: "}<strong className="ui-money text-text-primary">{"0 đ"}</strong></span>
    <span>{"•"}</span>
    <span>{"Thiệt hại: "}<strong className="text-text-primary">{"Không có"}</strong></span>
    </div>
    </div>
    </div>

    <div className="p-space-md rounded-xl bg-section-bg border border-border-light flex items-start gap-space-sm text-text-secondary text-xs">
    <span className="material-symbols-outlined text-brand-accent text-[20px] shrink-0 mt-0.5">{"info"}</span>
    <span>{"Hệ thống CarDB không tự ý đặt phí phạt. Mọi khoản khấu trừ (nếu có) phải dựa trên biên bản thỏa thuận và chứng cứ minh bạch."}</span>
    </div>
    </div>

    <div className="bg-page-bg rounded-2xl p-space-lg border border-border-light shadow-sm flex flex-col gap-space-md">
    <div className="flex items-center gap-space-sm pb-1 border-b border-border-light">
    <span className="material-symbols-outlined text-brand-accent text-[24px]">{"verified_user"}</span>
    <h2 className="text-lg md:text-xl font-bold text-text-primary">{"Xác nhận bàn giao trả xe"}</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">

    <div className="p-space-md rounded-xl bg-section-bg border border-border-light flex items-center justify-between">
    <div className="flex items-center gap-space-sm">
    <div className="w-10 h-10 rounded-full bg-white border border-border-light flex items-center justify-center text-brand-accent">
    <span className="material-symbols-outlined text-[20px]">{"directions_car"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-xs text-text-secondary">{"Chủ xe đối tác"}</span>
    <span className="text-sm font-bold text-text-primary">{"Trần Đức Nam"}</span>
    </div>
    </div>
    <span className="px-space-sm py-1 rounded-full bg-status-amber-bg text-status-amber text-xs font-semibold flex items-center gap-1 border border-status-amber/20">
    <span className="material-symbols-outlined text-[14px]">{"hourglass_empty"}</span>{"\n              Chờ xác nhận\n            "}</span>
    </div>

    <div className="p-space-md rounded-xl bg-section-bg border border-border-light flex items-center justify-between">
    <div className="flex items-center gap-space-sm">
    <div className="w-10 h-10 rounded-full bg-white border border-border-light flex items-center justify-center text-success-green">
    <span className="material-symbols-outlined text-[20px]">{"person"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-xs text-text-secondary">{"Khách thuê"}</span>
    <span className="text-sm font-bold text-text-primary">{"Nguyễn Hoàng Minh"}</span>
    </div>
    </div>
    <span className="px-space-sm py-1 rounded-full bg-status-amber-bg text-status-amber text-xs font-semibold flex items-center gap-1 border border-status-amber/20">
    <span className="material-symbols-outlined text-[14px]">{"hourglass_empty"}</span>{"\n              Chờ xác nhận\n            "}</span>
    </div>
    </div>
    <p className="text-xs text-text-secondary">{"\n          Biên bản bàn giao trả xe chỉ hoàn tất khi cả Chủ xe và Khách thuê hoàn tất xác nhận độc lập trên ứng dụng CarDB. Khách thuê không xác nhận thay cho Chủ xe và ngược lại.\n        "}</p>

    <label className="flex items-start gap-space-sm p-space-md rounded-xl bg-section-bg border border-border-light cursor-pointer hover:bg-orange-50/40 transition-colors">
    <input className="accent-brand-accent w-5 h-5 rounded mt-0.5" type="checkbox" defaultChecked={true}/>
    <span className="text-sm text-text-primary">{"\n            Tôi ("}<strong className="text-brand-accent">{"Nguyễn Hoàng Minh"}</strong>{") xác nhận thông tin hiện trạng thực tế khi trả xe và đồng ý gửi phần xác nhận của tôi.\n          "}</span>
    </label>

    <div className="flex-wrap gap-y-2 flex flex-col sm:flex-row items-center justify-end gap-space-md pt-space-xs">
    <button className="ui-action w-full sm:w-auto px-space-lg py-2.5 rounded-xl bg-white hover:bg-section-bg text-text-primary font-bold text-sm border border-border-light transition-colors flex items-center justify-center gap-2" type="button" aria-label="Lưu bản nháp biên bản">
    <span className="material-symbols-outlined text-[18px]">{"save"}</span>{"\n            Lưu bản nháp biên bản\n          "}</button>
    <button className="w-full sm:w-auto px-space-xl py-3 rounded-xl bg-brand-accent hover:bg-primary-hover text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2" type="button" aria-label="Xác nhận của tôi">
    <span>{"Xác nhận của tôi"}</span>
    <span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
    </button>
    </div>
    <div className="p-space-sm rounded-xl bg-section-bg border border-border-light text-center text-text-secondary text-xs">{"\n          Đang chờ bên còn lại xác nhận (nếu một bên hoàn tất trước). Đơn thuê chuyển sang Hoàn tất và kích hoạt hoàn cọc sau khi hai bên ký nhận.\n        "}</div>
    </div>
    </div>

    <div className="lg:col-span-4 flex flex-col gap-space-lg sticky top-24">

    <div className="bg-page-bg rounded-2xl p-space-lg border border-border-light shadow-sm flex flex-col gap-space-md">
    <div className="flex items-center justify-between pb-space-xs border-b border-border-light">
    <h3 className="font-bold text-base text-text-primary">{"Thông tin đơn thuê"}</h3>
    <span className="px-2 py-0.5 rounded-full bg-blue-light text-info-blue font-mono text-xs font-bold">{"Đang thuê"}</span>
    </div>
    <div className="flex flex-col gap-space-sm text-sm">
    <div className="flex items-center justify-between py-1 border-b border-border-light/60">
    <span className="text-text-secondary">{"Mã đơn hàng"}</span>
    <span className="text-text-primary font-mono font-bold">{"CDB-ORD-20261026-904"}</span>
    </div>
    <div className="flex items-center justify-between py-1 border-b border-border-light/60">
    <span className="text-text-secondary">{"Dòng xe"}</span>
    <span className="text-text-primary font-semibold">{"VinFast VF 9 Plus AWD"}</span>
    </div>
    <div className="flex items-center justify-between py-1 border-b border-border-light/60">
    <span className="text-text-secondary">{"Thời gian nhận"}</span>
    <span className="text-text-primary">{"08:00, 26/10/2026"}</span>
    </div>
    <div className="flex items-center justify-between py-1 border-b border-border-light/60">
    <span className="text-text-secondary">{"Thời gian trả"}</span>
    <span className="text-text-primary">{"08:00, 28/10/2026"}</span>
    </div>
    <div className="flex items-center justify-between py-1">
    <span className="text-text-secondary">{"Thời lượng thuê"}</span>
    <span className="text-text-primary font-medium">{"2 ngày trọn gói"}</span>
    </div>
    <div className="flex items-center justify-between py-2 mt-1 bg-emerald-light px-space-md rounded-xl">
    <span className="text-success-green font-semibold text-xs uppercase">{"Tiền thuê đã trả"}</span>
    <span className="text-success-green font-bold text-base whitespace-nowrap">{"3.700.000 đ (✓)"}</span>
    </div>
    </div>
    </div>

    <div className="bg-page-bg rounded-2xl p-space-lg border-2 border-success-green shadow-sm flex flex-col gap-space-md">
    <div className="flex items-center justify-between pb-space-xs border-b border-border-light">
    <h3 className="font-bold text-base text-text-primary">{"Đối soát & Quyết toán tiền cọc"}</h3>
    <span className="material-symbols-outlined text-success-green text-[22px]">{"account_balance_wallet"}</span>
    </div>
    <div className="flex flex-col gap-space-sm text-sm">
    <div className="flex items-center justify-between">
    <span className="text-text-secondary">{"Tiền cọc đã ghi nhận"}</span>
    <span className="ui-money text-text-primary font-bold whitespace-nowrap">{"15.000.000 đ"}</span>
    </div>
    <div className="flex items-center justify-between">
    <span className="text-text-secondary">{"Khấu trừ đã xác nhận"}</span>
    <span className="ui-money text-text-secondary font-semibold whitespace-nowrap">{"0 đ"}</span>
    </div>
    <div className="flex items-center justify-between">
    <span className="text-text-secondary">{"Khấu trừ quá giờ / vi phạm"}</span>
    <span className="ui-money text-text-secondary whitespace-nowrap">{"0 đ"}</span>
    </div>

    <div className="p-space-md rounded-xl bg-emerald-light border border-success-green/30 flex flex-col gap-1 mt-space-xs">
    <span className="text-[11px] text-success-green font-bold uppercase tracking-wider">{"TIỀN CỌC SẼ HOÀN TRẢ"}</span>
    <div className="flex flex-wrap items-center justify-between gap-2">
    <span className="ui-money text-2xl font-bold text-success-green tracking-tight whitespace-nowrap">{"\n              15.000.000 đ\n            "}</span>
    <span className="px-2.5 py-0.5 rounded-full bg-white text-success-green text-xs font-bold border border-success-green/30 whitespace-nowrap">{"100% hoàn lại"}</span>
    </div>
    </div>

    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-section-bg border border-border-light text-xs font-semibold">
    <span className="text-text-secondary">{"Trạng thái hoàn cọc:"}</span>
    <span className="px-2.5 py-1 rounded-full bg-status-amber-bg text-status-amber text-xs whitespace-nowrap flex items-center gap-1 border border-status-amber/20">
    <span className="material-symbols-outlined text-[14px]">{"hourglass_empty"}</span>{"\n              Chưa thực hiện\n            "}</span>
    </div>
    <p className="text-[11px] text-text-secondary leading-relaxed">{"\n          Số tiền hoàn cọc 15tr sẽ được xác định hoàn trả đối soát trực tiếp giữa hai bên hoặc thông qua hỗ trợ của quản trị viên.\n        "}</p>
    </div>
    </div>

    <div className="bg-page-bg rounded-2xl p-space-lg border border-border-light shadow-sm flex flex-col gap-space-md">
    <div className="flex items-center justify-between pb-space-xs border-b border-border-light">
    <div className="flex items-center gap-space-sm">
    <span className="material-symbols-outlined text-brand-accent text-[20px]">{"checklist"}</span>
    <h3 className="font-bold text-base text-text-primary">{"Tiến độ hoàn tất thủ tục trả xe"}</h3>
    </div>
    <span className="px-2.5 py-0.5 rounded-full bg-emerald-light text-success-green text-xs font-bold whitespace-nowrap">{"4 / 5"}</span>
    </div>
    <div className="flex flex-col gap-space-sm text-xs">
    <div className="p-space-sm rounded-xl bg-section-bg border border-border-light flex items-center justify-between gap-2">
    <div className="flex items-center gap-2 min-w-0">
    <span className="w-2 h-2 rounded-full bg-success-green shrink-0"></span>
    <span className="text-text-primary font-medium truncate">{"1. Đối chiếu km và pin"}</span>
    </div>
    <span className="px-2 py-0.5 rounded bg-emerald-light text-success-green font-bold whitespace-nowrap">{"Đã xác nhận"}</span>
    </div>
    <div className="p-space-sm rounded-xl bg-section-bg border border-border-light flex items-center justify-between gap-2">
    <div className="flex items-center gap-2 min-w-0">
    <span className="w-2 h-2 rounded-full bg-success-green shrink-0"></span>
    <span className="text-text-primary font-medium truncate">{"2. Kiểm tra hiện trạng xe"}</span>
    </div>
    <span className="px-2 py-0.5 rounded bg-emerald-light text-success-green font-bold whitespace-nowrap">{"Đã xác nhận"}</span>
    </div>
    <div className="p-space-sm rounded-xl bg-section-bg border border-border-light flex items-center justify-between gap-2">
    <div className="flex items-center gap-2 min-w-0">
    <span className="w-2 h-2 rounded-full bg-success-green shrink-0"></span>
    <span className="text-text-primary font-medium truncate">{"3. Hình ảnh trả xe (6 góc)"}</span>
    </div>
    <span className="px-2 py-0.5 rounded bg-emerald-light text-success-green font-bold whitespace-nowrap font-mono">{"Đã tải lên 6/6"}</span>
    </div>
    <div className="p-space-sm rounded-xl bg-section-bg border border-border-light flex items-center justify-between gap-2">
    <div className="flex items-center gap-2 min-w-0">
    <span className="w-2 h-2 rounded-full bg-success-green shrink-0"></span>
    <span className="text-text-primary font-medium truncate">{"4. Đối soát phí phát sinh"}</span>
    </div>
    <span className="px-2 py-0.5 rounded bg-emerald-light text-success-green font-bold whitespace-nowrap">{"Đã đối soát 0đ"}</span>
    </div>
    <div className="p-space-sm rounded-xl bg-section-bg border border-border-light flex items-center justify-between gap-2">
    <div className="flex items-center gap-2 min-w-0">
    <span className="w-2 h-2 rounded-full bg-status-amber shrink-0"></span>
    <span className="text-text-primary font-medium truncate">{"5. Xác nhận hai bên"}</span>
    </div>
    <span className="px-2 py-0.5 rounded bg-status-amber-bg text-status-amber font-bold whitespace-nowrap">{"Chưa hoàn tất"}</span>
    </div>
    </div>

    <div className="pt-space-xs border-t border-border-light flex items-center justify-between text-text-secondary text-xs">
    <div className="flex items-center gap-1.5 min-w-0">
    <span className="material-symbols-outlined text-[16px] text-brand-accent shrink-0">{"support_agent"}</span>
    <span className="truncate font-semibold uppercase text-[10px] tracking-wider text-text-primary">{"HOTLINE ĐỐI SOÁT BÀN GIAO 24/7:"}</span>
    </div>
    <span className="text-brand-accent font-bold whitespace-nowrap ml-2">{"1900 8899"}</span>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div></main></div>);
}
