import type * as eCharts from 'echarts'
import type {
  DataZoomComponentOption,
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
  VisualMapComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
} from 'echarts'

/** 图表系列数据类型 */
export interface ChartSeriesData {
  name: string
  type: string
  /** 表格字段名，未传时由组件自动生成稳定 field */
  tableField?: string
  stack?: string
  /** Y 轴索引，双轴图时生效 */
  yAxisIndex?: number
  /** 数据点 */
  data: Array<
    number | string | null | { value: number | string | null; name?: string; [key: string]: any }
  >
  /** 原始数据，用于表格和统一 Tooltip */
  rawData?: (number | string | null)[]
  /** 表格列单位 */
  tableUnit?: string
  barWidth?: number | string
  smooth?: boolean | number
  radius?: string | (string | number)[]
  center?: (string | number)[]
  itemStyle?: any
  label?: any
  emphasis?: any
  avoidLabelOverlap?: boolean
  [key: string]: any
}

/** 坐标轴标签配置 */
export interface AxisLabelConfig {
  color?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number
  showMinLabel?: boolean
  showMaxLabel?: boolean
  hideOverlap?: boolean
  rotate?: number
  formatter?: (value: any, index: number) => string
}

/** 表格列定义 */
export interface TableColumn {
  label: string
  field: string
  prop: string
  fixed?: 'left' | 'right'
  width?: number
  minWidth?: number
  [key: string]: any
}

/** 单图表格行 */
export interface ChartTableRow {
  __rowKey: string
  time: string | number
  [key: string]: string | number | null | undefined
}

/** 图例切换事件参数 */
export interface LegendSelectChangedEvent {
  name: string
  selected: Record<string, boolean>
  type: string
}

export interface ChartStyleConfig {
  /** 双 Y 轴模式 */
  doubleY?: boolean
  /** 主 Y 轴对齐逻辑开关 */
  xAlignValue?: boolean
  /** 是否对齐刻度 */
  alignTicks?: boolean

  /** 提示框配置 */
  tooltipShow?: boolean
  tooltipTrigger?: 'item' | 'axis' | 'none'
  tooltipBackgroundColor?: string
  tooltipBorderColor?: string
  tooltipColor?: string
  tooltipFormatter?: (params: any) => string

  /** 图例配置 */
  legendShow?: boolean
  legendLocation?: 'left' | 'center' | 'right' | string | number
  legendTop?: string
  legendOrient?: 'horizontal' | 'vertical'
  legendColor?: string
  legendFontSize?: number
  legendFontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number
  legendItemWidth?: number
  legendItemHeight?: number
  legendRich?: Record<string, any>
  legendFormatter?: (name: string) => string

  /** 数据缩放配置 */
  dataZoomShow?: boolean
  dataZoomBottom?: string
  dataZoomStart?: number
  dataZoomEnd?: number
  dataZoomHeight?: number

  /** X 轴样式 */
  showXAxis?: boolean
  xName?: string
  xType?: 'value' | 'category' | 'time' | 'log'
  boundaryGap?: boolean
  xColor?: string
  xUnitColor?: string
  xFontSize?: number
  xFontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number
  xNameGap?: number
  xNameLocation?: 'start' | 'middle' | 'end'
  xAxisLabel?: AxisLabelConfig

  /** 主 Y 轴样式 */
  showYAxis?: boolean
  yName?: string
  yType?: 'value' | 'category' | 'time' | 'log'
  yColor?: string
  yFontSize?: number
  yFontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number
  yFormatter?: (value: any, index: number) => string
  yNameGap?: number
  yAxisLabel?: AxisLabelConfig

  /** 副 Y 轴样式 */
  showYAxis1?: boolean
  yName1?: string
  yType1?: 'value' | 'category' | 'time' | 'log'
  yColor1?: string
  yFontSize1?: number
  yFontWeight1?: 'normal' | 'bold' | 'bolder' | 'lighter' | number
  yFormatter1?: (value: any, index: number) => string
  yNameGapOne?: number
  yAxisLabel1?: AxisLabelConfig
}

/** 完整图表配置 */
export interface ChartOptions extends ChartStyleConfig {
  title?: string
  timeList?: Array<string | number>
  series?: Array<ChartSeriesData>
  color?: string[]
  compensateType?: string
  deleteFirstPoint?: boolean
  deleteLastPoint?: boolean
  showTable?: boolean

  /** ECharts 原生组件覆盖 */
  legend?: LegendComponentOption
  tooltip?: TooltipComponentOption
  grid?: GridComponentOption
  dataZoom?: DataZoomComponentOption | DataZoomComponentOption[]
  xAxis?: XAXisComponentOption | XAXisComponentOption[]
  yAxis?: YAXisComponentOption | YAXisComponentOption[]
  visualMap?: VisualMapComponentOption | VisualMapComponentOption[]
  graphic?: any
}

export interface EchartsProps {
  opt: ChartOptions
  height: number | string
  showTable?: boolean
  tablePosition?: 'switch' | 'bottom'
  showChartView?: boolean
  tableMaxHeight?: number | string
  chartLabel?: string
  tableLabel?: string
  timeColumnTitle?: string
}

export type EchartsReadyPayload = eCharts.ECharts
