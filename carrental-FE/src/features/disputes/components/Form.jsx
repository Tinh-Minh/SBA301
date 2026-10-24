import { Link } from "react-router";
import { useNavigate } from "react-router";
import { useCallback, useState } from "react";
import { LiveState, Primary, fieldClass } from "@/shared/components/LiveUi.jsx";
import { useApiQuery } from "@/shared/hooks/useApiQuery.js";
import { useApiMutation } from "@/shared/hooks/useApiMutation.js";
import { disputeStatusLabels } from "@/shared/utils/labels.js";
import { rentalService } from "@/services/order.service";
import { disputeService } from "@/services/admin.service";


export function Form({ orderId }) {
    const navigate = useNavigate();
    const load = useCallback(async () => {
        const [order, disputes] = await Promise.all([
            rentalService.getById(orderId),
            disputeService.list({ orderId, size: 20 }).then(page => page.content).catch(() => []),
        ]);
        return { order, disputes };
    }, [orderId]);
    const detail = useApiQuery(["bookings", "dispute", orderId], load);
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
      <label className="text-xs font-semibold text-[#666666]">Bằng chứng (đường dẫn, không bắt buộc)<input value={fileUrl} onChange={event => setFileUrl(event.target.value)} placeholder="https://..." className={`${fieldClass} mt-1`}/></label>
      <select value={fileType} onChange={event => setFileType(event.target.value)} className={fieldClass}><option value="IMAGE">Ảnh</option><option value="VIDEO">Video</option><option value="DOCUMENT">Tài liệu</option></select>
      {send.error ? <p className="text-sm text-[#B91C1C]">{send.error.message}</p> : null}
      <Primary type="submit" disabled={send.running}>{send.running ? "Đang gửi…" : "Gửi khiếu nại"}</Primary>
    </form>
  </div>;
}
