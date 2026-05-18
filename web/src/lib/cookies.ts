export const AUTH_COOKIE_KEY = "mtm_token";

export function setAuthCookie(token: string) {
  const maxAgeSeconds = 60 * 60 * 24;
  document.cookie = `${AUTH_COOKIE_KEY}=${token}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
}
