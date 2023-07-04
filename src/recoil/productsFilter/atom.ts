import { atom, atomFamily } from 'recoil';

import type { AccessUser } from '@dto/userAuth';
import type { ProductSearchOption, SearchParams } from '@dto/product';
import { ProductDynamicOption } from '@dto/product';
import type { SizeCode } from '@dto/common';

import LocalStorage from '@library/localStorage';

import { ACCESS_USER, ACTIVE_MY_FILTER, CLOSE_SAFE_PAYMENT_BANNER } from '@constants/localStorage';

import type { SelectedSearchOption } from '@typings/products';

export const productsFilterStateFamily = atomFamily<
  {
    type: `general-${string}` | `order-${string}` | `legit-${string}`;
    open: boolean;
  },
  `general-${string}` | `order-${string}` | `legit-${string}`
>({
  key: 'productsFilter/stateFamily',
  default: (type) => ({
    type,
    open: false
  })
});

export const productsFilterAtomParamState = atom({
  key: 'productsFilter/atomParamState',
  default: ''
});

export const productsFilterActionStateFamily = atomFamily<
  {
    type: `brand-${string}` | `line-${string}` | `platform-${string}` | `color-${string}`;
    filterValue?: string;
    sortValue?: 'default' | 'asc';
  },
  `brand-${string}` | `line-${string}` | `platform-${string}` | `color-${string}`
>({
  key: 'productsFilter/actionStateFamily',
  default: (type) => ({
    type,
    filterValue: '',
    sortValue: 'default'
  })
});

export const productsFilterProgressDoneState = atom({
  key: 'productsFilter/progressDoneState',
  default: false
});

export const productsFilterTotalCountStateFamily = atomFamily<
  {
    type: `search-${string}` | `searchOption-${string}`;
    count: number;
  },
  `search-${string}` | `searchOption-${string}`
>({
  key: 'productsFilter/totalCountStateFamily',
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

export const dynamicOptionsStateFamily = atomFamily<ProductDynamicOption[], string>({
  key: 'productsFilter/dynamicOptionsState',
  default: []
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
      const accessUser = LocalStorage.get<AccessUser>(ACCESS_USER);

      if (activeMyFilter && accessUser) {
        setSelf(activeMyFilter);
      }

      onSet((newValue, _, isReset) => {
        if (!isReset) {
          LocalStorage.set(ACTIVE_MY_FILTER, newValue);
        }
      });
    }
  ]
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
  key: 'productsFilter/prevScrollTopStateFamily',
  default: (type) => ({
    type,
    prevScrollTop: 0
  })
});

export const productsStatusTriggeredStateFamily = atomFamily<
  {
    type: string;
    triggered: boolean;
  },
  string
>({
  key: 'productsFilter/productsStatusTriggeredStateFamily',
  default: (type) => ({
    type,
    triggered: false
  })
});

export const closeSafePaymentBannerState = atom({
  key: 'productsFilter/closeSafePaymentBannerState',
  default: false,
  effects: [
    ({ onSet, setSelf }) => {
      const closeSafePaymentBanner = LocalStorage.get<boolean>(CLOSE_SAFE_PAYMENT_BANNER) || false;

      setSelf(closeSafePaymentBanner);

      onSet((newValue, _, isReset) => {
        if (isReset) {
          LocalStorage.remove(CLOSE_SAFE_PAYMENT_BANNER);
        } else {
          LocalStorage.set(CLOSE_SAFE_PAYMENT_BANNER, newValue);
        }
      });
    }
  ]
});

export const filterHistoryOpenStateFamily = atomFamily<
  {
    type: string;
    open: boolean;
  },
  string
>({
  key: 'productsFilter/filterHistoryOpenStateFamily',
  default: (type) => ({
    type,
    open: false
  })
});

export const searchAgainKeywordStateFamily = atomFamily<
  {
    type: string;
    searchAgainKeyword: string;
  },
  string
>({
  key: 'productsFilter/searchAgainKeywordStateFamily',
  default: (type) => ({
    type,
    searchAgainKeyword: ''
  })
});

export const searchAgainInputOpenStateFamily = atomFamily<
  {
    type: string;
    open: boolean;
  },
  string
>({
  key: 'productsFilter/searchAgainInputOpenStateFamily',
  default: (type) => ({
    type,
    open: false
  })
});

export default productsFilterStateFamily;
