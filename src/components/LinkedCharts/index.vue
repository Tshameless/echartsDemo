<template>
  <div class="chart-table-switch-wrapper">
    <LinkedChartsToolbar
      :display-chart="displayChart"
      :show-switch-toggle="showSwitchToggle"
      @toggle-view="setChartView"
    >
      <template #header>
        <slot name="header" />
      </template>
    </LinkedChartsToolbar>

    <div v-show="shouldShowChartContent" class="chart-content">
      <LinkedChartsCanvasList
        :height="props.height"
        :items="chartItems"
        :set-box-ref="setBoxRef"
        :set-container-ref="setContainerRef"
      />
    </div>

    <LinkedChartsDataTable
      v-if="shouldShowTableContent"
      :columns="dataTableColumns"
      :enable-virtual-scroll="enableTableVirtualScroll"
      :get-row-key="getTableRowKey"
      :rows="tableRows"
      :table-max-height="props.tableMaxHeight"
    />

    <LinkedChartsUnifiedTooltip
      :content="unifiedTooltipContent"
      :enabled="Boolean(props.unifiedTooltip)"
      :has-charts="hasCharts"
      :set-tooltip-ref="setUnifiedTooltipRef"
      :style-object="unifiedTooltipStyle"
      :visible="unifiedTooltipVisible"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LinkedChartsCanvasList from './LinkedChartsCanvasList.vue'
import LinkedChartsDataTable from './LinkedChartsDataTable.vue'
import LinkedChartsToolbar from './LinkedChartsToolbar.vue'
import LinkedChartsUnifiedTooltip from './LinkedChartsUnifiedTooltip.vue'
import type { LinkedChartsProps, LinkedChartsReadyPayload } from './types'
import { useLinkedChartDisplay } from './useLinkedChartDisplay'
import { useLinkedChartRuntime } from './useLinkedChartRuntime'

const props = withDefaults(defineProps<LinkedChartsProps>(), {
  groupId: '',
  tablePosition: 'switch',
  tableMaxHeight: 500,
  unifiedTooltip: true,
})

const emit = defineEmits<{
  (event: 'chart-ready', payload: LinkedChartsReadyPayload): void
  (event: 'update:showChartView', value: boolean): void
}>()

const {
  chartItems,
  chartList,
  dataTableColumns,
  displayChart,
  enableTableVirtualScroll,
  getTableRowKey,
  setChartView,
  shouldShowChartContent,
  shouldShowTableContent,
  showSwitchToggle,
  tableRows,
} = useLinkedChartDisplay({
  props,
  onUpdateShowChartView: (value) => emit('update:showChartView', value),
})

const {
  exposedMyChart,
  exposedMyCharts,
  resizeHandler,
  setBoxRef,
  setContainerRef,
  setUnifiedTooltipRef,
  unifiedTooltipContent,
  unifiedTooltipStyle,
  unifiedTooltipVisible,
} = useLinkedChartRuntime({
  chartList,
  getGroupId: () => props.groupId ?? '',
  isUnifiedTooltipEnabled: () => Boolean(props.unifiedTooltip),
  onChartReady: (payload) => emit('chart-ready', payload),
})

const hasCharts = computed(() => chartList.value.length > 0)

defineExpose({
  resizeHandler,
  myChart: exposedMyChart,
  myCharts: exposedMyCharts,
  showChartView: displayChart,
  setChartView,
})
</script>

<style scoped>
.chart-table-switch-wrapper {
  width: 100%;
}
</style>
