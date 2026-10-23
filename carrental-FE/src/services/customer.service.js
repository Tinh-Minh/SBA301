import { request, toPage } from "./http";

/** GET /api/customers/me */
export const getMyProfile = () => request("/api/customers/me");

/** GET /api/customers/me/kyc */
export const getMyKyc = () => request("/api/customers/me/kyc");

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
    return request("/api/customers/me", { method: "PATCH", json });
}

/** ADMIN: GET /api/customers?status&kycStatus&keyword&page&size&sort */
export async function listCustomers({ status, kycStatus, keyword, page = 0, size = 20, sort = "createdAt,desc" } = {}) {
    return toPage(await request("/api/customers", { query: { status, kycStatus, keyword, page, size, sort } }));
}

/** ADMIN: GET /api/customers/{id} */
export const getCustomer = (id) => request(`/api/customers/${id}`);

/** ADMIN: GET /api/customers/{id}/kyc */
export const getCustomerKyc = (id) => request(`/api/customers/${id}/kyc`);

/** ADMIN: PATCH /api/customers/{id}/status { status: ACTIVE|LOCKED, reason } */
export const updateCustomerStatus = (id, status, reason) => request(`/api/customers/${id}/status`, { method: "PATCH", json: { status, reason } });
