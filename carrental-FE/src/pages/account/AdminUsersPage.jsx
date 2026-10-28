import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader, AdminState, Pager, StatusPill, Tabs, adminInput } from "@/components/admin/AdminUi.jsx";
import { useApiQuery } from "@/shared/hooks/useApiQuery.js";
import { kycStatusLabels } from "@/shared/utils/labels.js";
import { adminUserService } from "@/shared/hooks/useAdmin.js";
import { UserDetail, kycTone, tabs } from "@/components/account/components/UserDetail.jsx";

export default function AdminUsers() {
    const [tab, setTab] = useState("all");
    const [keyword, setKeyword] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    useEffect(() => {
        const id = Number(new URLSearchParams(window.location.search).get("id"));
        if (id)
            setSelectedId(id);
    }, []);
    const [kind, value] = tab.split(":");
    const load = useCallback(() => adminUserService.list({
        kycStatus: kind === "kyc" ? value : undefined,
        status: kind === "status" ? value : undefined,
        keyword: query || undefined,
        page,
        size: 15,
    }), [kind, value, query, page]);
    const list = useApiQuery(["admin", "users", { tab, query, page }], load);
    const rows = list.data?.content ?? [];
    const activeId = selectedId ?? rows[0]?.id ?? null;

    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A02" title="Người dùng & KYC" description="Tra cứu khách hàng, đối chiếu giấy tờ CCCD/GPLX và khóa/mở tài khoản."/>
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Tabs items={tabs} value={tab} onChange={id => { setTab(id); setPage(0); }}/>
      <form className="flex min-w-0 gap-2" onSubmit={event => { event.preventDefault(); setQuery(keyword.trim()); setPage(0); }}>
        <input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="Tên, email, SĐT…" className={`${adminInput} w-full sm:w-56`}/>
        <button type="submit" className="shrink-0 rounded-xl bg-[#292929] px-4 py-2 text-sm font-bold text-white">Tìm</button>
      </form>
    </div>
    <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-3">
        <AdminState loading={list.loading && !list.data} error={list.error} empty={list.data && !rows.length} label="khách hàng" onRetry={list.reload}/>
        {rows.length ? <div className="overflow-hidden rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-[#666666]"><tr>
              <th className="px-3 py-3 font-bold">Mã KH</th>
              <th className="px-3 py-3 font-bold">Khách hàng</th>
              <th className="px-3 py-3 font-bold">Liên hệ</th>
              <th className="px-3 py-3 font-bold">KYC</th>
              <th className="px-3 py-3 font-bold">Tài khoản</th>
            </tr></thead>
            <tbody>
              {rows.map(user => <tr key={user.id} onClick={() => setSelectedId(user.id)} className={`cursor-pointer border-t border-[#E9E9E7] ${user.id === activeId ? "bg-[#FFF7F2]" : ""}`}>
                <td className="px-3 py-3 font-mono text-xs font-bold text-[#FC6C26]">#{user.id}</td>
                <td className="px-3 py-3 font-semibold text-[#292929]"><span className="break-words">{user.fullName}</span>{user.role === "ADMIN" ? <span className="ml-2 text-[10px] font-bold text-blue-700">ADMIN</span> : null}</td>
                <td className="px-3 py-3 text-[#666666]"><span className="break-all">{user.email}</span><br/><span className="text-xs">{user.phone}</span></td>
                <td className="px-3 py-3"><StatusPill tone={kycTone[user.kycStatus]}>{kycStatusLabels[user.kycStatus] ?? user.kycStatus}</StatusPill></td>
                <td className="px-3 py-3"><StatusPill tone={user.status === "LOCKED" ? "danger" : "success"}>{user.status === "LOCKED" ? "Bị khóa" : "Hoạt động"}</StatusPill></td>
              </tr>)}
            </tbody>
          </table>
        </div> : null}
        <Pager page={page} totalPages={list.data?.totalPages} onPage={setPage}/>
      </div>
      {activeId ? <UserDetail key={activeId} id={activeId} onChanged={list.reload}/> : null}
    </div>
  </div>;
}
