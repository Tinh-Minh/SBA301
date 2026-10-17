import { Link } from "react-router";
export default function Dispute() {
    return (<div className="cardb-screen screen-dispute bg-[#F7F7F5] font-body-md text-[#292929] antialiased "><main className="w-full  bg-[#F7F7F5] min-h-[calc(100vh-20rem)] pt-20"><div className="flex flex-col w-full">

    <div className="w-full max-w-[1320px] mx-auto px-margin-sm md:px-margin py-8">

    <header className="flex flex-col gap-space-sm mb-8">

    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-[#666666]">
    <Link className="hover:text-[#FC6C26] transition-colors flex items-center gap-1" to="/chuyen-xe-cua-toi">
    <span className="material-symbols-outlined text-[16px]">{"arrow_back"}</span>
    <span>{"Chuyến xe của tôi"}</span>
    </Link>
    <span className="text-[#E9E9E7] font-mono">{"/"}</span>
    <Link className="hover:text-[#FC6C26] transition-colors" to="/xe/vinfast-vf8-plus-2024">{"Chi tiết đơn thuê"}</Link>
    <span className="text-[#E9E9E7] font-mono">{"/"}</span>
    <span className="text-[#FC6C26] font-semibold">{"Tranh chấp & Bằng chứng"}</span>
    </nav>

    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pt-2">
    <div className="flex flex-col gap-1.5 max-w-2xl">
    <div className="flex items-center gap-2">
    <span className="px-2.5 py-0.5 rounded-full bg-[#F0F1EF] text-[#666666] font-semibold text-[11px] tracking-wider uppercase">{"SCREEN C11-B"}</span>
    <span className="text-[#666666] text-[11px] font-mono tracking-wider">{"REF-REV-2026"}</span>
    </div>
    <h1 className="text-[28px] text-[#292929] font-bold tracking-tight">{"\n            Tranh chấp và bằng chứng\n          "}</h1>
    <p className="text-[14px] text-[#666666]">{"Gửi yêu cầu xem xét các vấn đề phát sinh và theo dõi quá trình xử lý minh bạch từ ban đối soát."}</p>
    </div>

    <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E9E9E7] text-[#292929] text-[12px] font-medium shadow-sm">
    <span className="w-2 h-2 rounded-full bg-[#FC6C26] animate-pulse"></span>
    <span>{"Đang thuê (Chờ trả xe)"}</span>
    </div>
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D1FAE5] border border-[#10B981]/20 text-[#10B981] text-[12px] font-semibold">
    <span className="material-symbols-outlined text-[16px] text-[#10B981]">{"check_circle"}</span>
    <span>{"Tiền thuê đã thanh toán"}</span>
    </div>
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF3C7] border border-[#F5A623]/30 text-[#D97706] text-[12px] font-semibold">
    <span className="material-symbols-outlined text-[16px] text-[#F5A623]">{"hourglass_top"}</span>
    <span>{"Trong đối soát trả xe"}</span>
    </div>
    </div>
    </div>
    </header>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

    <section className="lg:col-span-8 flex flex-col gap-6">

    <div className="bg-[#FFFFFF] border border-[#E9E9E7] rounded-[16px] p-6 shadow-sm relative overflow-hidden">
    <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2.5">
    <span className="w-6 h-6 rounded-full bg-[#FC6C26] text-white flex items-center justify-center text-[12px] font-bold">{"1"}</span>
    <h2 className="text-[18px] text-[#292929] font-bold">{"Nội dung cần xem xét"}</h2>
    </div>
    <span className="px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#EF4444] text-[11px] uppercase tracking-wider font-bold">{"\n              Bắt buộc\n            "}</span>
    </div>
    <p className="text-[14px] text-[#666666] mb-5">{"\n            Lựa chọn nhóm vấn đề trọng tâm cần khiếu nại hoặc thẩm tra lại với đối tác bàn giao.\n          "}</p>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3" id="dispute-categories">

    <label className="group relative flex flex-col justify-between p-4 rounded-[12px] bg-[#FFF8F5] border-2 border-[#FC6C26] cursor-pointer transition-all shadow-sm dispute-card active-card" data-category="fee">
    <input className="sr-only" name="dispute_category" type="radio" defaultValue="fee" defaultChecked={true}/>
    <div className="flex items-start justify-between mb-3">
    <div className="w-9 h-9 rounded-lg bg-[#FC6C26]/10 text-[#FC6C26] flex items-center justify-center">
    <span className="material-symbols-outlined text-[20px]">{"receipt_long"}</span>
    </div>
    <div className="w-5 h-5 rounded-full bg-[#FC6C26] text-white flex items-center justify-center shadow-sm check-indicator">
    <span className="material-symbols-outlined text-[14px] font-bold">{"check"}</span>
    </div>
    </div>
    <div>
    <span className="text-[14px] text-[#292929] block font-bold mb-0.5">{"Phí phát sinh"}</span>
    <span className="text-[12px] text-[#666666] line-clamp-2">{"Đối soát các khoản phụ thu, vệ sinh, trễ giờ"}</span>
    </div>
    </label>

    <label className="group relative flex flex-col justify-between p-4 rounded-[12px] bg-[#F7F7F5] border border-[#E9E9E7] cursor-pointer transition-all hover:border-[#FC6C26]/50 dispute-card" data-category="condition">
    <input className="sr-only" name="dispute_category" type="radio" defaultValue="condition"/>
    <div className="flex items-start justify-between mb-3">
    <div className="w-9 h-9 rounded-lg bg-white border border-[#E9E9E7] text-[#666666] group-hover:text-[#FC6C26] flex items-center justify-center transition-colors">
    <span className="material-symbols-outlined text-[20px]">{"directions_car"}</span>
    </div>
    <div className="w-5 h-5 rounded-full bg-white border border-[#E9E9E7] text-transparent flex items-center justify-center check-indicator">
    <span className="material-symbols-outlined text-[14px]">{"check"}</span>
    </div>
    </div>
    <div>
    <span className="text-[14px] text-[#292929] block font-semibold mb-0.5">{"Tình trạng xe"}</span>
    <span className="text-[12px] text-[#666666] line-clamp-2">{"Đối chiếu trầy xước, ODO, mức tiêu hao pin"}</span>
    </div>
    </label>

    <label className="group relative flex flex-col justify-between p-4 rounded-[12px] bg-[#F7F7F5] border border-[#E9E9E7] cursor-pointer transition-all hover:border-[#FC6C26]/50 dispute-card" data-category="deposit">
    <input className="sr-only" name="dispute_category" type="radio" defaultValue="deposit"/>
    <div className="flex items-start justify-between mb-3">
    <div className="w-9 h-9 rounded-lg bg-white border border-[#E9E9E7] text-[#666666] group-hover:text-[#FC6C26] flex items-center justify-center transition-colors">
    <span className="material-symbols-outlined text-[20px]">{"shield"}</span>
    </div>
    <div className="w-5 h-5 rounded-full bg-white border border-[#E9E9E7] text-transparent flex items-center justify-center check-indicator">
    <span className="material-symbols-outlined text-[14px]">{"check"}</span>
    </div>
    </div>
    <div>
    <span className="text-[14px] text-[#292929] block font-semibold mb-0.5">{"Tiền cọc"}</span>
    <span className="text-[12px] text-[#666666] line-clamp-2">{"Thời gian xử lý & hoàn trả tiền cọc theo biên bản"}</span>
    </div>
    </label>

    <label className="group relative flex flex-col justify-between p-4 rounded-[12px] bg-[#F7F7F5] border border-[#E9E9E7] cursor-pointer transition-all hover:border-[#FC6C26]/50 dispute-card" data-category="handover">
    <input className="sr-only" name="dispute_category" type="radio" defaultValue="handover"/>
    <div className="flex items-start justify-between mb-3">
    <div className="w-9 h-9 rounded-lg bg-white border border-[#E9E9E7] text-[#666666] group-hover:text-[#FC6C26] flex items-center justify-center transition-colors">
    <span className="material-symbols-outlined text-[20px]">{"assignment_turned_in"}</span>
    </div>
    <div className="w-5 h-5 rounded-full bg-white border border-[#E9E9E7] text-transparent flex items-center justify-center check-indicator">
    <span className="material-symbols-outlined text-[14px]">{"check"}</span>
    </div>
    </div>
    <div>
    <span className="text-[14px] text-[#292929] block font-semibold mb-0.5">{"Vấn đề bàn giao"}</span>
    <span className="text-[12px] text-[#666666] line-clamp-2">{"Quy trình giao nhận, sạc kèm theo, giấy tờ"}</span>
    </div>
    </label>

    <label className="group relative flex flex-col justify-between p-4 rounded-[12px] bg-[#F7F7F5] border border-[#E9E9E7] cursor-pointer transition-all hover:border-[#FC6C26]/50 dispute-card sm:col-span-2 md:col-span-2" data-category="other">
    <input className="sr-only" name="dispute_category" type="radio" defaultValue="other"/>
    <div className="flex items-start justify-between mb-3">
    <div className="w-9 h-9 rounded-lg bg-white border border-[#E9E9E7] text-[#666666] group-hover:text-[#FC6C26] flex items-center justify-center transition-colors">
    <span className="material-symbols-outlined text-[20px]">{"more_horiz"}</span>
    </div>
    <div className="w-5 h-5 rounded-full bg-white border border-[#E9E9E7] text-transparent flex items-center justify-center check-indicator">
    <span className="material-symbols-outlined text-[14px]">{"check"}</span>
    </div>
    </div>
    <div>
    <span className="text-[14px] text-[#292929] block font-semibold mb-0.5">{"Ý kiến khác"}</span>
    <span className="text-[12px] text-[#666666]">{"Thái độ phục vụ hoặc vấn đề hợp đồng không thuộc danh mục trên"}</span>
    </div>
    </label>
    </div>
    </div>

    <div className="bg-[#FFFFFF] border border-[#E9E9E7] rounded-[16px] p-6 shadow-sm relative">
    <div className="flex items-center gap-2.5 mb-2">
    <span className="w-6 h-6 rounded-full bg-[#FC6C26] text-white flex items-center justify-center text-[12px] font-bold">{"2"}</span>
    <h2 className="text-[18px] text-[#292929] font-bold">{"Khoản phí liên quan"}</h2>
    </div>
    <p className="text-[14px] text-[#666666] mb-4">{"\n            Chọn khoản phí cần thẩm định hoặc điều chỉnh đối chiếu lại (nếu có yêu cầu từ chủ xe).\n          "}</p>
    <div className="relative mb-3">
    <div className="w-full bg-[#F7F7F5] border border-[#E9E9E7] rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-[#FC6C26]/50 transition-colors">
    <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-white border border-[#E9E9E7] flex items-center justify-center text-[#FC6C26]">
    <span className="material-symbols-outlined text-[18px]">{"verified"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-[15px] font-medium text-[#292929]">{"Chưa có khoản phí phát sinh được ghi nhận"}</span>
    <span className="text-[12px] text-[#666666]">{"Đơn thuê hiện tại chưa áp dụng bất kỳ khoản khấu trừ cố định nào"}</span>
    </div>
    </div>
    <span className="material-symbols-outlined text-[20px] text-[#FC6C26]">{"expand_more"}</span>
    </div>
    </div>

    <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#F7F7F5] border border-[#E9E9E7] text-[#666666] text-[13px]">
    <span className="material-symbols-outlined text-[18px] text-[#FC6C26] mt-0.5 shrink-0">{"info"}</span>
    <span>{"Hệ thống "}<strong className="text-[#292929]">{"CarDB"}</strong>{" cam kết không tự ý trừ phí hoặc giữ tiền cọc khi các bên chưa ký xác nhận biên bản kiểm tra trả xe hoàn chỉnh."}</span>
    </div>
    </div>

    <div className="bg-[#FFFFFF] border border-[#E9E9E7] rounded-[16px] p-6 shadow-sm relative">
    <div className="flex items-center gap-2.5 mb-2">
    <span className="w-6 h-6 rounded-full bg-[#FC6C26] text-white flex items-center justify-center text-[12px] font-bold">{"3"}</span>
    <h2 className="text-[18px] text-[#292929] font-bold">{"Chi tiết nội dung khiếu nại"}</h2>
    </div>
    <p className="text-[14px] text-[#666666] mb-5">{"Cung cấp mô tả chi tiết, mốc thời gian rõ ràng để ban đối soát tiến hành so sánh dữ liệu ghi nhận và thông tin bàn giao."}</p>
    <div className="flex flex-col gap-4">

    <div className="flex flex-col gap-1.5">
    <label className="text-[14px] text-[#292929] font-medium flex items-center justify-between" htmlFor="dispute-title">
    <span>{"Tiêu đề yêu cầu "}<span className="text-[#EF4444]">{"*"}</span></span>
    <span className="text-[12px] text-[#666666]">{"Rõ ràng, ngắn gọn"}</span>
    </label>
    <input className="w-full bg-[#FFFFFF] border border-[#E9E9E7] rounded-xl px-4 py-3 text-[14px] text-[#292929] placeholder:text-[#666666] focus:outline-none focus:border-[#FC6C26] focus:ring-1 focus:ring-[#FC6C26] transition-all" id="dispute-title" placeholder="Ví dụ: Đề nghị đối chiếu lại mức tiêu hao pin lúc trả xe..." type="text" aria-label="Ví dụ: Đề nghị đối chiếu lại mức tiêu hao pin lúc trả xe..." defaultValue=""/>
    </div>

    <div className="flex flex-col gap-1.5">
    <label className="text-[14px] text-[#292929] font-medium" htmlFor="dispute-reason">{"\n                Lý do tranh chấp "}<span className="text-[#EF4444]">{"*"}</span>
    </label>
    <div className="relative">
    <select className="w-full appearance-none bg-[#FFFFFF] border border-[#E9E9E7] rounded-xl px-4 py-3 text-[14px] text-[#292929] focus:outline-none focus:border-[#FC6C26] focus:ring-1 focus:ring-[#FC6C26] transition-all cursor-pointer pr-10" id="dispute-reason" aria-label="Lựa chọn" defaultValue=""><option className="text-[#666666]" disabled={true} value="">{"Chọn lý do tranh chấp cần xem xét"}</option><option>{"Không đồng thuận với ghi nhận ngoại thất / dung lượng pin"}</option><option>{"Chênh lệch thời gian bàn giao thực tế so với biên bản"}</option><option>{"Phụ kiện đi kèm đã bàn giao đủ nhưng đối tác ghi nhận thiếu"}</option><option>{"Chủ xe yêu cầu phụ thu vệ sinh / khử mùi không thỏa đáng"}</option><option>{"Khác (Ghi rõ chi tiết ở khung mô tả bên dưới)"}</option></select>
    <span className="material-symbols-outlined text-[20px] text-[#666666] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">{"expand_more"}</span>
    </div>
    </div>

    <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
    <label className="text-[14px] text-[#292929] font-medium" htmlFor="dispute-detail">{"\n                  Mô tả chi tiết nội dung sự việc "}<span className="text-[#EF4444]">{"*"}</span>
    </label>
    <span className="text-[12px] text-[#FC6C26] font-mono font-medium" id="char-counter">{"0 / 1000 ký tự"}</span>
    </div>
    <textarea className="w-full bg-[#FFFFFF] border border-[#E9E9E7] rounded-xl p-4 text-[14px] text-[#292929] placeholder:text-[#666666] focus:outline-none focus:border-[#FC6C26] focus:ring-1 focus:ring-[#FC6C26] transition-all resize-y" id="dispute-detail" placeholder="Vui lòng trình bày rõ ràng thời điểm, các điểm chưa thống nhất và nội dung đề nghị xác minh đối chiếu..." rows={5}></textarea>
    </div>
    </div>
    </div>

    <div className="bg-[#FFFFFF] border border-[#E9E9E7] rounded-[16px] p-6 shadow-sm relative">
    <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2.5">
    <span className="w-6 h-6 rounded-full bg-[#FC6C26] text-white flex items-center justify-center text-[12px] font-bold">{"4"}</span>
    <h2 className="text-[18px] text-[#292929] font-bold">{"Bằng chứng đính kèm"}</h2>
    </div>
    <Link className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#FC6C26] hover:underline transition-all" to="/ban-giao/nhan-xe"><span className="material-symbols-outlined text-[16px]">{"compare"}</span><span>{"Xem ảnh và thông tin bàn giao nhận (C10-A) & trả xe (C10-B)"}</span></Link>
    </div>
    <p className="text-[14px] text-[#666666] mb-4">{"\n            Đính kèm hình ảnh hiện trạng thực tế, ảnh táp-lô xe, biên nhận hoặc tài liệu để đội ngũ đối soát CarDB thẩm tra.\n          "}</p>

    <div role="button" tabIndex={0} data-action="upload" aria-label="Tải lên bằng chứng" className="rounded-[14px] p-6 bg-[#F7F7F5] border-2 border-dashed border-[#E9E9E7] hover:border-[#FC6C26] hover:bg-[#FFF8F5] transition-all flex flex-col items-center justify-center text-center cursor-pointer mb-4 group">
    <div className="w-12 h-12 rounded-full bg-white border border-[#E9E9E7] group-hover:bg-[#FC6C26] group-hover:text-white text-[#FC6C26] flex items-center justify-center mb-2.5 transition-all shadow-sm">
    <span className="material-symbols-outlined text-[24px]">{"cloud_upload"}</span>
    </div>
    <p className="text-[14px] text-[#292929] font-medium mb-1">{"\n              Kéo thả hình ảnh hoặc tài liệu vào đây hoặc "}<span className="text-[#FC6C26] underline underline-offset-2 font-semibold">{"Tải lên từ máy"}</span>
    </p>
    <p className="text-[12px] text-[#666666] max-w-sm">{"\n              Hỗ trợ định dạng JPG, PNG, HEIC, PDF (Dung lượng khuyến nghị dưới 10MB/tệp). Tối đa 5 tệp bằng chứng.\n            "}</p>
    </div>

    <div className="flex flex-col gap-2">
    <span id="attachment-count" className="text-[11px] text-[#666666] uppercase tracking-wider font-bold">{"Tài liệu đã chuẩn bị đính kèm (1)"}</span>
    <div data-attachment="true" className="flex items-center justify-between p-3 rounded-xl bg-[#FFFFFF] border border-[#E9E9E7] hover:border-[#FC6C26]/50 transition-colors">
    <div className="flex items-center gap-3 min-w-0">
    <div className="w-10 h-10 rounded-lg bg-[#FFF8F5] border border-[#FC6C26]/20 text-[#FC6C26] flex items-center justify-center shrink-0">
    <span className="material-symbols-outlined text-[20px]">{"image"}</span>
    </div>
    <div className="flex flex-col min-w-0">
    <span className="text-[13px] text-[#292929] font-bold truncate">{"anh_taplo_dong_ho_tra_xe_08h00.jpg"}</span>
    <div className="flex items-center gap-2 text-[11px] text-[#666666]">
    <span>{"1.8 MB"}</span>
    <span className="w-1 h-1 rounded-full bg-[#E9E9E7]"></span>
    <span className="text-[#10B981] font-semibold">{"Đã chọn tệp – Chưa gửi"}</span>
    </div>
    </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
    <button className="p-1.5 rounded-lg text-[#666666] hover:text-[#FC6C26] hover:bg-[#F7F7F5] transition-colors" title="Xem trước" type="button" aria-label="Xem trước bằng chứng" data-action="preview-attachment">
    <span className="material-symbols-outlined text-[18px]">{"visibility"}</span>
    </button>
    <button className="p-1.5 rounded-lg text-[#666666] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors" title="Xóa tệp" type="button" aria-label="Xóa tệp" data-action="remove-attachment">
    <span className="material-symbols-outlined text-[18px]">{"close"}</span>
    </button>
    </div>
    </div>
    </div>
    </div>

    <div className="bg-[#FFFFFF] border border-[#E9E9E7] rounded-[16px] p-6 shadow-sm relative flex flex-col gap-5">

    <label className="flex items-start gap-3 cursor-pointer group">
    <input className="sr-only" id="commit-checkbox" type="checkbox"/>
    <div className="w-5 h-5 rounded border border-[#E9E9E7] bg-[#F7F7F5] text-transparent flex items-center justify-center mt-0.5 shrink-0 shadow-sm transition-all" id="custom-checkbox"><span className="material-symbols-outlined text-[16px]">{"check"}</span></div>
    <span className="text-[13px] text-[#292929] leading-relaxed group-hover:text-[#FC6C26] transition-colors select-none">{"\n              Tôi xác nhận các thông tin và bằng chứng cung cấp trên là hoàn toàn trung thực, phản ánh đúng thực tế chuyến đi và chịu trách nhiệm trước quy chế giải quyết của CarDB.\n            "}</span>
    </label>

    <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E9E9E7] flex items-start gap-3">
    <span className="material-symbols-outlined text-[20px] text-[#FC6C26] mt-0.5 shrink-0">{"gavel"}</span>
    <p className="text-[13px] text-[#666666]">{"Yêu cầu sẽ được ghi nhận khi hệ thống xác nhận gửi thành công. Việc gửi tranh chấp không tự động hủy đơn thuê hay hoàn tiền."}</p>
    </div>

    <div className="flex-wrap gap-y-2 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
    <button className="w-full sm:w-auto px-6 py-3 rounded-[12px] bg-[#FFFFFF] border border-[#E9E9E7] text-[#292929] text-[14px] font-semibold hover:bg-[#F7F7F5] transition-all flex items-center justify-center gap-2 shadow-sm" type="button" aria-label="Quay lại chi tiết đơn" data-route="/don-thue/CDB-ORD-20261026-904">
    <span className="material-symbols-outlined text-[18px]">{"arrow_back"}</span>
    <span>{"Quay lại chi tiết đơn"}</span>
    </button>
    <button className="ui-action w-full sm:w-auto px-4 py-3.5 sm:px-6 rounded-[12px] bg-[#FC6C26] hover:bg-[#e05e1e] text-white text-[16px] font-bold shadow-[0_4px_14px_rgba(252,108,38,0.35)] hover:shadow-[0_6px_20px_rgba(252,108,38,0.45)] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5" id="submit-dispute-btn" type="button" aria-label="Gửi yêu cầu xem xét" data-action="dispute">
    <span>{"Gửi yêu cầu xem xét"}</span>
    <span className="material-symbols-outlined text-[20px]">{"arrow_forward"}</span>
    </button>
    </div>
    </div>
    </section>

    <aside className="lg:col-span-4 flex flex-col gap-6 sticky top-24">

    <div className="bg-[#FFFFFF] border border-[#E9E9E7] rounded-[16px] p-5 shadow-sm">
    <div className="flex items-center justify-between mb-4">
    <span className="text-[17px] text-[#292929] font-bold">{"Thông tin chuyến thuê"}</span>
    <span className="text-[12px] font-mono text-[#FC6C26] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF8F5] border border-[#FC6C26]/20">{"#CDB-904"}</span>
    </div>

    <div className="rounded-xl overflow-hidden bg-[#F7F7F5] border border-[#E9E9E7] mb-4">
    <div className="relative h-44 w-full overflow-hidden bg-white">
    <img className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700" src="/images/cardb-865fb6aa8738658d.webp" alt="Hình ảnh xe CarDB" loading="lazy" decoding="async"/>
    <div className="absolute bottom-2.5 left-3 flex gap-1.5">
    <span className="px-2 py-0.5 rounded bg-white/95 backdrop-blur text-[#292929] text-[11px] font-bold shadow-sm">{"SUV 7 CHỖ"}</span>
    <span className="px-2 py-0.5 rounded bg-[#FC6C26] text-white text-[11px] font-bold shadow-sm">{"THUẦN ĐIỆN AWD"}</span>
    </div>
    </div>
    <div className="p-3.5 flex flex-col gap-1">
    <div className="flex items-center justify-between">
    <h3 className="text-[16px] font-bold text-[#292929]">{"VinFast VF 9 Plus"}</h3>
    <span className="font-mono font-bold text-[13px] text-[#FC6C26]">{"51K-889.92"}</span>
    </div>
    <p className="text-[12px] text-[#666666]">{"Bản trần kính toàn cảnh • Ghế cơ trưởng thương gia"}</p>
    </div>
    </div>

    <div className="flex flex-col gap-2 text-[13px] pb-1">
    <div className="flex items-center justify-between py-2 bg-[#F7F7F5] px-3 rounded-lg border border-[#E9E9E7]/60">
    <span className="text-[#666666]">{"Mã đơn thuê:"}</span>
    <span className="font-mono font-bold text-[#292929]">{"CDB-ORD-20261026-904"}</span>
    </div>
    <div className="flex items-center justify-between py-2 bg-[#F7F7F5] px-3 rounded-lg border border-[#E9E9E7]/60">
    <span className="text-[#666666]">{"Chủ xe đối tác:"}</span>
    <div className="flex items-center gap-1.5">
    <span className="font-bold text-[#292929]">{"Trần Đức Nam"}</span>
    <span className="inline-flex items-center text-[#F5A623] text-[12px] font-bold">{"★ 5.0"}</span>
    </div>
    </div>
    <div className="flex items-center justify-between py-2 bg-[#F7F7F5] px-3 rounded-lg border border-[#E9E9E7]/60">
    <span className="text-[#666666]">{"Khách hàng:"}</span>
    <span className="font-bold text-[#292929]">{"Nguyễn Hoàng Minh"}</span>
    </div>
    <div className="flex items-center justify-between py-2 bg-[#F7F7F5] px-3 rounded-lg border border-[#E9E9E7]/60">
    <span className="text-[#666666]">{"Thời gian nhận:"}</span>
    <span className="font-semibold text-[#292929]">{"08:00, 26/10/2026"}</span>
    </div>
    <div className="flex items-center justify-between py-2 bg-[#F7F7F5] px-3 rounded-lg border border-[#E9E9E7]/60">
    <span className="text-[#666666]">{"Thời gian trả:"}</span>
    <span className="font-semibold text-[#292929]">{"08:00, 28/10/2026 (2 ngày)"}</span>
    </div>
    <div className="flex items-start justify-between py-2 bg-[#F7F7F5] px-3 rounded-lg border border-[#E9E9E7]/60">
    <span className="text-[#666666] shrink-0">{"Điểm giao nhận:"}</span>
    <span className="font-medium text-[#292929] text-right truncate pl-2 max-w-[200px]">{"128 Thảo Điền, TP. Thủ Đức, TP. HCM"}</span>
    </div>
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[#ECFDF5] border border-[#10B981]/20 mt-1">
    <span className="text-[12px] text-[#666666] font-medium">{"Tiền thuê đã thanh toán:"}</span>
    <span className="ui-money text-[17px] font-bold text-[#10B981] whitespace-nowrap">{"3.700.000 đ"}</span>
    </div>
    </div>
    </div>

    <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[16px] p-5 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
    <span className="w-8 h-8 rounded-lg bg-white border border-[#FDE68A] text-[#F5A623] flex items-center justify-center shadow-sm">
    <span className="material-symbols-outlined text-[20px]">{"lock"}</span>
    </span>
    <div className="flex flex-col"><h2 className="text-[16px] text-[#292929] font-bold">{"Đối soát tiền cọc"}</h2><span className="text-[11px] text-[#666666]">{"Quy trình đối soát minh bạch CarDB"}</span></div>
    </div>
    <div className="flex flex-col gap-2.5 my-3">
    <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#FDE68A]/60">
    <span className="text-[13px] text-[#666666]">{"Tiền cọc đã ghi nhận (C10-A):"}</span>
    <span className="ui-money text-[16px] font-bold text-[#292929] whitespace-nowrap">{"15.000.000 đ"}</span>
    </div>
    <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#FDE68A]/60">
    <span className="text-[13px] text-[#666666]">{"Khoản khấu trừ đã xác nhận:"}</span>
    <span className="ui-money text-[14px] font-bold text-[#666666] whitespace-nowrap">{"0 đ"}</span>
    </div>
    <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#FDE68A]/60">
    <span className="text-[13px] text-[#666666]">{"Trạng thái đối soát cọc:"}</span>
    <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] text-[12px] font-bold flex items-center gap-1">
    <span className="material-symbols-outlined text-[14px]">{"pending"}</span>
    <span>{"Chưa hoàn tất"}</span>
    </span>
    </div>
    </div>
    <div className="p-3.5 rounded-lg bg-white/70 border border-[#FDE68A]/40 text-[#666666] text-[12px] leading-relaxed">{"Tiền cọc và các khoản khấu trừ sẽ được xử lý theo kết quả đối soát và quy định áp dụng của CarDB."}</div>
    </div>

    <div className="bg-[#F7F7F5] border border-[#E9E9E7] rounded-[16px] p-5 shadow-sm">
    <div className="flex items-center justify-between mb-4">
    <h2 className="text-[16px] text-[#292929] font-bold">{"Quy trình xử lý minh bạch"}</h2>
    <span className="material-symbols-outlined text-[#FC6C26] text-[20px]">{"fact_check"}</span>
    </div>

    <div className="relative flex flex-col gap-4 pl-2 mb-5">
    <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-[#E9E9E7]"></div>

    <div className="relative flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-[#FC6C26] text-white text-[12px] font-bold flex items-center justify-center z-10 shadow-sm">{"1"}</div>
    <div className="flex flex-col flex-1 pt-1">
    <div className="flex items-center justify-between">
    <span className="text-[13px] font-bold text-[#292929]">{"1. Gửi yêu cầu"}</span>
    <span className="px-2 py-0.5 rounded-full bg-[#FFF0EA] text-[#FC6C26] text-[11px] font-bold">{"Đang soạn"}</span>
    </div>
    <span className="text-[12px] text-[#666666]">{"Khách hàng điền thông tin và nộp bằng chứng"}</span>
    </div>
    </div>

    <div className="relative flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-white border border-[#E9E9E7] text-[#666666] text-[12px] font-bold flex items-center justify-center z-10">{"2"}</div>
    <div className="flex flex-col flex-1 pt-1">
    <div className="flex items-center justify-between">
    <span className="text-[13px] font-medium text-[#292929]">{"2. Tiếp nhận"}</span>
    <span className="px-2 py-0.5 rounded-full bg-white border border-[#E9E9E7] text-[#666666] text-[11px]">{"Chờ gửi"}</span>
    </div>
    <span className="text-[12px] text-[#666666]">{"CarDB ghi nhận yêu cầu và đối chiếu với chủ xe"}</span>
    </div>
    </div>

    <div className="relative flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-white border border-[#E9E9E7] text-[#666666] text-[12px] font-bold flex items-center justify-center z-10">{"3"}</div>
    <div className="flex flex-col flex-1 pt-1">
    <div className="flex items-center justify-between">
    <span className="text-[13px] font-medium text-[#292929]">{"3. Đang xem xét"}</span>
    <span className="px-2 py-0.5 rounded-full bg-white border border-[#E9E9E7] text-[#666666] text-[11px]">{"Chờ xử lý"}</span>
    </div>
    <span className="text-[12px] text-[#666666]">{"Đối chiếu ảnh và thông tin biên bản bàn giao C10"}</span>
    </div>
    </div>

    <div className="relative flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-white border border-[#E9E9E7] text-[#666666] text-[12px] font-bold flex items-center justify-center z-10">{"4"}</div>
    <div className="flex flex-col flex-1 pt-1">
    <div className="flex items-center justify-between">
    <span className="text-[13px] font-medium text-[#292929]">{"4. Có kết quả"}</span>
    <span className="px-2 py-0.5 rounded-full bg-white border border-[#E9E9E7] text-[#666666] text-[11px]">{"Chưa thực hiện"}</span>
    </div>
    <span className="text-[12px] text-[#666666]">{"Thông báo kết quả đối soát và xử lý tiền cọc theo quy định"}</span>
    </div>
    </div>
    </div>

    <div className="p-3 rounded-lg bg-white border border-[#E9E9E7] mb-4 flex items-center gap-2 text-[#292929] text-[12px] font-medium">
    <span className="w-2 h-2 rounded-full bg-[#FC6C26]"></span>
    <span>{"Hiện tại: Chưa gửi yêu cầu tranh chấp cho đơn thuê này."}</span>
    </div>

    <div className="p-4 rounded-xl bg-white border border-[#E9E9E7] flex flex-col gap-2 shadow-sm">
    <div className="flex items-center gap-1.5 text-[#FC6C26] text-[11px] uppercase tracking-wider font-bold">
    <span className="material-symbols-outlined text-[16px]">{"contact_support"}</span>
    <span>{"HOTLINE TƯ VẤN KHIẾU NẠI"}</span>
    </div>
    <div className="flex items-baseline justify-between">
    <a className="text-[20px] font-bold text-[#FC6C26] hover:underline transition-colors tracking-tight" href="tel:19008899">{"1900 8899"}</a>
    <span className="px-2 py-0.5 rounded bg-[#FFF0EA] text-[#FC6C26] text-[11px] font-bold">{"Nhánh 2"}</span>
    </div>
    <p className="text-[12px] text-[#666666]">{"Hỗ trợ kiểm tra biên bản và hồ sơ bàn giao 24/7."}</p>
    </div>
    </div>
    </aside>
    </div>
    </div>


    </div></main></div>);
}
