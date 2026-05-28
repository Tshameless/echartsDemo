<script setup lang="ts">
const props = defineProps<{
  keyword: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  'update:keyword': [value: string];
  search: [];
  reset: [];
}>();
</script>

<template>
  <el-card shadow="never">
    <el-form inline @submit.prevent>
      <el-form-item label="关键字">
        <el-input
          :model-value="props.keyword"
          clearable
          placeholder="输入项目名，输入 error 可模拟异常"
          @update:model-value="emit('update:keyword', $event)"
          @keyup.enter="emit('search')"
        />
      </el-form-item>
      <el-form-item>
        <el-button :loading="props.loading" type="primary" @click="emit('search')">查询</el-button>
        <el-button @click="emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
