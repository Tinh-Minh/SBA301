import { Link } from "react-router";
import { Icon } from "@/components/Icon.jsx";
import { ProfileSidebar } from "@/components/ProfileSidebar.jsx";
import { RequireAuth } from "@/components/RequireAuth.jsx";

const labels = {
    account: "Hồ sơ cá nhân",
    verification: "Hồ sơ định danh eKYC",
    reviews: "Đánh giá của tôi",
    subscriptions: "Gói đăng tin",
};

/** Authenticated account screens opt into the profile access guard. */
export function ProfileLayout({ active, title, description, actions, children, live = false }) {
    return <main data-native={live ? "" : undefined} className="profile-layout w-full pt-24 pb-16">
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
      <header className="editorial-hero-banner mb-8 p-6 sm:p-8">
        <nav aria-label="Đường dẫn hồ sơ" className="mb-3 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[#6C6C61]">
          <Link to="/" className="transition-colors hover:text-[#FC6C26]">Trang chủ</Link>
          <Icon name="chevron_right" className="text-sm text-[#868379]"/>
          <Link to="/account" className="transition-colors hover:text-[#FC6C26]">Hồ sơ &amp; Tài khoản</Link>
          <Icon name="chevron_right" className="text-sm text-[#868379]"/>
          <span aria-current="page" className="text-[#25251F]">{title}</span>
        </nav>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="min-w-0">
            <span className="editorial-kicker">{labels[active] ?? "Tài khoản CarDB"}</span>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#25251F] sm:text-3xl">{title}</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#5C584F]">{description}</p>
          </div>
          {actions ? <div className="profile-heading-actions shrink-0 md:max-w-[35%]">{actions}</div> : null}
        </div>
      </header>

      <div className="profile-columns grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-12">
        <ProfileSidebar active={active} className="lg:col-span-4 xl:col-span-3"/>
        <section className="profile-content flex min-w-0 flex-col gap-6 lg:col-span-8 xl:col-span-9" data-purpose={active === "banks" ? "bank-account-content" : "profile-content"}>
          {live ? <RequireAuth>{children}</RequireAuth> : children}
        </section>
      </div>
    </div>
  </main>;
}
