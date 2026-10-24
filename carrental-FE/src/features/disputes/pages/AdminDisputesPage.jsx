import { useCallback, useState } from "react";
import { AdminPageHeader, AdminState, Pager, StatusPill, Tabs } from "@/shared/components/admin/AdminUi.jsx";
import { useApiQuery } from "@/shared/hooks/useApiQuery.js";
import { formatDateTime } from "@/shared/utils/datetime.js";
import { disputeStatusLabels } from "@/shared/utils/labels.js";
import { disputeService } from "@/services/admin.service";

import { tone, tabs, DisputeDetail } from "@/features/disputes/components/DisputeDetail.jsx";

export default function AdminDisputes() {
    const [status, setStatus] = useState("OPEN");
    const [page, setPage] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const load = useCallback(() => disputeService.list({ status: status || undefined, page, size: 10 }), [status, page]);
    const list = useApiQuery(["admin", "disputes", { status, page }], load);
    const rows = list.data?.content ?? [];
    const selected = rows.find(item => item.id === selectedId) ?? rows[0];
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A07" title="Xử lý tranh chấp & Khiếu nại" description="Đối chiếu bằng chứng hai bên rồi chốt hướng xử lý."/>
    <Tabs items={tabs} value={status} onChange={id => { setStatus(id); setPage(0); setSelectedId(null); }}/>
    <AdminState loading={list.loading && !list.data} error={list.error} empty={list.data && !rows.length} label="khiếu nại" onRetry={list.reload}/>
    {rows.length ? <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="flex flex-col gap-3">
        {rows.map(item => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`rounded-2xl border bg-white p-4 text-left shadow-sm ${item.id === selected?.id ? "border-[#FC6C26]" : "border-[#E9E9E7]"}`}>
          <div className="flex items-center justify-between gap-2">
            <span className="whitespace-nowrap font-mono text-xs font-bold text-[#FC6C26]">KN-{item.id}</span>
            <StatusPill tone={tone[item.status]}>{disputeStatusLabels[item.status] ?? item.status}</StatusPill>
          </div>
          <p className="mt-1 truncate text-sm font-bold text-[#292929]">{item.reason}</p>
          <p className="truncate text-xs text-[#666666]">{item.orderCode} • {item.raisedByName} • {formatDateTime(item.createdAt)}</p>
        </button>)}
        <Pager page={page} totalPages={list.data?.totalPages} onPage={setPage}/>
      </div>
      {selected ? <DisputeDetail key={selected.id} dispute={selected} onDone={list.reload}/> : null}
    </div> : null}
  </div>;
}

