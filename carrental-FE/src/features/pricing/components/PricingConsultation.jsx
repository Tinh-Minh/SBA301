import { useState } from "react";
import { Icon } from "@/shared/components/Icon.jsx";
export function PricingConsultation() {
    const [submitted, setSubmitted] = useState(false);
    function submit(event) {
        event.preventDefault();
        event.stopPropagation();
        setSubmitted(true);
    }
    return <section id="enterpriseConsult" data-pricing-section="enterprise" className="bg-card-bg py-12 md:py-16">
    <div className="mx-auto grid max-w-[1240px] items-center gap-6 px-5 md:px-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-accent">Dành cho khách hàng doanh nghiệp</p><h2 className="text-3xl font-bold leading-tight tracking-tight lg:text-5xl">Giải pháp thuê xe<br />cho kế hoạch dài hạn</h2><p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary">Trao đổi nhu cầu sử dụng xe theo tháng, quý hoặc năm. CarDB cùng bạn lựa chọn phương án giao nhận, hồ sơ và lịch thanh toán phù hợp.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">{[
            ["receipt_long", "Hồ sơ & hóa đơn", "Thống nhất thông tin hợp đồng, chứng từ và hóa đơn trước khi thuê."],
            ["directions_car", "Phương án thay thế", "Trao đổi nhu cầu xe dự phòng cho lịch sử dụng dài hạn."],
            ["badge", "Dịch vụ tài xế", "Chọn xe tự lái hoặc bổ sung tài xế theo lịch trình doanh nghiệp."],
            ["payment", "Thanh toán linh hoạt", "Đối chiếu lịch thanh toán và điều kiện cọc trong báo giá riêng."],
        ].map(([icon, title, description]) => <article key={title} className="flex items-start gap-3 rounded-xl bg-section-bg p-4 shadow-sm"><Icon name={icon} className="text-brand-accent"/><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-relaxed text-text-secondary">{description}</p></div></article>)}</div>
        <div className="flex flex-wrap items-center gap-4"><button type="button" onClick={() => window.print()} className="ui-action inline-flex items-center gap-2 rounded-full bg-brand-accent px-5 py-3 text-sm font-semibold text-on-primary shadow-md hover:bg-primary-hover"><Icon name="print" className="text-[20px]"/>In / Lưu bảng giá PDF</button><span className="text-xs text-text-secondary">Lưu bảng giá bằng chức năng in của trình duyệt</span></div>
      </div>
      <div className="rounded-2xl border border-border-light bg-card-bg p-6 shadow-lg md:p-10 lg:col-span-5"><p className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-accent"><Icon name="mark_email_read"/>Báo giá doanh nghiệp</p><h3 className="text-2xl font-semibold">Trao đổi nhu cầu thuê xe</h3><p className="mb-6 mt-3 text-xs leading-relaxed text-text-secondary">Điền thông tin để xem trước yêu cầu tư vấn của doanh nghiệp.</p>
        <form onSubmit={submit} className="space-y-4">
          <div><label htmlFor="enterprise-name" className="mb-1 block text-xs font-semibold">Tên doanh nghiệp / tổ chức *</label><input id="enterprise-name" name="company" type="text" required placeholder="Tên doanh nghiệp của bạn" className="w-full rounded-xl bg-section-bg px-4 py-3 text-sm"/></div>
          <div className="grid gap-3 sm:grid-cols-2"><div><label htmlFor="enterprise-contact" className="mb-1 block text-xs font-semibold">Người liên hệ *</label><input id="enterprise-contact" name="contact" required autoComplete="name" placeholder="Nguyễn Văn A" className="w-full rounded-xl bg-section-bg px-4 py-3 text-sm"/></div><div><label htmlFor="enterprise-phone" className="mb-1 block text-xs font-semibold">Số điện thoại *</label><input id="enterprise-phone" name="phone" type="tel" required autoComplete="tel" placeholder="0901 234 567" className="w-full rounded-xl bg-section-bg px-4 py-3 text-sm"/></div></div>
          <div><label htmlFor="enterprise-fleet" className="mb-1 block text-xs font-semibold">Số lượng & loại xe</label><select id="enterprise-fleet" name="fleet" className="w-full rounded-xl bg-section-bg px-4 py-3 text-sm"><option>Từ 1–3 xe theo tháng / năm</option><option>Từ 4–10 xe cho chuyên gia</option><option>Trên 10 xe cho dự án</option><option>Xe kèm tài xế</option></select></div>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-text-primary px-4 py-3 text-sm font-semibold text-on-primary hover:bg-brand-accent"><Icon name="check" className="text-[20px]"/>Xem trước yêu cầu báo giá</button>
          {submitted ? <p role="status" className="rounded-lg bg-status-success/10 p-3 text-xs leading-relaxed text-status-success-ink">Đã lưu yêu cầu trong bản xem trước. Gọi <a href="tel:19008899" className="font-bold underline">1900 8899</a> để trao đổi trực tiếp với CarDB.</p> : null}
        </form>
      </div>
    </div>
  </section>;
}
