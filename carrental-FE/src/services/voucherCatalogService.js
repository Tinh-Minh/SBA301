import { request } from "@/services/api.js";
import { endpoints } from "@/services/endpoints.js";

/** Customer-facing catalog. The checkout must revalidate package and per-user eligibility. */
export const voucherCatalogService = {
    availableForPackage: (packageId) => request(endpoints.vouchers.available, {
        query: { packageId: Number(packageId) },
    }),
};
