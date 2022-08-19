import { atom } from 'recoil';

import type { LegitProductsParams } from '@dto/product';

export const legitCompleteGridParamsState = atom<LegitProductsParams>({
  key: 'legit/legitCompleteGridParamsState',
  default: {
    page: 0,
    size: 8,
    results: [],
    isOnlyResult: true
  }
});
