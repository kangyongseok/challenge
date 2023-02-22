import { BrandFilter, ProductOrder, SiteUrl } from '@dto/product';
import { CommonCode, SizeCode } from '@dto/common';
import { ParentCategory, SubParentCategory } from '@dto/category';

export type ProductsVariant = 'categories' | 'brands' | 'search' | 'camel';

type SelectedSearchOptionState<T> = T & {
  codeId: number;
  checked?: boolean;
};

export type SelectedSearchOption = SelectedSearchOptionState<
  Partial<
    BrandFilter &
      SizeCode &
      ParentCategory &
      SubParentCategory &
      CommonCode &
      SiteUrl & {
        genderIds: number[];
        minPrice: number;
        maxPrice: number;
        distance: number;
        productOrder: ProductOrder;
        gender: string;
      }
  >
>;

export type SelectedSearchOptionHistory = {
  id?: number;
  codeId?: number;
  parentId?: number;
  parentCategoryId?: number;
  categorySizeId?: number;
  genderId?: number;
  displayName: string;
  grouping?: boolean;
  groupingDepth?: number;
  index?: number;
  count?: number;
  gender?: string;
  description?: string;
};

export type ProductsEventProperties = {
  name?: string | string[];
  type?: string | string[];
  title?: string | string[];
  source?: string | string[];
  keyword?: string | string[];
  filters?: string | string[];
};

export interface SearchRelatedKeywordsParams {
  quoteTitle: string;
  brandIds: number[];
  categoryIds: number[];
}

export interface putProductUpdateStatusParams {
  productId: number;
  status: number;
  soldType?: 0 | 1;
  targetUserId?: number;
}
