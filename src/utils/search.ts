import find from 'lodash-es/find';

import LocalStorage from '@library/localStorage';

import { RECENT_SEARCH_LIST } from '@constants/localStorage';

import { calculateExpectCountPerHour } from '@utils/formats';

import type { RecentItems } from '@typings/search';

export function accumulateStorage(key: string, data: RecentItems) {
  const originData = (LocalStorage.get(key) as object[]) || [];
  if (find(originData, { keyword: data.keyword })) return;
  originData.unshift(data);
  LocalStorage.set(key, originData);
}

export function checkRecentListHasExpectPrice() {
  const recentList = LocalStorage.get(RECENT_SEARCH_LIST) as RecentItems[];
  if (!recentList) {
    LocalStorage.set(RECENT_SEARCH_LIST, []);
    return;
  }

  const hasExpectCount = recentList.every(
    (product) => product.expectCount && product.expectCount >= 0
  );

  if (!hasExpectCount) {
    const updatedList: RecentItems[] = [];
    recentList.forEach((product) => {
      if (!product.expectCount) {
        /* eslint-disable no-param-reassign */
        product.expectCount = calculateExpectCountPerHour(Number(product.count));
      }
      updatedList.push(product);
    });

    LocalStorage.set(RECENT_SEARCH_LIST, updatedList);
  }
}
