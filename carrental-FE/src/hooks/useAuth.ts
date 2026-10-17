
import { createContext, useContext } from "react";
import type { AuthContextValue } from "@/interfaces/auth";

export const AuthContext = createContext<AuthContextValue>({ loggedIn: false, login: () => {}, logout: () => {} });

/** Đọc trạng thái đăng nhập mẫu do AuthProvider cung cấp. */
export const useAuth = () => useContext(AuthContext);
