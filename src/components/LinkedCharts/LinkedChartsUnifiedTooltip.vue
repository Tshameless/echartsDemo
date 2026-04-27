<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

interface Props {
  content: string
  enabled: boolean
  hasCharts: boolean
  setTooltipRef: (element: Element | ComponentPublicInstance | null) => void
  styleObject: Record<string, string>
  visible: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.enabled && props.hasCharts"
      v-show="props.visible"
      :ref="(element) => props.setTooltipRef(element)"
      class="unified-tooltip"
      :style="props.styleObject"
      v-html="props.content"
    />
  </Teleport>
</template>

<style scoped>
.unified-tooltip {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
