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

    <!-- 联动图表统一 tooltip -->
    <div
      v-if="unifiedTooltip && chartList.length > 0"
      v-show="unifiedTooltipVisible"
      class="unified-tooltip"
      :style="unifiedTooltipStyle"
      v-html="unifiedTooltipContent"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, shallowRef } from 'vue'
import * as eCharts from 'echarts'
import { debounce } from 'lodash-es'
import { NDataTable } from 'naive-ui'
import type { ChartOptions } from '@/components/lineEcharts/types'
import { useChartTable } from '@/components/lineEcharts/useChartTable'
import { useLinkedChartOption } from './useLinkedChartOption'

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
const boxRefs = ref<(HTMLDivElement | null)[]>([])
function setBoxRef(el: HTMLDivElement | null, index: number) {
  if (el) boxRefs.value[index] = el
}

const myCharts = shallowRef<(eCharts.ECharts | null)[]>([])
const height = ref(props.height)

const { showTable, showValue, calculateTableData } = useChartTable()
const { updateChartOption, bindLegendSelectChanged } = useLinkedChartOption()

// --- 统一 Tooltip 逻辑 ---
const unifiedTooltipVisible = ref(false)
const unifiedTooltipContent = ref('')
const unifiedTooltipStyle = ref({ left: '0px', top: '0px' })
const unifiedTooltipOffset = 16
let axisPointerHandlers: { zr: any; onMove: any; onOut: any }[] = []

/** 从图表实例获取图例选中状态 */
function isSeriesSelected(chart: eCharts.ECharts, seriesName: string) {
  if (!chart || chart.isDisposed()) return true
  try {
    const opt = chart.getOption() as any
    const legend = opt?.legend
    if (!legend || !legend.length) return true
    const selected = legend[0]?.selected
    if (selected == null) return true
    return selected[seriesName] !== false
  } catch (_) {
    return true
  }
}

/** 构建统一 Tooltip 内容 */
function buildUnifiedTooltipContent(axisValue: string, dataIndex: number, hoveredChartIndex: number) {
  const textColor = '#333'
  let html = `<div style="padding: 12px 16px; min-width: 200px;">`
  html += `<div style="margin-bottom: 10px; font-size: 14px; color: ${textColor}; font-weight: 500;">${axisValue}</div>`

  // 排序：当前悬停的图表排在最前，其余按顺序
  const sortedChartIndices = [
    hoveredChartIndex,
    ...chartList.value.map((_, i) => i).filter(i => i !== hoveredChartIndex)
  ]

  let lastRenderedChartIndex = -1

  sortedChartIndices.forEach(chartIndex => {
    const chart = myCharts.value[chartIndex]
    const opt = chartList.value[chartIndex]
    if (!chart || !opt || !opt.series) return

    let hasRenderedSeries = false
    
    opt.series.forEach((s) => {
      if (!isSeriesSelected(chart, s.name)) return

      // 不同图表之间添加间距 (仅当上一个图表有渲染内容时)
      if (lastRenderedChartIndex >= 0 && chartIndex !== lastRenderedChartIndex && !hasRenderedSeries) {
         // 这里逻辑稍微复杂一点：我们希望在"新的一组"开始前加间距。
         // 简单处理：只要不是第一组，且是该组的第一个元素，就加间距。
      }
      
      // 获取数据
      let value: string | number = '--'
      const raw = (s.data && s.data[dataIndex])
      value = raw != null ? raw : '--'
      
      // 格式化单位
      let unit = ''
      if (s.tableUnit) {
        unit = String(s.tableUnit).replace(/^\(|\)$/g, '')
      } else {
        // 尝试从 yName 获取单位 (简化逻辑，详细逻辑可参考 useLinkedChartOption)
        unit = opt.yName?.includes('：') ? opt.yName.split('：')[1] || '' : (opt.yName || '')
      }
      
      const displayValue = value === '--' ? value : (unit ? `${value}${unit}` : value)
      
      // 颜色：使用配置颜色或默认颜色
      const itemColorArr = ['#6677E6', '#46B3E7', '#3379D5', '#6ECDB9', '#999999', '#E5E19A', '#EEEEEE']
      // 查找 series 在该图表中的 index 以分配颜色
      const seriesIndex = opt.series!.indexOf(s)
      // 优先使用 opt.color，否则使用默认色板
      const colorList = (opt.color && Array.isArray(opt.color) && opt.color.length) ? opt.color : itemColorArr
      const color = colorList[seriesIndex % colorList.length]

      // 如果是新的一组（且不是第一组），添加间距
      if (chartIndex !== lastRenderedChartIndex && lastRenderedChartIndex !== -1) {
         html += `<div style="height: 10px; margin: 4px 0;"></div>`
      }
      lastRenderedChartIndex = chartIndex
      hasRenderedSeries = true

      const marker = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:8px;background-color:${color};vertical-align:middle;"></span>`
      html += `<div style="margin: 6px 0; display: flex; align-items: center; justify-content: space-between; gap: 24px;">
        ${marker}
        <span style="color: ${textColor}; font-size: 13px; flex: 1;">${s.name}</span>
        <span style="color: ${textColor}; font-size: 13px; margin-left: auto; white-space: nowrap;">${displayValue}</span>
      </div>`
    })
  })

  html += `</div>`
  return html
}

function showTooltip(event: any, axisValue: string, dataIndex: number, hoveredChartIndex: number) {
  unifiedTooltipContent.value = buildUnifiedTooltipContent(axisValue, dataIndex, hoveredChartIndex)
  const ev = event.event || event
  const clientX = ev.clientX != null ? ev.clientX : ev.x
  const clientY = ev.clientY != null ? ev.clientY : ev.y
  unifiedTooltipStyle.value = {
    left: `${(clientX || 0) + unifiedTooltipOffset}px`,
    top: `${(clientY || 0) + unifiedTooltipOffset}px`,
    position: 'fixed',
    zIndex: '10000',
    pointerEvents: 'none'
  }
  unifiedTooltipVisible.value = true
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

    const onMousemove = (zrEvent: any) => {
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
  
  // 绑定统一 Tooltip 事件
  if (props.unifiedTooltip) {
    // 确保实例创建后再绑定
    nextTick(() => {
       bindUnifiedTooltipEvents()
       // 联动
       if (instances.length > 1) {
         eCharts.connect(instances.filter(Boolean) as eCharts.ECharts[])
       }
    })
  }
}

const resizeHandler = debounce(() => {
  myCharts.value.forEach((chart) => {
    if (chart && !chart.isDisposed()) chart.resize()
  })
}, 100)

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
  eCharts.disconnect()
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
}, 50)

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

.unified-tooltip {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.clearfix::after {
  content: "";
  display: table;
  clear: both;
}
</style>
