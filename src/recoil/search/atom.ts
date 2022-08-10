import { atom } from 'recoil';

import LocalStorage from '@library/localStorage';

import { RECENT_SEARCH_LIST } from '@constants/localStorage';

import calculateExpectCountPerHour from '@utils/calculateExpectCountPerHour';

import { RecentItems } from '@typings/search';

export const searchRecentSearchListState = atom<RecentItems[]>({
  key: 'search/recentSearchListState',
  default: [],
  effects: [
    ({ onSet, setSelf }) => {
      const recentSearchList = LocalStorage.get<RecentItems[]>(RECENT_SEARCH_LIST);

      if (recentSearchList) {
        if (recentSearchList.some((product) => !product.expectCount || product.expectCount === 0)) {
          const updatedList = recentSearchList.map((product) =>
            product.expectCount
              ? product
              : { ...product, expectCount: calculateExpectCountPerHour(Number(product.count)) }
          );

          LocalStorage.set(RECENT_SEARCH_LIST, updatedList);
          setSelf(updatedList);
        } else {
          setSelf(recentSearchList);
        }
      }

      onSet((newValue, _, isReset) => {
        if (isReset) {
          LocalStorage.remove(RECENT_SEARCH_LIST);
        } else {
          LocalStorage.set(RECENT_SEARCH_LIST, newValue);
        }
      });
    }
  ]
});
