<script setup lang="ts">
interface Props {
  displayChart: boolean
  showSwitchToggle: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'toggle-view', value: boolean): void
}>()
</script>

<template>
  <div class="switch-row">
    <div class="switch-row-left">
      <slot name="header" />
    </div>
    <div v-if="props.showSwitchToggle" class="chart-table-switch">
      <span class="switch-btn" :class="{ active: props.displayChart }" @click="emit('toggle-view', true)"
        >图</span
      >
      <span
        class="switch-btn"
        :class="{ active: !props.displayChart }"
        @click="emit('toggle-view', false)"
        >表</span
      >
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
