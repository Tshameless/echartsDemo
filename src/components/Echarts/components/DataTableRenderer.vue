<script setup lang="ts">
import type { ChartTableRow, TableColumn } from '../types'

defineProps<{
  columns: TableColumn[]
  data: ChartTableRow[]
  height: number | string
}>()
</script>

<template>
  <el-table :data="data" :max-height="height" border stripe class="chart-table" style="width: 100%">
    <el-table-column
      v-for="column in columns"
      :key="column.field"
      :label="column.label"
      :prop="column.prop"
      :fixed="column.fixed"
      :width="column.width"
      :min-width="column.minWidth"
      show-overflow-tooltip
    />
  </el-table>
</template>

<style scoped>
.chart-table {
  width: 100%;
}
</style>
