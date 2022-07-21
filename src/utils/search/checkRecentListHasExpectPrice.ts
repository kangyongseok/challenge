import LocalStorage from '@library/localStorage';

import { RECENT_SEARCH_LIST } from '@constants/localStorage';

import type { RecentItems } from '@typings/search';

import calculateExpectCountPerHour from '../calculateExpectCountPerHour';

const checkRecentListHasExpectPrice = () => {
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
};

export default checkRecentListHasExpectPrice;
