import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader, AdminState, Pager, StatusPill, Tabs } from "@/components/admin/AdminUi.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { carImage, carTypeLabels, formatMoney } from "@/utils/labels.js";
import { adminCarService } from "@/services/adminService.js";
import { CarDetail, statusLabel, statusTone, tabs } from "@/components/vehicles/VehicleApprovalDialog.jsx";

export default function AdminVehicles() {
    const [status, setStatus] = useState("PENDING_APPROVAL");
    const [page, setPage] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    useEffect(() => {
        const id = Number(new URLSearchParams(window.location.search).get("id"));
        if (id)
            setSelectedId(id);
    }, []);
    const load = useCallback(() => adminCarService.list({ status: status || undefined, page, size: 12 }), [status, page]);
    const list = useApiQuery(["admin", "vehicles", { status, page }], load);
    const rows = list.data?.content ?? [];
    const activeId = selectedId ?? rows[0]?.id ?? null;
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A03" title="Thẩm định & duyệt xe" description="Kiểm tra thông tin xe, giấy tờ (cavet, đăng kiểm, bảo hiểm) trước khi cho phép niêm yết."/>
    <Tabs items={tabs} value={status} onChange={id => { setStatus(id); setPage(0); setSelectedId(null); }}/>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
      <div className="flex flex-col gap-3">
        <AdminState loading={list.loading && !list.data} error={list.error} empty={list.data && !rows.length} label="xe" onRetry={list.reload}/>
        {rows.map(car => <button key={car.id} type="button" onClick={() => setSelectedId(car.id)} className={`flex items-center gap-3 rounded-2xl border bg-white p-3 text-left shadow-sm ${car.id === activeId ? "border-[#FC6C26] ring-1 ring-[#FC6C26]" : "border-[#E9E9E7]"}`}>
          <img src={carImage(car)} alt="" className="h-16 w-24 shrink-0 rounded-xl object-cover"/>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-[#292929]">{car.brand} {car.model}</p>
            <p className="truncate text-xs text-[#666666]">{car.licensePlate} • {car.city} • {carTypeLabels[car.carType] ?? car.carType} • {car.seats} chỗ</p>
            <p className="text-xs text-[#292929]">{formatMoney(car.pricePerDay)}/ngày</p>
          </div>
          <StatusPill tone={statusTone[car.status]}>{statusLabel[car.status] ?? car.status}</StatusPill>
        </button>)}
        <Pager page={page} totalPages={list.data?.totalPages} onPage={setPage}/>
      </div>
      {activeId ? <CarDetail key={activeId} id={activeId} onChanged={list.reload}/> : null}
    </div>
  </div>;
}
