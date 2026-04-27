import type { EChartsOption, YAXisComponentOption } from 'echarts'
import { defaultTooltipFormatter, calcYAxisMax, calcYAxisMin } from './utils'
import type { ChartOptions, ChartSeriesData } from './types'

// 默认色板
const DEFAULT_COLORS = [
  '#52B3D9', // 清透浅蓝
  '#48C9B0', // 薄荷青绿
  '#78C679', // 嫩草绿
  '#F7C843', // 奶黄
  '#F39C12', // 浅橘橙
  '#E77471', // 豆沙粉
  '#BB8FCE', // 香芋紫
  '#5D87E1', // 雾霾蓝
  '#26C6DA', // 青碧色
  '#80CBC4'  // 冷调浅绿
]
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

    /** 
     * 生成单个 Y 轴配置 
     * 改进点：使用参数化映射，减少 if/else 分支
     */
    const createYAxisConfig = (opt: ChartOptions, index: number, otherAxisData: number[] = []): YAXisComponentOption => {
        const isSecondary = index === 1
        
        // 定义属性映射表，支持扁平化的配置项
        const configMap = {
            show: isSecondary ? opt.showYAxis1 : opt.showYAxis,
            name: isSecondary ? opt.yName1 : opt.yName,
            type: isSecondary ? opt.yType1 : opt.yType,
            color: isSecondary ? opt.yColor1 : opt.yColor,
            fontSize: isSecondary ? opt.yFontSize1 : opt.yFontSize,
            fontWeight: isSecondary ? opt.yFontWeight1 : opt.yFontWeight,
            formatter: isSecondary ? opt.yFormatter1 : opt.yFormatter,
            axisLabel: isSecondary ? opt.yAxisLabel1 : opt.yAxisLabel,
            nameGap: isSecondary ? opt.yNameGapOne : opt.yNameGap,
        }

        const defaultName = isSecondary ? '元' : 'MW'
        const defaultColor = '#fff'

        return {
            show: configMap.show ?? true,
            name: configMap.name ?? defaultName,
            type: configMap.type ?? "value",
            nameGap: configMap.nameGap ?? 20,
            nameRotate: 0,
            axisLine: { show: true, lineStyle: { color: configMap.color ?? defaultColor } },
            axisTick: { show: true, lineStyle: { color: configMap.color ?? defaultColor } },
            // 动态对齐逻辑：根据 xAlignValue 属性计算刻度
            max: opt.xAlignValue ? (val: { min: number; max: number }) => calcYAxisMax(val) : undefined,
            min: opt.xAlignValue ? (val: { min: number; max: number }) => calcYAxisMin(val, otherAxisData) : undefined,
            alignTicks: opt.alignTicks ?? false,
            splitLine: {
                lineStyle: { type: 'dashed', width: 1, color: 'rgba(223, 223, 223, 0.1)' }
            },
            axisLabel: configMap.axisLabel ?? {
                color: configMap.color ?? defaultColor,
                fontSize: configMap.fontSize ?? 12,
                fontWeight: configMap.fontWeight ?? "normal",
                formatter: configMap.formatter,
            },
            nameTextStyle: { color: defaultColor }
        }
    }

    /** 生成最终的 ECharts Option */
    const getFinalOption = (item: ChartOptions, selectedLegends?: Record<string, boolean>): EChartsOption => {
        // 过滤可见系列以精确计算 Y 轴范围
        const targetSeries = selectedLegends 
            ? item.series?.filter(s => selectedLegends[s.name] !== false)
            : item.series

        const { axis0Data, axis1Data } = getAxisDataRange(targetSeries)

        // 生成 Y 轴数组（主轴 + 可选副轴）
        const yAxisConfigs: YAXisComponentOption[] = [
            createYAxisConfig(item, 0, axis1Data)
        ]
        if (item.doubleY) {
            yAxisConfigs.push(createYAxisConfig(item, 1, axis0Data))
        }

        // 如果提供了原生的 yAxis 配置且不是双轴模式，则优先使用原生配置
        const finalYAxis = (item.yAxis && !item.doubleY) ? item.yAxis : yAxisConfigs

        return {
            tooltip: item.tooltip ?? {
                show: item.tooltipShow ?? true,
                trigger: item.tooltipTrigger ?? 'axis',
                backgroundColor: item.tooltipBackgroundColor ?? "rgba(0,0,0,.6)",
                borderColor: item.tooltipBorderColor ?? "rgba(0,0,0,.6)",
                textStyle: { color: item.tooltipColor ?? "#fff" },
                formatter: item.tooltipFormatter || ((params: any) => defaultTooltipFormatter(params, item, !!item.doubleY)),
                axisPointer: { label: { backgroundColor: '#6a7985' } }
            },
            legend: item.legend ?? {
                show: item.legendShow ?? true,
                left: item.legendLocation ?? 'center',
                top: item.legendTop ?? 'top',
                orient: item.legendOrient ?? 'horizontal',
                itemWidth: item.legendItemWidth ?? 25,
                itemHeight: item.legendItemHeight ?? 12,
                textStyle: {
                    color: item.legendColor ?? '#eee',
                    fontSize: item.legendFontSize ?? 12,
                    rich: item.legendRich ?? { one: { width: 60, fontSize: 12 } }
                },
                formatter: item.legendFormatter ?? ((name: string) => `{one|${name}}`),
                selected: selectedLegends
            },
            color: item.color ?? DEFAULT_COLORS,
            dataZoom: item.dataZoom ?? [
                {
                    type: "slider",
                    show: item.dataZoomShow ?? false,
                    start: item.dataZoomStart ?? 0,
                    end: item.dataZoomEnd ?? 100,
                    bottom: item.dataZoomBottom ?? 15,
                    height: item.dataZoomHeight ?? 20,
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
            series: item.series as any,
            graphic: item.graphic,
            visualMap: item.visualMap
        }
    }

    return {
        getFinalOption
    }
}
