import { ref, watch, type Ref, watchEffect } from 'vue'
import type { ChartOptions, TableColumn } from './types'

/**
 * 专门处理表格逻辑的 Hook
 * 优化点：直接接收配置引用，自动同步显示状态并按需计算数据
 */
export function useChartTable(opt: Ref<ChartOptions>) {
    // 内部状态
    const showTable = ref(false)
    const tableData = ref<Array<Record<string, any>>>([])
    const tableHeader = ref<TableColumn[]>([])
    const isChartView = ref(true)
    const needsRefresh = ref(false)

    /** 计算表格数据核心逻辑 */
    const calculateTableData = (force = false) => {
        const item = opt.value
        
        // 性能优化：如果表格当前不可见且不强制，则仅标记不计算
        if (isChartView.value && !force) {
            needsRefresh.value = true
            return
        }

        // 重置表头与数据
        tableHeader.value = [{
            title: item.title || '时间',
            key: 'timeList',
        }]
        tableData.value = item.timeList?.map(time => ({ timeList: time })) || []

        // 填充各序列数据
        item.series?.forEach(({ name, tableUnit, data }) => {
            const updatedName = tableUnit ? `${name}${tableUnit}` : name
            tableHeader.value.push({
                title: updatedName,
                key: name,
            })
            data.forEach((val, idx) => {
                if (tableData.value[idx]) {
                    tableData.value[idx][name] = val
                }
            })
        })

        // 处理首尾点删除逻辑
        if (item.deleteLastPoint) {
            tableData.value.pop()
        } else if (item.deleteFirstPoint) {
            tableData.value.shift()
        }
        
        needsRefresh.value = false
    }

    // 同步外部显示配置
    watchEffect(() => {
        if (opt.value.showTable !== undefined) {
            showTable.value = opt.value.showTable
        }
    })

    // 核心数据变化时触发表格更新
    watch(
        () => [opt.value.series, opt.value.timeList],
        () => calculateTableData(),
        { deep: true, immediate: true }
    )

    // 切换到表格视图时，按需执行延迟的计算
    watch(isChartView, (val) => {
        if (!val && needsRefresh.value) {
            calculateTableData(true)
        }
    })

    return {
        showTable,
        tableData,
        tableHeader,
        isChartView,
        calculateTableData
    }
}
