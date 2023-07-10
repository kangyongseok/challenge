import { atom } from 'recoil';

import type { ProductLegitsParams } from '@dto/productLegit';

export const legitFilterGridParamsState = atom<ProductLegitsParams>({
  key: 'legit/filterGridParamsState',
  default: {
    page: 0,
    size: 16,
    results: [0, 1, 2],
    status: [20, 30]
  }
});

export const legitOpenRecommendBottomSheetState = atom({
  key: 'legit/openRecommendBottomSheetState',
  default: false
});