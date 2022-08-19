import type { Product, ProductResult, SearchParams } from './product';
import type { Paged } from './common';
import type { Category, CategoryValue } from './category';
import type { Brand } from './brand';

export type Alarm = {
  agreeDate: string;
  isAgree: boolean;
  isNightAgree: boolean;
};

export type AnnounceDetail = {
  announceId: number;
  content: string;
  dateCreated: string;
  dateUpdated: string;
  id: number;
  images: string;
  isDeleted: boolean;
  parameter: string;
  sort: number;
  subContent: string;
  type: number;
};

export type Announce = {
  announceDetails: AnnounceDetail[];
  dateCreated: string;
  datePosted: string;
  dateUpdated: string;
  id: number;
  isDeleted: boolean;
  title: string;
};

export type SizeResult = {
  categorySizeId: number;
  parentCategoryId: number;
  size: string;
  viewSize: string;
};

export type SizeValue = {
  bottoms: SizeResult[];
  shoes: SizeResult[];
  tops: SizeResult[];
  [x: string]: SizeResult[];
};

export type Area = {
  dateCreated: string;
  dateUpdated: string;
  id: number;
  isDeleted: boolean;
  name: string;
  areaName: string;
  isActive: boolean;
  values: AreaValues[];
  x: string;
  y: string;
};

export type Gender = 'N' | 'M' | 'F' | 'E';

export interface UserAgeAndGender {
  age: number;
  gender: Gender;
  yearOfBirth?: string;
}

export type Info = {
  value: UserAgeAndGender;
};

export type Detail = {
  dateUpdated: string;
  id: number;
  image: string;
  name: string;
  parentId: number;
};

export type PersonalStyle = {
  brands: Detail[];
  categories: Detail[];
  parentCategories: Detail[];
  personalBrands: Brand[];
  personalCategories: Category[];
  styles: Detail[];
  subParentCategories: Detail[];
};

export type ProfileStep = {
  current: number;
  total: number;
};

export type Size = {
  value: SizeValue;
};

export interface UserInfo {
  alarm: Alarm;
  announces: Announce[];
  area: {
    values: Area[];
  };
  dateUserHistoryViewed: string;
  info: Info;
  maxMoney: number;
  personalRefreshCount: number;
  personalStyle: PersonalStyle;
  priceNotiProducts: ProductResult[];
  profileStep: ProfileStep;
  size: Size;
  recommLegitInfo: {
    images: string[];
    legitTargetCount: number;
  };
}

export type UserWish = {
  dateCreated: string;
  dateUpdated: string;
  deviceId: string;
  id: number;
  isDeleted: boolean;
  product: Product;
  userId: number;
};

export interface CategoryWish {
  categories: CategoryValue[];
  userWishCount: number;
  userWishIds: number[];
  userWishes: UserWish[];
}

export interface PostSize {
  categorySizeIds: number[];
  sizeType: string;
}

export interface UserHistoryManages {
  VIEW_SEARCH_HELPER: boolean;
}

export type SizeMappingValue = {
  categorySizeId: number;
  parentCategoryId: number;
  viewSize: string;
};

export type SizeMappingKey = {
  size: SizeMappingValue;
  subSize: SizeMappingValue[];
};

export type SizeMappingCategory = Record<'bottom' | 'outer' | 'shoe' | 'top', SizeMappingKey[]>;

export type SizeMapping = Record<'female' | 'male', SizeMappingCategory>;

/* ---------- Request Parameters ---------- */
export interface CategoryWishesParams {
  categoryIds?: number[];
  deviceId?: string;
  page?: number;
  size?: number;
  sort?: string[];
  isLegitProduct?: boolean;
  status?: number;
}

export interface AreaValues {
  areaName: string;
  id: number;
  isActive: boolean;
}

export interface ProductsAddParams {
  productId: number;
  deviceId?: string;
}

export type ProductsRemoveParams = ProductsAddParams;

export interface UserSizeSuggestParams {
  sizeType: number;
  value: string;
}

export interface UserHistory {
  dateTime: string;
  isWishOrHoneyNoti: boolean;
  message: string;
  parameter: string;
  product: Product;
  type: string;
}

export type PageUserHistory = Paged<UserHistory>;
export interface HoneyNoti {
  id: number;
  keyword: string;
  isNew: boolean;
  parameter: string;
  image: string;
  newCount: number;
  allCount: number;
  filterOption: {
    scoreTotal: number | null;
    maxPrice: number | null;
    isOnceDay: boolean;
  };
}

export interface PageHoneyNoti {
  content: HoneyNoti[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface UserNoti {
  id: number;
  targetId: number;
  keyword: string;
  message: string;
  parameter: string;
  image: null | string;
  isSoldOut: boolean;
  dateCreated: string;
  dateViewed: null | string;
  type: number;
}

export interface PageUserNoti {
  content: UserNoti[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type ProductKeywordSourceType = 0 | 1 | 3;

export interface ProductKeywordData {
  productSearch: SearchParams;
  sourceType: ProductKeywordSourceType;
}

export interface ProductKeywordsContent {
  filter: string;
  id: number;
  images: [];
  isNew: boolean;
  keyword: string;
  keywordFilterJson: string;
  sourceType: number;
}

export interface Pagetble {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: {
    empty: true;
    sorted: false;
    unsorted: true;
  };
  unpaged: boolean;
}

export interface ProductKeywords {
  content: ProductKeywordsContent[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: Pagetble;
  size: number;
  sort: {
    empty: true;
    sorted: false;
    unsorted: true;
  };
  totalElements: number;
  totalPages: number;
}

export interface AgeAndGenderParams {
  age?: number; // 삭제예정
  birthday?: number;
  gender: Gender;
}

export type AreaParams = {
  ip?: string;
  name?: string;
  x?: string;
  y?: string;
};

export type PostAreaParams =
  | {
      ip: string;
    }
  | {
      name: string;
      x?: string;
      y?: string;
    };

export interface PostStyleParams {
  styleIds?: number[];
  parentCategoryIds?: number[] | null;
  subParentCategoryIds?: number[] | null;
}
