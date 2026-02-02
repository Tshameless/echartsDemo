<template>
  <div class="chart-table-switch-wrapper">
    <div class="switch-row">
      <div class="switch-row-left">
        <slot name="header" />
      </div>
      <div class="chart-table-switch">
        <span
          class="switch-btn"
          :class="{ active: displayChart }"
          @click="setChartView(true)"
        >图</span>
        <span
          class="switch-btn"
          :class="{ active: !displayChart }"
          @click="setChartView(false)"
        >表</span>
      </div>
    </div>
    <div v-show="displayChart" class="chart-content">
      <div ref="containerRef" class="linked-chart-container">
        <template v-if="chartList.length === 0">
          <!-- 无数据时不渲染 -->
        </template>
        <template v-else-if="chartList.length === 1">
          <div class="clearfix">
            <div ref="eChartsBoxRef" class="chart-box" :style="{ height: `${height}px`, maxHeight: `${height}px` }"></div>
          </div>
        </template>
        <template v-else>
          <div v-for="(_, index) in chartList" :key="index" class="chart-item-wrap">
            <div v-if="getChartTitle(index)" class="chart-title">{{ getChartTitle(index) }}</div>
            <div
              :ref="(el) => setBoxRef(el as HTMLDivElement | null, index)"
              class="chart-box"
              :style="{ height: `${height}px`, maxHeight: `${height}px` }"
            ></div>
          </div>
        </template>
      </div>
    </div>
    <div v-show="!displayChart" class="table-content">
      <n-data-table
        :columns="dataTableColumns"
        :data="tableRows"
        :max-height="tableMaxHeight"
        :scroll-x="1200"
        striped
        :bordered="true"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, shallowRef, h } from 'vue'
import * as eCharts from 'echarts'
import { debounce } from 'lodash-es'
import { NDataTable, type DataTableColumns, NTooltip } from 'naive-ui'
import type { ChartOptions, LegendSelectChangedEvent } from '@/components/lineEcharts/types'
import { calcYAxisMax, calcYAxisMin } from '@/components/lineEcharts/utils'
import { useChartResize } from '@/components/lineEcharts/useChartResize'
import { useChartTable } from '@/components/lineEcharts/useChartTable'

interface Props {
  /** 单图配置（与 opts 二选一） */
  opt?: ChartOptions
  /** 多图配置数组，与 opt 二选一；传入则渲染多个联动图 */
  opts?: ChartOptions[]
  /** 多图时每张图的标题，与 opts 一一对应；不传则用 opt.title */
  titles?: string[]
  height: number
  groupId?: string
  showChartView?: boolean
  /** 表格最大高度（px） */
  tableMaxHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  groupId: '',
  tableMaxHeight: 500
})

const displayChart = computed(() =>
  props.showChartView !== undefined ? props.showChartView : showValue.value
)

const chartList = computed(() => {
  if (props.opts?.length) return props.opts
  if (props.opt && Object.keys(props.opt).length > 0) return [props.opt]
  return []
})

function getChartTitle(index: number): string {
  if (props.titles && props.titles[index] !== undefined) return props.titles[index]
  const item = chartList.value[index]
  return item?.title ?? ''
}

const emit = defineEmits(['chart-ready', 'update:showChartView'])

/** 图/表切换用表格数据：单图从 opt 取，多图从 opts 合并 */
const chartTableSwitchTableData = computed(() => {
  const list = chartList.value
  if (list.length === 0) return { timeList: [], series: [] }
  if (list.length === 1) {
    const item = list[0]
    const timeList = item?.timeList || []
    const series = (item?.series || []).map((s: any) => ({
      name: s.name,
      unit: s.tableUnit,
      data: s.rawData != null ? s.rawData : (s.data || [])
    }))
    return { timeList, series }
  }
  const timeList = list[0]?.timeList || []
  const series: { name: string; unit?: string; data: (number | null)[] }[] = []
  list.forEach((opt) => {
    opt?.series?.forEach((s: any) => {
      series.push({
        name: s.name,
        unit: s.tableUnit,
        data: s.rawData != null ? s.rawData : (s.data || [])
      })
    })
  })
  return { timeList, series }
})

