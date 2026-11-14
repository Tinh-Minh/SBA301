import { useState } from "react";
import { Link } from "react-router";
import { AdminPageHeader, AdminState, Pager } from "@/components/admin/AdminUi.jsx";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { request, toPage } from "@/services/api.js";
import { endpoints } from "@/services/endpoints.js";
import { reviewService } from "@/services/reviewService.js";
import { formatDateTime } from "@/utils/datetime.js";

export default function AdminReviewsPage() {
    const [tab, setTab] = useState("car"); // "car" | "customer"
    const [carPage, setCarPage] = useState(0);
    const [custPage, setCustPage] = useState(0);

    const carList = useApiQuery(
        ["admin", "reviews", "car", carPage],
        async () => toPage(await request(endpoints.reviews.list, { query: { page: carPage, size: 20, sort: "id,desc" } }))
    );
    const custList = useApiQuery(
        ["admin", "reviews", "customer", custPage],
        () => reviewService.adminCustomerReviews(custPage, 20)
    );

    const carRows = carList.data?.content ?? [];
    const custRows = custList.data?.content ?? [];

    const [target, setTarget] = useState(null);
    const [approveTarget, setApproveTarget] = useState(null);
    const [custTarget, setCustTarget] = useState(null);
    const [custApproveTarget, setCustApproveTarget] = useState(null);

    const removeCarReview = useApiMutation(
        async id => request(`/api/admin/reviews/${id}`, { method: "DELETE" }),
        () => { setTarget(null); return carList.reload(); }
    );
    const approveCarReview = useApiMutation(
        async id => request(`/api/admin/reviews/${id}/approve`, { method: "PATCH" }),
        () => { setApproveTarget(null); return carList.reload(); }
    );
    const removeCustReview = useApiMutation(
        reviewService.removeCustomerReview,
        () => { setCustTarget(null); return custList.reload(); }
    );
    const approveCustReview = useApiMutation(
        reviewService.approveCustomerReview,
        () => { setCustApproveTarget(null); return custList.reload(); }
    );

    const pendingCarCount = carRows.filter(r => !r.approved).length;
    const pendingCustCount = custRows.filter(r => !r.approved).length;

    return <div className="flex flex-col gap-5">
      <AdminPageHeader
        code="A07"
        title="Kiểm duyệt đánh giá 2 chiều"
        description="Kiểm chứng, phê duyệt hiển thị công khai hoặc gỡ các đánh giá vi phạm từ cả Khách thuê đánh giá xe và Chủ xe đánh giá khách thuê."
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("car")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
            tab === "car"
              ? "bg-[#25251F] text-[#FAF8F2] shadow-sm"
              : "border border-[#E4E2D8] bg-white text-[#5C584F] hover:border-[#25251F]"
          }`}
        >
          <span>Khách đánh giá xe ({carList.data?.totalElements ?? carRows.length})</span>
          {pendingCarCount > 0 ? (
            <span className="rounded-full bg-[#FC6C26] px-2 py-0.5 text-[11px] font-bold text-white">
              {pendingCarCount} chờ duyệt
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setTab("customer")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
            tab === "customer"
              ? "bg-[#25251F] text-[#FAF8F2] shadow-sm"
              : "border border-[#E4E2D8] bg-white text-[#5C584F] hover:border-[#25251F]"
          }`}
        >
          <span>Chủ xe đánh giá khách thuê ({custList.data?.totalElements ?? custRows.length})</span>
          {pendingCustCount > 0 ? (
            <span className="rounded-full bg-[#FC6C26] px-2 py-0.5 text-[11px] font-bold text-white">
              {pendingCustCount} chờ duyệt
            </span>
          ) : null}
        </button>
      </div>

      {tab === "car" ? (
        <>
          <AdminState
            loading={carList.loading && !carList.data}
            error={carList.error}
            empty={!!carList.data && carRows.length === 0}
            label="đánh giá xe"
            onRetry={carList.reload}
          />
          {carRows.length ? (
            <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs uppercase text-[#666666]">
                  <tr>
                    <th className="p-3">Xe</th>
                    <th className="p-3">Khách đánh giá</th>
                    <th className="p-3">Sao</th>
                    <th className="p-3">Nhận xét</th>
                    <th className="p-3">Thời điểm</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-right">Kiểm duyệt</th>
                  </tr>
                </thead>
                <tbody>
                  {carRows.map(row => (
                    <tr key={row.id} className="border-t border-[#E9E9E7] align-top">
                      <td className="p-3">
                        <span className="font-semibold text-[#25251F]">{row.carName}</span>
                        <span className="block font-mono text-xs text-[#666666]">{row.carLicensePlate}</span>
                      </td>
                      <td className="p-3">{row.customerName}</td>
                      <td className="p-3 font-bold text-[#FC6C26]">{row.rating}/5 ★</td>
                      <td className="p-3 max-w-md">{row.comment || "—"}</td>
                      <td className="p-3 whitespace-nowrap">{formatDateTime(row.createdAt)}</td>
                      <td className="p-3">
                        {row.approved ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">✓ Đã duyệt</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">⏳ Chờ duyệt</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          {!row.approved ? (
                            <button
                              type="button"
                              onClick={() => setApproveTarget(row)}
                              className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50"
                            >
                              Duyệt
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setTarget(row)}
                            className="rounded-lg border border-[#F3C5C5] px-3 py-1.5 text-xs font-bold text-[#B91C1C] hover:bg-[#FEF2F2]"
                          >
                            Gỡ đánh giá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          <Pager page={carPage} totalPages={carList.data?.totalPages} onPage={setCarPage}/>
        </>
      ) : (
        <>
          <AdminState
            loading={custList.loading && !custList.data}
            error={custList.error}
            empty={!!custList.data && custRows.length === 0}
            label="đánh giá khách thuê"
            onRetry={custList.reload}
          />
          {custRows.length ? (
            <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="text-xs uppercase text-[#666666]">
                  <tr>
                    <th className="p-3">Đơn thuê & Xe</th>
                    <th className="p-3">Chủ xe đánh giá</th>
                    <th className="p-3">Khách thuê</th>
                    <th className="p-3">Sao</th>
                    <th className="p-3">Nhận xét</th>
                    <th className="p-3">Thời điểm</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-right">Kiểm duyệt</th>
                  </tr>
                </thead>
                <tbody>
                  {custRows.map(row => (
                    <tr key={row.id} className="border-t border-[#E9E9E7] align-top">
                      <td className="p-3">
                        <Link to={`/trips/${row.bookingId}`} className="font-mono text-xs font-bold text-[#FC6C26] hover:underline">
                          {row.bookingCode || `Đơn #${row.bookingId}`}
                        </Link>
                        {row.carName ? <span className="block text-xs text-[#666666]">{row.carName}</span> : null}
                      </td>
                      <td className="p-3 font-medium">{row.ownerName || `Chủ xe #${row.ownerId}`}</td>
                      <td className="p-3 font-semibold text-[#25251F]">{row.customerName || `Khách #${row.customerId}`}</td>
                      <td className="p-3 font-bold text-[#FC6C26]">{row.rating}/5 ★</td>
                      <td className="p-3 max-w-md">{row.comment || "—"}</td>
                      <td className="p-3 whitespace-nowrap">{formatDateTime(row.createdAt)}</td>
                      <td className="p-3">
                        {row.approved ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">✓ Đã duyệt</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">⏳ Chờ duyệt</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          {!row.approved ? (
                            <button
                              type="button"
                              onClick={() => setCustApproveTarget(row)}
                              className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50"
                            >
                              Duyệt
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setCustTarget(row)}
                            className="rounded-lg border border-[#F3C5C5] px-3 py-1.5 text-xs font-bold text-[#B91C1C] hover:bg-[#FEF2F2]"
                          >
                            Gỡ đánh giá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          <Pager page={custPage} totalPages={custList.data?.totalPages} onPage={setCustPage}/>
        </>
      )}

      <ConfirmDialog
        open={!!approveTarget}
        title="Duyệt đánh giá xe này?"
        confirmLabel="Duyệt"
        busy={approveCarReview.running}
        error={approveCarReview.error?.message}
        description={approveTarget ? `Đánh giá ${approveTarget.rating}/5 của ${approveTarget.customerName} cho xe ${approveTarget.carName} sẽ được hiển thị công khai.` : ""}
        onClose={() => setApproveTarget(null)}
        onConfirm={() => approveCarReview.run(approveTarget.id)}
      />
      <ConfirmDialog
        open={!!target}
        danger
        title="Gỡ đánh giá xe này?"
        confirmLabel="Gỡ đánh giá"
        busy={removeCarReview.running}
        error={removeCarReview.error?.message}
        description={target ? `Đánh giá ${target.rating}/5 của ${target.customerName} cho xe ${target.carName} sẽ bị xoá vĩnh viễn và điểm trung bình của xe được tính lại.` : ""}
        onClose={() => setTarget(null)}
        onConfirm={() => removeCarReview.run(target.id)}
      />
      <ConfirmDialog
        open={!!custApproveTarget}
        title="Duyệt đánh giá khách thuê này?"
        confirmLabel="Duyệt hiển thị"
        busy={approveCustReview.running}
        error={approveCustReview.error?.message}
        description={custApproveTarget ? `Đánh giá ${custApproveTarget.rating}/5 của chủ xe ${custApproveTarget.ownerName || ""} dành cho khách ${custApproveTarget.customerName || ""} sẽ được phê duyệt và tính vào điểm uy tín khách thuê.` : ""}
        onClose={() => setCustApproveTarget(null)}
        onConfirm={() => approveCustReview.run(custApproveTarget.id)}
      />
      <ConfirmDialog
        open={!!custTarget}
        danger
        title="Gỡ đánh giá khách thuê này?"
        confirmLabel="Gỡ đánh giá"
        busy={removeCustReview.running}
        error={removeCustReview.error?.message}
        description={custTarget ? `Đánh giá ${custTarget.rating}/5 của chủ xe ${custTarget.ownerName || ""} dành cho khách ${custTarget.customerName || ""} sẽ bị xoá vĩnh viễn và điểm uy tín của khách được tính lại.` : ""}
        onClose={() => setCustTarget(null)}
        onConfirm={() => removeCustReview.run(custTarget.id)}
      />
    </div>;
}
