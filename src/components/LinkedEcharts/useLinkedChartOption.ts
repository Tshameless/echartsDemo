import * as eCharts from 'echarts'
import type { ChartOptions, LegendSelectChangedEvent } from '@/components/lineEcharts/types'
import { calcYAxisMax, calcYAxisMin, escapeHtml } from '@/components/lineEcharts/utils'

/** 默认图表色板 */
export const DEFAULT_CHART_COLORS = ['#6677E6', '#46B3E7', '#3379D5', '#6ECDB9', '#999999', '#E5E19A', '#EEEEEE']

/** 获取数值 */
function getNumericValue(value: number | { value: number; name: string } | null | undefined): number | null {
  if (value == null) return null
  return typeof value === 'object' ? value.value : value
}

/** 格式化工具提示 */
function formatTooltip(params: any[], item: ChartOptions, isDoubleY = false): string {
  if (!params?.length) return ''

  const axisValue = params[0].axisValue
  const textColor = '#333'
  let result = `<div style="padding: 12px 16px; min-width: 200px;">`
  result += `<div style="margin-bottom: 10px; font-size: 14px; color: ${textColor}; font-weight: 500;">${escapeHtml(String(axisValue))}</div>`

  params.forEach((param: any) => {
    const rawValue = param.value
    const value = rawValue != null ? rawValue : '--'
    const color = param.color
    const marker = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:8px;background-color:${escapeHtml(String(color ?? ''))};vertical-align:middle;flex-shrink:0;"></span>`

    let yUnit = ''
    const seriesItem = item.series?.find((d: any) => d.name === param.seriesName)

    if (seriesItem?.tableUnit) {
      yUnit = String(seriesItem.tableUnit).replace(/^\(|\)$/g, '')
    } else if (isDoubleY && seriesItem) {
      const axisIndex = seriesItem.yAxisIndex ?? 1
      const yName = axisIndex === 0 ? item.yName : item.yName1
      yUnit = yName?.includes('：') ? yName.split('：')[1] || '' : (yName || '')
    } else {
      yUnit = item.yName?.includes('：') ? item.yName.split('：')[1] || '' : (item.yName || '')
    }

    const displayValue = value === '--' ? value : `${value}${yUnit}`
    result += `<div style="margin: 6px 0; display: flex; align-items: center; justify-content: space-between; gap: 24px;">
      ${marker}
      <span style="color: ${textColor}; font-size: 13px; flex: 1;">${escapeHtml(String(param.seriesName ?? ''))}</span>
      <span style="color: ${textColor}; font-size: 13px; margin-left: auto; white-space: nowrap;">${escapeHtml(String(displayValue))}</span>
    </div>`
  })

  result += `</div>`
  return result
}

