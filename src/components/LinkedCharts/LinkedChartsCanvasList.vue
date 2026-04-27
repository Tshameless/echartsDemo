<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { LinkedChartRenderItem } from './types'

interface Props {
  height: number
  items: LinkedChartRenderItem[]
  setBoxRef: (element: Element | ComponentPublicInstance | null, index: number) => void
  setContainerRef: (element: Element | ComponentPublicInstance | null) => void
}

const props = defineProps<Props>()
</script>

<template>
  <div :ref="(element) => props.setContainerRef(element)" class="linked-chart-container">
    <template v-if="props.items.length > 0">
      <div v-for="(item, index) in props.items" :key="item.key" class="chart-item-wrap">
        <div v-if="item.title" class="chart-title">{{ item.title }}</div>
        <div
          :ref="(element) => props.setBoxRef(element, index)"
          class="chart-box"
          :style="{ height: `${props.height}px`, maxHeight: `${props.height}px` }"
        ></div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.linked-chart-container {
  position: relative;
  border: 1px solid transparent;
  width: 100%;
}

.chart-box {
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
</style>
