"use client";
import { useRouter } from "next/navigation";
import { HoldButton } from "@/components/HoldButton.jsx";
export function PaymentActions() {
    const router = useRouter();
    return <div data-hold-control="true" className="space-y-3"><HoldButton onComplete={() => router.push("/payment/success")}>Giữ để xác nhận thanh toán</HoldButton><HoldButton danger onComplete={() => router.push("/my-trips?cancelled=1")}>Giữ để hủy đặt xe</HoldButton></div>;
}
