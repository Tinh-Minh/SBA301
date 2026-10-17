import { Link } from "react-router";
export default function ReviewPage() {
    return (<div className="cardb-screen screen-review bg-section-bg font-sans text-charcoal antialiased  flex flex-col justify-between"><main className="w-full  bg-section-bg flex-1 pt-20"><div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10">

    <div className="flex flex-col gap-2 mb-8">
    <nav className="flex items-center gap-2 text-sm text-muted-gray">
    <Link className="hover:text-primary transition-colors flex items-center gap-1.5" to="/tai-khoan/don-thue">
    <span className="material-symbols-outlined text-[16px]">{"history_edu"}</span>{"\n          Chuyến xe của tôi\n        "}</Link>
    <span className="text-border-subtle">{"/"}</span>
    <Link className="hover:text-primary transition-colors" to="/xe/vinfast-vf8-plus-2024">{"Chi tiết đơn thuê"}</Link>
    <span className="text-border-subtle">{"/"}</span>
    <span className="text-primary font-semibold">{"Đánh giá chuyến thuê"}</span>
    </nav>
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
    <div>
    <h1 className="text-[28px] font-bold text-charcoal tracking-tight">{"Đánh giá chuyến thuê"}</h1>
    <p className="text-sm md:text-base text-muted-gray mt-1 max-w-2xl">{"\n            Chia sẻ trải nghiệm của bạn để giúp cộng đồng CarDB lựa chọn xe phù hợp và đồng hành nâng cao chất lượng vận hành.\n          "}</p>
    </div>
    <div className="flex items-center gap-2 self-start md:self-auto bg-emerald-bg border border-emerald-200 px-4 py-1.5 rounded-full shadow-sm">
    <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-tag opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-tag"></span>
    </span>
    <span className="text-xs font-bold text-emerald-tag tracking-wider uppercase">{"Chuyến thuê đã hoàn thành"}</span>
    </div>
    </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

    <section className="lg:col-span-7 flex flex-col gap-6">
    <div className="bg-surface-card border border-border-subtle rounded-2xl p-7 md:p-8 shadow-sm flex flex-col gap-7">

    <div className="flex items-center justify-between border-b border-border-subtle pb-4">
    <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
    <span className="material-symbols-outlined text-[18px]">{"reviews"}</span>{"\n              Trải nghiệm chuyến thuê của bạn\n            "}</span>
    <span className="text-xs font-semibold text-primary bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">{"Bắt buộc"}</span>
    </div>

    <div className="bg-section-bg border border-border-subtle rounded-xl p-6 text-center flex flex-col items-center justify-center gap-3">
    <h2 className="text-[18px] font-bold text-charcoal">{"Đánh giá tổng thể chất lượng chuyến đi"}</h2>

    <div className="flex items-center justify-center gap-3 py-1" id="overall-star-group">
    <button aria-label="1 sao" className="star-btn transition-transform hover:scale-110 p-1 text-gray-300 hover:text-star-gold focus:outline-none" data-star="1" type="button">
    <span className="material-symbols-outlined text-[36px] transition-colors leading-none">{"star"}</span>
    </button>
    <button aria-label="2 sao" className="star-btn transition-transform hover:scale-110 p-1 text-gray-300 hover:text-star-gold focus:outline-none" data-star="2" type="button">
    <span className="material-symbols-outlined text-[36px] transition-colors leading-none">{"star"}</span>
    </button>
    <button aria-label="3 sao" className="star-btn transition-transform hover:scale-110 p-1 text-gray-300 hover:text-star-gold focus:outline-none" data-star="3" type="button">
    <span className="material-symbols-outlined text-[36px] transition-colors leading-none">{"star"}</span>
    </button>
    <button aria-label="4 sao" className="star-btn transition-transform hover:scale-110 p-1 text-gray-300 hover:text-star-gold focus:outline-none" data-star="4" type="button">
    <span className="material-symbols-outlined text-[36px] transition-colors leading-none">{"star"}</span>
    </button>
    <button aria-label="5 sao" className="star-btn transition-transform hover:scale-110 p-1 text-gray-300 hover:text-star-gold focus:outline-none" data-star="5" type="button">
    <span className="material-symbols-outlined text-[36px] transition-colors leading-none">{"star"}</span>
    </button>
    </div>
    <div className="h-6 flex items-center justify-center">
    <span className="text-sm font-medium text-muted-gray transition-all" id="rating-feedback-label">{"\n                Chọn số sao để đánh giá trải nghiệm tổng thể\n              "}</span>
    </div>
    </div>

    <div className="flex flex-col gap-4">
    <div>
    <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
    <span className="material-symbols-outlined text-primary text-[20px]">{"tune"}</span>{"\n                Đánh giá theo tiêu chí cụ thể\n              "}</h3>
    <p className="text-[13px] text-muted-gray mt-0.5">{"\n                Đánh giá theo từng tiêu chí để chủ xe cải thiện dịch vụ và bảo toàn tiêu chuẩn xe sang\n              "}</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

    <div className="bg-section-bg border border-border-subtle rounded-xl p-4 flex flex-col justify-between gap-2">
    <div>
    <span className="text-sm font-bold text-charcoal block">{"Chất lượng & Vận hành xe"}</span>
    <span className="text-xs text-muted-gray block mt-0.5">{"Động cơ êm, pin tốt, vận hành ổn định"}</span>
    </div>
    <div className="flex items-center gap-1.5 pt-1 criteria-group" data-criterion="operation">
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="1" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="2" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="3" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="4" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="5" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    </div>
    </div>

    <div className="bg-section-bg border border-border-subtle rounded-xl p-4 flex flex-col justify-between gap-2">
    <div>
    <span className="text-sm font-bold text-charcoal block">{"Vệ sinh & Tình trạng nội thất"}</span>
    <span className="text-xs text-muted-gray block mt-0.5">{"Khử khuẩn, thơm mới, ghế da sạch"}</span>
    </div>
    <div className="flex items-center gap-1.5 pt-1 criteria-group" data-criterion="cleanliness">
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="1" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="2" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="3" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="4" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="5" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    </div>
    </div>

    <div className="bg-section-bg border border-border-subtle rounded-xl p-4 flex flex-col justify-between gap-2">
    <div>
    <span className="text-sm font-bold text-charcoal block">{"Thái độ & Hỗ trợ từ chủ xe"}</span>
    <span className="text-xs text-muted-gray block mt-0.5">{"Nhiệt tình, đúng giờ, giao xe tận tâm"}</span>
    </div>
    <div className="flex items-center gap-1.5 pt-1 criteria-group" data-criterion="attitude">
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="1" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="2" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="3" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="4" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="5" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    </div>
    </div>

    <div className="bg-section-bg border border-border-subtle rounded-xl p-4 flex flex-col justify-between gap-2">
    <div>
    <span className="text-sm font-bold text-charcoal block">{"Thủ tục bàn giao nhanh chóng"}</span>
    <span className="text-xs text-muted-gray block mt-0.5">{"Đối soát biên bản minh bạch, thuận tiện"}</span>
    </div>
    <div className="flex items-center gap-1.5 pt-1 criteria-group" data-criterion="procedure">
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="1" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="2" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="3" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="4" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    <button className="c-star text-gray-300 hover:text-star-gold transition-colors focus:outline-none" data-val="5" type="button" aria-label="Thao tác"><span className="material-symbols-outlined text-[22px]">{"star"}</span></button>
    </div>
    </div>
    </div>
    </div>

    <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
    <label className="text-sm font-bold text-charcoal" htmlFor="review-content">{"Nhận xét chi tiết"}</label>
    <span className="text-xs text-muted-gray" id="char-counter">{"0 / 1000 ký tự"}</span>
    </div>
    <textarea className="w-full bg-page-bg border border-border-subtle rounded-xl p-4 text-charcoal placeholder:text-muted-gray min-h-[140px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm leading-relaxed" id="review-content" maxLength={1000} placeholder="Nhập nhận xét chi tiết về chuyến đi, cảm nhận lái xe VinFast VF 9, độ sạch sẽ, sự chu đáo của chủ xe Trần Đức Nam..." rows={5}></textarea>
    </div>

    <div className="bg-status-amber-faint border border-status-amber-border rounded-xl p-4 flex items-start gap-3">
    <span className="material-symbols-outlined text-status-amber-dark text-[20px] shrink-0 mt-0.5">{"info"}</span>
    <p className="text-[13px] text-charcoal leading-relaxed">{"\n              Vui lòng đánh giá trung thực, văn minh và không chia sẻ thông tin cá nhân bí mật (CMND/CCCD, mã thẻ tín dụng, số điện thoại) để đảm bảo tuân thủ tiêu chuẩn cộng đồng CarDB.\n            "}</p>
    </div>

    <div className="flex-wrap gap-y-2 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border-subtle">
    <Link className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-border-subtle text-charcoal font-medium text-sm hover:bg-section-bg transition-all flex items-center justify-center gap-2" to="/tai-khoan/don-thue">{"\n              ← Quay lại chi tiết đơn\n            "}</Link>
    <button className="ui-action w-full sm:w-auto px-4 py-3.5 sm:px-6 rounded-xl bg-primary hover:bg-primary-hover text-page-bg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer" id="submit-review-btn" type="button" aria-label="Gửi đánh giá chuyến đi" data-action="review">
    <span>{"Gửi đánh giá chuyến đi"}</span>
    <span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
    </button>
    </div>
    </div>
    </section>

    <aside className="lg:col-span-5 flex flex-col gap-6">

    <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-sm flex flex-col gap-5">
    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
    <span className="text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-1.5">
    <span className="material-symbols-outlined text-primary text-[18px]">{"description"}</span>{"\n                Hồ sơ chuyến xe\n              "}</span>
    <span className="px-2.5 py-0.5 rounded-full bg-emerald-bg text-emerald-tag text-[11px] font-bold">{"Đã hoàn thành"}</span>
    </div>

    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100 border border-border-subtle group">
    <img alt="VinFast VF 9 Plus AWD" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" src="/images/cardb-02d5cb41aa8f9514.webp" loading="lazy" decoding="async"/>
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
    <div>
    <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider block w-fit mb-1">{"SUV 7 chỗ thuần điện"}</span>
    <h4 className="text-base font-bold text-white leading-tight">{"VinFast VF 9 Plus AWD"}</h4>
    </div>
    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-charcoal text-xs font-bold rounded-lg shadow-sm">{"\n                51K-889.92\n              "}</span>
    </div>
    </div>

    <div className="bg-section-bg border border-border-subtle rounded-xl p-4 flex flex-col gap-3 text-xs">
    <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
    <span className="text-muted-gray">{"Mã hợp đồng"}</span>
    <span className="font-bold text-charcoal">{"CDB-ORD-20261026-904"}</span>
    </div>
    <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
    <span className="text-muted-gray">{"Chủ xe đối tác"}</span>
    <div className="text-right">
    <span className="font-bold text-charcoal block">{"Trần Đức Nam"}</span>
    <span className="text-star-gold font-semibold flex items-center justify-end gap-1">
    <span className="material-symbols-outlined text-[13px]" style={{ "fontVariationSettings": "'FILL' 1" }}>{"star"}</span>{"\n                  5.0 (100% phản hồi)\n                "}</span>
    </div>
    </div>
    <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
    <span className="text-muted-gray">{"Khách thuê"}</span>
    <span className="font-bold text-charcoal">{"Nguyễn Hoàng Minh"}</span>
    </div>
    <div className="flex items-start justify-between pb-2 border-b border-border-subtle">
    <span className="text-muted-gray shrink-0">{"Thời gian thuê"}</span>
    <span className="text-right text-charcoal font-semibold">{"\n                08:00, 26/10/2026 –"}<br />{"08:00, 28/10/2026 "}<span className="text-primary font-bold">{"(2 ngày)"}</span>
    </span>
    </div>
    <div className="flex items-start justify-between">
    <span className="text-muted-gray shrink-0">{"Điểm giao nhận"}</span>
    <span className="text-right text-charcoal font-medium max-w-[200px]">{"\n                128 Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh\n              "}</span>
    </div>
    </div>
    </div>

    <div className="bg-section-bg border border-border-subtle rounded-2xl p-6 shadow-sm flex flex-col gap-4">
    <div className="flex items-center gap-2 pb-1 border-b border-border-subtle">
    <span className="material-symbols-outlined text-primary text-[20px]">{"verified"}</span>
    <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">{"\n              Quy chế đánh giá minh bạch\n            "}</h4>
    </div>
    <ul className="flex flex-col gap-3 text-xs text-charcoal leading-relaxed">
    <li className="flex items-start gap-2.5">
    <span className="text-emerald-tag font-bold">{"✓"}</span>
    <span>{"Đánh giá chỉ áp dụng cho chuyến thuê đã hoàn tất thủ tục bàn giao và đối soát chi phí."}</span>
    </li>
    <li className="flex items-start gap-2.5">
    <span className="text-emerald-tag font-bold">{"✓"}</span>
    <span>{"Chỉ khách thuê đứng tên trên hợp đồng mới có quyền gửi nhận xét và bình điểm."}</span>
    </li>
    <li className="flex items-start gap-2.5">
    <span className="text-emerald-tag font-bold">{"✓"}</span>
    <span>{"Mỗi đơn thuê ghi nhận duy nhất 01 lượt đánh giá bất biến, không chỉnh sửa sau khi duyệt."}</span>
    </li>
    <li className="flex items-start gap-2.5">
    <span className="text-emerald-tag font-bold">{"✓"}</span>
    <span>{"Nhận xét sẽ hiển thị công khai trên hồ sơ xe sau khi hệ thống Telemetry kiểm tra tự động."}</span>
    </li>
    </ul>

    <div className="bg-surface-card border border-border-subtle rounded-xl p-3.5 flex items-center justify-between mt-1">
    <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-full bg-orange-50 text-primary flex items-center justify-center">
    <span className="material-symbols-outlined text-[18px]">{"support_agent"}</span>
    </div>
    <div className="flex flex-col">
    <span className="text-[10px] text-muted-gray uppercase font-semibold">{"Hỗ trợ đối soát 24/7"}</span>
    <span className="text-xs font-bold text-charcoal">{"1900 8899"}</span>
    </div>
    </div>
    <a className="px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-section-bg text-charcoal text-xs font-semibold transition-all" href="tel:19008899">{"\n              Gọi trợ giúp\n            "}</a>
    </div>
    </div>
    </aside>
    </div>
    </div>
    </main></div>);
}
