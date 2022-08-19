import { atom, atomFamily } from 'recoil';

import type { ProductSearchOption, SearchParams } from '@dto/product';
import type { SizeCode } from '@dto/common';

import LocalStorage from '@library/localStorage';

import { ACTIVE_MY_FILTER } from '@constants/localStorage';

import type { SelectedSearchOption } from '@typings/products';

export const productsFilterStateFamily = atomFamily<
  {
    type: `general-${string}` | `map-${string}` | `order-${string}` | `legit-${string}`;
    open: boolean;
  },
  `general-${string}` | `map-${string}` | `order-${string}` | `legit-${string}`
>({
  key: 'productsFilterStateFamily',
  default: (type) => ({
    type,
    open: false
  })
});

export const productsFilterAtomParamState = atom({
  key: 'productsFilterAtomParamState',
  default: ''
});

export const productsFilterActionStateFamily = atomFamily<
  {
    type: `brand-${string}` | `line-${string}` | `platform-${string}`;
    filterValue?: string;
    sortValue?: 'default' | 'asc';
  },
  `brand-${string}` | `line-${string}` | `platform-${string}`
>({
  key: 'productsFilterActionStateFamily',
  default: (type) => ({
    type,
    filterValue: '',
    sortValue: 'default'
  })
});

export const productsFilterProgressDoneState = atom({
  key: 'productsFilterProgressDoneState',
  default: false
});

export const productsFilterTotalCountStateFamily = atomFamily<
  {
    type: `search-${string}` | `searchOption-${string}`;
    count: number;
  },
  `search-${string}` | `searchOption-${string}`
>({
  key: 'productsFilterTotalCountStateFamily',
  default: (type) => ({
    type,
    count: 0
  })
});

export const searchParamsStateFamily = atomFamily<
  {
    type: `base-${string}` | `searchOptions-${string}` | `search-${string}`;
    searchParams: SearchParams;
  },
  `base-${string}` | `searchOptions-${string}` | `search-${string}`
>({
  key: 'productsFilter/searchParamsStateFamily',
  default: (type) => ({
    type,
    searchParams: {}
  })
});

export const searchOptionsStateFamily = atomFamily<
  { type: `base-${string}` | `latest-${string}`; searchOptions: Partial<ProductSearchOption> },
  `base-${string}` | `latest-${string}`
>({
  key: 'productsFilter/searchOptionsStateFamily',
  default: (type) => ({
    type,
    searchOptions: {}
  })
});

export const selectedSearchOptionsStateFamily = atomFamily<
  {
    type: `active-${string}` | `backup-${string}`;
    selectedSearchOptions: SelectedSearchOption[];
  },
  `active-${string}` | `backup-${string}`
>({
  key: 'productsFilter/selectedSearchOptionsStateFamily',
  default: (type) => ({
    type,
    selectedSearchOptions: []
  })
});

export const activeTabCodeIdState = atom({
  key: 'productsFilter/activeTabCodeIdState',
  default: 0
});

export const activeMyFilterState = atom({
  key: 'productsFilter/activeMyFilterState',
  default: false,
  effects: [
    ({ onSet, setSelf }) => {
      const activeMyFilter = LocalStorage.get<boolean>(ACTIVE_MY_FILTER);
      if (activeMyFilter) {
        setSelf(activeMyFilter);
      }

      onSet((newValue, _, isReset) => {
        if (isReset) {
          LocalStorage.remove(ACTIVE_MY_FILTER);
        } else {
          LocalStorage.set(ACTIVE_MY_FILTER, newValue);
        }
      });
    }
  ]
});

export const activeMyFilterReceiveState = atom({
  key: 'productsFilter/activeMyFilterReceiveState',
  default: false
});

export const myFilterIntersectionCategorySizesState = atom<SizeCode[]>({
  key: 'productsFilter/myFilterIntersectionCategorySizesState',
  default: []
});

export const prevScrollTopStateFamily = atomFamily<
  {
    type: string;
    prevScrollTop: number;
  },
  string
>({
  key: 'prevScrollTopStateFamily',
  default: (type) => ({
    type,
    prevScrollTop: 0
  })
});

export default productsFilterStateFamily;
