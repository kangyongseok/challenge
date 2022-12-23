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

export const legitFiltersState = atom({
  key: 'legit/filtersState',
  default: {
    initialized: false,
    legitFilters: [
      { result: 1, status: 30, label: '정품의견', count: 0, isActive: false },
      { result: 2, status: 30, label: '가품의심', count: 0, isActive: false },
      { result: 0, status: 20, label: '감정중', count: 0, isActive: false }
    ]
  }
});

export const legitOpenRecommendBottomSheetState = atom({
  key: 'legit/openRecommendBottomSheetState',
  default: false
});
