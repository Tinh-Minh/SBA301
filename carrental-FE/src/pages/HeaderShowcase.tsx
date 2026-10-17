import { Header } from "@/components/Header";
import { ReferenceFooter } from "@/components/ReferenceFooter";

export default function HeaderShowcase() {
  return <main className="px-6 pt-28 pb-12 md:px-10"><div className="mx-auto max-w-6xl space-y-12">
    <div className="border-b border-border-light pb-5"><h1 className="text-2xl font-bold text-text-primary md:text-3xl">Các trạng thái điều hướng CarDB</h1><p className="mt-2 text-sm text-text-secondary">Thành phần dùng chung cho khách vãng lai, khách đã đăng nhập và chân trang hệ thống.</p></div>
    <section className="space-y-3"><h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">1. Khách chưa đăng nhập</h2><Header previewState={false} /></section>
    <section className="space-y-3"><h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">2. Khách đã đăng nhập</h2><Header previewState /></section>
    <section className="space-y-3"><h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">3. Chân trang dùng chung</h2><div className="overflow-hidden rounded-2xl border border-border-light shadow-sm"><ReferenceFooter /></div></section>
  </div></main>;
}
