import { Link, useLocation, useNavigate } from "react-router";
import { useId, useState } from "react";
import { useAuth } from "@/hooks/useAuth.js";
import { Icon } from "@/components/Icon.jsx";
import { SiteBrand } from "@/components/SiteBrand.jsx";
import { initials, membershipLabel } from "@/utils/labels.js";

const publicNavigation = [["/explore", "Khám phá xe"], ["/my-trips", "Chuyến xe của tôi"], ["/list-your-car", "Cho thuê xe"], ["/pricing", "Cách tính giá"]];
const memberNavigation = [["/explore", "Khám phá xe"], ["/my-trips", "Chuyến xe của tôi"], ["/owner/dashboard", "Chủ xe"], ["/pricing", "Cách tính giá"]];
const adminLink = ["/admin/dashboard", "Quản trị"];
const accountLinks = [["/account", "Hồ sơ cá nhân", "badge"], ["/account/driver", "Hồ sơ tài xế", "id_card"], ["/account/orders", "Đơn thuê xe", "receipt_long"], ["/account/history", "Lịch sử chuyến đi", "history"], ["/account/bank", "Tài khoản ngân hàng", "account_balance"], ["/owner/dashboard", "Kênh chủ xe", "directions_car"]];
export function Header({ previewState } = {}) {
    const instance = useId();
    const mobileId = previewState === undefined ? "mobile-navigation" : `mobile-navigation-${instance}`;
    const accountId = previewState === undefined ? "account-menu" : `account-menu-${instance}`;
    const path = useLocation().pathname;
    const navigate = useNavigate();
    const { loggedIn: authenticated, user, driver, isAdmin, isDriver, logout } = useAuth();
    const loggedIn = previewState ?? authenticated;
    const displayName = user?.fullName || (previewState ? "Khách hàng CarDB" : "Tài khoản");
    const displayCode = user ? `${membershipLabel(user, driver)} • #${user.id}` : "CarDB";
    const navigation = loggedIn ? (isAdmin ? [...memberNavigation, adminLink] : memberNavigation) : publicNavigation;
    const menuLinks = isAdmin ? [...accountLinks, ["/admin/dashboard", "Trang quản trị", "admin_panel_settings"]] : accountLinks;
    const activePath = previewState === undefined ? path : loggedIn ? "/my-trips" : "/explore";
    const overPhoto = previewState === undefined && (path === "/login" || path === "/register");
    const [menu, setMenu] = useState(false);
    const [account, setAccount] = useState(false);
    function close() { setMenu(false); setAccount(false); }
    function signOut() { logout(); close(); navigate("/"); }
    return <header className={`site-header ${overPhoto ? "auth-overlay" : "border-border-light bg-white/95 backdrop-blur-xl"} ${previewState === undefined ? `fixed inset-x-0 top-0 z-50 ${overPhoto ? "" : "border-b"}` : "relative w-full rounded-2xl border shadow-sm"}`}>
    <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
      <SiteBrand compact onClick={close}/>
      <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 lg:flex">{navigation.map(([href, label]) => <Link key={href} to={href} onClick={close} aria-current={activePath.startsWith(href) ? "page" : undefined} className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${activePath.startsWith(href) ? "bg-accent-soft font-semibold text-brand-accent" : "text-text-secondary hover:bg-section-bg hover:text-text-primary"}`}>{label}</Link>)}</nav>
      <div className="flex items-center gap-2 sm:gap-4">
        <a href="tel:19008899" className="hidden shrink-0 items-center gap-2 md:flex"><span className="flex size-8 items-center justify-center rounded-full bg-accent-soft text-brand-accent"><Icon name="call" className="text-[16px]"/></span><span className="flex flex-col gap-1"><span className="text-[9px] font-semibold uppercase leading-none text-text-secondary">Hỗ trợ 24/7</span><strong className="text-xs leading-none text-brand-accent">1900 8899</strong></span></a>
        {loggedIn ? <div className="relative"><button type="button" aria-label={`Tài khoản ${displayName}`} aria-expanded={account} aria-controls={accountId} onClick={() => { setAccount(value => !value); setMenu(false); }} className="flex items-center gap-2 border-l border-border-light py-2 pl-3 text-left sm:gap-3 sm:pl-5"><span className="relative"><span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-accent to-[#ff8f59] text-xs font-bold text-white shadow-inner">{initials(displayName)}</span><span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-emerald-500"/></span><span className="hidden flex-col gap-1 sm:flex"><span className="flex items-center gap-1.5 text-xs font-bold leading-none text-text-primary">{displayName}{isAdmin ? <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] text-amber-700">ADMIN</span> : isDriver ? <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] text-emerald-700">TÀI XẾ</span> : null}</span><span className="text-[10px] leading-none text-text-secondary">{displayCode}</span></span><Icon name="expand_more" className="text-[18px] text-text-secondary"/></button>
          {account ? <><button type="button" tabIndex={-1} aria-label="Đóng menu tài khoản" onClick={() => setAccount(false)} className="fixed inset-0 z-[-1] cursor-default"/><nav id={accountId} aria-label="Tài khoản" onKeyDown={event => { if (event.key === "Escape")
            setAccount(false); }} className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-border-light bg-white p-2 shadow-xl">{menuLinks.map(([href, label, icon]) => <Link key={href} to={href} onClick={close} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-text-primary hover:bg-accent-soft hover:text-brand-accent"><Icon name={icon} className="text-[18px]"/>{label}</Link>)}<button type="button" onClick={signOut} className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-border-light px-3 py-2.5 text-sm text-error hover:bg-error-container/30"><Icon name="logout" className="text-[18px]"/>Đăng xuất</button></nav></> : null}
        </div> : <><Link to="/login" className="rounded-lg px-2 py-2 text-xs font-semibold text-text-primary hover:text-brand-accent sm:text-sm">Đăng nhập</Link><Link to="/register" className="hidden items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-shadow hover:bg-primary-hover hover:shadow-md sm:inline-flex">Đăng ký<Icon name="arrow_forward" className="text-[16px]"/></Link></>}
        <button type="button" aria-label={menu ? "Đóng menu" : "Mở menu"} aria-expanded={menu} aria-controls={mobileId} onClick={() => { setMenu(value => !value); setAccount(false); }} className="header-menu-toggle flex size-9 items-center justify-center rounded-lg border border-border-light text-text-primary lg:hidden"><Icon name={menu ? "close" : "menu"}/></button>
      </div>
    </div>
    {menu ? <nav id={mobileId} aria-label="Điều hướng di động" className="header-mobile-navigation border-t border-border-light bg-white px-4 py-3 shadow-lg lg:hidden">{navigation.map(([href, label]) => <Link key={href} to={href} onClick={close} aria-current={activePath.startsWith(href) ? "page" : undefined} className={`block rounded-lg px-4 py-3 text-sm font-semibold ${activePath.startsWith(href) ? "bg-accent-soft text-brand-accent" : "text-text-primary hover:bg-accent-soft hover:text-brand-accent"}`}>{label}</Link>)}<div className="mt-2 flex justify-between border-t border-border-light px-4 pt-4 text-sm"><Link to={loggedIn ? "/account" : "/register"} onClick={close}>{loggedIn ? "Hồ sơ cá nhân" : "Đăng ký tài khoản"}</Link><a href="tel:19008899" className="font-semibold text-brand-accent">1900 8899</a></div></nav> : null}
  </header>;
}
