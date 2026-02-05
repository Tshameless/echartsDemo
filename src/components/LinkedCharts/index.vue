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
        <template v-if="chartList.length > 0">
          <div v-for="(opt, index) in chartList" :key="getChartItemKey(opt, index)" class="chart-item-wrap">
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
        :scroll-x="TABLE_SCROLL_X"
        striped
        :bordered="true"
      />
    </div>
     <!-- <div v-show="!displayChart" class="table-content">
      <el-table
        :data="tableRows"
        :max-height="tableMaxHeight"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="时间" label="时间" min-width="80" fixed />
        <el-table-column
          v-for="col in tableColumns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          min-width="120"
          show-overflow-tooltip
        />
      </el-table>
    </div> -->
    <!-- 联动图表统一 tooltip：Teleport 到 body 避免被父级 overflow 裁切，并做视口边界定位 -->
    <Teleport to="body">
      <div
        v-if="unifiedTooltip && chartList.length > 0"
        v-show="unifiedTooltipVisible"
        ref="unifiedTooltipRef"
        class="unified-tooltip"
        :style="unifiedTooltipStyle"
        v-html="unifiedTooltipContent"
      />
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, shallowRef } from 'vue'
import * as eCharts from 'echarts'
import { debounce } from 'lodash-es'
import type { ChartOptions, ChartSeriesData } from '@/components/lineEcharts/types'
import { useChartTable } from '@/components/lineEcharts/useChartTable'
import { escapeHtml } from '@/components/lineEcharts/utils'
import { useLinkedChartOption, DEFAULT_CHART_COLORS } from './useLinkedChartOption'

/** 防抖：配置更新 */
const DEBOUNCE_UPDATE_MS = 50
/** 统一 Tooltip 相对鼠标的偏移（px） */
const TOOLTIP_OFFSET_PX = 16
/** 表格横向滚动宽度（px） */
const TABLE_SCROLL_X = 1200
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
  /** 是否开启多图联动统一 Tooltip（默认开启） */
  unifiedTooltip?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  groupId: '',
  tableMaxHeight: 500,
  unifiedTooltip: true
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

/** v-for 用稳定 key（无 id 时用 index + 标题/系列名） */
function getChartItemKey(opt: ChartOptions, index: number): string {
  const t = opt?.title ?? opt?.series?.[0]?.name
  return t ? `${index}-${String(t)}` : String(index)
}

const emit = defineEmits(['chart-ready', 'update:showChartView'])

