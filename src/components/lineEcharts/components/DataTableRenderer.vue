<template>
  <n-data-table 
    class="chart-table" 
    :single-line="false" 
    :columns="columns" 
    :data="data"
    :max-height="tableMaxHeight" 
    striped 
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumn } from '../types'

const props = defineProps<{
  columns: TableColumn[]
  data: any[]
  height: number | string
}>()

// 计算表格最大高度（扣除头部开关空间）
const tableMaxHeight = computed(() => {
  const h = Number(props.height)
  return isNaN(h) ? undefined : h - 49
})
</script>

<style scoped>
.chart-table {
  width: 100%;
}
</style>
