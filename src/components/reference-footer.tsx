import Link from "next/link";
import { Icon } from "./icon";
import { SiteBrand } from "./site-brand";

const groups = [
  { title: "Dịch vụ", links: [["Thuê xe tự lái", "/kham-pha-xe"], ["Thuê xe có tài xế", "/xe-kem-tai-xe"], ["Bảng giá & Cách tính", "/cach-tinh-gia"], ["Thuê xe theo tháng", "/thue-xe-dai-han"]] },
  { title: "Chính sách & Hỗ trợ", links: [["Bảo hiểm chuyến đi", "/chinh-sach-bao-hiem"], ["Quy định đặt cọc", "/quy-dinh-dat-coc"], ["Chính sách hoàn hủy", "/chinh-sach-huy-chuyen"], ["Câu hỏi thường gặp", "/cau-hoi-thuong-gap"]] },
  { title: "Về CarDB", links: [["Ưu đãi khách hàng", "/uu-dai"], ["Tuyển dụng tài xế", "/lien-he"], ["Liên hệ hợp tác", "/cho-thue-xe"]] },
];

export function ReferenceFooter() {
  return <footer className="relative z-10 border-t border-border-light bg-section-bg px-6 pt-12 pb-8 text-text-primary md:px-10">
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col justify-between gap-10 border-b border-border-light pb-10 xl:flex-row">
        <div className="max-w-sm space-y-4">
          <SiteBrand />
          <p className="pr-4 text-sm leading-relaxed text-text-secondary">Nền tảng công nghệ cho thuê xe tự lái và xe có tài xế cao cấp. Minh bạch, an tâm trọn từng hành trình.</p>
          <a href="tel:19008899" className="inline-flex items-center gap-3 pt-2"><span className="flex size-9 items-center justify-center rounded-full border border-brand-accent/20 bg-accent-soft text-brand-accent"><Icon name="call" className="text-[16px]" /></span><span className="flex flex-col gap-1"><span className="text-[10px] font-semibold uppercase leading-none text-text-secondary">Tổng đài CSKH 24/7</span><strong className="text-base leading-tight text-brand-accent hover:underline">1900 8899</strong></span></a>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:gap-12 xl:gap-16">{groups.map(group => <nav key={group.title} aria-label={group.title} className="space-y-3"><h3 className="text-xs font-bold uppercase tracking-wider">{group.title}</h3><ul className="space-y-2 text-sm text-text-secondary">{group.links.map(([label, href]) => <li key={label}><Link href={href} className="whitespace-nowrap transition-colors hover:text-brand-accent">{label}</Link></li>)}</ul></nav>)}</div>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 pt-6 text-xs text-text-secondary md:flex-row">
        <p className="text-center md:text-left">© 2026 CarDB Việt Nam. Bảo lưu mọi quyền.</p>
        <nav aria-label="Chính sách" className="flex flex-wrap justify-center gap-x-6 gap-y-3"><Link href="/dieu-khoan-su-dung" className="hover:text-brand-accent">Điều khoản dịch vụ</Link><Link href="/chinh-sach-bao-mat" className="hover:text-brand-accent">Chính sách bảo mật</Link><Link href="/dieu-khoan-su-dung" className="hover:text-brand-accent">Quy chế hoạt động</Link></nav>
      </div>
    </div>
  </footer>;
}
