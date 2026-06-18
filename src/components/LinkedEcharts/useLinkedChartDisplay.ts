import { computed, shallowRef } from 'vue'
import type { ChartOptions, ChartSeriesData } from '@/components/Echarts/types'
import {
  LINKED_CHART_TIME_FIELD,
  type LinkedChartRenderItem,
  type LinkedChartTableColumn,
  type LinkedEchartsProps,
  type LinkedChartTableRow
} from './types'

const TABLE_VIRTUAL_SCROLL_THRESHOLD = 100

interface UseLinkedChartDisplayOptions {
  props: Readonly<LinkedEchartsProps>
  onUpdateShowChartView: (value: boolean) => void
}

/** 获取图表容器的唯一 Key */
function getChartItemKey(opt: ChartOptions, index: number): string {
  const title = opt?.title ?? opt?.series?.[0]?.name
  return title ? `${index}-${String(title)}` : String(index)
}

/** 提取表格单元格数值 */
function getTableCellValue(value: ChartSeriesData['data'][number] | number | null | undefined) {
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return value.value
  }
  return value
}

function buildFallbackTableField(chartIndex: number, seriesIndex: number) {
  return `series_${chartIndex}_${seriesIndex}`
}

export function useLinkedChartDisplay({
  props,
  onUpdateShowChartView
}: UseLinkedChartDisplayOptions) {
  const localShowChartView = shallowRef(true)
  const hasWarnedTimeMismatch = shallowRef(false)

  const chartList = computed(() => {
    if (props.opts?.length) return props.opts
    if (props.opt && Object.keys(props.opt).length > 0) return [props.opt]
    return []
  })

  // 基础显示逻辑判断
  const canShowTable = computed(() => props.tableMode !== 'none')
  const isBottomTableMode = computed(() => props.tableMode === 'bottom')
  const showSwitchToggle = computed(() => props.tableMode === 'switch')

  const displayChart = computed(() => {
    if (props.tableMode !== 'switch') return true
    return props.showChartView ?? localShowChartView.value
  })

  const shouldShowChartContent = computed(() => displayChart.value)
  const shouldShowTableContent = computed(
    () => canShowTable.value && (isBottomTableMode.value || !displayChart.value)
  )

  const chartItems = computed<LinkedChartRenderItem[]>(() =>
    chartList.value.map((opt, index) => ({
      key: getChartItemKey(opt, index),
      title: props.titles?.[index] ?? opt?.title ?? '',
    }))
  )

  /** 统一提取所有图表的系列数据 */
  const flatSeriesData = computed(() => {
    const list = chartList.value
    if (list.length === 0) return { timeList: [], series: [] }

    const timeList = list[0]?.timeList || []
    const baseTimeLength = timeList.length

    if (
      import.meta.env.DEV &&
      !hasWarnedTimeMismatch.value &&
      list.some((item) => (item?.timeList?.length ?? 0) !== baseTimeLength)
    ) {
      hasWarnedTimeMismatch.value = true
      console.warn(
        '[LinkedEcharts] Detected inconsistent timeList lengths across linked charts. Normalize time axes at the page layer for best results.'
      )
    }

    const usedFields = new Set<string>([LINKED_CHART_TIME_FIELD])
    const series = list.flatMap((opt, chartIndex) =>
      (opt?.series || []).map((s, seriesIndex) => {
        const preferredField = s.tableField?.trim() || buildFallbackTableField(chartIndex, seriesIndex)
        let field = preferredField
        let duplicateIndex = 1

        while (usedFields.has(field)) {
          field = `${preferredField}_${duplicateIndex}`
          duplicateIndex += 1
        }

        usedFields.add(field)

        return {
          field,
          label: s.name,
          unit: s.tableUnit,
          data: s.rawData ?? (s.data || []).map((d) => getTableCellValue(d) ?? null)
        }
      })
    )

    return { timeList, series }
  })

  /** 表格列定义 */
  const dataTableColumns = computed<LinkedChartTableColumn[]>(() => [
    {
      label: props.timeColumnTitle || '时间',
      field: LINKED_CHART_TIME_FIELD,
      prop: LINKED_CHART_TIME_FIELD,
      fixed: 'left' as const,
      width: 140,
    },
    ...flatSeriesData.value.series.map((s) => ({
      label: s.label,
      field: s.field,
      prop: s.field,
      minWidth: 140,
    })),
  ])

  /** 表格行数据 */
  const tableRows = computed<LinkedChartTableRow[]>(() => {
    const { timeList, series } = flatSeriesData.value
    if (!timeList.length) return []

    return timeList.map((time, index) => {
      const row: LinkedChartTableRow = {
        __rowKey: `${String(time)}-${index}`,
        [LINKED_CHART_TIME_FIELD]: time,
      }
      series.forEach((s) => {
        const val = s.data[index]
        row[s.field] = val ?? '--'
      })
      return row
    })
  })

  const enableTableVirtualScroll = computed(
    () => tableRows.value.length >= TABLE_VIRTUAL_SCROLL_THRESHOLD
  )

  function getTableRowKey(row: LinkedChartTableRow): string {
    return row.__rowKey
  }

  function setChartView(value: boolean) {
    if (props.tableMode !== 'switch') return

    if (props.showChartView !== undefined) {
      onUpdateShowChartView(value)
    } else {
      localShowChartView.value = value
    }
  }

  return {
    chartItems,
    chartList,
    dataTableColumns,
    displayChart,
    enableTableVirtualScroll,
    getTableRowKey,
    setChartView,
    shouldShowChartContent,
    shouldShowTableContent,
    showSwitchToggle,
    tableRows,
  }
}
