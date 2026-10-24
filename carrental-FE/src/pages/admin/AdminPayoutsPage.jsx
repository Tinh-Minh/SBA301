import { useCallback, useState } from "react";
import { AdminDialog, AdminPageHeader, AdminState, Pager, PrimaryButton, StatusPill, Tabs, adminInput } from "@/shared/components/admin/AdminUi.jsx";
import { Money } from "@/shared/components/owner/Money.jsx";
import { useApiQuery } from "@/shared/hooks/useApiQuery.js";
import { useApiMutation } from "@/shared/hooks/useApiMutation.js";
import { formatDateTime } from "@/shared/utils/datetime.js";
import { formatMoney, paymentMethodLabels, transactionStatusLabels, transactionTypeLabels } from "@/shared/utils/labels.js";
import { calculatePayout } from "@/shared/utils/owner.js";
import { request, toPage } from "@/services/http.js";
import { adminOrderService, adminPayoutService } from "@/services/admin.service";

const tabs = [{ id: "payouts", label: "Chi trả chủ xe" }, { id: "transactions", label: "Giao dịch thanh toán" }];
const payoutTone = { PENDING: "warning", PROCESSING: "info", PAID: "success", FAILED: "danger" };
const payoutLabel = { PENDING: "Chờ xử lý", PROCESSING: "Đang chuyển", PAID: "Đã chi trả", FAILED: "Thất bại" };
const txTone = { PENDING: "warning", SUCCESS: "success", FAILED: "danger" };

export default function AdminPayouts() {
    const [tab, setTab] = useState("payouts");
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A06" title="Giao dịch & Chi trả" description="Phí nền tảng tính trên tiền thuê theo tỷ lệ hoa hồng của đơn. Chủ xe nhận phần còn lại sau khi chuyến hoàn thành."/>
    <Tabs items={tabs} value={tab} onChange={setTab}/>
    {tab === "payouts" ? <Payouts/> : <Transactions/>}
  </div>;
}

function Payouts() {
    const load = useCallback(async () => {
        const [payouts, completed] = await Promise.all([adminPayoutService.listAll(), adminOrderService.listAll("COMPLETED")]);
        const paidOrders = new Set(payouts.filter(payout => payout.status !== "FAILED").map(payout => payout.orderId));
        return { payouts, awaiting: completed.filter(order => !paidOrders.has(order.id)) };
    }, []);
    const data = useApiQuery(["admin", "payouts"], load);
    const [creating, setCreating] = useState(null);
    const [processing, setProcessing] = useState(null);
    if (!data.data)
        return <AdminState loading={data.loading} error={data.error} label="chi trả" onRetry={data.reload}/>;
    const { payouts, awaiting } = data.data;
    return <>
    <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-[#292929]">Đơn hoàn thành chờ tạo chi trả ({awaiting.length})</h2>
      {!awaiting.length ? <p className="mt-2 text-sm text-[#666666]">Mọi đơn hoàn thành đều đã có lệnh chi trả.</p> : null}
      <ul className="mt-3 flex flex-col gap-2">
        {awaiting.map(order => {
                const money = calculatePayout(order);
                return <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E9E9E7] p-3 text-sm">
            <div>
              <p className="font-mono text-xs font-bold text-[#FC6C26]">{order.orderCode}</p>
              <p className="font-semibold">{order.carName} • chủ xe {order.ownerName}</p>
              <p className="text-xs text-[#666666]">Tiền thuê <Money amount={money.grossAmount}/> • phí {order.commissionRate}% <Money amount={money.platformFee}/> • thực nhận <b><Money amount={money.netAmount}/></b></p>
            </div>
            <button type="button" onClick={() => setCreating(order)} className="rounded-lg bg-[#FC6C26] px-3 py-1.5 text-xs font-bold text-white">Tạo lệnh chi trả</button>
          </li>;
            })}
      </ul>
    </section>
    <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="text-[11px] uppercase tracking-wide text-[#666666]"><tr>{["Mã", "Mã đơn", "Người nhận", "Gross", "Phí", "Thực nhận", "Ngày tạo", "Trạng thái", ""].map(head => <th key={head} className="whitespace-nowrap px-4 py-3 font-bold">{head}</th>)}</tr></thead>
        <tbody>
          {payouts.map(row => <tr key={row.id} className="border-t border-[#E9E9E7]">
            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold">PO-{row.id}</td>
            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#FC6C26]">{row.orderCode}</td>
            <td className="whitespace-nowrap px-4 py-3 font-semibold">{row.recipientName}</td>
            <td className="whitespace-nowrap px-4 py-3"><Money amount={row.grossAmount}/></td>
            <td className="whitespace-nowrap px-4 py-3"><Money amount={row.platformFee}/></td>
            <td className="whitespace-nowrap px-4 py-3 font-bold"><Money amount={row.netAmount}/></td>
            <td className="whitespace-nowrap px-4 py-3 text-xs">{formatDateTime(row.createdAt)}{row.paidAt ? <><br/>Trả: {formatDateTime(row.paidAt)}</> : null}</td>
            <td className="px-4 py-3"><StatusPill tone={payoutTone[row.status]}>{payoutLabel[row.status] ?? row.status}</StatusPill></td>
            <td className="whitespace-nowrap px-4 py-3 text-right">{row.status === "PENDING" || row.status === "PROCESSING" ? <button type="button" onClick={() => setProcessing(row)} className="rounded-lg bg-[#292929] px-3 py-1.5 text-xs font-bold text-white">Xử lý</button> : null}</td>
          </tr>)}
          {!payouts.length ? <tr><td colSpan={9} className="px-4 py-6 text-center text-[#666666]">Chưa có lệnh chi trả.</td></tr> : null}
        </tbody>
      </table>
    </div>
    {creating ? <CreatePayout order={creating} onClose={() => setCreating(null)} onDone={() => { setCreating(null); data.reload(); }}/> : null}
    {processing ? <ProcessPayout payout={processing} onClose={() => setProcessing(null)} onDone={() => { setProcessing(null); data.reload(); }}/> : null}
  </>;
}

