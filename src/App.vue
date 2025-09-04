<template>
  <NConfigProvider :locale="zhCN" :date-locale="dateZhCN" style="height: 100%;">
    <router-view v-slot="{ Component }">
      <transition>
        <component :is="Component" />
      </transition>
    </router-view>
  </NConfigProvider>
</template>
<script lang="ts" setup>
import { NConfigProvider } from 'naive-ui'
import { zhCN, dateZhCN } from 'naive-ui';

</script>
<style>
#app {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.element-plus-logo {
  width: 50%;
}
</style>
