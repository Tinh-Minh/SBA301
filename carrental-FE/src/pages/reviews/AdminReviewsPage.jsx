import { useState } from "react";
import { AdminPageHeader, AdminState, Pager } from "@/components/admin/AdminUi.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { request, toPage } from "@/services/api.js";
import { endpoints } from "@/services/endpoints.js";
import { formatDateTime } from "@/utils/datetime.js";

export default function AdminReviewsPage() {
    const [page, setPage] = useState(0);
    const list = useApiQuery(["admin", "reviews", page], async () => toPage(await request(endpoints.reviews.list, { query: { page, size: 20, sort: "id,desc" } })));
    const rows = list.data?.content ?? [];
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A07" title="Đánh giá xe" description="Đánh giá khách gửi cho từng xe. Không còn hồ sơ tranh chấp theo đơn thuê."/>
    <AdminState loading={list.loading && !list.data} error={list.error} empty={!!list.data && rows.length === 0} label="đánh giá" onRetry={list.reload}/>
    {rows.length ? <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="text-xs uppercase text-[#666666]"><tr>
          <th className="p-3">Xe</th><th className="p-3">Khách</th><th className="p-3">Sao</th><th className="p-3">Nhận xét</th><th className="p-3">Thời điểm</th>
        </tr></thead>
        <tbody>{rows.map(row => <tr key={row.id} className="border-t border-[#E9E9E7] align-top">
          <td className="p-3">{row.carName}<span className="block font-mono text-xs text-[#666666]">{row.carLicensePlate}</span></td>
          <td className="p-3">{row.customerName}</td>
          <td className="p-3 font-bold">{row.rating}/5</td>
          <td className="p-3 max-w-md">{row.comment || "—"}</td>
          <td className="p-3 whitespace-nowrap">{formatDateTime(row.createdAt)}</td>
        </tr>)}</tbody>
      </table>
    </div> : null}
    <Pager page={page} totalPages={list.data?.totalPages} onPage={setPage}/>
  </div>;
}
