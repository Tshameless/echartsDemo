<template>
  <main class="page-shell">
    <h1>About</h1>
    <p>这里可以继续扩展业务页面、状态管理或 UI 框架集成。</p>
    <RouterLink class="link" to="/">返回首页</RouterLink>
  </main>
</template>

<style scoped>
.page-shell {
  display: grid;
  gap: 12px;
  min-height: 100vh;
  place-content: center;
  padding: 32px;
}

.link {
  color: #1d4ed8;
  font-weight: 600;
}
</style>
