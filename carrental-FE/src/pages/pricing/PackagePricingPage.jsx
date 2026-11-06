import { useCallback } from "react";
import { PackagePricingCards } from "@/components/pricing/PackagePricingCards.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { listingPackageService } from "@/services/listingPackageService.js";

export default function PackagePricingPage() {
    const load = useCallback(() => listingPackageService.publicList(), []);
    const packages = useApiQuery(["listing-packages", "public"], load, { requiresAuth: false });
    const rows = packages.data ?? [];

    return <main className="cardb-screen bg-section-bg px-4 pb-16 pt-28 text-text-primary sm:px-6" aria-busy={packages.loading}>
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider text-[#8F3208]">Dành cho chủ xe</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Gói đăng tin xe</h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">Chọn thời hạn và mức ưu tiên hiển thị phù hợp với tin đăng của bạn.</p>
        </header>
        {packages.loading && !packages.data ? <p role="status" aria-live="polite" className="rounded-2xl border border-[#767676] bg-white p-5 text-sm text-[#666666]">Đang tải gói đăng tin…</p> : null}
        {packages.error ? <div role="alert" aria-live="assertive" className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#B91C1C] bg-[#FEF2F2] p-5 text-sm text-[#B91C1C]"><span>{packages.error.message}</span><button type="button" onClick={packages.reload} className="font-bold underline focus-visible:outline-[#B9430C]">Thử lại</button></div> : null}
        {packages.data && !rows.length ? <p role="status" className="rounded-2xl border border-[#767676] bg-white p-5 text-sm text-[#666666]">Chưa có gói đăng tin.</p> : null}
        {rows.length ? <PackagePricingCards packages={rows}/> : null}
        <p className="mt-6 text-xs text-text-secondary">Giá và quyền lợi hiển thị theo các gói đang được quản trị viên kích hoạt.</p>
      </div>
    </main>;
}
