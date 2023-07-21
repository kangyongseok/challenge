import type { ProductOffer } from '@dto/productOffer';
import type { Order } from '@dto/order';
import type { Channel } from '@dto/channel';

import type { productType } from '@constants/user';

import type { PhotoGuideImages } from '@typings/camelSeller';

import type { UserRoleSeller } from './user';
import type { ProductLegit } from './productLegit';
import type {
  CategoryCode,
  CommonCode,
  CommonPhotoGuideDetail,
  Contents,
  JobRuleBaseDetail,
  Page,
  Paged,
  PriceCode,
  SizeCode,
  Sort
} from './common';
import type { Category, ParentCategory, SubParentCategory } from './category';
import type { Brand } from './brand';

export interface KeywordItemSub {
  brandId: number | null;
  brandName: string | null;
  categoryId: number | null;
  categoryName: string | null;
  categorySizeIds: number[] | null;
  gender: 'male' | 'female' | null;
  idFilterIds: number[];
  keyword: string;
  keywordDeco: string;
  line: string | null;
  lineIds: number[] | null;
  maxPrice: number | null;
  minPrice: number | null;
  parentId: number;
  subParentId: number | null;
  type: number;
}

export interface SuggestKeyword {
  brandId: number;
  brandName: string;
  categoryId: number;
  categoryName: string;
  count: number;
  hasHoneyNoti: boolean;
  keyword: string;
  keywordBrand: string;
  keywordDeco: string;
  keywordEng: string;
  line: string;
  parentId: number;
  subParentId: number;
  recommFilters: KeywordItemSub[] | null;
  type: number; // 0: 2차카테고리, 2: 키워드, 5: 브랜드, 6: 브랜드의 라인, 7: 카테고리
}

export type ProductBrand = {
  brand: Brand;
  dateCreated: string;
  dateUpdated: string;
  id: number;
  isDeleted: boolean;
  productId: number;
};

export type ProductCategory = {
  category: Category;
  dateCreated: string;
  dateUpdated: string;
  id: number;
  isDeleted: boolean;
  productId: number;
};

export type ProductLine = {
  dateCreated: string;
  dateUpdated: string;
  groupId: number;
  id: number;
  isDeleted: boolean;
  line: string;
  productId: number;
};

export type BrandFilter = {
  count: number;
  dateCreated: string;
  dateUpdated: string;
  groupId: number;
  id: number;
  isAll: boolean;
  isDeleted: boolean;
  isUse: boolean;
  jobRulebaseDetail: JobRuleBaseDetail;
  name: string;
  nameEng: string;
  parentId: number;
  usePriceAvgGroups: string;
  viewName: string;
};

export type ProductKeyword = {
  dateCreated: string;
  dateUpdated: string;
  dateViewed: string;
  id: number;
  isDeleted: boolean;
  keyword: string;
  keywordFilterJson: string;
  sourceType: 0;
  userId: number;
};

export type GenderCategory<T extends CommonCode> = T & {
  parentCategories: ParentCategory[];
  subParentCategories: SubParentCategory[];
};

export type BrandLine = {
  brandId: number;
  categoryId: number;
  dateCreated: string;
  dateUpdated: string;
  excludeRegex: string;
  groupId: number;
  id: number;
  isDeleted: boolean;
  line: string;
  lineEng: string;
  regex: string;
  searchRegex: string;
  sort: number;
  synonyms: string;
  type: string;
  viewLine: string;
};

