import Link from "next/link";

const services = [
  ["/thue-xe-tu-lai", "Thuê xe tự lái"],
  ["/xe-kem-tai-xe", "Xe kèm tài xế"],
  ["/bang-gia-dong-xe", "Bảng giá & Dòng xe"],
  ["/thue-xe-dai-han", "Thuê xe theo tháng"],
] as const;
const information = [
  ["/ve-kanow", "Về Kanow"],
  ["/uu-dai", "Ưu đãi"],
  ["/lien-he", "Liên hệ"],
  ["/cau-hoi-thuong-gap", "Câu hỏi thường gặp"],
] as const;

export function ReferenceFooter() {
  return <footer className="border-t border-border-subtle bg-white">
    <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-x-6 gap-y-8 px-4 py-9 sm:grid-cols-[1.6fr_1fr_1fr] sm:px-8 sm:py-10">
      <div className="col-span-2 sm:col-span-1">
        <Link href="/" aria-label="Kanow — Trang chủ" className="text-[25px] font-bold tracking-[-1.4px] text-primary">kanow<span className="text-accent">.</span></Link>
        <p className="mt-3 max-w-xs text-sm leading-6 text-text-muted">Thuê xe tự lái và xe kèm tài xế.<br />Chọn xe, xem giá, lên đường.</p>
        <a href="tel:19008888" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">1900 8888</a>
      </div>
      <div><p className="mb-3 text-sm font-semibold text-primary">Dịch vụ</p><ul className="space-y-2.5">{services.map(([href, label]) => <li key={href}><Link href={href} className="text-xs leading-5 text-on-surface-variant hover:text-primary hover:underline">{label}</Link></li>)}</ul></div>
      <div><p className="mb-3 text-sm font-semibold text-primary">Thông tin</p><ul className="space-y-2.5">{information.map(([href, label]) => <li key={href}><Link href={href} className="text-xs leading-5 text-on-surface-variant hover:text-primary hover:underline">{label}</Link></li>)}</ul></div>
    </div>
    <div className="mx-auto flex max-w-[1240px] flex-col gap-3 border-t border-border-subtle px-4 py-5 text-[11px] text-text-muted sm:flex-row sm:justify-between sm:px-8">
      <p>© 2026 Kanow. Bảo lưu mọi quyền.</p>
      <div className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/dieu-khoan-su-dung" className="hover:text-primary">Điều khoản dịch vụ</Link><Link href="/chinh-sach-bao-mat" className="hover:text-primary">Bảo mật</Link><Link href="/chinh-sach-bao-hiem" className="hover:text-primary">Bảo hiểm</Link><Link href="/chinh-sach-huy-chuyen" className="hover:text-primary">Hoàn hủy</Link></div>
    </div>
  </footer>;
}
