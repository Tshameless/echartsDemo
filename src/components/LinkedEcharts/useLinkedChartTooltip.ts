import {
  nextTick,
  ref,
  shallowRef,
  type ComponentPublicInstance,
  type ComputedRef,
  type ShallowRef,
} from 'vue'
import * as eCharts from 'echarts'
import type { ChartOptions, ChartSeriesData } from '@/components/Echarts/types'

import { DEFAULT_CHART_COLORS } from './useLinkedChartOption'

import type {
  UnifiedTooltipData,
  UnifiedTooltipRow,
} from './types'

const TOOLTIP_OFFSET = 16

interface AxisPointerHandler {
  zr: any
  onMove: (e: any) => void
  onOut: () => void
}

interface UseLinkedChartTooltipOptions {
  chartList: ComputedRef<ChartOptions[]>
  isUnifiedTooltipEnabled: () => boolean
  myCharts: ShallowRef<(eCharts.ECharts | null)[]>
}

/** 判断系列是否被选中（图例状态） */
function isSeriesActive(chart: eCharts.ECharts, name: string): boolean {
  if (!chart || chart.isDisposed()) return true
  try {
    const legend = (chart.getOption() as any).legend?.[0]
    return legend?.selected ? legend.selected[name] !== false : true
  } catch {
    return true
  }
}

/** 获取系列单位 */
function getUnit(series: ChartSeriesData, opt: ChartOptions): string {
  if (series.tableUnit) return String(series.tableUnit).replace(/^\(|\)$/g, '')
  const yName = opt.yName ?? ''
  return yName.includes('：') ? yName.split('：')[1] || '' : yName
}

export function useLinkedChartTooltip({
  chartList,
  isUnifiedTooltipEnabled,
  myCharts,
}: UseLinkedChartTooltipOptions) {
  const unifiedTooltipVisible = shallowRef(false)
  const unifiedTooltipData = shallowRef<UnifiedTooltipData | null>(null)
  const unifiedTooltipStyle = ref<Record<string, string>>({ left: '0px', top: '0px' })
  const tooltipRef = ref<HTMLElement | null>(null)

  let handlers: AxisPointerHandler[] = []



  /** 构建工具提示数据 */
  function buildData(axisValue: string, dataIndex: number, hoveredIndex: number): UnifiedTooltipData {
    const charts = chartList.value
    const order = [hoveredIndex, ...charts.map((_, i) => i).filter((i) => i !== hoveredIndex)]
    
    const sections: UnifiedTooltipData['sections'] = []

    order.forEach((idx) => {
      const chart = myCharts.value[idx]
      const opt = charts[idx]
      if (!chart || !opt?.series) return

      const rows: UnifiedTooltipRow[] = []
      const colors = Array.isArray(opt.color) && opt.color.length ? opt.color : DEFAULT_CHART_COLORS

      opt.series.forEach((s, sIdx) => {
        if (!isSeriesActive(chart, s.name)) return

        const raw = s.data?.[dataIndex]
        const val = typeof raw === 'object' && raw !== null && 'value' in raw ? raw.value : (raw ?? '--')
        const unit = getUnit(s, opt)
        const color = colors[sIdx % colors.length]

        rows.push({
          name: s.name,
          value: val,
          color,
          unit: val === '--' ? '' : unit,
        })
      })

      if (rows.length > 0) {
        sections.push({
          chartTitle: opt.title,
          rows,
        })
      }
    })

    return {
      title: axisValue,
      sections,
    }
  }

  /** 更新提示框位置 */
  const updatePosition = (clientX: number, clientY: number) => {
    let left = clientX + TOOLTIP_OFFSET
    let top = clientY + TOOLTIP_OFFSET

    const el = tooltipRef.value
    if (el) {
      const rect = el.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const gap = 8

      if (left + rect.width + gap > vw) left = clientX - rect.width - TOOLTIP_OFFSET
      if (left < gap) left = gap
      if (top + rect.height + gap > vh) top = clientY - rect.height - TOOLTIP_OFFSET
      if (top < gap) top = gap
    }

    unifiedTooltipStyle.value = {
      left: `${left}px`,
      top: `${top}px`,
      position: 'fixed',
      zIndex: '10000',
      pointerEvents: 'none',
    }
  }

  function showTooltip(e: MouseEvent, axisValue: string, dataIndex: number, hoveredIdx: number) {
    unifiedTooltipData.value = buildData(axisValue, dataIndex, hoveredIdx)
    updatePosition(e.clientX, e.clientY)
    unifiedTooltipVisible.value = true
    nextTick(() => updatePosition(e.clientX, e.clientY))
  }

  function hideTooltip() {
    unifiedTooltipVisible.value = false
  }

  function cleanupUnifiedTooltipEvents() {
    handlers.forEach(({ zr, onMove, onOut }) => {
      zr?.off('mousemove', onMove)
      zr?.off('globalout', onOut)
    })
    handlers = []
    hideTooltip()
  }

  function bindUnifiedTooltipEvents() {
    cleanupUnifiedTooltipEvents()
    if (!isUnifiedTooltipEnabled() || !chartList.value.length) return

    const timeData = chartList.value[0]?.timeList || []
    const len = timeData.length

    myCharts.value.forEach((chart, idx) => {
      const zr = chart?.getZr()
      if (!zr) return

      const onMove = (e: any) => {
        let dataIndex = -1
        try {
          const res = chart!.convertFromPixel('grid', [e.offsetX, e.offsetY])
          if (res?.length) {
            const raw = res[0]
            dataIndex = typeof raw === 'number' ? Math.round(raw) : timeData.indexOf(raw)
          }
        } catch {
          dataIndex = -1
        }

        if (dataIndex < 0 || dataIndex >= len) {
          hideTooltip()
        } else {
          showTooltip(e.event || e, String(timeData[dataIndex]), dataIndex, idx)
        }
      }

      zr.on('mousemove', onMove)
      zr.on('globalout', hideTooltip)
      handlers.push({ zr, onMove, onOut: hideTooltip })
    })
  }

  return {
    bindUnifiedTooltipEvents,
    cleanupUnifiedTooltipEvents,
    unifiedTooltipRef: tooltipRef,
    unifiedTooltipData,
    unifiedTooltipStyle,
    unifiedTooltipVisible,
  }
}