const tableColumns = computed(() => {
  const s = chartTableSwitchTableData.value.series || []
  return s.map((item) => ({ prop: item.name, label: item.name }))
})

const dataTableColumns = computed(() => {
  return [
    {
      title: '时间',
      key: '时间',
      fixed: 'left' as const,
      width: 80
    },
    ...tableColumns.value.map(col => ({
      title: col.label,
      key: col.prop,
      minWidth: 120,
      ellipsis: {
        tooltip: true
      }
    }))
  ]
})

const tableRows = computed(() => {
  const { timeList = [], series = [] } = chartTableSwitchTableData.value
  if (!timeList.length) return []
  return timeList.map((t, i) => {
    const row: Record<string, string | number> = { 时间: t }
    series.forEach((s) => {
      const val = s.data && s.data[i]
      row[s.name] = val != null ? val : '--'
    })
    return row
  })
})

function setChartView(value: boolean) {
  if (props.showChartView !== undefined) {
    emit('update:showChartView', value)
  } else {
    showValue.value = value
  }
}

const containerRef = ref<HTMLDivElement>()
const eChartsBoxRef = ref<HTMLDivElement>()
const boxRefs = ref<(HTMLDivElement | null)[]>([])
function setBoxRef(el: HTMLDivElement | null, index: number) {
  if (el) boxRefs.value[index] = el
}

const myChart = shallowRef<eCharts.ECharts | null>(null)
const myCharts = shallowRef<(eCharts.ECharts | null)[]>([])
const height = ref(props.height)

const { resize: resizeSingle } = useChartResize(myChart, eChartsBoxRef)
const { showTable, showValue, calculateTableData } = useChartTable()

const itemColorArr = ['#6677E6', '#46B3E7', '#3379D5', '#6ECDB9', '#999999', '#E5E19A', '#EEEEEE']

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

