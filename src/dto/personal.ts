import type { PageProductResult } from './product';
import type { Category } from './category';
import type { Brand } from './brand';

export type AiCategory = {
  brand: Brand | null;
  brandIds: number | null;
  categories: Category[];
  category: Category;
  searchTag: string | null;
  uniqueViewCount: number | null;
  viewTag: string;
};

export interface Base {
  aiCategories: AiCategory[];
  isLogin: boolean;
  welcomeImage: string | null;
  welcomeText: string | null;
}

export interface GuideProductsParams {
  guideType?: 10 | 20 | 30 | 40;
  name?: string;
}

export interface RecommendProductsParams {
  page?: number;
  size: number;
  sort?: string[];
  useStyle: boolean;
}

export interface RecommendProducts {
  brand: Brand;
  category: Category;
  products: PageProductResult;
  title: string;
  name: string;
  imageMain: string;
  idFilter: string;
  distance: string;
  purchaseTypeValue: 10 | 20 | 30 | 40;
}

export type GuideProducts = RecommendProducts;

export type PersonalProductsParams = {
  page?: number;
  size?: number;
};
