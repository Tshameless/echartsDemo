import { ref, computed, type Ref } from 'vue'
import type { ChartOptions, TableColumn } from './types'

/**
 * 专门处理表格逻辑的 Hook
 * 优化点：废除冗余的 ref/watch 与手动刷新机制，使用 computed 惰性派生状态
 */
export function useChartTable(opt: Ref<ChartOptions>) {
    // 视图切换状态（图表 / 表格），由内部组件 v-model 驱动，因此保留 ref
    const isChartView = ref(true)

    // 是否显示图表/表格切换开关
    const showTable = computed(() => {
        return opt.value.showTable !== undefined ? opt.value.showTable : false
    })

    // 派生表头配置
    const tableHeader = computed<TableColumn[]>(() => {
        const item = opt.value
        
        const header: TableColumn[] = [{
            title: item.title || '时间',
            key: 'timeList',
        }]

        item.series?.forEach(({ name, tableUnit }) => {
            const updatedName = tableUnit ? `${name}${tableUnit}` : name
            header.push({
                title: updatedName,
                key: name,
            })
        })

        return header
    })

    // 派生表格数据
    const tableData = computed<Array<Record<string, any>>>(() => {
        const item = opt.value
        
        // 构建时间列基础数据
        const data = item.timeList?.map(time => ({ timeList: time })) || []

        // 填充各个系列的值
        item.series?.forEach(({ name, data: seriesData }) => {
            seriesData.forEach((val, idx) => {
                if (data[idx]) {
                    data[idx][name] = val
                }
            })
        })

        // 处理首尾点删除逻辑
        if (item.deleteLastPoint) {
            data.pop()
        } else if (item.deleteFirstPoint) {
            data.shift()
        }
        
        return data
    })

    return {
        showTable,
        tableData,
        tableHeader,
        isChartView
    }
}
