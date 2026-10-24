import { redirect } from "next/navigation";
import { ownerRoutes } from "@/utils/owner/routes.js";
export default function OwnerIndex() {
    redirect(ownerRoutes.dashboard);
}
