import type { PageQuery, PageResult } from './api';

export interface ExampleItem {
  id: number;
  name: string;
  owner: string;
  status: 'active' | 'paused';
}

export interface ExampleListQuery extends PageQuery {}

export interface ExampleListPayload extends PageResult<ExampleItem> {}
