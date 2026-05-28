<script setup lang="ts">
import { computed } from 'vue'
import type { LinkedChartTableColumn, LinkedChartTableRow } from '../types'

const props = defineProps<{
  dataTableColumns: LinkedChartTableColumn[]
  tableRows: LinkedChartTableRow[]
  tableMaxHeight: number
  enableTableVirtualScroll: boolean
  tableMinRowHeight: number
  tableScrollX: number
  getTableRowKey: (row: LinkedChartTableRow) => string
}>()

const tableStyle = computed(() => ({
  minWidth: `${props.tableScrollX || 1200}px`,
}))
</script>

<template>
  <div class="table-content">
    <el-table
      :data="tableRows"
      :max-height="tableMaxHeight"
      :row-key="getTableRowKey"
      border
      stripe
      class="linked-data-table"
      :style="tableStyle"
    >
      <el-table-column
        v-for="column in dataTableColumns"
        :key="column.field"
        :label="column.label"
        :prop="column.prop"
        :fixed="column.fixed"
        :width="column.width"
        :min-width="column.minWidth"
        show-overflow-tooltip
      />
    </el-table>
  </div>
</template>

<style scoped>
.table-content {
  margin-top: 12px;
  overflow-x: auto;
}
</style>
