import Axios from '@library/axios';

import { Brand } from '@dto/brand';

const BASE_PATH = '/brands';

export async function fetchBrands() {
  const { data: { brands = [] } = { brands: [] } } = await Axios.getInstance().get<{
    brands: Brand[];
  }>(BASE_PATH);

  return brands;
}
