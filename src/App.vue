<template>
  <NConfigProvider :locale="zhCN" :date-locale="dateZhCN" style="height: 100%;">
    <router-view v-slot="{ Component }">
      <transition>
        <component :is="Component" />
      </transition>
    </router-view>
    <div class="container">
      <final-version :opt="chartOptions" :height="400" />
    </div>
  </NConfigProvider>
</template>
<script lang="ts" setup>
import { NConfigProvider } from 'naive-ui'
import { zhCN, dateZhCN } from 'naive-ui';
import FinalVersion from './components/finalVersion.vue'

const chartOptions = {
  doubleY: true,
  showTable: true,
  timeList: ['1月', '2月', '3月', '4月', '5月'],
  data: [
    {
      name: '收入',
      type: 'line',
      yAxisIndex: 0,
      data: [150, 230, 224, 218, 135],
      tableUnit: '(万元)'
    },
    {
      name: '支出',
      type: 'line',
      yAxisIndex: 1,
      data: [100, 130, 184, 150, 95],
      tableUnit: '(万元)'
    }
  ],
  yName: '收入：万元',
  yName1: '支出：万元'
}
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

.container {
  padding: 20px;
  background: #1a1a1a;
}
</style>
