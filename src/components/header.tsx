"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./auth-provider";
import { Icon } from "./icon";

const navigation = [["/kham-pha-xe", "Khám phá xe"], ["/chuyen-xe-cua-toi", "Chuyến xe của tôi"], ["/cho-thue-xe", "Cho thuê xe"]] as const;
const accountLinks = [["/tai-khoan", "Hồ sơ cá nhân", "badge"], ["/tai-khoan/don-thue", "Đơn thuê xe", "receipt_long"], ["/tai-khoan/lich-su", "Lịch sử chuyến đi", "history"], ["/tai-khoan/ngan-hang", "Tài khoản ngân hàng", "account_balance"]] as const;

export function Header() {
  const path = usePathname();
  const router = useRouter();
  const { loggedIn, logout } = useAuth();
  const [menu, setMenu] = useState(false);
  const [account, setAccount] = useState(false);
  function close() { setMenu(false); setAccount(false); }
  function signOut() { logout(); close(); router.push("/"); }
  return <header className="site-header fixed inset-x-0 top-0 z-50 border-b border-border-light bg-white/95 backdrop-blur-xl">
    <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-8 lg:px-10">
      <Link href="/" aria-label="CarDB — Trang chủ" onClick={close} className="flex shrink-0 items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-accent text-white shadow-sm"><Icon name="directions_car" className="text-[22px]" /></span>
        <span className="flex flex-col"><span className="text-[22px] leading-none font-bold tracking-tight text-text-primary">Car<span className="text-brand-accent">DB</span></span><span className="mt-1 text-[8px] font-medium tracking-[.1em] text-text-secondary">Di chuyển cao cấp</span></span>
      </Link>
      <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 lg:flex">{navigation.map(([href,label]) => <Link key={href} href={href} onClick={close} aria-current={path.startsWith(href)?"page":undefined} className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${path.startsWith(href)?"border-brand-accent/20 bg-accent-soft text-brand-accent":"border-transparent text-text-primary hover:bg-section-bg hover:text-brand-accent"}`}>{label}</Link>)}</nav>
      <div className="flex items-center gap-2 sm:gap-4">
        <a href="tel:19008899" className="hidden items-center gap-1.5 text-xs text-text-secondary xl:flex"><Icon name="support_agent" className="text-[18px] text-brand-accent" />Hỗ trợ: <strong className="text-text-primary">1900 8899</strong></a>
        {loggedIn ? <div className="relative"><button type="button" aria-label="Tài khoản Nguyễn Hoàng Minh" aria-expanded={account} aria-controls="account-menu" onClick={() => {setAccount(value=>!value);setMenu(false);}} className="flex items-center gap-2 rounded-lg px-1 py-2 text-left"><span className="hidden flex-col sm:flex"><span className="text-xs font-bold text-text-primary">Nguyễn Hoàng Minh</span><span className="mt-0.5 text-[10px] text-text-secondary">CDB-VN-88492</span></span><span className="flex size-9 items-center justify-center rounded-full border border-brand-accent/20 bg-accent-soft text-brand-accent"><Icon name="person" className="text-[20px]" /></span><Icon name="expand_more" className="text-[18px] text-text-secondary" /></button>
          {account ? <><button type="button" tabIndex={-1} aria-label="Đóng menu tài khoản" onClick={()=>setAccount(false)} className="fixed inset-0 z-[-1] cursor-default" /><nav id="account-menu" aria-label="Tài khoản" onKeyDown={event=>{if(event.key==="Escape")setAccount(false);}} className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-border-light bg-white p-2 shadow-xl">{accountLinks.map(([href,label,icon])=><Link key={href} href={href} onClick={close} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-text-primary hover:bg-accent-soft hover:text-brand-accent"><Icon name={icon} className="text-[18px]" />{label}</Link>)}<button type="button" onClick={signOut} className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-border-light px-3 py-2.5 text-sm text-error hover:bg-error-container/30"><Icon name="logout" className="text-[18px]" />Đăng xuất</button></nav></> : null}
        </div> : <><Link href="/dang-nhap" className="rounded-lg px-2 py-2 text-xs font-semibold text-text-primary hover:text-brand-accent sm:text-sm">Đăng nhập</Link><Link href="/dang-ky" className="hidden rounded-lg bg-brand-accent px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-hover sm:block">Đăng ký</Link></>}
        <button type="button" aria-label={menu?"Đóng menu":"Mở menu"} aria-expanded={menu} aria-controls="mobile-navigation" onClick={()=>{setMenu(value=>!value);setAccount(false);}} className="flex size-9 items-center justify-center rounded-lg border border-border-light text-text-primary lg:hidden"><Icon name={menu?"close":"menu"} /></button>
      </div>
    </div>
    {menu ? <nav id="mobile-navigation" aria-label="Điều hướng di động" className="border-t border-border-light bg-white px-4 py-3 shadow-lg lg:hidden">{navigation.map(([href,label])=><Link key={href} href={href} onClick={close} className="block rounded-lg px-4 py-3 text-sm font-semibold text-text-primary hover:bg-accent-soft hover:text-brand-accent">{label}</Link>)}<div className="mt-2 flex justify-between border-t border-border-light px-4 pt-4 text-sm"><Link href={loggedIn?"/tai-khoan":"/dang-ky"} onClick={close}>{loggedIn?"Hồ sơ cá nhân":"Đăng ký tài khoản"}</Link><a href="tel:19008899" className="font-semibold text-brand-accent">1900 8899</a></div></nav> : null}
  </header>;
}
