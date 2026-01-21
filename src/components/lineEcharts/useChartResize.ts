import { onMounted, onUnmounted, type Ref } from 'vue'
import type * as eCharts from 'echarts'

export function useChartResize(
    chartInstance: Ref<eCharts.ECharts | null>,
    domRef: Ref<HTMLElement | undefined>
) {
    let observer: ResizeObserver | null = null

    const resize = () => {
        if (chartInstance.value && !chartInstance.value.isDisposed()) {
            chartInstance.value.resize()
        } else {
            // console.warn('⚠️ 图表 resize 失败：图表实例不存在或已销毁')
        }
    }

    onMounted(() => {
        if (domRef.value) {
            observer = new ResizeObserver(() => {
                requestAnimationFrame(() => {
                    resize()
                })
            })
            observer.observe(domRef.value)
        }
        window.addEventListener('resize', resize)
    })

    onUnmounted(() => {
        if (observer) {
            observer.disconnect()
            observer = null
        }
        window.removeEventListener('resize', resize)
    })

    return { resize }
}
