import { defaultTooltipFormatter } from './utils'
import type { ChartOptions } from './types'

// 定义颜色常量
const itemColorArr = ['red', '#6677E6', '#46B3E7', '#3379D5', '#6ECDB9', '#999999', '#E5E19A', '#EEEEEE']

export const useChartOption = () => {
    // 公共 option 生成
    const getCommonOption = (item: ChartOptions, extra = {}) => ({
        tooltip: {
            show: item.tooltipShow ?? true,
            trigger: item.tooltipTrigger ?? 'axis',
            backgroundColor: item.tooltipBackgroundColor ?? "rgba(0,0,0,.3)",
            borderColor: item.tooltipBorderColor ?? "rgba(0,0,0,.3)",
            textStyle: { color: item.tooltipColor ?? "rgba(255, 255, 255, 1)" },
            formatter: item.tooltipFormatter || ((params: any) => defaultTooltipFormatter(params, item, !!item.doubleY)),
            axisPointer: {
                label: { backgroundColor: '#6a7985' }
            }
        },
        legend: item.legend ? item.legend : {
            show: item.legendshowValue ?? true,
            left: item.legendLocation ?? 'center',
            top: item.legendTop ?? 'top',
            orient: item.legendOrient ?? 'horizontal',
            itemWidth: item.legendItemWidth ?? 30,
            itemHeight: item.legendItemHeight ?? 14,
            textStyle: {
                color: item.legendColor ?? '#000',
                fontSize: item.legendFontSize ?? 12,
                fontWeight: item.legendFontWeight ?? 400,
                rich: item.legendRich ?? {
                    one: { width: 60, height: 16, fontSize: 12, fontWeight: 400 },
                }
            },
            formatter: item.legendFormatter ?? ((name: string) => `{one|${name}}`),
        },
        color: itemColorArr,
        dataZoom: item.dataZoom ?? [
            {
                type: "slider",
                show: item.dataZoomShow ?? false,
                realtime: true,
                start: item.dataZoomStart ?? 0,
                end: item.dataZoomEnd ?? 100,
                bottom: item.dataZoomBottom ?? 15,
                height: item.dataZoomHeight ?? 25,
            },
            {
                type: "inside",
                realtime: true,
                start: item.dataZoomStart ?? 0,
                end: item.dataZoomEnd ?? 100,
            },
        ],
        visualMap: item.visualMap ? item.visualMap : [],
        grid: item.grid ?? {
            left: '3%',
            right: '5%',
            bottom: '12%',
            containLabel: true
        },
        xAxis: item.xAxis ?? [
            {
                show: item.showXAxis ?? true,
                name: item.xName ?? '时间',
                type: item.xType ?? 'category',
                boundaryGap: item.boundaryGap ?? false,
                data: item.timeList,
                // 确保 x 轴轴线和刻度线可见
                axisLine: {
                    show: true,
                    lineStyle: { color: item.xColor ?? '#fff' }
                },
                axisTick: {
                    show: true,
                    lineStyle: { color: item.xColor ?? '#fff' }
                },
                axisLabel: item.xAxisLabel ?? {
                    color: item.xColor ?? "#fff",
                    fontSize: item.xFontSize ?? "12px",
                    fontWeight: item.xFontWeight ?? "normal",
                    showMinLabel: item.compensateType === 'start' ? true : null,
                    showMaxLabel: item.compensateType === 'end' ? true : null,
                },
                nameTextStyle: {
                    color: item.xUnitColor ?? '#fff',
                    verticalAlign: 'top',
                    padding: [8, 0, 0, 0]
                },
                nameGap: item.xNameGap ?? 20,
                nameLocation: item.xNameLocation ?? 'end'
            }
        ],
        ...extra
    })

    return {
        getCommonOption
    }
}
