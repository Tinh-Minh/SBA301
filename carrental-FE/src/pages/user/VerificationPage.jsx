import { ProfileLayout } from "@/layouts/ProfileLayout.jsx";
import { Link } from "react-router";
export default function VerificationPage() {
    return (<div className="cardb-screen screen-verification bg-background font-body-md text-body-md text-on-surface antialiased"><ProfileLayout active="verification" title="Xác minh giấy tờ">

    <div className="space-y-3" data-purpose="verification-documents">

    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden transition-all duration-200" id="card-cccd">

    <button className="document-toggle w-full text-left hover:bg-surface-container-low/30 transition-colors" type="button" aria-label="Căn cước công dân: Đã duyệt" aria-expanded="false" aria-controls="card-cccd-content" data-handler="toggleCard" data-args="'card-cccd'">
      <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><span className="material-symbols-outlined text-[18px]">{"badge"}</span></span>
      <span className="min-w-0"><span className="block truncate text-[13px] font-semibold text-on-surface" title="Căn cước công dân">{"Căn cước công dân"}</span><span className="mt-0.5 block whitespace-nowrap font-mono text-[10px] text-text-secondary">{"•••• ••• 089"}</span></span>
      <span className="whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700">{"Đã duyệt"}</span>
      <span className="material-symbols-outlined icon-arrow text-[18px] text-text-secondary transition-transform">{"expand_more"}</span>
    </button>

    <div id="card-cccd-content" className="card-content hidden px-space-md md:px-space-lg pb-space-lg pt-space-xs space-y-space-md">
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
    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-surface-container-high flex items-center justify-center shadow-inner">
    <img className="w-full h-full object-cover filter blur-[2px] transition duration-300 group-hover:blur-0" src="/images/cardb-45b100b705e1821d.webp" alt="Ảnh giấy tờ định danh" loading="lazy" decoding="async"/>

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
    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-surface-container-high flex items-center justify-center shadow-inner">
    <img className="w-full h-full object-cover filter blur-[2px] transition duration-300 group-hover:blur-0" src="/images/cardb-ff82b3a38801642d.webp" alt="Ảnh giấy tờ định danh" loading="lazy" decoding="async"/>
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

    <button className="document-toggle w-full text-left hover:bg-surface-container-low/30 transition-colors" type="button" aria-label="Giấy phép lái xe: Chờ duyệt" aria-expanded="false" aria-controls="card-gplx-content" data-handler="toggleCard" data-args="'card-gplx'">
      <span className="flex size-8 items-center justify-center rounded-lg bg-status-amber-bg text-status-amber-strong"><span className="material-symbols-outlined text-[18px]">{"sports_score"}</span></span>
      <span className="min-w-0"><span className="block truncate text-[13px] font-semibold text-on-surface" title="Giấy phép lái xe">{"Giấy phép lái xe"}</span><span className="mt-0.5 block whitespace-nowrap font-mono text-[10px] text-text-secondary">{"•••• ••• 123"}</span></span>
      <span className="whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold bg-status-amber-bg text-status-amber-strong">{"Chờ duyệt"}</span>
      <span className="material-symbols-outlined icon-arrow text-[18px] text-text-secondary transition-transform">{"expand_more"}</span>
    </button>

    <div id="card-gplx-content" className="card-content hidden px-space-md md:px-space-lg pb-space-lg pt-space-xs space-y-space-md">
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
    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-surface-container-high flex items-center justify-center">
    <img className="w-full h-full object-cover filter blur-[1px]" src="/images/cardb-60ebbd843c1b4bf7.webp" alt="Ảnh giấy tờ định danh" loading="lazy" decoding="async"/>
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
    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-surface-container-high flex items-center justify-center">
    <img className="w-full h-full object-cover filter blur-[1px]" src="/images/cardb-c397a9bb6c2e5ff8.webp" alt="Ảnh giấy tờ định danh" loading="lazy" decoding="async"/>
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

    <button className="document-toggle w-full text-left hover:bg-surface-container-low/30 transition-colors" type="button" aria-label="Hộ chiếu: Cần tải lại" aria-expanded="false" aria-controls="card-passport-content" data-handler="toggleCard" data-args="'card-passport'">
      <span className="flex size-8 items-center justify-center rounded-lg bg-error-container text-error"><span className="material-symbols-outlined text-[18px]">{"flight_takeoff"}</span></span>
      <span className="min-w-0"><span className="block truncate text-[13px] font-semibold text-on-surface" title="Hộ chiếu">{"Hộ chiếu"}</span><span className="mt-0.5 block whitespace-nowrap font-mono text-[10px] text-text-secondary">{"••••••284"}</span></span>
      <span className="whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold bg-error-container text-error">{"Cần tải lại"}</span>
      <span className="material-symbols-outlined icon-arrow text-[18px] text-text-secondary transition-transform">{"expand_more"}</span>
    </button>

    <div id="card-passport-content" className="card-content hidden px-space-md md:px-space-lg pb-space-lg pt-space-xs space-y-space-md">
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
    <div data-purpose="verification-ocr-status" className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-text-primary"><span className="size-2 shrink-0 rounded-full bg-status-success"/><span>AI Auto-OCR hoạt động 24/7</span></div>
    <strong className="font-semibold text-on-surface">{"Cam kết bảo mật dữ liệu định danh theo Nghị định 13/2023/NĐ-CP:"}</strong>{"\n            Mọi thông tin giấy tờ tùy thân của khách hàng được CarDB lưu trữ tại trung tâm dữ liệu đạt chuẩn Tier 3 và được mã hóa đầu cuối. Thông tin chỉ được sử dụng cho mục đích lập hợp đồng thuê xe tự lái và xuất trình với cơ quan công an / đơn vị bảo hiểm khi phát sinh sự cố giao thông.\n          "}</div>
    </div>

    </ProfileLayout>
    </div>);
}
