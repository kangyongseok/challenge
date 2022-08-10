import { atom, atomFamily } from 'recoil';

import type { ProductOrder, SearchParams } from '@dto/product';

export const homeCamelProductCurationPrevScrollState = atom({
  key: 'home/camelProductCurationPrevScrollState',
  default: 0
});

export const homeCamelSearchParamsState = atom<Partial<SearchParams>>({
  key: 'home/camelSearchParamsState',
  default: {
    size: 8,
    siteUrlIds: [161],
    order: 'recommDesc' as ProductOrder
  }
});

export const homePersonalProductCurationPrevScrollState = atom({
  key: 'home/personalProductCurationPrevScrollState',
  default: 0
});

export const homeSelectedTabStateFamily = atomFamily<
  {
    selectedIndex: number;
    prevScroll: number;
  },
  'productKeyword' | 'recentSearch'
>({
  key: 'home/selectedTabStateFamily',
  default: {
    selectedIndex: 0,
    prevScroll: 0
  }
});
