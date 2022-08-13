import type { SuggestKeyword } from '@dto/product';

export interface RecentItems {
  keyword: string;
  count?: number;
  expectCount?: number;
}

export interface TotalSearchItem {
  keyword: string;
  title?: string;
  type?: string;
  keywordItem?: SuggestKeyword;
  skipLogging?: boolean;
  expectCount?: number;
  count?: number;
  brandId?: number;
  categoryId?: number;
}
