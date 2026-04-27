<script setup lang="ts">
import type { LinkedChartTableRow } from '../types'

defineProps<{
  dataTableColumns: any[]
  tableRows: LinkedChartTableRow[]
  tableMaxHeight: number
  enableTableVirtualScroll: boolean
  tableMinRowHeight: number
  tableScrollX: number
  getTableRowKey: (row: LinkedChartTableRow) => string | number
}>()
</script>

<template>
  <div class="table-content">
    <n-data-table
      :columns="dataTableColumns"
      :data="tableRows"
      :max-height="tableMaxHeight"
      :virtual-scroll="enableTableVirtualScroll"
      :min-row-height="tableMinRowHeight || 39"
      :row-key="getTableRowKey"
      :scroll-x="tableScrollX || 1200"
      striped
      bordered
    />
  </div>
</template>

<style scoped>
.table-content {
  margin-top: 12px;
}
</style>
