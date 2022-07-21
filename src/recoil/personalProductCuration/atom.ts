import { atom } from 'recoil';

import type { Product, SearchAiProductParams } from '@dto/product';

const personalProductCurationState = atom<Product[][]>({
  key: 'personalProductCurationState',
  default: []
});

export const searchParamsState = atom<SearchAiProductParams>({
  key: 'personalProductCuration/searchParamsState',
  default: {
    size: 30,
    brandIds: [],
    categoryIds: [],
    page: 0
  }
});

export const currentSlideState = atom({
  key: 'personalProductCuration/currentSlideState',
  default: 0
});

export default personalProductCurationState;
