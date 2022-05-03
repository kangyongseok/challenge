import axios from '@library/axios';

import { Brand } from '@dto/brand';

export async function fetchBrands(): Promise<Brand[]> {
  const { data: { brands = [] } = { brands: [] } } = await axios.get<{
    brands: Brand[];
  }>('/brands');

  return brands;
}
