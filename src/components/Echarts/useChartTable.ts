import { computed, shallowRef, type Ref } from 'vue'
import type { ChartOptions, ChartSeriesData, ChartTableRow, TableColumn } from './types'

export const CHART_TIME_FIELD = 'time'

function getTableCellValue(value: ChartSeriesData['data'][number] | number | null | undefined) {
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return value.value
  }
  return value
}

function buildFallbackTableField(seriesIndex: number) {
  return `series_${seriesIndex}`
}

export function useChartTable(opt: Ref<ChartOptions>, timeColumnTitle: Ref<string>) {
  const localShowChartView = shallowRef(true)

  const canShowTable = computed(() => opt.value.showTable ?? false)

  const tableHeader = computed<TableColumn[]>(() => {
    const usedFields = new Set<string>([CHART_TIME_FIELD])
    const columns: TableColumn[] = [
      {
        label: timeColumnTitle.value || '时间',
        field: CHART_TIME_FIELD,
        prop: CHART_TIME_FIELD,
        fixed: 'left',
        width: 140,
      },
    ]

    opt.value.series?.forEach((series, index) => {
      const preferredField = series.tableField?.trim() || buildFallbackTableField(index)
      let field = preferredField
      let duplicateIndex = 1

      while (usedFields.has(field)) {
        field = `${preferredField}_${duplicateIndex}`
        duplicateIndex += 1
      }

      usedFields.add(field)

      columns.push({
        label: series.tableUnit ? `${series.name}${series.tableUnit}` : series.name,
        field,
        prop: field,
        minWidth: 140,
      })
    })

    return columns
  })

  const tableData = computed<ChartTableRow[]>(() => {
    const timeList = opt.value.timeList ?? []
    const rows = timeList.map((time, index) => ({
      __rowKey: `${String(time)}-${index}`,
      [CHART_TIME_FIELD]: time,
    })) as ChartTableRow[]

    opt.value.series?.forEach((series, seriesIndex) => {
      const column = tableHeader.value[seriesIndex + 1]
      if (!column) return

      ;(series.rawData ?? series.data ?? []).forEach((value, index) => {
        if (!rows[index]) return
        rows[index][column.field] = getTableCellValue(value) ?? '--'
      })
    })

    if (opt.value.deleteLastPoint) rows.pop()
    else if (opt.value.deleteFirstPoint) rows.shift()

    return rows
  })

  function setChartView(value: boolean) {
    localShowChartView.value = value
  }

  return {
    canShowTable,
    setChartView,
    showChartView: localShowChartView,
    tableData,
    tableHeader,
  }
}
