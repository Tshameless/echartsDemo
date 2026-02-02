<template>
  <div class="link-charts-demo">
    <div class="demo-title">LinkedCharts 多图联动演示</div>

    <div class="charts-container" @mouseleave="hideUnifiedTooltip">
      <LinkedCharts
        ref="linkedChartsRef"
        v-if="chartOptionsList.length > 0"
        v-model:show-chart-view="showChartView"
        :opts="chartOptionsList"
        :titles="chartTitles"
        :height="250"
        :table-max-height="500"
        group-id="storage-monitor"
        @chart-ready="(instances) => connectCharts(instances)"
      >
        <template #header>
          <div class="date-picker-group">
            <span class="date-label">日期：</span>
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              style="width: 320px"
              value-format="YYYY-MM-DD"
              @change="handleDateChange"
            />
          </div>
        </template>
      </LinkedCharts>
    </div>

    <!-- 联动图表统一 tooltip -->
    <div
      v-show="unifiedTooltipVisible"
      class="unified-tooltip"
      :style="unifiedTooltipStyle"
      v-html="unifiedTooltipContent"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import LinkedCharts from '@/components/LinkedCharts/index.vue'
import * as echarts from 'echarts'

const selectedDate = ref('2026-01-01')
const showChartView = ref(true)

const timeList = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']

// 储能运行监测：左轴 kW、右轴 % 均用真实值绘图，xAlignValue 下组件会动态计算 min/max 并使两侧 0 对齐
const storagePowerRaw = [1120, 15, 20, -525, 30, 35, 40, 45, 50, 55, 60, 65, 350.23, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20]
const storagePlanRaw = [5, 10, 15, 20, 25, 30, 35, 39.65, 40, 38, 35, 32, 30, 28, 25, 22, 20, 18, 15, 12, 10, 8, 6, 5]
const storageCmdRaw = [5, 10, 15, 20, 25, 30, 35, 39.65, 40, 38, 35, 32, 30, 28, 25, 22, 20, 18, 15, 12, 10, 8, 6, 5]
const socRaw = [20, 22, 25, 28, 30, 32, 35, 40, 45, 48, 50, 50, 50, 52, 55, 55, 52, 50, 48, 45, 42, 40, 38, 35]

const chartOptions1 = ref({
  title: '储能运行监测',
  timeList,
  showTable: true,
  boundaryGap: false,
  tooltipShow: false,
  tooltipTrigger: 'axis',
  doubleY: true,
  yName: 'kW',
  xAlignValue: true,
  yName1: '%',
  group: 'storage-monitor',
  color: ['#5470c6', '#fa8c16', '#9254de', '#52c41a'],
  series: [
    {
      name: '储能实时功率',
      type: 'line',
      symbol: 'circle',
      symbolSize: 0,
      yAxisIndex: 0,
      data: [...storagePowerRaw],
      rawData: storagePowerRaw,
      tableUnit: '(kW)'
    },
    {
      name: '储能日内调度计划',
      type: 'line',
      symbol: 'circle',
      symbolSize: 0,
      yAxisIndex: 0,
      data: [...storagePlanRaw],
      rawData: storagePlanRaw,
      tableUnit: '(kW)'
    },
    {
      name: '储能实际控制指令',
      type: 'line',
      symbol: 'circle',
      symbolSize: 0,
      yAxisIndex: 0,
      data: [...storageCmdRaw],
      rawData: storageCmdRaw,
      tableUnit: '(kW)'
    },
    {
      name: '储能SOC',
      type: 'line',
      symbol: 'circle',
      symbolSize: 0,
      yAxisIndex: 1,
      data: [...socRaw],
      rawData: socRaw,
      tableUnit: '(%)'
    },
  ],
})

