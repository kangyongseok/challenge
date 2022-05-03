import axios from '@library/axios';

import { Brand } from '@dto/brand';

export async function fetchBrands(): Promise<{
  brands: Brand[];
}> {
  const { data } = await axios.get<{
    brands: Brand[];
  }>('/brands');

  return data;
}
