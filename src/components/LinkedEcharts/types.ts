import type * as eCharts from 'echarts'
import type { ChartOptions } from '@/components/Echarts/types'

export const LINKED_CHART_TIME_FIELD = 'time'

export interface LinkedEchartsProps {
  opt?: ChartOptions
  opts?: ChartOptions[]
  titles?: string[]
  height: number
  groupId?: string
  showTable?: boolean
  tablePosition?: 'switch' | 'bottom'
  showChartView?: boolean
  tableMaxHeight?: number
  tableScrollX?: number
  tableMinRowHeight?: number
  unifiedTooltip?: boolean
  chartLabel?: string
  tableLabel?: string
  timeColumnTitle?: string
}

export interface LinkedChartRenderItem {
  key: string
  title: string
}

export interface LinkedChartTableColumn {
  title: string
  key: string
  fixed?: 'left' | 'right'
  width?: number
  minWidth?: number
  ellipsis?: { tooltip: boolean }
}

export interface LinkedChartTableRow {
  __rowKey: string
  [LINKED_CHART_TIME_FIELD]: string | number
  [key: string]: string | number
}

export type LinkedEchartsReadyPayload = eCharts.ECharts | eCharts.ECharts[]

export interface UnifiedTooltipRow {
  name: string
  value: string | number
  color: string
  unit: string
}

export interface UnifiedTooltipData {
  title: string
  sections: {
    chartTitle?: string
    rows: UnifiedTooltipRow[]
  }[]
}