export type ProductSearchOption = {
  avgPrice: number;
  avgScorePriceRate: number;
  avgScoreTotal: number;
  brands: BrandFilter[];
  categorySizes: SizeCode[];
  chartLabels: number[];
  chartValues: number[];
  colors: CommonCode[];
  conditions: CommonCode[];
  genders: CommonCode[];
  keywordBrands: Brand[];
  keywordCategories: Category[];
  keywordLines: BrandLine[];
  keywordParentCategories: Category[];
  keywordSubParentCategories: Category[];
  lines: CommonCode[];
  materials: CommonCode[];
  maxGoodPrice: number;
  maxPrice: number;
  minDefaultPrice: number;
  minGoodPrice: number;
  minPrice: number;
  parentCategories: ParentCategory[];
  priceDivide: number;
  quoteTitles: string[];
  scorePrices: CommonCode[];
  scoreSellers: CommonCode[];
  scoreStatus: CommonCode[];
  searchKeyword: string;
  seasons: CommonCode[];
  siteUrls: SiteUrl[];
  sizes: SizeCode[];
  stores: CommonCode[];
  subParentCategories: SubParentCategory[];
  units: CommonCode[];
  genderCategories: GenderCategory<CommonCode>[];
  idFilters: CommonCode[];
  productTotal: number;
  avgLatency: number;
  minLatencyPrice: number;
  minLatency: number;
};

export type ProductSellerReport = {
  dateCreated: string;
  dateUpdated: string;
  description: string;
  deviceId: string;
  id: number;
  isDeleted: boolean;
  productId: number;
  reviewId: number;
  sellerId: number;
  type: number;
  userId: number;
};

export type Site = {
  code: string;
  dateCreated: string;
  dateUpdated: string;
  hasImage: boolean;
  id: number;
  isDeleted: boolean;
  name: string;
  productCount: number | null;
  type: string;
};

export type ProductSellerType = 0 | 1 | 2 | 3 | 4;

export type ProductSeller = {
  account: string;
  count: number;
  curnScore: string;
  dateCreated: string;
  dateUpdated: string;
  grade: string | null;
  id: number;
  image: string;
  isDeleted: boolean;
  maxScore: string;
  name: string;
  phone: string | null;
  productSellerReports: ProductSellerReport[];
  reviewCount: number;
  site: Site;
  totalCount: number;
  type: ProductSellerType;
};

export type SiteUrl = {
  count: number;
  dateCreated: string;
  dateUpdated: string;
  hasImage: boolean;
  honeyCount: number;
  id: number;
  isDeleted: boolean;
  name: string;
  type: string;
  url: string;
};

export type PostType = 0 | 1 | 2; // 0: 크롤링, 1: 판매등록, 2: 감정등록

export type CategorySizes = {
  id: number;
  codeId: number;
  name: string;
  description: string;
  synonyms: string;
  groupId: number;
  sort: number;
  count: number;
  categorySizeId: number;
  parentCategoryId: number;
  viewSize: string;
};

export type Product = {
  area: string;
  brand: Brand;
  brandId: number;
  category: Category;
  categoryId: number;
  categorySizes: CategorySizes[];
  cluster: number;
  color: string | null;
  colors: { id: number; name: string; description: string }[];
  comments: string | null;
  dateChanged: string | null;
  dateCreated: string;
  dateFirstPosted: number;
  datePosted: number;
  datePostedDay: string;
  dateUpdated: number;
  description: string | null;
  genderCode: string;
  hasPopular: boolean;
  id: number;
  imageCount: number;
  imageDetails: string;
  imageDetailsLarge: string | null;
  imageMain: string;
  imageMainLarge: string | null;
  imageThumbnail: string;
  imageModel: string | null;
  isConvertedImage: boolean | null;
  isDeleted: boolean | null;
  isSafeTrade: boolean;
  isWish: boolean | null;
  isProductLegit?: boolean;
  labels: CommonCode[];
  line: string;
  material: string | null;
  postId: string | null;
  price: number;
  priceBefore: number | null;
  productBrands: ProductBrand[] | null;
  productCategories: ProductCategory[] | null;
  productLines: ProductLine[] | null;
  productSearchOptions: ProductSearchOption[] | null;
  productSeller: ProductSeller;
  productLegit: ProductLegit;
  photoGuideImages: PhotoGuideImages[];
  purchaseCount: number;
  photoGuideDetails: Array<{
    commonPhotoGuideDetail: CommonPhotoGuideDetail;
  }> | null;
  postType: PostType;
  quoteTitle: string;
  quoteTitleCount: number | null;
  scorePopular: number;
  scorePrice: number;
  scorePriceAvg: number;
  scorePriceCount: number;
  scorePriceRate: number;
  scoreSeller: number;
  scoreStatus: number;
  scoreTotal: number;
  season: string | null;
  sellerId: number;
  site: Site;
  siteCount: number | null;
  siteId: number;
  siteUrl: SiteUrl;
  size: string | null;
  status: number;
  store: string | null;
  targetProductId: number | null;
  targetProductPrice: number | null;
  targetProductStatus: number | null;
  targetProductUrl?: string;
  title: string;
  unit: string;
  url: string;
  urlApp: string | null;
  urlPrefix: string;
  urlDetail?: string;
  viewCount: number;
  viewDescription: string | null;
  weekAvgPrices: number[] | null;
  wishCount: number;
  index?: number;
  sellerType?: (typeof productType)[keyof typeof productType]; // 0: 크롤링 매물 1: 사용자 판매자 2: 인증 판매자 3: 감정사 판매자
  purchaseType: 0 | 1 | 2 | 3; // 결제X / C2C / 구매대행 + 정품감정 / 구매대행
};

