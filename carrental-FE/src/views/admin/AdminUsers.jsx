"use client";
import { useCallback, useEffect, useState } from "react";
import { AdminDialog, AdminPageHeader, AdminState, Pager, PrimaryButton, StatusPill, Tabs, adminInput } from "@/components/admin/admin-ui";
import { useAsyncAction, useAsyncResource } from "@/hooks/use-async-resource";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { docTypeLabels, kycStatusLabels, verifyStatusLabels } from "@/lib/labels";
import { adminUserService } from "@/services/admin.service";

const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "kyc:PENDING", label: "Chờ duyệt KYC" },
    { id: "kyc:VERIFIED", label: "Đã xác thực" },
    { id: "kyc:REJECTED", label: "KYC bị từ chối" },
    { id: "status:LOCKED", label: "Bị khóa" },
];
const kycTone = { NONE: "neutral", PENDING: "warning", VERIFIED: "success", REJECTED: "danger" };
const docTone = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" };

export default function AdminUsers() {
    const [tab, setTab] = useState("all");
    const [keyword, setKeyword] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    useEffect(() => {
        const id = Number(new URLSearchParams(window.location.search).get("id"));
        if (id)
            setSelectedId(id);
    }, []);
    const [kind, value] = tab.split(":");
    const load = useCallback(() => adminUserService.list({
        kycStatus: kind === "kyc" ? value : undefined,
        status: kind === "status" ? value : undefined,
        keyword: query || undefined,
        page,
        size: 15,
    }), [kind, value, query, page]);
    const list = useAsyncResource(load, `${tab}|${query}|${page}`);
    const rows = list.data?.content ?? [];
    const activeId = selectedId ?? rows[0]?.id ?? null;

    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A02" title="Người dùng & KYC" description="Tra cứu khách hàng, đối chiếu giấy tờ CCCD/GPLX và khóa/mở tài khoản."/>
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Tabs items={tabs} value={tab} onChange={id => { setTab(id); setPage(0); }}/>
      <form className="flex gap-2" onSubmit={event => { event.preventDefault(); setQuery(keyword.trim()); setPage(0); }}>
        <input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="Tên, email, SĐT…" className={`${adminInput} w-56`}/>
        <button type="submit" className="rounded-xl bg-[#292929] px-4 py-2 text-sm font-bold text-white">Tìm</button>
      </form>
    </div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <div className="flex flex-col gap-3">
        <AdminState loading={list.loading && !list.data} error={list.error} empty={list.data && !rows.length} label="khách hàng" onRetry={list.reload}/>
        {rows.length ? <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-[#666666]"><tr>{["Mã KH", "Khách hàng", "Liên hệ", "KYC", "Tài khoản"].map(head => <th key={head} className="whitespace-nowrap px-4 py-3 font-bold">{head}</th>)}</tr></thead>
            <tbody>
              {rows.map(user => <tr key={user.id} onClick={() => setSelectedId(user.id)} className={`cursor-pointer border-t border-[#E9E9E7] ${user.id === activeId ? "bg-[#FFF7F2]" : ""}`}>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-[#FC6C26]">#{user.id}</td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#292929]">{user.fullName}{user.role === "ADMIN" ? <span className="ml-2 text-[10px] font-bold text-blue-700">ADMIN</span> : null}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[#666666]">{user.email}<br/><span className="text-xs">{user.phone}</span></td>
                <td className="px-4 py-3"><StatusPill tone={kycTone[user.kycStatus]}>{kycStatusLabels[user.kycStatus] ?? user.kycStatus}</StatusPill></td>
                <td className="px-4 py-3"><StatusPill tone={user.status === "LOCKED" ? "danger" : "success"}>{user.status === "LOCKED" ? "Bị khóa" : "Hoạt động"}</StatusPill></td>
              </tr>)}
            </tbody>
          </table>
        </div> : null}
        <Pager page={page} totalPages={list.data?.totalPages} onPage={setPage}/>
      </div>
      {activeId ? <UserDetail key={activeId} id={activeId} onChanged={list.reload}/> : null}
    </div>
  </div>;
}

function UserDetail({ id, onChanged }) {
    const load = useCallback(async () => {
        const [profile, kyc, documents] = await Promise.all([
            adminUserService.get(id),
            adminUserService.kyc(id).catch(() => null),
            adminUserService.listDocuments({ customerId: id }).then(page => page.content).catch(() => []),
        ]);
        return { profile, kyc, documents };
    }, [id]);
    const detail = useAsyncResource(load, id);
    const refresh = () => { detail.reload(); onChanged(); };
    const [dialog, setDialog] = useState(null);
    const [reason, setReason] = useState("");
    const review = useAsyncAction((docId, status, why) => adminUserService.reviewDocument(docId, status, why), () => { setDialog(null); setReason(""); refresh(); });
    const lock = useAsyncAction((status, why) => adminUserService.setStatus(id, status, why || null), () => { setDialog(null); setReason(""); refresh(); });
    if (!detail.data)
        return <aside><AdminState loading={detail.loading} error={detail.error} label="hồ sơ"/></aside>;
    const { profile, kyc, documents } = detail.data;
    const locked = profile.status === "LOCKED";
    return <aside className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <div>
      <h2 className="text-base font-bold text-[#292929]">{profile.fullName}</h2>
      <p className="text-xs text-[#666666]">KH #{profile.id} • tạo {formatDate(profile.createdAt)}</p>
    </div>
    <dl className="grid gap-2 text-sm">
      <Row term="Email" value={`${profile.email}${profile.emailVerified ? " ✓" : ""}`}/>
      <Row term="Điện thoại" value={profile.phone || "—"}/>
      <Row term="Ngày sinh" value={formatDate(profile.dateOfBirth)}/>
      <Row term="Địa chỉ" value={profile.address || "—"}/>
      <Row term="KYC" value={kycStatusLabels[kyc?.kycStatus ?? profile.kycStatus] ?? profile.kycStatus}/>
    </dl>
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-bold text-[#292929]">Giấy tờ đã nộp ({documents.length})</h3>
      {!documents.length ? <p className="text-sm text-[#666666]">Khách hàng chưa nộp giấy tờ.</p> : null}
      {documents.map(doc => <DocumentCard key={doc.id} doc={doc} busy={review.running}
            onApprove={() => void review.run(doc.id, "APPROVED")} onReject={() => setDialog({ type: "reject-doc", docId: doc.id })}/>)}
      {review.error ? <p className="text-sm text-[#B91C1C]">{review.error.message}</p> : null}
    </div>
    <div className="flex flex-col gap-2 border-t border-[#E9E9E7] pt-4">
      {locked
            ? <PrimaryButton disabled={lock.running} onClick={() => void lock.run("ACTIVE")}>Mở khóa tài khoản</PrimaryButton>
            : <button type="button" disabled={lock.running || profile.role === "ADMIN"} onClick={() => setDialog({ type: "lock" })} className="whitespace-nowrap rounded-xl border border-[#EF4444] px-4 py-2.5 text-sm font-bold text-[#EF4444] disabled:opacity-50">Khóa tài khoản</button>}
      {lock.error ? <p className="text-sm text-[#B91C1C]">{lock.error.message}</p> : null}
    </div>
    {dialog ? <AdminDialog title={dialog.type === "lock" ? "Khóa tài khoản" : "Từ chối giấy tờ"} onClose={() => setDialog(null)}>
      <label className="block text-sm text-[#666666]">Lý do
        <textarea value={reason} onChange={event => setReason(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E9E9E7] p-3 text-[#292929]" rows={3}/>
      </label>
      <div className="mt-3"><PrimaryButton disabled={review.running || lock.running || (dialog.type === "reject-doc" && !reason.trim())} onClick={() => dialog.type === "lock" ? void lock.run("LOCKED", reason.trim()) : void review.run(dialog.docId, "REJECTED", reason.trim())}>Xác nhận</PrimaryButton></div>
    </AdminDialog> : null}
  </aside>;
}

function DocumentCard({ doc, busy, onApprove, onReject }) {
    const [images, setImages] = useState(null);
    const [failed, setFailed] = useState(false);
    async function preview() {
        try {
            const sides = [doc.hasFrontImage ? "front" : null, doc.hasBackImage ? "back" : null].filter(Boolean);
            setImages(await Promise.all(sides.map(side => adminUserService.documentImage(doc.id, side))));
        }
        catch {
            setFailed(true);
        }
    }
    return <div className="rounded-xl border border-[#E9E9E7] p-3 text-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="font-bold text-[#292929]">{docTypeLabels[doc.docType] ?? doc.docType}</span>
      <StatusPill tone={docTone[doc.verifyStatus]}>{verifyStatusLabels[doc.verifyStatus] ?? doc.verifyStatus}</StatusPill>
    </div>
    <p className="mt-1 text-xs text-[#666666]">Số: {doc.docNumberMasked ?? "—"} • nộp {formatDateTime(doc.createdAt)}</p>
    {(doc.hasFrontImage || doc.hasBackImage) && !images ? <button type="button" onClick={preview} className="mt-2 text-xs font-bold text-[#FC6C26]">Xem ảnh giấy tờ</button> : null}
    {failed ? <p className="mt-1 text-xs text-[#B91C1C]">Không tải được ảnh (backend có thể đang tắt lưu trữ file).</p> : null}
    {images ? <div className="mt-2 grid grid-cols-2 gap-2">{images.map(src => <img key={src} src={src} alt="Ảnh giấy tờ" className="h-24 w-full rounded-lg object-cover"/>)}</div> : null}
    {doc.verifyStatus === "PENDING" ? <div className="mt-3 flex gap-2">
      <button type="button" disabled={busy} onClick={onApprove} className="rounded-lg bg-[#047857] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">Duyệt</button>
      <button type="button" disabled={busy} onClick={onReject} className="rounded-lg border border-[#EF4444] px-3 py-1.5 text-xs font-bold text-[#EF4444] disabled:opacity-60">Từ chối</button>
    </div> : null}
  </div>;
}

function Row({ term, value }) {
    return <div className="flex items-start justify-between gap-3"><dt className="whitespace-nowrap text-[#666666]">{term}</dt><dd className="text-right font-semibold text-[#292929]">{value}</dd></div>;
}
