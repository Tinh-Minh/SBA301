import Link from "next/link";
import { Icon } from "./icon";
import { ProfileSidebar } from "./profile-sidebar";
import { RequireAuth } from "./require-auth";
import "../styles/profile.css";
const labels = {
    account: "Hồ sơ cá nhân",
    verification: "Hồ sơ định danh eKYC",
    driver: "Hồ sơ tài xế",
    banks: "Tài khoản ngân hàng",
    orders: "Quản lý đơn thuê",
    history: "Lịch sử chuyến đi",
};
/** `live`: màn lấy dữ liệu backend — bỏ qua bộ xử lý click demo và yêu cầu đăng nhập. */
export function ProfileLayout({ active, title, description, actions, children, live = false }) {
    return <main data-native={live ? "" : undefined} className="profile-layout w-full bg-background pt-20">
    <div className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-lg">
      <nav aria-label="Đường dẫn hồ sơ" className="flex flex-wrap items-center gap-space-xs mb-space-md text-on-surface-variant font-body-sm text-body-sm">
        <Link href="/" className="hover:text-primary-container transition-colors">Trang chủ</Link>
        <Icon name="chevron_right" className="text-base text-outline"/>
        <Link href="/tai-khoan" className="hover:text-primary-container transition-colors">Hồ sơ &amp; Tài khoản</Link>
        <Icon name="chevron_right" className="text-base text-outline"/>
        <span aria-current="page" className="text-on-surface font-label-sm text-label-sm">{title}</span>
      </nav>
      <header className="profile-heading flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-space-xs mb-space-xs">
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm uppercase tracking-wider">{labels[active]}</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{title}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs max-w-2xl">{description}</p>
        </div>
        {actions ? <div className="profile-heading-actions shrink-0 md:max-w-[35%]">{actions}</div> : null}
      </header>
      <div className="profile-columns grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <ProfileSidebar active={active} className="lg:col-span-4 xl:col-span-3"/>
        <section className="profile-content min-w-0 lg:col-span-8 xl:col-span-9 flex flex-col gap-space-lg" data-purpose={active === "banks" ? "bank-account-content" : "profile-content"}>
          {live ? <RequireAuth>{children}</RequireAuth> : children}
        </section>
      </div>
    </div>
  </main>;
}
