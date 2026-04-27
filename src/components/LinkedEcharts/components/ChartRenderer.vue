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
        <div class="chart-item-header">
          <div class="chart-item-header-left">
            <div v-if="item.title" class="chart-title">{{ item.title }}</div>
            <slot name="chart-header-left" :item="item" :index="index" />
          </div>
          <div class="chart-item-header-right">
            <slot name="chart-header-right" :item="item" :index="index" />
          </div>
        </div>
        <div
          :ref="el => emit('set-box-ref', el as HTMLDivElement | null, index)"
          class="chart-box"
          :style="{ height: `${height}px`, maxHeight: `${height}px` }"
        ></div>
        <div class="chart-item-footer">
          <slot name="chart-footer" :item="item" :index="index" />
        </div>
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
  margin-bottom: 12px;
}

.chart-item-wrap:last-child {
  margin-bottom: 0;
}

.chart-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.chart-item-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-item-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-title {
  font-weight: bold;
  font-size: 14px;
}

.chart-box {
  width: 100%;
}

.chart-item-footer {
  width: 100%;
}
</style>
