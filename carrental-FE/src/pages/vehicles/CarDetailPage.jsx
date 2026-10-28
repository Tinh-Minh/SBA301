import { LivePage } from "@/components/LiveUi.jsx";

import { Detail } from "@/components/vehicles/components/VehicleDetails.jsx";

export default function CarDetail({ carId }) {
    return <LivePage>
      <Detail carId={carId}/>
  </LivePage>;
}