export type ProductResult = {
  area: string | null;
  brand: {
    dateCreated: string;
    dateUpdated: string;
    groupId: number;
    tierId: number;
    id: number;
    isLegitProduct: boolean;
    name: string;
    nameEng: string;
    viewName: string | null;
    parentId: number;
  };
  category: {
    dateCreated: string | null;
    dateUpdated: string | null;
    depth: number | null;
    groupId: number | null;
    id: number;
    isAuthProduct: boolean;
    jobRulebaseDetail: JobRuleBaseDetail;
    name: string;
    nameEng: string | null;
    order: number | null;
    parentId: number | null;
    subParentId: number | null;
  };
  cluster: number;
  dateChanged: number | null;
  dateFirstPosted: number;
  datePosted: number;
  id: number;
  imageDetails: string;
  imageMain: string;
  imageThumbnail: string;
  isNoSellerReviewAndHasTarget: boolean;
  imageMainLarge: string;
  imageDetailsLarge: string;
  imageModel: string | null;
  labels: CommonCode[];
  price: number;
  priceBefore: number | null;
  productSeller: ProductSeller;
  productLegit: ProductLegit;
  purchaseCount: number;
  postType: PostType;
  site: {
    code: string;
    dateCreated: string;
    dateUpdated: string;
    hasImage: boolean;
    id: number;
    name: string;
    productCount: number | null;
    type: string;
  };
  siteUrl: SiteUrl;
  status: number;
  scoreTotal: number;
  scorePriceRate: number | null;
  title: string;
  viewCount: number;
  wishCount: number;
  targetProductPrice: number | null;
  targetProductId?: number | null;
  targetProductStatus?: number | null;
  targetProductUrl?: string | null;
  isWish: boolean;
  todayViewCount: number;
  todayWishCount: number;
  priceDownCount: number;
  updatedCount: number;
  photoGuideDetails: {
    commonPhotoGuideDetail: CommonPhotoGuideDetail;
    dateCreated: string;
    dateUpdated: string;
    id: number;
    imageSize: number;
    imageUrl: string;
    isEdit: boolean;
    productId: number;
    staticImageUrl: string;
  }[];
  quoteTitle: string;
  description: string;
  isDeleted: boolean | null;
  sellerType?: (typeof productType)[keyof typeof productType];
  sellerUserId?: number;
  size: string | null;
};

export type PageProduct = Paged<Product>;

export type ProductDynamicOptionCodeType = 0 | 1 | 2 | 3 | 4 | 5;

export type ProductDynamicOptionCodeDetail = CommonCode | SizeCode | PriceCode | CategoryCode;

