import { useNavigate } from "react-router";
import { HoldButton } from "@/components/HoldButton.jsx";
export function PaymentActions() {
    const navigate = useNavigate();
    return <div data-hold-control="true" className="space-y-3"><HoldButton onComplete={() => navigate("/payment/success")}>Giữ để xác nhận thanh toán</HoldButton><HoldButton danger onComplete={() => navigate("/my-trips?cancelled=1")}>Giữ để hủy đặt xe</HoldButton></div>;
}
