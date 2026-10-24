import { LivePage } from "@/shared/components/LiveUi.jsx";

import { Detail } from "@/features/vehicles/components/Detail.jsx";

export default function CarDetail({ carId }) {
    return <LivePage>
      <Detail carId={carId}/>
  </LivePage>;
}

