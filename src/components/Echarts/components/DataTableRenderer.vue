<template>
  <div class="table-container" :style="{ height: containerHeight, paddingTop: '36px', boxSizing: 'border-box' }">
    <n-data-table class="chart-table" :single-line="false" :columns="columns" :data="data"
      :style="tableStyle" flex-height
      :virtual-scroll="true" striped />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumn } from '../types'

const props = defineProps<{
  columns: TableColumn[]
  data: Array<Record<string, unknown>>
  height: number | string
}>()

const containerHeight = computed(() => {
  return typeof props.height === 'number' ? `${props.height}px` : props.height
})

const tableMaxHeight = computed(() => {
  const h = Number(props.height)
  return isNaN(h) ? undefined : h - 36
})

const tableStyle = computed(() => {
  return tableMaxHeight.value ? { height: `${tableMaxHeight.value}px` } : { height: '100%' }
})
</script>

<style scoped>
.table-container {
  width: 100%;
}

.chart-table {
  width: 100%;
}
</style>