export function useLinkedChartOption() {
  /** 提取系列中的数据用于 Y 轴范围计算 */
  const getAxisData = (series: ChartOptions['series']) => {
    const axis0Data: number[] = []
    const axis1Data: number[] = []

    series?.forEach((s) => {
      s.data?.forEach((d) => {
        const val = getNumericValue(d)
        if (val !== null) {
          if (s.yAxisIndex === 1) axis1Data.push(val)
          else axis0Data.push(val)
        }
      })
    })
    return { axis0Data, axis1Data }
  }

  /** 创建 Y 轴配置 */
  const createYAxisOption = (item: ChartOptions, index: number, otherAxisData: number[] = []) => {
    const isSec = index === 1
    const color = (isSec ? item.yColor1 : item.yColor) ?? '#999'

    return {
      show: (isSec ? item.showYAxis1 : item.showYAxis) ?? true,
      name: (isSec ? item.yName1 : item.yName) ?? (isSec ? '元' : 'MW'),
      type: (isSec ? item.yType1 : item.yType) ?? 'value',
      nameGap: (isSec ? item.yNameGapOne : item.yNameGap) ?? 20,
      nameRotate: 0,
      max: item.xAlignValue ? (v: any) => calcYAxisMax(v) : null,
      min: item.xAlignValue ? (v: any) => calcYAxisMin(v, otherAxisData) : null,
      alignTicks: item.alignTicks ?? false,
      axisLine: { show: true, lineStyle: { color } },
      axisTick: { show: true, lineStyle: { color } },
      splitLine: { lineStyle: { type: 'dashed', color: 'rgba(223, 223, 223, 0.1)' } },
      axisLabel: (isSec ? item.yAxisLabel1 : item.yAxisLabel) ?? {
        color,
        fontSize: (isSec ? item.yFontSize1 : item.yFontSize) ?? 12,
        fontWeight: (isSec ? item.yFontWeight1 : item.yFontWeight) ?? 'normal',
        formatter: isSec ? item.yFormatter1 : item.yFormatter,
      },
      nameTextStyle: { color: '#999' },
    }
  }

  /** 获取 ECharts 基础配置 */
  const getBaseOption = (item: ChartOptions) => ({
    animation: false,
    tooltip: {
      show: item.tooltipShow ?? true,
      trigger: item.tooltipTrigger ?? 'axis',
      backgroundColor: item.tooltipBackgroundColor ?? '#fff',
      borderColor: item.tooltipBorderColor ?? 'rgba(0, 0, 0, 0.08)',
      borderWidth: 1,
      padding: 0,
      textStyle: { color: item.tooltipColor ?? '#333', fontSize: 13 },
      formatter: item.tooltipFormatter || ((params: any) => formatTooltip(params, item, !!item.doubleY)),
      axisPointer: {
        type: 'line',
        lineStyle: { color: '#999', width: 1, type: 'dashed' },
        label: { show: true, backgroundColor: '#6a7985', color: '#fff' },
      },
    },
    legend: item.legend ?? {
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
        rich: item.legendRich ?? { one: { width: 60, height: 16, fontSize: 12, fontWeight: 400 } },
      },
      formatter: item.legendFormatter ?? ((name: string) => `{one|${name}}`),
    },
    color: item.color ?? DEFAULT_CHART_COLORS,
    dataZoom: item.dataZoom ?? [
      {
        type: 'slider',
        show: item.dataZoomShow ?? false,
        realtime: true,
        start: item.dataZoomStart ?? 0,
        end: item.dataZoomEnd ?? 100,
        bottom: item.dataZoomBottom ?? 15,
        height: item.dataZoomHeight ?? 25,
      },
      { type: 'inside', realtime: true, start: item.dataZoomStart ?? 0, end: item.dataZoomEnd ?? 100 },
    ],
    visualMap: item.visualMap ?? [],
    grid: item.grid ?? { left: '3%', right: '5%', bottom: '12%', containLabel: true },
    xAxis: item.xAxis ?? [
      {
        show: item.showXAxis ?? true,
        name: item.xName ?? '时间',
        type: item.xType ?? 'category',
        boundaryGap: item.boundaryGap ?? false,
        data: item.timeList,
        axisLine: { show: true, lineStyle: { color: item.xColor ?? '#999' } },
        axisTick: { show: true, lineStyle: { color: item.xColor ?? '#999' } },
        axisLabel: item.xAxisLabel ?? {
          color: item.xColor ?? '#999',
          fontSize: item.xFontSize ?? '12px',
          fontWeight: item.xFontWeight ?? 'normal',
          showMinLabel: item.compensateType === 'start' ? true : null,
          showMaxLabel: item.compensateType === 'end' ? true : null,
        },
        nameTextStyle: { color: item.xUnitColor ?? '#999', verticalAlign: 'top', padding: [8, 0, 0, 0] },
        nameGap: item.xNameGap ?? 20,
        nameLocation: item.xNameLocation ?? 'end',
      },
    ],
  })

  /** 图例选择变化监听 */
  const bindLegendSelectChanged = (chart: eCharts.ECharts, getCurrentItem: () => ChartOptions | undefined) => {
    chart.on('legendselectchanged', (params: any) => {
      const event = params as LegendSelectChangedEvent
      const item = getCurrentItem()
      if (!item?.xAlignValue) return

      const selectedNames = Object.keys(event.selected).filter((k) => event.selected[k])
      const filteredSeries = item.series?.filter((s) => selectedNames.includes(s.name))
      const { axis0Data, axis1Data } = getAxisData(filteredSeries ?? [])

      const yAxis = [
        createYAxisOption(item, 0, axis1Data),
        ...(item.doubleY ? [createYAxisOption(item, 1, axis0Data)] : []),
      ]
      chart.setOption({ yAxis: (item.yAxis && !item.doubleY) ? item.yAxis : yAxis })
    })
  }

  /** 更新图表配置 */
  const updateChartOption = (item: ChartOptions, chart: eCharts.ECharts, notMerge = true) => {
    if (!chart || chart.isDisposed()) return

    // 如果是不合并更新（完整更新），需要重新计算 Y 轴等配置
    if (notMerge) {
      const { axis0Data, axis1Data } = getAxisData(item.series)
      const yAxis = [
        createYAxisOption(item, 0, axis1Data),
        ...(item.doubleY ? [createYAxisOption(item, 1, axis0Data)] : []),
      ]

      const finalYAxis = (item.yAxis && !item.doubleY) ? item.yAxis : yAxis
      const finalOption = {
        ...getBaseOption(item),
        yAxis: finalYAxis,
        series: item.series,
      }
      chart.setOption(finalOption, { notMerge: true })
    } else {
      // 如果是合并更新（仅更新数据或部分配置），直接设置
      chart.setOption({
        series: item.series,
        xAxis: item.xAxis || [{ data: item.timeList }],
      }, { notMerge: false })
    }
  }

  return {
    updateChartOption,
    bindLegendSelectChanged,
  }
}

