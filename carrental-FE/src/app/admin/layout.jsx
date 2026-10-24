import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { RequireAuth } from "@/components/require-auth";

export default function AdminLayout({ children }) {
    return <main data-native className="w-full bg-[#F7F7F5] pt-20">
    <RequireAuth admin title="Đăng nhập tài khoản quản trị">
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-8">
      <aside className="lg:sticky lg:top-24"><AdminSidebar /></aside>
      <div className="flex min-w-0 flex-col gap-5">{children}</div>
    </div>
    </RequireAuth>
  </main>;
}
