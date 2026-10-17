import { cancelTrip } from "@/storage/tripStorage.js";
import { useNavigate } from "react-router";
import { HoldButton } from "@/components/HoldButton.jsx";
export function PaymentActions() {
    const navigate = useNavigate();
    return <div data-hold-control="true" className="space-y-3"><HoldButton onComplete={() => navigate("/thanh-toan/thanh-cong")}>Giữ để xác nhận thanh toán</HoldButton><HoldButton danger onComplete={() => { cancelTrip("CDB-ORD-20261026-904"); navigate("/tai-khoan/don-thue?cancelled=1"); }}>Giữ để hủy đặt xe</HoldButton></div>;
}
