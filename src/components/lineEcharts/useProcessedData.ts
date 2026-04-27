import { computed, type Ref } from 'vue'
import type { ChartOptions } from './types'
import { calculateCompensateValue } from './utils'

/**
 * 专门处理数据补点逻辑的 Hook
 */
export function useProcessedData(opt: Ref<ChartOptions>) {
    
    const processedOpt = computed(() => {
        const currentOpt = opt.value
        
        // 如果没有补点需求，直接返回原始配置
        if (!currentOpt.compensateType || !currentOpt.timeList) {
            return currentOpt
        }

        // 浅拷贝配置对象，并对关键数组进行深拷贝，避免污染原始 props
        const processed: ChartOptions = { ...currentOpt }
        
        if (processed.timeList) {
            processed.timeList = [...processed.timeList]
        }
        
        if (processed.series) {
            processed.series = processed.series.map(item => ({
                ...item,
                data: [...item.data]
            }))
        }

        // 执行补点逻辑
        const { compensateType, timeList, series } = processed
        
        if (compensateType === 'end') {
            const nextTime = calculateCompensateValue('end', timeList)
            if (nextTime !== undefined) {
                timeList.push(nextTime)
                series?.forEach(item => item.data.push(null))
            }
        } else if (compensateType === 'start') {
            const previousTime = calculateCompensateValue('start', timeList)
            if (previousTime !== undefined) {
                timeList.unshift(previousTime)
                series?.forEach(item => item.data.unshift(null))
            }
        }

        return processed
    })

    return {
        processedOpt
    }
}
