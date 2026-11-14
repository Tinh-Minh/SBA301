import { disputeService } from "@/services/adminService.js";
import { useOrderDisputes } from "@/hooks/useAdmin.js";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { LiveState, Primary, fieldClass } from "@/components/LiveUi.jsx";

import { useApiMutation } from "@/hooks/useApiMutation.js";
import { PhotoInput } from "@/components/booking/PhotoInput.jsx";
import { disputeStatusLabels } from "@/utils/labels.js";

export function Form({ orderId }) {
    const navigate = useNavigate();
    const detail = useOrderDisputes(orderId);
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [fileType, setFileType] = useState("IMAGE");
    const send = useApiMutation(async () => {
        const evidences = fileUrl.trim() ? [{ fileUrl: fileUrl.trim(), fileType, description: null }] : [];
        const created = await disputeService.create({ orderId, reason: reason.trim(), description: description.trim(), evidences });
        navigate(`/orders/${orderId}?dispute=${created.id}`);
    });
    if (!detail.data)
        return <LiveState loading={detail.loading} error={detail.error} label="đơn khiếu nại" onRetry={detail.reload}/>;
    const { order, disputes } = detail.data;
    return <div className="flex flex-col gap-4">
    <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
      <Link to={`/orders/${order.id}`} className="text-sm font-bold text-[#FC6C26]">← {order.orderCode}</Link>
      <h1 className="mt-2 text-xl font-bold">Khiếu nại chuyến {order.carName}</h1>
      {disputes.map(item => <p key={item.id} className="mt-3 rounded-xl bg-[#F7F7F5] p-3 text-sm"><b>KN-{item.id}</b> • {disputeStatusLabels[item.status] ?? item.status} • {item.reason}</p>)}
    </section>
    <form className="flex flex-col gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm" onSubmit={event => { event.preventDefault(); void send.run(); }}>
      <label className="text-xs font-semibold text-[#666666]">Lý do<textarea required value={reason} onChange={event => setReason(event.target.value)} rows={2} className={`${fieldClass} mt-1`}/></label>
      <label className="text-xs font-semibold text-[#666666]">Mô tả thêm<textarea value={description} onChange={event => setDescription(event.target.value)} rows={3} className={`${fieldClass} mt-1`}/></label>
      <div>
        <p className="mb-1 text-xs font-semibold text-[#666666]">Ảnh bằng chứng (tải lên từ máy, không bắt buộc)</p>
        <PhotoInput value={fileUrl} onChange={url => setFileUrl(url || "")} label="Tải ảnh bằng chứng" />
      </div>
      {send.error ? <p className="text-sm text-[#B91C1C]">{send.error.message}</p> : null}
      <Primary type="submit" disabled={send.running}>{send.running ? "Đang gửi…" : "Gửi khiếu nại"}</Primary>
    </form>
  </div>;
}
