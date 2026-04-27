<script setup lang="ts">
import type { LinkedChartRenderItem } from '../types'

defineProps<{
  chartItems: LinkedChartRenderItem[]
  height: number
}>()

const emit = defineEmits<{
  (e: 'set-container-ref', el: HTMLDivElement | null): void
  (e: 'set-box-ref', el: HTMLDivElement | null, index: number): void
}>()
</script>

<template>
  <div :ref="el => emit('set-container-ref', el as HTMLDivElement | null)" class="linked-chart-container">
    <template v-if="chartItems.length > 0">
      <div v-for="(item, index) in chartItems" :key="item.key" class="chart-item-wrap">
        <div v-if="item.title" class="chart-title">{{ item.title }}</div>
        <div
          :ref="el => emit('set-box-ref', el as HTMLDivElement | null, index)"
          class="chart-box"
          :style="{ height: `${height}px`, maxHeight: `${height}px` }"
        ></div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.linked-chart-container {
  position: relative;
  width: 100%;
}

.chart-item-wrap {
  margin-bottom: 8px;
}

.chart-item-wrap:last-child {
  margin-bottom: 0;
}

.chart-title {
  padding: 8px 0 4px;
  font-weight: bold;
  font-size: 14px;
}

.chart-box {
  width: 100%;
}
</style>
