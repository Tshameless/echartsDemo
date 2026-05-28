import axios from 'axios';
import { LOGIN_PATH } from '@/constants/auth';
import router from '@/router';
import { pinia } from '@/stores';
import { usePermissionStore } from '@/stores/permission';
import { useUserStore } from '@/stores/user';
import { clearAuthToken, getAuthToken } from '@/utils/auth';
import { message } from '@/utils/message';

const request = axios.create({
  baseURL: '/api',
  timeout: 8000,
});

request.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status as number | undefined;

    if (status === 401) {
      clearAuthToken();
      useUserStore(pinia).clearSession();
      usePermissionStore(pinia).clearPermissions();
      message.warning('登录已失效，请重新登录。');
      await router.push(LOGIN_PATH);
      return Promise.reject(error);
    }

    if (status === 403) {
      message.warning('当前账号没有访问权限。');
      await router.push({ name: 'Forbidden' });
      return Promise.reject(error);
    }

    if (status === 404) {
      message.error('接口不存在，请检查请求地址。');
      return Promise.reject(error);
    }

    message.error(error.message || '请求失败，请稍后重试。');
    return Promise.reject(error);
  },
);

export default request;
