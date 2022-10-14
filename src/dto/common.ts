import type { ProductResult } from '@dto/product';

export type JobRuleBaseDetail = {
  id: number;
  rulebaseId: number;
  keyword: string;
  score: string | null;
  synonym: string;
  detail: string;
  deleted: boolean;
};

export type CommonCode = {
  codeId: number;
  count: number;
  dateCreated: string;
  dateUpdated: string;
  description: string;
  groupId: number;
  id: number;
  isDeleted: boolean;
  name: string;
  sort: number;
  synonyms: string;
};

export type SizeCode = {
  categorySizeId: number;
  codeId: number;
  count: number;
  dateCreated: string;
  dateUpdated: string;
  description: string;
  groupId: number;
  id: number;
  isDeleted: boolean;
  name: string;
  parentCategoryId: number;
  sort: number;
  synonyms: string;
  viewSize: string;
};

export type Page = {
  page: number;
  size: number;
  sort: string[];
};

export type Sort = {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
};

export interface Paged<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: Sort;
    unpaged: boolean;
  };
  size: number;
  sort: Sort;
  totalElements: number;
  totalPages: number;
}

export type ContentsDetail = {
  dateUpdated: string;
  dateCreated: string;
  id: number;
  contentsId: number;
  title: string;
  subTitle: string;
  url: string;
  imageMain: string;
  imageTitle: string;
  contentIds: number;
  products: ProductResult[];
  sort: number;
};

export type Contents = {
  dateUpdated: string;
  dateCreated: string;
  id: number;
  status: number;
  title: string;
  url: string;
  dateStart: string;
  dateEnd: string;
  description: string;
  imageMain: string;
  imageMainBanner: string;
  imageListBanner: string;
  imageThumbnail: string;
  contentsDetails: ContentsDetail[];
  targetContents: Contents | null;
};

export interface PriceCode extends CommonCode {
  minPrice: number;
  maxPrice: number;
}

export interface CategoryCode extends CommonCode {
  name: string;
  parentId: number;
  subParentId: number;
}
export interface ImageGroups {
  groupId: number;
  name: string;
  photoGuideDetails: CommonPhotoGuideDetail[];
}

export type CommonPhotoGuideDetail = {
  id: number;
  photoGuideId: number;
  name: string;
  description: string;
  imageType: 0 | 1 | 2 | 3;
  imageWatermark: string;
  imageWatermarkDark: string;
  imageSample: string;
  sort?: number;
  isRequired: boolean;
  dateCreated: string;
  dateUpdated: string;
};

export interface PhotoGuide {
  groupId: number;
  photoGuideDetails: CommonPhotoGuideDetail[];
}

/* ---------- Request Parameters ---------- */
export interface PhotoGuideParams {
  type: 0 | 1 | 2; // 0: 매물등록, 1: 감정등록, 2: 프로필등록
  categoryId?: number;
  brandId?: number;
}