/** 获取轴数据用于双 Y 轴对齐计算（与 lineEcharts 一致，使用 series[].data 保证与绘图数据一致） */
function getAxisData(series: ChartOptions['series']) {
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

/**
 * 与 lineEcharts 一致：双 Y 轴对齐时使用 ECharts 的 min/max 回调函数，
 * 缩放时 ECharts 会传入当前可见范围重新计算 y 轴，实现 dataZoom 时 y 轴联动。
 */
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

function updateChart(item: ChartOptions, instance?: eCharts.ECharts | null) {
  const chart = instance ?? myChart.value
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

/** 图例选择变化时，根据当前选中 series 重新计算 y 轴 min/max（与 lineEcharts 一致，仅在 xAlignValue 时生效） */
function bindLegendSelectChanged(chart: eCharts.ECharts, getCurrentItem: () => ChartOptions | undefined) {
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

function initChartInstance(): boolean {
  try {
    if (!eChartsBoxRef.value) return false
    myChart.value = eCharts.init(eChartsBoxRef.value)
    if (props.opt?.xAlignValue) {
      bindLegendSelectChanged(myChart.value, () => chartList.value[0])
    }
    return true
  } catch (error) {
    console.error('Failed to initialize ECharts:', error)
    return false
  }
}

function initAllCharts() {
  const list = chartList.value
  if (list.length === 0) return
  if (list.length === 1) {
    if (props.opt && Object.keys(props.opt).length > 0) {
      if (!myChart.value || myChart.value.isDisposed()) initChartInstance()
      updateChart(props.opt)
      if (props.opt.showTable !== undefined) {
        showTable.value = props.opt.showTable
        if (showTable.value) calculateTableData(props.opt)
      }
    }
    return
  }
  const instances: (eCharts.ECharts | null)[] = []
  for (let i = 0; i < list.length; i++) {
    const el = boxRefs.value[i]
    if (!el) continue
    try {
      const chart = eCharts.init(el)
      instances[i] = chart
      const item = list[i]
      updateChart(item, chart)
      if (item.xAlignValue) {
        bindLegendSelectChanged(chart, () => chartList.value[i])
      }
    } catch (e) {
      console.error('Failed to init chart', i, e)
      instances[i] = null
    }
  }
  myCharts.value = instances
}

function resizeHandler() {
  if (chartList.value.length === 1) {
    resizeSingle()
    return
  }
  myCharts.value.forEach((chart) => {
    if (chart && !chart.isDisposed()) chart.resize()
  })
}

let resizeObserver: ResizeObserver | null = null

/** 单图时为当前实例，多图时为第一个实例（兼容旧用法） */
const exposedMyChart = computed(() => chartList.value.length === 1 ? myChart.value : (myCharts.value[0] ?? null))
/** 所有图表实例数组，单图时为 [myChart]，多图时为 myCharts（供 echarts.connect 与统一 tooltip 使用） */
const exposedMyCharts = computed(() => chartList.value.length > 1 ? myCharts.value.filter(Boolean) : (myChart.value ? [myChart.value] : []))

defineExpose({
  resizeHandler,
  myChart: exposedMyChart,
  myCharts: exposedMyCharts,
  showChartView: displayChart,
  setChartView
})

onMounted(() => {
  if (chartList.value.length === 0) return
  if (chartList.value.length === 1) {
    if (props.opt && Object.keys(props.opt).length > 0) {
      if (!initChartInstance()) return
      updateChart(props.opt)
      if (props.opt.showTable !== undefined) {
        showTable.value = props.opt.showTable
        if (showTable.value) calculateTableData(props.opt)
      }
      nextTick(() => {
        if (myChart.value) emit('chart-ready', myChart.value)
      })
    }
    return
  }
  nextTick(() => {
    requestAnimationFrame(() => {
      initAllCharts()
      const list = myCharts.value.filter(Boolean)
      if (list.length > 0) {
        emit('chart-ready', list)
        if (containerRef.value) {
          resizeObserver = new ResizeObserver(() => requestAnimationFrame(resizeHandler))
          resizeObserver.observe(containerRef.value)
        }
      }
    })
  })
})

onUnmounted(() => {
  if (resizeObserver && containerRef.value) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (chartList.value.length === 1 && myChart.value) {
    myChart.value.off('legendselectchanged')
    myChart.value.dispose()
    myChart.value = null
  } else {
    myCharts.value.forEach((chart) => {
      if (chart && !chart.isDisposed()) {
        chart.off('legendselectchanged')
        chart.dispose()
      }
    })
    myCharts.value = []
  }
})

const debouncedUpdate = debounce((newVal: ChartOptions | ChartOptions[]) => {
  const list = Array.isArray(newVal) ? newVal : (newVal ? [newVal] : [])
  if (list.length === 0) return
  if (chartList.value.length === 1 && list.length === 1) {
    if (Object.keys(list[0]).length > 0) {
      calculateTableData(list[0])
      updateChart(list[0])
      nextTick(() => myChart.value?.resize())
    }
    return
  }
  if (chartList.value.length > 1 && list.length === chartList.value.length) {
    list.forEach((opt, i) => {
      if (Object.keys(opt).length > 0 && myCharts.value[i] && !myCharts.value[i]?.isDisposed()) {
        updateChart(opt, myCharts.value[i])
      }
    })
    nextTick(resizeHandler)
  }
}, 50)

watch(() => [props.opt, props.opts] as const, ([newOpt, newOpts]) => {
  const list = (newOpts?.length ? newOpts : (newOpt ? [newOpt] : [])) as ChartOptions[]
  debouncedUpdate(list.length === 1 ? list[0] : list)
}, { deep: true })
</script>

<style scoped>
.chart-table-switch-wrapper {
  width: 100%;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.switch-row-left {
  flex: 1;
  min-width: 0;
}

.table-content {
  margin-top: 12px;
}

.chart-table-switch {
  display: inline-flex;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.switch-btn {
  padding: 6px 16px;
  font-size: 14px;
  color: #606266;
  background: #fff;
  cursor: pointer;
  user-select: none;
}

.switch-btn:hover {
  color: #409eff;
}

.switch-btn.active {
  background: #409eff;
  color: #fff;
}

.linked-chart-container {
  position: relative;
  border: 1px solid transparent;
  width: 100%;
}

.chart-box {
  width: 95%;
}

.chart-item-wrap {
  margin-bottom: 8px;
}

.chart-item-wrap:last-child {
  margin-bottom: 0;
}

.chart-title {
  padding: 8px 0 4px 0;
  font-weight: bold;
  font-size: 14px;
}

.clearfix::after {
  content: "";
  display: table;
  clear: both;
}
</style>
