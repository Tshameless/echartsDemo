<script setup lang="ts">
import type { LinkedChartTableRow } from './types'

const TABLE_SCROLL_X = 1200
const TABLE_MIN_ROW_HEIGHT = 39

interface DataTableColumn {
  title: string
  key: string
  fixed?: 'left'
  width?: number
  minWidth?: number
  ellipsis?: {
    tooltip: boolean
  }
}

interface Props {
  columns: DataTableColumn[]
  enableVirtualScroll: boolean
  getRowKey: (row: LinkedChartTableRow) => string
  rows: LinkedChartTableRow[]
  tableMaxHeight: number
}

const props = defineProps<Props>()
</script>

<template>
  <div class="table-content">
    <n-data-table
      :columns="props.columns"
      :data="props.rows"
      :max-height="props.tableMaxHeight"
      :virtual-scroll="props.enableVirtualScroll"
      :min-row-height="TABLE_MIN_ROW_HEIGHT"
      :row-key="props.getRowKey"
      :scroll-x="TABLE_SCROLL_X"
      striped
      :bordered="true"
    />
  </div>
</template>

<style scoped>
.table-content {
  margin-top: 12px;
}
</style>
