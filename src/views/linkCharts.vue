<template>
  <div class="link-charts-demo">
    <div class="demo-title">LinkedCharts 多图联动演示</div>

    <div class="charts-container">
      <LinkedCharts
        ref="linkedChartsRef"
        v-if="chartOptionsList.length > 0"
        v-model:show-chart-view="showChartView"
        :opts="chartOptionsList"
        :titles="chartTitles"
        :height="250"
        :table-max-height="500"
        group-id="storage-monitor"
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import LinkedCharts from '@/components/LinkedCharts/index.vue'

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

const handleDateChange = (value) => {
  console.log('当前时间:', value, selectedDate.value)
}
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
</style>