// 电价信息：单 Y 轴 元/kWh (0~25)
const chartOptions2 = ref({
  title: '电价信息',
  timeList,
  showTable: true,
  boundaryGap: false,
  tooltipShow: false,
  tooltipTrigger: 'axis',
  yName: '元/kWh',
  group: 'storage-monitor',
  color: ['#ee6666', '#5470c6'],
  series: [
    {
      name: '预测下网电价',
      type: 'line',
      symbol: 'none',
      data: [0.8, 0.7, 0.6, 0.5, 0.5, 0.6, 0.8, 1.0, 1.2, 1.3, 1.4, 1.3, 1.2, 0.88, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.5, 1.3, 1.0],
      tableUnit: '(元/kWh)'
    },
    {
      name: '实际下网电价',
      type: 'line',
      symbol: 'none',
      data: [0.75, 0.68, 0.58, 0.52, 0.52, 0.62, 0.82, 1.02, 1.22, 1.28, 1.38, 1.32, 1.22, 0.91, 0.98, 1.12, 1.22, 1.28, 1.38, 1.48, 1.58, 1.48, 1.28, 0.98],
      tableUnit: '(元/kWh)'
    },
  ],
  yMin: 0,
  yMax: 25,
})

// 第三个图：单 Y 轴 - 光伏实时功率、光伏实时预测功率
const chartOptions3 = ref({
  title: '光伏功率',
  timeList,
  showTable: true,
  boundaryGap: false,
  tooltipShow: false,
  tooltipTrigger: 'axis',
  yName: 'kW',
  group: 'storage-monitor',
  color: ['#ee6666', '#5470c6'],
  series: [
    {
      name: '光伏实时功率',
      type: 'line',
      symbol: 'none',
      data: [0, 0, 0, 0, 5, 8, 12, 18, 25, 30, 35, 38, 39.65, 40, 38, 35, 32, 28, 22, 18, 12, 8, 5, 0],
      tableUnit: '(kW)'
    },
    {
      name: '光伏实时预测功率',
      type: 'line',
      symbol: 'none',
      data: [0, 0, 0, 0, 6, 9, 13, 19, 26, 31, 36, 39, 40.33, 41, 39, 36, 33, 29, 23, 19, 13, 9, 6, 0],
      tableUnit: '(kW)'
    },
  ],
})

// 第四个图：单 Y 轴 - 负荷实时功率、负荷控制指令、负荷实时预测功率
const chartOptions4 = ref({
  title: '负荷功率',
  timeList,
  showTable: true,
  boundaryGap: false,
  tooltipShow: false,
  tooltipTrigger: 'axis',
  yName: 'kW',
  group: 'storage-monitor',
  color: ['#ee6666', '#91cc75', '#5470c6'],
  series: [
    {
      name: '负荷实时功率',
      type: 'line',
      symbol: 'none',
      data: [30, 32, 35, 38, 40, 38, 35, 39.65, 40, 42, 45, 48, 50, 48, 45, 42, 40, 38, 35, 32, 30, 28, 26, 25],
      tableUnit: '(kW)'
    },
    {
      name: '负荷控制指令',
      type: 'line',
      symbol: 'none',
      data: [28, 30, 33, 36, 38, 36, 33, 38, 39, 41, 44, 47, 49, 47, 44, 41, 39, 37, 34, 31, 29, 27, 25, 24],
      tableUnit: '(kW)'
    },
    {
      name: '负荷实时预测功率',
      type: 'line',
      symbol: 'none',
      data: [31, 33, 36, 39, 41, 39, 36, 40.33, 41, 43, 46, 49, 51, 49, 46, 43, 41, 39, 36, 33, 31, 29, 27, 26],
      tableUnit: '(kW)'
    },
  ],
})

const linkedChartsRef = ref(null)

// 多图联动：一次传入所有图表配置与标题
const chartOptionsList = computed(() => [
  chartOptions1.value,
  chartOptions2.value,
  chartOptions3.value,
  chartOptions4.value
])
const chartTitles = ['储能运行监测', '电价信息', '光伏功率', '负荷功率']

