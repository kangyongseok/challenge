import type { CommonCode, JobRuleBaseDetail, Page, Paged, SizeCode, Sort } from './common';
import type { Category, ParentCategory, SubParentCategory } from './category';
import type { Brand } from './brand';

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
  type: number;
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

export type ProductSeller = {
  account: string;
  count: number;
  curnScore: string;
  dateCreated: string;
  dateUpdated: string;
  grade: string | null;
  id: number;
  isDeleted: boolean;
  maxScore: string;
  name: string;
  phone: string | null;
  productSellerReports: ProductSellerReport[];
  reviewCount: number;
  site: Site;
  totalCount: number;
  type: number;
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

export type Product = {
  area: string;
  brand: Brand;
  brandId: number;
  category: Category;
  categoryId: number;
  cluster: number;
  color: string | null;
  comments: string | null;
  dateChanged: number | null;
  dateCreated: number;
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
  isConvertedImage: boolean | null;
  isDeleted: boolean | null;
  isSafeTrade: boolean;
  isWish: boolean | null;
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
  purchaseCount: number;
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
  title: string;
  unit: string;
  url: string;
  urlApp: string | null;
  urlPrefix: string;
  viewCount: number;
  viewDescription: string | null;
  weekAvgPrices: number[] | null;
  wishCount: number;
  index?: number;
};

export type ProductResult = {
  area: string;
  cluster: number;
  dateChanged: number | null;
  dateFirstPosted: number;
  datePosted: number;
  id: number;
  imageDetails: string;
  imageMain: string;
  imageThumbnail: string;
  labels: CommonCode[];
  price: number;
  priceBefore: number | null;
  productSeller: ProductSeller;
  purchaseCount: number;
  site: Site;
  siteUrl: SiteUrl;
  status: number;
  title: string;
  viewCount: number;
  wishCount: number;
};

export type PageProduct = Paged<Product>;

export interface Search {
  aiProductTotal: number;
  notUsedBrands: string[];
  page: PageProduct;
  productCounts: number[];
  productTotal: number;
  relatedCategoryIds: number[];
  relatedQuoteTitles?: string[];
  baseSearchOptions?: ProductSearchOption;
  searchOptions: ProductSearchOption;
  sellerTotal: number;
  userWishProductIds: number[];
  userProductKeyword?: ProductKeyword;
  viewGoodPrice: boolean;
}

export interface ProductDetail {
  product: Product;
  productSearchOptions: ProductSearchOption;
  quoteTitleCount: number;
  relatedKeywords: string[];
  reportCount: number;
  showReviewPrompt: boolean;
  wish: boolean;
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
}

export type ProductOrder = 'postedDesc' | 'postedAllDesc' | 'recommDesc' | 'priceAsc' | 'priceDesc';

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
  productId: number;
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
  // datePosted?: string;
  deviceId?: string;
  distance?: number;
  // excludeClusters?: number[];
  // excludeSiteIds?: number[];
  // filter?: number;
  genderIds?: number[];
  genders?: string | string[];
  idFilterIds?: number[];
  isCrm?: boolean;
  keyword?: string;
  // keywordBrands?: {
  //   dateCreated?: string;
  //   dateUpdated?: string;
  //   groupId?: number;
  //   id?: number;
  //   isAll?: boolean;
  //   isDeleted?: boolean;
  //   isUse?: boolean;
  //   jobRulebaseDetail?: {
  //     deleted?: boolean;
  //     detail?: string;
  //     id?: number;
  //     keyword?: string;
  //     rulebaseId?: number;
  //     score?: string;
  //     synonym?: string;
  //   };
  //   name?: string;
  //   nameEng?: string;
  //   parentId?: number;
  //   usePriceAvgGroups?: string;
  //   viewName?: string;
  // }[];
  // keywordCategories?: {
  //   dateCreated?: string;
  //   dateUpdated?: string;
  //   depth?: number;
  //   groupId?: number;
  //   id?: number;
  //   isDeleted?: boolean;
  //   jobRulebaseDetail?: {
  //     deleted?: boolean;
  //     detail?: string;
  //     id?: number;
  //     keyword?: string;
  //     rulebaseId?: number;
  //     score?: string;
  //     synonym?: string;
  //   };
  //   name?: string;
  //   nameEng?: string;
  order?: ProductOrder;
  //   parentId?: number;
  //   subParentId?: number;
  // }[];
  // keywordLines?: {
  //   brandId?: number;
  //   categoryId?: number;
  //   dateCreated?: string;
  //   dateUpdated?: string;
  //   excludeRegex?: string;
  //   groupId?: number;
  //   id?: number;
  //   isDeleted?: boolean;
  //   line?: string;
  //   lineEng?: string;
  //   regex?: string;
  //   searchRegex?: string;
  //   sort?: number;
  //   synonyms?: string;
  //   type?: string;
  //   viewLine?: string;
  // }[];
  // line?: string;
  lineIds?: number[];
  lines?: string | string[];
  logging?: boolean;
  materialIds?: number[];
  materials?: string | string[];
  maxPrice?: number;
  minPrice?: number;
  page?: number;
  parentIds?: number[];
  // priceType?: number;
  // related?: number;
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
  // sellerIds?: number[];
  siteUrlIds?: number[];
  size?: number;
  // sizeIds?: number[];
  sizes?: string[];
  // sort?: string[];
  // source: string;
  store?: number;
  subParentIds?: number[];
  unit?: number;
  // x: string;
  // y: string;
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
}

export interface SearchRelatedProductsParams {
  brandIds?: number[];
  // brands?: string[];
  // categories?: string[];
  categoryIds?: number[];
  // categorySizeIds?: number[];
  // cluster?: number[];
  // collaboIds?: number[];
  // colorIds?: number[];
  // colors?: string[];
  // dateFrom?: string;
  // datePosted?: string;
  // distance?: number;
  // excludeClusters?: number[];
  // excludeSiteIds: number[];
  // filter: number;
  // genderIds: number[];
  // genders: string[];
  // idFilterIds: number[];
  // isCrm?: boolean;
  // keyword: string;
  // keywordBrands: Brand[];
  // keywordCategories?: Category[];
  // keywordLines?: BrandLine[];
  line?: string;
  // lineIds?: number[];
  // lines?: string[];
  // logging?: boolean;
  // materialIds?: number[];
  // materials?: string[];
  // maxPrice?: number;
  // minPrice?: number;
  // order?: string;
  // page?: number;
  // parentIds?: number[];
  // priceType?: number[];
  related?: number;
  // requiredBrandIds?: number[];
  // requiredLineIds?: number[];
  // scorePrice?: number;
  // scorePriceCount?: number;
  // scorePriceRate?: number;
  // scoreSeller?: number;
  // scoreStatus?: number;
  // scoreTotal?: number;
  // seasonIds?: number[];
  // seasons?: string[];
  // sellerIds?: number[];
  // siteUrlIds?: number[];
  size?: number;
  // sizeIds?: number[];
  // sizes?: string[];
  // sort?: string[];
  // source?: string;
  // store?: number;
  // subParentIds?: number[];
  // unit?: number;
  // x?: string;
  // y?: string;
}
