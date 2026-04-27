<script setup lang="ts">
import type { UnifiedTooltipData } from '../types'

defineProps<{
  unifiedTooltipEnabled: boolean
  hasCharts: boolean
  unifiedTooltipData: UnifiedTooltipData | null
  unifiedTooltipVisible: boolean
  unifiedTooltipStyle: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'set-tooltip-ref', el: HTMLDivElement | null): void
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="unifiedTooltipEnabled && hasCharts && unifiedTooltipData"
      v-show="unifiedTooltipVisible"
      :ref="el => emit('set-tooltip-ref', el as HTMLDivElement | null)"
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
</template>

<style scoped>
.unified-tooltip {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 9999;
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
