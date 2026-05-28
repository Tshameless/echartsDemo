<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loginWithPassword } from '@/api/auth/auth';
import { ROUTE_NAMES } from '@/constants/routeNames';
import { usePermissionStore } from '@/stores/permission';
import { useUserStore } from '@/stores/user';
import type { LoginForm } from '@/types/auth';
import { message } from '@/utils/message';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const permissionStore = usePermissionStore();
const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive<LoginForm>({
  username: 'admin',
  password: '123456',
});

const rules: FormRules<LoginForm> = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);

  if (!valid) {
    return;
  }

  loading.value = true;

  try {
    const result = await loginWithPassword(form);
    userStore.setSession(result.token, result.user);
    permissionStore.setPermissions(result.user.permissions);
    message.success('登录成功，欢迎回来。');

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined;
    await router.push(redirect ?? { name: ROUTE_NAMES.exampleList });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-card__intro">
        <p class="eyebrow">Vue 3 TS Scaffold</p>
        <h1>后台项目初始化模板</h1>
        <p>这个登录页使用 mock API，方便项目在没有后端联调时也能先把路由、权限和页面骨架跑起来。</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-button :loading="loading" class="login-submit" size="large" type="primary" @click="handleSubmit">
          登录并进入示例模块
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(252, 191, 73, 0.32), transparent 24%),
    radial-gradient(circle at bottom right, rgba(20, 33, 61, 0.22), transparent 28%),
    linear-gradient(135deg, #fffaf2 0%, #eef3fb 100%);
}

.login-card {
  width: min(100%, 460px);
  padding: 32px;
  border: 1px solid rgba(20, 33, 61, 0.08);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 24px 80px rgba(20, 33, 61, 0.14);
}

.login-card__intro {
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #d97d00;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.login-card h1 {
  margin: 0 0 12px;
  color: #14213d;
  font-size: 30px;
}

.login-card p {
  margin: 0;
  color: #52627a;
  line-height: 1.6;
}

.login-submit {
  width: 100%;
  margin-top: 8px;
}
</style>
