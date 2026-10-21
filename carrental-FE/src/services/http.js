const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
/** Không cấu hình `NEXT_PUBLIC_API_URL` thì toàn bộ service dùng dữ liệu mẫu trong bộ nhớ. */
export const USE_MOCK_API = !API_BASE_URL;
export class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "ApiError";
    }
}
export async function request(path, init = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json", ...init.headers },
    });
    if (!response.ok)
        throw new ApiError(response.status, (await response.text()) || response.statusText);
    return response.status === 204 ? undefined : (await response.json());
}
export const jsonBody = (value) => JSON.stringify(value);
export function mockResponse(value, delayMs = 200) {
    return new Promise(resolve => setTimeout(() => resolve(structuredClone(value)), delayMs));
}
