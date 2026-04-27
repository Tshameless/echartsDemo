import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
  type ComponentPublicInstance,
  type ComputedRef,
} from 'vue'
import * as eCharts from 'echarts'
import { debounce } from 'lodash-es'
import type { ChartOptions } from '@/components/Echarts/types'
import type { LinkedEchartsReadyPayload } from './types'
import { useLinkedChartOption } from './useLinkedChartOption'
import { useLinkedChartTooltip } from './useLinkedChartTooltip'

const UPDATE_DEBOUNCE_MS = 50

interface UseLinkedChartRuntimeOptions {
  chartList: ComputedRef<ChartOptions[]>
  getGroupId: () => string
  isUnifiedTooltipEnabled: () => boolean
  onChartReady: (payload: LinkedEchartsReadyPayload) => void
}

export function useLinkedChartRuntime({
  chartList,
  getGroupId,
  isUnifiedTooltipEnabled,
  onChartReady,
}: UseLinkedChartRuntimeOptions) {
  const containerRef = ref<HTMLDivElement | null>(null)
  const boxRefs = ref<HTMLDivElement[]>([])
  const myCharts = shallowRef<(eCharts.ECharts | null)[]>([])

  const { updateChartOption, bindLegendSelectChanged } = useLinkedChartOption()
  const {
    bindUnifiedTooltipEvents,
    cleanupUnifiedTooltipEvents,
    unifiedTooltipRef,
    unifiedTooltipData,
    unifiedTooltipStyle,
    unifiedTooltipVisible,
  } = useLinkedChartTooltip({ chartList, isUnifiedTooltipEnabled, myCharts })

  let resizeRaf: number | null = null
  let resizeObserver: ResizeObserver | null = null
  let connectedGroupId: string | null = null



  function cleanupLinkedEcharts() {
    if (connectedGroupId) {
      eCharts.disconnect(connectedGroupId)
      connectedGroupId = null
    }
    const groupId = getGroupId()
    if (groupId) eCharts.disconnect(groupId)
  }

  function disposeCharts() {
    myCharts.value.forEach((chart) => {
      if (chart && !chart.isDisposed()) {
        chart.off('legendselectchanged')
        chart.dispose()
      }
    })
    myCharts.value = []
  }

  function cleanup() {
    if (resizeRaf !== null) cancelAnimationFrame(resizeRaf)
    if (resizeObserver) resizeObserver.disconnect()
    cleanupUnifiedTooltipEvents()
    cleanupLinkedEcharts()
    disposeCharts()
  }

  const handleResize = () => {
    if (resizeRaf !== null) cancelAnimationFrame(resizeRaf)
    resizeRaf = requestAnimationFrame(() => {
      myCharts.value.forEach((chart) => chart?.resize({ animation: { duration: 0 } }))
      resizeRaf = null
    })
  }

  function setupCharts() {
    const list = chartList.value
    if (!list.length) {
      cleanup()
      return
    }

    const instances: (eCharts.ECharts | null)[] = []
    const groupId = getGroupId()
    const unified = isUnifiedTooltipEnabled()

    list.forEach((item, index) => {
      const el = boxRefs.value[index]
      if (!el) {
        instances.push(null)
        return
      }

      let chart = myCharts.value[index]
      if (!chart || chart.isDisposed()) {
        chart = eCharts.init(el)
      }

      ;(chart as any).group = groupId
      instances[index] = chart

      const finalOpt = unified ? { ...item, tooltipShow: false } : item
      updateChartOption(finalOpt, chart)

      chart.off('legendselectchanged')
      if (item.xAlignValue) bindLegendSelectChanged(chart, () => chartList.value[index])
    })

    // 清理多余图表
    if (myCharts.value.length > list.length) {
      myCharts.value.slice(list.length).forEach((c) => c?.dispose())
    }

    myCharts.value = instances

    if (unified) nextTick(bindUnifiedTooltipEvents)
    else cleanupUnifiedTooltipEvents()

    cleanupLinkedEcharts()
    const valid = instances.filter(Boolean) as eCharts.ECharts[]
    if (valid.length > 1) {
      if (groupId) eCharts.connect(groupId)
      else connectedGroupId = eCharts.connect(valid)
    }

    if (containerRef.value && !resizeObserver) {
      resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(containerRef.value, { box: 'border-box' })
    }
  }

  const debouncedUpdate = debounce(() => {
    const list = chartList.value
    if (!list.length) return cleanup()

    // 如果图表数量发生变化，需要重新初始化或清理
    if (myCharts.value.length !== list.length) {
      return setupCharts()
    }

    const unified = isUnifiedTooltipEnabled()
    list.forEach((item, index) => {
      const chart = myCharts.value[index]
      if (!chart || chart.isDisposed()) return
      
      const finalOpt = unified ? { ...item, tooltipShow: false } : item
      // 使用合并更新（incremental update），除非明确需要完整重绘
      updateChartOption(finalOpt, chart, false)
    })

    if (unified) bindUnifiedTooltipEvents()
    else cleanupUnifiedTooltipEvents()

    handleResize()
  }, UPDATE_DEBOUNCE_MS)

  onMounted(() => {
    if (chartList.value.length) {
      nextTick(() => {
        requestAnimationFrame(() => {
          setupCharts()
          const valid = myCharts.value.filter(Boolean) as eCharts.ECharts[]
          if (valid.length) onChartReady(valid.length === 1 ? valid[0] : valid)
        })
      })
    }
  })

  onUnmounted(() => {
    debouncedUpdate.cancel()
    cleanup()
  })

  // 监听配置变化：只有在配置项引用变化或深度变化时触发
  // 保持 deep: true 但由于使用了 incremental update，性能损耗会显著降低
  watch(chartList, () => debouncedUpdate(), { deep: true })

  // 监听模式变化
  watch(() => [getGroupId(), isUnifiedTooltipEnabled()], () => {
    if (chartList.value.length) nextTick(setupCharts)
  })

  return {
    exposedMyChart: computed(() => myCharts.value[0] ?? null),
    exposedMyCharts: computed(() => myCharts.value.filter(Boolean) as eCharts.ECharts[]),
    boxRefs,
    containerRef,
    resizeHandler: handleResize,
    unifiedTooltipRef,
    unifiedTooltipData,
    unifiedTooltipStyle,
    unifiedTooltipVisible,
  }
}

