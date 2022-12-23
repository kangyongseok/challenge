import { atom } from 'recoil';

import type { ProductLegitsParams } from '@dto/productLegit';

export const defaultSearchFilterParamsState: ProductLegitsParams = {
  size: 30,
  results: [0, 1, 2],
  status: [20, 30]
};

export const legitSearchFilterParamsState = atom<ProductLegitsParams>({
  key: 'legitSearch/filterParamsState',
  default: {
    size: 30,
    results: [],
    status: []
  }
});

export const legitSearchActiveFilterParamsState = atom<ProductLegitsParams>({
  key: 'legitSearch/activeFilterParamsState',
  default: defaultSearchFilterParamsState
});
