import { Link } from "react-router";
import type { CSSProperties } from "react";

export default function Return() { return (<div className="cardb-screen screen-return bg-[#F7F7F5] font-['Be_Vietnam_Pro'] text-[#292929] antialiased selection:bg-[#FC6C26] selection:text-white"><main className="w-full  bg-[#F7F7F5] min-h-[calc(100vh-80px)] pt-20"><div className="flex flex-col w-full pb-16">

<div className="w-full px-margin-sm md:px-margin py-space-lg flex flex-col gap-space-lg">

<div className="flex flex-col gap-space-xs">
<nav className="flex items-center gap-space-xs text-[#666666] text-sm">
<Link className="hover:text-[#FC6C26] transition-colors" to="/chuyen-xe-cua-toi">{"Chuyến xe của tôi"}</Link>
<span className="material-symbols-outlined text-[14px]">{"chevron_right"}</span>
<Link className="hover:text-[#FC6C26] transition-colors" to="/xe/vinfast-vf8-plus-2024">{"Chi tiết đơn thuê"}</Link>
<span className="material-symbols-outlined text-[14px]">{"chevron_right"}</span>
<span className="text-[#FC6C26] font-medium">{"Bàn giao trả xe"}</span>
</nav>
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mt-space-xs">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-space-sm">
<h1 className="text-2xl md:text-[28px] font-bold text-[#292929] tracking-tight">{"Biên bản bàn giao trả xe"}</h1>
<span className="px-2.5 py-0.5 rounded-full bg-[#FC6C26]/10 text-[#FC6C26] font-mono text-xs font-bold border border-[#FC6C26]/20">{"C10-B"}</span>
</div>
<p className="text-sm md:text-base text-[#666666]">{"\n            Đối chiếu hiện trạng xe, kiểm tra các khoản phát sinh và xác nhận hoàn tất bàn giao.\n          "}</p>
</div>

<div className="flex flex-wrap items-center gap-space-sm">
<div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#DBEAFE] text-[#2563EB] text-xs font-semibold">
<span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>{"\n            Đang thuê\n          "}</div>
<div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#D1FAE5] text-[#10B981] text-xs font-semibold">
<span className="material-symbols-outlined text-[16px]">{"check_circle"}</span>{"\n            Tiền thuê đã thanh toán\n          "}</div>
<div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] text-[#F5A623] text-xs font-semibold">
<span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse"></span>{"\n            Đang kiểm tra trả xe\n          "}</div>
</div>
</div>
</div>

<div className="w-full bg-[#FFFFFF] rounded-2xl p-space-md border border-[#E9E9E7] shadow-sm">
<div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">

<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#10B981] flex items-center justify-center font-bold">
<span className="material-symbols-outlined text-[18px]">{"check"}</span>
</div>
<div className="flex flex-col min-w-0">
<span className="text-[11px] text-[#666666] uppercase font-semibold">{"Bước 1"}</span>
<span className="text-sm font-semibold text-[#292929] truncate">{"Gửi yêu cầu"}</span>
</div>
</div>

<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#10B981] flex items-center justify-center font-bold">
<span className="material-symbols-outlined text-[18px]">{"check"}</span>
</div>
<div className="flex flex-col min-w-0">
<span className="text-[11px] text-[#666666] uppercase font-semibold">{"Bước 2"}</span>
<span className="text-sm font-semibold text-[#292929] truncate">{"Chủ xe xác nhận"}</span>
</div>
</div>

<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#10B981] flex items-center justify-center font-bold">
<span className="material-symbols-outlined text-[18px]">{"check"}</span>
</div>
<div className="flex flex-col min-w-0">
<span className="text-[11px] text-[#666666] uppercase font-semibold">{"Bước 3"}</span>
<span className="text-sm font-semibold text-[#292929] truncate">{"Thanh toán & Nhận xe"}</span>
</div>
</div>

<div className="flex items-center gap-space-sm p-1.5 rounded-xl bg-[#FC6C26]/10 border border-[#FC6C26]/30">
<div className="w-8 h-8 rounded-full bg-[#FC6C26] text-white flex items-center justify-center font-bold shadow-sm animate-pulse">
<span className="material-symbols-outlined text-[18px]">{"assignment_turned_in"}</span>
</div>
<div className="flex flex-col min-w-0">
<span className="text-[11px] text-[#FC6C26] font-bold uppercase">{"Bước 4 • Đang thực hiện"}</span>
<span className="text-sm font-bold text-[#292929] truncate">{"Trả xe & Hoàn cọc"}</span>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

<div className="lg:col-span-8 flex flex-col gap-space-lg">

<div className="bg-[#FFFFFF] rounded-2xl p-space-lg border border-[#E9E9E7] shadow-sm flex flex-col md:flex-row gap-space-lg items-center">
<div className="w-full md:w-56 h-36 rounded-xl overflow-hidden bg-[#F7F7F5] shrink-0 relative border border-[#E9E9E7]">
<img className="w-full h-full object-cover" src="/images/cardb-acb4c1d1593467b1.webp" alt="Hình ảnh xe CarDB" loading="lazy" decoding="async" />
<span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded bg-white/95 text-[#292929] font-mono text-xs font-bold shadow-sm border border-[#E9E9E7]">{"51K-889.92"}</span>
</div>
<div className="flex flex-col justify-between w-full h-full gap-space-sm">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-space-xs">
<div>
<span className="text-xs text-[#FC6C26] uppercase font-bold tracking-wider">{"SUV 7 Chỗ Thương Gia"}</span>
<h2 className="text-xl md:text-2xl font-bold text-[#292929]">{"VinFast VF 9 Plus AWD"}</h2>
</div>
<Link className="text-sm font-semibold text-[#FC6C26] hover:underline flex items-center gap-1" to="/xe/vinfast-vf8-plus-2024">{"\n                Xem chi tiết đơn thuê\n                "}<span className="material-symbols-outlined text-[16px]">{"arrow_forward"}</span>
</Link>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm pt-space-xs">
<div className="flex items-center gap-space-xs text-[#666666] text-sm">
<span className="material-symbols-outlined text-[#FC6C26] text-[18px]">{"person"}</span>
<span>{"Khách thuê: "}<strong className="text-[#292929]">{"Nguyễn Hoàng Minh"}</strong></span>
</div>
<div className="flex items-center gap-space-xs text-[#666666] text-sm">
<span className="material-symbols-outlined text-[#F5A623] text-[18px]">{"verified"}</span>
<span>{"Chủ xe: "}<strong className="text-[#292929]">{"Trần Đức Nam ★ 5.0"}</strong></span>
</div>
<div className="flex items-center gap-space-xs text-[#666666] text-sm">
<span className="material-symbols-outlined text-[#FC6C26] text-[18px]">{"schedule"}</span>
<span>{"Lịch trình: "}<strong className="text-[#292929]">{"08:00, 26/10/2026 ➔ 08:00, 28/10/2026"}</strong></span>
</div>
<div className="flex items-center gap-space-xs text-[#666666] text-sm">
<span className="material-symbols-outlined text-[#10B981] text-[18px]">{"location_on"}</span>
<span className="truncate">{"128 Thảo Điền, P. Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh"}</span>
</div>
</div>
<div className="p-2.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center gap-space-sm text-sm text-[#292929]">
<span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping"></span>
<span>{"Thời điểm kiểm tra thực tế: "}<strong className="text-[#FC6C26] font-semibold">{"Đang tiến hành đối chiếu tại bãi xe"}</strong></span>
</div>
</div>
</div>

<div className="bg-[#FFFFFF] rounded-2xl p-space-lg border border-[#E9E9E7] shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-1 border-b border-[#E9E9E7]">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[#FC6C26] text-[24px]">{"compare_arrows"}</span>
<h2 className="text-lg md:text-xl font-bold text-[#292929]">{"Đối chiếu tình trạng xe"}</h2>
</div>
<span className="text-xs text-[#666666] font-medium">{"Căn cứ biên bản giao xe C10-A"}</span>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">

<div className="bg-[#F7F7F5] rounded-xl p-space-md border border-[#E9E9E7] flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-xs border-b border-[#E9E9E7]">
<span className="text-xs uppercase tracking-wider font-bold text-[#666666] flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px] text-[#666666]">{"lock"}</span>{"\n                  Khi nhận xe (C10-A)\n                "}</span>
<span className="px-2 py-0.5 rounded bg-white text-[#666666] text-xs font-semibold border border-[#E9E9E7] whitespace-nowrap">{"Đã khóa"}</span>
</div>
<div className="flex flex-col gap-1">
<span className="text-xs text-[#666666]">{"Số km lúc nhận"}</span>
<div className="text-[#292929] font-mono text-lg font-bold bg-white px-space-md py-2 rounded-lg border border-[#E9E9E7] flex items-center justify-between">
<span>{"12.450 km"}</span>
<span className="text-xs text-[#666666] font-sans font-normal">{"Đã xác thực"}</span>
</div>
</div>
<div className="flex flex-col gap-1">
<span className="text-xs text-[#666666]">{"Mức pin lúc nhận"}</span>
<div className="flex items-center justify-between bg-white px-space-md py-2 rounded-lg border border-[#E9E9E7]">
<span className="text-[#292929] font-mono text-lg font-bold">{"88%"}</span>
<span className="text-xs text-[#666666] font-medium">{"Pin lúc nhận: 88%"}</span>
</div>
</div>
<div className="flex flex-col gap-1">
<span className="text-xs text-[#666666]">{"Ngoại thất lúc nhận"}</span>
<div className="text-[#292929] text-sm bg-white px-space-md py-2.5 rounded-lg border border-[#E9E9E7] flex items-center gap-2">
<span className="material-symbols-outlined text-[#10B981] text-[18px]">{"verified"}</span>
<span className="truncate font-medium">{"Tốt / Không trầy xước (Sơn bóng nguyên bản)"}</span>
</div>
</div>
<div className="flex flex-col gap-1">
<span className="text-xs text-[#666666]">{"Nội thất lúc nhận"}</span>
<div className="text-[#292929] text-sm bg-white px-space-md py-2.5 rounded-lg border border-[#E9E9E7] flex items-center gap-2">
<span className="material-symbols-outlined text-[#10B981] text-[18px]">{"clean_hands"}</span>
<span className="truncate font-medium">{"Sạch sẽ & Đạt chuẩn (Khử khuẩn mùi mới)"}</span>
</div>
</div>
</div>

<div className="bg-white rounded-xl p-space-md border-2 border-[#FC6C26] shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-xs border-b border-[#FC6C26]/20">
<span className="text-xs uppercase tracking-wider font-bold text-[#FC6C26] flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px]">{"edit_square"}</span>{"\n                  Khi trả xe (Hiện tại)\n                "}</span>
<span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#F5A623] text-xs font-semibold whitespace-nowrap">{"Chờ đối chiếu"}</span>
</div>
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between">
<span className="text-xs text-[#666666]">{"Số km lúc trả"}</span>
<span className="text-[#FC6C26] font-mono text-xs font-bold whitespace-nowrap">{"Quãng đường: 245 km"}</span>
</div>
<div className="relative">
<input className="w-full bg-[#F7F7F5] text-[#292929] font-mono text-lg font-bold px-space-md py-2 rounded-lg border border-[#E9E9E7] focus:outline-none focus:ring-2 focus:ring-[#FC6C26]" type="text" aria-label="Thông tin" defaultValue="12.695 km" />
<span className="absolute right-3 top-2.5 text-[#666666] text-xs">{"ODO hiện tại"}</span>
</div>
</div>
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between">
<span className="text-xs text-[#666666]">{"Mức pin lúc trả"}</span>
<span className="text-[#666666] font-mono text-xs font-medium whitespace-nowrap">{"Pin tiêu thụ: 43%"}</span>
</div>
<div className="flex items-center gap-space-sm">
<input className="w-24 bg-[#F7F7F5] text-[#292929] font-mono text-lg font-bold px-space-md py-2 rounded-lg border border-[#E9E9E7] focus:outline-none focus:ring-2 focus:ring-[#FC6C26]" type="text" aria-label="Thông tin" defaultValue="45%" />
<div className="flex-1 bg-[#D1FAE5] px-space-md py-2.5 rounded-lg text-[#10B981] text-xs font-bold flex items-center justify-between">
<span>{"Mức pin hợp lệ"}</span>
<span className="text-sm">{"✓ Đạt yêu cầu"}</span>
</div>
</div>
</div>
<div className="flex flex-col gap-1">
<span className="text-xs text-[#666666]">{"Đánh giá ngoại thất khi trả"}</span>
<div className="flex flex-col gap-1.5">
<label className="flex items-center gap-space-sm p-2 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] cursor-pointer hover:bg-orange-50/50 transition-colors">
<input className="accent-[#FC6C26] w-4 h-4" name="exterior" type="radio" defaultChecked={true} />
<span className="text-sm font-medium text-[#292929]">{"Không phát sinh trầy xước mới"}</span>
</label>
<label className="flex items-center gap-space-sm p-2 rounded-lg bg-white border border-[#E9E9E7] cursor-pointer hover:bg-[#F7F7F5] transition-colors">
<input className="accent-[#FC6C26] w-4 h-4" name="exterior" type="radio" />
<span className="text-sm text-[#666666]">{"Trầy xước mới (cần ảnh đối chiếu)"}</span>
</label>
</div>
</div>
<div className="flex flex-col gap-1">
<span className="text-xs text-[#666666]">{"Vệ sinh & Nội thất khi trả"}</span>
<div className="flex flex-col gap-1.5">
<label className="flex items-center gap-space-sm p-2 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] cursor-pointer hover:bg-orange-50/50 transition-colors">
<input className="accent-[#FC6C26] w-4 h-4" name="interior" type="radio" defaultChecked={true} />
<span className="text-sm font-medium text-[#292929]">{"Sạch sẽ nguyên vẹn"}</span>
</label>
<label className="flex items-center gap-space-sm p-2 rounded-lg bg-white border border-[#E9E9E7] cursor-pointer hover:bg-[#F7F7F5] transition-colors">
<input className="accent-[#FC6C26] w-4 h-4" name="interior" type="radio" />
<span className="text-sm text-[#666666]">{"Bụi bẩn nhẹ thông thường (Miễn phí)"}</span>
</label>
</div>
</div>
</div>
</div>
</div>

<div className="bg-[#FFFFFF] rounded-2xl p-space-lg border border-[#E9E9E7] shadow-sm flex flex-col gap-space-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-1 border-b border-[#E9E9E7]">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[#FC6C26] text-[24px]">{"inventory_2"}</span>
<h2 className="text-lg md:text-xl font-bold text-[#292929]">{"Đối chiếu phụ kiện và giấy tờ hoàn trả"}</h2>
</div>
<span className="px-space-md py-1 rounded-full bg-[#D1FAE5] text-[#10B981] text-xs font-bold whitespace-nowrap">{"\n            6 / 6 mục đã kiểm tra đủ\n          "}</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">

<div className="p-space-md rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm min-w-0">
<input className="w-4 h-4 accent-[#10B981] rounded" type="checkbox" defaultChecked={true} />
<span className="text-sm text-[#292929] font-medium truncate">{"Giấy đăng ký xe (Bản sao công chứng)"}</span>
</div>
<span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#10B981] text-xs font-bold whitespace-nowrap">{"Đã nhận đủ"}</span>
</div>

<div className="p-space-md rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm min-w-0">
<input className="w-4 h-4 accent-[#10B981] rounded" type="checkbox" defaultChecked={true} />
<span className="text-sm text-[#292929] font-medium truncate">{"Giấy chứng nhận kiểm định an toàn"}</span>
</div>
<span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#10B981] text-xs font-bold whitespace-nowrap">{"Đã nhận đủ"}</span>
</div>

<div className="p-space-md rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm min-w-0">
<input className="w-4 h-4 accent-[#10B981] rounded" type="checkbox" defaultChecked={true} />
<span className="text-sm text-[#292929] font-medium truncate">{"Bảo hiểm TNDS & Vật chất 2 chiều"}</span>
</div>
<span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#10B981] text-xs font-bold whitespace-nowrap">{"Đã nhận đủ"}</span>
</div>

<div className="p-space-md rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm min-w-0">
<input className="w-4 h-4 accent-[#10B981] rounded" type="checkbox" defaultChecked={true} />
<span className="text-sm text-[#292929] font-medium truncate">{"Bộ cáp sạc di động & Adapter VinFast"}</span>
</div>
<span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#10B981] text-xs font-bold whitespace-nowrap">{"Đã nhận đủ"}</span>
</div>

<div className="p-space-md rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm min-w-0">
<input className="w-4 h-4 accent-[#10B981] rounded" type="checkbox" defaultChecked={true} />
<span className="text-sm text-[#292929] font-medium truncate">{"Chìa khóa thông minh Smartkey (01 chiếc)"}</span>
</div>
<span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#10B981] text-xs font-bold whitespace-nowrap">{"Đã nhận đủ"}</span>
</div>

<div className="p-space-md rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm min-w-0">
<input className="w-4 h-4 accent-[#10B981] rounded" type="checkbox" defaultChecked={true} />
<span className="text-sm text-[#292929] font-medium truncate">{"Bộ lốp khẩn cấp, bơm điện & Tam giác"}</span>
</div>
<span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#10B981] text-xs font-bold whitespace-nowrap">{"Đã nhận đủ"}</span>
</div>
</div>
</div>

<div className="bg-[#FFFFFF] rounded-2xl p-space-lg border border-[#E9E9E7] shadow-sm flex flex-col gap-space-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-1 border-b border-[#E9E9E7]">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[#FC6C26] text-[24px]">{"photo_camera"}</span>
<h2 className="text-lg md:text-xl font-bold text-[#292929]">{"Hình ảnh hiện trạng khi trả xe"}</h2>
</div>
<span className="px-space-md py-1 rounded-full bg-[#D1FAE5] text-[#10B981] text-xs font-bold whitespace-nowrap">{"\n            6 / 6 ảnh đã tải lên\n          "}</span>
</div>
<p className="text-sm text-[#666666]">{"\n          Tải lên 6 góc chụp đối chứng thực tế khi hoàn trả để đối chiếu với ảnh biên bản nhận xe C10-A.\n        "}</p>

<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">

<div className="bg-[#F7F7F5] rounded-xl p-space-md flex flex-col items-center justify-center text-center gap-space-sm group hover:border-[#FC6C26] border border-[#E9E9E7] transition-all min-h-[170px]">
<div className="w-12 h-12 rounded-full bg-white border border-[#E9E9E7] flex items-center justify-center text-[#10B981] shadow-sm">
<span className="material-symbols-outlined text-[24px]">{"check_circle"}</span>
</div>
<div className="flex flex-col">
<span className="text-sm text-[#292929] font-bold">{"1. Phía trước xe"}</span>
<span className="text-xs text-[#10B981] font-semibold mt-0.5">{"Đã tải lên"}</span>
</div>
<button className="mt-1 text-xs text-[#666666] hover:text-[#FC6C26] underline" type="button" aria-label="Xem ảnh bàn giao cũ" data-action="preview-image">{"Xem ảnh bàn giao cũ"}</button>
</div>

<div className="bg-[#F7F7F5] rounded-xl p-space-md flex flex-col items-center justify-center text-center gap-space-sm group hover:border-[#FC6C26] border border-[#E9E9E7] transition-all min-h-[170px]">
<div className="w-12 h-12 rounded-full bg-white border border-[#E9E9E7] flex items-center justify-center text-[#10B981] shadow-sm">
<span className="material-symbols-outlined text-[24px]">{"check_circle"}</span>
</div>
<div className="flex flex-col">
<span className="text-sm text-[#292929] font-bold">{"2. Phía sau xe"}</span>
<span className="text-xs text-[#10B981] font-semibold mt-0.5">{"Đã tải lên"}</span>
</div>
<button className="mt-1 text-xs text-[#666666] hover:text-[#FC6C26] underline" type="button" aria-label="Xem ảnh bàn giao cũ" data-action="preview-image">{"Xem ảnh bàn giao cũ"}</button>
</div>

<div className="bg-[#F7F7F5] rounded-xl p-space-md flex flex-col items-center justify-center text-center gap-space-sm group hover:border-[#FC6C26] border border-[#E9E9E7] transition-all min-h-[170px]">
<div className="w-12 h-12 rounded-full bg-white border border-[#E9E9E7] flex items-center justify-center text-[#10B981] shadow-sm">
<span className="material-symbols-outlined text-[24px]">{"check_circle"}</span>
</div>
<div className="flex flex-col">
<span className="text-sm text-[#292929] font-bold">{"3. Thân xe bên trái"}</span>
<span className="text-xs text-[#10B981] font-semibold mt-0.5">{"Đã tải lên"}</span>
</div>
<button className="mt-1 text-xs text-[#666666] hover:text-[#FC6C26] underline" type="button" aria-label="Xem ảnh bàn giao cũ" data-action="preview-image">{"Xem ảnh bàn giao cũ"}</button>
</div>

<div className="bg-[#F7F7F5] rounded-xl p-space-md flex flex-col items-center justify-center text-center gap-space-sm group hover:border-[#FC6C26] border border-[#E9E9E7] transition-all min-h-[170px]">
<div className="w-12 h-12 rounded-full bg-white border border-[#E9E9E7] flex items-center justify-center text-[#10B981] shadow-sm">
<span className="material-symbols-outlined text-[24px]">{"check_circle"}</span>
</div>
<div className="flex flex-col">
<span className="text-sm text-[#292929] font-bold">{"4. Thân xe bên phải"}</span>
<span className="text-xs text-[#10B981] font-semibold mt-0.5">{"Đã tải lên"}</span>
</div>
<button className="mt-1 text-xs text-[#666666] hover:text-[#FC6C26] underline" type="button" aria-label="Xem ảnh bàn giao cũ" data-action="preview-image">{"Xem ảnh bàn giao cũ"}</button>
</div>

<div className="bg-[#F7F7F5] rounded-xl p-space-md flex flex-col items-center justify-center text-center gap-space-sm group hover:border-[#FC6C26] border border-[#E9E9E7] transition-all min-h-[170px]">
<div className="w-12 h-12 rounded-full bg-white border border-[#E9E9E7] flex items-center justify-center text-[#10B981] shadow-sm">
<span className="material-symbols-outlined text-[24px]">{"check_circle"}</span>
</div>
<div className="flex flex-col">
<span className="text-sm text-[#292929] font-bold">{"5. Nội thất & Ghế ngồi"}</span>
<span className="text-xs text-[#10B981] font-semibold mt-0.5">{"Đã tải lên"}</span>
</div>
<button className="mt-1 text-xs text-[#666666] hover:text-[#FC6C26] underline" type="button" aria-label="Xem ảnh bàn giao cũ" data-action="preview-image">{"Xem ảnh bàn giao cũ"}</button>
</div>

<div className="bg-[#F7F7F5] rounded-xl p-space-md flex flex-col items-center justify-center text-center gap-space-sm group hover:border-[#FC6C26] border border-[#E9E9E7] transition-all min-h-[170px]">
<div className="w-12 h-12 rounded-full bg-white border border-[#E9E9E7] flex items-center justify-center text-[#10B981] shadow-sm">
<span className="material-symbols-outlined text-[24px]">{"check_circle"}</span>
</div>
<div className="flex flex-col">
<span className="text-sm text-[#292929] font-bold">{"6. Taplo ODO & Pin EV"}</span>
<span className="text-xs text-[#10B981] font-semibold mt-0.5">{"Đã tải lên"}</span>
</div>
<button className="mt-1 text-xs text-[#666666] hover:text-[#FC6C26] underline" type="button" aria-label="Xem ảnh bàn giao cũ" data-action="preview-image">{"Xem ảnh bàn giao cũ"}</button>
</div>
</div>
</div>

<div className="bg-[#FFFFFF] rounded-2xl p-space-lg border border-[#E9E9E7] shadow-sm flex flex-col gap-space-md">
<div className="flex-wrap gap-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-1 border-b border-[#E9E9E7]">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[#FC6C26] text-[24px]">{"receipt_long"}</span>
<h2 className="text-lg md:text-xl font-bold text-[#292929]">{"Phí phát sinh và đối soát"}</h2>
</div>
<button className="ui-action px-space-md py-1.5 rounded-lg bg-[#F7F7F5] hover:bg-[#E9E9E7] text-[#292929] text-xs font-semibold border border-[#E9E9E7] transition-colors flex items-center gap-1.5 self-start sm:self-auto" type="button" aria-label="Yêu cầu xem xét khoản phí" data-route="/tranh-chap">
<span className="material-symbols-outlined text-[#F5A623] text-[18px]">{"gavel"}</span>{"\n            Yêu cầu xem xét khoản phí\n          "}</button>
</div>

<div className="overflow-x-auto bg-[#F7F7F5] rounded-xl border border-[#E9E9E7]">
<div className="p-space-lg flex flex-col items-center justify-center gap-space-xs py-space-md text-center">
<div className="w-12 h-12 rounded-full bg-[#D1FAE5] text-[#10B981] flex items-center justify-center mb-1">
<span className="material-symbols-outlined text-[30px]">{"check_circle"}</span>
</div>
<span className="text-lg font-bold text-[#10B981]">{"✓ Chưa ghi nhận phí phát sinh"}</span>
<div className="flex flex-wrap justify-center gap-space-md text-[#666666] text-sm mt-1">
<span>{"Biểu phí quá giờ: "}<strong className="ui-money text-[#292929]">{"0 đ"}</strong></span>
<span>{"•"}</span>
<span>{"Phụ trội km: "}<strong className="ui-money text-[#292929]">{"0 đ"}</strong></span>
<span>{"•"}</span>
<span>{"Phí vệ sinh: "}<strong className="ui-money text-[#292929]">{"0 đ"}</strong></span>
<span>{"•"}</span>
<span>{"Thiệt hại: "}<strong className="text-[#292929]">{"Không có"}</strong></span>
</div>
</div>
</div>

<div className="p-space-md rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-start gap-space-sm text-[#666666] text-xs">
<span className="material-symbols-outlined text-[#FC6C26] text-[20px] shrink-0 mt-0.5">{"info"}</span>
<span>{"Hệ thống CarDB không tự ý đặt phí phạt. Mọi khoản khấu trừ (nếu có) phải dựa trên biên bản thỏa thuận và chứng cứ minh bạch."}</span>
</div>
</div>

<div className="bg-[#FFFFFF] rounded-2xl p-space-lg border border-[#E9E9E7] shadow-sm flex flex-col gap-space-md">
<div className="flex items-center gap-space-sm pb-1 border-b border-[#E9E9E7]">
<span className="material-symbols-outlined text-[#FC6C26] text-[24px]">{"verified_user"}</span>
<h2 className="text-lg md:text-xl font-bold text-[#292929]">{"Xác nhận bàn giao trả xe"}</h2>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">

<div className="p-space-md rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-white border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26]">
<span className="material-symbols-outlined text-[20px]">{"directions_car"}</span>
</div>
<div className="flex flex-col">
<span className="text-xs text-[#666666]">{"Chủ xe đối tác"}</span>
<span className="text-sm font-bold text-[#292929]">{"Trần Đức Nam"}</span>
</div>
</div>
<span className="px-space-sm py-1 rounded-full bg-[#FEF3C7] text-[#F5A623] text-xs font-semibold flex items-center gap-1 border border-[#F5A623]/20">
<span className="material-symbols-outlined text-[14px]">{"hourglass_empty"}</span>{"\n              Chờ xác nhận\n            "}</span>
</div>

<div className="p-space-md rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-white border border-[#E9E9E7] flex items-center justify-center text-[#10B981]">
<span className="material-symbols-outlined text-[20px]">{"person"}</span>
</div>
<div className="flex flex-col">
<span className="text-xs text-[#666666]">{"Khách thuê"}</span>
<span className="text-sm font-bold text-[#292929]">{"Nguyễn Hoàng Minh"}</span>
</div>
</div>
<span className="px-space-sm py-1 rounded-full bg-[#FEF3C7] text-[#F5A623] text-xs font-semibold flex items-center gap-1 border border-[#F5A623]/20">
<span className="material-symbols-outlined text-[14px]">{"hourglass_empty"}</span>{"\n              Chờ xác nhận\n            "}</span>
</div>
</div>
<p className="text-xs text-[#666666]">{"\n          Biên bản bàn giao trả xe chỉ hoàn tất khi cả Chủ xe và Khách thuê hoàn tất xác nhận độc lập trên ứng dụng CarDB. Khách thuê không xác nhận thay cho Chủ xe và ngược lại.\n        "}</p>

<label className="flex items-start gap-space-sm p-space-md rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] cursor-pointer hover:bg-orange-50/40 transition-colors">
<input className="accent-[#FC6C26] w-5 h-5 rounded mt-0.5" type="checkbox" defaultChecked={true} />
<span className="text-sm text-[#292929]">{"\n            Tôi ("}<strong className="text-[#FC6C26]">{"Nguyễn Hoàng Minh"}</strong>{") xác nhận thông tin hiện trạng thực tế khi trả xe và đồng ý gửi phần xác nhận của tôi.\n          "}</span>
</label>

<div className="flex-wrap gap-y-2 flex flex-col sm:flex-row items-center justify-end gap-space-md pt-space-xs">
<button className="ui-action w-full sm:w-auto px-space-lg py-2.5 rounded-xl bg-white hover:bg-[#F7F7F5] text-[#292929] font-bold text-sm border border-[#E9E9E7] transition-colors flex items-center justify-center gap-2" type="button" aria-label="Lưu bản nháp biên bản">
<span className="material-symbols-outlined text-[18px]">{"save"}</span>{"\n            Lưu bản nháp biên bản\n          "}</button>
<button className="w-full sm:w-auto px-space-xl py-3 rounded-xl bg-[#FC6C26] hover:bg-[#e05b1b] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2" type="button" aria-label="Xác nhận của tôi">
<span>{"Xác nhận của tôi"}</span>
<span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
</button>
</div>
<div className="p-space-sm rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] text-center text-[#666666] text-xs">{"\n          Đang chờ bên còn lại xác nhận (nếu một bên hoàn tất trước). Đơn thuê chuyển sang Hoàn tất và kích hoạt hoàn cọc sau khi hai bên ký nhận.\n        "}</div>
</div>
</div>

<div className="lg:col-span-4 flex flex-col gap-space-lg sticky top-24">

<div className="bg-[#FFFFFF] rounded-2xl p-space-lg border border-[#E9E9E7] shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-xs border-b border-[#E9E9E7]">
<h3 className="font-bold text-base text-[#292929]">{"Thông tin đơn thuê"}</h3>
<span className="px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#2563EB] font-mono text-xs font-bold">{"Đang thuê"}</span>
</div>
<div className="flex flex-col gap-space-sm text-sm">
<div className="flex items-center justify-between py-1 border-b border-[#E9E9E7]/60">
<span className="text-[#666666]">{"Mã đơn hàng"}</span>
<span className="text-[#292929] font-mono font-bold">{"CDB-ORD-20261026-904"}</span>
</div>
<div className="flex items-center justify-between py-1 border-b border-[#E9E9E7]/60">
<span className="text-[#666666]">{"Dòng xe"}</span>
<span className="text-[#292929] font-semibold">{"VinFast VF 9 Plus AWD"}</span>
</div>
<div className="flex items-center justify-between py-1 border-b border-[#E9E9E7]/60">
<span className="text-[#666666]">{"Thời gian nhận"}</span>
<span className="text-[#292929]">{"08:00, 26/10/2026"}</span>
</div>
<div className="flex items-center justify-between py-1 border-b border-[#E9E9E7]/60">
<span className="text-[#666666]">{"Thời gian trả"}</span>
<span className="text-[#292929]">{"08:00, 28/10/2026"}</span>
</div>
<div className="flex items-center justify-between py-1">
<span className="text-[#666666]">{"Thời lượng thuê"}</span>
<span className="text-[#292929] font-medium">{"2 ngày trọn gói"}</span>
</div>
<div className="flex items-center justify-between py-2 mt-1 bg-[#D1FAE5] px-space-md rounded-xl">
<span className="text-[#10B981] font-semibold text-xs uppercase">{"Tiền thuê đã trả"}</span>
<span className="text-[#10B981] font-bold text-base whitespace-nowrap">{"3.700.000 đ (✓)"}</span>
</div>
</div>
</div>

<div className="bg-[#FFFFFF] rounded-2xl p-space-lg border-2 border-[#10B981] shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-xs border-b border-[#E9E9E7]">
<h3 className="font-bold text-base text-[#292929]">{"Đối soát & Quyết toán tiền cọc"}</h3>
<span className="material-symbols-outlined text-[#10B981] text-[22px]">{"account_balance_wallet"}</span>
</div>
<div className="flex flex-col gap-space-sm text-sm">
<div className="flex items-center justify-between">
<span className="text-[#666666]">{"Tiền cọc đã ghi nhận"}</span>
<span className="ui-money text-[#292929] font-bold whitespace-nowrap">{"15.000.000 đ"}</span>
</div>
<div className="flex items-center justify-between">
<span className="text-[#666666]">{"Khấu trừ đã xác nhận"}</span>
<span className="ui-money text-[#666666] font-semibold whitespace-nowrap">{"0 đ"}</span>
</div>
<div className="flex items-center justify-between">
<span className="text-[#666666]">{"Khấu trừ quá giờ / vi phạm"}</span>
<span className="ui-money text-[#666666] whitespace-nowrap">{"0 đ"}</span>
</div>

<div className="p-space-md rounded-xl bg-[#D1FAE5] border border-[#10B981]/30 flex flex-col gap-1 mt-space-xs">
<span className="text-[11px] text-[#10B981] font-bold uppercase tracking-wider">{"TIỀN CỌC SẼ HOÀN TRẢ"}</span>
<div className="flex flex-wrap items-center justify-between gap-2">
<span className="ui-money text-2xl font-bold text-[#10B981] tracking-tight whitespace-nowrap">{"\n              15.000.000 đ\n            "}</span>
<span className="px-2.5 py-0.5 rounded-full bg-white text-[#10B981] text-xs font-bold border border-[#10B981]/30 whitespace-nowrap">{"100% hoàn lại"}</span>
</div>
</div>

<div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] text-xs font-semibold">
<span className="text-[#666666]">{"Trạng thái hoàn cọc:"}</span>
<span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#F5A623] text-xs whitespace-nowrap flex items-center gap-1 border border-[#F5A623]/20">
<span className="material-symbols-outlined text-[14px]">{"hourglass_empty"}</span>{"\n              Chưa thực hiện\n            "}</span>
</div>
<p className="text-[11px] text-[#666666] leading-relaxed">{"\n          Số tiền hoàn cọc 15tr sẽ được xác định hoàn trả đối soát trực tiếp giữa hai bên hoặc thông qua hỗ trợ của quản trị viên.\n        "}</p>
</div>
</div>

<div className="bg-[#FFFFFF] rounded-2xl p-space-lg border border-[#E9E9E7] shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-xs border-b border-[#E9E9E7]">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[#FC6C26] text-[20px]">{"checklist"}</span>
<h3 className="font-bold text-base text-[#292929]">{"Tiến độ hoàn tất thủ tục trả xe"}</h3>
</div>
<span className="px-2.5 py-0.5 rounded-full bg-[#D1FAE5] text-[#10B981] text-xs font-bold whitespace-nowrap">{"4 / 5"}</span>
</div>
<div className="flex flex-col gap-space-sm text-xs">
<div className="p-space-sm rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-between gap-2">
<div className="flex items-center gap-2 min-w-0">
<span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0"></span>
<span className="text-[#292929] font-medium truncate">{"1. Đối chiếu km và pin"}</span>
</div>
<span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#10B981] font-bold whitespace-nowrap">{"Đã xác nhận"}</span>
</div>
<div className="p-space-sm rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-between gap-2">
<div className="flex items-center gap-2 min-w-0">
<span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0"></span>
<span className="text-[#292929] font-medium truncate">{"2. Kiểm tra hiện trạng xe"}</span>
</div>
<span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#10B981] font-bold whitespace-nowrap">{"Đã xác nhận"}</span>
</div>
<div className="p-space-sm rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-between gap-2">
<div className="flex items-center gap-2 min-w-0">
<span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0"></span>
<span className="text-[#292929] font-medium truncate">{"3. Hình ảnh trả xe (6 góc)"}</span>
</div>
<span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#10B981] font-bold whitespace-nowrap font-mono">{"Đã tải lên 6/6"}</span>
</div>
<div className="p-space-sm rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-between gap-2">
<div className="flex items-center gap-2 min-w-0">
<span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0"></span>
<span className="text-[#292929] font-medium truncate">{"4. Đối soát phí phát sinh"}</span>
</div>
<span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#10B981] font-bold whitespace-nowrap">{"Đã đối soát 0đ"}</span>
</div>
<div className="p-space-sm rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-center justify-between gap-2">
<div className="flex items-center gap-2 min-w-0">
<span className="w-2 h-2 rounded-full bg-[#F5A623] shrink-0"></span>
<span className="text-[#292929] font-medium truncate">{"5. Xác nhận hai bên"}</span>
</div>
<span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#F5A623] font-bold whitespace-nowrap">{"Chưa hoàn tất"}</span>
</div>
</div>

<div className="pt-space-xs border-t border-[#E9E9E7] flex items-center justify-between text-[#666666] text-xs">
<div className="flex items-center gap-1.5 min-w-0">
<span className="material-symbols-outlined text-[16px] text-[#FC6C26] shrink-0">{"support_agent"}</span>
<span className="truncate font-semibold uppercase text-[10px] tracking-wider text-[#292929]">{"HOTLINE ĐỐI SOÁT BÀN GIAO 24/7:"}</span>
</div>
<span className="text-[#FC6C26] font-bold whitespace-nowrap ml-2">{"1900 8899"}</span>
</div>
</div>
</div>
</div>
</div>
</div></main></div>); }
