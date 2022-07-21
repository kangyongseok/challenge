import type { AllBrand, Brand } from '@dto/brand';
import { SuggestParams } from '@dto/brand';

import Axios from '@library/axios';

const BASE_PATH = '/brands';

export async function postBrands(brandIds: string[]) {
  await Axios.getInstance().post(BASE_PATH, { brandIds });
}

export async function fetchBrands() {
  const { data: { brands = [] } = { brands: [] } } = await Axios.getInstance().get<{
    brands: AllBrand[];
  }>(BASE_PATH);

  return brands;
}

export async function fetchBrandsSuggestWithCollabo(keyword: string) {
  const { data: { brands = [] } = { brands: [] } } = await Axios.getInstance().get<{
    brands: AllBrand[];
  }>(`${BASE_PATH}/suggest?useCollabo=true&keyword=${keyword}`);

  return brands;
}

export async function fetchBrandsSuggest(params: SuggestParams) {
  const { data: { brands = [] } = { brands: [] } } = await Axios.getInstance().get<{
    brands: AllBrand[];
  }>(`${BASE_PATH}/suggest`, {
    params
  });

  return brands;
}

export async function fetchHotBrands() {
  const { data: { brands = [] } = { brands: [] } } = await Axios.getInstance().get<{
    brands: Brand[];
  }>(`${BASE_PATH}/hotBrands`);

  return brands;
}
