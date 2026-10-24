import { RequireAuth } from "@/shared/components/RequireAuth.jsx";
import { LivePage } from "@/shared/components/LiveUi.jsx";

import { Confirm } from "@/features/bookings/components/BookingConfirmation.jsx";

export default function Checkout() {
    return <LivePage width="max-w-3xl">
    <RequireAuth title="Đăng nhập để gửi yêu cầu thuê">
      <Confirm/>
    </RequireAuth>
  </LivePage>;
}
