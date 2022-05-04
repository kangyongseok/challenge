import axios from '@library/axios';

import { Brand } from '@dto/brand';

const BASEPATH = '/brands'

export async function fetchBrands(): Promise<Brand[]> {
  const { data: { brands = [] } = { brands: [] } } = await axios.get<{
    brands: Brand[];
  }>(BASEPATH);

  return brands;
}
