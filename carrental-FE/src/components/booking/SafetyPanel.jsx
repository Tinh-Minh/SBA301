import { Icon } from "@/components/Icon.jsx";
import { StatusBadge } from "@/components/owner/StatusBadge.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { safetyService } from "@/services/tripService.js";
import { formatDate } from "@/utils/datetime.js";
import { safetyLevelMeta } from "@/utils/rental.js";

const validityText = { VALID: "Còn hiệu lực", EXPIRING_SOON: "Sắp hết hạn", EXPIRED: "Đã hết hạn", MISSING: "Chưa có" };
const validityTone = { VALID: "text-[#047857]", EXPIRING_SOON: "text-[#B45309]", EXPIRED: "text-[#B91C1C]", MISSING: "text-[#666666]" };
export const recordTypeLabels = { INSPECTION: "Đăng kiểm", INSURANCE: "Bảo hiểm", MAINTENANCE: "Bảo dưỡng", REPAIR: "Sửa chữa" };

export function useSafety(carId) {
    return useApiQuery(["safety", carId], () => safetyService.summary(carId), { requiresAuth: false });
}

export function SafetyBadge({ level }) {
    const meta = safetyLevelMeta[level] ?? safetyLevelMeta.UNKNOWN;
    return <StatusBadge meta={meta}/>;
}

function Item({ label, item }) {
    return <div className="rounded-xl border border-[#E9E9E7] p-3">
    <p className="text-[11px] font-bold uppercase tracking-wide text-[#666666]">{label}</p>
    <p className={`mt-1 font-bold ${validityTone[item.validity]}`}>{validityText[item.validity]}</p>
    <p className="text-xs text-[#666666]">{item.validUntil ? `Đến ${formatDate(item.validUntil)}` : "Chủ xe chưa cung cấp"}{item.validUntil ? (item.verified ? " • đã xác minh" : " • chưa xác minh") : ""}</p>
  </div>;
}

/** Hồ sơ an toàn hiển thị cho khách thuê trên trang chi tiết xe. */
export function SafetyPanel({ carId }) {
    const { data } = useSafety(carId);
    if (!data) return null;
    const meta = safetyLevelMeta[data.level] ?? safetyLevelMeta.UNKNOWN;
    return <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#292929]"><Icon name="shield" className="text-[22px] text-[#FC6C26]"/>Hồ sơ an toàn xe</h2>
        <p className="mt-1 text-sm text-[#666666]">{data.headline}</p>
      </div>
      <StatusBadge meta={meta}/>
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Item label="Đăng kiểm" item={data.inspection}/>
      <Item label="Bảo hiểm" item={data.insurance}/>
      <div className="rounded-xl border border-[#E9E9E7] p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-[#666666]">Bảo dưỡng gần nhất</p>
        <p className="mt-1 font-bold text-[#292929]">{data.lastMaintenanceAt ? formatDate(data.lastMaintenanceAt) : "Chưa có"}</p>
        <p className="text-xs text-[#666666]">{data.lastMaintenanceOdometerKm ? `${data.lastMaintenanceOdometerKm.toLocaleString("vi-VN")} km` : ""}{data.nextMaintenanceDueAt ? ` • lần tới ${formatDate(data.nextMaintenanceDueAt)}` : ""}</p></div>
      <div className="rounded-xl border border-[#E9E9E7] p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-[#666666]">Odo / sửa chữa</p>
        <p className="mt-1 font-bold text-[#292929]">{data.latestOdometerKm ? `${data.latestOdometerKm.toLocaleString("vi-VN")} km` : "—"}</p>
        <p className="text-xs text-[#666666]">{data.repairCount} lần sửa chữa đã khai báo</p></div>
    </div>
    {data.warnings.length ? <ul className="mt-3 flex flex-col gap-1 rounded-xl bg-[#FFFBEB] p-3 text-sm text-[#92400E]">{data.warnings.map(w => <li key={w} className="flex gap-2"><Icon name="warning" className="text-[16px]"/>{w}</li>)}</ul> : null}
    {data.records.length ? <details className="mt-3 text-sm">
      <summary className="cursor-pointer font-bold text-[#FC6C26]">Xem lịch sử ({data.records.length} bản ghi)</summary>
      <ol className="mt-2 flex flex-col gap-2 border-l-2 border-[#FED7AA] pl-4">{data.records.map(r => <li key={r.id}>
        <p className="font-semibold text-[#292929]">{formatDate(r.performedAt)} • {recordTypeLabels[r.recordType]} {r.result === "FAILED" ? "• KHÔNG ĐẠT" : ""}</p>
        <p className="text-xs text-[#666666]">{[r.provider, r.odometerKm ? `${r.odometerKm.toLocaleString("vi-VN")} km` : null, r.expiresAt ? `hiệu lực đến ${formatDate(r.expiresAt)}` : null, r.verifyStatus === "APPROVED" ? "đã xác minh" : "chờ xác minh"].filter(Boolean).join(" • ")}</p>
        {r.note ? <p className="text-xs text-[#666666]">{r.note}</p> : null}
      </li>)}</ol>
    </details> : null}
  </section>;
}
