<script setup lang="ts">
import { computed } from 'vue'
import type { ChartTableRow, TableColumn } from '../types'

type ExtraColumnMode = 'insert-after-time' | 'append'

const props = defineProps<{
  columns: TableColumn[]
  data: ChartTableRow[]
  height: number | string
  extraField?: string
  extraLabel?: string
  extraValuePrefix?: string
  extraColumnMode?: ExtraColumnMode
}>()

const resolvedColumns = computed<TableColumn[]>(() => {
  if (!props.extraField || !props.extraLabel || !props.extraColumnMode) {
    return props.columns
  }

  const extraColumn: TableColumn = {
    label: props.extraLabel,
    field: props.extraField,
    minWidth: 140,
  }

  if (props.extraColumnMode === 'append') {
    return [...props.columns, extraColumn]
  }

  const [timeColumn, ...dataColumns] = props.columns
  if (!timeColumn) return [extraColumn]

  return [timeColumn, extraColumn, ...dataColumns]
})

const resolvedData = computed<ChartTableRow[]>(() => {
  if (!props.extraField || !props.extraValuePrefix) {
    return props.data
  }

  return props.data.map((row, index) => ({
    ...row,
    [props.extraField as string]: `${props.extraValuePrefix}-${index + 1}`,
  }))
})
</script>

<template>
  <el-table
    :data="resolvedData"
    row-key="__rowKey"
    :max-height="height"
    border
    stripe
    class="chart-table"
    style="width: 100%"
  >
    <el-table-column
      v-for="column in resolvedColumns"
      :key="column.field"
      :label="column.label"
      :prop="column.prop ?? column.field"
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
