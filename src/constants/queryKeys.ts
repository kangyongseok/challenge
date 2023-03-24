import compact from 'lodash-es/compact';

import type { ActivityNotiParams, ManageParams } from '@dto/userHistory';
import type {
  CategoryWishesParams,
  ProductsByUserIdParams,
  UserBlockParams,
  UserProductsParams,
  UserReviewsByUserIdParams
} from '@dto/user';
import type {
  OpinionLegitsParams,
  ProductLegitCommentsParams,
  ProductLegitsParams
} from '@dto/productLegit';
import type {
  CamelProductsParams,
  ProductParams,
  RecentSearchParams,
  RecommProductsParams,
  ReviewInfoParams,
  SearchAiProductParams,
  SearchLowerProductsParams,
  SearchParams,
  SearchRelatedProductsParams,
  SellerProductsParams
} from '@dto/product';
import type {
  GuideProductsParams,
  PersonalProductsParams,
  RecommendProductsParams
} from '@dto/personal';
import { OrderSearchParams, ProductOrderParams } from '@dto/order';
import type {
  LegitsBrandsParams,
  LegitsCategoriesParams,
  LegitsModelsParams,
  ModelSuggestParams
} from '@dto/model';
import type { LegitDashboardParams } from '@dto/dashboard';
import type { ContentProductsParams, PhotoGuideParams } from '@dto/common';
import type { ChannelsParams } from '@dto/channel';
import type { SuggestParams } from '@dto/brand';

import { RECENT_SEARCH_LIST } from '@constants/localStorage';

import type { SearchRelatedKeywordsParams } from '@typings/products';
import type { CommonCodeId, SearchHistoryHookType } from '@typings/camelSeller';

const brands = {
  all: ['brands'] as const,
  brand: (brandId: number) => [...brands.all, brandId] as const,
  hotBrands: () => [...brands.all, 'hotBrands'] as const,
  brandName: (value?: string) => [...brands.all, 'brandName', value] as const,
  suggest: (params: SuggestParams) => [...brands.all, 'suggest', params] as const
};

const categories = {
  all: ['categories'] as const,
  parentCategories: () => [...categories.all, 'parentCategories'] as const,
  productParentCategories: () => [...categories.all, 'productParentCategories'] as const,
  imageGroups: () => [...categories.all, 'imageGroups'] as const,
  categorySizes: (params: { brandId: number; categoryId: number }) =>
    [...categories.all, 'categorySizes', params] as const
};

const personals = {
  all: ['personals'] as const,
  baseInfo: (deviceId?: string | null) => compact([...personals.all, 'baseInfo', deviceId]),
  personalProducts: (params: PersonalProductsParams) =>
    [...products.all, 'personalProducts', params] as const,
  guideProducts: (params: GuideProductsParams) => [...personals.all, 'guideProducts', params],
  recommendProducts: (params: RecommendProductsParams) => [
    ...personals.all,
    'recommendProducts',
    params
  ],
  sellerProducts: () => [...personals.all, 'sellerProducts'],
  guideAllProducts: () => [...personals.all, 'guideAllProducts']
};

