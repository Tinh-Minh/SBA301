/** Trạng thái đăng nhập mẫu dùng chung qua AuthContext. */
export interface AuthContextValue {
  loggedIn: boolean;
  login: () => void;
  logout: () => void;
}
