import find from 'lodash-es/find';

import LocalStorage from '@library/localStorage';

import type { RecentItems } from '@typings/search';

const accumulateStorage = (key: string, data: RecentItems) => {
  const originData = (LocalStorage.get(key) as object[]) || [];
  if (find(originData, { keyword: data.keyword })) return;
  originData.unshift(data);
  LocalStorage.set(key, originData);
};

export default accumulateStorage;
