import type { Router } from 'vue-router';
import { LOGIN_PATH } from '@/constants/auth';
import { ROUTE_NAMES } from '@/constants/routeNames';
import { pinia } from '@/stores';
import { usePermissionStore } from '@/stores/permission';
import { useUserStore } from '@/stores/user';

export const applyRouterGuards = (router: Router) => {
  router.beforeEach((to) => {
    const userStore = useUserStore(pinia);
    const permissionStore = usePermissionStore(pinia);

    if (to.name === ROUTE_NAMES.login && userStore.isAuthenticated) {
      return { name: ROUTE_NAMES.exampleList };
    }

    if (to.meta.requiresAuth === false) {
      return true;
    }

    if (!userStore.isAuthenticated) {
      return {
        path: LOGIN_PATH,
        query: {
          redirect: to.fullPath,
        },
      };
    }

    if (!permissionStore.hasPermission(to.meta.requiredPermission)) {
      return { name: ROUTE_NAMES.forbidden };
    }

    return true;
  });
};
