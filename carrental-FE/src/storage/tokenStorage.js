import { storage } from './localStorage';

const TOKEN_KEY = 'cardb_auth_token';
const REFRESH_TOKEN_KEY = 'cardb_refresh_token';

export const tokenStorage = {
  getToken: () => storage.get(TOKEN_KEY),
  setToken: (token) => storage.set(TOKEN_KEY, token),
  clearToken: () => storage.remove(TOKEN_KEY),

  getRefreshToken: () => storage.get(REFRESH_TOKEN_KEY),
  setRefreshToken: (token) => storage.set(REFRESH_TOKEN_KEY, token),
  clearRefreshToken: () => storage.remove(REFRESH_TOKEN_KEY),

  hasValidToken: () => Boolean(storage.get(TOKEN_KEY)),
};

export default tokenStorage;
