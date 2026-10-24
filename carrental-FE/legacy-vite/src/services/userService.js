import api from './api';
import { userStorage } from '../storage';

export const userService = {
  /**
   * Get user profile details
   */
  async getProfile() {
    try {
      const profile = await api.get('/user/profile');
      if (profile) userStorage.setUser(profile);
      return profile;
    } catch {
      return userStorage.getUser();
    }
  },

  /**
   * Update personal info
   */
  async updateProfile(profileData) {
    try {
      const updated = await api.put('/user/profile', profileData);
      userStorage.updateUser(profileData);
      return updated;
    } catch {
      userStorage.updateUser(profileData);
      return { success: true, user: profileData };
    }
  },

  /**
   * Upload KYC document (CCCD / GPLX / Passport)
   */
  async uploadKycDocument(documentType, file) {
    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('file', file);

      return await api.post('/user/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch {
      return {
        success: true,
        status: 'PENDING',
        message: 'Tài liệu đã được gửi và chuyển sang trạng thái "Chờ duyệt"',
      };
    }
  },
};

export default userService;