function CreatePayout({ order, onClose, onDone }) {
    const money = calculatePayout(order);
    const [note, setNote] = useState(`Chi trả đơn ${order.orderCode}`);
    const create = useApiMutation(() => adminPayoutService.create({ orderId: order.id, recipientId: order.ownerId, bankAccountId: null, ...money, note }), onDone);
    return <AdminDialog title={`Chi trả đơn ${order.orderCode}`} onClose={onClose}>
    <div className="flex flex-col gap-3 text-sm">
      <p>Người nhận: <b>{order.ownerName}</b> (#{order.ownerId})</p>
      <p>Gross <Money amount={money.grossAmount}/> − phí <Money amount={money.platformFee}/> = <b><Money amount={money.netAmount}/></b></p>
      <p className="text-xs text-[#666666]">Hệ thống chuyển vào tài khoản ngân hàng mặc định mà chủ xe đã khai báo.</p>
      <label className="flex flex-col gap-1 text-xs font-semibold text-[#666666]">Ghi chú<input value={note} onChange={event => setNote(event.target.value)} className={adminInput}/></label>
      {create.error ? <p className="text-[#B91C1C]">{create.error.message}</p> : null}
      <PrimaryButton disabled={create.running} onClick={() => void create.run()}>Tạo lệnh chi trả</PrimaryButton>
    </div>
  </AdminDialog>;
}

function ProcessPayout({ payout, onClose, onDone }) {
    const [note, setNote] = useState("");
    const process = useApiMutation((status) => adminPayoutService.process(payout.id, status, note), onDone);
    return <AdminDialog title={`Xử lý chi trả PO-${payout.id}`} onClose={onClose}>
    <div className="flex flex-col gap-3 text-sm">
      <p>{payout.recipientName} • thực nhận <b>{formatMoney(payout.netAmount)}</b></p>
      <label className="flex flex-col gap-1 text-xs font-semibold text-[#666666]">Ghi chú / mã chuyển khoản<input value={note} onChange={event => setNote(event.target.value)} className={adminInput}/></label>
      {process.error ? <p className="text-[#B91C1C]">{process.error.message}</p> : null}
      <div className="grid grid-cols-3 gap-2">
        {payout.status === "PENDING" ? <button type="button" disabled={process.running} onClick={() => void process.run("PROCESSING")} className="rounded-xl border border-[#E9E9E7] px-3 py-2 font-bold">Đang chuyển</button> : <span/>}
        <button type="button" disabled={process.running} onClick={() => void process.run("PAID")} className="rounded-xl bg-[#047857] px-3 py-2 font-bold text-white">Đã chi trả</button>
        <button type="button" disabled={process.running} onClick={() => void process.run("FAILED")} className="rounded-xl border border-[#EF4444] px-3 py-2 font-bold text-[#EF4444]">Thất bại</button>
      </div>
    </div>
  </AdminDialog>;
}

function Transactions() {
    const [page, setPage] = useState(0);
    const [status, setStatus] = useState("");
    const load = useCallback(async () => toPage(await request("/api/transactions", { query: { status: status || undefined, page, size: 20, sort: "id,desc" } })), [page, status]);
    const list = useApiQuery(["admin", "transactions", { status, page }], load);
    const rows = list.data?.content ?? [];
    return <>
    <Tabs items={[{ id: "", label: "Tất cả" }, { id: "SUCCESS", label: "Thành công" }, { id: "PENDING", label: "Đang chờ" }, { id: "FAILED", label: "Thất bại" }]} value={status} onChange={id => { setStatus(id); setPage(0); }}/>
    <AdminState loading={list.loading && !list.data} error={list.error} empty={list.data && !rows.length} label="giao dịch" onRetry={list.reload}/>
    {rows.length ? <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="text-[11px] uppercase tracking-wide text-[#666666]"><tr>{["Mã GD", "Mã đơn", "Loại", "Phương thức", "Số tiền", "Mã cổng TT", "Thời gian", "Trạng thái"].map(head => <th key={head} className="whitespace-nowrap px-4 py-3 font-bold">{head}</th>)}</tr></thead>
        <tbody>
          {rows.map(tx => <tr key={tx.id} className="border-t border-[#E9E9E7]">
            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold">TX-{tx.id}</td>
            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#FC6C26]">{tx.orderCode}</td>
            <td className="whitespace-nowrap px-4 py-3">{transactionTypeLabels[tx.transactionType] ?? tx.transactionType}</td>
            <td className="whitespace-nowrap px-4 py-3">{paymentMethodLabels[tx.method] ?? tx.method}</td>
            <td className="whitespace-nowrap px-4 py-3 font-semibold">{formatMoney(tx.amount)}</td>
            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{tx.providerRef ?? "—"}</td>
            <td className="whitespace-nowrap px-4 py-3 text-xs">{formatDateTime(tx.paidAt ?? tx.createdAt)}</td>
            <td className="px-4 py-3"><StatusPill tone={txTone[tx.status]}>{transactionStatusLabels[tx.status] ?? tx.status}</StatusPill></td>
          </tr>)}
        </tbody>
      </table>
    </div> : null}
    <Pager page={page} totalPages={list.data?.totalPages} onPage={setPage}/>
  </>;
}
