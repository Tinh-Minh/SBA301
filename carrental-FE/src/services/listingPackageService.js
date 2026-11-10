import { request } from "@/services/api.js";
import { endpoints } from "@/services/endpoints.js";
import { repairPackageText } from "@/utils/text.js";

const createPayload = ({ name, code, price, durationDays, priorityLevel, badgeLabel, description, isActive }) => ({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    price: Number(price),
    durationDays: Number(durationDays),
    priorityLevel: Number(priorityLevel),
    badgeLabel: badgeLabel?.trim() || null,
    description: description?.trim() || null,
    isActive: isActive !== false,
});

const updatePayload = ({ name, price, durationDays, priorityLevel, badgeLabel, description, isActive }) => ({
    name: name.trim(),
    price: Number(price),
    durationDays: Number(durationDays),
    priorityLevel: Number(priorityLevel),
    badgeLabel: badgeLabel?.trim() || null,
    description: description?.trim() || null,
    isActive: Boolean(isActive),
});

export const listingPackageService = {
    publicList: async () => {
        const data = await request(endpoints.listingPackages.publicList, { auth: false });
        return Array.isArray(data) ? data.map(repairPackageText) : [];
    },
    adminList: async () => {
        const data = await request(endpoints.listingPackages.adminList);
        return Array.isArray(data) ? data.map(repairPackageText) : [];
    },
    create: (values) => request(endpoints.listingPackages.adminList, {
        method: "POST",
        json: createPayload(values),
    }),
    update: (id, values) => request(endpoints.listingPackages.adminById(id), {
        method: "PUT",
        json: updatePayload(values),
    }),
};
