export const isJwtExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));
    const expMs = payload.exp * 1000;
    return Date.now() >= expMs;
  } catch {
    return true;
  }
};
