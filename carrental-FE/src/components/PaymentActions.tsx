import { useNavigate } from "react-router-dom";
import { HoldButton } from "./HoldButton";
export function PaymentActions() {
 const navigate=useNavigate();
 return <div data-hold-control="true" className="space-y-3"><HoldButton onComplete={()=>navigate("/thanh-toan/thanh-cong")}>Giữ để xác nhận thanh toán</HoldButton><HoldButton danger onComplete={()=>navigate("/chuyen-xe-cua-toi?cancelled=1")}>Giữ để hủy đặt xe</HoldButton></div>;
}