export type ProductDynamicLineOption = {
  name: string;
  codeType: Extract<ProductDynamicOptionCodeType, 0>;
  codeDetails: Extract<ProductDynamicOptionCodeDetail, CommonCode>[];
};

export type ProductDynamicSizeOption = {
  name: string;
  codeType: Extract<ProductDynamicOptionCodeType, 1>;
  codeDetails: Extract<ProductDynamicOptionCodeDetail, SizeCode>[];
};

export type ProductDynamicPriceOption = {
  name: string;
  codeType: Extract<ProductDynamicOptionCodeType, 2>;
  codeDetails: Extract<ProductDynamicOptionCodeDetail, PriceCode>[];
};

export type ProductDynamicColorOption = {
  name: string;
  codeType: Extract<ProductDynamicOptionCodeType, 3>;
  codeDetails: Extract<ProductDynamicOptionCodeDetail, CommonCode>[];
};

export type ProductDynamicBrandOption = {
  name: string;
  codeType: Extract<ProductDynamicOptionCodeType, 4>;
  codeDetails: Extract<ProductDynamicOptionCodeDetail, CommonCode>[];
};

export type ProductDynamicCategoryOption = {
  name: string;
  codeType: Extract<ProductDynamicOptionCodeType, 5>;
  codeDetails: Extract<ProductDynamicOptionCodeDetail, CommonCode>[];
};

export type ProductDynamicOption =
  | ProductDynamicLineOption
  | ProductDynamicSizeOption
  | ProductDynamicPriceOption
  | ProductDynamicColorOption
  | ProductDynamicBrandOption
  | ProductDynamicCategoryOption;

export type RelatedKeyword = {
  brandId: number;
  categoryId: number;
  lineId: number;
  keyword: string;
};

export interface Search {
  aiProductTotal: number;
  notUsedBrands: string[];
  page: PageProduct;
  productCounts: number[];
  productTotal: number;
  relatedKeywords: RelatedKeyword[];
  relatedCategoryIds: number[];
  relatedQuoteTitles?: string[];
  baseSearchOptions?: ProductSearchOption;
  searchOptions: ProductSearchOption;
  dynamicOptions: ProductDynamicOption[];
  sellerTotal: number;
  userWishProductIds: number[];
  userProductKeyword?: ProductKeyword;
  viewGoodPrice: boolean;
  resultUseAI?: boolean;
}

export interface ProductDetail {
  product: Product;
  channels: Channel[];
  noSellerReviewAndHasTarget: boolean;
  productLegit: boolean;
  productSearchOptions: ProductSearchOption;
  quoteTitleCount: number;
  relatedProducts: Product[];
  relatedKeywords: string[];
  reportCount: number;
  roleSeller: UserRoleSeller | null;
  blockUser: boolean;
  showReviewPrompt: boolean;
  wish: boolean;
  sizeOptions: CommonCode[];
  units: CommonCode[];
  stores: CommonCode[];
  distances: CommonCode[];
  offers: ProductOffer[];
  orderInfo: Order;
  hasOrder: boolean;
}

export interface OrderInfo {
  fee: number;
  price: number;
  totalPrice: number;
  orderFees: OrderFees[];
}

export interface OrderFees {
  type: 0 | 1 | 2;
  name: string;
  fee: number;
  totalFee: number;
  discountFee: number;
  feeRate: number;
}

export type ProductSellerReview = {
  content: string;
  creator: string;
  dateCreated: string;
  dateUpdated: string;
  id: number;
  isDeleted: boolean;
  isReport: boolean;
  postId: string;
  productId: number;
  reportStatus: number;
  score: string;
  sellerId: number;
};

