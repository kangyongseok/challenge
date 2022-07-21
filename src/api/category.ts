import type { ParentCategories } from '@dto/category';

import Axios from '@library/axios';

const BASE_PATH = '/categories';

export async function fetchParentCategories() {
  const { data: { parentCategories = [] } = { parentCategories: [] } } =
    await Axios.getInstance().get<{
      parentCategories: ParentCategories[];
    }>(`${BASE_PATH}/parentCategories`);

  return parentCategories;
}
