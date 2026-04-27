import { computed, shallowRef } from 'vue'
import type { ChartOptions, ChartSeriesData } from '@/components/lineEcharts/types'
import type {
  LinkedChartRenderItem,
  LinkedChartsProps,
  LinkedChartTableRow,
} from './types'

const TABLE_VIRTUAL_SCROLL_THRESHOLD = 100

interface UseLinkedChartDisplayOptions {
  props: Readonly<LinkedChartsProps>
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

export function useLinkedChartDisplay({
  props,
  onUpdateShowChartView,
}: UseLinkedChartDisplayOptions) {
  const localShowChartView = shallowRef(true)

  const chartList = computed(() => {
    if (props.opts?.length) return props.opts
    if (props.opt && Object.keys(props.opt).length > 0) return [props.opt]
    return []
  })

  // 基础显示逻辑判断
  const canShowTable = computed(
    () => props.showTable ?? chartList.value.some((item) => item?.showTable === true),
  )
  const isBottomTableMode = computed(() => props.tablePosition === 'bottom')
  const showSwitchToggle = computed(() => canShowTable.value && !isBottomTableMode.value)

  const displayChart = computed(() => {
    if (!canShowTable.value || isBottomTableMode.value) return true
    return props.showChartView ?? localShowChartView.value
  })

  const shouldShowChartContent = computed(() => displayChart.value)
  const shouldShowTableContent = computed(
    () => canShowTable.value && (isBottomTableMode.value || !displayChart.value),
  )

  const chartItems = computed<LinkedChartRenderItem[]>(() =>
    chartList.value.map((opt, index) => ({
      key: getChartItemKey(opt, index),
      title: props.titles?.[index] ?? opt?.title ?? '',
    })),
  )

  /** 统一提取所有图表的系列数据 */
  const flatSeriesData = computed(() => {
    const list = chartList.value
    if (list.length === 0) return { timeList: [], series: [] }

    const timeList = list[0]?.timeList || []
    const series = list.flatMap((opt) =>
      (opt?.series || []).map((s) => ({
        name: s.name,
        unit: s.tableUnit,
        data: s.rawData ?? (s.data || []).map((d) => getTableCellValue(d) ?? null),
      })),
    )

    return { timeList, series }
  })

  /** 表格列定义 */
  const dataTableColumns = computed(() => [
    {
      title: '时间',
      key: '时间',
      fixed: 'left' as const,
      width: 80,
    },
    ...flatSeriesData.value.series.map((s) => ({
      title: s.name,
      key: s.name,
      minWidth: 120,
      ellipsis: { tooltip: true },
    })),
  ])

  /** 表格行数据 */
  const tableRows = computed<LinkedChartTableRow[]>(() => {
    const { timeList, series } = flatSeriesData.value
    if (!timeList.length) return []

    return timeList.map((time, index) => {
      const row: LinkedChartTableRow = {
        __rowKey: `${String(time)}-${index}`,
        时间: time,
      }
      series.forEach((s) => {
        const val = s.data[index]
        row[s.name] = val ?? '--'
      })
      return row
    })
  })

  const enableTableVirtualScroll = computed(
    () => tableRows.value.length >= TABLE_VIRTUAL_SCROLL_THRESHOLD,
  )

  function getTableRowKey(row: LinkedChartTableRow) {
    return row.__rowKey
  }

  function setChartView(value: boolean) {
    if (!canShowTable.value || isBottomTableMode.value) return

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

