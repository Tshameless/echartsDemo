import type { RouteRecordRaw } from 'vue-router';
import { PERMISSION_KEYS } from '@/constants/permission';
import { ROUTE_NAMES } from '@/constants/routeNames';
import AdminLayout from '@/layouts/AdminLayout.vue';

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: ROUTE_NAMES.login,
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
      hidden: true,
    },
  },
  {
    path: '/',
    name: ROUTE_NAMES.root,
    component: AdminLayout,
    redirect: '/example/list',
    meta: {
      title: '首页',
      requiresAuth: true,
      hidden: true,
    },
    children: [
      {
        path: 'example/list',
        name: ROUTE_NAMES.exampleList,
        component: () => import('@/views/example/ExampleListView.vue'),
        meta: {
          title: '示例模块',
          requiresAuth: true,
          requiredPermission: PERMISSION_KEYS.exampleRead,
        },
      },
    ],
  },
  {
    path: '/403',
    name: ROUTE_NAMES.forbidden,
    component: () => import('@/views/error/ForbiddenView.vue'),
    meta: {
      title: '无权限',
      requiresAuth: false,
      hidden: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAMES.notFound,
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false,
      hidden: true,
    },
  },
];
