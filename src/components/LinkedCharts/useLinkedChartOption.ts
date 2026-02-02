import * as eCharts from 'echarts'
import type { ChartOptions, LegendSelectChangedEvent } from '@/components/lineEcharts/types'
import { calcYAxisMax, calcYAxisMin } from '@/components/lineEcharts/utils'

const itemColorArr = ['#6677E6', '#46B3E7', '#3379D5', '#6ECDB9', '#999999', '#E5E19A', '#EEEEEE']

export const useLinkedChartOption = () => {
  const customTooltipFormatter = (params: any[], item: ChartOptions, isDoubleY = false): string => {
    if (!params || params.length === 0) return ''
    const axisValue = params[0].axisValue
    const textColor = '#333'
    let result = `<div style="padding: 12px 16px; min-width: 200px;">`
    result += `<div style="margin-bottom: 10px; font-size: 14px; color: ${textColor}; font-weight: 500;">${axisValue}</div>`
    params.forEach((param: any) => {
      const rawValue = param.value
      const value = rawValue != null ? rawValue : '--'
      const color = param.color
      const marker = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:8px;background-color:${color};vertical-align:middle;flex-shrink:0;"></span>`
      let yUnit = ''
      const seriesItem = item.series?.find((d: any) => d.name === param.seriesName)
      if (seriesItem?.tableUnit) {
        yUnit = String(seriesItem.tableUnit).replace(/^\(|\)$/g, '')
      } else if (isDoubleY && seriesItem) {
        const axisIndex = seriesItem.yAxisIndex ?? 1
        yUnit = axisIndex === 0
          ? (item.yName?.includes('：') ? item.yName.split('：')[1] || '' : item.yName || '')
          : (item.yName1?.includes('：') ? item.yName1.split('：')[1] || '' : item.yName1 || '')
      } else {
        yUnit = item.yName?.includes('：') ? item.yName.split('：')[1] || '' : (item.yName || '')
      }
      const displayValue = value === '--' ? value : `${value}${yUnit}`
      result += `<div style="margin: 6px 0; display: flex; align-items: center; justify-content: space-between; gap: 24px;">
        ${marker}
        <span style="color: ${textColor}; font-size: 13px; flex: 1;">${param.seriesName}</span>
        <span style="color: ${textColor}; font-size: 13px; margin-left: auto; white-space: nowrap;">${displayValue}</span>
      </div>`
    })
    result += `</div>`
    return result
  }

  /** 获取轴数据用于双 Y 轴对齐计算 */
  const getAxisData = (series: ChartOptions['series']) => {
    const axis0Data: number[] = []
    const axis1Data: number[] = []
    series?.forEach((s) => {
      const arr = s.data
      if (!arr) return
      arr.forEach((d) => {
        if (d !== null && d !== undefined) {
          if (s.yAxisIndex === 1) {
            axis1Data.push(d)
          } else {
            axis0Data.push(d)
          }
        }
      })
    })
    return { axis0Data, axis1Data }
  }

  const createYAxisOption = (item: ChartOptions, index: number, otherAxisData: number[] = []) => {
    const isSecondary = index === 1
    const show = isSecondary ? item.showYAxis1 : item.showYAxis
    const name = isSecondary ? item.yName1 : item.yName
    const type = isSecondary ? item.yType1 : item.yType
    const nameGap = isSecondary ? item.yNameGapOne : item.yNameGap
    const color = isSecondary ? item.yColor1 : item.yColor
    const fontSize = isSecondary ? item.yFontSize1 : item.yFontSize
    const fontWeight = isSecondary ? item.yFontWeight1 : item.yFontWeight
    const formatter = isSecondary ? item.yFormatter1 : item.yFormatter
    const axisLabel = isSecondary ? item.yAxisLabel1 : item.yAxisLabel
    const defaultName = isSecondary ? '元' : 'MW'
    return {
      show: show ?? true,
      name: name ?? defaultName,
      type: type ?? 'value',
      nameGap: nameGap ?? 20,
      nameRotate: 0,
      max: item.xAlignValue ? (value: { min: number; max: number }) => calcYAxisMax(value) : null,
      min: item.xAlignValue ? (value: { min: number; max: number }) => calcYAxisMin(value, otherAxisData) : null,
      alignTicks: item.alignTicks ?? false,
      axisLine: { show: true, lineStyle: { color: color ?? '#999' } },
      axisTick: { show: true, lineStyle: { color: color ?? '#999' } },
      splitLine: { lineStyle: { type: 'dashed', width: 1, color: 'rgba(223, 223, 223, 0.1)', opacity: 1 } },
      axisLabel: axisLabel ?? { color: color ?? '#999', fontSize: fontSize ?? '12px', fontWeight: fontWeight ?? 'normal', formatter },
      nameTextStyle: { color: '#999' }
    }
  }

  const getCommonOption = (item: ChartOptions, extra = {}) => ({
    tooltip: {
      show: item.tooltipShow ?? true,
      trigger: item.tooltipTrigger ?? 'axis',
      backgroundColor: item.tooltipBackgroundColor ?? '#fff',
      borderColor: item.tooltipBorderColor ?? 'rgba(0, 0, 0, 0.08)',
      borderWidth: 1,
      padding: 0,
      textStyle: { color: item.tooltipColor ?? '#333', fontSize: 13 },
      formatter: item.tooltipFormatter || ((params: any) => customTooltipFormatter(params, item, !!item.doubleY)),
      axisPointer: {
        type: 'line',
        lineStyle: { color: '#999', width: 1, type: 'dashed' },
        label: { show: true, backgroundColor: '#6a7985', color: '#fff' }
      }
    },
    legend: item.legend ?? {
      show: item.legendshowValue ?? true,
      left: item.legendLocation ?? 'center',
      top: item.legendTop ?? 'top',
      orient: item.legendOrient ?? 'horizontal',
      itemWidth: item.legendItemWidth ?? 30,
      itemHeight: item.legendItemHeight ?? 14,
      textStyle: { color: item.legendColor ?? '#000', fontSize: item.legendFontSize ?? 12, fontWeight: item.legendFontWeight ?? 400, rich: item.legendRich ?? { one: { width: 60, height: 16, fontSize: 12, fontWeight: 400 } } },
      formatter: item.legendFormatter ?? ((name: string) => `{one|${name}}`),
    },
    color: item.color ?? itemColorArr,
    dataZoom: item.dataZoom ?? [
      { type: 'slider', show: item.dataZoomShow ?? false, realtime: true, start: item.dataZoomStart ?? 0, end: item.dataZoomEnd ?? 100, bottom: item.dataZoomBottom ?? 15, height: item.dataZoomHeight ?? 25 },
      { type: 'inside', realtime: true, start: item.dataZoomStart ?? 0, end: item.dataZoomEnd ?? 100 },
    ],
    visualMap: item.visualMap ?? [],
    grid: item.grid ?? { left: '3%', right: '5%', bottom: '12%', containLabel: true },
    xAxis: item.xAxis ?? [{
      show: item.showXAxis ?? true,
      name: item.xName ?? '时间',
      type: item.xType ?? 'category',
      boundaryGap: item.boundaryGap ?? false,
      data: item.timeList,
      axisLine: { show: true, lineStyle: { color: item.xColor ?? '#999' } },
      axisTick: { show: true, lineStyle: { color: item.xColor ?? '#999' } },
      axisLabel: item.xAxisLabel ?? { color: item.xColor ?? '#999', fontSize: item.xFontSize ?? '12px', fontWeight: item.xFontWeight ?? 'normal', showMinLabel: item.compensateType === 'start' ? true : null, showMaxLabel: item.compensateType === 'end' ? true : null },
      nameTextStyle: { color: item.xUnitColor ?? '#999', verticalAlign: 'top', padding: [8, 0, 0, 0] },
      nameGap: item.xNameGap ?? 20,
      nameLocation: item.xNameLocation ?? 'end'
    }],
    ...extra
  })

  /** 图例选择变化时，根据当前选中 series 重新计算 y 轴 min/max */
  const bindLegendSelectChanged = (chart: eCharts.ECharts, getCurrentItem: () => ChartOptions | undefined) => {
    chart.on('legendselectchanged', (params) => {
      const eventParams = params as LegendSelectChangedEvent
      const item = getCurrentItem()
      if (!item?.xAlignValue) return
      const selectedNames = Object.keys(eventParams.selected).filter((key) => eventParams.selected[key])
      const filteredSeries = item.series?.filter((s) => selectedNames.includes(s.name))
      const { axis0Data, axis1Data } = getAxisData(filteredSeries ?? [])
      const yAxisOptions = [
        createYAxisOption(item, 0, axis1Data),
        ...(item.doubleY ? [createYAxisOption(item, 1, axis0Data)] : [])
      ]
      const finalYAxis = (item.yAxis && !item.doubleY) ? item.yAxis : yAxisOptions
      chart.setOption({ yAxis: finalYAxis })
    })
  }

  const updateChartOption = (item: ChartOptions, chart: eCharts.ECharts) => {
    if (!chart || chart.isDisposed()) return
    const { axis0Data, axis1Data } = getAxisData(item.series)
    const yAxisOptions = [
      createYAxisOption(item, 0, axis1Data),
      ...(item.doubleY ? [createYAxisOption(item, 1, axis0Data)] : [])
    ]
    const finalYAxis = (item.yAxis && !item.doubleY) ? item.yAxis : yAxisOptions
    const finalOption = getCommonOption(item, { yAxis: finalYAxis, series: item.series })
    chart.setOption(finalOption, { notMerge: true })
  }

  return {
    updateChartOption,
    bindLegendSelectChanged
  }
}
