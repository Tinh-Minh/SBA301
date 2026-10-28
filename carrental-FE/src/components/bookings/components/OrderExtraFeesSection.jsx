import { useState } from "react";
import { formatMoney, feeTypeLabels, extraFeeStatusLabels, extraFeeStatusTone } from "@/shared/utils/labels.js";
import { formatDateTime } from "@/shared/utils/datetime.js";
import { Pill, Primary, fieldClass } from "@/components/LiveUi.jsx";
import { useAuth } from "@/shared/hooks/useAuth.js";
import { useOrderExtraFees, useExtraFeeActions } from "@/shared/hooks/useExtraFees.js";

const FEE_TYPE_OPTIONS = [
    { value: "LATE_RETURN", label: "Trả xe trễ" },
    { value: "EXTRA_KM", label: "Quá số km quy định" },
    { value: "CLEANING", label: "Vệ sinh xe" },
    { value: "FUEL", label: "Nhiên liệu / Pin thiếu" },
    { value: "DAMAGE", label: "Hư hại / Trầy xước xe" },
    { value: "TRAFFIC_FINE", label: "Phạt nguội giao thông" },
    { value: "OTHER", label: "Phí khác" },
];

export function OrderExtraFeesSection({ order, isOwnerView = false, onReloadParent }) {
    if (!order?.id) return null;

    const { user, isAdmin } = useAuth();
    const isOwner = isOwnerView || (user && Number(order.ownerId) === Number(user.id));
    const isRenter = user && Number(order.customerId) === Number(user.id);

    const { data: fees = [], loading, error, reload } = useOrderExtraFees(order?.id);

    const handleSuccess = () => {
        reload();
        if (onReloadParent) onReloadParent();
    };

    const { create, pay, waive } = useExtraFeeActions(handleSuccess, order?.id);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [waiveTarget, setWaiveTarget] = useState(null);
    const [waiveNote, setWaiveNote] = useState("");

    const handlePayVNPay = async (feeId) => {
        try {
            const result = await pay.run({ id: feeId, method: "VNPAY" });
            if (result?.paymentUrl) {
                window.location.href = result.paymentUrl;
            }
        } catch {
            // error is stored in pay.error
        }
    };

    const handleConfirmCash = (feeId) => {
        if (window.confirm("Xác nhận bạn đã nhận đủ tiền mặt từ khách thuê?")) {
            void pay.run({ id: feeId, method: "CASH" });
        }
    };

    const handleConfirmWaive = () => {
        if (!waiveTarget) return;
        void waive.run({ id: waiveTarget.id, note: waiveNote.trim() }).then(() => {
            setWaiveTarget(null);
            setWaiveNote("");
        });
    };

    const busy = create.running || pay.running || waive.running;
    const actionError = create.error || pay.error || waive.error;

    return (
        <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F1EF] pb-3">
                <div>
                    <h2 className="font-bold text-gray-900">Phí phát sinh ({fees.length})</h2>
                    <p className="text-xs text-[#666666]">
                        Các khoản phí ngoài hợp đồng (trả trễ, quá km, dọn xe, tổn hại, phạt nguội).
                    </p>
                </div>
                {isOwner && (
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="rounded-xl bg-[#FC6C26] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#e05b1c]"
                    >
                        + Tạo phí phát sinh
                    </button>
                )}
            </div>

            {loading && !fees.length ? (
                <p className="py-4 text-center text-sm text-[#666666]">Đang tải danh sách phí...</p>
            ) : null}

            {error ? (
                <p className="py-4 text-center text-sm text-[#B91C1C]">{error.message}</p>
            ) : null}

            {actionError ? (
                <p className="mt-2 text-sm text-[#B91C1C]">{actionError.message}</p>
            ) : null}

            {!loading && fees.length === 0 ? (
                <p className="py-4 text-center text-sm text-[#666666]">Không có khoản phí phát sinh nào.</p>
            ) : null}

            {fees.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-3">
                    {fees.map((fee) => {
                        const isPending = fee.status === "PENDING";
                        return (
                            <li
                                key={fee.id}
                                className="flex flex-col gap-2 rounded-xl border border-[#E9E9E7] bg-[#FAFAFA] p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900">
                                            {feeTypeLabels[fee.feeType] ?? fee.feeType}
                                        </span>
                                        <Pill className={extraFeeStatusTone[fee.status]}>
                                            {extraFeeStatusLabels[fee.status] ?? fee.status}
                                        </Pill>
                                    </div>
                                    <p className="mt-1 font-semibold text-[#FC6C26]">
                                        {formatMoney(fee.amount)}
                                    </p>
                                    {fee.description && (
                                        <p className="text-xs text-[#666666]">{fee.description}</p>
                                    )}
                                    <p className="text-[11px] text-[#999999]">
                                        Tạo lúc: {formatDateTime(fee.createdAt)}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Renter action: Pay via VNPay */}
                                    {isPending && isRenter && (
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() => handlePayVNPay(fee.id)}
                                            className="rounded-lg bg-[#FC6C26] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#e05b1c] disabled:opacity-50"
                                        >
                                            {pay.running ? "Đang xử lý..." : "Thanh toán VNPay"}
                                        </button>
                                    )}

                                    {/* Owner action: Confirm cash payment */}
                                    {isPending && isOwner && (
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() => handleConfirmCash(fee.id)}
                                            className="rounded-lg border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                        >
                                            Đã nhận tiền mặt
                                        </button>
                                    )}

                                    {/* Owner / Admin action: Waive fee */}
                                    {isPending && (isOwner || isAdmin) && (
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() => setWaiveTarget(fee)}
                                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Miễn trừ
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : null}

            {/* Modal / Dialog Tạo phí mới */}
            {showCreateModal && (
                <CreateFeeModal
                    orderId={order?.id}
                    busy={create.running}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={async (form) => {
                        await create.run(form);
                        setShowCreateModal(false);
                    }}
                />
            )}

            {/* Modal Miễn trừ phí */}
            {waiveTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
                        <h3 className="text-base font-bold text-gray-900">Xác nhận miễn trừ phí</h3>
                        <p className="mt-1 text-xs text-[#666666]">
                            Phí: <b>{feeTypeLabels[waiveTarget.feeType] ?? waiveTarget.feeType}</b> ({formatMoney(waiveTarget.amount)})
                        </p>
                        <div className="mt-3">
                            <label className="text-xs font-medium text-gray-700">Lý do miễn trừ</label>
                            <input
                                type="text"
                                value={waiveNote}
                                onChange={(e) => setWaiveNote(e.target.value)}
                                placeholder="VD: Khách đã bù bằng tiền mặt ngoài lề..."
                                className={`${fieldClass} mt-1`}
                            />
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setWaiveTarget(null);
                                    setWaiveNote("");
                                }}
                                className="rounded-xl border border-gray-300 px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                disabled={waive.running}
                                onClick={handleConfirmWaive}
                                className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {waive.running ? "Đang xử lý..." : "Xác nhận miễn trừ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

function CreateFeeModal({ busy, onClose, onSubmit }) {
    const [feeType, setFeeType] = useState("LATE_RETURN");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) return;
        onSubmit({ feeType, amount: numAmount, description });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-base font-bold text-gray-900">Tạo phí phát sinh</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                    <div>
                        <label className="text-xs font-bold text-gray-700">Loại phí phát sinh *</label>
                        <select
                            value={feeType}
                            onChange={(e) => setFeeType(e.target.value)}
                            className={`${fieldClass} mt-1`}
                        >
                            {FEE_TYPE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-700">Số tiền (VNĐ) *</label>
                        <input
                            required
                            type="number"
                            min="1000"
                            step="1000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="VD: 150000"
                            className={`${fieldClass} mt-1`}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-700">Ghi chú / Mô tả chi tiết</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả lý do thu phí phát sinh..."
                            className={`${fieldClass} mt-1`}
                        />
                    </div>

                    <div className="mt-3 flex justify-end gap-2 border-t pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                        >
                            Đóng
                        </button>
                        <Primary type="submit" disabled={busy}>
                            {busy ? "Đang tạo..." : "Tạo phí phát sinh"}
                        </Primary>
                    </div>
                </form>
            </div>
        </div>
    );
}
