import type { CategorySizes, ParentCategories } from '@dto/category';

import Axios from '@library/axios';

const BASE_PATH = '/categories';

export async function fetchParentCategories() {
  const { data } = await Axios.getInstance().get<{
    legitParentCategories: Omit<ParentCategories, 'subParentCategories'>[];
    parentCategories: ParentCategories[];
    productParentCategories: Omit<ParentCategories, 'subParentCategories'>[];
  }>(`${BASE_PATH}/parentCategories`);

  return data;
}

export async function fetchCategorySizes(params: { brandId: number; categoryId: number }) {
  const { data } = await Axios.getInstance().get<CategorySizes[]>(`${BASE_PATH}/categorySizes`, {
    params
  });
  return data;
}
