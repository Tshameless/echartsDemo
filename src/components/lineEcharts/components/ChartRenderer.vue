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
    const updateOpt = { ...newOpt }
    
    // 提取当前的 dataZoom 状态，防止重新计算 Option 时重置缩放
    const currentOption = chartInstance.value.getOption() as any
    if (currentOption && currentOption.dataZoom && Array.isArray(updateOpt.dataZoom)) {
      updateOpt.dataZoom = updateOpt.dataZoom.map((dz: any, index: number) => {
        const currentDz = currentOption.dataZoom[index]
        if (currentDz) {
          return {
            ...dz,
            start: currentDz.start,
            end: currentDz.end,
            startValue: currentDz.startValue,
            endValue: currentDz.endValue
          }
        }
        return dz
      })
    }

    chartInstance.value.setOption(updateOpt, { notMerge: true })
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