// 联动图表统一 tooltip
const unifiedTooltipVisible = ref(false)
const unifiedTooltipContent = ref('')
const unifiedTooltipStyle = ref({ left: '0px', top: '0px' })
const unifiedTooltipOffset = 16
let axisPointerHandlers = []
/** 当前联动的图表实例，用于读取图例选中状态，使 tooltip 与图中显示/隐藏一致 */
const chartInstancesRef = ref([])

// 统一 tooltip 中各项顺序及颜色（与四个图图例一致）
const tooltipSeriesOrder = [
  { name: '储能实时功率', chartIndex: 0, seriesIndex: 0, unit: 'kW', color: '#5470c6' },
  { name: '储能日内调度计划', chartIndex: 0, seriesIndex: 1, unit: 'kW', color: '#fa8c16' },
  { name: '储能实际控制指令', chartIndex: 0, seriesIndex: 2, unit: 'kW', color: '#9254de' },
  { name: '储能SOC', chartIndex: 0, seriesIndex: 3, unit: '%', color: '#52c41a' },
  { name: '预测下网电价', chartIndex: 1, seriesIndex: 0, unit: '元/kWh', color: '#ee6666' },
  { name: '实际下网电价', chartIndex: 1, seriesIndex: 1, unit: '元/kWh', color: '#5470c6' },
  { name: '光伏实时功率', chartIndex: 2, seriesIndex: 0, unit: 'kW', color: '#ee6666' },
  { name: '光伏实时预测功率', chartIndex: 2, seriesIndex: 1, unit: 'kW', color: '#5470c6' },
  { name: '负荷实时功率', chartIndex: 3, seriesIndex: 0, unit: 'kW', color: '#ee6666' },
  { name: '负荷控制指令', chartIndex: 3, seriesIndex: 1, unit: 'kW', color: '#91cc75' },
  { name: '负荷实时预测功率', chartIndex: 3, seriesIndex: 2, unit: 'kW', color: '#5470c6' },
]

/** 从图表实例获取图例选中状态：seriesName 是否当前为显示（未在图例中关闭） */
function isSeriesSelected(chart, seriesName) {
  if (!chart || chart.isDisposed()) return true
  try {
    const opt = chart.getOption()
    const legend = opt?.legend
    if (!legend || !legend.length) return true
    const selected = legend[0]?.selected
    if (selected == null) return true
    return selected[seriesName] !== false
  } catch (_) {
    return true
  }
}

/** hoveredChartIndex: 当前鼠标所在的图下标，该图对应的 series 会排在 tooltip 最上方 */
function buildUnifiedTooltipContent(axisValue, dataIndex, chartOpts, chartInstances = [], hoveredChartIndex = 0) {
  const textColor = '#333'
  let html = `<div style="padding: 12px 16px; min-width: 200px;">`
  html += `<div style="margin-bottom: 10px; font-size: 14px; color: ${textColor}; font-weight: 500;">${axisValue}</div>`

  // 当前悬停的图排在前面，其余按原顺序
  const ordered = [
    ...tooltipSeriesOrder.filter((item) => item.chartIndex === hoveredChartIndex),
    ...tooltipSeriesOrder.filter((item) => item.chartIndex !== hoveredChartIndex)
  ]
  let lastRenderedChartIndex = -1
  ordered.forEach((item) => {
    const chart = chartInstances[item.chartIndex]
    if (chart && !isSeriesSelected(chart, item.name)) return
    // 不同图之间加间距
    if (lastRenderedChartIndex >= 0 && item.chartIndex !== lastRenderedChartIndex) {
      html += `<div style="height: 10px; margin: 4px 0;"></div>`
    }
    lastRenderedChartIndex = item.chartIndex
    let value = '--'
    const opt = chartOpts[item.chartIndex]
    const s = opt?.series?.[item.seriesIndex]
    if (s) {
      const raw = (s.rawData && s.rawData[dataIndex]) ?? (s.data && s.data[dataIndex])
      value = raw != null ? raw : '--'
    }
    const displayValue = value === '--' ? value : (item.unit ? `${value}${item.unit}` : value)
    const marker = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:8px;background-color:${item.color};vertical-align:middle;"></span>`
    html += `<div style="margin: 6px 0; display: flex; align-items: center; justify-content: space-between; gap: 24px;">
      ${marker}
      <span style="color: ${textColor}; font-size: 13px; flex: 1;">${item.name}</span>
      <span style="color: ${textColor}; font-size: 13px; margin-left: auto; white-space: nowrap;">${displayValue}</span>
    </div>`
  })
  html += `</div>`
  return html
}

