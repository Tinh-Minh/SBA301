import { redirect } from "next/navigation";
import { adminRoutes } from "@/utils/admin/routes.js";

export default function AdminIndex() {
    redirect(adminRoutes.dashboard);
}
