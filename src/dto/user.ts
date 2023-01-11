import type { channelUserType, productSellerType } from '@constants/user';

import type { Product, ProductResult, SearchParams } from './product';
import type { Paged } from './common';
import type { Category, CategoryValue } from './category';
import type { Brand } from './brand';

export type Alarm = {
  agreeDate: string;
  isAgree: boolean;
  isChannelNoti: boolean;
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
  isAreaOpen: boolean;
};

export type Gender = 'N' | 'M' | 'F' | 'E';

export interface UserAgeAndGender {
  age: number; // 삭제예정
  gender: Gender;
  yearOfBirth?: string;
}

export interface MyUserInfoValue {
  age: number; // 삭제예정
  gender: Gender;
  image: string;
  imageBackground: string;
  imageProfile: string;
  isAreaOpen: boolean;
  name: string;
  nickName: string;
  shopDescription: string;
  yearOfBirth: number;
}

export type MyUserInfoInfo = {
  value: MyUserInfoValue;
};

export type Info = {
  value: UserAgeAndGender;
};

export type UserInfoResultInfoValue = UserAgeAndGender;

export type UserInfoResultInfo = {
  value: UserInfoResultInfoValue;
};

export type Detail = {
  dateUpdated: string;
  id: number;
  image: string;
  name: string;
  parentId: number;
  brand: Brand;
  category: Category;
};

export type PurchaseTypes = {
  name: string;
  id: number;
};

export type PersonalStyle = {
  brands: Detail[];
  categories: Detail[];
  parentCategories: Detail[];
  personalBrands: Brand[];
  // purchaseTypes: PurchaseTypes[];
  personalCategories: Category[];
  styles: Detail[];
  subParentCategories: Detail[];
  purchaseTypes: { name: string; value?: 10 | 20 | 30; id?: number }[];
  defaultStyles: Detail[];
};

export type ProfileStep = {
  current: number;
  total: number;
};

export type Size = {
  value?: SizeValue;
};

export interface UserInfoResult {
  alarm: Alarm;
  announces: Announce[];
  area: {
    values: Area[];
  };
  dateUserHistoryViewed: string;
  info: UserInfoResultInfo;
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
  notViewedLegitCount?: number;
  notProcessedLegitCount?: number;
  roles: Role['name'][];
  userProductInfo: UserProductInfo;
  isNewUser: boolean;
  notViewedHistoryCount: number;
  notViewedAnnounceCount: number;
  hasChannel: boolean;
}

export interface UserProductInfo {
  displayedUserProductCount: number;
  hasUserProduct: boolean;
  images: string[];
}

export interface Role {
  id: number;
  code: string;
  name: 'PRODUCT_AUTHENTIC' | 'PRODUCT_LEGIT' | 'PRODUCT_LEGIT_HEAD';
  description: string;
}

export type UserRoleLegit = {
  userId: number;
  name: string;
  title: string;
  subTitle: string;
  description: string;
  urlShop: string | null;
  image: string;
  imageBackground: string | null;
  targetBrandIds: number[];
  cntOpinion: number;
  cntReal: number;
  cntFake: number;
  dateActivated: string;
  dateCreated: string;
  dateUpdated: string;
  ip: string;
};

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

/**
 * @param type 0: 수집매물, 1: 카멜내 판매자, 2: 인증판매자 3: 감정사 매물
 */
export type UserInfo = {
  area: Area | null;
  curnScore: string;
  displayProductCount: number;
  image: string;
  imageBackground: string | null;
  imageProfile: string | null;
  maxScore: string;
  name: string;
  nickName: string | null;
  productCount: number;
  reviewCount: number;
  shopDescription: string | null;
  sellerType: typeof productSellerType[keyof typeof productSellerType]; // 0: 크롤링 매물 1: 사용자 판매자 2: 인증 판매자 3: 감정사 판매자
  type: 0 | 1 | 2 | 3; // 0: 기본값 1: 블락 3: 카멜인증판매자
  undisplayProductCount: number;
  userRoleLegit: UserRoleLegit | null;
  userRoleSeller: UserRoleSeller | null;
};

export type UserReview = {
  content: string;
  createUserId: number;
  creator: string;
  creatorType: 1 | 2; // 1: 판매자, 2: 구매자
  id: number;
  productId: number;
  reportType: number;
  score: string;
};

export type UserSns = {
  accessToken: string;
  dateCreated: string;
  dateUpdated: string;
  expiresIn: number;
  refreshToken: string;
  snsType: number;
  snsUserId: string;
  status: number;
  tokenType: string;
  userId: number;
};

