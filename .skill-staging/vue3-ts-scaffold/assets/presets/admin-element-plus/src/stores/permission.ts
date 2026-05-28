import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { hasRequiredPermission } from '@/utils/permission';

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<string[]>([]);

  const setPermissions = (nextPermissions: string[]) => {
    permissions.value = nextPermissions;
  };

  const clearPermissions = () => {
    permissions.value = [];
  };

  const hasPermission = (requiredPermission?: string | string[]) =>
    hasRequiredPermission(permissions.value, requiredPermission);

  const permissionCount = computed(() => permissions.value.length);

  return {
    permissions,
    permissionCount,
    setPermissions,
    clearPermissions,
    hasPermission,
  };
});
