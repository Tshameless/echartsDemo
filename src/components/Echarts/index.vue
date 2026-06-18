<script setup lang="ts">
import { computed, shallowRef, toRef } from 'vue'
import type {
  ChartTableRow,
  EchartsProps,
  EchartsReadyPayload,
  TableColumn,
} from './types'
import ChartRenderer from './components/ChartRenderer.vue'
import DataTableRenderer from './components/DataTableRenderer.vue'
import Toolbar from '@/components/LinkedEcharts/components/Toolbar.vue'
import { useChartOption } from './useChartOption'
import { useChartTable } from './useChartTable'
import { useProcessedData } from './useProcessedData'

const props = withDefaults(defineProps<EchartsProps>(), {
  tableMode: 'none',
  showChartView: undefined,
  tableMaxHeight: undefined,
  chartLabel: '图',
  tableLabel: '表',
  timeColumnTitle: '时间',
})

const emit = defineEmits<{
  (event: 'chart-ready', payload: EchartsReadyPayload): void
  (event: 'update:showChartView', value: boolean): void
}>()

defineSlots<{
  header?(): any
  'header-left'?(): any
  'header-right'?(): any
  table?(props: {
    dataTableColumns: TableColumn[]
    tableRows: ChartTableRow[]
    tableMaxHeight: number | string
  }): any
  footer?(): any
}>()

const optRef = toRef(props, 'opt')
const timeColumnTitle = toRef(props, 'timeColumnTitle')
const rendererRef = shallowRef<InstanceType<typeof ChartRenderer> | null>(null)
const selectedLegends = shallowRef<Record<string, boolean>>({})
const localShowChartView = shallowRef(true)

const { processedOpt } = useProcessedData(optRef)
const { getFinalOption } = useChartOption()
const { tableData, tableHeader } = useChartTable(processedOpt, timeColumnTitle)

const canShowTable = computed(() => props.tableMode !== 'none')
const isBottomTableMode = computed(() => props.tableMode === 'bottom')
const showSwitchToggle = computed(() => props.tableMode === 'switch')

const displayChart = computed(() => {
  if (props.tableMode !== 'switch') return true
  return props.showChartView ?? localShowChartView.value
})

const shouldShowChartContent = computed(() => displayChart.value)
const shouldShowTableContent = computed(
  () => canShowTable.value && (isBottomTableMode.value || !displayChart.value)
)

const resolvedTableMaxHeight = computed(() => props.tableMaxHeight ?? props.height)

const finalOption = computed(() => getFinalOption(processedOpt.value, selectedLegends.value))

function handleLegendChange(params: any) {
  selectedLegends.value = params.selected
}

function handleChartReady(payload: EchartsReadyPayload) {
  emit('chart-ready', payload)
}

function setChartView(value: boolean) {
  if (props.tableMode !== 'switch') return

  if (props.showChartView !== undefined) {
    emit('update:showChartView', value)
    return
  }

  localShowChartView.value = value
}

defineExpose({
  resizeHandler: () => rendererRef.value?.resize(),
  myChart: computed(() => rendererRef.value?.getInstance() ?? null),
  setChartView,
  showChartView: displayChart,
})
</script>

<template>
  <div class="echarts-wrapper">
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
      <template #header-left>
        <slot name="header-left" />
      </template>
      <template #header-right>
        <slot name="header-right" />
      </template>
    </Toolbar>

    <div v-show="shouldShowChartContent" class="chart-content">
      <ChartRenderer
        ref="rendererRef"
        :option="finalOption"
        :height="props.height"
        @chart-ready="handleChartReady"
        @legend-select-changed="handleLegendChange"
      />
    </div>

    <div v-if="shouldShowTableContent" class="table-content">
      <slot
        name="table"
        v-bind="{ dataTableColumns: tableHeader, tableRows: tableData, tableMaxHeight: resolvedTableMaxHeight }"
      >
        <DataTableRenderer
          :columns="tableHeader"
          :data="tableData"
          :height="resolvedTableMaxHeight"
        />
      </slot>
    </div>

    <div class="echarts-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.echarts-wrapper {
  width: 100%;
}

.chart-content {
  margin-top: 8px;
}

.table-content {
  margin-top: 12px;
}

.echarts-footer {
  margin-top: 8px;
}
</style>
