import { redirect } from "next/navigation";
import { ownerRoutes } from "@/lib/owner/routes";

export default function OwnerIndex() {
  redirect(ownerRoutes.dashboard);
}
