import type { 
    LegendComponentOption, 
    XAXisComponentOption, 
    YAXisComponentOption, 
    DataZoomComponentOption, 
    VisualMapComponentOption,
    TooltipComponentOption,
    GridComponentOption,
    TitleComponentOption,
    GraphicComponentOption
} from 'echarts'

/** 图表系列数据类型 */
export interface ChartSeriesData {
    name: string
    type: string
    stack?: string
    /** Y轴索引，只有 doubleY 为 true 时生效 */
    yAxisIndex?: number
    /** 数据点 */
    data: Array<number | null | { value: number; name: string }>
    /** 原始数据，用于表格/统一 Tooltip 等 */
    rawData?: (number | null)[]
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
}

/** 坐标轴标签配置 */
export interface AxisLabelConfig {
    color?: string
    fontSize?: number
    fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number
    showMinLabel?: boolean
    showMaxLabel?: boolean
    formatter?: (value: any, index: number) => string
}

/** 表格列定义 */
export interface TableColumn {
    title: string
    key: string
}

/** 图例切换事件参数 */
export interface LegendSelectChangedEvent {
    name: string
    selected: Record<string, boolean>
    type: string
}

/** 
 * 基础样式配置 
 * 将原本扁平化的样式属性归类，便于管理
 */
export interface ChartStyleConfig {
    /** 双Y轴模式 */
    doubleY?: boolean
    /** 主Y轴对齐逻辑开关 */
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

    /** 轴样式 - X轴 */
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

    /** 轴样式 - Y轴 */
    showYAxis?: boolean
    yName?: string
    yType?: 'value' | 'category' | 'time' | 'log'
    yColor?: string
    yFontSize?: number
    yFontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number
    yFormatter?: (value: any, index: number) => string
    yNameGap?: number
    yAxisLabel?: AxisLabelConfig

    /** 轴样式 - Y轴1 (副轴) */
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
    /** 标题 */
    title?: string
    /** X轴时间数据 */
    timeList?: Array<string | number>
    /** 系列数据 */
    series?: Array<ChartSeriesData>
    /** 自定义调色板 */
    color?: string[]
    /** 补点类型: 'start' | 'end' */
    compensateType?: string
    /** 是否删除首/尾点 */
    deleteFirstPoint?: boolean
    deleteLastPoint?: boolean
    /** 是否显示表格开关 */
    showTable?: boolean
    
    /** ECharts 原生组件覆盖 */
    legend?: LegendComponentOption
    tooltip?: TooltipComponentOption
    grid?: GridComponentOption
    dataZoom?: DataZoomComponentOption | DataZoomComponentOption[]
    xAxis?: XAXisComponentOption | XAXisComponentOption[]
    yAxis?: YAXisComponentOption | YAXisComponentOption[]
    visualMap?: VisualMapComponentOption | VisualMapComponentOption[]
    graphic?: GraphicComponentOption | GraphicComponentOption[]
}
