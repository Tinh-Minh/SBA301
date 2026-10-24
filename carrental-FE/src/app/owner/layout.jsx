import { OwnerSidebar } from "@/components/owner/owner-sidebar";
import { RequireAuth } from "@/components/require-auth";
export default function OwnerLayout({ children }) {
    return <main data-native className="w-full bg-bg-light pt-20">
    <RequireAuth title="Đăng nhập để quản lý xe cho thuê">
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-8">
      <aside className="lg:sticky lg:top-24"><OwnerSidebar /></aside>
      <div className="flex min-w-0 flex-col gap-space-lg">{children}</div>
    </div>
    </RequireAuth>
  </main>;
}
