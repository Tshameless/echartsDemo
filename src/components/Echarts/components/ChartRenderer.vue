<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef, useTemplateRef, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { useChartResize } from '../useChartResize'

const props = defineProps<{
  option: EChartsOption
  height: number | string
}>()

const emit = defineEmits<{
  (event: 'chart-ready', payload: echarts.ECharts): void
  (event: 'legend-select-changed', params: any): void
}>()

const chartDomRef = useTemplateRef<HTMLDivElement>('chartDom')
const chartInstance = shallowRef<echarts.ECharts | null>(null)

const boxStyle = computed(() => {
  const height = typeof props.height === 'number' ? `${props.height}px` : props.height
  return {
    height,
    maxHeight: height,
    width: '100%',
  }
})

const { resize } = useChartResize(chartInstance, chartDomRef)

function bindChartEvents(instance: echarts.ECharts) {
  instance.off('legendselectchanged')
  instance.on('legendselectchanged', (params: any) => {
    emit('legend-select-changed', params)
  })

  instance.off('datazoom')
  instance.on('datazoom', () => {
    instance.dispatchAction({ type: 'downplay' })
    instance.dispatchAction({ type: 'hideTip' })
  })
}

function initChart() {
  const dom = chartDomRef.value
  if (!dom) return

  const existed = echarts.getInstanceByDom(dom)
  chartInstance.value = existed ?? echarts.init(dom)
  chartInstance.value.setOption(props.option, { notMerge: true })
  bindChartEvents(chartInstance.value)
  emit('chart-ready', chartInstance.value)
}

watch(
  () => props.option,
  (newOption) => {
    if (!chartInstance.value || chartInstance.value.isDisposed()) return

    const updateOption = { ...newOption }
    const currentOption = chartInstance.value.getOption() as any

    if (currentOption?.dataZoom && Array.isArray(updateOption.dataZoom)) {
      updateOption.dataZoom = updateOption.dataZoom.map((item: any, index: number) => {
        const current = currentOption.dataZoom[index]
        if (!current) return item
        return {
          ...item,
          start: current.start,
          end: current.end,
          startValue: current.startValue,
          endValue: current.endValue,
        }
      })
    }

    chartInstance.value.setOption(updateOption, { notMerge: true })
  },
  { deep: true }
)

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (!chartInstance.value) return
  chartInstance.value.dispose()
  chartInstance.value = null
})

defineExpose({
  getInstance: () => chartInstance.value,
  resize,
})
</script>

<template>
  <div ref="chartDom" class="chart-box" :style="boxStyle"></div>
</template>

<style scoped>
.chart-box {
  width: 100%;
}
</style>
