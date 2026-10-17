import { ProfileLayout } from "@/components/profile-layout";
import { Link } from "react-router";
export default function VerificationCollapsed() {
    return (<div className="cardb-screen screen-verificationcollapsed bg-background font-body-md text-body-md text-on-surface antialiased"><ProfileLayout active="verification" title="Xác minh giấy tờ" description="Cập nhật và quản lý các giấy tờ định danh pháp lý để đủ điều kiện kích hoạt dịch vụ tự lái độc quyền và bảo hiểm vật chất cao cấp trên CarDB." actions={<><div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-xl">
        <div className="relative flex items-center justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        <span className="absolute w-4 h-4 rounded-full bg-emerald-400/40 animate-ping"></span>
        </div>
        <div className="flex flex-col">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">{"Hệ thống thẩm định"}</span>
        <span className="font-technical-data text-technical-data text-on-surface">{"AI Auto-OCR Hoạt động 24/7"}</span>
        </div>
        </div></>}>

    <div className="space-y-space-md">

    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden transition-all duration-200" id="card-cccd">

    <button className="w-full text-left p-space-md md:p-space-lg flex items-center justify-between gap-space-md hover:bg-surface-container-low/30 transition-colors" type="button" aria-label="Căn cước công dân (CCCD gắn chip) Bắt buộc •••• ••• 089 Đã duyệt" data-handler="toggleCard" data-args="'card-cccd'">
    <div className="flex items-center gap-space-md min-w-0">
    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
    <span className="material-symbols-outlined text-[28px]">{"badge"}</span>
    </div>
    <div className="min-w-0">
    <div className="flex flex-wrap items-center gap-space-xs">
    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">{"Căn cước công dân (CCCD gắn chip)"}</h2>
    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm text-[11px] uppercase">{"Bắt buộc"}</span>
    </div>
    <p className="font-technical-data text-technical-data text-on-surface-variant tracking-wider mt-0.5">{"•••• ••• 089"}</p>
    </div>
    </div>
    <div className="flex items-center gap-space-md shrink-0">
    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-label-md text-label-md inline-flex items-center gap-1.5 shadow-sm">
    <span className="material-symbols-outlined text-[18px]">{"verified"}</span>{"\n                  Đã duyệt\n                "}</span>
    <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm chevron-toggle"><span className="material-symbols-outlined text-[20px] transition-transform duration-300 icon-arrow" style={{ "transform": "rotate(180deg)" }}>{"expand_less"}</span></div>
    </div>
    </button>

    <div className="card-content px-space-md md:px-space-lg pb-space-lg pt-space-xs space-y-space-md hidden">
    <div className="h-px bg-surface-container-high"></div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md bg-surface-container-low p-space-md rounded-xl">
    <div>
    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">{"Họ và tên"}</span>
    <span className="font-title text-title text-on-surface font-semibold mt-0.5 block">{"NGUYỄN HOÀNG MINH"}</span>
    </div>
    <div>
    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">{"Ngày cấp"}</span>
    <span className="font-body-md text-body-md text-on-surface mt-0.5 block">{"15/05/2021"}</span>
    </div>
    <div>
    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">{"Hạn sử dụng"}</span>
    <span className="font-body-md text-body-md text-emerald-700 font-semibold mt-0.5 block">{"18/09/2032 (Hợp lệ)"}</span>
    </div>
    <div>
    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">{"Nơi cấp"}</span>
    <span className="font-body-md text-body-md text-on-surface mt-0.5 block truncate" title="Cục Cảnh sát QLHC về TTXH">{"Cục CS QLHC về TTXH"}</span>
    </div>
    </div>

    <div>
    <span className="font-label-md text-label-md text-on-surface block mb-space-sm">{"Bản quét định danh bảo mật (Đã mã hóa 256-bit)"}</span>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">

    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between group">
    <div className="flex items-center justify-between mb-space-sm">
    <span className="font-label-sm text-label-sm text-on-surface font-medium flex items-center gap-1.5">
    <span className="material-symbols-outlined text-primary-container text-[18px]">{"photo_camera_front"}</span>{"\n                        Mặt trước CCCD\n                      "}</span>
    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-label-sm text-label-sm text-[11px] flex items-center gap-1">
    <span className="material-symbols-outlined text-[14px]">{"check_circle"}</span>{" Khớp định danh\n                      "}</span>
    </div>
    <div className="relative w-full h-44 rounded-lg overflow-hidden bg-surface-container-high flex items-center justify-center shadow-inner">
    <img className="w-full h-full object-cover filter blur-[2px] transition duration-300 group-hover:blur-0" src="/images/cardb-45b100b705e1821d.webp" alt="Hình ảnh xe CarDB" loading="lazy" decoding="async"/>

    <div className="absolute inset-0 bg-surface-container-highest/20 pointer-events-none"></div>
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-[-12deg]">
    <span className="font-technical-data text-white/90 text-sm tracking-widest px-3 py-1 bg-black/40 backdrop-blur-md rounded border border-white/20 uppercase shadow-lg">{"\n                          CARDB EKYC BẢO MẬT\n                        "}</span>
    </div>
    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded backdrop-blur-sm text-[11px] text-white font-technical-data">{"\n                        SHA-256: 8a4f9...9b2\n                      "}</div>
    </div>
    <div className="flex-wrap gap-y-2 mt-space-sm flex items-center justify-between pt-space-xs">
    <span className="font-body-sm text-body-sm text-on-surface-variant">{"Tải lên: 16/01/2024"}</span>
    <button className="ui-action font-label-sm text-label-sm text-primary-container hover:text-primary transition-colors flex items-center gap-1" type="button" aria-label="Xem ảnh bảo mật" data-action="preview-image">{"\n                        Xem ảnh bảo mật "}<span className="material-symbols-outlined text-[14px]">{"north_east"}</span>
    </button>
    </div>
    </div>

    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between group">
    <div className="flex items-center justify-between mb-space-sm">
    <span className="font-label-sm text-label-sm text-on-surface font-medium flex items-center gap-1.5">
    <span className="material-symbols-outlined text-primary-container text-[18px]">{"credit_card"}</span>{"\n                        Mặt sau CCCD (Chip điện tử)\n                      "}</span>
    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-label-sm text-label-sm text-[11px] flex items-center gap-1">
    <span className="material-symbols-outlined text-[14px]">{"check_circle"}</span>{" Hợp lệ\n                      "}</span>
    </div>
    <div className="relative w-full h-44 rounded-lg overflow-hidden bg-surface-container-high flex items-center justify-center shadow-inner">
    <img className="w-full h-full object-cover filter blur-[2px] transition duration-300 group-hover:blur-0" src="/images/cardb-ff82b3a38801642d.webp" alt="Hình ảnh xe CarDB" loading="lazy" decoding="async"/>
    <div className="absolute inset-0 bg-surface-container-highest/20 pointer-events-none"></div>
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-[-12deg]">
    <span className="font-technical-data text-white/90 text-sm tracking-widest px-3 py-1 bg-black/40 backdrop-blur-md rounded border border-white/20 uppercase shadow-lg">{"\n                          CARDB EKYC BẢO MẬT\n                        "}</span>
    </div>
    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded backdrop-blur-sm text-[11px] text-white font-technical-data">{"\n                        CHIP-UID: 99401...88a\n                      "}</div>
    </div>
    <div className="flex-wrap gap-y-2 mt-space-sm flex items-center justify-between pt-space-xs">
    <span className="font-body-sm text-body-sm text-on-surface-variant">{"Tải lên: 16/01/2024"}</span>
    <button className="ui-action font-label-sm text-label-sm text-primary-container hover:text-primary transition-colors flex items-center gap-1" type="button" aria-label="Xem ảnh bảo mật" data-action="preview-image">{"\n                        Xem ảnh bảo mật "}<span className="material-symbols-outlined text-[14px]">{"north_east"}</span>
    </button>
    </div>
    </div>
    </div>
    </div>

    <div className="flex items-center gap-space-sm p-space-sm bg-emerald-50/50 rounded-lg text-emerald-900 text-body-sm font-body-sm">
    <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0">{"verified"}</span>
    <span className="">{"Dữ liệu đã đối soát trực tiếp với Cơ sở dữ liệu Quốc gia về dân cư. Thời gian xác thực: "}<strong>{"16/01/2024 14:22"}</strong>{". Mã kiểm định: "}<code className="font-technical-data text-xs bg-emerald-100 px-1.5 py-0.5 rounded">{"KYC-7749-OK"}</code></span>
    </div>
    </div>
    </div>

    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden transition-all duration-200" id="card-gplx">

    <button className="w-full text-left p-space-md md:p-space-lg flex items-center justify-between gap-space-md hover:bg-surface-container-low/30 transition-colors" type="button" aria-label="Giấy phép lái xe (GPLX) Bắt buộc •••• ••• 123 Chờ quản trị viên duyệt" data-handler="toggleCard" data-args="'card-gplx'">
    <div className="flex items-center gap-space-md min-w-0">
    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
    <span className="material-symbols-outlined text-[28px]">{"sports_score"}</span>
    </div>
    <div className="min-w-0">
    <div className="flex flex-wrap items-center gap-space-xs">
    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">{"Giấy phép lái xe (GPLX)"}</h2>
    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm text-[11px] uppercase">{"Bắt buộc"}</span>
    </div>
    <p className="font-technical-data text-technical-data text-on-surface-variant tracking-wider mt-0.5">{"•••• ••• 123"}</p>
    </div>
    </div>
    <div className="flex items-center gap-space-md shrink-0">
    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-label-md text-label-md inline-flex items-center gap-1.5 shadow-sm">
    <span className="material-symbols-outlined text-[18px] text-amber-500 animate-spin">{"sync"}</span>{"\n                  Chờ quản trị viên duyệt\n                "}</span>
    <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm chevron-toggle"><span className="material-symbols-outlined text-[20px] transition-transform duration-300 icon-arrow" style={{ "transform": "rotate(180deg)" }}>{"expand_less"}</span></div>
    </div>
    </button>

    <div className="card-content px-space-md md:px-space-lg pb-space-lg pt-space-xs space-y-space-md hidden">
    <div className="h-px bg-surface-container-high"></div>

    <div className="grid grid-cols-2 md:grid-cols-5 gap-space-md bg-surface-container-low p-space-md rounded-xl">
    <div>
    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">{"Hạng GPLX"}</span>
    <span className="font-title text-title text-on-surface font-semibold mt-0.5 block">{"Hạng B2"}</span>
    <span className="text-[11px] text-on-surface-variant">{"≤ 9 chỗ, < 3.5 tấn"}</span>
    </div>
    <div>
    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">{"Ngày cấp"}</span>
    <span className="font-body-md text-body-md text-on-surface mt-0.5 block">{"15/10/2020"}</span>
    </div>
    <div>
    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">{"Ngày hết hạn"}</span>
    <span className="font-body-md text-body-md text-on-surface font-medium mt-0.5 block">{"15/10/2030"}</span>
    <span className="text-[11px] text-emerald-700 font-semibold">{"(Còn 6 năm)"}</span>
    </div>
    <div>
    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">{"Nơi cấp"}</span>
    <span className="font-body-md text-body-md text-on-surface mt-0.5 block truncate">{"Sở GTVT TP.HCM"}</span>
    </div>
    <div>
    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">{"Gửi duyệt lúc"}</span>
    <span className="font-body-md text-body-md text-amber-700 font-semibold mt-0.5 block">{"Hôm nay, 10:45 AM"}</span>
    </div>
    </div>

    <div>
    <span className="font-label-md text-label-md text-on-surface block mb-space-sm">{"Hình ảnh giấy phép lái xe đã nộp"}</span>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">

    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
    <div className="flex items-center justify-between mb-space-sm">
    <span className="font-label-sm text-label-sm text-on-surface font-medium">{"GPLX Mặt trước (Thẻ PET)"}</span>
    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-label-sm text-label-sm text-[11px]">{"Đang đối soát"}</span>
    </div>
    <div className="relative w-full h-44 rounded-lg overflow-hidden bg-surface-container-high flex items-center justify-center">
    <img className="w-full h-full object-cover filter blur-[1px]" src="/images/cardb-60ebbd843c1b4bf7.webp" alt="Hình ảnh xe CarDB" loading="lazy" decoding="async"/>
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-[-12deg]">
    <span className="font-technical-data text-white/90 text-sm tracking-widest px-3 py-1 bg-black/40 backdrop-blur-md rounded border border-white/20 uppercase">{"\n                          CARDB EKYC ĐANG DUYỆT\n                        "}</span>
    </div>
    </div>
    <div className="mt-space-sm flex items-center justify-between pt-space-xs">
    <span className="font-body-sm text-body-sm text-on-surface-variant">{"Độ nét: 98% (Đạt)"}</span>
    <button className="font-label-sm text-label-sm text-primary-container hover:underline" type="button" aria-label="Xem ảnh" data-action="preview-image">{"Xem ảnh"}</button>
    </div>
    </div>

    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
    <div className="flex items-center justify-between mb-space-sm">
    <span className="font-label-sm text-label-sm text-on-surface font-medium">{"GPLX Mặt sau (Bảng phân hạng)"}</span>
    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-label-sm text-label-sm text-[11px]">{"Đang đối soát"}</span>
    </div>
    <div className="relative w-full h-44 rounded-lg overflow-hidden bg-surface-container-high flex items-center justify-center">
    <img className="w-full h-full object-cover filter blur-[1px]" src="/images/cardb-c397a9bb6c2e5ff8.webp" alt="Hình ảnh xe CarDB" loading="lazy" decoding="async"/>
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-[-12deg]">
    <span className="font-technical-data text-white/90 text-sm tracking-widest px-3 py-1 bg-black/40 backdrop-blur-md rounded border border-white/20 uppercase">{"\n                          CARDB EKYC ĐANG DUYỆT\n                        "}</span>
    </div>
    </div>
    <div className="mt-space-sm flex items-center justify-between pt-space-xs">
    <span className="font-body-sm text-body-sm text-on-surface-variant">{"Mã QR: Đã quét hợp lệ"}</span>
    <button className="font-label-sm text-label-sm text-primary-container hover:underline" type="button" aria-label="Xem ảnh" data-action="preview-image">{"Xem ảnh"}</button>
    </div>
    </div>
    </div>
    </div>

    <div className="p-space-md bg-amber-50/60 rounded-xl space-y-space-sm">
    <div className="flex items-start gap-space-sm">
    <span className="material-symbols-outlined text-amber-600 text-[22px] shrink-0">{"info"}</span>
    <div className="flex-1">
    <h5 className="font-label-md text-label-md text-on-surface font-semibold">{"Quy trình thẩm định hồ sơ bằng lái xe"}</h5>
    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">{"\n                      Chuyên viên thẩm định CarDB đang xử lý hồ sơ (cam kết tối đa 30 - 60 phút trong giờ làm việc từ 08:00 đến 21:00 hàng ngày). Trong thời gian này, bạn vẫn có thể cập nhật lại ảnh chụp nếu nhận thấy bản tải lên bị mờ góc hoặc chói sáng.\n                    "}</p>
    </div>
    </div>
    <div className="flex flex-wrap items-center justify-end gap-space-sm pt-space-xs">
    <button className="px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center gap-1.5 shadow-sm" type="button" aria-label="Chỉnh sửa tài liệu đã nộp" data-action="edit-profile">
    <span className="material-symbols-outlined text-[18px]">{"edit_document"}</span>{"\n                    Chỉnh sửa tài liệu đã nộp\n                  "}</button>
    </div>
    </div>
    </div>
    </div>

    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden transition-all duration-200" id="card-passport">

    <button className="w-full text-left p-space-md md:p-space-lg flex items-center justify-between gap-space-md hover:bg-surface-container-low/30 transition-colors" type="button" aria-label="Hộ chiếu (Passport Việt Nam) Tùy chọn ••••••284 Bị từ chối (Cần tải lại)" data-handler="toggleCard" data-args="'card-passport'">
    <div className="flex items-center gap-space-md min-w-0">
    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
    <span className="material-symbols-outlined text-[28px]">{"flight_takeoff"}</span>
    </div>
    <div className="min-w-0">
    <div className="flex flex-wrap items-center gap-space-xs">
    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">{"Hộ chiếu (Passport Việt Nam)"}</h2>
    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm text-[11px] uppercase">{"Tùy chọn"}</span>
    </div>
    <p className="font-technical-data text-technical-data text-on-surface-variant tracking-wider mt-0.5">{"••••••284"}</p>
    </div>
    </div>
    <div className="flex items-center gap-space-md shrink-0">
    <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 font-label-md text-label-md inline-flex items-center gap-1.5 shadow-sm">
    <span className="material-symbols-outlined text-[18px]">{"error"}</span>{"\n                  Bị từ chối (Cần tải lại)\n                "}</span>
    <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm chevron-toggle"><span className="material-symbols-outlined text-[20px] transition-transform duration-300 icon-arrow" style={{ "transform": "rotate(180deg)" }}>{"expand_less"}</span></div>
    </div>
    </button>

    <div className="card-content px-space-md md:px-space-lg pb-space-lg pt-space-xs space-y-space-md hidden">
    <div className="h-px bg-surface-container-high"></div>

    <div className="bg-red-50/80 p-space-md rounded-xl space-y-space-xs">
    <div className="flex items-start gap-space-sm">
    <span className="material-symbols-outlined text-red-600 text-[22px] shrink-0">{"report_problem"}</span>
    <div>
    <h5 className="font-label-md text-label-md text-red-900 font-semibold">{"Lý do từ chối kiểm định:"}</h5>
    <p className="font-body-md text-body-md text-red-800 mt-1 leading-relaxed">{"\n                      Ảnh chụp trang thông tin nhân thân bị lóa đèn flash làm mờ dòng mã đọc máy ICAO (Machine Readable Zone) và mất 2 góc phía dưới cuốn hộ chiếu. Vui lòng chụp lại rõ nét trên mặt phẳng đủ ánh sáng tự nhiên, không bị bóng phản chiếu.\n                    "}</p>
    </div>
    </div>
    </div>

    <div className="p-space-lg bg-surface-container-low/60 rounded-xl text-center space-y-space-md hover:bg-surface-container-low transition-colors group cursor-pointer">
    <div className="w-16 h-16 rounded-2xl bg-primary-fixed/50 text-primary-container mx-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm">
    <span className="material-symbols-outlined text-[32px]">{"cloud_upload"}</span>
    </div>
    <div className="max-w-md mx-auto">
    <h4 className="font-title text-title text-on-surface font-semibold">{"Kéo thả ảnh chụp hộ chiếu mới vào đây"}</h4>
    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{"hoặc duyệt tập tin từ máy tính / điện thoại di động"}</p>
    <p className="font-technical-data text-[12px] text-outline mt-2">{"Hỗ trợ định dạng JPG, PNG, HEIC (Tối đa 10MB mỗi ảnh)"}</p>
    </div>
    <div>
    <button className="ui-action h-12 px-space-lg rounded-xl bg-primary-container text-white font-label-md text-label-md shadow-md hover:bg-primary transition-all duration-200 inline-flex items-center gap-space-sm transform active:scale-95" type="button" aria-label="Tải lên ảnh Hộ chiếu mới" data-action="upload">
    <span className="material-symbols-outlined text-[20px]">{"upload_file"}</span>{"\n                    Tải lên ảnh Hộ chiếu mới\n                  "}</button>
    </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs text-left">
    <div className="flex items-start gap-space-xs p-space-sm bg-surface-container-low rounded-lg">
    <span className="material-symbols-outlined text-emerald-600 text-[18px]">{"check"}</span>
    <span className="font-body-sm text-body-sm text-on-surface-variant">{"Trang nhân thân mở phẳng hoàn toàn"}</span>
    </div>
    <div className="flex items-start gap-space-xs p-space-sm bg-surface-container-low rounded-lg">
    <span className="material-symbols-outlined text-emerald-600 text-[18px]">{"check"}</span>
    <span className="font-body-sm text-body-sm text-on-surface-variant">{"Không dính ngón tay che chữ số"}</span>
    </div>
    <div className="flex items-start gap-space-xs p-space-sm bg-surface-container-low rounded-lg">
    <span className="material-symbols-outlined text-emerald-600 text-[18px]">{"check"}</span>
    <span className="font-body-sm text-body-sm text-on-surface-variant">{"Ánh sáng tự nhiên, không chói flash"}</span>
    </div>
    </div>
    </div>
    </div>
    </div>

    <div className="bg-surface-container-low p-space-md rounded-xl flex items-start gap-space-md">
    <div className="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface-variant flex items-center justify-center shrink-0 shadow-sm">
    <span className="material-symbols-outlined text-[20px]">{"lock"}</span>
    </div>
    <div className="text-xs text-on-surface-variant leading-relaxed">
    <strong className="font-semibold text-on-surface">{"Cam kết bảo mật dữ liệu định danh theo Nghị định 13/2023/NĐ-CP:"}</strong>{"\n            Mọi thông tin giấy tờ tùy thân của khách hàng được CarDB lưu trữ tại trung tâm dữ liệu đạt chuẩn Tier 3 và được mã hóa đầu cuối. Thông tin chỉ được sử dụng cho mục đích lập hợp đồng thuê xe tự lái và xuất trình với cơ quan công an / đơn vị bảo hiểm khi phát sinh sự cố giao thông.\n          "}</div>
    </div>

    </ProfileLayout>
    </div>);
}
