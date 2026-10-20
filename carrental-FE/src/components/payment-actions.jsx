"use client";
import { useRouter } from "next/navigation";
import { HoldButton } from "./hold-button";
export function PaymentActions() {
    const router = useRouter();
    return <div data-hold-control="true" className="space-y-3"><HoldButton onComplete={() => router.push("/thanh-toan/thanh-cong")}>Giữ để xác nhận thanh toán</HoldButton><HoldButton danger onComplete={() => router.push("/chuyen-xe-cua-toi?cancelled=1")}>Giữ để hủy đặt xe</HoldButton></div>;
}
