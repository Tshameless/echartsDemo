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
      <div ref="containerRef" class="linked-chart-container">
        <template v-if="chartItems.length > 0">
          <div v-for="(item, index) in chartItems" :key="item.key" class="chart-item-wrap">
            <div v-if="item.title" class="chart-title">{{ item.title }}</div>
            <div
              ref="boxRefs"
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
        v-if="Boolean(props.unifiedTooltip) && hasCharts && unifiedTooltipData"
        v-show="unifiedTooltipVisible"
        ref="unifiedTooltipRef"
        class="unified-tooltip"
        :style="unifiedTooltipStyle"
      >
        <div class="tooltip-wrapper">
          <div class="tooltip-title">{{ unifiedTooltipData.title }}</div>
          <div
            v-for="(section, sIdx) in unifiedTooltipData.sections"
            :key="sIdx"
            class="tooltip-section"
          >
            <div v-if="sIdx > 0" class="tooltip-divider" />
            <div
              v-for="row in section.rows"
              :key="row.name"
              class="tooltip-row"
            >
              <span class="row-marker" :style="{ backgroundColor: row.color }" />
              <span class="row-name">{{ row.name }}</span>
              <span class="row-value">{{ row.value }}{{ row.unit }}</span>
            </div>
          </div>
        </div>
      </div>
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
  pointer-events: none;
}

.tooltip-wrapper {
  padding: 12px 16px;
  min-width: 200px;
}

.tooltip-title {
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.tooltip-divider {
  height: 1px;
  margin: 8px 0;
  background: rgba(0, 0, 0, 0.05);
}

.tooltip-row {
  margin: 6px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.row-marker {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
  flex-shrink: 0;
}

.row-name {
  color: #333;
  font-size: 13px;
  flex: 1;
}

.row-value {
  color: #333;
  font-size: 13px;
  margin-left: auto;
  white-space: nowrap;
}
</style>

