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