function showUnifiedTooltip(event, axisValue, dataIndex, hoveredChartIndex = 0) {
  const instances = chartInstancesRef.value ?? []
  unifiedTooltipContent.value = buildUnifiedTooltipContent(axisValue, dataIndex, chartOptionsList.value, instances, hoveredChartIndex)
  const ev = event.event || event
  const clientX = ev.clientX != null ? ev.clientX : ev.x
  const clientY = ev.clientY != null ? ev.clientY : ev.y
  unifiedTooltipStyle.value = {
    left: `${(clientX || 0) + unifiedTooltipOffset}px`,
    top: `${(clientY || 0) + unifiedTooltipOffset}px`,
    position: 'fixed',
    zIndex: 10000,
    pointerEvents: 'none'
  }
  unifiedTooltipVisible.value = true
}

function hideUnifiedTooltip() {
  unifiedTooltipVisible.value = false
}

const handleDateChange = (value) => {
  console.log('当前时间:', value, selectedDate.value)
}

const connectCharts = (instancesFromEvent) => {
  const raw = instancesFromEvent ?? linkedChartsRef.value?.myCharts?.value
  const instances = Array.isArray(raw) ? raw : (raw ? [raw] : [])
  if (!instances.length) return

  chartInstancesRef.value = instances

  nextTick(() => {
    echarts.connect(instances)

    axisPointerHandlers.forEach(({ zr, onMove, onOut }) => {
      if (zr) {
        zr.off('mousemove', onMove)
        zr.off('globalout', onOut)
      }
    })
    axisPointerHandlers = []

    const chartOpts = chartOptionsList.value
    const timeData = chartOpts[0]?.timeList || timeList
    const len = timeData ? timeData.length : 0

    instances.forEach((chart, chartIndex) => {
        const zr = chart.getZr()
        if (!zr) return

        const onMousemove = (zrEvent) => {
          const point = [zrEvent.offsetX, zrEvent.offsetY]
          let dataIndex = -1
          try {
            const result = chart.convertFromPixel('grid', point)
            if (result != null && result.length >= 1) {
              const raw = result[0]
              dataIndex = typeof raw === 'number' ? Math.round(raw) : timeData.indexOf(raw)
              if (dataIndex < 0 && typeof raw === 'string') dataIndex = timeData.indexOf(raw)
            }
          } catch (_) {
            dataIndex = -1
          }
          if (dataIndex < 0 || dataIndex >= len) {
            hideUnifiedTooltip()
            return
          }
          const axisValue = timeData[dataIndex] ?? dataIndex
          const ev = zrEvent.event || zrEvent
          showUnifiedTooltip(ev, axisValue, dataIndex, chartIndex)
        }

        const onGlobalOut = () => {
          hideUnifiedTooltip()
        }

        zr.on('mousemove', onMousemove)
        zr.on('globalout', onGlobalOut)
        axisPointerHandlers.push({
          zr,
          onMove: onMousemove,
          onOut: onGlobalOut
        })
    })
  })
}

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      connectCharts()
    }, 300)
  })
})

onUnmounted(() => {
  axisPointerHandlers.forEach(({ zr, onMove, onOut }) => {
    if (zr) {
      zr.off('mousemove', onMove)
      zr.off('globalout', onOut)
    }
  })
  axisPointerHandlers = []
  echarts.disconnect()
})
</script>

<style scoped lang="scss">
.link-charts-demo {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.demo-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.charts-container {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.date-picker-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-label {
  font-size: 14px;
  color: #606266;
}

.unified-tooltip {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
