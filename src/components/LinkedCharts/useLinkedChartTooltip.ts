import {
  nextTick,
  ref,
  shallowRef,
  type ComponentPublicInstance,
  type ComputedRef,
  type ShallowRef,
} from 'vue'
import * as eCharts from 'echarts'
import type { ChartOptions, ChartSeriesData } from '@/components/lineEcharts/types'
import { escapeHtml } from '@/components/lineEcharts/utils'
import { DEFAULT_CHART_COLORS } from './useLinkedChartOption'

const TOOLTIP_OFFSET = 16

const STYLES = {
  wrap: 'padding: 12px 16px; min-width: 200px;',
  title: 'margin-bottom: 10px; font-size: 14px; color: #333; font-weight: 500;',
  divider: 'height: 1px; margin: 8px 0; background: rgba(0,0,0,0.05);',
  row: 'margin: 6px 0; display: flex; align-items: center; justify-content: space-between; gap: 24px;',
  text: 'color: #333; font-size: 13px;',
  marker: 'display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:8px;vertical-align:middle;',
} as const

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

/** 渲染单行数据 */
function renderRow(name: string, value: string, color: string): string {
  const marker = `<span style="${STYLES.marker}background-color:${escapeHtml(color)};"></span>`
  return `<div style="${STYLES.row}">${marker}<span style="${STYLES.text}; flex: 1;">${escapeHtml(name)}</span><span style="${STYLES.text}; margin-left: auto; white-space: nowrap;">${escapeHtml(value)}</span></div>`
}

export function useLinkedChartTooltip({
  chartList,
  isUnifiedTooltipEnabled,
  myCharts,
}: UseLinkedChartTooltipOptions) {
  const unifiedTooltipVisible = shallowRef(false)
  const unifiedTooltipContent = shallowRef('')
  const unifiedTooltipStyle = ref<Record<string, string>>({ left: '0px', top: '0px' })
  const tooltipRef = ref<HTMLElement | null>(null)

  let handlers: AxisPointerHandler[] = []

  function setUnifiedTooltipRef(el: Element | ComponentPublicInstance | null) {
    tooltipRef.value = el instanceof HTMLElement ? el : null
  }

  /** 构建工具提示 HTML */
  function buildHtml(axisValue: string, dataIndex: number, hoveredIndex: number): string {
    const charts = chartList.value
    const order = [hoveredIndex, ...charts.map((_, i) => i).filter((i) => i !== hoveredIndex)]
    const rows: string[] = []

    order.forEach((idx, i) => {
      const chart = myCharts.value[idx]
      const opt = charts[idx]
      if (!chart || !opt?.series) return

      if (i > 0) rows.push(`<div style="${STYLES.divider}"></div>`)

      const colors = Array.isArray(opt.color) && opt.color.length ? opt.color : DEFAULT_CHART_COLORS

      opt.series.forEach((s, sIdx) => {
        if (!isSeriesActive(chart, s.name)) return

        const raw = s.data?.[dataIndex]
        const val = typeof raw === 'object' && raw !== null && 'value' in raw ? raw.value : (raw ?? '--')
        const unit = getUnit(s, opt)
        const display = val === '--' ? val : (unit ? `${val}${unit}` : val)
        const color = colors[sIdx % colors.length]

        rows.push(renderRow(s.name, String(display), color))
      })
    })

    return `<div style="${STYLES.wrap}"><div style="${STYLES.title}">${escapeHtml(axisValue)}</div>${rows.join('')}</div>`
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
    unifiedTooltipContent.value = buildHtml(axisValue, dataIndex, hoveredIdx)
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
    setUnifiedTooltipRef,
    unifiedTooltipContent,
    unifiedTooltipStyle,
    unifiedTooltipVisible,
  }
}

