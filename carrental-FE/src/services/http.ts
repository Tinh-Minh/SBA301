const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

/** Không cấu hình `NEXT_PUBLIC_API_URL` thì toàn bộ service dùng dữ liệu mẫu trong bộ nhớ. */
export const USE_MOCK_API = !API_BASE_URL;

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...init.headers },
  });
  if (!response.ok) throw new ApiError(response.status, (await response.text()) || response.statusText);
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export const jsonBody = (value: unknown) => JSON.stringify(value);

export function mockResponse<T>(value: T, delayMs = 200): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(structuredClone(value)), delayMs));
}
