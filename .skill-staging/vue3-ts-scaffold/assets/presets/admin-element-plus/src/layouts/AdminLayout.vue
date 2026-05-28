<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LOGIN_PATH } from '@/constants/auth';
import { constantRoutes } from '@/router/routes';
import { useAppStore } from '@/stores/app';
import { usePermissionStore } from '@/stores/permission';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const permissionStore = usePermissionStore();
const userStore = useUserStore();

const menuItems = computed(() => {
  const rootRoute = constantRoutes.find((item) => item.path === '/');
  return (rootRoute?.children ?? []).filter((item) => permissionStore.hasPermission(item.meta?.requiredPermission));
});

const activePath = computed(() => route.path);
const displayName = computed(() => userStore.profile?.name ?? 'Admin');

const handleLogout = async () => {
  userStore.clearSession();
  permissionStore.clearPermissions();
  await router.push(LOGIN_PATH);
};
</script>

<template>
  <el-container class="admin-shell">
    <el-aside :width="appStore.isSidebarCollapsed ? '76px' : '220px'" class="shell-aside">
      <div class="shell-brand">Vue Admin</div>
      <el-menu :default-active="activePath" class="shell-menu" router>
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="`/${item.path}`">
          <span>{{ item.meta?.title ?? item.name }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="shell-header">
        <div>
          <el-button text @click="appStore.toggleSidebar()">
            {{ appStore.isSidebarCollapsed ? '展开导航' : '收起导航' }}
          </el-button>
        </div>
        <div class="shell-actions">
          <span class="shell-user">{{ displayName }}</span>
          <el-button type="primary" link @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>

      <el-main class="shell-main">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
.admin-shell {
  min-height: 100vh;
}

.shell-aside {
  background: linear-gradient(180deg, #14213d 0%, #1f3b63 100%);
  color: #fff;
}

.shell-brand {
  padding: 20px 24px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.shell-menu {
  border-right: 0;
  background: transparent;
}

.shell-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(20, 33, 61, 0.08);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
}

.shell-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shell-user {
  color: #415a77;
  font-weight: 600;
}

.shell-main {
  background:
    radial-gradient(circle at top left, rgba(252, 191, 73, 0.18), transparent 25%),
    linear-gradient(180deg, #f7f8fa 0%, #eef2f7 100%);
}
</style>
