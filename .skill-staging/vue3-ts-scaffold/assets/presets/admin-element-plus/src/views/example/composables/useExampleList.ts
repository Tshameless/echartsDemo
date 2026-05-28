import { computed, ref } from 'vue';
import { fetchExampleList } from '@/api/example/example';
import type { ExampleItem } from '@/types/example';
import { message } from '@/utils/message';

export const useExampleList = () => {
  const keyword = ref('');
  const items = ref<ExampleItem[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const errorText = ref('');

  const isEmpty = computed(() => !loading.value && !errorText.value && items.value.length === 0);

  const load = async () => {
    loading.value = true;
    errorText.value = '';

    try {
      const result = await fetchExampleList({
        page: 1,
        pageSize: 10,
        keyword: keyword.value,
      });

      items.value = result.list;
      total.value = result.total;
    } catch (error) {
      errorText.value = error instanceof Error ? error.message : '加载列表失败。';
      items.value = [];
      total.value = 0;
      message.error(errorText.value);
    } finally {
      loading.value = false;
    }
  };

  const reset = async () => {
    keyword.value = '';
    await load();
  };

  return {
    keyword,
    items,
    total,
    loading,
    errorText,
    isEmpty,
    load,
    reset,
  };
};
