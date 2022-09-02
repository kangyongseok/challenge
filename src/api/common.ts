import { ProductContent } from '@dto/product';

import Axios from '@library/axios';

const BASE_PATH = '/commons';

export async function fetchContentsProducts(contentsId: number) {
  const { data } = await Axios.getInstance().get<ProductContent>(
    `${BASE_PATH}/contentsProducts/${contentsId}`
  );

  return data;
}
