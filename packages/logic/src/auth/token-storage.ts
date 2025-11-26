// Token storage helper that is safe across environments (SSR/client).
// Access token: localStorage (browser) or in-memory fallback.
// Refresh token: localStorage (browser) or in-memory fallback.

let memoryToken: string | null = null;
let memoryRefreshToken: string | null = null;

const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export const tokenStorage = {
  get: (): string | null => {
    if (isBrowser()) {
      return localStorage.getItem('authToken');
    }
    return memoryToken;
  },
  set: (token: string) => {
    if (isBrowser()) {
      localStorage.setItem('authToken', token);
    }
    memoryToken = token;
  },
  clear: () => {
    if (isBrowser()) {
      localStorage.removeItem('authToken');
    }
    memoryToken = null;
  },

  getRefresh: (): string | null => {
    if (isBrowser()) {
      return localStorage.getItem('refreshToken');
    }
    return memoryRefreshToken;
  },
  setRefresh: (token: string) => {
    if (isBrowser()) {
      localStorage.setItem('refreshToken', token);
    }
    memoryRefreshToken = token;
  },
  clearRefresh: () => {
    if (isBrowser()) {
      localStorage.removeItem('refreshToken');
    }
    memoryRefreshToken = null;
  },
};