const products = {
  all: ['products'] as const,
  product: (params: ProductParams) => [...products.all, 'product', params] as const,
  productLogging: (params: ProductParams) => [...products.all, 'productLogging', params] as const,
  relatedProducts: (productId: number) => [...products.all, 'relatedProducts', productId] as const,
  reviewInfo: (params: ReviewInfoParams) => [...products.all, 'reviewInfo', params] as const,
  sellerProducts: (params: SellerProductsParams) =>
    [...products.all, 'sellerProducts', params] as const,
  search: (params?: SearchParams) => compact([...products.all, 'search', params]),
  searchOptions: (params?: SearchParams) => compact([...products.all, 'searchOptions', params]),
  searchMeta: (params?: SearchParams) => compact([...products.all, 'searchMeta', params]),
  searchAiProduct: (params?: SearchAiProductParams) =>
    compact([...products.all, 'searchAiProduct', params]),
  searchRelatedProducts: (params?: SearchRelatedProductsParams) =>
    compact([...products.all, 'searchRelatedProducts', params]),
  keywordsSuggest: (keyword: string) => [...products.all, 'keywordsSuggest', keyword] as const,
  recommProducts: (params?: RecommProductsParams) =>
    compact([...products.all, 'recommProducts', params]),
  camelProducts: (params?: CamelProductsParams) =>
    compact([...products.all, 'camelProducts', params]),
  userInfo: () => [...products.all, 'userInfo'] as const,
  searchHistory: (params?: SearchParams | RecentSearchParams, type?: SearchHistoryHookType) =>
    params
      ? ([...products.all, 'searchHistory', params, type] as const)
      : ([...products.all, 'searchHistory'] as const),
  searchHistoryTopFive: (params?: SearchParams | RecentSearchParams) =>
    [...products.all, 'searchHistoryFive', params] as const,
  sellerModifyProducs: (params: ProductParams) =>
    [...products.all, 'sellerModifyProducs', params] as const,
  searchLowerProducts: (params?: SearchLowerProductsParams) =>
    compact([...products.all, 'searchLowerProducts', params]),
  searchRelatedKeyword: (params: SearchRelatedKeywordsParams) =>
    [...products.all, 'searchRelatedKeyword', params] as const,
  sellerInfo: (sellerId: number) => [...products.all, 'sellerInfo', sellerId] as const,
  sellerEditProduct: (params: ProductParams) =>
    [...products.all, 'sellerEditProduct', params] as const,
  productList: (ids: number[]) => [...products.all, 'productList', ids] as const
};

const productLegits = {
  all: ['productLegits'] as const,
  legits: (params?: ProductLegitsParams) => [...products.all, 'legits', params] as const,
  searchLegits: (params?: ProductLegitsParams) =>
    [...products.all, 'searchLegits', params] as const,
  legit: (productId: number) => [...products.all, 'legit', productId] as const,
  requestLegits: (params?: ProductLegitsParams) =>
    [...products.all, 'requestLegits', params] as const,
  comments: (params: ProductLegitCommentsParams) => [...products.all, 'comments', params] as const,
  opinionLegits: (params: OpinionLegitsParams) =>
    [...productLegits.all, 'opinionLegits', params] as const
};

const users = {
  all: ['users'] as const,
  userInfo: () => [...users.all, 'userInfo'] as const,
  userSuggest: () => [...users.all, 'userSuggest'] as const,
  categoryWishes: (params?: CategoryWishesParams) =>
    compact([...users.all, 'categoryWishes', params]),
  userHistory: (value?: number | string) => [...users.all, 'userHistory', value] as const,
  userHoneyNoti: () => [...users.all, 'userHoneyNoti'] as const,
  userHistoryManages: (event: string) => [...users.all, 'userHistoryManages', event] as const,
  sizeMapping: () => [...users.all, 'sizeMapping'] as const,
  userProductKeywords: () => [...users.all, 'userProductKeywords'] as const,
  userLegitTargets: (userId?: number) => [...users.all, 'userLegitTargets', userId] as const,
  myProductLegits: () => [...users.all, 'myProductLegits'] as const,
  recommWishes: () => [...users.all, 'recommWishes'] as const,
  productKeywordProducts: (id: number) => [...users.all, 'productKeywordProducts', id] as const,
  products: (params?: UserProductsParams) => [...users.all, 'products', params] as const,
  legitProfile: (userId: number) => [...users.all, 'legitProfile', userId] as const,
  simpleUserInfo: () => [...users.all, 'simpleUserInfo'] as const,
  alarms: () => [...users.all, 'alarms'] as const,
  infoByUserId: (userId: number) => [...users.all, 'infoByUserId', userId] as const,
  productsByUserId: (params: ProductsByUserIdParams) =>
    [...users.all, 'productsByUserId', params] as const,
  reviewsByUserId: (params: UserReviewsByUserIdParams) =>
    [...users.all, 'reviewsByUserId', params] as const,
  blocks: (params: UserBlockParams) => [...users.all, 'blocks', params] as const,
  myUserInfo: () => [...users.all, 'myUserInfo'] as const,
  banword: () => [...users.all, 'banword'] as const,
  transfers: () => [...users.all, 'transfers'] as const,
  fixedChannel: (userId: number) => [...users.all, 'fixedChannel', userId] as const,
  userAccounts: () => [...users.all, 'userAccounts'] as const,
  userCerts: () => [...users.all, 'userCerts'] as const
};

