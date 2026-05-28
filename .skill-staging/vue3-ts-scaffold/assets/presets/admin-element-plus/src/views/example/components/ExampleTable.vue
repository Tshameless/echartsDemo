<script setup lang="ts">
import type { ExampleItem } from '@/types/example';

defineProps<{
  loading: boolean;
  items: ExampleItem[];
}>();
</script>

<template>
  <el-card shadow="never">
    <el-table :data="items" :loading="loading" border>
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="项目名称" prop="name" min-width="240" />
      <el-table-column label="负责人" prop="owner" min-width="140" />
      <el-table-column label="状态" min-width="120">
        <template #default="{ row }: { row: ExampleItem }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '运行中' : '已暂停' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
