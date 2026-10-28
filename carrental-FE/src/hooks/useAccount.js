import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { endpoints } from "@/shared/api/endpoints.js";
import { ApiError, request, toPage } from "@/shared/api/client.js";
import { normalizeBankAccount } from "@/utils/apiResponse.js";
import { toLocalDate } from "@/utils/datetime.js";

export const bankAccountService = {
    /** GET /api/bank-accounts */
    async list() {
        const page = toPage(await request(endpoints.bankAccounts.list, { query: { page: 0, size: 50 } }));
        return page.content.map(normalizeBankAccount);
    },
    /** POST /api/bank-accounts { bankName, accountNumber, accountHolder, makeDefault } */
    create: async ({ bankName, accountNumber, accountHolder, makeDefault }) => normalizeBankAccount(await request(endpoints.bankAccounts.list, {
        method: "POST",
        json: { bankName: bankName.trim(), accountNumber: accountNumber.replace(/\s+/g, ""), accountHolder: accountHolder.trim(), makeDefault: Boolean(makeDefault) },
    })),
    /** PATCH /api/bank-accounts/{id}/default (không body) */
    setDefault: async (id) => normalizeBankAccount(await request(endpoints.bankAccounts.byIdDefault(id), { method: "PATCH" })),
    /** DELETE /api/bank-accounts/{id} */
    remove: (id) => request(endpoints.bankAccounts.byId(id), { method: "DELETE" }),
    async getDefault() {
        const accounts = await this.list();
        return accounts.find(account => account.isDefault) ?? null;
    },
};

/** GET /api/customers/me */
export const getMyProfile = () => request(endpoints.customers.me);

/** GET /api/customers/me/kyc */
export const getMyKyc = () => request(endpoints.customers.meKyc);

/** PATCH /api/customers/me — fullName, dateOfBirth, address, email, phone, avatarUrl. */
export function updateMyProfile({ fullName, dateOfBirth, address, email, phone, avatarUrl }) {
    const json = {};
    if (fullName !== undefined)
        json.fullName = fullName;
    if (dateOfBirth !== undefined)
        json.dateOfBirth = dateOfBirth || null;
    if (address !== undefined)
        json.address = address;
    if (email !== undefined)
        json.email = email.trim();
    if (phone !== undefined)
        json.phone = phone.trim().replace(/\s+/g, "");
    if (avatarUrl !== undefined)
        json.avatarUrl = avatarUrl?.trim() ? avatarUrl.trim() : null;
    return request(endpoints.customers.me, { method: "PATCH", json });
}

/** ADMIN: GET /api/customers?status&kycStatus&keyword&page&size&sort */
export async function listCustomers({ status, kycStatus, keyword, page = 0, size = 20, sort = "createdAt,desc" } = {}) {
    return toPage(await request(endpoints.customers.list, { query: { status, kycStatus, keyword, page, size, sort } }));
}

/** ADMIN: GET /api/customers/{id} */
export const getCustomer = (id) => request(endpoints.customers.byId(id));

/** ADMIN: GET /api/customers/{id}/kyc */
export const getCustomerKyc = (id) => request(endpoints.customers.byIdKyc(id));

/** ADMIN: PATCH /api/customers/{id}/status { status: ACTIVE|LOCKED, reason } */
export const updateCustomerStatus = (id, status, reason) => request(endpoints.customers.byIdStatus(id), { method: "PATCH", json: { status, reason } });

export const driverService = {
    /** GET /api/drivers/me — 404 nếu chưa đăng ký. */
    async me() {
        try {
            return await request(endpoints.drivers.me);
        }
        catch (error) {
            if (error instanceof ApiError && error.status === 404)
                return null;
            throw error;
        }
    },
    eligibility: () => request(endpoints.drivers.meEligibility),
    register: () => request(endpoints.drivers.list, { method: "POST" }),
};

export const userDocumentService = {
    listMine: async () => toPage(await request(endpoints.userDocuments.list, { query: { scope: "mine", size: 50 } })).content,
    get: (id) => request(endpoints.userDocuments.byId(id)),
    submit({ docType, docNumber, fullNameOnDoc, dateOfBirthOnDoc, issuePlace, issueDate, expiresAt, licenseClass, frontImage, backImage }) {
        const form = new FormData();
        form.append("docType", docType);
        form.append("docNumber", docNumber.trim());
        const optional = { fullNameOnDoc, issuePlace, licenseClass: docType === "DRIVER_LICENSE" ? licenseClass : undefined };
        for (const [key, value] of Object.entries(optional))
            if (value?.trim?.())
                form.append(key, value.trim());
        for (const [key, value] of Object.entries({ dateOfBirthOnDoc, issueDate, expiresAt }))
            if (value)
                form.append(key, toLocalDate(value));
        if (frontImage)
            form.append("frontImage", frontImage);
        if (backImage)
            form.append("backImage", backImage);
        return request(endpoints.userDocuments.list, { method: "POST", body: form });
    },
    async image(id, side) {
        const blob = await request(endpoints.userDocuments.byIdFilesById(id, side), { responseType: "blob" });
        return URL.createObjectURL(blob);
    },
};

export function useProfile() {
    const load = useCallback(async () => {
        const [profile, kyc] = await Promise.all([getMyProfile(), getMyKyc().catch(() => null)]);
        return { profile, kyc };
    }, []);
    const detail = useApiQuery(["account", "profile"], load);
    return detail;
}

export function useBankAccounts() {
    const load = useCallback(() => bankAccountService.list(), []);
    const list = useApiQuery(["account", "banks"], load);
    return list;
}

export function useDriverProfile() {
    const load = useCallback(async () => {
        const [driver, eligibility] = await Promise.all([driverService.me(), driverService.eligibility().catch(() => null)]);
        return { driver, eligibility };
    }, []);
    const detail = useApiQuery(["account", "driver"], load);
    return detail;
}

export function useDocuments() {
    const load = useCallback(() => userDocumentService.listMine(), []);
    const list = useApiQuery(["account", "documents"], load);
    return list;
}

/** POST /api/auth/change-password — cần JWT. */
export function changePassword({ currentPassword, newPassword }) {
    return request(endpoints.auth.changePassword, { method: "POST", json: { currentPassword, newPassword } });
}
