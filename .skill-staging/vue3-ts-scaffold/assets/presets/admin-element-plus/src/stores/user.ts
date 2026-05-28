import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { UserProfile } from '@/types/auth';
import { clearAuthToken, getAuthToken, setAuthToken } from '@/utils/auth';

export const useUserStore = defineStore('user', () => {
  const token = ref(getAuthToken());
  const profile = ref<UserProfile | null>(null);

  const isAuthenticated = computed(() => Boolean(token.value));

  const setSession = (nextToken: string, nextProfile: UserProfile) => {
    token.value = nextToken;
    profile.value = nextProfile;
    setAuthToken(nextToken);
  };

  const clearSession = () => {
    token.value = '';
    profile.value = null;
    clearAuthToken();
  };

  return {
    token,
    profile,
    isAuthenticated,
    setSession,
    clearSession,
  };
});
