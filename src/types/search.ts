import type { SuggestKeyword } from '@dto/product';

export interface SelectItem {
  keyword?: string;
  parentIds?: string;
  subParentIds?: string;
  genders?: string;
  categoryKeyword?: string;
}

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
