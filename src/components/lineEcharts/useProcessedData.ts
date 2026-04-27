import { computed, type Ref } from 'vue'
import type { ChartOptions } from './types'
import { calculateCompensateValue } from './utils'

/**
 * 专门处理数据补点逻辑的 Hook
 * 优化点：使用 computed 派生状态，保证数据流单向，消除竞态导致的数据被覆盖及深拷贝隐患
 */
export function useProcessedData(opt: Ref<ChartOptions>) {
    
    const processedOpt = computed<ChartOptions>(() => {
        const currentOpt = opt.value
        
        // 如果没有补点需求，直接返回原始配置（0性能损耗）
        if (!currentOpt.compensateType || !currentOpt.timeList) {
            return currentOpt
        }

        // 仅对需要补点的数据进行浅拷贝隔离，防止污染原始数据
        const processed: ChartOptions = { 
            ...currentOpt,
            timeList: [...currentOpt.timeList],
            series: currentOpt.series?.map(item => ({
                ...item,
                data: [...item.data]
            }))
        }

        const { compensateType, timeList, series } = processed
        
        // 执行纯粹的补点逻辑
        if (timeList && series) {
            if (compensateType === 'end') {
                const nextTime = calculateCompensateValue('end', timeList)
                if (nextTime !== undefined) {
                    timeList.push(nextTime)
                    series.forEach(item => item.data.push(null))
                }
            } else if (compensateType === 'start') {
                const previousTime = calculateCompensateValue('start', timeList)
                if (previousTime !== undefined) {
                    timeList.unshift(previousTime)
                    series.forEach(item => item.data.unshift(null))
                }
            }
        }

        return processed
    })

    return {
        processedOpt
    }
}
