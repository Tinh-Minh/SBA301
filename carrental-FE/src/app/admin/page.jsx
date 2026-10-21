import { redirect } from "next/navigation";
import { adminRoutes } from "@/lib/admin/routes";

export default function AdminIndex() {
    redirect(adminRoutes.dashboard);
}
