import type { EChartsOption, YAXisComponentOption } from 'echarts'
import { defaultTooltipFormatter, calcYAxisMax, calcYAxisMin } from './utils'
import type { ChartOptions, ChartSeriesData } from './types'

// 默认色板
const DEFAULT_COLORS = ['red', '#6677E6', '#46B3E7', '#3379D5', '#6ECDB9', '#999999', '#E5E19A', '#EEEEEE']

export const useChartOption = () => {

    /** 获取数值序列值 */
    const getNumericValue = (value: number | { value: number; name: string } | null | undefined) => {
        if (value == null) return null
        return typeof value === 'object' ? value.value : value
    }

    /** 计算各轴的数值范围，用于对齐逻辑 */
    const getAxisDataRange = (series: ChartSeriesData[] | undefined) => {
        const axis0Data: number[] = []
        const axis1Data: number[] = []

        series?.forEach(s => {
            s.data.forEach(d => {
                const val = getNumericValue(d)
                if (val !== null) {
                    if (s.yAxisIndex === 1) axis1Data.push(val)
                    else axis0Data.push(val)
                }
            })
        })
        return { axis0Data, axis1Data }
    }

    /** 生成单个 Y 轴配置 */
    const createYAxisConfig = (opt: ChartOptions, index: number, otherAxisData: number[] = []): YAXisComponentOption => {
        const isSecondary = index === 1
        const prefix = isSecondary ? '1' : ''
        
        // 映射属性 (支持原来的扁平化属性名)
        const show = isSecondary ? opt.showYAxis1 : opt.showYAxis
        const name = isSecondary ? opt.yName1 : opt.yName
        const type = isSecondary ? opt.yType1 : opt.yType
        const color = isSecondary ? opt.yColor1 : opt.yColor
        const fontSize = isSecondary ? opt.yFontSize1 : opt.yFontSize
        const fontWeight = isSecondary ? opt.yFontWeight1 : opt.yFontWeight
        const formatter = isSecondary ? opt.yFormatter1 : opt.yFormatter
        const axisLabel = isSecondary ? opt.yAxisLabel1 : opt.yAxisLabel
        const nameGap = isSecondary ? opt.yNameGapOne : opt.yNameGap

        return {
            show: show ?? true,
            name: name ?? (isSecondary ? '元' : 'MW'),
            type: type ?? "value",
            nameGap: nameGap ?? 20,
            nameRotate: 0,
            axisLine: { show: true, lineStyle: { color: color ?? '#fff' } },
            axisTick: { show: true, lineStyle: { color: color ?? '#fff' } },
            // 动态对齐逻辑
            max: opt.xAlignValue ? (val: { min: number; max: number }) => calcYAxisMax(val) : undefined,
            min: opt.xAlignValue ? (val: { min: number; max: number }) => calcYAxisMin(val, otherAxisData) : undefined,
            alignTicks: opt.alignTicks ?? false,
            splitLine: {
                lineStyle: { type: 'dashed', width: 1, color: 'rgba(223, 223, 223, 0.1)' }
            },
            axisLabel: axisLabel ?? {
                color: color ?? "#fff",
                fontSize: fontSize ?? 12,
                fontWeight: fontWeight ?? "normal",
                formatter: formatter,
            },
            nameTextStyle: { color: '#fff' }
        }
    }

    /** 生成最终的 ECharts Option */
    const getFinalOption = (item: ChartOptions, selectedLegends?: Record<string, boolean>): EChartsOption => {
        // 根据图例选中状态过滤系列
        const targetSeries = selectedLegends 
            ? item.series?.filter(s => selectedLegends[s.name] !== false) // ECharts 默认是选中的，所以未在 selected 中的也视为选中
            : item.series

        const { axis0Data, axis1Data } = getAxisDataRange(targetSeries)

        // 生成 Y 轴数组
        const yAxisConfigs: YAXisComponentOption[] = []
        yAxisConfigs.push(createYAxisConfig(item, 0, axis1Data))
        if (item.doubleY) {
            yAxisConfigs.push(createYAxisConfig(item, 1, axis0Data))
        }

        // 如果用户显式传入了 yAxis 且不是双轴对齐模式，则优先使用用户的
        const finalYAxis = (item.yAxis && !item.doubleY) ? item.yAxis : yAxisConfigs

        return {
            tooltip: item.tooltip ?? {
                show: item.tooltipShow ?? true,
                trigger: item.tooltipTrigger ?? 'axis',
                backgroundColor: item.tooltipBackgroundColor ?? "rgba(0,0,0,.3)",
                borderColor: item.tooltipBorderColor ?? "rgba(0,0,0,.3)",
                textStyle: { color: item.tooltipColor ?? "#fff" },
                formatter: item.tooltipFormatter || ((params: any) => defaultTooltipFormatter(params, item, !!item.doubleY)),
                axisPointer: { label: { backgroundColor: '#6a7985' } }
            },
            legend: item.legend ?? {
                show: item.legendShow ?? true,
                left: item.legendLocation ?? 'center',
                top: item.legendTop ?? 'top',
                orient: item.legendOrient ?? 'horizontal',
                itemWidth: item.legendItemWidth ?? 30,
                itemHeight: item.legendItemHeight ?? 14,
                textStyle: {
                    color: item.legendColor ?? '#000',
                    fontSize: item.legendFontSize ?? 12,
                    rich: item.legendRich ?? { one: { width: 60, fontSize: 12 } }
                },
                formatter: item.legendFormatter ?? ((name: string) => `{one|${name}}`),
                selected: selectedLegends // 保持图例选中状态同步
            },
            color: item.color ?? DEFAULT_COLORS,
            dataZoom: item.dataZoom ?? [
                {
                    type: "slider",
                    show: item.dataZoomShow ?? false,
                    start: item.dataZoomStart ?? 0,
                    end: item.dataZoomEnd ?? 100,
                    bottom: item.dataZoomBottom ?? 15,
                    height: item.dataZoomHeight ?? 25,
                },
                { type: "inside", start: item.dataZoomStart ?? 0, end: item.dataZoomEnd ?? 100 }
            ],
            grid: item.grid ?? { left: '3%', right: '5%', bottom: '12%', containLabel: true },
            xAxis: item.xAxis ?? [{
                show: item.showXAxis ?? true,
                name: item.xName ?? '时间',
                type: item.xType ?? 'category',
                data: item.timeList,
                axisLine: { show: true, lineStyle: { color: item.xColor ?? '#fff' } },
                axisLabel: item.xAxisLabel ?? {
                    color: item.xColor ?? "#fff",
                    fontSize: item.xFontSize ?? 12,
                    showMinLabel: item.compensateType === 'start' || undefined,
                    showMaxLabel: item.compensateType === 'end' || undefined,
                },
                nameTextStyle: { color: item.xUnitColor ?? '#fff', padding: [8, 0, 0, 0] },
                nameGap: item.xNameGap ?? 20,
                nameLocation: item.xNameLocation ?? 'end'
            }],
            yAxis: finalYAxis,
            series: item.series as any, // 系列数据保持全量，由 ECharts 内部通过 selected 状态处理显示，但我们计算 Y 轴时只看可见的
            graphic: item.graphic,
            visualMap: item.visualMap
        }
    }

    return {
        getFinalOption
    }
}
