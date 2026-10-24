import { useCallback, useEffect, useState } from "react";
import { AdminDialog, AdminPageHeader, AdminState, Pager, PrimaryButton, StatusPill, Tabs } from "@/components/admin/AdminUi.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatDate } from "@/utils/datetime.js";
import { carImage, carTypeLabels, formatMoney, fuelTypeLabels, transmissionLabels, verifyStatusLabels } from "@/utils/labels.js";
import { adminCarService } from "@/services/admin.service";

const tabs = [
    { id: "PENDING_APPROVAL", label: "Chờ duyệt" },
    { id: "ACTIVE", label: "Đang hoạt động" },
    { id: "REJECTED", label: "Bị từ chối" },
    { id: "INACTIVE", label: "Tạm ngưng" },
    { id: "", label: "Tất cả" },
];
const statusTone = { PENDING_APPROVAL: "warning", ACTIVE: "success", REJECTED: "danger", INACTIVE: "neutral" };
const statusLabel = { PENDING_APPROVAL: "Chờ duyệt", ACTIVE: "Hoạt động", REJECTED: "Bị từ chối", INACTIVE: "Tạm ngưng" };
const carDocLabel = { REGISTRATION: "Đăng ký xe (cavet)", INSPECTION: "Sổ đăng kiểm", INSURANCE: "Bảo hiểm" };
const docTone = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" };

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

function CarDetail({ id, onChanged }) {
    const load = useCallback(async () => {
        const [car, documents] = await Promise.all([adminCarService.getDetail(id), adminCarService.documents(id).catch(() => [])]);
        return { car, documents };
    }, [id]);
    const detail = useApiQuery(["admin", "vehicle-detail", id], load);
    const [dialog, setDialog] = useState(null);
    const [reason, setReason] = useState("");
    const done = () => { setDialog(null); setReason(""); detail.reload(); onChanged(); };
    const approve = useApiMutation(() => adminCarService.approve(id), done);
    const reject = useApiMutation((why) => adminCarService.reject(id, why), done);
    const verify = useApiMutation((docId, status, why) => adminCarService.verifyDocument(id, docId, status, why), done);
    if (!detail.data)
        return <aside><AdminState loading={detail.loading} error={detail.error} label="chi tiết xe"/></aside>;
    const { car, documents } = detail.data;
    const error = approve.error ?? reject.error ?? verify.error;
    const busy = approve.running || reject.running || verify.running;
    return <aside className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <img src={carImage(car)} alt={`${car.brand} ${car.model}`} className="h-44 w-full rounded-xl object-cover"/>
    {car.images.length > 1 ? <div className="flex gap-2 overflow-x-auto">{car.images.map(image => <img key={image.id} src={image.imageUrl} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover"/>)}</div> : null}
    <div>
      <h2 className="text-lg font-bold text-[#292929]">{car.brand} {car.model} {car.manufactureYear ?? ""}</h2>
      <p className="text-xs text-[#666666]">{car.licensePlate} • Chủ xe #{car.ownerId}{car.ownerFullName ? ` • ${car.ownerFullName}` : ""}</p>
    </div>
    <dl className="grid grid-cols-2 gap-2 text-sm">
      <Row term="Loại" value={carTypeLabels[car.carType] ?? car.carType}/>
      <Row term="Số chỗ" value={car.seats}/>
      <Row term="Hộp số" value={transmissionLabels[car.transmission] ?? car.transmission}/>
      <Row term="Nhiên liệu" value={fuelTypeLabels[car.fuelType] ?? car.fuelType}/>
      <Row term="Giá giờ" value={formatMoney(car.pricePerHour)}/>
      <Row term="Giá ngày" value={formatMoney(car.pricePerDay)}/>
      <Row term="Tiền cọc" value={formatMoney(car.depositAmount)}/>
      <Row term="Giới hạn km" value={car.kmLimitPerDay ? `${car.kmLimitPerDay} km/ngày` : "—"}/>
    </dl>
    <p className="text-sm text-[#666666]">{[car.pickupAddress, car.district, car.city].filter(Boolean).join(", ")}</p>
    {car.description ? <p className="whitespace-pre-line rounded-xl bg-[#F7F7F5] p-3 text-xs text-[#292929]">{car.description}</p> : null}
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-bold text-[#292929]">Giấy tờ xe ({documents.length})</h3>
      {!documents.length ? <p className="text-sm text-[#666666]">Chủ xe chưa tải giấy tờ.</p> : null}
      {documents.map(doc => <div key={doc.id} className="rounded-xl border border-[#E9E9E7] p-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="font-bold text-[#FC6C26] underline">{carDocLabel[doc.docType] ?? doc.docType}</a>
          <StatusPill tone={docTone[doc.verifyStatus]}>{verifyStatusLabels[doc.verifyStatus] ?? doc.verifyStatus}</StatusPill>
        </div>
        <p className="mt-1 text-xs text-[#666666]">Hết hạn: {formatDate(doc.expiresAt)}{doc.rejectReason ? ` • Lý do: ${doc.rejectReason}` : ""}</p>
        {doc.verifyStatus === "PENDING" ? <div className="mt-2 flex gap-2">
          <button type="button" disabled={busy} onClick={() => void verify.run(doc.id, "APPROVED")} className="rounded-lg bg-[#047857] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">Duyệt</button>
          <button type="button" disabled={busy} onClick={() => setDialog({ type: "doc", docId: doc.id })} className="rounded-lg border border-[#EF4444] px-3 py-1.5 text-xs font-bold text-[#EF4444] disabled:opacity-60">Từ chối</button>
        </div> : null}
      </div>)}
    </div>
    {error ? <p className="text-sm text-[#B91C1C]">{error.message}</p> : null}
    {car.status === "PENDING_APPROVAL" || car.status === "REJECTED" ? <div className="flex flex-col gap-2 border-t border-[#E9E9E7] pt-4">
      <PrimaryButton disabled={busy} onClick={() => void approve.run()}>✓ Duyệt niêm yết xe</PrimaryButton>
      {car.status === "PENDING_APPROVAL" ? <button type="button" disabled={busy} onClick={() => setDialog({ type: "car" })} className="rounded-xl border border-[#EF4444] px-4 py-2.5 text-sm font-bold text-[#EF4444]">Từ chối hồ sơ xe</button> : null}
    </div> : null}
    {dialog ? <AdminDialog title={dialog.type === "car" ? "Từ chối hồ sơ xe" : "Từ chối giấy tờ"} onClose={() => setDialog(null)}>
      <label className="block text-sm text-[#666666]">Lý do
        <textarea value={reason} onChange={event => setReason(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-[#E9E9E7] p-3 text-[#292929]"/>
      </label>
      <div className="mt-3"><PrimaryButton disabled={busy || !reason.trim()} onClick={() => dialog.type === "car" ? void reject.run(reason.trim()) : void verify.run(dialog.docId, "REJECTED", reason.trim())}>Xác nhận từ chối</PrimaryButton></div>
    </AdminDialog> : null}
  </aside>;
}

function Row({ term, value }) {
    return <div className="flex flex-col"><dt className="text-[11px] uppercase text-[#666666]">{term}</dt><dd className="font-semibold text-[#292929]">{value ?? "—"}</dd></div>;
}
