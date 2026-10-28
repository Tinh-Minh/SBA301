import { LivePage } from "@/components/LiveUi.jsx";

import { Detail } from "@/components/vehicles/VehicleDetails.jsx";

export default function CarDetail({ carId }) {
    return <LivePage>
      <Detail carId={carId}/>
  </LivePage>;
}