/** 图/表切换用表格数据：单图从 opt 取，多图从 opts 合并 */
const chartTableSwitchTableData = computed(() => {
  const list = chartList.value
  if (list.length === 0) return { timeList: [], series: [] }
  
  // 注意：多图模式下，默认使用第一个图表的时间轴作为基准。
  // 如果不同图表的时间轴不一致（例如一个是按天，一个是按小时），
  // 会导致数据错位或显示不准确。请确保传入的 opts 中各图表时间轴保持一致。
  const timeList = list[0]?.timeList || []
  
  const series: { name: string; unit?: string; data: (number | null)[] }[] = []
  list.forEach((opt) => {
    opt?.series?.forEach((s: ChartSeriesData) => {
      const raw = s.rawData
      series.push({
        name: s.name,
        unit: s.tableUnit,
        data: raw != null ? raw : (s.data || [])
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
const boxRefs = ref<(HTMLDivElement | null)[]>([])
function setBoxRef(el: HTMLDivElement | null, index: number) {
  const prev = boxRefs.value
  if (prev[index] === el && prev.length > index) return
  const arr = prev.slice()
  while (arr.length <= index) arr.push(null)
  arr[index] = el
  boxRefs.value = arr
}

const myCharts = shallowRef<(eCharts.ECharts | null)[]>([])
const height = ref(props.height)

const { showTable, showValue, calculateTableData } = useChartTable()
const { updateChartOption, bindLegendSelectChanged } = useLinkedChartOption()

// --- 统一 Tooltip 逻辑 ---
const unifiedTooltipVisible = ref(false)
const unifiedTooltipContent = ref('')
const unifiedTooltipStyle = ref<Record<string, string>>({ left: '0px', top: '0px' })
const unifiedTooltipRef = ref<HTMLElement | null>(null)
/** 统一 Tooltip 事件句柄（用于解绑） */
interface AxisPointerHandler {
  zr: ReturnType<eCharts.ECharts['getZr']> | undefined
  onMove: (e: { offsetX: number; offsetY: number; event?: MouseEvent }) => void
  onOut: () => void
}
let axisPointerHandlers: AxisPointerHandler[] = []
/** 使用 connect(instances) 时返回的 groupId，用于 unmount 时只断开本组件 */
const connectedGroupIdRef = ref<string | null>(null)

/** 从图表实例获取图例选中状态 */
function isSeriesSelected(chart: eCharts.ECharts, seriesName: string): boolean {
  if (!chart || chart.isDisposed()) return true
  try {
    const opt = chart.getOption() as { legend?: Array<{ selected?: Record<string, boolean> }> }
    const legend = opt?.legend
    if (!legend?.length) return true
    const selected = legend[0]?.selected
    if (selected == null) return true
    return selected[seriesName] !== false
  } catch {
    return true
  }
}

/** 从系列/图表配置解析显示单位 */
function getSeriesDisplayUnit(s: ChartSeriesData, opt: ChartOptions): string {
  if (s.tableUnit) return String(s.tableUnit).replace(/^\(|\)$/g, '')
  return opt.yName?.includes('：') ? (opt.yName.split('：')[1] || '') : (opt.yName || '')
}

/** Tooltip 内联样式常量，便于维护 */
const TOOLTIP_STYLES = {
  wrap: 'padding: 12px 16px; min-width: 200px;',
  title: 'margin-bottom: 10px; font-size: 14px; color: #333; font-weight: 500;',
  divider: 'height: 10px; margin: 4px 0;',
  row: 'margin: 6px 0; display: flex; align-items: center; justify-content: space-between; gap: 24px;',
  rowText: 'color: #333; font-size: 13px;',
  marker: 'display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:8px;vertical-align:middle;'
} as const

/** 渲染单条 series 行 HTML（内部已转义） */
function renderTooltipRow(name: string, displayValue: string, color: string): string {
  const marker = `<span style="${TOOLTIP_STYLES.marker}background-color:${escapeHtml(color)};"></span>`
  return `<div style="${TOOLTIP_STYLES.row}">${marker}<span style="${TOOLTIP_STYLES.rowText}; flex: 1;">${escapeHtml(name)}</span><span style="${TOOLTIP_STYLES.rowText}; margin-left: auto; white-space: nowrap;">${escapeHtml(displayValue)}</span></div>`
}

/** 构建统一 Tooltip 内容（内部已转义，可安全用于 v-html） */
function buildUnifiedTooltipContent(axisValue: string, dataIndex: number, hoveredChartIndex: number): string {
  const charts = chartList.value
  const indices = charts.map((_, i) => i)
  const sortedChartIndices = [hoveredChartIndex, ...indices.filter(i => i !== hoveredChartIndex)]

  const rows: string[] = []
  let needDivider = false

  for (const chartIndex of sortedChartIndices) {
    const chart = myCharts.value[chartIndex]
    const opt = charts[chartIndex]
    if (!chart || !opt?.series) continue

    if (needDivider) rows.push(`<div style="${TOOLTIP_STYLES.divider}"></div>`)
    needDivider = true

    const colorList = Array.isArray(opt.color) && opt.color.length > 0 ? opt.color : DEFAULT_CHART_COLORS

    for (let seriesIndex = 0; seriesIndex < opt.series.length; seriesIndex++) {
      const s = opt.series[seriesIndex]
      if (!isSeriesSelected(chart, s.name)) continue

      const raw = s.data?.[dataIndex]
      const value = raw != null ? raw : '--'
      const unit = getSeriesDisplayUnit(s, opt)
      const displayValue = value === '--' ? value : (unit ? `${value}${unit}` : value)
      const color = colorList[seriesIndex % colorList.length]
      rows.push(renderTooltipRow(s.name, String(displayValue), color))
    }
  }

  return `<div style="${TOOLTIP_STYLES.wrap}"><div style="${TOOLTIP_STYLES.title}">${escapeHtml(axisValue)}</div>${rows.join('')}</div>`
}

function showTooltip(
  event: MouseEvent | { event?: MouseEvent },
  axisValue: string,
  dataIndex: number,
  hoveredChartIndex: number
) {
  unifiedTooltipContent.value = buildUnifiedTooltipContent(axisValue, dataIndex, hoveredChartIndex)
  const ev = 'event' in event && event.event ? event.event : (event as MouseEvent)
  const clientX = ev.clientX ?? (ev as unknown as { x?: number }).x ?? 0
  const clientY = ev.clientY ?? (ev as unknown as { y?: number }).y ?? 0
  unifiedTooltipStyle.value = {
    left: `${clientX + TOOLTIP_OFFSET_PX}px`,
    top: `${clientY + TOOLTIP_OFFSET_PX}px`,
    position: 'fixed',
    zIndex: '10000',
    pointerEvents: 'none' as const
  }
  unifiedTooltipVisible.value = true
  // 下一帧根据实际尺寸做视口边界修正，避免 tooltip 在图表底部/右侧时被裁切
  nextTick(() => {
    const el = unifiedTooltipRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const gap = 8
    let left = clientX + TOOLTIP_OFFSET_PX
    let top = clientY + TOOLTIP_OFFSET_PX
    if (left + rect.width + gap > vw) left = clientX - rect.width - TOOLTIP_OFFSET_PX
    if (left < gap) left = gap
    if (top + rect.height + gap > vh) top = clientY - rect.height - TOOLTIP_OFFSET_PX
    if (top < gap) top = gap
    unifiedTooltipStyle.value = {
      ...unifiedTooltipStyle.value,
      left: `${left}px`,
      top: `${top}px`
    }
  })
}

function hideTooltip() {
  unifiedTooltipVisible.value = false
}

function bindUnifiedTooltipEvents() {
  // 清理旧事件
  axisPointerHandlers.forEach(({ zr, onMove, onOut }) => {
    if (zr) {
      zr.off('mousemove', onMove)
      zr.off('globalout', onOut)
    }
  })
  axisPointerHandlers = []

  if (!props.unifiedTooltip || chartList.value.length === 0) return

  const timeData = chartList.value[0]?.timeList || []
  const len = timeData.length

  myCharts.value.forEach((chart, chartIndex) => {
    if (!chart) return
    const zr = chart.getZr()
    if (!zr) return

    const onMousemove = (zrEvent: { offsetX: number; offsetY: number; event?: MouseEvent }) => {
      const point = [zrEvent.offsetX, zrEvent.offsetY]
      let dataIndex = -1
      try {
        const result = chart.convertFromPixel('grid', point)
        if (result != null && result.length >= 1) {
          const raw = result[0]
          // 兼容处理：有些版本返回索引，有些返回数值
          dataIndex = typeof raw === 'number' ? Math.round(raw) : timeData.indexOf(raw)
          // 再次兜底
          if (dataIndex < 0 && typeof raw === 'string') dataIndex = timeData.indexOf(raw)
        }
      } catch (_) {
        dataIndex = -1
      }

      if (dataIndex < 0 || dataIndex >= len) {
        hideTooltip()
        return
      }

      const axisValue = String(timeData[dataIndex] ?? dataIndex)
      const ev = zrEvent.event || zrEvent
      showTooltip(ev, axisValue, dataIndex, chartIndex)
    }

    const onGlobalOut = () => {
      hideTooltip()
    }

    zr.on('mousemove', onMousemove)
    zr.on('globalout', onGlobalOut)
    axisPointerHandlers.push({ zr, onMove: onMousemove, onOut: onGlobalOut })
  })
}

function initCharts() {
  const list = chartList.value
  if (list.length === 0) return

  const instances: (eCharts.ECharts | null)[] = []
  
  // 遍历配置列表，初始化或更新图表
  list.forEach((item, i) => {
    const el = boxRefs.value[i]
    if (!el) {
      instances.push(null)
      return
    }

    let chart = myCharts.value[i]
    try {
      // 如果实例不存在或已销毁，则重新初始化
      if (!chart || chart.isDisposed()) {
        chart = eCharts.init(el)
      }
      if (props.groupId) {
        ;(chart as eCharts.ECharts & { group: string }).group = props.groupId
      }
      instances[i] = chart
      
      // 如果开启统一 Tooltip，则强制关闭自带 Tooltip
      const finalItem = props.unifiedTooltip ? { ...item, tooltipShow: false } : item
      updateChartOption(finalItem, chart)
      
      if (item.xAlignValue) {
        // 先解绑，防止重复绑定
        chart.off('legendselectchanged')
        bindLegendSelectChanged(chart, () => chartList.value[i])
      }

      // 如果是单图且配置了显示表格，初始化表格数据
      if (list.length === 1 && item.showTable !== undefined) {
        showTable.value = item.showTable
        if (showTable.value) calculateTableData(item)
      }
    } catch (e) {
      console.error('Failed to init chart', i, e)
      instances[i] = null
    }
  })

  // 清理多余的旧实例（如果有）
  if (myCharts.value.length > list.length) {
    for (let i = list.length; i < myCharts.value.length; i++) {
      const oldChart = myCharts.value[i]
      if (oldChart && !oldChart.isDisposed()) {
        oldChart.dispose()
      }
    }
  }

  myCharts.value = instances
  
  // 绑定统一 Tooltip 事件与联动
  if (props.unifiedTooltip) {
    nextTick(() => {
      bindUnifiedTooltipEvents()
      if (instances.length <= 1) return
      const validCharts = instances.filter(Boolean) as eCharts.ECharts[]
      if (props.groupId) {
        eCharts.connect(props.groupId)
      } else {
        connectedGroupIdRef.value = eCharts.connect(validCharts)
      }
    })
  }
}

let resizeAnimationFrame: number | null = null

const resizeHandler = () => {
  if (resizeAnimationFrame !== null) {
    cancelAnimationFrame(resizeAnimationFrame)
  }
  resizeAnimationFrame = requestAnimationFrame(() => {
    myCharts.value.forEach((chart) => {
      if (chart && !chart.isDisposed()) {
        chart.resize({ animation: { duration: 0 } })
      }
    })
    resizeAnimationFrame = null
  })
}

let resizeObserver: ResizeObserver | null = null

/** 兼容旧用法：单图时暴露第一个实例 */
const exposedMyChart = computed(() => myCharts.value[0] ?? null)
/** 暴露所有有效实例 */
const exposedMyCharts = computed(() => myCharts.value.filter(Boolean))

defineExpose({
  resizeHandler,
  myChart: exposedMyChart,
  myCharts: exposedMyCharts,
  showChartView: displayChart,
  setChartView
})

onMounted(() => {
  if (chartList.value.length === 0) return
  
  nextTick(() => {
    requestAnimationFrame(() => {
      initCharts()
      const list = myCharts.value.filter(Boolean)
      if (list.length > 0) {
        // 兼容旧事件：如果是单图，传单个实例；多图传数组
        if (chartList.value.length === 1) {
          emit('chart-ready', list[0])
        } else {
          emit('chart-ready', list)
        }
        
        if (containerRef.value) {
          resizeObserver = new ResizeObserver(resizeHandler)
          resizeObserver.observe(containerRef.value, { box: 'border-box' })
        }
      }
    })
  })
})

onUnmounted(() => {
  if (resizeAnimationFrame !== null) {
    cancelAnimationFrame(resizeAnimationFrame)
    resizeAnimationFrame = null
  }
  if (resizeObserver && containerRef.value) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  myCharts.value.forEach((chart) => {
    if (chart && !chart.isDisposed()) {
      chart.off('legendselectchanged')
      chart.dispose()
    }
  })
  // 清理事件监听
  axisPointerHandlers.forEach(({ zr, onMove, onOut }) => {
    if (zr) {
      zr.off('mousemove', onMove)
      zr.off('globalout', onOut)
    }
  })
  axisPointerHandlers = []
  if (props.groupId) {
    eCharts.disconnect(props.groupId)
  } else if (connectedGroupIdRef.value) {
    eCharts.disconnect(connectedGroupIdRef.value)
    connectedGroupIdRef.value = null
  }
  myCharts.value = []
})

const debouncedUpdate = debounce(() => {
  const list = chartList.value
  if (list.length === 0) return
  
  // 如果实例数量不匹配，可能需要重新初始化（例如从单图变为多图）
  if (myCharts.value.length !== list.length) {
     initCharts()
     return
  }

  list.forEach((opt, i) => {
    const chart = myCharts.value[i]
    if (chart && !chart.isDisposed() && Object.keys(opt).length > 0) {
      // 如果开启统一 Tooltip，则强制关闭自带 Tooltip
      const finalItem = props.unifiedTooltip ? { ...opt, tooltipShow: false } : opt
      updateChartOption(finalItem, chart)
    }
  })
  
  // 重新绑定事件（因为 option 更新可能导致坐标系变化？）通常不需要，但为了保险
  if (props.unifiedTooltip) {
      bindUnifiedTooltipEvents()
  }

  // 如果是单图，更新表格数据
  if (list.length === 1 && Object.keys(list[0]).length > 0) {
     calculateTableData(list[0])
  }
  
  nextTick(resizeHandler)
}, DEBOUNCE_UPDATE_MS)

// 监听配置变化
// 注意：如果 props.opt / props.opts 对象引用没有变化（只是内部属性变了），
// 且去掉了 deep: true，则不会触发更新。
// 为了性能优化，建议父组件在数据更新时替换整个对象引用。
// 这里保留 deep: true 以兼容旧代码，但通过 debounce 减少更新频率。
watch(() => [props.opt, props.opts], () => {
  debouncedUpdate()
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
  width: 100%;
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

.unified-tooltip {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

</style>
