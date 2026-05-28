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
      <slot name="header-left" />
    </div>
    <div class="switch-row-right">
      <slot name="header-right" />
      <div v-if="showSwitchToggle" class="chart-table-switch">
        <span
          class="switch-btn"
          :class="{ active: displayChart }"
          @click="emit('update:displayChart', true)"
        >{{ chartLabel || '图' }}</span>
        <span class="switch-separator">/</span>
        <span
          class="switch-btn"
          :class="{ active: !displayChart }"
          @click="emit('update:displayChart', false)"
        >{{ tableLabel || '表' }}</span>
      </div>
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.switch-row-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.chart-table-switch {
  display: flex;
  align-items: center;
  background: #f4f6fa;
  padding: 2px;
  border-radius: 4px;
  font-size: 14px;
  user-select: none;
}

.switch-btn {
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  color: #909399;
  transition: all 0.3s;
  font-weight: 500;
}

.switch-btn:hover {
  color: #6e7eee;
}

.switch-btn.active {
  background: #ffffff;
  color: #6e7eee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.switch-separator {
  margin: 0 2px;
  color: #dcdfe6;
  font-size: 12px;
}
</style>
