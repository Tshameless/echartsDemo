<script setup lang="ts">
defineProps<{
  showSwitchToggle: boolean
  displayChart: boolean
  chartLabel?: string
  tableLabel?: string
}>()

const emit = defineEmits<{
  (e: 'update:displayChart', value: boolean): void
}>()
</script>

<template>
  <div class="switch-row">
    <div class="switch-row-left">
      <slot name="header" />
    </div>
    <div v-if="showSwitchToggle" class="chart-table-switch">
      <span
        class="switch-btn"
        :class="{ active: displayChart }"
        @click="emit('update:displayChart', true)"
      >{{ chartLabel || '图' }}</span>
      <span
        class="switch-btn"
        :class="{ active: !displayChart }"
        @click="emit('update:displayChart', false)"
      >{{ tableLabel || '表' }}</span>
    </div>
  </div>
</template>

<style scoped>
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
</style>