export type PageProductSellerReview = {
  content: ProductSellerReview[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: Page;
  size: number;
  sort: Sort;
  totalElements: number;
  totalPages: number;
};

export interface SellerReview {
  curnScore: string | null;
  maxScore: string;
  productSeller: ProductSeller;
  sellerReviews: PageProductSellerReview;
  sellerType: number;
  site: Site;
  siteUrl: SiteUrl;
  totalCount: number;
  dateActivated: string;
}

export type ProductOrder = 'postedDesc' | 'postedAllDesc' | 'recommDesc' | 'priceAsc' | 'priceDesc';

export type PageProductResult = Paged<ProductResult>;

export interface ProductContent {
  contents: Contents;
}

export interface ProductDetailKeyword {
  brand: Brand;
  category: Category;
  categoryThumbnail: string;
  relatedKeywords: string[];
}

export interface SellerInfo {
  curnScore: string | null;
  maxScore: string | null;
  image: string | null;
  name: string;
  productCount: number;
  reviewCount: number;
  site: Site;
  sellerType: (typeof productType)[keyof typeof productType]; // 0: 크롤링 매물 1: 사용자 판매자 2: 인증 판매자 3: 감정사 판매자
}

/* ---------- Request Parameters ---------- */
export interface ProductParams {
  deviceId?: string;
  isLogging?: boolean;
  productId: number;
  redirect?: boolean;
  source?: string;
}

export interface ReviewInfoParams {
  page?: number;
  sellerId: number;
  size?: number;
  sort?: string[];
}

export type SellerProductsParams = ReviewInfoParams;

export interface SearchParams {
  brandIds?: number[];
  brands?: string | string[];
  categories?: string | string[];
  categoryIds?: number[];
  categorySizeIds?: number[];
  // cluster?: number;
  collaboIds?: number[];
  colorIds?: number[];
  colors?: string | string[];
  deviceId?: string;
  distance?: number;
  genderIds?: number[];
  genders?: string | string[];
  idFilterIds?: number[];
  isCrm?: boolean;
  keyword?: string;
  order?: ProductOrder;
  lineIds?: number[];
  lines?: string | string[];
  logging?: boolean;
  materialIds?: number[];
  materials?: string | string[];
  maxPrice?: number;
  minPrice?: number;
  page?: number;
  parentIds?: number[];
  requiredBrands?: string | string[];
  requiredBrandIds?: number[];
  requiredLineIds?: number[];
  scorePrice?: number;
  scorePriceCount?: number;
  scorePriceRate?: number;
  scoreSeller?: number;
  scoreStatus?: number;
  scoreTotal?: number;
  seasonIds?: number[];
  seasons?: string[];
  siteUrlIds?: number[];
  size?: number;
  sizes?: string[];
  sizeIds?: number[];
  store?: number;
  subParentIds?: number[];
  unit?: number;
  conditionIds?: number[];
  searchType?: 'camel';
  title?: string;
}

export interface SearchAiProductParams {
  brandIds?: number[];
  categoryIds?: number[];
  keyword?: string;
  limitHour?: number;
  page?: number;
  parentId?: number;
  size?: number;
  sort?: string[];
}

export interface SellerReportParams {
  creator?: string;
  description?: string;
  deviceId?: string;
  productId: number;
  reportType: number;
  reviewId?: number;
  userId?: number;
  sellerId?: number;
}

export interface SearchRelatedProductsParams {
  brandIds?: number[];
  categoryIds?: number[];
  line?: string;
  related?: number;
  size?: number | string;
  quoteTitle?: string;
  price?: number;
  productId?: number;
  sizes?: string[];
}

export interface SearchLowerProductsParams extends SearchRelatedProductsParams {
  idFilterIds?: number;
  scorePriceAvg?: number;
}

export interface RecommProductsParams {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface CamelProductsParams {
  page?: number;
  size?: number;
  order?: string;
  sort?: string[];
  type?: string[]; // default "recomm"
  idFilters?: number[];
}

export interface UserPersonalStyleParams {
  parentCategoryIds?: number[];
  purchaseTypeIds?: number[];
  styleIds?: number[];
  subParentCategoryIds?: number[];
}

export interface RecentSearchParams extends Omit<SearchParams, 'order'> {
  order?: 'updatedDesc' | ProductOrder;
}
