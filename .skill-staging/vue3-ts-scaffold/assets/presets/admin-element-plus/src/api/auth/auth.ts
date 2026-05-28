import type { LoginForm, UserProfile } from '@/types/auth';
import { PERMISSION_KEYS } from '@/constants/permission';

export interface LoginResult {
  token: string;
  user: UserProfile;
}

export const loginWithPassword = async (payload: LoginForm): Promise<LoginResult> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    token: `demo-token-${payload.username}`,
    user: {
      id: 'demo-user',
      name: payload.username || 'Admin',
      roles: ['admin'],
      permissions: [PERMISSION_KEYS.exampleRead, PERMISSION_KEYS.exampleCreate],
    },
  };
};
