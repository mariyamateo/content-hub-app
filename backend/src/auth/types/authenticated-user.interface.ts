export interface AuthenticatedUser {
  id: string;
  keycloakId: string;
  email: string;
  name: string;
  preferred_username: string;
}
