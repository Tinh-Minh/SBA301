"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./icon";
import { useAuth } from "./auth-provider";

const navigation = [
  ["/thue-xe-tu-lai", "Thuê xe tự lái", "directions_car"],
  ["/xe-kem-tai-xe", "Xe kèm tài xế", "person_pin_circle"],
  ["/bang-gia-dong-xe", "Bảng giá & Dòng xe", "sell"],
  ["/uu-dai", "Ưu đãi", "local_offer"],
  ["/ve-kanow", "Về Kanow", "verified_user"],
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { loggedIn, logout } = useAuth();
  const router = useRouter();
  function signOut() { logout(); setOpen(false); router.push("/"); }
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 border-b border-border-subtle bg-surface-canvas/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8">
        <Link href="/" onClick={() => setOpen(false)} aria-label="Kanow — Trang chủ" className="flex shrink-0 items-center gap-2 text-primary">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-white"><Icon name="directions_car" /></span>
          <span className="text-[25px] font-bold tracking-[-1.4px]">kanow<span className="text-accent">.</span></span>
        </Link>
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 min-[1200px]:flex">
          {navigation.map(([href, label, icon]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`nav-link flex items-center gap-1.5 border-b-2 px-3 py-2 text-[12px] font-semibold transition-colors ${pathname === href ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:border-primary/30 hover:text-primary"}`}>
            {label}
          </Link>)}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a href="tel:19008888" className="hidden items-center gap-1.5 text-xs font-bold text-primary min-[1400px]:flex"><Icon name="support_agent" className="text-[20px]" />1900 8888</a>
          {loggedIn ? <>
            <Link href="/tai-khoan" aria-label="Tài khoản Nguyễn Văn An" className="flex items-center gap-2 rounded-md py-1.5 pl-1.5 pr-3 text-xs font-semibold text-primary"><span className="flex size-8 items-center justify-center rounded-full bg-primary text-[11px] text-white">AN</span><span className="hidden sm:inline">Nguyễn Văn An</span></Link>
            <button type="button" onClick={signOut} aria-label="Đăng xuất" className="hidden size-9 items-center justify-center rounded-full text-primary hover:bg-surface-tint sm:flex"><Icon name="logout" className="text-[19px]" /></button>
          </> : <><Link href="/dang-ky" className="hidden rounded-md px-2 py-2 text-xs font-semibold text-primary sm:inline-flex">Đăng ký</Link>
          <Link href="/dang-nhap" className="rounded-md bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary-container">Đăng nhập</Link>
          <Link href="/tai-khoan" aria-label="Tài khoản cá nhân" className="hidden size-9 items-center justify-center rounded-full border border-border-subtle text-primary sm:flex"><Icon name="person" className="text-[20px]" /></Link></>}
          <button type="button" aria-label={open ? "Đóng menu" : "Mở menu"} aria-controls="mobile-navigation" aria-expanded={open} onClick={() => setOpen(value => !value)} className="flex size-10 items-center justify-center rounded-md bg-surface-tint text-primary min-[1200px]:hidden"><Icon name={open ? "close" : "menu"} /></button>
        </div>
      </div>
      {open ? <nav id="mobile-navigation" aria-label="Điều hướng di động" className="mobile-menu border-t border-border-subtle bg-white px-4 py-4 shadow-xl min-[1200px]:hidden">
        {navigation.map(([href, label, icon]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={pathname === href ? "page" : undefined} className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-3 font-medium ${pathname === href ? "bg-primary text-white" : "text-primary hover:bg-surface-tint"}`}><Icon name={icon} className="text-[20px]" />{label}</Link>)}
        <div className="mt-2 flex gap-3 border-t border-border-subtle px-4 pt-4">{loggedIn ? <button type="button" onClick={signOut} className="text-error">Đăng xuất</button> : <Link href="/dang-ky" onClick={() => setOpen(false)}>Đăng ký</Link>}<Link href="/tai-khoan" onClick={() => setOpen(false)}>Tài khoản</Link><a href="tel:19008888" className="ml-auto font-bold text-primary">1900 8888</a></div>
      </nav> : null}
    </header>
  );
}
