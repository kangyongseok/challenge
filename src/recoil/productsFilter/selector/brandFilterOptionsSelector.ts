import { selector } from 'recoil';

import { filterCodeIds } from '@constants/productsFilter';

import { parseWordToConsonant } from '@utils/brands';

import {
  productsFilterActionStateFamily,
  productsFilterAtomParamState,
  searchOptionsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

const brandFilterOptionsSelector = selector({
  key: 'productsFilter/brandFilterOptionsSelector',
  get: ({ get }) => {
    const atomParam = get(productsFilterAtomParamState);
    const { filterValue, sortValue } = get(productsFilterActionStateFamily(`brand-${atomParam}`));
    const {
      searchOptions: { brands: baseBrands = [] }
    } = get(searchOptionsStateFamily(`base-${atomParam}`));
    const {
      searchOptions: { brands = [] }
    } = get(searchOptionsStateFamily(`latest-${atomParam}`));
    const { selectedSearchOptions } = get(selectedSearchOptionsStateFamily(`active-${atomParam}`));

    let newBrands = baseBrands.map((baseBrand) => ({
      ...baseBrand,
      codeId: filterCodeIds.brand,
      count: (brands.find((brand) => baseBrand.id === brand.id) || {}).count || 0,
      checked: selectedSearchOptions.some(
        ({ codeId, id }) => codeId === filterCodeIds.brand && id === baseBrand.id
      ),
      consonant: parseWordToConsonant(baseBrand.name)
    }));

    if (filterValue) {
      return newBrands.filter((newBrand) => newBrand.name.indexOf(filterValue) >= 0);
    }

    switch (sortValue) {
      case 'asc':
        newBrands = newBrands.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        newBrands = newBrands.sort((a, b) => b.count - a.count);
        break;
    }

    return newBrands;
  }
});

export default brandFilterOptionsSelector;
