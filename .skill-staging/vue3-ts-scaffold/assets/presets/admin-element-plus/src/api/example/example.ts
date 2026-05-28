import type { ExampleItem, ExampleListPayload, ExampleListQuery } from '@/types/example';

const EXAMPLE_ITEMS: ExampleItem[] = [
  { id: 1, name: 'North Region Dispatch', owner: 'Alicia', status: 'active' },
  { id: 2, name: 'Battery Health Audit', owner: 'Morgan', status: 'paused' },
  { id: 3, name: 'Peak Load Forecast', owner: 'Jordan', status: 'active' },
];

export const fetchExampleList = async (query: ExampleListQuery): Promise<ExampleListPayload> => {
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (query.keyword?.toLowerCase() === 'error') {
    throw new Error('模拟接口异常，请将关键字改成其他值后重试。');
  }

  const normalizedKeyword = query.keyword?.trim().toLowerCase() ?? '';
  const filtered = normalizedKeyword
    ? EXAMPLE_ITEMS.filter((item) => item.name.toLowerCase().includes(normalizedKeyword))
    : EXAMPLE_ITEMS;

  const start = (query.page - 1) * query.pageSize;
  const end = start + query.pageSize;

  return {
    list: filtered.slice(start, end),
    total: filtered.length,
  };
};
