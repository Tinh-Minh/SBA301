import { Link } from "react-router";
import { Icon } from "@/components/Icon.jsx";
import { ProfileSidebar } from "@/components/ProfileSidebar.jsx";
export function ProfileLayout({ active, title, actions, children }) {
    return <main className="profile-layout w-full bg-background pt-20">
    <div className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-lg">
      <nav aria-label="Đường dẫn hồ sơ" className="flex flex-wrap items-center gap-space-xs mb-space-md text-on-surface-variant font-body-sm text-body-sm">
        <Link to="/" className="hover:text-primary-container transition-colors">Trang chủ</Link>
        <Icon name="chevron_right" className="text-base text-outline"/>
        <Link to="/tai-khoan" className="hover:text-primary-container transition-colors">Hồ sơ &amp; Tài khoản</Link>
        <Icon name="chevron_right" className="text-base text-outline"/>
        <span aria-current="page" className="text-on-surface font-label-sm text-label-sm">{title}</span>
      </nav>
      <header className="profile-heading relative flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <h1 className="sr-only font-headline-lg text-headline-lg text-on-surface tracking-tight">{title}</h1>
        {actions ? <div className="profile-heading-actions flex w-full flex-wrap justify-end gap-2">{actions}</div> : null}
      </header>
      <div className="profile-columns grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <ProfileSidebar active={active} className="lg:col-span-4 xl:col-span-3"/>
        <section className="profile-content min-w-0 lg:col-span-8 xl:col-span-9 flex flex-col gap-space-lg" data-purpose={active === "banks" ? "bank-account-content" : "profile-content"}>
          {children}
        </section>
      </div>
    </div>
  </main>;
}
