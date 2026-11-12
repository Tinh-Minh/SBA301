import { useState } from "react";
import { AdminPageHeader, AdminState, Pager } from "@/components/admin/AdminUi.jsx";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { request, toPage } from "@/services/api.js";
import { endpoints } from "@/services/endpoints.js";
import { formatDateTime } from "@/utils/datetime.js";

export default function AdminReviewsPage() {
    const [page, setPage] = useState(0);
    const list = useApiQuery(["admin", "reviews", page], async () => toPage(await request(endpoints.reviews.list, { query: { page, size: 20, sort: "id,desc" } })));
    const rows = list.data?.content ?? [];
    const [target, setTarget] = useState(null);
    const [approveTarget, setApproveTarget] = useState(null);
    const remove = useApiMutation(async id => request(`/api/admin/reviews/${id}`, { method: "DELETE" }), () => { setTarget(null); return list.reload(); });
    const approve = useApiMutation(async id => request(`/api/admin/reviews/${id}/approve`, { method: "PATCH" }), () => { setApproveTarget(null); return list.reload(); });
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A07" title="Đánh giá xe" description="Đánh giá khách gửi cho từng xe. Duyệt đánh giá để hiển thị công khai, hoặc gỡ các đánh giá rác / vi phạm."/>
    <AdminState loading={list.loading && !list.data} error={list.error} empty={!!list.data && rows.length === 0} label="đánh giá" onRetry={list.reload}/>
    {rows.length ? <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="text-xs uppercase text-[#666666]"><tr>
          <th className="p-3">Xe</th><th className="p-3">Khách</th><th className="p-3">Sao</th><th className="p-3">Nhận xét</th><th className="p-3">Thời điểm</th><th className="p-3">Trạng thái</th><th className="p-3 text-right">Kiểm duyệt</th>
        </tr></thead>
        <tbody>{rows.map(row => <tr key={row.id} className="border-t border-[#E9E9E7] align-top">
          <td className="p-3">{row.carName}<span className="block font-mono text-xs text-[#666666]">{row.carLicensePlate}</span></td>
          <td className="p-3">{row.customerName}</td>
          <td className="p-3 font-bold">{row.rating}/5</td>
          <td className="p-3 max-w-md">{row.comment || "—"}</td>
          <td className="p-3 whitespace-nowrap">{formatDateTime(row.createdAt)}</td>
          <td className="p-3">
            {row.approved
              ? <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">✓ Đã duyệt</span>
              : <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700">⏳ Chờ duyệt</span>
            }
          </td>
          <td className="p-3 text-right">
            <div className="flex justify-end gap-2">
              {!row.approved && (
                <button type="button" onClick={() => setApproveTarget(row)} className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50">Duyệt</button>
              )}
              <button type="button" onClick={() => setTarget(row)} className="rounded-lg border border-[#F3C5C5] px-3 py-1.5 text-xs font-bold text-[#B91C1C] hover:bg-[#FEF2F2]">Gỡ đánh giá</button>
            </div>
          </td>
        </tr>)}</tbody>
      </table>
    </div> : null}
    <ConfirmDialog open={!!approveTarget} title="Duyệt đánh giá này?" confirmLabel="Duyệt" busy={approve.running} error={approve.error?.message}
      description={approveTarget ? `Đánh giá ${approveTarget.rating}/5 của ${approveTarget.customerName} cho xe ${approveTarget.carName} sẽ được hiển thị công khai.` : ""}
      onClose={() => setApproveTarget(null)} onConfirm={() => approve.run(approveTarget.id)}/>
    <ConfirmDialog open={!!target} danger title="Gỡ đánh giá này?" confirmLabel="Gỡ đánh giá" busy={remove.running} error={remove.error?.message}
      description={target ? `Đánh giá ${target.rating}/5 của ${target.customerName} cho xe ${target.carName} sẽ bị xoá vĩnh viễn và điểm trung bình của xe được tính lại.` : ""}
      onClose={() => setTarget(null)} onConfirm={() => remove.run(target.id)}/>
    <Pager page={page} totalPages={list.data?.totalPages} onPage={setPage}/>
  </div>;
}
