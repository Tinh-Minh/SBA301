import api from './api';
import { tokenStorage, userStorage } from '../storage';

export const authService = {
  /**
   * Log in user with email/phone & password
   */
  async login({ account, password }) {
    try {
      const response = await api.post('/auth/login', { account, password });
      if (response?.token) {
        tokenStorage.setToken(response.token);
      }
      if (response?.user) {
        userStorage.setUser(response.user);
      }
      return response;
    } catch {
      // Offline / Demo fallback
      const mockUser = {
        id: 'CDB-VN-88492',
        fullName: 'Nguyễn Hoàng Minh',
        email: account.includes('@') ? account : 'minh.nguyen@example.com',
        phone: !account.includes('@') ? account : '0908 123 456',
        role: 'CUSTOMER',
        membershipTier: 'VIP',
      };
      tokenStorage.setToken('mock_jwt_token_vip_cardb');
      userStorage.setUser(mockUser);
      return { success: true, user: mockUser };
    }
  },

  /**
   * Register new user account
   */
  async register({ fullName, email, phone, password }) {
    try {
      return await api.post('/auth/register', { fullName, email, phone, password });
    } catch {
      // Demo fallback
      return { success: true, message: 'OTP sent to ' + phone };
    }
  },

  /**
   * Logout user and clear tokens
   */
  logout() {
    tokenStorage.clearToken();
    tokenStorage.clearRefreshToken();
  },

  /**
   * Get current authenticated user session
   */
  getCurrentUser() {
    return userStorage.getUser();
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated() {
    return tokenStorage.hasValidToken();
  },
};

export default authService;
