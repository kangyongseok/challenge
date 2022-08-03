import type { ManageParams } from '@dto/userHistory';
import type { CategoryWishesParams } from '@dto/user';
import type {
  LegitProductsParams,
  ProductParams,
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
  baseInfo: (deviceId?: string | null) =>
    deviceId
      ? ([...personals.all, 'baseInfo', deviceId] as const)
      : ([...personals.all, 'baseInfo'] as const)
};

const products = {
  all: ['products'] as const,
  product: (params: ProductParams) => [...products.all, 'product', params] as const,
  productLogging: (params: ProductParams) => [...products.all, 'productLogging', params] as const,
  relatedProducts: (productId: number) => [...products.all, 'relatedProducts', productId] as const,
  reviewInfo: (params: ReviewInfoParams) => [...products.all, 'reviewInfo', params] as const,
  sellerProducts: (params: SellerProductsParams) =>
    [...products.all, 'sellerProducts', params] as const,
  search: (params?: SearchParams) =>
    params
      ? ([...products.all, 'search', params] as const)
      : ([...products.all, 'search'] as const),
  searchOptions: (params?: SearchParams) =>
    params
      ? ([...products.all, 'searchOptions', params] as const)
      : ([...products.all, 'searchOptions'] as const),
  searchAiProduct: (params?: SearchAiProductParams) =>
    params
      ? ([...products.all, 'searchAiProduct', params] as const)
      : ([...products.all, 'searchAiProduct'] as const),
  searchRelatedProducts: (params?: SearchRelatedProductsParams) =>
    params
      ? ([...products.all, 'searchRelatedProducts', params] as const)
      : ([...products.all, 'searchRelatedProducts'] as const),
  userInfo: () => [...products.all, 'userInfo'] as const,
  productLegit: (params: ProductParams) => [...products.all, 'productLegit', params] as const,
  legitProducts: (params?: LegitProductsParams) =>
    [...products.all, 'legitProducts', params] as const
};

const users = {
  all: ['users'] as const,
  userInfo: () => [...users.all, 'userInfo'] as const,
  userSuggest: () => [...users.all, 'userSuggest'] as const,
  categoryWishes: (params?: CategoryWishesParams) =>
    params
      ? ([...users.all, 'categoryWishes', params] as const)
      : ([...users.all, 'categoryWishes'] as const),
  userHistory: (pageNumber: number) => [...users.all, 'userHistory', pageNumber] as const,
  userHoneyNoti: () => [...users.all, 'userHoneyNoti'] as const,
  userNoti: (type: number) => [...users.all, 'userNoti', type] as const,
  userHistoryManages: (event: string) => [...users.all, 'userHistoryManages', event] as const,
  sizeMapping: () => [...users.all, 'sizeMapping'] as const,
  userProductKeywords: () => [...users.all, 'userProductKeywords'] as const,
  legitTargets: () => [...users.all, 'legitTargets'] as const,
  legitProducts: () => [...users.all, 'legitProducts'] as const
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
  client
};

export default queryKeys;
