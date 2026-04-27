<template>
  <div 
    ref="chartDomRef" 
    class="chart-box" 
    :style="boxStyle"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, shallowRef, computed } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { useChartResize } from '../useChartResize'

const props = defineProps<{
  option: EChartsOption
  height: number | string
}>()

const chartDomRef = ref<HTMLDivElement>()
const chartInstance = shallowRef<echarts.ECharts | null>(null)

// 计算容器样式
const boxStyle = computed(() => {
  const h = typeof props.height === 'number' ? `${props.height}px` : props.height
  return {
    height: h,
    maxHeight: h,
    width: '100%'
  }
})

const emit = defineEmits<{
  (e: 'legendSelectChanged', params: any): void
}>()

// 监听并执行 Resize
const { resize } = useChartResize(chartInstance, chartDomRef)

const initChart = () => {
  if (!chartDomRef.value) return
  
  // 初始化实例
  chartInstance.value = echarts.init(chartDomRef.value)
  
  // 首次渲染
  chartInstance.value.setOption(props.option, { notMerge: true })

  // 暴露 ECharts 事件
  chartInstance.value.on('legendselectchanged', (params: any) => {
    emit('legendSelectChanged', params)
  })
}

// 监听配置变化
watch(() => props.option, (newOpt) => {
  if (chartInstance.value) {
    chartInstance.value.setOption(newOpt, { notMerge: true })
  }
}, { deep: true })

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
})

// 暴露 API
defineExpose({
  getInstance: () => chartInstance.value,
  resize
})
</script>

<style scoped>
.chart-box {
  width: 100%;
}
</style>
