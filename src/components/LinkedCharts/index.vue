<template>
  <div class="chart-table-switch-wrapper">
    <!-- Toolbar Section -->
    <div class="switch-row">
      <div class="switch-row-left">
        <slot name="header" />
      </div>
      <div v-if="showSwitchToggle" class="chart-table-switch">
        <span
          class="switch-btn"
          :class="{ active: displayChart }"
          @click="setChartView(true)"
        >{{ props.chartLabel || '图' }}</span>
        <span
          class="switch-btn"
          :class="{ active: !displayChart }"
          @click="setChartView(false)"
        >{{ props.tableLabel || '表' }}</span>
      </div>
    </div>

    <!-- Charts Section -->
    <div v-show="shouldShowChartContent" class="chart-content">
      <div :ref="setContainerRef" class="linked-chart-container">
        <template v-if="chartItems.length > 0">
          <div v-for="(item, index) in chartItems" :key="item.key" class="chart-item-wrap">
            <div v-if="item.title" class="chart-title">{{ item.title }}</div>
            <div
              :ref="(el) => setBoxRef(el, index)"
              class="chart-box"
              :style="{ height: `${props.height}px`, maxHeight: `${props.height}px` }"
            ></div>
          </div>
        </template>
      </div>
    </div>

    <!-- Table Section -->
    <div v-if="shouldShowTableContent" class="table-content">
      <n-data-table
        :columns="dataTableColumns"
        :data="tableRows"
        :max-height="props.tableMaxHeight"
        :virtual-scroll="enableTableVirtualScroll"
        :min-row-height="props.tableMinRowHeight || 39"
        :row-key="getTableRowKey"
        :scroll-x="props.tableScrollX || 1200"
        striped
        bordered
      />
    </div>

    <!-- Unified Tooltip -->
    <Teleport to="body">
      <div
        v-if="Boolean(props.unifiedTooltip) && hasCharts"
        v-show="unifiedTooltipVisible"
        :ref="setUnifiedTooltipRef"
        class="unified-tooltip"
        :style="unifiedTooltipStyle"
        v-html="unifiedTooltipContent"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LinkedChartsProps, LinkedChartsReadyPayload } from './types'
import { useLinkedChartDisplay } from './useLinkedChartDisplay'
import { useLinkedChartRuntime } from './useLinkedChartRuntime'

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

/* Toolbar Styles */
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.switch-row-left {
  flex: 1;
  min-width: 0;
}

.chart-table-switch {
  display: inline-flex;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.switch-btn {
  padding: 6px 16px;
  font-size: 14px;
  color: #606266;
  background: #fff;
  cursor: pointer;
  user-select: none;
}

.switch-btn:hover {
  color: #409eff;
}

.switch-btn.active {
  background: #409eff;
  color: #fff;
}

/* Chart List Styles */
.linked-chart-container {
  position: relative;
  width: 100%;
}

.chart-item-wrap {
  margin-bottom: 8px;
}

.chart-item-wrap:last-child {
  margin-bottom: 0;
}

.chart-title {
  padding: 8px 0 4px;
  font-weight: bold;
  font-size: 14px;
}

.chart-box {
  width: 100%;
}

/* Table Styles */
.table-content {
  margin-top: 12px;
}

/* Tooltip Styles */
.unified-tooltip {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>

