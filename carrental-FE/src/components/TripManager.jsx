import { useToast } from "@/components/ToastProvider.jsx";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ProfileLayout } from "@/layouts/ProfileLayout.jsx";
import { Icon } from "@/components/Icon.jsx";
import { Modal } from "@/components/Modal.jsx";
import { HoldButton } from "@/components/HoldButton.jsx";
import { trips, tripStatuses, isPastTrip, formatTripDate as date, formatTripMoney as money, downloadTripReport, tripTimeRemaining } from "@/utils/trips.js";
import { readTripCancellations, cancelTrip } from "@/storage/tripStorage.js";

const controlBase = "ui-action inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors";
const control = `${controlBase} border-border-light bg-white text-text-primary hover:border-brand-accent/40 hover:text-brand-accent`;
const primaryControl = `${controlBase} border-brand-accent bg-brand-accent text-white hover:bg-primary-hover hover:text-white`;
const dangerControl = `${controlBase} border-error/20 bg-white text-error hover:bg-error-container/40`;
const selectedControl = `${controlBase} border-brand-accent/20 bg-accent-soft text-brand-accent`;
const field = "w-full min-w-0 rounded-lg border border-border-light bg-white px-3 py-2.5 text-xs text-text-primary outline-none focus:border-brand-accent";
const pageSize = 4;

