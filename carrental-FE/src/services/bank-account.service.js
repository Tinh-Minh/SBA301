import { request, toPage } from "./http";
import { normalizeBankAccount } from "./adapters";

export const bankAccountService = {
    /** GET /api/bank-accounts */
    async list() {
        const page = toPage(await request("/api/bank-accounts", { query: { page: 0, size: 50 } }));
        return page.content.map(normalizeBankAccount);
    },
    /** POST /api/bank-accounts { bankName, accountNumber, accountHolder, makeDefault } */
    create: async ({ bankName, accountNumber, accountHolder, makeDefault }) => normalizeBankAccount(await request("/api/bank-accounts", {
        method: "POST",
        json: { bankName: bankName.trim(), accountNumber: accountNumber.replace(/\s+/g, ""), accountHolder: accountHolder.trim(), makeDefault: Boolean(makeDefault) },
    })),
    /** PATCH /api/bank-accounts/{id}/default (không body) */
    setDefault: async (id) => normalizeBankAccount(await request(`/api/bank-accounts/${id}/default`, { method: "PATCH" })),
    /** DELETE /api/bank-accounts/{id} */
    remove: (id) => request(`/api/bank-accounts/${id}`, { method: "DELETE" }),
    async getDefault() {
        const accounts = await this.list();
        return accounts.find(account => account.isDefault) ?? null;
    },
};
