import { storage } from './localStorage';

const USER_KEY = 'cardb_user_profile';

const DEFAULT_USER = {
  id: 'CDB-VN-88492',
  fullName: 'Nguyễn Hoàng Minh',
  email: 'minh.nguyen@example.com',
  phone: '0908 123 456',
  role: 'CUSTOMER', // 'CUSTOMER' | 'ADMIN' | 'PARTNER_OWNER'
  membershipTier: 'VIP',
  verified: true,
  avatar: 'https://lh3.googleusercontent.com/aida/AEtjO1WnoaN3L-g2X5UV_CavHBrqQj50xBeyrK8pGXbFLHvgrpo7aTVH9BADBIOfK5zt2n6tucOLOlrEbeAjP74rlwLNLiUIo6yhyMFfiVscm3vfLGshmy18X6v9FM93ahxdxjlGlzunE64w-QxkpHBFTyCyactMfJ7wW3u5f0F2MwkdrsieFmSqnP5gs7fVX80nT5YIeGWiMM2JSSFxQaXnYOi-pxQ_zPcWam72J7BwMpX4B4v0WXbWfXGXa8Ax',
};

export const userStorage = {
  getUser: () => storage.get(USER_KEY, DEFAULT_USER),
  setUser: (userData) => storage.set(USER_KEY, userData),
  clearUser: () => storage.remove(USER_KEY),
  updateUser: (partialData) => {
    const current = storage.get(USER_KEY, DEFAULT_USER);
    const updated = { ...current, ...partialData };
    storage.set(USER_KEY, updated);
    return updated;
  },
};

export default userStorage;