export type User = {
  adAgree: boolean;
  age: number;
  ageRange: string;
  alarmAgree: boolean;
  birthday: string;
  dateAlarmUpdated: string;
  dateCreated: string;
  dateUpdated: string;
  email: string;
  gender: Gender;
  id: number;
  image: string;
  isChannelNoti: boolean;
  isNightAlarm: boolean;
  lastLoginDate: string;
  lastLoginIp: string;
  maxMoney: number;
  method: number;
  mrcamelId: string;
  name: string;
  phone: string;
  status: boolean;
  userSns: UserSns;
  isDeleted: boolean;
};

export type UserBlock = {
  dateCreated: string;
  dateUpdated: string;
  id: number;
  isDeleted: boolean;
  targetUser: User;
  userId: number;
};

export type UserRoleSeller = {
  dateCreated: string;
  dateUpdated: string;
  sellerId: number;
  userId: number;
};

export type PageUserBlock = Paged<UserBlock>;

export type UserActionBannerInfo = {
  dateCreated: string;
  dateUpdated: string;
  event: 'ACTION_BANNER';
  isDeleted: boolean;
  name: string;
};

export interface MyUserInfo {
  area: Area;
  info: MyUserInfoInfo;
  isCertifiedSeller: boolean;
  maxMoney: number;
  notProcessedLegitCount: number;
  personalStyle: PersonalStyle;
  roles: Role['name'][];
  size: Size;
  userActionBannerInfo: UserActionBannerInfo | null;
}

export type ChannelUser = {
  channelId: number;
  dateCreated: string;
  dateUpdated: string;
  id: number;
  isDeleted: boolean;
  isLeaved: boolean;
  isNoti: boolean;
  type: keyof typeof channelUserType; // 0: 구매자, 1: 판매자
  user: User;
};

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
  label: {
    description: string;
    name: '10' | '20' | '30' | '40' | '50';
  };
  isViewed: boolean;
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
  imageThumbnail: string;
  images: [];
  isNew: boolean;
  keyword: string;
  keywordFilterJson: string;
  sourceType: number;
}

export interface Pageable {
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
  pageable: Pageable;
  size: number;
  sort: {
    empty: true;
    sorted: false;
    unsorted: true;
  };
  totalElements: number;
  totalPages: number;
}

export type PageUserReview = Paged<UserReview>;

export type InvalidReason = {
  param: 'NICKNAME' | 'SHOPDESCRIPTION' | 'LEGITTITLE';
  result: string;
  type: 'DUPLICATE' | 'BAN' | 'ADMIN';
};

export interface BanWordResponse {
  invalidReasons: InvalidReason[] | null;
  isValidLegitTitle: boolean;
  isValidNickName: boolean;
  isValidShopDescription: boolean;
}

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

export interface AgeAndGenderParams {
  age?: number; // 삭제예정
  birthday?: number;
  gender: Gender | null;
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
    }
  | { isAreaOpen: boolean };

export interface PostStyleParams {
  styleIds?: number[];
  parentCategoryIds?: number[] | null;
  subParentCategoryIds?: number[] | null;
}

export type UserProductsParams = {
  page?: number;
  size?: number;
  status?: number[];
};

export type PutUserLegitProfileData = {
  userId: number;
  name: string;
  title: string;
  subTitle: string;
  description: string;
  image: string;
  imageBackground: string;
  targetBrandIds: number[];
  urlShop: string;
};

export type AlarmsParams = {
  isNotiNotNight?: boolean;
  isNotiEvent?: boolean;
  isNotiChannel?: boolean;
  isNotiProductList?: boolean;
  isNotiProductWish?: boolean;
  isNotiLegit?: boolean;
  isNotiMyProductWish?: boolean;
  dateIsNotiEventAgree?: string;
};

export interface ProductsByUserIdParams {
  userId: number;
  page?: number;
  size?: number;
  sort?: string[];
}

export type UserReviewsByUserIdParams = ProductsByUserIdParams;

export interface UserBlockParams {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface PostReportData {
  userId: number;
  type: number;
  description?: string;
}

export type PostReviewData = {
  content?: string;
  productId?: number;
  score?: string;
  userId: number;
};

export type BanWordParams = {
  legitTitle?: string;
  nickName?: string;
  shopDescription?: string;
};

export interface UpdateUserProfileData {
  imageBackground?: string;
  imageProfile?: string;
  legitDescription?: string;
  legitSubTitle?: string;
  legitTargetBrandIds?: number[];
  legitTitle?: string;
  legitUrlShop?: string;
  nickName?: string;
  shopDescription?: string;
}
