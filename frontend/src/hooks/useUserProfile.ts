import { useAuth0 } from '@auth0/auth0-react';

export interface UserProfile {
  userId: string;
  email?: string;
  name?: string;
  picture?: string;
  nickname?: string;
  sub?: string;
}

/**
 * Hook customizado para acessar informações do perfil do usuário
 */
export function useUserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  const profile: UserProfile | null = isAuthenticated && user ? {
    userId: user.sub || '',
    email: user.email,
    name: user.name,
    picture: user.picture,
    nickname: user.nickname,
    sub: user.sub
  } : null;

  return {
    profile,
    isAuthenticated,
    isLoading,
    user
  };
}
