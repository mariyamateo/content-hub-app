'use client';

import { useEffect, useState } from 'react';
import { keycloak, getToken } from '@/lib/keycloak';
import { AuthUser } from '@/lib/types';

interface KeycloakIdTokenClaims {
  sub: string;
  email: string;
  name?: string;
  preferred_username: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (keycloak.authenticated && keycloak.idTokenParsed) {
      const idToken = keycloak.idTokenParsed as KeycloakIdTokenClaims;
      setUser({
        keycloakId: idToken.sub,
        email: idToken.email,
        name: idToken.name || idToken.preferred_username,
      });
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    authenticated,
    token: getToken(),
  };
}
