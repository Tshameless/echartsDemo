<script setup lang="ts">
import { computed } from 'vue'
import type { LinkedChartsProps, LinkedChartsReadyPayload } from './types'
import { useLinkedChartDisplay } from './useLinkedChartDisplay'
import { useLinkedChartRuntime } from './useLinkedChartRuntime'

import Toolbar from './components/Toolbar.vue'
import ChartRenderer from './components/ChartRenderer.vue'
import DataTableRenderer from './components/DataTableRenderer.vue'
import UnifiedTooltipRenderer from './components/UnifiedTooltipRenderer.vue'

const props = withDefaults(defineProps<LinkedChartsProps>(), {
  groupId: '',
  tablePosition: 'switch',
  tableMaxHeight: 500,
  tableScrollX: 1200,
  tableMinRowHeight: 39,
  unifiedTooltip: true,
  chartLabel: '图',
  tableLabel: '表',
  timeColumnTitle: '时间',
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
  boxRefs,
  containerRef,
  exposedMyChart,
  exposedMyCharts,
  resizeHandler,
  unifiedTooltipRef,
  unifiedTooltipData,
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

<template>
  <div class="chart-table-switch-wrapper">
    <!-- Toolbar Section -->
    <Toolbar
      :show-switch-toggle="showSwitchToggle"
      :display-chart="displayChart"
      :chart-label="props.chartLabel"
      :table-label="props.tableLabel"
      @update:display-chart="setChartView"
    >
      <template #header>
        <slot name="header" />
      </template>
    </Toolbar>

    <!-- Charts Section -->
    <div v-show="shouldShowChartContent" class="chart-content">
      <ChartRenderer
        :chart-items="chartItems"
        :height="props.height"
        @set-container-ref="el => { containerRef = el }"
        @set-box-ref="(el, idx) => { boxRefs[idx] = el! }"
      />
    </div>

    <!-- Table Section -->
    <div v-if="shouldShowTableContent">
      <DataTableRenderer
        :data-table-columns="dataTableColumns"
        :table-rows="tableRows"
        :table-max-height="props.tableMaxHeight"
        :enable-table-virtual-scroll="enableTableVirtualScroll"
        :table-min-row-height="props.tableMinRowHeight || 39"
        :get-table-row-key="getTableRowKey"
        :table-scroll-x="props.tableScrollX || 1200"
      />
    </div>

    <!-- Unified Tooltip -->
    <UnifiedTooltipRenderer
      :unified-tooltip-enabled="Boolean(props.unifiedTooltip)"
      :has-charts="hasCharts"
      :unified-tooltip-data="unifiedTooltipData"
      :unified-tooltip-visible="unifiedTooltipVisible"
      :unified-tooltip-style="unifiedTooltipStyle"
      @set-tooltip-ref="el => { unifiedTooltipRef = el }"
    />
  </div>
</template>

<style scoped>
.chart-table-switch-wrapper {
  width: 100%;
}
</style>
