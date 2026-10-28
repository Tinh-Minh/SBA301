import { Link, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth.jsx";
import { LivePage, LiveState } from "@/components/LiveUi.jsx";
import { Pay } from "@/components/payments/PaymentForm.jsx";
import { transactionService } from "@/hooks/usePayments.js";
import { formatMoney } from "@/utils/labels.js";

function VNPayReturnResult({ searchParams }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const params = Object.fromEntries(searchParams.entries());
        transactionService.vnpayReturn(params)
            .then(data => setResult(data))
            .catch(err => setError(err))
            .finally(() => setLoading(false));
    }, [searchParams]);

    if (loading) {
        return <LiveState loading={true} label="kết quả thanh toán VNPay" />;
    }

    if (error) {
        return (
            <div className="flex flex-col gap-4 rounded-2xl border border-[#EF4444] bg-white p-6 shadow-sm text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FEE2E2] flex items-center justify-center text-2xl text-[#EF4444]">✕</div>
                <h1 className="text-xl font-bold text-[#B91C1C]">Xác thực thanh toán thất bại</h1>
                <p className="text-sm text-[#666666]">{error.message || "Không thể xác thực kết quả giao dịch từ VNPay."}</p>
                <div className="mt-4 flex justify-center gap-3">
                    <Link to="/my-trips" className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white">Chuyến xe của tôi</Link>
                </div>
            </div>
        );
    }

    const isSuccess = result?.status === "SUCCESS";
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-6 shadow-sm text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl font-bold ${isSuccess ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#FEE2E2] text-[#EF4444]"}`}>
                {isSuccess ? "✓" : "✕"}
            </div>
            <h1 className="text-xl font-bold">{isSuccess ? "Thanh toán thành công!" : "Thanh toán không thành công"}</h1>
            <p className="text-sm text-[#666666]">
                {isSuccess ? "Giao dịch qua cổng VNPay đã được xác nhận hoàn tất." : "Giao dịch qua VNPay đã bị hủy hoặc có lỗi xảy ra."}
            </p>
            {result ? (
                <div className="mt-2 rounded-xl bg-[#F7F7F5] p-4 text-left text-sm flex flex-col gap-2">
                    <div className="flex justify-between">
                        <span className="text-[#666666]">Mã giao dịch:</span>
                        <span className="font-bold">#{result.id}</span>
                    </div>
                    {result.orderCode && (
                        <div className="flex justify-between">
                            <span className="text-[#666666]">Mã đơn:</span>
                            <span className="font-bold">{result.orderCode}</span>
                        </div>
                    )}
                    {result.amount && (
                        <div className="flex justify-between">
                            <span className="text-[#666666]">Số tiền:</span>
                            <span className="font-bold text-[#FC6C26]">{formatMoney(result.amount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-[#666666]">Trạng thái:</span>
                        <span className={`font-bold ${isSuccess ? "text-[#047857]" : "text-[#EF4444]"}`}>{result.status}</span>
                    </div>
                </div>
            ) : null}
            <div className="mt-4 flex justify-center gap-3">
                {result?.orderId ? (
                    <Link to={`/orders/${result.orderId}`} className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white">Xem đơn thuê</Link>
                ) : null}
                <Link to="/my-trips" className="rounded-xl border border-[#E9E9E7] px-4 py-2 text-sm font-bold text-[#292929]">Chuyến xe của tôi</Link>
            </div>
        </div>
    );
}

export default function PaymentLive() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");
    const isVnpayReturn = searchParams.has("vnp_ResponseCode") || searchParams.has("vnp_TxnRef");

    return (
        <LivePage width="max-w-xl">
            <RequireAuth title="Đăng nhập để thanh toán">
                {isVnpayReturn ? (
                    <VNPayReturnResult searchParams={searchParams} />
                ) : orderId ? (
                    <Pay orderId={orderId} />
                ) : (
                    <p className="text-sm">Thiếu mã đơn. Mở thanh toán từ <Link to="/my-trips" className="font-bold text-[#FC6C26]">chuyến xe của tôi</Link>.</p>
                )}
            </RequireAuth>
        </LivePage>
    );
}
