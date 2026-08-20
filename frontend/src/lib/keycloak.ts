import Keycloak from 'keycloak-js';

export const keycloak = new Keycloak({
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL!,
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
});

// React 18 Strict Mode double-invokes effects in dev, and keycloak-js throws
// if `.init()` is called twice on the same instance — memoize the promise so
// repeated calls (Strict Mode, multiple mounts) share the single real init.
let initPromise: Promise<boolean> | null = null;

export function initKeycloak(): Promise<boolean> {
  if (!initPromise) {
    initPromise = keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${window.location.origin}/auth/silent-check-sso.html`,
        pkceMethod: 'S256',
      })
      .catch((error: unknown) => {
        console.error('Keycloak init error:', error);
        initPromise = null;
        return false;
      });
  }
  return initPromise;
}

export function login() {
  keycloak.login({
    redirectUri: process.env.NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI,
  });
}

export function logout() {
  // keycloak-js defaults post_logout_redirect_uri to the CURRENT page's
  // URL, which is almost never a registered redirect URI (and varies by
  // page, so it can't be allowlisted per-page) — Keycloak then rejects the
  // whole logout with 400 "Invalid redirect uri" before invalidating
  // anything. Pin a single, always-registered destination instead.
  keycloak.logout({ redirectUri: `${window.location.origin}/` });
}

export function getToken() {
  return keycloak.token;
}

export function isAuthenticated() {
  return keycloak.authenticated;
}
