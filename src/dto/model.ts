import type { ParentCategory } from '@dto/category';

import type { Brand } from './brand';

export interface DateGroup {
  date: number;
  day: number;
  hours: number;
  minutes: number;
  month: number;
  nanos: number;
  seconds: number;
  time: number;
  timezoneOffset: number;
  year: number;
}

export interface JopRuleDetail {
  deleted: boolean;
  detail: string;
  id: number;
  keyword: string;
  rulebaseId: number;
  score: string;
  synonym: string;
}

export interface TempBrands {
  dateUpdated: string;
  dateCreated: string;
  id: number;
  groupId: number;
  tierId: number;
  name: string;
  nameEng: string;
  viewName?: string;
  parentId: number;
  isLegitProduct: boolean;
}

export interface TempCategorys {
  dateUpdated: string;
  dateCreated: string;
  id: number;
  groupId: number;
  name: string;
  nameEng: string;
  depth: number;
  order: number;
  parentId: number;
  subParentId: number;
  isLegitProduct: boolean;
  jobRulebaseDetail: {
    id: number;
    rulebaseId: number;
    keyword: string;
    score?: number;
    synonym: string;
    detail: string;
    deleted: boolean;
  };
}

export interface Models {
  brand: Brand;
  brands: string;
  categories: string;
  category: {
    dateCreated: string;
    dateUpdated: string;
    depth: number;
    groupId: number;
    id: number;
    isDeleted: boolean;
    jobRulebaseDetail: JopRuleDetail;
    name: string;
    nameEng: string;
    order: number;
    parentId: number;
    subParentId: number;
  };
  dateCreated: DateGroup;
  dateUpdated: DateGroup;
  id: number;
  imageThumbnail: string;
  isDeleted: boolean;
  level: number;
  lineBase: string;
  lines: string;
  modelDeco: string;
  modelNo: string;
  name: string;
  sort: number;
  productParentCategory: ParentCategory;
  subParentCategoryName: string;
  tmpBrands: TempBrands[];
  tmpCategories: TempCategorys[];
}

export type LegitsBrand = {
  dateCreated: string;
  dateUpdated: string;
  groupId: number;
  id: number;
  isLegitProduct: boolean;
  name: string;
  nameEng: string;
  parentId: number;
  tierId: number;
  viewName: string;
};

export type LegitsCategory = {
  dateCreated: string;
  dateUpdated: string;
  depth: number;
  groupId: number;
  id: number;
  isLegitProduct: boolean;
  name: string;
  nameEng: string;
  order: number;
  parentId: number;
  subParentId: number;
};

export type ModelLegit = {
  brandId: number;
  categoryId: number;
  dateCreated: string;
  dateUpdated: string;
  id: number;
  imageThumbnail: string;
  legitCategoryId: number;
  lines: string;
  name: string;
  sort: number;
  subParentCategoryName: string;
  tmpBrands: LegitsBrand[];
  tmpCategories: LegitsCategory[];
};

/* ---------- Request Parameters ---------- */
export interface ModelSuggestParams {
  brandIds?: number[];
  categoryIds?: number[];
  keyword: string;
  useBrandCategory?: boolean;
}

export type LegitsBrandsParams = {
  brandIds?: number[];
  categoryIds?: number[];
};

export type LegitsCategoriesParams = LegitsBrandsParams;

export type LegitsModelsParams = LegitsBrandsParams;