const userAuth = {
  all: ['userauth'] as const,
  accessUser: () => [...userAuth.all, 'accessUser'] as const,
  userData: () => [...userAuth.all, 'userData'] as const,
  logout: () => [...userAuth.all, 'logout'] as const,
  withdraw: () => [...userAuth.all, 'withdraw'] as const
};

const models = {
  all: ['models'] as const,
  suggest: (params?: ModelSuggestParams) => [...models.all, 'suggest', params] as const,
  legitsBrands: (params?: LegitsBrandsParams) => compact([...models.all, 'legitsBrands', params]),
  legitsCategories: (params?: LegitsCategoriesParams) =>
    compact([...models.all, 'legitsCategories', params]),
  legitsModels: (params?: LegitsModelsParams) => compact([...models.all, 'legitsModels', params])
};

const commons = {
  all: ['commons'] as const,
  codeDetails: (params: CommonCodeId) => [...commons.all, 'codeDetails', params] as const,
  photoGuide: (params: PhotoGuideParams) => [...commons.all, 'photoGuide', params] as const,
  content: (id: number) => [...commons.all, 'content', id] as const,
  contentProducts: (params: ContentProductsParams) =>
    [...commons.all, 'contentProducts', params] as const,
  contentsProducts: (contentsId: number) =>
    [...commons.all, 'contentsProducts', contentsId] as const,
  announce: (id: number) => [...commons.all, 'announce', id] as const,
  announces: () => [...commons.all, 'announces'] as const,
  styles: () => [...commons.all, 'styles'] as const
};

const userHistory = {
  all: ['userhistory'] as const,
  manage: (params: ManageParams) => [...userHistory.all, 'manage', params] as const,
  userNoti: (params: ActivityNotiParams, userId?: number) =>
    [...users.all, 'userNoti', params, userId] as const
};

const logs = {
  all: ['logs'] as const
};

const nextJs = {
  all: ['nextJs'] as const,
  productDealInfos: () => [...nextJs.all, 'productDealInfos'] as const
};

const client = {
  all: ['client'] as const,
  recentSearchList: () => [...client.all, RECENT_SEARCH_LIST] as const,
  survey: () => [...client.all, 'survey'] as const
};

const dashboards = {
  all: ['dashboards'] as const,
  legit: (params?: LegitDashboardParams) => [...dashboards.all, 'legit', params] as const
};

const channels = {
  all: ['channels'] as const,
  channels: (params: ChannelsParams) => [...channels.all, 'channel', params] as const,
  channel: (channelId: number) => [...channels.all, 'channel', channelId] as const
};

const orders = {
  all: ['orders'] as const,
  productOrder: (params: ProductOrderParams) => [...orders.all, 'productOrder', params] as const,
  order: (id: number) => [...orders.all, 'order', id] as const,
  orderSearch: (params: OrderSearchParams) => [...orders.all, 'orderSearch', params] as const
};

const queryKeys = {
  brands,
  categories,
  personals,
  products,
  productLegits,
  users,
  userAuth,
  userHistory,
  logs,
  dashboards,
  models,
  commons,
  nextJs,
  client,
  channels,
  orders
};

export default queryKeys;
