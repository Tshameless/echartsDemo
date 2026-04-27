import type * as eCharts from 'echarts'
import type { ChartOptions } from '@/components/lineEcharts/types'

export interface LinkedChartsProps {
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

export interface LinkedChartTableRow {
  __rowKey: string
  时间: string | number
  [key: string]: string | number
}

export type LinkedChartsReadyPayload = eCharts.ECharts | eCharts.ECharts[]

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