export function TripManager({ history = false }) {
    const [params, setParams] = useSearchParams();
    const [cancelled, setCancelled] = useState(readTripCancellations);
    const notify = useToast();
    const [modal, setModal] = useState(null);
    const records = trips.map(trip => cancelled.includes(trip.id) ? { ...trip, status: "cancelled", cancellationFee: 0, note: "Đã hủy yêu cầu. Không phát sinh phí hủy trong bản xem trước." } : trip);
    const collection = records.filter(trip => isPastTrip(trip) === history);
    const statuses = Object.keys(tripStatuses).filter(status => isPastTrip({ status }) === history);
    const status = statuses.includes(params.get("status")) ? params.get("status") : "all";
    const query = params.get("q") || "";
    const period = params.get("period") || "all";
    const sort = params.get("sort") || "newest";
    const filtered = collection.filter(trip => (status === "all" || trip.status === status)
        && `${trip.car} ${trip.id}`.toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi"))
        && (period === "all" || trip.start.startsWith(period)))
        .sort((a, b) => sort === "price" ? b.total - a.total : sort === "pickup" ? a.start.localeCompare(b.start) : sort === "oldest" ? a.created.localeCompare(b.created) : b.created.localeCompare(a.created));
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const page = Math.min(pages, Math.max(1, Number.parseInt(params.get("page"), 10) || 1));
    const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
    const counts = Object.fromEntries(Object.keys(tripStatuses).map(key => [key, collection.filter(trip => trip.status === key).length]));
    const selected = modal || (params.get("order") ? { kind: "details", id: params.get("order") } : null);
    const selectedTrip = records.find(trip => trip.id === selected?.id);
    const months = [...new Set(collection.map(trip => trip.start.slice(0, 7)))].sort().reverse();
    function update(values, replace = false) {
        setParams(current => {
            const next = new URLSearchParams(current);
            if (!("order" in values)) next.delete("page");
            for (const [key, value] of Object.entries(values)) value && value !== "all" ? next.set(key, value) : next.delete(key);
            return next;
        }, { replace, preventScrollReset: true });
    }
    function closeModal() { setModal(null); if (params.has("order")) update({ order: null }, true); }
    function detailUrl(id) { const next = new URLSearchParams(params); next.set("order", id); return `?${next}`; }
    function show(kind, trip) { setModal({ kind, id: trip.id }); }
    async function copy(trip) {
        try { await navigator.clipboard.writeText(trip.id); notify(`Đã sao chép: ${trip.id}`); }
        catch { notify(`Mã đơn: ${trip.id}`); }
    }
    function confirmCancellation() {
        const saved = cancelTrip(selectedTrip.id);
        setCancelled(current => [...new Set([...current, selectedTrip.id])]);
        closeModal();
        notify(saved ? "Đã hủy yêu cầu thuê xe. Danh sách và số lượng đã được cập nhật." : "Đã hủy trong phiên hiện tại. Trình duyệt không cho phép lưu thay đổi.");
    }
    function exportReport() { downloadTripReport(filtered); notify(`Đã xuất ${filtered.length} chuyến xe sang CSV.`); }
    return <div data-managed-interactions className={`cardb-screen ${history ? "screen-history" : "screen-accountorders"} bg-background font-body-md text-body-md text-on-surface antialiased`}>
      <ProfileLayout active={history ? "history" : "orders"} title={history ? "Lịch sử chuyến đi" : "Đơn thuê xe"}>
        <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm sm:p-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
          <div className="trip-status-tabs min-w-0 flex-1" aria-label="Lọc trạng thái chuyến đi">
            {["all", ...statuses].map(key => <button type="button" key={key} aria-pressed={status === key} onClick={() => update({ status: key })} className="trip-status-tab ui-action">
              {key === "all" ? "Tất cả" : tripStatuses[key].label} ({key === "all" ? collection.length : counts[key]})
            </button>)}
          </div>
          <div data-trip-toolbar className="flex shrink-0 justify-end gap-2 pb-1 whitespace-nowrap"><button type="button" className={control} onClick={() => { setCancelled(readTripCancellations()); notify("Đã làm mới danh sách chuyến xe."); }}><Icon name="refresh" className="text-base"/>Làm mới</button><button type="button" className={control} onClick={exportReport}><Icon name="download" className="text-base"/>Xuất CSV</button></div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <label className="min-w-0 sm:col-span-2 xl:col-span-1"><span className="mb-1.5 block text-xs font-semibold">Tìm chuyến xe</span><input type="search" aria-label="Tìm theo mã đơn hoặc tên xe" placeholder="Mã đơn hoặc tên xe" value={query} onChange={event => update({ q: event.target.value }, true)} className={field}/></label>
            <label className="min-w-0"><span className="mb-1.5 block text-xs font-semibold">Thời gian nhận xe</span><select aria-label="Thời gian nhận xe" className={field} value={period} onChange={event => update({ period: event.target.value })}><option value="all">Tất cả thời gian</option><option value="2026">Năm 2026</option>{months.map(month => <option key={month} value={month}>Tháng {month.slice(5)}/{month.slice(0, 4)}</option>)}</select></label>
            <label className="min-w-0"><span className="mb-1.5 block text-xs font-semibold">Sắp xếp</span><select aria-label="Sắp xếp chuyến xe" className={field} value={sort} onChange={event => update({ sort: event.target.value })}><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="pickup">Ngày nhận xe</option><option value="price">Giá trị cao nhất</option></select></label>
          </div>
        </div>
        <div className="space-y-4">
          {visible.map(trip => <article key={trip.id} data-trip-card data-trip-status={trip.status} data-trip-id={trip.id} className="trip-card group relative isolate overflow-hidden rounded-xl border border-border-light bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-light bg-section-bg/60 px-4 py-3">
              <div className="flex min-w-0 items-center gap-1.5"><span className="truncate font-mono text-[11px] font-semibold" title={trip.id}>{trip.id}</span><button type="button" aria-label={`Sao chép mã ${trip.id}`} onClick={() => copy(trip)} className="relative z-20 shrink-0 rounded p-1 text-text-secondary hover:bg-white hover:text-brand-accent"><Icon name="content_copy" className="text-sm"/></button></div>
              <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${tripStatuses[trip.status].tone}`}><Icon name={tripStatuses[trip.status].icon} className="text-sm"/>{tripStatuses[trip.status].label}</span>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
                <img src={`/images/${trip.image}`} alt={trip.car} loading="lazy" decoding="async" className="aspect-[16/9] w-full shrink-0 rounded-lg object-cover sm:aspect-[4/3] sm:w-36"/>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="min-w-0"><h2 className="truncate text-base font-bold text-text-primary transition-colors group-hover:text-brand-accent" title={trip.car}><Link to={detailUrl(trip.id)} preventScrollReset aria-label={`Chi tiết đơn thuê ${trip.car}`} className="trip-card-link">{trip.car}</Link></h2><p className="mt-1 truncate text-xs text-text-secondary" title={`Chủ xe: ${trip.owner}`}>Chủ xe: {trip.owner} · ★ {trip.rating}</p></div>
                  <div className="grid grid-cols-1 gap-2 min-[440px]:grid-cols-2">
                    <div className="min-w-0"><span className="block text-[11px] text-text-secondary">Nhận xe</span><span className="block truncate text-xs font-medium" title={date(trip.start)}>{date(trip.start)}</span></div>
                    <div className="min-w-0"><span className="block text-[11px] text-text-secondary">Trả xe</span><span className="block truncate text-xs font-medium" title={date(trip.end)}>{date(trip.end)}</span></div>
                  </div>
                  <p className="flex min-w-0 items-center gap-1.5 text-xs text-text-secondary"><Icon name="pin_drop" className="text-base text-brand-accent"/><span className="truncate" title={trip.location}>{trip.location}</span></p>
                </div>
              </div>
              {trip.status === "active" ? <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-accent-soft p-3 text-xs"><div className="col-span-2 min-w-0"><span className="block text-text-secondary">Hạn trả xe</span><strong className="block truncate text-brand-accent">{date(trip.end)}</strong><span className="mt-1 block whitespace-nowrap text-[11px] text-text-secondary">{tripTimeRemaining(trip.end)}</span></div><div>Nhiên liệu: <strong>{trip.fuel}</strong></div><div>ODO: <strong>{trip.odometer}</strong></div></div> : null}
              <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-border-light pt-4">
                <div><p className="text-[11px] text-text-secondary">{trip.status === "cancelled" ? "Phí hủy" : "Tiền thuê xe"}</p><strong className="ui-money block text-lg font-bold text-brand-accent">{money(trip.status === "cancelled" ? trip.cancellationFee || 0 : trip.total)}</strong></div>
                <div className="text-left text-[11px] text-text-secondary sm:text-right"><p className="whitespace-nowrap">{trip.paid ? "Đã thanh toán" : trip.status === "cancelled" ? "Không phát sinh thanh toán" : "Chưa thanh toán"}</p><p className="mt-1 whitespace-nowrap">Cọc: {money(trip.deposit)}{trip.status === "completed" ? " · Đã hoàn" : trip.status === "active" ? " · Đã giữ" : ""}</p></div>
              </div>
              {trip.status === "confirmed" && !trip.paid && trip.paymentDeadline ? <p className="mt-3 text-xs text-status-amber-strong">Hạn thanh toán: <strong className="whitespace-nowrap">{trip.paymentDeadline}</strong></p> : null}
              <p className="mt-3 text-xs leading-relaxed text-text-secondary">{trip.note}</p>
              <div className="relative z-20 mt-4 flex flex-wrap gap-2">
                {trip.status === "confirmed" && !trip.paid ? <Link className={primaryControl} to={`/thanh-toan?order=${trip.id}`}>Thanh toán ngay<Icon name="arrow_forward" className="text-base"/></Link> : null}
                {["pending", "confirmed"].includes(trip.status) ? <button type="button" className={dangerControl} onClick={() => show("cancel", trip)}>Hủy yêu cầu</button> : null}
                {trip.status === "active" ? <><Link className={control} to={`/ban-giao/nhan-xe?order=${trip.id}`}><Icon name="description" className="text-base"/>Vị trí & Biên nhận</Link><a className={control} href="tel:19008899"><Icon name="call" className="text-base"/>Hỗ trợ khẩn cấp</a></> : null}
                {trip.status === "confirmed" && trip.paid ? <Link className={control} to={`/ban-giao/nhan-xe?order=${trip.id}`}>Biên bản nhận xe</Link> : null}
                {trip.status === "completed" ? <><button type="button" className={control} onClick={() => show("invoice", trip)}><Icon name="receipt_long" className="text-base"/>Tải hóa đơn VAT</button><button type="button" className={control} onClick={() => show("return", trip)}>Biên bản trả xe C10-B</button>{trip.review ? <button type="button" className={control} onClick={() => show("review", trip)}>Xem đánh giá {trip.review}</button> : <Link className={control} to={`/danh-gia?order=${trip.id}`}>★ Viết đánh giá</Link>}<Link className={control} to={trip.car.startsWith("VinFast VF 8") ? "/xe/vinfast-vf8-plus-2024" : `/kham-pha-xe?car=${encodeURIComponent(trip.car)}`}>Đặt lại xe này</Link></> : null}
                {trip.status === "cancelled" ? <><Link className={control} to="/chinh-sach-huy-chuyen">Chính sách hoàn tiền</Link><Link className={control} to="/kham-pha-xe">Tìm xe khác tương đương</Link></> : null}
              </div>
            </div>
          </article>)}
          {!visible.length ? <div role="status" className="rounded-xl border border-dashed border-border-light bg-white p-8 text-center"><Icon name="travel_explore" className="mb-3 text-3xl text-brand-accent"/><h2 className="text-base font-semibold">Chưa có chuyến xe phù hợp</h2><p className="mt-2 text-xs text-text-secondary">Đổi trạng thái hoặc xóa bộ lọc để xem các chuyến xe khác.</p><button type="button" className={`${control} mt-4`} onClick={() => setParams({}, { preventScrollReset: true })}>Xóa bộ lọc</button></div> : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary"><p>Hiển thị {filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} / {filtered.length} chuyến xe</p><nav aria-label="Phân trang chuyến xe" className="flex items-center gap-1"><button type="button" aria-label="Trang trước" disabled={page === 1} onClick={() => update({ page: String(page - 1) })} className={`${control} disabled:cursor-not-allowed disabled:opacity-40`}><Icon name="chevron_left" className="text-base"/></button>{Array.from({ length: pages }, (_, i) => <button type="button" key={i} aria-label={`Trang ${i + 1}`} aria-current={page === i + 1 ? "page" : undefined} onClick={() => update({ page: String(i + 1) })} className={page === i + 1 ? selectedControl : control}>{i + 1}</button>)}<button type="button" aria-label="Trang sau" disabled={page === pages} onClick={() => update({ page: String(page + 1) })} className={`${control} disabled:cursor-not-allowed disabled:opacity-40`}><Icon name="chevron_right" className="text-base"/></button></nav></div>
      </ProfileLayout>
      {selectedTrip ? <Modal title={selected.kind === "cancel" ? "Hủy yêu cầu thuê xe" : selected.kind === "invoice" ? "Hóa đơn thuê xe" : selected.kind === "return" ? "Biên bản trả xe C10-B" : selected.kind === "review" ? "Đánh giá chuyến đi" : "Chi tiết đơn thuê"} close={closeModal}><div data-managed-interactions data-trip-document={selected.kind === "invoice" || selected.kind === "return" ? "true" : undefined} className="space-y-4">
        <div><p className="break-all font-mono text-xs text-text-secondary">{selectedTrip.id}</p><h3 className="mt-2 truncate text-lg font-bold" title={selectedTrip.car}>{selectedTrip.car}</h3><span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tripStatuses[selectedTrip.status].tone}`}>{tripStatuses[selectedTrip.status].label}</span></div>
        {selected.kind === "cancel" ? <><HoldButton danger onComplete={confirmCancellation}>Giữ để hủy chuyến</HoldButton></> : <>
          <dl className="space-y-3 text-sm"><div><dt className="text-xs text-text-secondary">Thời gian thuê</dt><dd className="mt-1">{date(selectedTrip.start)} — {date(selectedTrip.end)}</dd></div><div><dt className="text-xs text-text-secondary">Địa điểm</dt><dd className="mt-1">{selectedTrip.location}</dd></div><div><dt className="text-xs text-text-secondary">Chủ xe</dt><dd>{selectedTrip.owner} · ★ {selectedTrip.rating}</dd></div><div className="flex flex-wrap justify-between gap-2 border-t border-border-light pt-3"><dt>Tiền thuê</dt><dd className="ui-money font-semibold">{money(selectedTrip.total)}</dd></div>{selectedTrip.discount ? <div className="flex flex-wrap justify-between gap-2 text-brand-accent"><dt>Ưu đãi CARDBWELCOME</dt><dd className="ui-money">Đã giảm {money(selectedTrip.discount)}</dd></div> : null}<div className="flex flex-wrap justify-between gap-2"><dt>Cọc thế chấp</dt><dd className="ui-money">{money(selectedTrip.deposit)}</dd></div>{selectedTrip.refund ? <div><dt className="font-medium text-status-success-ink">Đã hoàn cọc 100%</dt><dd className="mt-1 text-xs text-text-secondary">{selectedTrip.refund}</dd></div> : null}{selectedTrip.distance ? <div><dt>Quãng đường</dt><dd>{selectedTrip.distance}</dd></div> : null}</dl>
          {selected.kind === "review" ? <p className="rounded-lg bg-accent-soft p-4 text-sm">★ {selectedTrip.review} / 5 · Xe sạch, nhận xe đúng giờ, chủ xe nhiệt tình.</p> : <p className="text-sm leading-relaxed text-text-secondary">{selectedTrip.note}</p>}
          <div className="flex flex-wrap gap-2">{["invoice", "return"].includes(selected.kind) ? <button type="button" className={control} onClick={() => window.print()}><Icon name="print" className="text-base"/>In / Lưu PDF</button> : null}{selectedTrip.status === "confirmed" && !selectedTrip.paid ? <Link className={primaryControl} to={`/thanh-toan?order=${selectedTrip.id}`}>Thanh toán ngay</Link> : null}{selectedTrip.id === "CDB-ORD-20261026-904" ? <Link className={control} to="/don-thue/CDB-ORD-20261026-904">Xem tiến trình đơn thuê</Link> : null}</div>
        </>}
      </div></Modal> : null}
    </div>;
}
