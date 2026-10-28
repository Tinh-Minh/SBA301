import { RequireAuth } from "@/components/RequireAuth.jsx";
import { LivePage } from "@/components/LiveUi.jsx";

import { Confirm } from "@/components/bookings/components/BookingConfirmation.jsx";

export default function Checkout() {
    return <LivePage width="max-w-3xl">
    <RequireAuth title="Đăng nhập để gửi yêu cầu thuê">
      <Confirm/>
    </RequireAuth>
  </LivePage>;
}
