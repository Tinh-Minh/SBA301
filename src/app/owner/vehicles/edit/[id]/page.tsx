import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OwnerVehicleEdit from "@/views/owner/OwnerVehicleEdit";

export const metadata: Metadata = { title: "Chỉnh sửa xe" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const carId = Number(id);
  if (!Number.isSafeInteger(carId) || carId <= 0) notFound();
  return <OwnerVehicleEdit carId={carId} />;
}
