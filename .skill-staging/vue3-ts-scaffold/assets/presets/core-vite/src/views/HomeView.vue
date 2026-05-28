<template>
  <main class="page-shell">
    <p class="eyebrow">Vue 3 TS Scaffold</p>
    <h1>最小可用的 Vue 3 + TypeScript 起步模板</h1>
    <p class="lead">
      这个 preset 保留了 Vite、TypeScript、Vue Router 和工程检查，不预先绑定后台权限、请求层或 UI 框架。
    </p>
    <RouterLink class="link" to="/about">查看 About 页面</RouterLink>
  </main>
</template>

<style scoped>
.page-shell {
  display: grid;
  gap: 16px;
  min-height: 100vh;
  place-content: center;
  padding: 32px;
}

.eyebrow {
  margin: 0;
  color: #b45309;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.lead {
  max-width: 720px;
  color: #475569;
  line-height: 1.7;
}

.link {
  color: #1d4ed8;
  font-weight: 600;
}
</style>
