import { atom } from 'recoil';

import type { ContentProductsParams } from '@dto/common';

export const eventContentProductsParamsState = atom<ContentProductsParams>({
  key: 'event/contentProductsParamsState',
  default: {
    id: 0,
    brandIds: [],
    keyword: '',
    size: 30
  }
});

export const eventContentDogHoneyScrollTopState = atom({
  key: 'event/contentDogHoneyScrollTop',
  default: 0
});

export const eventContentDogHoneyFilterOffsetTopState = atom({
  key: 'event/contentDogHoneyFilterOffsetTopState',
  default: 0
});

export const eventContentDogHoneyFilterState = atom({
  key: 'event/contentDogHoneyFilterState',
  default: {
    selectedIndex: 0,
    prevScroll: 0,
    totalElements: 0
  }
});
