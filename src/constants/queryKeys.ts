import compact from 'lodash-es/compact';

import type { ManageParams } from '@dto/userHistory';
import type { CategoryWishesParams } from '@dto/user';
import type {
  CamelProductsParams,
  LegitProductsParams,
  ProductParams,
  RecommProductsParams,
  ReviewInfoParams,
  SearchAiProductParams,
  SearchParams,
  SearchRelatedProductsParams,
  SellerProductsParams
} from '@dto/product';
import type { SuggestParams } from '@dto/brand';

import { RECENT_SEARCH_LIST } from '@constants/localStorage';

const brands = {
  all: ['brands'] as const,
  brand: (brandId: number) => [...brands.all, brandId] as const,
  hotBrands: () => [...brands.all, 'hotBrands'] as const,
  brandName: (value?: string) => [...brands.all, 'brandName', value] as const,
  suggest: (params: SuggestParams) => [...brands.all, 'suggest', params] as const
};

const categories = {
  all: ['categories'] as const,
  parentCategories: () => [...categories.all, 'parentCategories'] as const
};

const personals = {
  all: ['personals'] as const,
  baseInfo: (deviceId?: string | null) => compact([...personals.all, 'baseInfo', deviceId])
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
  searchAiProduct: (params?: SearchAiProductParams) =>
    compact([...products.all, 'searchAiProduct', params]),
  searchRelatedProducts: (params?: SearchRelatedProductsParams) =>
    compact([...products.all, 'searchRelatedProducts', params]),
  productLegit: (params: ProductParams) => [...products.all, 'productLegit', params] as const,
  legitProducts: (params?: LegitProductsParams) =>
    [...products.all, 'legitProducts', params] as const,
  keywordsSuggest: (keyword: string) => [...products.all, 'keywordsSuggest', keyword] as const,
  recommProducts: (params?: RecommProductsParams) =>
    compact([...products.all, 'recommProducts', params]),
  camelProducts: (params?: CamelProductsParams) =>
    compact([...products.all, 'camelProducts', params])
};

const users = {
  all: ['users'] as const,
  userInfo: () => [...users.all, 'userInfo'] as const,
  userSuggest: () => [...users.all, 'userSuggest'] as const,
  categoryWishes: (params?: CategoryWishesParams) =>
    compact([...users.all, 'categoryWishes', params]),
  userHistory: (pageNumber: number) => [...users.all, 'userHistory', pageNumber] as const,
  userHoneyNoti: () => [...users.all, 'userHoneyNoti'] as const,
  userNoti: (type: number) => [...users.all, 'userNoti', type] as const,
  userHistoryManages: (event: string) => [...users.all, 'userHistoryManages', event] as const,
  sizeMapping: () => [...users.all, 'sizeMapping'] as const,
  userProductKeywords: () => [...users.all, 'userProductKeywords'] as const,
  legitTargets: () => [...users.all, 'legitTargets'] as const,
  legitProducts: () => [...users.all, 'legitProducts'] as const,
  recommWishes: () => [...users.all, 'recommWishes'] as const,
  productKeywordProducts: (id: number) => [...users.all, 'productKeywordProducts', id] as const
};

const userAuth = {
  all: ['userauth'] as const,
  accessUser: () => [...userAuth.all, 'accessUser'] as const,
  logout: () => [...userAuth.all, 'logout'] as const,
  withdraw: () => [...userAuth.all, 'withdraw'] as const
};

const userHistory = {
  all: ['userhistory'] as const,
  manage: (params: ManageParams) => [...userHistory.all, 'manage', params] as const
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
  recentSearchList: () => [...client.all, RECENT_SEARCH_LIST] as const
};

const dashboard = {
  all: ['dashboard'] as const,
  legitDashboard: () => [...dashboard.all, 'legitDashboard'] as const
};

const model = {
  all: ['model'] as const,
  suggest: () => [...model.all, 'suggest'] as const,
  keyword: (value: string) => [...model.all, value] as const
};

const common = {
  all: ['common'],
  contentsProducts: (contentsId: number) => [...common.all, 'contentsProducts', contentsId] as const
};

const queryKeys = {
  brands,
  categories,
  personals,
  products,
  users,
  userAuth,
  userHistory,
  logs,
  dashboard,
  nextJs,
  client,
  model,
  common
};

export default queryKeys;
