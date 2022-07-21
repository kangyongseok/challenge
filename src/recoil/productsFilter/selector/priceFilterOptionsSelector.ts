import { selector } from 'recoil';

import { filterCodeIds } from '@constants/productsFilter';

import { productsFilterAtomParamState, searchOptionsStateFamily } from '@recoil/productsFilter';

const priceFilterOptionsSelector = selector({
  key: 'productsFilter/priceFilterOptionsSelector',
  get: ({ get }) => {
    const atomParam = get(productsFilterAtomParamState);
    const {
      searchOptions: {
        minPrice: baseMinPrice = 0,
        minGoodPrice: baseMinGoodPrice = 0,
        maxPrice: baseMaxPrice = 0,
        maxGoodPrice: baseMaxGoodPrice = 0
      }
    } = get(searchOptionsStateFamily(`base-${atomParam}`));
    const {
      searchOptions: { minPrice = 0, minGoodPrice = 0, maxPrice = 0, maxGoodPrice = 0 }
    } = get(searchOptionsStateFamily(`latest-${atomParam}`));

    return {
      codeId: filterCodeIds.price,
      minPrice: minPrice || baseMinPrice,
      minGoodPrice: minGoodPrice || baseMinGoodPrice,
      maxPrice: maxPrice || baseMaxPrice,
      maxGoodPrice: maxGoodPrice || baseMaxGoodPrice
    };
  }
});

export default priceFilterOptionsSelector;
