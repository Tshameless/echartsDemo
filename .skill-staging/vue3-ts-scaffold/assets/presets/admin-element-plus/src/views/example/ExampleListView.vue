<script setup lang="ts">
import { onMounted } from 'vue';
import AppPage from '@/components/common/AppPage.vue';
import ExampleFilterForm from './components/ExampleFilterForm.vue';
import ExampleTable from './components/ExampleTable.vue';
import { useExampleList } from './composables/useExampleList';

const { keyword, items, total, loading, errorText, isEmpty, load, reset } = useExampleList();

onMounted(() => {
  void load();
});
</script>

<template>
  <AppPage title="示例模块" description="这个模块展示了路由、组合式逻辑、类型、空态、错态和共享消息能力。">
    <template #actions>
      <el-tag type="warning">总条数 {{ total }}</el-tag>
    </template>

    <ExampleFilterForm v-model:keyword="keyword" :loading="loading" @reset="reset" @search="load" />

    <el-alert
      v-if="errorText"
      :closable="false"
      show-icon
      title="请求失败"
      type="error"
      :description="errorText"
    />

    <el-empty
      v-else-if="isEmpty"
      description="当前没有符合条件的数据，可以修改关键字后重新查询。"
    />

    <ExampleTable v-else :items="items" :loading="loading" />
  </AppPage>
</template>
